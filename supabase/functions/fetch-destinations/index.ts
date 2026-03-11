import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Destination Registry ───
interface RegistryEntry {
  name: string; country: string; region: string;
  seasons: ("winter" | "summer")[];
  hubs: string[]; // multiple airport options, ordered by preference (biggest/cheapest first)
  lat: number; lng: number; altitude?: number;
  transferMinutes: number[]; // parallel to hubs — minutes from airport to resort
  searchTerms: string[];
  safeMonths?: number[];
  defaultCosts: {
    accommodationPerNight: number; activityCostPerDay: number;
    clubMedPerNight: number; clubMedActivityIncluded: boolean;
    carRentalPerDay?: number;
  };
}

const REGISTRY: Record<string, RegistryEntry> = {
  // ─── WINTER ───
  w1:  { name: "Val Thorens", country: "FR", region: "Alps", seasons: ["winter"], hubs: ["LYS", "GVA"], lat: 45.298, lng: 6.580, altitude: 2300, transferMinutes: [150, 180], searchTerms: ["Val Thorens snow conditions snow report this week"], defaultCosts: { accommodationPerNight: 95, activityCostPerDay: 72, clubMedPerNight: 285, clubMedActivityIncluded: true } },
  w2:  { name: "Innsbruck (Nordkette)", country: "AT", region: "Alps", seasons: ["winter"], hubs: ["INN", "MUC"], lat: 47.260, lng: 11.394, altitude: 1800, transferMinutes: [15, 120], searchTerms: ["Innsbruck Nordkette ski conditions snow report"], defaultCosts: { accommodationPerNight: 85, activityCostPerDay: 56, clubMedPerNight: 260, clubMedActivityIncluded: true } },
  w3:  { name: "Chamonix", country: "FR", region: "Alps", seasons: ["winter"], hubs: ["GVA", "LYS"], lat: 45.924, lng: 6.870, altitude: 2400, transferMinutes: [80, 180], searchTerms: ["Chamonix snow conditions avalanche report"], defaultCosts: { accommodationPerNight: 115, activityCostPerDay: 68, clubMedPerNight: 310, clubMedActivityIncluded: true } },
  w4:  { name: "Zermatt", country: "CH", region: "Alps", seasons: ["winter"], hubs: ["ZRH", "GVA"], lat: 46.020, lng: 7.749, altitude: 2600, transferMinutes: [210, 240], searchTerms: ["Zermatt snow report piste conditions"], defaultCosts: { accommodationPerNight: 170, activityCostPerDay: 85, clubMedPerNight: 380, clubMedActivityIncluded: true } },
  w5:  { name: "St. Anton", country: "AT", region: "Alps", seasons: ["winter"], hubs: ["INN", "ZRH"], lat: 47.128, lng: 10.268, altitude: 1800, transferMinutes: [75, 150], searchTerms: ["St Anton am Arlberg snow conditions"], defaultCosts: { accommodationPerNight: 95, activityCostPerDay: 62, clubMedPerNight: 270, clubMedActivityIncluded: true } },
  w6:  { name: "Bansko", country: "BG", region: "Balkans", seasons: ["winter"], hubs: ["SOF"], lat: 41.838, lng: 23.489, altitude: 1400, transferMinutes: [150], searchTerms: ["Bansko ski conditions snow report"], defaultCosts: { accommodationPerNight: 35, activityCostPerDay: 35, clubMedPerNight: 155, clubMedActivityIncluded: true } },
  w7:  { name: "Livigno", country: "IT", region: "Alps", seasons: ["winter"], hubs: ["MXP", "INN"], lat: 46.538, lng: 10.136, altitude: 1800, transferMinutes: [210, 180], searchTerms: ["Livigno snow conditions snowpark"], defaultCosts: { accommodationPerNight: 75, activityCostPerDay: 48, clubMedPerNight: 220, clubMedActivityIncluded: true } },
  w8:  { name: "Gudauri", country: "GE", region: "Caucasus", seasons: ["winter"], hubs: ["TBS"], lat: 42.458, lng: 44.470, altitude: 2200, transferMinutes: [120], searchTerms: ["Gudauri snow conditions freeride report"], defaultCosts: { accommodationPerNight: 40, activityCostPerDay: 20, clubMedPerNight: 0, clubMedActivityIncluded: false } },
  w9:  { name: "Verbier", country: "CH", region: "Alps", seasons: ["winter"], hubs: ["GVA", "ZRH"], lat: 46.096, lng: 7.228, altitude: 2200, transferMinutes: [120, 180], searchTerms: ["Verbier snow conditions Mont Fort"], defaultCosts: { accommodationPerNight: 185, activityCostPerDay: 78, clubMedPerNight: 395, clubMedActivityIncluded: true } },
  w10: { name: "Grandvalira (Soldeu)", country: "AD", region: "Pyrenees", seasons: ["winter"], hubs: ["BCN", "TLS"], lat: 42.576, lng: 1.668, altitude: 1710, transferMinutes: [180, 150], searchTerms: ["Grandvalira Soldeu Andorra snow conditions ski"], defaultCosts: { accommodationPerNight: 70, activityCostPerDay: 52, clubMedPerNight: 235, clubMedActivityIncluded: true } },
  w11: { name: "Tignes", country: "FR", region: "Alps", seasons: ["winter"], hubs: ["LYS", "GVA"], lat: 45.468, lng: 6.907, altitude: 2100, transferMinutes: [150, 180], searchTerms: ["Tignes snow conditions Espace Killy"], defaultCosts: { accommodationPerNight: 90, activityCostPerDay: 68, clubMedPerNight: 290, clubMedActivityIncluded: true } },
  w12: { name: "Kitzbühel", country: "AT", region: "Alps", seasons: ["winter"], hubs: ["SZG", "MUC", "INN"], lat: 47.449, lng: 12.392, altitude: 1600, transferMinutes: [80, 120, 100], searchTerms: ["Kitzbühel snow report ski conditions"], defaultCosts: { accommodationPerNight: 110, activityCostPerDay: 60, clubMedPerNight: 275, clubMedActivityIncluded: true } },
  w13: { name: "Borovets", country: "BG", region: "Balkans", seasons: ["winter"], hubs: ["SOF"], lat: 42.265, lng: 23.608, altitude: 1300, transferMinutes: [75], searchTerms: ["Borovets snow conditions Bulgaria ski"], defaultCosts: { accommodationPerNight: 30, activityCostPerDay: 28, clubMedPerNight: 140, clubMedActivityIncluded: true } },
  w14: { name: "Cervinia", country: "IT", region: "Alps", seasons: ["winter"], hubs: ["TRN", "MXP"], lat: 45.934, lng: 7.631, altitude: 2500, transferMinutes: [120, 150], searchTerms: ["Cervinia snow conditions Plateau Rosa"], defaultCosts: { accommodationPerNight: 90, activityCostPerDay: 62, clubMedPerNight: 265, clubMedActivityIncluded: true } },
  w15: { name: "Jasná", country: "SK", region: "Carpathians", seasons: ["winter"], hubs: ["VIE", "BUD"], lat: 48.955, lng: 19.586, altitude: 1900, transferMinutes: [240, 210], searchTerms: ["Jasná Low Tatras snow conditions ski"], defaultCosts: { accommodationPerNight: 45, activityCostPerDay: 38, clubMedPerNight: 175, clubMedActivityIncluded: true } },
  w16: { name: "Åre", country: "SE", region: "Scandinavia", seasons: ["winter"], hubs: ["ARN", "OSL"], lat: 63.399, lng: 13.080, altitude: 1274, transferMinutes: [360, 420], searchTerms: ["Åre Sweden snow conditions ski report"], defaultCosts: { accommodationPerNight: 110, activityCostPerDay: 58, clubMedPerNight: 0, clubMedActivityIncluded: false } },
  w17: { name: "Hintertux", country: "AT", region: "Alps", seasons: ["winter"], hubs: ["INN", "MUC"], lat: 47.060, lng: 11.660, altitude: 3250, transferMinutes: [90, 150], searchTerms: ["Hintertux glacier ski conditions snow"], defaultCosts: { accommodationPerNight: 100, activityCostPerDay: 58, clubMedPerNight: 0, clubMedActivityIncluded: false } },

  // ─── SUMMER ───
  s1:  { name: "Peniche", country: "PT", region: "Atlantic Coast", seasons: ["summer"], hubs: ["LIS"], lat: 39.356, lng: -9.381, transferMinutes: [75], searchTerms: ["Peniche surf conditions Supertubos"], safeMonths: [4,5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 55, activityCostPerDay: 35, clubMedPerNight: 195, clubMedActivityIncluded: true, carRentalPerDay: 25 } },
  s2:  { name: "Tarifa", country: "ES", region: "Mediterranean", seasons: ["summer"], hubs: ["AGP", "SVQ"], lat: 36.014, lng: -5.604, transferMinutes: [120, 150], searchTerms: ["Tarifa kitesurf wind conditions"], safeMonths: [4,5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 65, activityCostPerDay: 45, clubMedPerNight: 220, clubMedActivityIncluded: true, carRentalPerDay: 30 } },
  s3:  { name: "Dahab", country: "EG", region: "Red Sea", seasons: ["summer"], hubs: ["SSH"], lat: 28.500, lng: 34.513, transferMinutes: [60], searchTerms: ["Dahab wind kitesurf diving conditions"], safeMonths: [1,2,3,4,5,6,9,10,11,12], defaultCosts: { accommodationPerNight: 25, activityCostPerDay: 20, clubMedPerNight: 0, clubMedActivityIncluded: false, carRentalPerDay: 15 } },
  s4:  { name: "Essaouira", country: "MA", region: "Atlantic Coast", seasons: ["summer"], hubs: ["ESS", "RAK"], lat: 31.513, lng: -9.770, transferMinutes: [15, 150], searchTerms: ["Essaouira wind surf conditions"], safeMonths: [3,4,5,6,7,8,9,10,11], defaultCosts: { accommodationPerNight: 35, activityCostPerDay: 25, clubMedPerNight: 165, clubMedActivityIncluded: true, carRentalPerDay: 20 } },
  s5:  { name: "Biarritz", country: "FR", region: "Atlantic Coast", seasons: ["summer"], hubs: ["BIQ", "BOD"], lat: 43.483, lng: -1.558, transferMinutes: [5, 120], searchTerms: ["Biarritz surf conditions Grande Plage"], safeMonths: [5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 100, activityCostPerDay: 40, clubMedPerNight: 275, clubMedActivityIncluded: true, carRentalPerDay: 35 } },
  s6:  { name: "Ericeira", country: "PT", region: "Atlantic Coast", seasons: ["summer"], hubs: ["LIS"], lat: 38.963, lng: -9.415, transferMinutes: [50], searchTerms: ["Ericeira surf conditions WSR waves"], safeMonths: [4,5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 60, activityCostPerDay: 30, clubMedPerNight: 210, clubMedActivityIncluded: true, carRentalPerDay: 22 } },
  s7:  { name: "Fuerteventura", country: "ES", region: "Canary Islands", seasons: ["summer"], hubs: ["FUE"], lat: 28.359, lng: -14.053, transferMinutes: [20], searchTerms: ["Fuerteventura surf wind conditions"], safeMonths: [1,2,3,4,5,6,7,8,9,10,11,12], defaultCosts: { accommodationPerNight: 55, activityCostPerDay: 30, clubMedPerNight: 190, clubMedActivityIncluded: true, carRentalPerDay: 20 } },
  s8:  { name: "Zanzibar", country: "TZ", region: "Indian Ocean", seasons: ["summer"], hubs: ["ZNZ", "DAR"], lat: -6.165, lng: 39.202, transferMinutes: [20, 90], searchTerms: ["Zanzibar kitesurf conditions Paje beach"], safeMonths: [6,7,8,9,10,1,2], defaultCosts: { accommodationPerNight: 45, activityCostPerDay: 35, clubMedPerNight: 250, clubMedActivityIncluded: true, carRentalPerDay: 18 } },
  s9:  { name: "Hossegor", country: "FR", region: "Atlantic Coast", seasons: ["summer"], hubs: ["BIQ", "BOD"], lat: 43.664, lng: -1.441, transferMinutes: [25, 120], searchTerms: ["Hossegor surf conditions La Gravière"], safeMonths: [5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 85, activityCostPerDay: 35, clubMedPerNight: 260, clubMedActivityIncluded: true, carRentalPerDay: 30 } },
  s10: { name: "Sagres", country: "PT", region: "Atlantic Coast", seasons: ["summer"], hubs: ["FAO"], lat: 37.009, lng: -8.940, transferMinutes: [75], searchTerms: ["Sagres surf conditions Algarve"], safeMonths: [4,5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 55, activityCostPerDay: 28, clubMedPerNight: 185, clubMedActivityIncluded: true, carRentalPerDay: 22 } },
  s11: { name: "Taghazout", country: "MA", region: "Atlantic Coast", seasons: ["summer"], hubs: ["AGA"], lat: 30.545, lng: -9.714, transferMinutes: [30], searchTerms: ["Taghazout surf conditions Anchor Point"], safeMonths: [1,2,3,4,5,9,10,11,12], defaultCosts: { accommodationPerNight: 30, activityCostPerDay: 22, clubMedPerNight: 155, clubMedActivityIncluded: true, carRentalPerDay: 15 } },
  s12: { name: "Crete", country: "GR", region: "Mediterranean", seasons: ["summer"], hubs: ["HER"], lat: 35.240, lng: 24.470, transferMinutes: [30], searchTerms: ["Crete beach conditions weather hiking"], safeMonths: [4,5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 65, activityCostPerDay: 25, clubMedPerNight: 230, clubMedActivityIncluded: true, carRentalPerDay: 25 } },
  s13: { name: "Sardinia", country: "IT", region: "Mediterranean", seasons: ["summer"], hubs: ["CAG", "OLB"], lat: 39.224, lng: 9.122, transferMinutes: [30, 45], searchTerms: ["Sardinia windsurf conditions beach"], safeMonths: [5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 80, activityCostPerDay: 35, clubMedPerNight: 245, clubMedActivityIncluded: true, carRentalPerDay: 28 } },
  s14: { name: "Lanzarote", country: "ES", region: "Canary Islands", seasons: ["summer"], hubs: ["ACE"], lat: 29.036, lng: -13.630, transferMinutes: [15], searchTerms: ["Lanzarote surf conditions Famara"], safeMonths: [1,2,3,4,5,6,7,8,9,10,11,12], defaultCosts: { accommodationPerNight: 60, activityCostPerDay: 30, clubMedPerNight: 200, clubMedActivityIncluded: true, carRentalPerDay: 20 } },
  s15: { name: "Split", country: "HR", region: "Mediterranean", seasons: ["summer"], hubs: ["SPU", "ZAG"], lat: 43.508, lng: 16.440, transferMinutes: [20, 240], searchTerms: ["Split Croatia sea conditions summer"], safeMonths: [5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 60, activityCostPerDay: 30, clubMedPerNight: 210, clubMedActivityIncluded: true, carRentalPerDay: 25 } },
};

// ─── Effective Activity Days Calculator ───
// Given flight arrival time at destination and departure time from destination,
// plus transfer time, calculate how many full activity days the traveler gets.
function calcEffectiveActivityDays(
  totalDays: number,
  outboundArrivalHour: number, // 0-23 local time at destination
  returnDepartureHour: number, // 0-23 local time at destination
  transferMinutes: number
): number {
  const transferHours = transferMinutes / 60;
  
  // Arrival day: can they do anything?
  // If they arrive + transfer by 14:00, they get a half day (doesn't count as full)
  // If they arrive + transfer by 10:00, count as full activity day
  const arrivalAtResort = outboundArrivalHour + transferHours;
  let arrivalDayValue = 0;
  if (arrivalAtResort <= 10) arrivalDayValue = 1;
  else if (arrivalAtResort <= 14) arrivalDayValue = 0.5;
  // else 0 — too late to do anything

  // Departure day: need to leave resort transferHours before flight
  // Plus 2h for airport buffer
  const leaveResortHour = returnDepartureHour - transferHours - 2;
  let departureDayValue = 0;
  if (leaveResortHour >= 14) departureDayValue = 0.5;
  // If they can stay until after 16:00, count as almost full day
  if (leaveResortHour >= 16) departureDayValue = 1;
  // If leaving before 14:00, no activity on departure day

  // Full days in between (excluding arrival and departure days)
  const middleDays = Math.max(0, totalDays - 2);
  
  return Math.round(middleDays + arrivalDayValue + departureDayValue);
}

// ─── LLM: Get ALL conditions + costs in one call ───
async function enrichAllWithLLM(
  destinations: { id: string; name: string; country: string; mode: string; altitude?: number }[]
): Promise<Record<string, { conditions: any; costs: any }>> {
  const aiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!aiKey) { console.warn("No LOVABLE_API_KEY"); return {}; }

  const isWinter = destinations[0]?.mode === "winter";
  const today = new Date().toISOString().split("T")[0];

  const destList = destinations.map(d => 
    `- ${d.id}: ${d.name}, ${d.country}${d.altitude ? ` (${d.altitude}m)` : ""}`
  ).join("\n");

  const winterConditionsSchema = {
    type: "object",
    properties: {
      snowDepthBase: { type: "number", description: "Snow depth at base in cm" },
      snowDepthPeak: { type: "number", description: "Snow depth at peak in cm" },
      freshSnow48h: { type: "number", description: "Fresh snow in last 48h in cm" },
      tempC: { type: "number", description: "Current temperature at resort in Celsius" },
      freezeLevel: { type: "number", description: "Freeze level in meters" },
      recentStorm: { type: "boolean" },
      liftStatus: { type: "string", enum: ["full", "partial", "closed"] },
    },
    required: ["snowDepthBase", "snowDepthPeak", "freshSnow48h", "tempC", "freezeLevel", "recentStorm", "liftStatus"],
  };

  const summerConditionsSchema = {
    type: "object",
    properties: {
      waterTempC: { type: "number" },
      swellHeightM: { type: "number" },
      swellPeriodS: { type: "number" },
      windKnots: { type: "number" },
      uvIndex: { type: "number" },
      sunnyDays: { type: "number", description: "Expected sunny days in next 7" },
      rainyDays: { type: "number", description: "Expected rainy days in next 7" },
    },
    required: ["waterTempC", "swellHeightM", "swellPeriodS", "windKnots", "uvIndex", "sunnyDays", "rainyDays"],
  };

  const prompt = `Today is ${today}. You are a travel data analyst with expertise in ${isWinter ? "ski resort conditions" : "surf/water sport conditions"} and travel pricing.

For EACH destination below, provide CURRENT real conditions and ACCURATE 2025-2026 season pricing in EUR.

Destinations:
${destList}

CRITICAL ACCURACY RULES:
${isWinter ? `- Snow depths: Check actual current reports. Many Alpine resorts in March have 150-350cm at peak. If a resort has glacier access (Hintertux, Zermatt), snow is near-guaranteed.
- Lift status: Most major resorts are fully operational in March. Only mark "partial" or "closed" if genuinely end-of-season.
- Ski pass prices: Val Thorens ~€72/day, Zermatt ~€92/day, Grandvalira ~€55/day, Bansko ~€40/day, Gudauri ~€18/day. Use actual 2025 published rates.
- Accommodation: Use mid-range apartment/hotel rates for the current period.` 
: `- Water temperatures: Use actual seasonal averages for this time of year.
- Swell/wind: Use typical conditions for the current month.
- Activity costs: surf lesson/rental ~€30-50/day, kite rental ~€40-60/day.`}

Return data for ALL ${destinations.length} destinations. Do not skip any.`;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a travel data expert. Return structured data via the provided tool. Be accurate with real current data." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "set_destination_data",
            description: "Set conditions and costs for all destinations",
            parameters: {
              type: "object",
              properties: {
                destinations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", description: "Destination ID exactly as provided (e.g. w1, s3)" },
                      conditions: isWinter ? winterConditionsSchema : summerConditionsSchema,
                      costs: {
                        type: "object",
                        properties: {
                          accommodationPerNight: { type: "number", description: "Mid-range hotel/apartment EUR/night" },
                          activityCostPerDay: { type: "number", description: isWinter ? "Daily ski pass EUR" : "Daily activity rental EUR" },
                          clubMedPerNight: { type: "number", description: "Nearest Club Med all-inclusive EUR/night, 0 if none" },
                          clubMedActivityIncluded: { type: "boolean" },
                          ...(isWinter ? {} : { carRentalPerDay: { type: "number" } }),
                        },
                        required: ["accommodationPerNight", "activityCostPerDay", "clubMedPerNight", "clubMedActivityIncluded"],
                      },
                    },
                    required: ["id", "conditions", "costs"],
                  },
                },
              },
              required: ["destinations"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "set_destination_data" } },
      }),
    });

    if (!res.ok) {
      console.error("LLM enrichment error:", res.status, await res.text());
      return {};
    }

    const data = await res.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("LLM returned no tool call");
      return {};
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    const result: Record<string, { conditions: any; costs: any }> = {};
    for (const d of parsed.destinations || []) {
      if (d.id && d.conditions && d.costs) {
        result[d.id] = { conditions: d.conditions, costs: d.costs };
      }
    }
    console.log(`LLM enriched ${Object.keys(result).length}/${destinations.length} destinations`);
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
    const fmtT = (iso: string) => {
      const d = new Date(iso);
      return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
    };
    const getHour = (iso: string) => new Date(iso).getUTCHours();
    const tp = offer.travelerPricings?.[0];
    const outBag = tp?.fareDetailsBySegment?.[0]?.includedCheckedBags?.weight > 0;
    const retBag = tp?.fareDetailsBySegment?.[outSegs.length]?.includedCheckedBags?.weight > 0;
    return {
      origin: "TLV" as const, hub,
      outbound: {
        airline: outSegs[0].carrierCode,
        departure: fmtT(outSegs[0].departure.at),
        arrival: fmtT(outSegs[outSegs.length - 1].arrival.at),
        baseFare: outFare,
        baggageIncluded: !!outBag,
      },
      returnLeg: {
        airline: retSegs[0].carrierCode,
        departure: fmtT(retSegs[0].departure.at),
        arrival: fmtT(retSegs[retSegs.length - 1].arrival.at),
        baseFare: retFare,
        baggageIncluded: !!retBag,
      },
      baggageFee: outBag && retBag ? 0 : 35,
      airportTransfer: 50,
      // Metadata for travel day calc
      _arrivalHour: getHour(outSegs[outSegs.length - 1].arrival.at),
      _departureHour: getHour(retSegs[0].departure.at),
    };
  } catch (e) { console.error("Flight search error:", e); return null; }
}

// ─── Firecrawl + AI Sentiment (expanded to top 8) ───
async function fetchSentimentBatch(dests: { id: string; name: string; mode: string; searchTerms: string[] }[]) {
  const fcKey = Deno.env.get("FIRECRAWL_API_KEY");
  const aiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!fcKey) return {};
  const results: Record<string, any> = {};
  const limited = dests.slice(0, 8);
  
  // Run searches in parallel batches of 4
  const batch1 = limited.slice(0, 4);
  const batch2 = limited.slice(4, 8);
  
  async function processDest(d: typeof limited[0]) {
    try {
      const query = d.searchTerms[0];
      const res = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: { Authorization: `Bearer ${fcKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query, limit: 3, tbs: "qdr:m" }), // last month for more results
      });
      if (!res.ok) { await res.text(); return; }
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
      let vibeScore = 60;
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
                { role: "user", content: `Analyze these snippets about ${d.name} for ${activity}:\n${snippets.map((s, i) => `${i + 1}. ${s.slice(0, 200)}`).join("\n")}\n\nReturn JSON: {"vibeScore": <0-100>, "summary": "<2 sentences max, practical info for a traveler>"}` },
              ],
            }),
          });
          if (aiRes.ok) {
            const aiData = await aiRes.json();
            const content = aiData.choices?.[0]?.message?.content || "";
            const match = content.match(/\{[\s\S]*\}/);
            if (match) {
              const parsed = JSON.parse(match[0]);
              vibeScore = Math.max(0, Math.min(100, parsed.vibeScore || 60));
              summary = parsed.summary || summary;
            }
          }
        } catch (e) { console.error("AI sentiment error:", e); }
      }
      results[d.id] = { vibeScore, summary, sources: sources.slice(0, 3), lastUpdated: new Date().toISOString() };
    } catch (e) { console.error(`Sentiment error for ${d.id}:`, e); }
  }

  // Process batch 1 in parallel
  await Promise.all(batch1.map(processDest));
  // Then batch 2
  if (batch2.length > 0) {
    await Promise.all(batch2.map(processDest));
  }
  
  return results;
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, days, departureDate: reqDepDate } = await req.json() as {
      mode: "winter" | "summer"; days: number; departureDate?: string;
    };

    const entries = Object.entries(REGISTRY).filter(([_, v]) => isSeasonSafe(v, mode));
    if (entries.length === 0) {
      return new Response(JSON.stringify({ success: true, data: [], live: { flights: false, weather: false, sentiment: false }, lateSeason: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Departure date: use provided or default to tomorrow
    // Validate it's within next 4 days
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

    const sortedEntries = [...entries];
    if (isLateSeason) {
      sortedEntries.sort((a, b) => (b[1].altitude || 0) - (a[1].altitude || 0));
    }

    // ── Parallel: Flights token + LLM (conditions+costs) + Sentiment ──
    const sentimentDests = sortedEntries.map(([id, v]) => ({ id, name: v.name, mode, searchTerms: v.searchTerms }));
    const llmDests = sortedEntries.map(([id, v]) => ({ id, name: v.name, country: v.country, mode, altitude: v.altitude }));

    const [token, llmData, sentimentData] = await Promise.all([
      getAmadeusToken(),
      enrichAllWithLLM(llmDests),
      fetchSentimentBatch(sentimentDests),
    ]);

    // ── Flights: search ALL hubs per destination, pick cheapest total ──
    const flightsData: Record<string, any> = {};
    if (token) {
      // Collect all unique hubs we need to search
      const allHubs = new Set<string>();
      for (const [_, reg] of sortedEntries) {
        for (const hub of reg.hubs) allHubs.add(hub);
      }

      // Search each unique hub once
      const hubResults = new Map<string, any>();
      for (const hub of allHubs) {
        await new Promise(r => setTimeout(r, 120));
        const result = await searchFlight(token, hub, depDate, retDate);
        hubResults.set(hub, result);
      }

      // For each destination, compare all hub options and pick cheapest total
      for (const [id, reg] of sortedEntries) {
        let bestOption: any = null;
        let bestTotalCost = Infinity;

        for (let i = 0; i < reg.hubs.length; i++) {
          const hub = reg.hubs[i];
          const result = hubResults.get(hub);
          if (!result) continue;

          const transferMin = reg.transferMinutes[i] || 120;
          const transferCost = Math.round(transferMin <= 60 ? 30 : transferMin <= 120 ? 50 : transferMin <= 180 ? 70 : 90);
          const flightCost = result.outbound.baseFare + result.returnLeg.baseFare;
          const totalCost = flightCost + (transferCost * 2); // round trip transfer

          if (totalCost < bestTotalCost) {
            bestTotalCost = totalCost;
            bestOption = { ...result, hub, airportTransfer: transferCost };
          }
        }

        if (bestOption) {
          flightsData[id] = bestOption;
        }
      }
    }

    const liveFlags = {
      flights: !!token && Object.values(flightsData).some(v => v !== null),
      weather: Object.keys(llmData).length > 0,
      sentiment: Object.keys(sentimentData).length > 0,
    };

    // ── Assemble Destination[] ──
    const destinations = sortedEntries.map(([id, reg]) => {
      const fl = flightsData[id];
      const llm = llmData[id];
      const st = sentimentData[id];

      const fallbackFlights = {
        origin: "TLV" as const, hub: reg.hubs[0],
        outbound: { airline: "—", departure: "—", arrival: "—", baseFare: 0, baggageIncluded: false },
        returnLeg: { airline: "—", departure: "—", arrival: "—", baseFare: 0, baggageIncluded: false },
        baggageFee: 35, airportTransfer: 50,
      };

      const safeFlag = mode === "summer" ? isSeasonSafe(reg, "summer") : true;

      let conditions: any;
      if (llm?.conditions) {
        if (mode === "winter") {
          conditions = { ...llm.conditions, altitude: reg.altitude || 1800, stormDaysAgo: llm.conditions.recentStorm ? 0 : undefined };
        } else {
          conditions = { ...llm.conditions, safeSeasonFlag: safeFlag };
        }
      } else {
        conditions = mode === "winter"
          ? { snowDepthBase: 0, snowDepthPeak: 0, freshSnow48h: 0, tempC: 0, freezeLevel: 0, recentStorm: false, liftStatus: "full", altitude: reg.altitude || 1800 }
          : { waterTempC: 0, swellHeightM: 0, swellPeriodS: 0, windKnots: 0, uvIndex: 0, sunnyDays: 0, rainyDays: 0, safeSeasonFlag: safeFlag };
      }

      const costs = llm?.costs || reg.defaultCosts;

      let effectiveDays = days;
      if (fl?._arrivalHour != null && fl?._departureHour != null) {
        const hubIdx = reg.hubs.indexOf(fl.hub);
        const transferMin = hubIdx >= 0 ? reg.transferMinutes[hubIdx] : reg.transferMinutes[0] || 60;
        effectiveDays = calcEffectiveActivityDays(days, fl._arrivalHour, fl._departureHour, transferMin);
      }

      const fallbackSentiment = { vibeScore: 0, summary: "Data temporarily unavailable.", sources: [], lastUpdated: new Date().toISOString() };

      const flights = fl
        ? { origin: fl.origin, hub: fl.hub, outbound: fl.outbound, returnLeg: fl.returnLeg, baggageFee: fl.baggageFee, airportTransfer: fl.airportTransfer }
        : fallbackFlights;

      return {
        id, name: reg.name, country: reg.country, region: reg.region, mode,
        flights, conditions,
        sentiment: st || fallbackSentiment,
        costs, effectiveDays,
        _liveFlights: !!fl, _liveWeather: !!llm?.conditions, _liveSentiment: !!st, _llmCosts: !!llm?.costs,
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
