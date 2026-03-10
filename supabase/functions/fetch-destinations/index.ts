import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Destination Registry ───
// Coordinates, hubs, search terms are static. Costs will be LLM-enriched.
interface RegistryEntry {
  name: string; country: string; region: string;
  seasons: ("winter" | "summer")[]; // which seasons this destination is relevant for
  hub: string; lat: number; lng: number; altitude?: number;
  searchTerms: string[];
  safeMonths?: number[]; // 1-12, for summer climate guardrail
  defaultCosts: {
    accommodationPerNight: number; activityCostPerDay: number;
    clubMedPerNight: number; clubMedActivityIncluded: boolean;
    carRentalPerDay?: number;
  };
}

const REGISTRY: Record<string, RegistryEntry> = {
  // ─── WINTER DESTINATIONS ───
  w1:  { name: "Val Thorens", country: "FR", region: "Alps", seasons: ["winter"], hub: "GVA", lat: 45.298, lng: 6.580, altitude: 2300, searchTerms: ["Val Thorens snow conditions this week"], defaultCosts: { accommodationPerNight: 95, activityCostPerDay: 72, clubMedPerNight: 285, clubMedActivityIncluded: true } },
  w2:  { name: "Innsbruck (Nordkette)", country: "AT", region: "Alps", seasons: ["winter"], hub: "INN", lat: 47.260, lng: 11.394, altitude: 1800, searchTerms: ["Innsbruck Nordkette ski conditions snow report"], defaultCosts: { accommodationPerNight: 85, activityCostPerDay: 56, clubMedPerNight: 260, clubMedActivityIncluded: true } },
  w3:  { name: "Chamonix", country: "FR", region: "Alps", seasons: ["winter"], hub: "GVA", lat: 45.924, lng: 6.870, altitude: 2400, searchTerms: ["Chamonix snow conditions avalanche report"], defaultCosts: { accommodationPerNight: 115, activityCostPerDay: 68, clubMedPerNight: 310, clubMedActivityIncluded: true } },
  w4:  { name: "Zermatt", country: "CH", region: "Alps", seasons: ["winter"], hub: "ZRH", lat: 46.020, lng: 7.749, altitude: 2600, searchTerms: ["Zermatt snow report piste conditions"], defaultCosts: { accommodationPerNight: 170, activityCostPerDay: 85, clubMedPerNight: 380, clubMedActivityIncluded: true } },
  w5:  { name: "St. Anton", country: "AT", region: "Alps", seasons: ["winter"], hub: "INN", lat: 47.128, lng: 10.268, altitude: 1800, searchTerms: ["St Anton am Arlberg snow conditions"], defaultCosts: { accommodationPerNight: 95, activityCostPerDay: 62, clubMedPerNight: 270, clubMedActivityIncluded: true } },
  w6:  { name: "Bansko", country: "BG", region: "Balkans", seasons: ["winter"], hub: "SOF", lat: 41.838, lng: 23.489, altitude: 1400, searchTerms: ["Bansko ski conditions snow report"], defaultCosts: { accommodationPerNight: 35, activityCostPerDay: 35, clubMedPerNight: 155, clubMedActivityIncluded: true } },
  w7:  { name: "Livigno", country: "IT", region: "Alps", seasons: ["winter"], hub: "BGY", lat: 46.538, lng: 10.136, altitude: 1800, searchTerms: ["Livigno snow conditions snowpark"], defaultCosts: { accommodationPerNight: 75, activityCostPerDay: 48, clubMedPerNight: 220, clubMedActivityIncluded: true } },
  w8:  { name: "Gudauri", country: "GE", region: "Caucasus", seasons: ["winter"], hub: "TBS", lat: 42.458, lng: 44.470, altitude: 2200, searchTerms: ["Gudauri snow conditions freeride"], defaultCosts: { accommodationPerNight: 40, activityCostPerDay: 20, clubMedPerNight: 0, clubMedActivityIncluded: false } },
  w9:  { name: "Verbier", country: "CH", region: "Alps", seasons: ["winter"], hub: "GVA", lat: 46.096, lng: 7.228, altitude: 2200, searchTerms: ["Verbier snow conditions Mont Fort"], defaultCosts: { accommodationPerNight: 185, activityCostPerDay: 78, clubMedPerNight: 395, clubMedActivityIncluded: true } },
  w10: { name: "Grandvalira (Soldeu)", country: "AD", region: "Pyrenees", seasons: ["winter"], hub: "TLS", lat: 42.576, lng: 1.668, altitude: 1710, searchTerms: ["Grandvalira Soldeu Andorra snow conditions ski pass price"], defaultCosts: { accommodationPerNight: 70, activityCostPerDay: 52, clubMedPerNight: 235, clubMedActivityIncluded: true } },
  w11: { name: "Tignes", country: "FR", region: "Alps", seasons: ["winter"], hub: "GVA", lat: 45.468, lng: 6.907, altitude: 2100, searchTerms: ["Tignes snow conditions Espace Killy"], defaultCosts: { accommodationPerNight: 90, activityCostPerDay: 68, clubMedPerNight: 290, clubMedActivityIncluded: true } },
  w12: { name: "Kitzbühel", country: "AT", region: "Alps", seasons: ["winter"], hub: "SZG", lat: 47.449, lng: 12.392, altitude: 1600, searchTerms: ["Kitzbühel snow report ski conditions"], defaultCosts: { accommodationPerNight: 110, activityCostPerDay: 60, clubMedPerNight: 275, clubMedActivityIncluded: true } },
  w13: { name: "Borovets", country: "BG", region: "Balkans", seasons: ["winter"], hub: "SOF", lat: 42.265, lng: 23.608, altitude: 1300, searchTerms: ["Borovets snow conditions Bulgaria ski"], defaultCosts: { accommodationPerNight: 30, activityCostPerDay: 28, clubMedPerNight: 140, clubMedActivityIncluded: true } },
  w14: { name: "Cervinia", country: "IT", region: "Alps", seasons: ["winter"], hub: "TRN", lat: 45.934, lng: 7.631, altitude: 2500, searchTerms: ["Cervinia snow conditions Plateau Rosa"], defaultCosts: { accommodationPerNight: 90, activityCostPerDay: 62, clubMedPerNight: 265, clubMedActivityIncluded: true } },
  w15: { name: "Jasná", country: "SK", region: "Carpathians", seasons: ["winter"], hub: "BTS", lat: 48.955, lng: 19.586, altitude: 1900, searchTerms: ["Jasná Low Tatras snow conditions"], defaultCosts: { accommodationPerNight: 45, activityCostPerDay: 38, clubMedPerNight: 175, clubMedActivityIncluded: true } },
  w16: { name: "Åre", country: "SE", region: "Scandinavia", seasons: ["winter"], hub: "OSD", lat: 63.399, lng: 13.080, altitude: 1274, searchTerms: ["Åre Sweden snow conditions ski"], defaultCosts: { accommodationPerNight: 110, activityCostPerDay: 58, clubMedPerNight: 0, clubMedActivityIncluded: false } },
  w17: { name: "Hintertux", country: "AT", region: "Alps", seasons: ["winter"], hub: "INN", lat: 47.060, lng: 11.660, altitude: 3250, searchTerms: ["Hintertux glacier ski conditions"], defaultCosts: { accommodationPerNight: 100, activityCostPerDay: 58, clubMedPerNight: 0, clubMedActivityIncluded: false } },

  // ─── SUMMER DESTINATIONS ───
  s1:  { name: "Peniche", country: "PT", region: "Atlantic Coast", seasons: ["summer"], hub: "LIS", lat: 39.356, lng: -9.381, searchTerms: ["Peniche surf conditions Supertubos"], safeMonths: [4,5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 55, activityCostPerDay: 35, clubMedPerNight: 195, clubMedActivityIncluded: true, carRentalPerDay: 25 } },
  s2:  { name: "Tarifa", country: "ES", region: "Mediterranean", seasons: ["summer"], hub: "AGP", lat: 36.014, lng: -5.604, searchTerms: ["Tarifa kitesurf wind conditions"], safeMonths: [4,5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 65, activityCostPerDay: 45, clubMedPerNight: 220, clubMedActivityIncluded: true, carRentalPerDay: 30 } },
  s3:  { name: "Dahab", country: "EG", region: "Red Sea", seasons: ["summer"], hub: "SSH", lat: 28.500, lng: 34.513, searchTerms: ["Dahab wind kitesurf diving conditions"], safeMonths: [1,2,3,4,5,6,9,10,11,12], defaultCosts: { accommodationPerNight: 25, activityCostPerDay: 20, clubMedPerNight: 0, clubMedActivityIncluded: false, carRentalPerDay: 15 } },
  s4:  { name: "Essaouira", country: "MA", region: "Atlantic Coast", seasons: ["summer"], hub: "ESS", lat: 31.513, lng: -9.770, searchTerms: ["Essaouira wind surf conditions"], safeMonths: [3,4,5,6,7,8,9,10,11], defaultCosts: { accommodationPerNight: 35, activityCostPerDay: 25, clubMedPerNight: 165, clubMedActivityIncluded: true, carRentalPerDay: 20 } },
  s5:  { name: "Biarritz", country: "FR", region: "Atlantic Coast", seasons: ["summer"], hub: "BIQ", lat: 43.483, lng: -1.558, searchTerms: ["Biarritz surf conditions Grande Plage"], safeMonths: [5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 100, activityCostPerDay: 40, clubMedPerNight: 275, clubMedActivityIncluded: true, carRentalPerDay: 35 } },
  s6:  { name: "Ericeira", country: "PT", region: "Atlantic Coast", seasons: ["summer"], hub: "LIS", lat: 38.963, lng: -9.415, searchTerms: ["Ericeira surf conditions WSR waves"], safeMonths: [4,5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 60, activityCostPerDay: 30, clubMedPerNight: 210, clubMedActivityIncluded: true, carRentalPerDay: 22 } },
  s7:  { name: "Fuerteventura", country: "ES", region: "Canary Islands", seasons: ["summer"], hub: "FUE", lat: 28.359, lng: -14.053, searchTerms: ["Fuerteventura surf wind conditions"], safeMonths: [1,2,3,4,5,6,7,8,9,10,11,12], defaultCosts: { accommodationPerNight: 55, activityCostPerDay: 30, clubMedPerNight: 190, clubMedActivityIncluded: true, carRentalPerDay: 20 } },
  s8:  { name: "Zanzibar", country: "TZ", region: "Indian Ocean", seasons: ["summer"], hub: "ZNZ", lat: -6.165, lng: 39.202, searchTerms: ["Zanzibar kitesurf conditions Paje beach"], safeMonths: [6,7,8,9,10,1,2], defaultCosts: { accommodationPerNight: 45, activityCostPerDay: 35, clubMedPerNight: 250, clubMedActivityIncluded: true, carRentalPerDay: 18 } },
  s9:  { name: "Hossegor", country: "FR", region: "Atlantic Coast", seasons: ["summer"], hub: "BIQ", lat: 43.664, lng: -1.441, searchTerms: ["Hossegor surf conditions La Gravière"], safeMonths: [5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 85, activityCostPerDay: 35, clubMedPerNight: 260, clubMedActivityIncluded: true, carRentalPerDay: 30 } },
  s10: { name: "Sagres", country: "PT", region: "Atlantic Coast", seasons: ["summer"], hub: "FAO", lat: 37.009, lng: -8.940, searchTerms: ["Sagres surf conditions Algarve"], safeMonths: [4,5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 55, activityCostPerDay: 28, clubMedPerNight: 185, clubMedActivityIncluded: true, carRentalPerDay: 22 } },
  s11: { name: "Taghazout", country: "MA", region: "Atlantic Coast", seasons: ["summer"], hub: "AGA", lat: 30.545, lng: -9.714, searchTerms: ["Taghazout surf conditions Anchor Point"], safeMonths: [1,2,3,4,5,9,10,11,12], defaultCosts: { accommodationPerNight: 30, activityCostPerDay: 22, clubMedPerNight: 155, clubMedActivityIncluded: true, carRentalPerDay: 15 } },
  s12: { name: "Crete", country: "GR", region: "Mediterranean", seasons: ["summer"], hub: "HER", lat: 35.240, lng: 24.470, searchTerms: ["Crete beach conditions weather hiking"], safeMonths: [4,5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 65, activityCostPerDay: 25, clubMedPerNight: 230, clubMedActivityIncluded: true, carRentalPerDay: 25 } },
  s13: { name: "Sardinia", country: "IT", region: "Mediterranean", seasons: ["summer"], hub: "CAG", lat: 39.224, lng: 9.122, searchTerms: ["Sardinia windsurf conditions beach"], safeMonths: [5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 80, activityCostPerDay: 35, clubMedPerNight: 245, clubMedActivityIncluded: true, carRentalPerDay: 28 } },
  s14: { name: "Lanzarote", country: "ES", region: "Canary Islands", seasons: ["summer"], hub: "ACE", lat: 29.036, lng: -13.630, searchTerms: ["Lanzarote surf conditions Famara"], safeMonths: [1,2,3,4,5,6,7,8,9,10,11,12], defaultCosts: { accommodationPerNight: 60, activityCostPerDay: 30, clubMedPerNight: 200, clubMedActivityIncluded: true, carRentalPerDay: 20 } },
  s15: { name: "Split", country: "HR", region: "Mediterranean", seasons: ["summer"], hub: "SPU", lat: 43.508, lng: 16.440, searchTerms: ["Split Croatia sea conditions summer"], safeMonths: [5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 60, activityCostPerDay: 30, clubMedPerNight: 210, clubMedActivityIncluded: true, carRentalPerDay: 25 } },
};

// ─── LLM Cost Enrichment ───
async function enrichCostsWithLLM(
  destinations: { id: string; name: string; country: string; mode: string }[]
): Promise<Record<string, any>> {
  const aiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!aiKey) { console.log("No LOVABLE_API_KEY, skipping LLM enrichment"); return {}; }

  const destList = destinations.map(d => `- ${d.name} (${d.country})`).join("\n");
  const isWinter = destinations[0]?.mode === "winter";

  const activityLabel = isWinter ? "daily ski/snowboard pass" : "daily activity cost (surf/kite rental or excursion)";
  const extraField = isWinter ? "" : ', "carRentalPerDay": <number>';

  const prompt = `You are a travel pricing expert. For each destination below, provide ACCURATE current 2025-2026 season pricing in EUR.

Destinations:
${destList}

For each destination provide:
- accommodationPerNight: average mid-range hotel/apartment per night in EUR
- activityCostPerDay: ${activityLabel} in EUR (full day adult rate)
- clubMedPerNight: nearest Club Med all-inclusive per night (0 if none exists nearby)
- clubMedActivityIncluded: true if Club Med includes the activity
${isWinter ? "" : "- carRentalPerDay: economy car rental per day in EUR"}

IMPORTANT: Be accurate. Val Thorens 2025 ski pass is ~€72/day. Zermatt is ~€92/day. Don't guess — use your knowledge of current pricing.`;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a travel pricing expert. Return structured data via tool calls only." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "set_destination_costs",
            description: "Set accurate costs for all destinations",
            parameters: {
              type: "object",
              properties: {
                destinations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", description: "Destination ID like w1, s1" },
                      accommodationPerNight: { type: "number" },
                      activityCostPerDay: { type: "number" },
                      clubMedPerNight: { type: "number" },
                      clubMedActivityIncluded: { type: "boolean" },
                      carRentalPerDay: { type: "number" },
                    },
                    required: ["id", "accommodationPerNight", "activityCostPerDay", "clubMedPerNight", "clubMedActivityIncluded"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["destinations"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "set_destination_costs" } },
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("LLM enrichment error:", res.status, t);
      return {};
    }

    const data = await res.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("LLM returned no tool call");
      return {};
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    const result: Record<string, any> = {};
    for (const d of parsed.destinations || []) {
      result[d.id] = {
        accommodationPerNight: d.accommodationPerNight,
        activityCostPerDay: d.activityCostPerDay,
        clubMedPerNight: d.clubMedPerNight,
        clubMedActivityIncluded: d.clubMedActivityIncluded,
        ...(d.carRentalPerDay ? { carRentalPerDay: d.carRentalPerDay } : {}),
      };
    }
    console.log(`LLM enriched costs for ${Object.keys(result).length} destinations`);
    return result;
  } catch (e) {
    console.error("LLM enrichment failed:", e);
    return {};
  }
}

// ─── Amadeus ───
async function getAmadeusToken(): Promise<string | null> {
  const key = Deno.env.get("AMADEUS_API_KEY");
  const secret = Deno.env.get("AMADEUS_API_SECRET");
  if (!key || !secret) return null;
  try {
    const res = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${key}&client_secret=${secret}`,
    });
    const body = await res.json();
    return body.access_token || null;
  } catch (e) { console.error("Amadeus token error:", e); return null; }
}

async function searchFlight(token: string, hub: string, depDate: string, retDate: string) {
  try {
    const res = await fetch(
      `https://test.api.amadeus.com/v2/shopping/flight-offers?` +
      new URLSearchParams({ originLocationCode: "TLV", destinationLocationCode: hub, departureDate: depDate, returnDate: retDate, adults: "1", nonStop: "false", max: "3", currencyCode: "EUR" }),
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) { await res.text(); return null; }
    const data = await res.json();
    if (!data?.data?.length) return null;
    const offer = data.data[0];
    const outSegs = offer.itineraries?.[0]?.segments || [];
    const retSegs = offer.itineraries?.[1]?.segments || [];
    if (!outSegs[0] || !retSegs[0]) return null;
    const totalPrice = parseFloat(offer.price?.total || "0");
    const outFare = Math.round(totalPrice / 2);
    const retFare = Math.round(totalPrice - outFare);
    const fmtT = (iso: string) => { const d = new Date(iso); return `${String(d.getUTCHours()).padStart(2,"0")}:${String(d.getUTCMinutes()).padStart(2,"0")}`; };
    const tp = offer.travelerPricings?.[0];
    const outBag = tp?.fareDetailsBySegment?.[0]?.includedCheckedBags?.weight > 0;
    const retBag = tp?.fareDetailsBySegment?.[outSegs.length]?.includedCheckedBags?.weight > 0;
    return {
      origin: "TLV" as const, hub,
      outbound: { airline: outSegs[0].carrierCode, departure: fmtT(outSegs[0].departure.at), arrival: fmtT(outSegs[outSegs.length-1].arrival.at), baseFare: outFare, baggageIncluded: !!outBag },
      returnLeg: { airline: retSegs[0].carrierCode, departure: fmtT(retSegs[0].departure.at), arrival: fmtT(retSegs[retSegs.length-1].arrival.at), baseFare: retFare, baggageIncluded: !!retBag },
      baggageFee: outBag && retBag ? 0 : 35, airportTransfer: 50,
    };
  } catch (e) { console.error("Flight search error:", e); return null; }
}

// ─── Stormglass Weather (top 5 to respect rate limits) ───
async function fetchWeatherBatch(dests: { id: string; lat: number; lng: number; mode: string; altitude?: number }[]) {
  const apiKey = Deno.env.get("STORMGLASS_API_KEY");
  if (!apiKey) return {};
  const results: Record<string, any> = {};
  const limited = dests.slice(0, 5);
  for (const d of limited) {
    try {
      const params = d.mode === "winter"
        ? "airTemperature,snowDepth,precipitation"
        : "waterTemperature,swellHeight,swellPeriod,windSpeed,precipitation";
      const end = new Date(); end.setDate(end.getDate() + 3);
      const res = await fetch(
        `https://api.stormglass.io/v2/weather/point?lat=${d.lat}&lng=${d.lng}&params=${params}&start=${new Date().toISOString()}&end=${end.toISOString()}`,
        { headers: { Authorization: apiKey } }
      );
      if (!res.ok) { await res.text(); continue; }
      const data = await res.json();
      if (!data?.hours?.length) continue;
      const hours = data.hours;
      const recent = hours.slice(0, 6);
      const avg = (arr: any[], key: string) => {
        const vals = arr.map(h => { const e = h[key]; if (!e) return null; return e.sg ?? e.noaa ?? e.smhi ?? Object.values(e)[0]; }).filter(v => v != null);
        return vals.length ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : 0;
      };
      if (d.mode === "winter") {
        const tempC = Math.round(avg(recent, "airTemperature"));
        const snowCm = Math.round(avg(recent, "snowDepth") * 100);
        const last48 = hours.slice(0, 48);
        const precip = last48.reduce((s: number, h: any) => s + (h.precipitation?.sg ?? h.precipitation?.noaa ?? 0), 0);
        const fresh = tempC <= 0 ? Math.round(precip * 10) : 0;
        results[d.id] = { snowDepthBase: Math.max(0, snowCm), snowDepthPeak: Math.max(0, Math.round(snowCm * 1.6)), freshSnow48h: fresh, tempC, freezeLevel: tempC < 0 ? Math.max(0, (d.altitude||1800) + Math.round(tempC * 150)) : (d.altitude||1800) + 500, recentStorm: fresh > 10, stormDaysAgo: fresh > 10 ? 0 : undefined, liftStatus: "full", altitude: d.altitude || 1800 };
      } else {
        const forecast7d = hours.slice(0, 168);
        const dailyPrecip: number[] = [];
        for (let i = 0; i < 7; i++) { const dh = forecast7d.slice(i*24,(i+1)*24); dailyPrecip.push(dh.reduce((s:number,h:any) => s+(h.precipitation?.sg??0),0)); }
        const rainy = dailyPrecip.filter(p => p > 2).length;
        const windMs = avg(recent, "windSpeed");
        results[d.id] = { waterTempC: Math.round(avg(recent, "waterTemperature")), swellHeightM: Math.round(avg(recent, "swellHeight")*10)/10, swellPeriodS: Math.round(avg(recent, "swellPeriod")), windKnots: Math.round(windMs * 1.944), uvIndex: 7, sunnyDays: 7-rainy, rainyDays: rainy, safeSeasonFlag: true };
      }
    } catch (e) { console.error(`Weather error for ${d.id}:`, e); }
  }
  return results;
}

// ─── Firecrawl + AI Sentiment (batch top 5) ───
async function fetchSentimentBatch(dests: { id: string; name: string; mode: string; searchTerms: string[] }[]) {
  const fcKey = Deno.env.get("FIRECRAWL_API_KEY");
  const aiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!fcKey) return {};
  const results: Record<string, any> = {};
  const limited = dests.slice(0, 5);
  for (const d of limited) {
    try {
      const query = d.searchTerms[0];
      const res = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: { Authorization: `Bearer ${fcKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query, limit: 3, tbs: "qdr:w" }),
      });
      if (!res.ok) { await res.text(); continue; }
      const data = await res.json();
      const sources: any[] = [];
      const snippets: string[] = [];
      if (data?.data) {
        for (const r of data.data.slice(0, 3)) {
          const domain = new URL(r.url || "https://unknown.com").hostname.replace("www.", "");
          const snippet = r.description?.slice(0, 120) || r.title || "";
          if (snippet) { sources.push({ platform: domain, snippet }); snippets.push(r.description || snippet); }
        }
      }
      let vibeScore = 70;
      let summary = `Conditions at ${d.name} under monitoring.`;
      if (aiKey && snippets.length > 0) {
        try {
          const activity = d.mode === "winter" ? "skiing/snowboarding" : "surfing/kitesurfing";
          const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-lite",
              messages: [
                { role: "system", content: "You are a travel conditions analyst. Return only valid JSON." },
                { role: "user", content: `Analyze snippets about ${d.name} for ${activity}:\n${snippets.map((s,i) => `${i+1}. ${s.slice(0,200)}`).join("\n")}\n\nReturn JSON: {"vibeScore": <0-100>, "summary": "<2 sentences>"}` },
              ],
            }),
          });
          if (aiRes.ok) {
            const aiData = await aiRes.json();
            const content = aiData.choices?.[0]?.message?.content || "";
            const match = content.match(/\{[\s\S]*\}/);
            if (match) {
              const parsed = JSON.parse(match[0]);
              vibeScore = Math.max(0, Math.min(100, parsed.vibeScore || 70));
              summary = parsed.summary || summary;
            }
          }
        } catch (e) { console.error("AI sentiment error:", e); }
      }
      results[d.id] = { vibeScore, summary, sources: sources.slice(0, 3), lastUpdated: new Date().toISOString() };
    } catch (e) { console.error(`Sentiment error for ${d.id}:`, e); }
  }
  return results;
}

// ─── Season-aware filtering ───
function isSeasonSafe(entry: RegistryEntry, mode: "winter" | "summer"): boolean {
  if (!entry.seasons.includes(mode)) return false;
  if (mode === "summer" && entry.safeMonths) {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    return entry.safeMonths.includes(currentMonth);
  }
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, days } = await req.json() as { mode: "winter" | "summer"; days: number };

    // Filter destinations by season + safety
    const entries = Object.entries(REGISTRY).filter(([_, v]) => isSeasonSafe(v, mode));
    if (entries.length === 0) {
      return new Response(JSON.stringify({ success: true, data: [], live: { flights: false, weather: false, sentiment: false }, lateSeason: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const ret = new Date(tomorrow); ret.setDate(ret.getDate() + days - 1);
    const fmtDate = (d: Date) => d.toISOString().split("T")[0];
    const depDate = fmtDate(tomorrow);
    const retDate = fmtDate(ret);

    // Late season logic
    const now = new Date();
    const isLateSeason = mode === "winter" && (now.getMonth() > 1 || (now.getMonth() === 1 && now.getDate() > 15));

    // Sort entries for API priority: high altitude first in late season
    const sortedEntries = [...entries];
    if (isLateSeason) {
      sortedEntries.sort((a, b) => (b[1].altitude || 0) - (a[1].altitude || 0));
    }

    // ── Parallel: Flights + Weather + Sentiment + LLM Costs ──
    const uniqueHubs = [...new Set(sortedEntries.map(([_, v]) => v.hub))];
    const weatherDests = sortedEntries.map(([id, v]) => ({ id, lat: v.lat, lng: v.lng, mode, altitude: v.altitude }));
    const sentimentDests = sortedEntries.map(([id, v]) => ({ id, name: v.name, mode, searchTerms: v.searchTerms }));
    const llmDests = sortedEntries.map(([id, v]) => ({ id, name: v.name, country: v.country, mode }));

    const [token, weatherData, sentimentData, llmCosts] = await Promise.all([
      getAmadeusToken(),
      fetchWeatherBatch(weatherDests),
      fetchSentimentBatch(sentimentDests),
      enrichCostsWithLLM(llmDests),
    ]);

    // Flights: sequential with rate limiting per unique hub
    const flightsData: Record<string, any> = {};
    if (token) {
      for (const hub of uniqueHubs) {
        await new Promise(r => setTimeout(r, 120));
        const result = await searchFlight(token, hub, depDate, retDate);
        for (const [id, v] of sortedEntries) {
          if (v.hub === hub && !flightsData[id]) {
            flightsData[id] = result ? { ...result } : null;
          }
        }
      }
    }

    const liveFlags = {
      flights: !!token && Object.values(flightsData).some(v => v !== null),
      weather: Object.keys(weatherData).length > 0,
      sentiment: Object.keys(sentimentData).length > 0,
    };

    // ── Assemble Destination[] ──
    const destinations = sortedEntries.map(([id, reg]) => {
      const fl = flightsData[id];
      const fallbackFlights = { origin: "TLV" as const, hub: reg.hub, outbound: { airline: "—", departure: "—", arrival: "—", baseFare: 0, baggageIncluded: false }, returnLeg: { airline: "—", departure: "—", arrival: "—", baseFare: 0, baggageIncluded: false }, baggageFee: 35, airportTransfer: 50 };
      const wt = weatherData[id];
      const st = sentimentData[id];
      const fallbackWinter = { snowDepthBase: 0, snowDepthPeak: 0, freshSnow48h: 0, tempC: 0, freezeLevel: 0, recentStorm: false, liftStatus: "full", altitude: reg.altitude || 1800 };
      const safeFlag = mode === "summer" ? isSeasonSafe(reg, "summer") : true;
      const fallbackSummer = { waterTempC: 0, swellHeightM: 0, swellPeriodS: 0, windKnots: 0, uvIndex: 0, sunnyDays: 0, rainyDays: 0, safeSeasonFlag: safeFlag };
      const fallbackSentiment = { vibeScore: 0, summary: "Data temporarily unavailable.", sources: [], lastUpdated: new Date().toISOString() };

      const conditions = wt
        ? mode === "summer" ? { ...wt, safeSeasonFlag: safeFlag } : wt
        : mode === "winter" ? fallbackWinter : fallbackSummer;

      // Use LLM-enriched costs, falling back to registry defaults
      const costs = llmCosts[id] || reg.defaultCosts;

      return {
        id, name: reg.name, country: reg.country, region: reg.region, mode,
        flights: fl || fallbackFlights,
        conditions,
        sentiment: st || fallbackSentiment,
        costs,
        _liveFlights: !!fl,
        _liveWeather: !!wt,
        _liveSentiment: !!st,
        _llmCosts: !!llmCosts[id],
      };
    });

    return new Response(
      JSON.stringify({ success: true, data: destinations, live: liveFlags, lateSeason: isLateSeason }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("fetch-destinations error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
