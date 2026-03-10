import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Static Destination Registry ───
// Contains metadata not available from APIs: coordinates, costs, safe season flags
const REGISTRY: Record<string, {
  name: string; country: string; region: string; mode: "winter" | "summer";
  hub: string; lat: number; lng: number; altitude?: number;
  costs: { accommodationPerNight: number; activityCostPerDay: number; clubMedPerNight: number; clubMedActivityIncluded: boolean; carRentalPerDay?: number };
  searchTerms: string[];
  safeSeasonFlag?: boolean;
}> = {
  // ── Winter ──
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
  // ── Summer ──
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, days } = await req.json() as { mode: "winter" | "summer"; days: number };

    // Filter registry by mode
    const entries = Object.entries(REGISTRY).filter(([_, v]) => v.mode === mode);
    const destIds = entries.map(([id]) => id);

    // Compute departure/return dates (96-hour window: tomorrow + days)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const returnDate = new Date(tomorrow);
    returnDate.setDate(returnDate.getDate() + days - 1);

    const fmtDate = (d: Date) => d.toISOString().split("T")[0];
    const departureDate = fmtDate(tomorrow);
    const returnDateStr = fmtDate(returnDate);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

    // Call all 3 sub-functions in parallel
    const [flightsRes, weatherRes, sentimentRes] = await Promise.allSettled([
      fetch(`${SUPABASE_URL}/functions/v1/fetch-flights`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}` },
        body: JSON.stringify({
          origin: "TLV",
          destinations: entries.map(([id, v]) => ({ id, hub: v.hub })),
          departureDate,
          returnDate: returnDateStr,
          adults: 1,
        }),
      }).then(r => r.json()),

      fetch(`${SUPABASE_URL}/functions/v1/fetch-weather`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}` },
        body: JSON.stringify({
          destinations: entries.map(([id, v]) => ({
            id,
            lat: v.lat,
            lng: v.lng,
            mode: v.mode,
            altitude: v.altitude,
          })),
        }),
      }).then(r => r.json()),

      fetch(`${SUPABASE_URL}/functions/v1/fetch-sentiment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}` },
        body: JSON.stringify({
          destinations: entries.map(([id, v]) => ({
            id,
            name: v.name,
            mode: v.mode,
            searchTerms: v.searchTerms,
          })),
        }),
      }).then(r => r.json()),
    ]);

    const flights = flightsRes.status === "fulfilled" && flightsRes.value?.success ? flightsRes.value.data : {};
    const weather = weatherRes.status === "fulfilled" && weatherRes.value?.success ? weatherRes.value.data : {};
    const sentiment = sentimentRes.status === "fulfilled" && sentimentRes.value?.success ? sentimentRes.value.data : {};

    // Track which data sources were live
    const liveFlags = {
      flights: flightsRes.status === "fulfilled" && flightsRes.value?.success,
      weather: weatherRes.status === "fulfilled" && weatherRes.value?.success,
      sentiment: sentimentRes.status === "fulfilled" && sentimentRes.value?.success,
    };

    // Merge into Destination[] with fallbacks
    const destinations = entries.map(([id, reg]) => {
      // Flight data: use live or generate reasonable fallback
      const liveFlights = flights[id];
      const fallbackFlights = {
        origin: "TLV" as const,
        hub: reg.hub,
        outbound: { airline: "—", departure: "—", arrival: "—", baseFare: 0, baggageIncluded: false },
        returnLeg: { airline: "—", departure: "—", arrival: "—", baseFare: 0, baggageIncluded: false },
        baggageFee: 35,
        airportTransfer: 50,
      };

      // Weather: use live or empty fallback
      const liveWeather = weather[id];
      const fallbackWinter = {
        snowDepthBase: 0, snowDepthPeak: 0, freshSnow48h: 0, tempC: 0,
        freezeLevel: 0, recentStorm: false, liftStatus: "full", altitude: reg.altitude || 1800,
      };
      const fallbackSummer = {
        waterTempC: 0, swellHeightM: 0, swellPeriodS: 0, windKnots: 0,
        uvIndex: 0, sunnyDays: 0, rainyDays: 0, safeSeasonFlag: reg.safeSeasonFlag ?? true,
      };

      // Sentiment: use live or generic fallback
      const liveSentiment = sentiment[id];
      const fallbackSentiment = {
        vibeScore: 0,
        summary: "Data temporarily unavailable.",
        sources: [],
        lastUpdated: new Date().toISOString(),
      };

      // Ensure summer safeSeasonFlag comes from registry (not weather API)
      const conditions = liveWeather
        ? mode === "summer"
          ? { ...liveWeather, safeSeasonFlag: reg.safeSeasonFlag ?? true }
          : liveWeather
        : mode === "winter" ? fallbackWinter : fallbackSummer;

      return {
        id,
        name: reg.name,
        country: reg.country,
        region: reg.region,
        mode: reg.mode,
        flights: liveFlights || fallbackFlights,
        conditions,
        sentiment: liveSentiment || fallbackSentiment,
        costs: reg.costs,
      };
    });

    return new Response(
      JSON.stringify({ success: true, data: destinations, live: liveFlags }),
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
