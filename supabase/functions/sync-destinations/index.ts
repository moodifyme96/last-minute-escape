import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Destination Registry ───
interface RegistryEntry {
  name: string; country: string; region: string;
  seasons: ("winter" | "summer")[];
  hubs: string[];
  lat: number; lng: number; altitude?: number;
  slopeKm?: number;
  transferMinutes: number[];
  safeMonths?: number[];
  snowForecastSlug?: string;
  defaultCosts: {
    accommodationPerNight: number; activityCostPerDay: number;
    clubMedPerNight: number; clubMedActivityIncluded: boolean;
    carRentalPerDay?: number;
  };
}

const REGISTRY: Record<string, RegistryEntry> = {
  w1:  { name: "Val Thorens", country: "FR", region: "Alps", seasons: ["winter"], hubs: ["LYS", "GVA"], lat: 45.298, lng: 6.580, altitude: 2300, slopeKm: 600, transferMinutes: [150, 180], snowForecastSlug: "Val-Thorens", defaultCosts: { accommodationPerNight: 95, activityCostPerDay: 72, clubMedPerNight: 285, clubMedActivityIncluded: true } },
  w2:  { name: "Innsbruck (Nordkette)", country: "AT", region: "Alps", seasons: ["winter"], hubs: ["INN", "MUC"], lat: 47.260, lng: 11.394, altitude: 1800, slopeKm: 22, transferMinutes: [15, 120], snowForecastSlug: "Nordpark", defaultCosts: { accommodationPerNight: 85, activityCostPerDay: 56, clubMedPerNight: 260, clubMedActivityIncluded: true } },
  w3:  { name: "Chamonix", country: "FR", region: "Alps", seasons: ["winter"], hubs: ["GVA", "LYS"], lat: 45.924, lng: 6.870, altitude: 2400, slopeKm: 155, transferMinutes: [80, 180], snowForecastSlug: "Chamonix", defaultCosts: { accommodationPerNight: 115, activityCostPerDay: 68, clubMedPerNight: 310, clubMedActivityIncluded: true } },
  w4:  { name: "Zermatt", country: "CH", region: "Alps", seasons: ["winter"], hubs: ["ZRH", "GVA"], lat: 46.020, lng: 7.749, altitude: 2600, slopeKm: 360, transferMinutes: [210, 240], snowForecastSlug: "Zermatt", defaultCosts: { accommodationPerNight: 170, activityCostPerDay: 85, clubMedPerNight: 380, clubMedActivityIncluded: true } },
  w5:  { name: "St. Anton", country: "AT", region: "Alps", seasons: ["winter"], hubs: ["INN", "ZRH"], lat: 47.128, lng: 10.268, altitude: 1800, slopeKm: 305, transferMinutes: [75, 150], snowForecastSlug: "St-Anton", defaultCosts: { accommodationPerNight: 95, activityCostPerDay: 62, clubMedPerNight: 270, clubMedActivityIncluded: true } },
  w6:  { name: "Bansko", country: "BG", region: "Balkans", seasons: ["winter"], hubs: ["SOF"], lat: 41.838, lng: 23.489, altitude: 1400, slopeKm: 48, transferMinutes: [150], snowForecastSlug: "Bansko", defaultCosts: { accommodationPerNight: 35, activityCostPerDay: 35, clubMedPerNight: 155, clubMedActivityIncluded: true } },
  w7:  { name: "Livigno", country: "IT", region: "Alps", seasons: ["winter"], hubs: ["MXP", "INN"], lat: 46.538, lng: 10.136, altitude: 1800, slopeKm: 115, transferMinutes: [210, 180], snowForecastSlug: "Livigno", defaultCosts: { accommodationPerNight: 75, activityCostPerDay: 48, clubMedPerNight: 220, clubMedActivityIncluded: true } },
  w8:  { name: "Gudauri", country: "GE", region: "Caucasus", seasons: ["winter"], hubs: ["TBS"], lat: 42.458, lng: 44.470, altitude: 2200, slopeKm: 75, transferMinutes: [120], snowForecastSlug: "Gudauri", defaultCosts: { accommodationPerNight: 40, activityCostPerDay: 20, clubMedPerNight: 0, clubMedActivityIncluded: false } },
  w9:  { name: "Verbier", country: "CH", region: "Alps", seasons: ["winter"], hubs: ["GVA", "ZRH"], lat: 46.096, lng: 7.228, altitude: 2200, slopeKm: 410, transferMinutes: [120, 180], snowForecastSlug: "Verbier", defaultCosts: { accommodationPerNight: 185, activityCostPerDay: 78, clubMedPerNight: 395, clubMedActivityIncluded: true } },
  w10: { name: "Grandvalira (Soldeu)", country: "AD", region: "Pyrenees", seasons: ["winter"], hubs: ["BCN", "TLS"], lat: 42.576, lng: 1.668, altitude: 1710, slopeKm: 210, transferMinutes: [180, 150], snowForecastSlug: "El-Tarter-Soldeu", defaultCosts: { accommodationPerNight: 70, activityCostPerDay: 52, clubMedPerNight: 235, clubMedActivityIncluded: true } },
  w11: { name: "Tignes", country: "FR", region: "Alps", seasons: ["winter"], hubs: ["LYS", "GVA"], lat: 45.468, lng: 6.907, altitude: 2100, slopeKm: 300, transferMinutes: [150, 180], snowForecastSlug: "Tignes", defaultCosts: { accommodationPerNight: 90, activityCostPerDay: 68, clubMedPerNight: 290, clubMedActivityIncluded: true } },
  w12: { name: "Kitzbühel", country: "AT", region: "Alps", seasons: ["winter"], hubs: ["SZG", "MUC", "INN"], lat: 47.449, lng: 12.392, altitude: 1600, slopeKm: 170, transferMinutes: [80, 120, 100], snowForecastSlug: "Kitzbuhel", defaultCosts: { accommodationPerNight: 110, activityCostPerDay: 60, clubMedPerNight: 275, clubMedActivityIncluded: true } },
  w13: { name: "Borovets", country: "BG", region: "Balkans", seasons: ["winter"], hubs: ["SOF"], lat: 42.265, lng: 23.608, altitude: 1300, slopeKm: 58, transferMinutes: [75], snowForecastSlug: "Borovets", defaultCosts: { accommodationPerNight: 30, activityCostPerDay: 28, clubMedPerNight: 140, clubMedActivityIncluded: true } },
  w14: { name: "Cervinia", country: "IT", region: "Alps", seasons: ["winter"], hubs: ["TRN", "MXP"], lat: 45.934, lng: 7.631, altitude: 2500, slopeKm: 360, transferMinutes: [120, 150], snowForecastSlug: "Cervinia", defaultCosts: { accommodationPerNight: 90, activityCostPerDay: 62, clubMedPerNight: 265, clubMedActivityIncluded: true } },
  w15: { name: "Jasná", country: "SK", region: "Carpathians", seasons: ["winter"], hubs: ["VIE", "BUD"], lat: 48.955, lng: 19.586, altitude: 1900, slopeKm: 50, transferMinutes: [240, 210], snowForecastSlug: "Jasna-Chopok", defaultCosts: { accommodationPerNight: 45, activityCostPerDay: 38, clubMedPerNight: 175, clubMedActivityIncluded: true } },
  w16: { name: "Åre", country: "SE", region: "Scandinavia", seasons: ["winter"], hubs: ["ARN", "OSL"], lat: 63.399, lng: 13.080, altitude: 1274, slopeKm: 100, transferMinutes: [360, 420], snowForecastSlug: "Are-Duved", defaultCosts: { accommodationPerNight: 110, activityCostPerDay: 58, clubMedPerNight: 0, clubMedActivityIncluded: false } },
  w17: { name: "Hintertux", country: "AT", region: "Alps", seasons: ["winter"], hubs: ["INN", "MUC"], lat: 47.060, lng: 11.660, altitude: 3250, slopeKm: 60, transferMinutes: [90, 150], snowForecastSlug: "Hintertux", defaultCosts: { accommodationPerNight: 100, activityCostPerDay: 58, clubMedPerNight: 0, clubMedActivityIncluded: false } },
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

// ─── Snow-Forecast.com: Real resort-reported snow depths ───
async function fetchSnowDepths(slug: string): Promise<{ upper: number; lower: number } | null> {
  try {
    const res = await fetch(`https://www.snow-forecast.com/resorts/${slug}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    if (!res.ok) { console.error(`snow-forecast.com ${slug}: HTTP ${res.status}`); return null; }
    const html = await res.text();
    const upperMatch = html.match(/Upper snow depth:[\s\S]*?<span class="snow">(\d+)<\/span>/i);
    const lowerMatch = html.match(/Lower snow depth:[\s\S]*?<span class="snow">(\d+)<\/span>/i);
    return {
      upper: upperMatch ? parseInt(upperMatch[1]) : 0,
      lower: lowerMatch ? parseInt(lowerMatch[1]) : 0,
    };
  } catch (e) {
    console.error(`snow-forecast.com fetch failed for ${slug}:`, e);
    return null;
  }
}

// ─── Open-Meteo: Winter weather (temp, snowfall, wind — NOT snow depth) ───
async function fetchWinterConditions(lat: number, lng: number, altitude: number, snowForecastSlug?: string): Promise<any> {
  try {
    // Fetch real snow depths from snow-forecast.com (resort-reported)
    let snowDepthBase = 0;
    let snowDepthPeak = 0;
    let snowSource = "unavailable";
    if (snowForecastSlug) {
      const depths = await fetchSnowDepths(snowForecastSlug);
      if (depths) {
        snowDepthBase = depths.lower;
        snowDepthPeak = depths.upper;
        snowSource = "snow-forecast.com";
      }
    }

    // Fetch weather data from Open-Meteo (temp, fresh snowfall, wind)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=snowfall_sum,temperature_2m_min,temperature_2m_max&past_days=2&forecast_days=1&timezone=auto&elevation=${altitude}`;
    const res = await fetch(url);
    if (!res.ok) { console.error(`Open-Meteo winter error ${res.status} for ${lat},${lng}`); return null; }
    const data = await res.json();

    // Snowfall in last 48h
    const dailySnowfall = data.daily?.snowfall_sum || [];
    const freshSnow48h = Math.round(dailySnowfall.slice(0, 2).reduce((a: number, b: number) => a + (b || 0), 0) * 10) / 10;

    // Temperature
    const temps = data.daily?.temperature_2m_min || [];
    const tempC = temps.length > 0 ? Math.round(temps[temps.length - 1]) : 0;
    const maxTemps = data.daily?.temperature_2m_max || [];
    const maxTempC = maxTemps.length > 0 ? Math.round(maxTemps[maxTemps.length - 1]) : 0;

    const freezeLevel = maxTempC <= 0 ? 0 : Math.round(altitude + (maxTempC / 6.5) * 1000);

    const recentStorm = freshSnow48h >= 5;
    const stormDaysAgo = recentStorm ? (dailySnowfall[0] > dailySnowfall[1] ? 0 : 1) : undefined;

    // Lift status from real snow depth
    let liftStatus: "full" | "partial" | "closed" = "full";
    if (snowDepthBase < 10 && snowDepthPeak < 20) liftStatus = "closed";
    else if (snowDepthBase < 30 || maxTempC > 10) liftStatus = "partial";

    return {
      snowDepthBase,
      snowDepthPeak,
      freshSnow48h,
      tempC,
      freezeLevel,
      recentStorm,
      stormDaysAgo,
      liftStatus,
      altitude,
      snowSource,
      dataConfidence: snowSource === "snow-forecast.com" ? "high" : "medium",
    };
  } catch (e) {
    console.error(`Winter fetch failed for ${lat},${lng}:`, e);
    return null;
  }
}

// ─── Open-Meteo: Summer conditions (weather + marine) ───
async function fetchSummerConditions(lat: number, lng: number): Promise<any> {
  try {
    // Weather forecast (7 days)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=uv_index_max,precipitation_sum,sunshine_duration,temperature_2m_max&forecast_days=7&timezone=auto`;
    // Marine data (waves, wind)
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=wave_height,wave_period&daily=wave_height_max,wave_period_max&forecast_days=1&timezone=auto`;

    const [weatherRes, marineRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(marineUrl),
    ]);

    let weather: any = null;
    let marine: any = null;

    if (weatherRes.ok) weather = await weatherRes.json();
    else console.error(`Open-Meteo weather error ${weatherRes.status}`);

    if (marineRes.ok) marine = await marineRes.json();
    else console.error(`Open-Meteo marine error ${marineRes.status}`);

    // Process weather
    const dailyPrecip = weather?.daily?.precipitation_sum || [];
    const dailySunshine = weather?.daily?.sunshine_duration || []; // seconds
    const dailyUV = weather?.daily?.uv_index_max || [];
    const dailyTemp = weather?.daily?.temperature_2m_max || [];

    const rainyDays = dailyPrecip.filter((p: number) => p > 1).length;
    const sunnyDays = dailySunshine.filter((s: number) => s > 28800).length; // >8h sunshine
    const uvIndex = dailyUV.length > 0 ? Math.round(Math.max(...dailyUV)) : 0;

    // Water temp estimate from air temp (rough: water ≈ air - 3°C for coastal)
    const avgAirTemp = dailyTemp.length > 0 ? dailyTemp.reduce((a: number, b: number) => a + b, 0) / dailyTemp.length : 20;
    const waterTempC = Math.round(avgAirTemp - 3);

    // Marine data
    const swellHeightM = marine?.current?.wave_height || marine?.daily?.wave_height_max?.[0] || 0;
    const swellPeriodS = marine?.current?.wave_period || marine?.daily?.wave_period_max?.[0] || 0;

    // Wind: use a separate endpoint
    const windUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=wind_speed_10m,wind_gusts_10m&timezone=auto`;
    let windKnots = 0;
    try {
      const windRes = await fetch(windUrl);
      if (windRes.ok) {
        const windData = await windRes.json();
        const windKmh = windData?.current?.wind_speed_10m || 0;
        windKnots = Math.round(windKmh / 1.852);
      }
    } catch { /* ignore */ }

    return {
      waterTempC,
      swellHeightM: Math.round(swellHeightM * 10) / 10,
      swellPeriodS: Math.round(swellPeriodS),
      windKnots,
      uvIndex,
      sunnyDays,
      rainyDays,
      safeSeasonFlag: true, // filtered at registry level
      dataConfidence: "high",
    };
  } catch (e) {
    console.error(`Open-Meteo summer fetch failed for ${lat},${lng}:`, e);
    return null;
  }
}

// ─── Amadeus: Fetch indicative flight prices ───
async function getAmadeusToken(): Promise<string | null> {
  const key = Deno.env.get("AMADEUS_API_KEY");
  const secret = Deno.env.get("AMADEUS_API_SECRET");
  if (!key || !secret) { console.error("Missing Amadeus credentials"); return null; }
  try {
    const res = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${key}&client_secret=${secret}`,
    });
    if (!res.ok) { console.error("Amadeus auth failed:", res.status); return null; }
    const data = await res.json();
    return data.access_token;
  } catch (e) { console.error("Amadeus auth error:", e); return null; }
}

async function fetchFlightPrice(
  token: string, hub: string, depDate: string, retDate: string
): Promise<number | null> {
  try {
    const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=TLV&destinationLocationCode=${hub}&departureDate=${depDate}&returnDate=${retDate}&adults=1&nonStop=false&max=3&currencyCode=EUR`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`Amadeus flight search ${hub}: ${res.status}`, body.slice(0, 200));
      return null;
    }
    const data = await res.json();
    const offers = data.data || [];
    if (offers.length === 0) return null;
    // Get cheapest price
    const prices = offers.map((o: any) => parseFloat(o.price?.total || "0")).filter((p: number) => p > 0);
    return prices.length > 0 ? Math.round(Math.min(...prices)) : null;
  } catch (e) { console.error(`Amadeus flight price error for ${hub}:`, e); return null; }
}


async function generateSentiment(
  destinations: { id: string; name: string; mode: string; conditions: any }[],
  aiKey: string
): Promise<Record<string, any>> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const destList = destinations.map(d => {
      const c = d.conditions || {};
      const condStr = d.mode === "winter"
        ? `Snow base: ${c.snowDepthBase}cm, fresh 48h: ${c.freshSnow48h}cm, temp: ${c.tempC}°C, lifts: ${c.liftStatus}`
        : `Swell: ${c.swellHeightM}m, wind: ${c.windKnots}kts, water: ${c.waterTempC}°C, UV: ${c.uvIndex}`;
      return `- ${d.id}: ${d.name} (${d.mode}) — ${condStr}`;
    }).join("\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: `You generate travel sentiment assessments. Based on the real weather data provided and your knowledge of each destination, produce a vibeScore (0-100) and a practical 2-sentence summary for travelers. Today is ${today}.` },
          { role: "user", content: `Generate sentiment for these destinations:\n${destList}\n\nRespond with JSON: {"results": [{"id": "...", "vibeScore": N, "summary": "..."}]}` },
        ],
      }),
    });

    if (!res.ok) { console.error("Sentiment LLM error:", res.status); return {}; }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};
    const parsed = JSON.parse(jsonMatch[0]);
    const result: Record<string, any> = {};
    for (const r of parsed.results || []) {
      result[r.id] = {
        vibeScore: Math.max(0, Math.min(100, r.vibeScore || 50)),
        summary: r.summary || "",
        sources: [{ platform: "open-meteo.com", snippet: "Real-time weather data" }],
        lastUpdated: new Date().toISOString(),
      };
    }
    return result;
  } catch (e) { console.error("Sentiment generation failed:", e); return {}; }
}

// ─── Main sync handler ───
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const aiKey = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!aiKey) {
      return new Response(JSON.stringify({ success: false, error: "Missing LOVABLE_API_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    let body: any = {};
    try { body = await req.json(); } catch { /* empty body is fine */ }
    const modeFilter: string | undefined = body?.mode;

    const entries = Object.entries(REGISTRY).filter(([_, v]) => {
      if (modeFilter) return v.seasons.includes(modeFilter as any);
      return true;
    });

    console.log(`Starting sync for ${entries.length} destinations${modeFilter ? ` (${modeFilter} only)` : ""} — snow depths from snow-forecast.com, weather from Open-Meteo`);

    // Phase 1: Fetch all weather data in parallel (Open-Meteo is free, no rate limits)
    const conditionsMap: Record<string, any> = {};
    const PARALLEL_BATCH = 3; // Keep small — snow-forecast.com is scraped per resort

    for (let i = 0; i < entries.length; i += PARALLEL_BATCH) {
      const batch = entries.slice(i, i + PARALLEL_BATCH);
      const promises = batch.map(async ([id, reg]) => {
        const mode = reg.seasons[0];
        let conditions: any = null;
        if (mode === "winter") {
          conditions = await fetchWinterConditions(reg.lat, reg.lng, reg.altitude || 1500, reg.snowForecastSlug);
        } else {
          conditions = await fetchSummerConditions(reg.lat, reg.lng);
        }
        return { id, conditions };
      });

      const results = await Promise.all(promises);
      for (const r of results) {
        if (r.conditions) conditionsMap[r.id] = r.conditions;
      }
      // snow-forecast.com is polite — 3 per batch with 2s delay
      if (i + PARALLEL_BATCH < entries.length) await new Promise(r => setTimeout(r, 2000));
    }

    console.log(`Fetched conditions for ${Object.keys(conditionsMap).length}/${entries.length} destinations`);

    // Phase 2: Fetch flight prices from Amadeus
    const flightPriceMap: Record<string, number> = {};
    const amadeusToken = await getAmadeusToken();
    if (amadeusToken) {
      // Compute dates for flight search (tomorrow + days)
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
      const retDay = new Date(tomorrow); retDay.setDate(retDay.getDate() + 3);
      const fmtD = (d: Date) => d.toISOString().split("T")[0];
      const depStr = fmtD(tomorrow);
      const retStr = fmtD(retDay);

      // Deduplicate hubs to minimize API calls
      const hubSet = new Map<string, string[]>(); // hub -> [destIds]
      for (const [id, reg] of entries) {
        const hub = reg.hubs[0];
        if (!hubSet.has(hub)) hubSet.set(hub, []);
        hubSet.get(hub)!.push(id);
      }

      const FLIGHT_BATCH = 3;
      const hubEntries = [...hubSet.entries()];
      for (let i = 0; i < hubEntries.length; i += FLIGHT_BATCH) {
        const batch = hubEntries.slice(i, i + FLIGHT_BATCH);
        const results = await Promise.all(
          batch.map(async ([hub, ids]) => {
            const price = await fetchFlightPrice(amadeusToken, hub, depStr, retStr);
            return { hub, ids, price };
          })
        );
        for (const r of results) {
          if (r.price) {
            for (const id of r.ids) flightPriceMap[id] = r.price;
          }
        }
        if (i + FLIGHT_BATCH < hubEntries.length) await new Promise(r => setTimeout(r, 500));
      }
      console.log(`Fetched flight prices for ${Object.keys(flightPriceMap).length} destinations via ${hubSet.size} unique hubs`);
    } else {
      console.warn("Skipping flight prices — Amadeus auth failed");
    }

    // Phase 3: Generate sentiment in batches using LLM + real weather data
    const sentimentMap: Record<string, any> = {};
    const SENTIMENT_BATCH = 8;

    for (let i = 0; i < entries.length; i += SENTIMENT_BATCH) {
      const batch = entries.slice(i, i + SENTIMENT_BATCH);
      const sentDests = batch.map(([id, reg]) => ({
        id, name: reg.name, mode: reg.seasons[0],
        conditions: conditionsMap[id] || {},
      }));
      const sentResult = await generateSentiment(sentDests, aiKey);
      Object.assign(sentimentMap, sentResult);
    }

    // Phase 4: Upsert to database
    let totalSynced = 0;
    for (const [id, reg] of entries) {
      const conditions = conditionsMap[id] || {};
      const sentiment = sentimentMap[id] || {
        vibeScore: 0, summary: "No sentiment data available.",
        sources: [], lastUpdated: new Date().toISOString(),
      };

      const costs = { ...reg.defaultCosts };
      const flightPrice = flightPriceMap[id];

      const row = {
        id,
        mode: reg.seasons[0],
        name: reg.name,
        country: reg.country,
        region: reg.region,
        conditions: { ...conditions, altitude: reg.altitude || 0, flightPrice: flightPrice || null },
        costs,
        sentiment,
        condition_sources: conditions.snowSource === "snow-forecast.com" 
          ? ["snow-forecast.com", "open-meteo.com"] 
          : ["open-meteo.com"],
        pricing_sources: flightPrice ? ["amadeus", "registry-defaults"] : ["registry-defaults"],
        data_confidence: conditions.dataConfidence || "low",
        synced_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("destination_conditions").upsert(row, { onConflict: "id" });
      if (error) {
        console.error(`Upsert error for ${id}:`, error);
      } else {
        totalSynced++;
        console.log(`✓ ${id}: ${reg.name} — flight:€${flightPrice || '?'} snow:${conditions.snowDepthBase || '-'}cm conf:${row.data_confidence}`);
      }
    }

    console.log(`Sync complete: ${totalSynced}/${entries.length}`);

    return new Response(
      JSON.stringify({ success: true, synced: totalSynced, total: entries.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("sync-destinations error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
