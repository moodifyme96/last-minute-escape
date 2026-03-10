import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Destination Registry ───
const REGISTRY: Record<string, {
  name: string; country: string; region: string; mode: "winter" | "summer";
  hub: string; lat: number; lng: number; altitude?: number;
  costs: any; searchTerms: string[]; safeSeasonFlag?: boolean;
}> = {
  w1:  { name: "Val Thorens", country: "FR", region: "Alps", mode: "winter", hub: "GVA", lat: 45.298, lng: 6.580, altitude: 2300, costs: { accommodationPerNight: 95, activityCostPerDay: 62, clubMedPerNight: 285, clubMedActivityIncluded: true }, searchTerms: ["Val Thorens snow conditions this week"] },
  w2:  { name: "Innsbruck", country: "AT", region: "Alps", mode: "winter", hub: "INN", lat: 47.260, lng: 11.394, altitude: 1800, costs: { accommodationPerNight: 80, activityCostPerDay: 58, clubMedPerNight: 260, clubMedActivityIncluded: true }, searchTerms: ["Innsbruck ski conditions snow report"] },
  w3:  { name: "Chamonix", country: "FR", region: "Alps", mode: "winter", hub: "GVA", lat: 45.924, lng: 6.870, altitude: 2400, costs: { accommodationPerNight: 110, activityCostPerDay: 65, clubMedPerNight: 310, clubMedActivityIncluded: true }, searchTerms: ["Chamonix snow conditions avalanche report"] },
  w4:  { name: "Zermatt", country: "CH", region: "Alps", mode: "winter", hub: "ZRH", lat: 46.020, lng: 7.749, altitude: 2600, costs: { accommodationPerNight: 165, activityCostPerDay: 75, clubMedPerNight: 380, clubMedActivityIncluded: true }, searchTerms: ["Zermatt snow report piste conditions"] },
  w5:  { name: "St. Anton", country: "AT", region: "Alps", mode: "winter", hub: "INN", lat: 47.128, lng: 10.268, altitude: 1800, costs: { accommodationPerNight: 90, activityCostPerDay: 58, clubMedPerNight: 270, clubMedActivityIncluded: true }, searchTerms: ["St Anton am Arlberg snow conditions"] },
  w6:  { name: "Bansko", country: "BG", region: "Balkans", mode: "winter", hub: "SOF", lat: 41.838, lng: 23.489, altitude: 1400, costs: { accommodationPerNight: 35, activityCostPerDay: 30, clubMedPerNight: 155, clubMedActivityIncluded: true }, searchTerms: ["Bansko ski conditions snow report"] },
  w7:  { name: "Livigno", country: "IT", region: "Alps", mode: "winter", hub: "BGY", lat: 46.538, lng: 10.136, altitude: 1800, costs: { accommodationPerNight: 70, activityCostPerDay: 45, clubMedPerNight: 220, clubMedActivityIncluded: true }, searchTerms: ["Livigno snow conditions snowpark"] },
  w8:  { name: "Gudauri", country: "GE", region: "Caucasus", mode: "winter", hub: "TBS", lat: 42.458, lng: 44.470, altitude: 2200, costs: { accommodationPerNight: 40, activityCostPerDay: 18, clubMedPerNight: 0, clubMedActivityIncluded: false }, searchTerms: ["Gudauri snow conditions freeride"] },
  w9:  { name: "Verbier", country: "CH", region: "Alps", mode: "winter", hub: "GVA", lat: 46.096, lng: 7.228, altitude: 2200, costs: { accommodationPerNight: 180, activityCostPerDay: 72, clubMedPerNight: 395, clubMedActivityIncluded: true }, searchTerms: ["Verbier snow conditions Mont Fort"] },
  w10: { name: "Soldeu", country: "AD", region: "Pyrenees", mode: "winter", hub: "TLS", lat: 42.576, lng: 1.668, altitude: 1710, costs: { accommodationPerNight: 65, activityCostPerDay: 48, clubMedPerNight: 235, clubMedActivityIncluded: true }, searchTerms: ["Grandvalira Soldeu snow conditions"] },
  w11: { name: "Tignes", country: "FR", region: "Alps", mode: "winter", hub: "GVA", lat: 45.468, lng: 6.907, altitude: 2100, costs: { accommodationPerNight: 88, activityCostPerDay: 62, clubMedPerNight: 290, clubMedActivityIncluded: true }, searchTerms: ["Tignes snow conditions Espace Killy"] },
  w12: { name: "Kitzbühel", country: "AT", region: "Alps", mode: "winter", hub: "SZG", lat: 47.449, lng: 12.392, altitude: 1600, costs: { accommodationPerNight: 105, activityCostPerDay: 56, clubMedPerNight: 275, clubMedActivityIncluded: true }, searchTerms: ["Kitzbühel snow report ski conditions"] },
  w13: { name: "Borovets", country: "BG", region: "Balkans", mode: "winter", hub: "SOF", lat: 42.265, lng: 23.608, altitude: 1300, costs: { accommodationPerNight: 30, activityCostPerDay: 25, clubMedPerNight: 140, clubMedActivityIncluded: true }, searchTerms: ["Borovets snow conditions Bulgaria ski"] },
  w14: { name: "Cervinia", country: "IT", region: "Alps", mode: "winter", hub: "TRN", lat: 45.934, lng: 7.631, altitude: 2500, costs: { accommodationPerNight: 85, activityCostPerDay: 55, clubMedPerNight: 265, clubMedActivityIncluded: true }, searchTerms: ["Cervinia snow conditions Plateau Rosa"] },
  w15: { name: "Jasná", country: "SK", region: "Carpathians", mode: "winter", hub: "BTS", lat: 48.955, lng: 19.586, altitude: 1900, costs: { accommodationPerNight: 45, activityCostPerDay: 35, clubMedPerNight: 175, clubMedActivityIncluded: true }, searchTerms: ["Jasná Low Tatras snow conditions"] },
  s1:  { name: "Peniche", country: "PT", region: "Atlantic Coast", mode: "summer", hub: "LIS", lat: 39.356, lng: -9.381, costs: { accommodationPerNight: 55, activityCostPerDay: 35, clubMedPerNight: 195, clubMedActivityIncluded: true, carRentalPerDay: 25 }, searchTerms: ["Peniche surf conditions Supertubos"], safeSeasonFlag: true },
  s2:  { name: "Tarifa", country: "ES", region: "Mediterranean", mode: "summer", hub: "AGP", lat: 36.014, lng: -5.604, costs: { accommodationPerNight: 65, activityCostPerDay: 45, clubMedPerNight: 220, clubMedActivityIncluded: true, carRentalPerDay: 30 }, searchTerms: ["Tarifa kitesurf wind conditions"], safeSeasonFlag: true },
  s3:  { name: "Dahab", country: "EG", region: "Red Sea", mode: "summer", hub: "SSH", lat: 28.500, lng: 34.513, costs: { accommodationPerNight: 25, activityCostPerDay: 20, clubMedPerNight: 0, clubMedActivityIncluded: false, carRentalPerDay: 15 }, searchTerms: ["Dahab wind kitesurf diving conditions"], safeSeasonFlag: true },
  s4:  { name: "Essaouira", country: "MA", region: "Atlantic Coast", mode: "summer", hub: "ESS", lat: 31.513, lng: -9.770, costs: { accommodationPerNight: 35, activityCostPerDay: 25, clubMedPerNight: 165, clubMedActivityIncluded: true, carRentalPerDay: 20 }, searchTerms: ["Essaouira wind surf conditions"], safeSeasonFlag: true },
  s5:  { name: "Biarritz", country: "FR", region: "Atlantic Coast", mode: "summer", hub: "BIQ", lat: 43.483, lng: -1.558, costs: { accommodationPerNight: 95, activityCostPerDay: 40, clubMedPerNight: 275, clubMedActivityIncluded: true, carRentalPerDay: 35 }, searchTerms: ["Biarritz surf conditions Grande Plage"], safeSeasonFlag: true },
  s6:  { name: "Ericeira", country: "PT", region: "Atlantic Coast", mode: "summer", hub: "LIS", lat: 38.963, lng: -9.415, costs: { accommodationPerNight: 60, activityCostPerDay: 30, clubMedPerNight: 210, clubMedActivityIncluded: true, carRentalPerDay: 22 }, searchTerms: ["Ericeira surf conditions WSR waves"], safeSeasonFlag: true },
  s7:  { name: "Fuerteventura", country: "ES", region: "Canary Islands", mode: "summer", hub: "FUE", lat: 28.359, lng: -14.053, costs: { accommodationPerNight: 50, activityCostPerDay: 30, clubMedPerNight: 190, clubMedActivityIncluded: true, carRentalPerDay: 20 }, searchTerms: ["Fuerteventura surf wind conditions"], safeSeasonFlag: true },
  s8:  { name: "Zanzibar", country: "TZ", region: "Indian Ocean", mode: "summer", hub: "ZNZ", lat: -6.165, lng: 39.202, costs: { accommodationPerNight: 45, activityCostPerDay: 35, clubMedPerNight: 250, clubMedActivityIncluded: true, carRentalPerDay: 18 }, searchTerms: ["Zanzibar kitesurf conditions Paje beach"], safeSeasonFlag: true },
  s9:  { name: "Hossegor", country: "FR", region: "Atlantic Coast", mode: "summer", hub: "BIQ", lat: 43.664, lng: -1.441, costs: { accommodationPerNight: 80, activityCostPerDay: 35, clubMedPerNight: 260, clubMedActivityIncluded: true, carRentalPerDay: 30 }, searchTerms: ["Hossegor surf conditions La Gravière"], safeSeasonFlag: true },
  s10: { name: "Sagres", country: "PT", region: "Atlantic Coast", mode: "summer", hub: "FAO", lat: 37.009, lng: -8.940, costs: { accommodationPerNight: 50, activityCostPerDay: 28, clubMedPerNight: 185, clubMedActivityIncluded: true, carRentalPerDay: 22 }, searchTerms: ["Sagres surf conditions Algarve"], safeSeasonFlag: true },
  s11: { name: "Taghazout", country: "MA", region: "Atlantic Coast", mode: "summer", hub: "AGA", lat: 30.545, lng: -9.714, costs: { accommodationPerNight: 30, activityCostPerDay: 22, clubMedPerNight: 155, clubMedActivityIncluded: true, carRentalPerDay: 15 }, searchTerms: ["Taghazout surf conditions Anchor Point"], safeSeasonFlag: true },
  s12: { name: "Crete", country: "GR", region: "Mediterranean", mode: "summer", hub: "HER", lat: 35.240, lng: 24.470, costs: { accommodationPerNight: 60, activityCostPerDay: 25, clubMedPerNight: 230, clubMedActivityIncluded: true, carRentalPerDay: 25 }, searchTerms: ["Crete beach conditions weather hiking"], safeSeasonFlag: true },
  s13: { name: "Sardinia", country: "IT", region: "Mediterranean", mode: "summer", hub: "CAG", lat: 39.224, lng: 9.122, costs: { accommodationPerNight: 75, activityCostPerDay: 35, clubMedPerNight: 245, clubMedActivityIncluded: true, carRentalPerDay: 28 }, searchTerms: ["Sardinia windsurf conditions beach"], safeSeasonFlag: true },
  s14: { name: "Lanzarote", country: "ES", region: "Canary Islands", mode: "summer", hub: "ACE", lat: 29.036, lng: -13.630, costs: { accommodationPerNight: 55, activityCostPerDay: 30, clubMedPerNight: 200, clubMedActivityIncluded: true, carRentalPerDay: 20 }, searchTerms: ["Lanzarote surf conditions Famara"], safeSeasonFlag: true },
  s15: { name: "Split", country: "HR", region: "Mediterranean", mode: "summer", hub: "SPU", lat: 43.508, lng: 16.440, costs: { accommodationPerNight: 55, activityCostPerDay: 30, clubMedPerNight: 210, clubMedActivityIncluded: true, carRentalPerDay: 25 }, searchTerms: ["Split Croatia sea conditions summer"], safeSeasonFlag: true },
};

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

// ─── Stormglass (limited: pick top 5 by priority) ───
async function fetchWeatherBatch(dests: { id: string; lat: number; lng: number; mode: string; altitude?: number }[]) {
  const apiKey = Deno.env.get("STORMGLASS_API_KEY");
  if (!apiKey) return {};
  const results: Record<string, any> = {};
  // Limit to 5 calls to stay within free tier
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
          } else { await aiRes.text(); }
        } catch (e) { console.error("AI error:", e); }
      }
      results[d.id] = { vibeScore, summary, sources: sources.slice(0, 3), lastUpdated: new Date().toISOString() };
    } catch (e) { console.error(`Sentiment error for ${d.id}:`, e); }
  }
  return results;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, days } = await req.json() as { mode: "winter" | "summer"; days: number };
    const entries = Object.entries(REGISTRY).filter(([_, v]) => v.mode === mode);

    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const ret = new Date(tomorrow); ret.setDate(ret.getDate() + days - 1);
    const fmtDate = (d: Date) => d.toISOString().split("T")[0];
    const depDate = fmtDate(tomorrow);
    const retDate = fmtDate(ret);

    // ── Spring/Late Season Logic: after Feb 15, prioritize high altitude ──
    const now = new Date();
    const isLateSeason = mode === "winter" && (now.getMonth() > 1 || (now.getMonth() === 1 && now.getDate() > 15));

    // Sort entries for API priority: high altitude first in late season
    const sortedEntries = [...entries];
    if (isLateSeason) {
      sortedEntries.sort((a, b) => (b[1].altitude || 0) - (a[1].altitude || 0));
    }

    // ── Parallel: Flights + Weather + Sentiment ──
    // Deduplicate hubs for flights
    const uniqueHubs = [...new Set(sortedEntries.map(([_, v]) => v.hub))];

    // Get Amadeus token
    const tokenPromise = getAmadeusToken();

    // Weather + Sentiment in parallel (both limited to top 5)
    const weatherDests = sortedEntries.map(([id, v]) => ({ id, lat: v.lat, lng: v.lng, mode: v.mode, altitude: v.altitude }));
    const sentimentDests = sortedEntries.map(([id, v]) => ({ id, name: v.name, mode: v.mode, searchTerms: v.searchTerms }));

    const [token, weatherData, sentimentData] = await Promise.all([
      tokenPromise,
      fetchWeatherBatch(weatherDests),
      fetchSentimentBatch(sentimentDests),
    ]);

    // Flights: search by unique hub (sequential with rate limiting)
    const flightsData: Record<string, any> = {};
    if (token) {
      for (const hub of uniqueHubs) {
        await new Promise(r => setTimeout(r, 120));
        const result = await searchFlight(token, hub, depDate, retDate);
        // Assign same result to all destinations sharing this hub
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
      const fallbackSummer = { waterTempC: 0, swellHeightM: 0, swellPeriodS: 0, windKnots: 0, uvIndex: 0, sunnyDays: 0, rainyDays: 0, safeSeasonFlag: reg.safeSeasonFlag ?? true };
      const fallbackSentiment = { vibeScore: 0, summary: "Data temporarily unavailable.", sources: [], lastUpdated: new Date().toISOString() };

      const conditions = wt
        ? mode === "summer" ? { ...wt, safeSeasonFlag: reg.safeSeasonFlag ?? true } : wt
        : mode === "winter" ? fallbackWinter : fallbackSummer;

      return {
        id, name: reg.name, country: reg.country, region: reg.region, mode: reg.mode,
        flights: fl || fallbackFlights,
        conditions,
        sentiment: st || fallbackSentiment,
        costs: reg.costs,
        _liveFlights: !!fl,
        _liveWeather: !!wt,
        _liveSentiment: !!st,
        _lateSeason: isLateSeason,
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
