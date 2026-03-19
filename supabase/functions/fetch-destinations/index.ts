import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Destination Registry (metadata only — conditions come from DB cache) ───
interface RegistryEntry {
  name: string; country: string; region: string;
  seasons: ("winter" | "summer")[];
  hubs: string[];
  lat: number; lng: number; altitude?: number;
  slopeKm?: number;        // km of pistes (winter) or coastline (summer)
  transferMinutes: number[];
  safeMonths?: number[];
  defaultCosts: {
    accommodationPerNight: number; activityCostPerDay: number;
    clubMedPerNight: number; clubMedActivityIncluded: boolean;
    carRentalPerDay?: number;
  };
}

const REGISTRY: Record<string, RegistryEntry> = {
  w1:  { name: "Val Thorens", country: "FR", region: "Alps", seasons: ["winter"], hubs: ["LYS", "GVA"], lat: 45.298, lng: 6.580, altitude: 2300, slopeKm: 600, transferMinutes: [150, 180], defaultCosts: { accommodationPerNight: 95, activityCostPerDay: 72, clubMedPerNight: 285, clubMedActivityIncluded: true } },
  w2:  { name: "Innsbruck (Nordkette)", country: "AT", region: "Alps", seasons: ["winter"], hubs: ["INN", "MUC"], lat: 47.260, lng: 11.394, altitude: 1800, slopeKm: 22, transferMinutes: [15, 120], defaultCosts: { accommodationPerNight: 85, activityCostPerDay: 56, clubMedPerNight: 260, clubMedActivityIncluded: true } },
  w3:  { name: "Chamonix", country: "FR", region: "Alps", seasons: ["winter"], hubs: ["GVA", "LYS"], lat: 45.924, lng: 6.870, altitude: 2400, slopeKm: 155, transferMinutes: [80, 180], defaultCosts: { accommodationPerNight: 115, activityCostPerDay: 68, clubMedPerNight: 310, clubMedActivityIncluded: true } },
  w4:  { name: "Zermatt", country: "CH", region: "Alps", seasons: ["winter"], hubs: ["ZRH", "GVA"], lat: 46.020, lng: 7.749, altitude: 2600, slopeKm: 360, transferMinutes: [210, 240], defaultCosts: { accommodationPerNight: 170, activityCostPerDay: 85, clubMedPerNight: 380, clubMedActivityIncluded: true } },
  w5:  { name: "St. Anton", country: "AT", region: "Alps", seasons: ["winter"], hubs: ["INN", "ZRH"], lat: 47.128, lng: 10.268, altitude: 1800, slopeKm: 305, transferMinutes: [75, 150], defaultCosts: { accommodationPerNight: 95, activityCostPerDay: 62, clubMedPerNight: 270, clubMedActivityIncluded: true } },
  w6:  { name: "Bansko", country: "BG", region: "Balkans", seasons: ["winter"], hubs: ["SOF"], lat: 41.838, lng: 23.489, altitude: 1400, slopeKm: 48, transferMinutes: [150], defaultCosts: { accommodationPerNight: 35, activityCostPerDay: 35, clubMedPerNight: 155, clubMedActivityIncluded: true } },
  w7:  { name: "Livigno", country: "IT", region: "Alps", seasons: ["winter"], hubs: ["MXP", "INN"], lat: 46.538, lng: 10.136, altitude: 1800, slopeKm: 115, transferMinutes: [210, 180], defaultCosts: { accommodationPerNight: 75, activityCostPerDay: 48, clubMedPerNight: 220, clubMedActivityIncluded: true } },
  w8:  { name: "Gudauri", country: "GE", region: "Caucasus", seasons: ["winter"], hubs: ["TBS"], lat: 42.458, lng: 44.470, altitude: 2200, slopeKm: 75, transferMinutes: [120], defaultCosts: { accommodationPerNight: 40, activityCostPerDay: 20, clubMedPerNight: 0, clubMedActivityIncluded: false } },
  w9:  { name: "Verbier", country: "CH", region: "Alps", seasons: ["winter"], hubs: ["GVA", "ZRH"], lat: 46.096, lng: 7.228, altitude: 2200, slopeKm: 410, transferMinutes: [120, 180], defaultCosts: { accommodationPerNight: 185, activityCostPerDay: 78, clubMedPerNight: 395, clubMedActivityIncluded: true } },
  w10: { name: "Grandvalira (Soldeu)", country: "AD", region: "Pyrenees", seasons: ["winter"], hubs: ["BCN", "TLS"], lat: 42.576, lng: 1.668, altitude: 1710, slopeKm: 210, transferMinutes: [180, 150], defaultCosts: { accommodationPerNight: 70, activityCostPerDay: 52, clubMedPerNight: 235, clubMedActivityIncluded: true } },
  w11: { name: "Tignes", country: "FR", region: "Alps", seasons: ["winter"], hubs: ["LYS", "GVA"], lat: 45.468, lng: 6.907, altitude: 2100, slopeKm: 300, transferMinutes: [150, 180], defaultCosts: { accommodationPerNight: 90, activityCostPerDay: 68, clubMedPerNight: 290, clubMedActivityIncluded: true } },
  w12: { name: "Kitzbühel", country: "AT", region: "Alps", seasons: ["winter"], hubs: ["SZG", "MUC", "INN"], lat: 47.449, lng: 12.392, altitude: 1600, slopeKm: 170, transferMinutes: [80, 120, 100], defaultCosts: { accommodationPerNight: 110, activityCostPerDay: 60, clubMedPerNight: 275, clubMedActivityIncluded: true } },
  w13: { name: "Borovets", country: "BG", region: "Balkans", seasons: ["winter"], hubs: ["SOF"], lat: 42.265, lng: 23.608, altitude: 1300, slopeKm: 58, transferMinutes: [75], defaultCosts: { accommodationPerNight: 30, activityCostPerDay: 28, clubMedPerNight: 140, clubMedActivityIncluded: true } },
  w14: { name: "Cervinia", country: "IT", region: "Alps", seasons: ["winter"], hubs: ["TRN", "MXP"], lat: 45.934, lng: 7.631, altitude: 2500, slopeKm: 360, transferMinutes: [120, 150], defaultCosts: { accommodationPerNight: 90, activityCostPerDay: 62, clubMedPerNight: 265, clubMedActivityIncluded: true } },
  w15: { name: "Jasná", country: "SK", region: "Carpathians", seasons: ["winter"], hubs: ["VIE", "BUD"], lat: 48.955, lng: 19.586, altitude: 1900, slopeKm: 50, transferMinutes: [240, 210], defaultCosts: { accommodationPerNight: 45, activityCostPerDay: 38, clubMedPerNight: 175, clubMedActivityIncluded: true } },
  w16: { name: "Åre", country: "SE", region: "Scandinavia", seasons: ["winter"], hubs: ["ARN", "OSL"], lat: 63.399, lng: 13.080, altitude: 1274, slopeKm: 100, transferMinutes: [360, 420], defaultCosts: { accommodationPerNight: 110, activityCostPerDay: 58, clubMedPerNight: 0, clubMedActivityIncluded: false } },
  w17: { name: "Hintertux", country: "AT", region: "Alps", seasons: ["winter"], hubs: ["INN", "MUC"], lat: 47.060, lng: 11.660, altitude: 3250, slopeKm: 60, transferMinutes: [90, 150], defaultCosts: { accommodationPerNight: 100, activityCostPerDay: 58, clubMedPerNight: 0, clubMedActivityIncluded: false } },
  s1:  { name: "Peniche", country: "PT", region: "Atlantic Coast", seasons: ["summer"], hubs: ["LIS"], lat: 39.356, lng: -9.381, transferMinutes: [75], safeMonths: [4,5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 55, activityCostPerDay: 35, clubMedPerNight: 195, clubMedActivityIncluded: true, carRentalPerDay: 25 } },
  s2:  { name: "Tarifa", country: "ES", region: "Mediterranean", seasons: ["summer"], hubs: ["AGP", "SVQ"], lat: 36.014, lng: -5.604, transferMinutes: [120, 150], safeMonths: [4,5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 65, activityCostPerDay: 45, clubMedPerNight: 220, clubMedActivityIncluded: true, carRentalPerDay: 30 } },
  s3:  { name: "Dahab", country: "EG", region: "Red Sea", seasons: ["summer"], hubs: ["SSH"], lat: 28.500, lng: 34.513, transferMinutes: [60], safeMonths: [1,2,3,4,5,6,9,10,11,12], defaultCosts: { accommodationPerNight: 25, activityCostPerDay: 20, clubMedPerNight: 0, clubMedActivityIncluded: false, carRentalPerDay: 15 } },
  s4:  { name: "Essaouira", country: "MA", region: "Atlantic Coast", seasons: ["summer"], hubs: ["ESS", "RAK"], lat: 31.513, lng: -9.770, transferMinutes: [15, 150], safeMonths: [3,4,5,6,7,8,9,10,11], defaultCosts: { accommodationPerNight: 35, activityCostPerDay: 25, clubMedPerNight: 165, clubMedActivityIncluded: true, carRentalPerDay: 20 } },
  s5:  { name: "Biarritz", country: "FR", region: "Atlantic Coast", seasons: ["summer"], hubs: ["BIQ", "BOD"], lat: 43.483, lng: -1.558, transferMinutes: [5, 120], safeMonths: [5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 100, activityCostPerDay: 40, clubMedPerNight: 275, clubMedActivityIncluded: true, carRentalPerDay: 35 } },
  s6:  { name: "Ericeira", country: "PT", region: "Atlantic Coast", seasons: ["summer"], hubs: ["LIS"], lat: 38.963, lng: -9.415, transferMinutes: [50], safeMonths: [4,5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 60, activityCostPerDay: 30, clubMedPerNight: 210, clubMedActivityIncluded: true, carRentalPerDay: 22 } },
  s7:  { name: "Fuerteventura", country: "ES", region: "Canary Islands", seasons: ["summer"], hubs: ["FUE"], lat: 28.359, lng: -14.053, transferMinutes: [20], safeMonths: [1,2,3,4,5,6,7,8,9,10,11,12], defaultCosts: { accommodationPerNight: 55, activityCostPerDay: 30, clubMedPerNight: 190, clubMedActivityIncluded: true, carRentalPerDay: 20 } },
  s8:  { name: "Zanzibar", country: "TZ", region: "Indian Ocean", seasons: ["summer"], hubs: ["ZNZ", "DAR"], lat: -6.165, lng: 39.202, transferMinutes: [20, 90], safeMonths: [6,7,8,9,10,1,2], defaultCosts: { accommodationPerNight: 45, activityCostPerDay: 35, clubMedPerNight: 250, clubMedActivityIncluded: true, carRentalPerDay: 18 } },
  s9:  { name: "Hossegor", country: "FR", region: "Atlantic Coast", seasons: ["summer"], hubs: ["BIQ", "BOD"], lat: 43.664, lng: -1.441, transferMinutes: [25, 120], safeMonths: [5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 85, activityCostPerDay: 35, clubMedPerNight: 260, clubMedActivityIncluded: true, carRentalPerDay: 30 } },
  s10: { name: "Sagres", country: "PT", region: "Atlantic Coast", seasons: ["summer"], hubs: ["FAO"], lat: 37.009, lng: -8.940, transferMinutes: [75], safeMonths: [4,5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 55, activityCostPerDay: 28, clubMedPerNight: 185, clubMedActivityIncluded: true, carRentalPerDay: 22 } },
  s11: { name: "Taghazout", country: "MA", region: "Atlantic Coast", seasons: ["summer"], hubs: ["AGA"], lat: 30.545, lng: -9.714, transferMinutes: [30], safeMonths: [1,2,3,4,5,9,10,11,12], defaultCosts: { accommodationPerNight: 30, activityCostPerDay: 22, clubMedPerNight: 155, clubMedActivityIncluded: true, carRentalPerDay: 15 } },
  s12: { name: "Crete", country: "GR", region: "Mediterranean", seasons: ["summer"], hubs: ["HER"], lat: 35.240, lng: 24.470, transferMinutes: [30], safeMonths: [4,5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 65, activityCostPerDay: 25, clubMedPerNight: 230, clubMedActivityIncluded: true, carRentalPerDay: 25 } },
  s13: { name: "Sardinia", country: "IT", region: "Mediterranean", seasons: ["summer"], hubs: ["CAG", "OLB"], lat: 39.224, lng: 9.122, transferMinutes: [30, 45], safeMonths: [5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 80, activityCostPerDay: 35, clubMedPerNight: 245, clubMedActivityIncluded: true, carRentalPerDay: 28 } },
  s14: { name: "Lanzarote", country: "ES", region: "Canary Islands", seasons: ["summer"], hubs: ["ACE"], lat: 29.036, lng: -13.630, transferMinutes: [15], safeMonths: [1,2,3,4,5,6,7,8,9,10,11,12], defaultCosts: { accommodationPerNight: 60, activityCostPerDay: 30, clubMedPerNight: 200, clubMedActivityIncluded: true, carRentalPerDay: 20 } },
  s15: { name: "Split", country: "HR", region: "Mediterranean", seasons: ["summer"], hubs: ["SPU", "ZAG"], lat: 43.508, lng: 16.440, transferMinutes: [20, 240], safeMonths: [5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 60, activityCostPerDay: 30, clubMedPerNight: 210, clubMedActivityIncluded: true, carRentalPerDay: 25 } },
};

// ─── Effective Activity Days ───
function calcEffectiveActivityDays(totalDays: number, outboundArrivalHour: number, returnDepartureHour: number, transferMinutes: number): number {
  const transferHours = transferMinutes / 60;
  const arrivalAtResort = outboundArrivalHour + transferHours;
  let arrivalDayValue = 0;
  if (arrivalAtResort <= 10) arrivalDayValue = 1;
  else if (arrivalAtResort <= 14) arrivalDayValue = 0.5;
  const leaveResortHour = returnDepartureHour - transferHours - 2;
  let departureDayValue = 0;
  if (leaveResortHour >= 16) departureDayValue = 1;
  else if (leaveResortHour >= 14) departureDayValue = 0.5;
  const middleDays = Math.max(0, totalDays - 2);
  return Math.round(middleDays + arrivalDayValue + departureDayValue);
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
      new URLSearchParams({
        originLocationCode: "TLV", destinationLocationCode: hub,
        departureDate: depDate, returnDate: retDate,
        adults: "1", nonStop: "false", max: "3", currencyCode: "EUR",
      }),
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
    const fmtT = (iso: string) => { const d = new Date(iso); return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`; };
    const getHour = (iso: string) => new Date(iso).getUTCHours();
    const tp = offer.travelerPricings?.[0];
    const outBag = tp?.fareDetailsBySegment?.[0]?.includedCheckedBags?.weight > 0;
    const retBag = tp?.fareDetailsBySegment?.[outSegs.length]?.includedCheckedBags?.weight > 0;
    return {
      origin: "TLV" as const, hub,
      outbound: { airline: outSegs[0].carrierCode, departure: fmtT(outSegs[0].departure.at), arrival: fmtT(outSegs[outSegs.length - 1].arrival.at), baseFare: outFare, baggageIncluded: !!outBag },
      returnLeg: { airline: retSegs[0].carrierCode, departure: fmtT(retSegs[0].departure.at), arrival: fmtT(retSegs[retSegs.length - 1].arrival.at), baseFare: retFare, baggageIncluded: !!retBag },
      baggageFee: outBag && retBag ? 0 : 35, airportTransfer: 50,
      _arrivalHour: getHour(outSegs[outSegs.length - 1].arrival.at),
      _departureHour: getHour(retSegs[0].departure.at),
    };
  } catch (e) { console.error("Flight search error:", e); return null; }
}

// ─── Season-aware filtering ───
function isSeasonSafe(entry: RegistryEntry, mode: "winter" | "summer"): boolean {
  if (!entry.seasons.includes(mode)) return false;
  if (mode === "summer" && entry.safeMonths) {
    const currentMonth = new Date().getMonth() + 1;
    return entry.safeMonths.includes(currentMonth);
  }
  return true;
}

// ─── Smart ranking based on REAL cached conditions ───
function rankByConditions(
  cachedRows: any[],
  registryEntries: [string, RegistryEntry][],
  mode: "winter" | "summer",
  isLateSeason: boolean
): string[] {
  const scored = registryEntries.map(([id, reg]) => {
    const cached = cachedRows.find((r: any) => r.id === id);
    const conditions = cached?.conditions || {};
    const costs = cached?.costs || reg.defaultCosts;
    const sentiment = cached?.sentiment || {};
    const dailyCost = (costs.accommodationPerNight || 0) + (costs.activityCostPerDay || 0);

    let qualityScore = 0;

    if (mode === "winter") {
      // Snow quality (0-50 points)
      const freshSnow = conditions.freshSnow48h || 0;
      const baseDepth = conditions.snowDepthBase || 0;
      const peakDepth = conditions.snowDepthPeak || 0;
      qualityScore += Math.min(freshSnow * 2, 30); // up to 30pts for fresh snow
      qualityScore += Math.min(baseDepth / 10, 10); // up to 10pts for base depth
      qualityScore += Math.min(peakDepth / 20, 10); // up to 10pts for peak depth

      // Lift status penalty
      if (conditions.liftStatus === "closed") qualityScore -= 50;
      else if (conditions.liftStatus === "partial") qualityScore -= 10;

      // Late season: altitude bonus
      if (isLateSeason) {
        const alt = reg.altitude || 0;
        qualityScore += Math.min(alt / 100, 25); // up to 25pts for altitude
      }
    } else {
      // Summer quality
      const swell = conditions.swellHeightM || 0;
      const wind = conditions.windKnots || 0;
      const waterTemp = conditions.waterTempC || 0;
      qualityScore += Math.min(swell * 10, 20);
      qualityScore += Math.min(wind / 2, 15);
      qualityScore += Math.min(waterTemp / 2, 15);
    }

    // Value score (cheaper = higher score, 0-20 points)
    const valueScore = Math.max(0, 20 - (dailyCost / 15));

    // Vibe score contribution (0-10 points)
    const vibeBonus = ((sentiment.vibeScore || 0) / 100) * 10;

    // Data confidence penalty
    const confidence = cached?.data_confidence || "low";
    const confPenalty = confidence === "high" ? 0 : confidence === "medium" ? -5 : -15;

    const total = qualityScore + valueScore + vibeBonus + confPenalty;

    return { id, score: total };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.id);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, days, departureDate: reqDepDate, offset = 0, limit = 4, filters } = await req.json() as {
      mode: "winter" | "summer"; days: number; departureDate?: string;
      offset?: number; limit?: number;
      filters?: { altitudeRange?: [number, number]; countries?: string[]; regions?: string[]; slopeRange?: [number, number] };
    };

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let entries = Object.entries(REGISTRY).filter(([_, v]) => isSeasonSafe(v, mode));

    // Apply user filters
    if (filters) {
      if (filters.countries && filters.countries.length > 0) {
        entries = entries.filter(([_, v]) => filters.countries!.includes(v.country));
      }
      if (filters.regions && filters.regions.length > 0) {
        entries = entries.filter(([_, v]) => filters.regions!.includes(v.region));
      }
      if (filters.altitudeRange && mode === "winter") {
        const [minAlt, maxAlt] = filters.altitudeRange;
        entries = entries.filter(([_, v]) => {
          const alt = v.altitude || 0;
          return alt >= minAlt && alt <= maxAlt;
        });
      }
    }

    if (entries.length === 0) {
      return new Response(JSON.stringify({ success: true, data: [], totalAvailable: 0, live: { flights: false, weather: false, sentiment: false }, lateSeason: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Departure date validation
    const now = new Date();
    let depDateObj: Date;
    if (reqDepDate) {
      depDateObj = new Date(reqDepDate + "T00:00:00Z");
      const maxDate = new Date(now); maxDate.setDate(maxDate.getDate() + 4);
      if (depDateObj < now || depDateObj > maxDate) {
        depDateObj = new Date(now); depDateObj.setDate(depDateObj.getDate() + 1);
      }
    } else {
      depDateObj = new Date(now); depDateObj.setDate(depDateObj.getDate() + 1);
    }
    const retDateObj = new Date(depDateObj); retDateObj.setDate(retDateObj.getDate() + days - 1);
    const fmtDate = (d: Date) => d.toISOString().split("T")[0];
    const depDate = fmtDate(depDateObj);
    const retDate = fmtDate(retDateObj);

    const isLateSeason = mode === "winter" && (now.getMonth() > 1 || (now.getMonth() === 1 && now.getDate() > 15));

    // ── Phase 1: Read cached conditions from DB ──
    const candidateIds = entries.map(([id]) => id);
    const { data: cachedRows, error: cacheError } = await supabase
      .from("destination_conditions")
      .select("*")
      .in("id", candidateIds);

    if (cacheError) console.error("Cache read error:", cacheError);

    const hasCachedData = (cachedRows?.length || 0) > 0;
    const cacheAge = cachedRows?.[0]?.synced_at
      ? (Date.now() - new Date(cachedRows[0].synced_at).getTime()) / (1000 * 60 * 60)
      : Infinity;

    console.log(`Cache: ${cachedRows?.length || 0}/${candidateIds.length} destinations, age: ${cacheAge.toFixed(1)}h`);

    // ── Phase 2: Rank based on REAL cached conditions ──
    let rankedIds: string[];
    if (hasCachedData) {
      rankedIds = rankByConditions(cachedRows!, entries, mode, isLateSeason);
      console.log(`Ranked by real conditions: ${rankedIds.slice(0, 4).join(", ")}`);
    } else {
      // No cache yet — use simple altitude/cost heuristic
      rankedIds = entries
        .sort(([, a], [, b]) => {
          if (mode === "winter") return (b.altitude || 0) - (a.altitude || 0);
          return (a.defaultCosts.accommodationPerNight + a.defaultCosts.activityCostPerDay) -
                 (b.defaultCosts.accommodationPerNight + b.defaultCosts.activityCostPerDay);
        })
        .map(([id]) => id);
      console.log("No cache — using heuristic ranking");
    }

    const totalAvailable = rankedIds.length;

    // Slice for this page
    const sliceIds = rankedIds.slice(offset, offset + limit);
    if (sliceIds.length === 0) {
      return new Response(JSON.stringify({ success: true, data: [], totalAvailable, live: { flights: false, weather: false, sentiment: false }, lateSeason: isLateSeason }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const sliceEntries = sliceIds.map(id => [id, REGISTRY[id]] as [string, RegistryEntry]);

    // ── Phase 3: Fetch ONLY flights live (fast — ~3-5s) ──
    const allHubs = new Set<string>();
    for (const [_, reg] of sliceEntries) {
      for (const hub of reg.hubs) allHubs.add(hub);
    }

    const token = await getAmadeusToken();
    const flightsData: Record<string, any> = {};

    if (token) {
      const hubList = [...allHubs];
      const results = await Promise.all(hubList.map(hub => searchFlight(token, hub, depDate, retDate)));
      const hubResults = new Map<string, any>();
      hubList.forEach((hub, i) => hubResults.set(hub, results[i]));

      for (const [id, reg] of sliceEntries) {
        let bestOption: any = null;
        let bestTotalCost = Infinity;
        for (let i = 0; i < reg.hubs.length; i++) {
          const hub = reg.hubs[i];
          const result = hubResults.get(hub);
          if (!result) continue;
          const transferMin = reg.transferMinutes[i] || 120;
          const transferCost = Math.round(transferMin <= 60 ? 30 : transferMin <= 120 ? 50 : transferMin <= 180 ? 70 : 90);
          const flightCost = result.outbound.baseFare + result.returnLeg.baseFare;
          const totalCost = flightCost + (transferCost * 2);
          if (totalCost < bestTotalCost) { bestTotalCost = totalCost; bestOption = { ...result, hub, airportTransfer: transferCost }; }
        }
        if (bestOption) flightsData[id] = bestOption;
      }
    }

    const liveFlags = {
      flights: !!token && Object.values(flightsData).some(v => v !== null),
      weather: hasCachedData,
      sentiment: hasCachedData,
    };

    // ── Assemble Destination[] ──
    const destinations = sliceEntries.map(([id, reg]) => {
      const fl = flightsData[id];
      const cached = cachedRows?.find((r: any) => r.id === id);

      const fallbackFlights = {
        origin: "TLV" as const, hub: reg.hubs[0],
        outbound: { airline: "—", departure: "—", arrival: "—", baseFare: 0, baggageIncluded: false },
        returnLeg: { airline: "—", departure: "—", arrival: "—", baseFare: 0, baggageIncluded: false },
        baggageFee: 35, airportTransfer: 50,
      };

      const safeFlag = mode === "summer" ? isSeasonSafe(reg, "summer") : true;

      let conditions: any;
      if (cached?.conditions && Object.keys(cached.conditions).length > 0) {
        if (mode === "winter") {
          conditions = { ...cached.conditions, altitude: reg.altitude || 1800, stormDaysAgo: cached.conditions.recentStorm ? 0 : undefined };
        } else {
          conditions = { ...cached.conditions, safeSeasonFlag: safeFlag };
        }
      } else {
        conditions = mode === "winter"
          ? { snowDepthBase: 0, snowDepthPeak: 0, freshSnow48h: 0, tempC: 0, freezeLevel: 0, recentStorm: false, liftStatus: "full", altitude: reg.altitude || 1800, dataConfidence: "low" }
          : { waterTempC: 0, swellHeightM: 0, swellPeriodS: 0, windKnots: 0, uvIndex: 0, sunnyDays: 0, rainyDays: 0, safeSeasonFlag: safeFlag, dataConfidence: "low" };
      }

      const costs = (cached?.costs && Object.keys(cached.costs).length > 0) ? cached.costs : reg.defaultCosts;
      const sentiment = (cached?.sentiment && Object.keys(cached.sentiment).length > 0)
        ? cached.sentiment
        : { vibeScore: 0, summary: "Data temporarily unavailable.", sources: [], lastUpdated: new Date().toISOString() };

      let effectiveDays = days;
      if (fl?._arrivalHour != null && fl?._departureHour != null) {
        const hubIdx = reg.hubs.indexOf(fl.hub);
        const transferMin = hubIdx >= 0 ? reg.transferMinutes[hubIdx] : reg.transferMinutes[0] || 60;
        effectiveDays = calcEffectiveActivityDays(days, fl._arrivalHour, fl._departureHour, transferMin);
      }

      const flights = fl
        ? { origin: fl.origin, hub: fl.hub, outbound: fl.outbound, returnLeg: fl.returnLeg, baggageFee: fl.baggageFee, airportTransfer: fl.airportTransfer }
        : fallbackFlights;

      return {
        id, name: reg.name, country: reg.country, region: reg.region, mode,
        slopeKm: reg.slopeKm,
        flights, conditions, sentiment, costs, effectiveDays,
        _liveFlights: !!fl, _liveWeather: !!cached?.conditions, _liveSentiment: !!cached?.sentiment,
        _llmCosts: !!(cached?.costs && Object.keys(cached.costs).length > 0),
        _conditionSources: cached?.condition_sources || [],
        _pricingSources: cached?.pricing_sources || [],
        _cacheAge: cacheAge < Infinity ? `${cacheAge.toFixed(1)}h` : undefined,
      };
    });

    return new Response(
      JSON.stringify({ success: true, data: destinations, totalAvailable, live: liveFlags, lateSeason: isLateSeason }),
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
