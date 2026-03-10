import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WeatherRequest {
  destinations: {
    id: string;
    lat: number;
    lng: number;
    mode: "winter" | "summer";
    altitude?: number;
  }[];
}

async function fetchStormglass(lat: number, lng: number, params: string) {
  const apiKey = Deno.env.get("STORMGLASS_API_KEY");
  if (!apiKey) throw new Error("STORMGLASS_API_KEY not configured");

  const end = new Date();
  end.setDate(end.getDate() + 3);

  const url =
    `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lng}` +
    `&params=${params}` +
    `&start=${new Date().toISOString()}&end=${end.toISOString()}`;

  const res = await fetch(url, {
    headers: { Authorization: apiKey },
  });

  const body = await res.text();
  if (!res.ok) {
    console.error("Stormglass error:", res.status, body);
    return null;
  }
  return JSON.parse(body);
}

function parseWinterWeather(data: any, altitude: number) {
  if (!data?.hours?.length) return null;

  const hours = data.hours;
  // Average latest 6 hours for current conditions
  const recent = hours.slice(0, Math.min(6, hours.length));

  const avg = (arr: any[], key: string) => {
    const vals = arr
      .map((h: any) => {
        const entry = h[key];
        if (!entry) return null;
        // Stormglass returns multiple sources, pick sg or first available
        return entry.sg ?? entry.noaa ?? entry.smhi ?? Object.values(entry)[0];
      })
      .filter((v: any) => v !== null && v !== undefined);
    if (!vals.length) return 0;
    return vals.reduce((a: number, b: number) => a + b, 0) / vals.length;
  };

  const tempC = Math.round(avg(recent, "airTemperature"));
  // Stormglass snowDepth is in meters, convert to cm
  const snowDepthM = avg(recent, "snowDepth");
  const snowDepthCm = Math.round(snowDepthM * 100);

  // Estimate fresh snow from precipitation in last 48h
  const last48h = hours.slice(0, Math.min(48, hours.length));
  const totalPrecip = last48h.reduce((sum: number, h: any) => {
    const p = h.precipitation?.sg ?? h.precipitation?.noaa ?? 0;
    return sum + (p || 0);
  }, 0);
  // Rough: if temp < 0, precipitation is snow (10:1 ratio)
  const freshSnow48h = tempC <= 0 ? Math.round(totalPrecip * 10) : 0;

  // Freeze level from temperature profile (rough estimate from temp + altitude)
  const freezeLevel = tempC < 0 ? Math.max(0, altitude + Math.round(tempC * 150)) : altitude + 500;

  return {
    snowDepthBase: Math.max(0, snowDepthCm),
    snowDepthPeak: Math.max(0, Math.round(snowDepthCm * 1.6)),
    freshSnow48h,
    tempC,
    freezeLevel: Math.round(freezeLevel),
    recentStorm: freshSnow48h > 10,
    stormDaysAgo: freshSnow48h > 10 ? 0 : undefined,
    liftStatus: "full" as const, // Can't determine from weather API
    altitude,
  };
}

function parseSummerWeather(data: any) {
  if (!data?.hours?.length) return null;

  const hours = data.hours;
  const recent = hours.slice(0, Math.min(6, hours.length));
  const forecast7d = hours.slice(0, Math.min(168, hours.length));

  const avg = (arr: any[], key: string) => {
    const vals = arr
      .map((h: any) => {
        const entry = h[key];
        if (!entry) return null;
        return entry.sg ?? entry.noaa ?? entry.smhi ?? Object.values(entry)[0];
      })
      .filter((v: any) => v !== null && v !== undefined);
    if (!vals.length) return 0;
    return vals.reduce((a: number, b: number) => a + b, 0) / vals.length;
  };

  // Count sunny vs rainy days in forecast
  const dailyPrecip: number[] = [];
  for (let i = 0; i < 7; i++) {
    const dayHours = forecast7d.slice(i * 24, (i + 1) * 24);
    const precip = dayHours.reduce((sum: number, h: any) => {
      const p = h.precipitation?.sg ?? h.precipitation?.noaa ?? 0;
      return sum + (p || 0);
    }, 0);
    dailyPrecip.push(precip);
  }
  const rainyDays = dailyPrecip.filter((p) => p > 2).length;
  const sunnyDays = 7 - rainyDays;

  const windMs = avg(recent, "windSpeed");
  const windKnots = Math.round(windMs * 1.944);

  return {
    waterTempC: Math.round(avg(recent, "waterTemperature")),
    swellHeightM: Math.round(avg(recent, "swellHeight") * 10) / 10,
    swellPeriodS: Math.round(avg(recent, "swellPeriod")),
    windKnots,
    uvIndex: Math.round(avg(recent, "uvIndex") || 7),
    sunnyDays,
    rainyDays,
    safeSeasonFlag: true, // Determined by static registry, not weather
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { destinations } = (await req.json()) as WeatherRequest;
    const results: Record<string, any> = {};

    // Stormglass has strict rate limits (10/day free), batch carefully
    for (const dest of destinations) {
      try {
        const params =
          dest.mode === "winter"
            ? "airTemperature,snowDepth,precipitation,cloudCover"
            : "waterTemperature,swellHeight,swellPeriod,windSpeed,precipitation,uvIndex";

        const data = await fetchStormglass(dest.lat, dest.lng, params);

        results[dest.id] =
          dest.mode === "winter"
            ? parseWinterWeather(data, dest.altitude || 1800)
            : parseSummerWeather(data);
      } catch (e) {
        console.error(`Weather fetch failed for ${dest.id}:`, e);
        results[dest.id] = null;
      }
    }

    return new Response(JSON.stringify({ success: true, data: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-weather error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
