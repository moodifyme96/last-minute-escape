import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SentimentRequest {
  destinations: {
    id: string;
    name: string;
    mode: "winter" | "summer";
    searchTerms: string[];
  }[];
}

async function searchFirecrawl(query: string) {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY not configured");

  const res = await fetch("https://api.firecrawl.dev/v1/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      limit: 3,
      tbs: "qdr:w", // last week
      scrapeOptions: { formats: ["markdown"] },
    }),
  });

  const body = await res.text();
  if (!res.ok) {
    console.error("Firecrawl search error:", res.status, body);
    return null;
  }
  return JSON.parse(body);
}

async function generateVibeScore(name: string, mode: string, snippets: string[]) {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableKey) {
    console.error("LOVABLE_API_KEY not configured, using default score");
    return null;
  }

  const activity = mode === "winter" ? "skiing/snowboarding" : "surfing/kitesurfing/beach";
  const prompt = `Analyze these recent web snippets about ${name} for ${activity} conditions and generate a JSON vibe assessment.

Snippets:
${snippets.map((s, i) => `${i + 1}. ${s.slice(0, 300)}`).join("\n")}

Respond with ONLY valid JSON:
{"vibeScore": <0-100 integer>, "summary": "<2 sentences summarizing current conditions and traveler sentiment>"}`;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You are a travel conditions analyst. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("AI gateway error:", res.status, t);
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    // Extract JSON from response (might have markdown code fences)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (e) {
    console.error("AI vibe score error:", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { destinations } = (await req.json()) as SentimentRequest;
    const results: Record<string, any> = {};

    for (const dest of destinations) {
      try {
        // Search for conditions using the primary search term
        const query = dest.searchTerms[0] || `${dest.name} ${dest.mode === "winter" ? "snow conditions" : "surf conditions"}`;
        const searchData = await searchFirecrawl(query);

        const sources: { platform: string; snippet: string }[] = [];
        const snippetsForAI: string[] = [];

        if (searchData?.data?.length) {
          for (const result of searchData.data.slice(0, 3)) {
            const domain = new URL(result.url || "https://unknown.com").hostname.replace("www.", "");
            const snippet =
              result.description?.slice(0, 120) ||
              result.markdown?.slice(0, 120) ||
              result.title ||
              "";
            if (snippet) {
              sources.push({ platform: domain, snippet });
              snippetsForAI.push(result.markdown?.slice(0, 500) || result.description || snippet);
            }
          }
        }

        // Generate AI vibe score from scraped content
        let vibeScore = 70;
        let summary = `Current conditions at ${dest.name} are being monitored. Check sources for latest updates.`;

        if (snippetsForAI.length > 0) {
          const aiResult = await generateVibeScore(dest.name, dest.mode, snippetsForAI);
          if (aiResult) {
            vibeScore = Math.max(0, Math.min(100, aiResult.vibeScore || 70));
            summary = aiResult.summary || summary;
          }
        }

        results[dest.id] = {
          vibeScore,
          summary,
          sources: sources.length >= 2 ? sources.slice(0, 3) : sources,
          lastUpdated: new Date().toISOString(),
        };
      } catch (e) {
        console.error(`Sentiment fetch failed for ${dest.id}:`, e);
        results[dest.id] = null;
      }
    }

    return new Response(JSON.stringify({ success: true, data: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-sentiment error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
