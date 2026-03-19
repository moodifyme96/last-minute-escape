import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Destination Registry (same as fetch-destinations) ───
interface RegistryEntry {
  name: string; country: string; region: string;
  seasons: ("winter" | "summer")[];
  hubs: string[];
  lat: number; lng: number; altitude?: number;
  slopeKm?: number;
  transferMinutes: number[];
  conditionSearchQueries: string[];
  pricingSearchQueries: string[];
  sentimentSearchTerms: string[];
  safeMonths?: number[];
  defaultCosts: {
    accommodationPerNight: number; activityCostPerDay: number;
    clubMedPerNight: number; clubMedActivityIncluded: boolean;
    carRentalPerDay?: number;
  };
}

const REGISTRY: Record<string, RegistryEntry> = {
  w1:  { name: "Val Thorens", country: "FR", region: "Alps", seasons: ["winter"], hubs: ["LYS", "GVA"], lat: 45.298, lng: 6.580, altitude: 2300, slopeKm: 600, transferMinutes: [150, 180],
    conditionSearchQueries: ["Val Thorens snow report today conditions", "Val Thorens enneigement bulletin neige"],
    pricingSearchQueries: ["Val Thorens ski pass price 2025 daily tarif forfait", "Val Thorens hotel apartment price per night March"],
    sentimentSearchTerms: ["Val Thorens snow conditions review this week"],
    defaultCosts: { accommodationPerNight: 95, activityCostPerDay: 72, clubMedPerNight: 285, clubMedActivityIncluded: true } },
  w2:  { name: "Innsbruck (Nordkette)", country: "AT", region: "Alps", seasons: ["winter"], hubs: ["INN", "MUC"], lat: 47.260, lng: 11.394, altitude: 1800, transferMinutes: [15, 120],
    conditionSearchQueries: ["Innsbruck Nordkette Schneebericht snow report today", "Nordkette ski conditions current"],
    pricingSearchQueries: ["Nordkette ski pass price 2025 Tageskarte", "Innsbruck hotel price per night"],
    sentimentSearchTerms: ["Innsbruck Nordkette ski conditions review"],
    defaultCosts: { accommodationPerNight: 85, activityCostPerDay: 56, clubMedPerNight: 260, clubMedActivityIncluded: true } },
  w3:  { name: "Chamonix", country: "FR", region: "Alps", seasons: ["winter"], hubs: ["GVA", "LYS"], lat: 45.924, lng: 6.870, altitude: 2400, transferMinutes: [80, 180],
    conditionSearchQueries: ["Chamonix snow report today bulletin neige", "Chamonix Mont Blanc ski conditions avalanche"],
    pricingSearchQueries: ["Chamonix Mont Blanc ski pass price 2025 forfait journée", "Chamonix accommodation price per night March"],
    sentimentSearchTerms: ["Chamonix snow conditions avalanche report review"],
    defaultCosts: { accommodationPerNight: 115, activityCostPerDay: 68, clubMedPerNight: 310, clubMedActivityIncluded: true } },
  w4:  { name: "Zermatt", country: "CH", region: "Alps", seasons: ["winter"], hubs: ["ZRH", "GVA"], lat: 46.020, lng: 7.749, altitude: 2600, transferMinutes: [210, 240],
    conditionSearchQueries: ["Zermatt snow report today Schneebericht", "Zermatt Matterhorn glacier paradise conditions"],
    pricingSearchQueries: ["Zermatt ski pass price 2025 Tageskarte CHF EUR", "Zermatt hotel apartment price per night"],
    sentimentSearchTerms: ["Zermatt ski conditions piste review"],
    defaultCosts: { accommodationPerNight: 170, activityCostPerDay: 85, clubMedPerNight: 380, clubMedActivityIncluded: true } },
  w5:  { name: "St. Anton", country: "AT", region: "Alps", seasons: ["winter"], hubs: ["INN", "ZRH"], lat: 47.128, lng: 10.268, altitude: 1800, transferMinutes: [75, 150],
    conditionSearchQueries: ["St Anton am Arlberg snow report today Schneebericht", "St Anton ski conditions current"],
    pricingSearchQueries: ["St Anton Arlberg ski pass price 2025 Tageskarte", "St Anton hotel apartment price per night"],
    sentimentSearchTerms: ["St Anton am Arlberg snow conditions review"],
    defaultCosts: { accommodationPerNight: 95, activityCostPerDay: 62, clubMedPerNight: 270, clubMedActivityIncluded: true } },
  w6:  { name: "Bansko", country: "BG", region: "Balkans", seasons: ["winter"], hubs: ["SOF"], lat: 41.838, lng: 23.489, altitude: 1400, transferMinutes: [150],
    conditionSearchQueries: ["Bansko snow report today conditions Bulgaria", "Bansko ski conditions current snow depth"],
    pricingSearchQueries: ["Bansko ski pass price 2025 daily lift ticket", "Bansko hotel apartment price per night March"],
    sentimentSearchTerms: ["Bansko ski conditions review Bulgaria"],
    defaultCosts: { accommodationPerNight: 35, activityCostPerDay: 35, clubMedPerNight: 155, clubMedActivityIncluded: true } },
  w7:  { name: "Livigno", country: "IT", region: "Alps", seasons: ["winter"], hubs: ["MXP", "INN"], lat: 46.538, lng: 10.136, altitude: 1800, transferMinutes: [210, 180],
    conditionSearchQueries: ["Livigno snow report today bollettino neve", "Livigno ski conditions snowpark current"],
    pricingSearchQueries: ["Livigno skipass price 2025 giornaliero", "Livigno hotel apartment price per night"],
    sentimentSearchTerms: ["Livigno snow conditions snowpark review"],
    defaultCosts: { accommodationPerNight: 75, activityCostPerDay: 48, clubMedPerNight: 220, clubMedActivityIncluded: true } },
  w8:  { name: "Gudauri", country: "GE", region: "Caucasus", seasons: ["winter"], hubs: ["TBS"], lat: 42.458, lng: 44.470, altitude: 2200, transferMinutes: [120],
    conditionSearchQueries: ["Gudauri snow report today conditions Georgia", "Gudauri ski conditions freeride current"],
    pricingSearchQueries: ["Gudauri ski pass price 2025 lift ticket GEL EUR", "Gudauri hotel guesthouse price per night"],
    sentimentSearchTerms: ["Gudauri snow conditions freeride report review"],
    defaultCosts: { accommodationPerNight: 40, activityCostPerDay: 20, clubMedPerNight: 0, clubMedActivityIncluded: false } },
  w9:  { name: "Verbier", country: "CH", region: "Alps", seasons: ["winter"], hubs: ["GVA", "ZRH"], lat: 46.096, lng: 7.228, altitude: 2200, transferMinutes: [120, 180],
    conditionSearchQueries: ["Verbier snow report today bulletin neige", "Verbier 4 Vallées ski conditions current"],
    pricingSearchQueries: ["Verbier ski pass price 2025 4 Vallées forfait journée CHF", "Verbier hotel apartment price per night"],
    sentimentSearchTerms: ["Verbier snow conditions Mont Fort review"],
    defaultCosts: { accommodationPerNight: 185, activityCostPerDay: 78, clubMedPerNight: 395, clubMedActivityIncluded: true } },
  w10: { name: "Grandvalira (Soldeu)", country: "AD", region: "Pyrenees", seasons: ["winter"], hubs: ["BCN", "TLS"], lat: 42.576, lng: 1.668, altitude: 1710, transferMinutes: [180, 150],
    conditionSearchQueries: ["Grandvalira Soldeu snow report today Andorra", "Grandvalira ski conditions current snow depth"],
    pricingSearchQueries: ["Grandvalira ski pass price 2025 forfait journée", "Soldeu Andorra hotel apartment price per night"],
    sentimentSearchTerms: ["Grandvalira Soldeu Andorra snow conditions review"],
    defaultCosts: { accommodationPerNight: 70, activityCostPerDay: 52, clubMedPerNight: 235, clubMedActivityIncluded: true } },
  w11: { name: "Tignes", country: "FR", region: "Alps", seasons: ["winter"], hubs: ["LYS", "GVA"], lat: 45.468, lng: 6.907, altitude: 2100, transferMinutes: [150, 180],
    conditionSearchQueries: ["Tignes snow report today bulletin neige Espace Killy", "Tignes ski conditions current"],
    pricingSearchQueries: ["Tignes ski pass price 2025 Espace Killy forfait journée", "Tignes hotel apartment price per night March"],
    sentimentSearchTerms: ["Tignes Espace Killy snow conditions review"],
    defaultCosts: { accommodationPerNight: 90, activityCostPerDay: 68, clubMedPerNight: 290, clubMedActivityIncluded: true } },
  w12: { name: "Kitzbühel", country: "AT", region: "Alps", seasons: ["winter"], hubs: ["SZG", "MUC", "INN"], lat: 47.449, lng: 12.392, altitude: 1600, transferMinutes: [80, 120, 100],
    conditionSearchQueries: ["Kitzbühel snow report today Schneebericht", "Kitzbühel ski conditions current snow depth"],
    pricingSearchQueries: ["Kitzbühel ski pass price 2025 Tageskarte", "Kitzbühel hotel apartment price per night"],
    sentimentSearchTerms: ["Kitzbühel snow report ski conditions review"],
    defaultCosts: { accommodationPerNight: 110, activityCostPerDay: 60, clubMedPerNight: 275, clubMedActivityIncluded: true } },
  w13: { name: "Borovets", country: "BG", region: "Balkans", seasons: ["winter"], hubs: ["SOF"], lat: 42.265, lng: 23.608, altitude: 1300, transferMinutes: [75],
    conditionSearchQueries: ["Borovets snow report today conditions Bulgaria", "Borovets ski conditions current"],
    pricingSearchQueries: ["Borovets ski pass price 2025 lift ticket", "Borovets hotel price per night"],
    sentimentSearchTerms: ["Borovets snow conditions Bulgaria ski review"],
    defaultCosts: { accommodationPerNight: 30, activityCostPerDay: 28, clubMedPerNight: 140, clubMedActivityIncluded: true } },
  w14: { name: "Cervinia", country: "IT", region: "Alps", seasons: ["winter"], hubs: ["TRN", "MXP"], lat: 45.934, lng: 7.631, altitude: 2500, transferMinutes: [120, 150],
    conditionSearchQueries: ["Cervinia snow report today bollettino neve", "Cervinia Plateau Rosa ski conditions current"],
    pricingSearchQueries: ["Cervinia skipass price 2025 giornaliero", "Cervinia hotel apartment price per night"],
    sentimentSearchTerms: ["Cervinia snow conditions Plateau Rosa review"],
    defaultCosts: { accommodationPerNight: 90, activityCostPerDay: 62, clubMedPerNight: 265, clubMedActivityIncluded: true } },
  w15: { name: "Jasná", country: "SK", region: "Carpathians", seasons: ["winter"], hubs: ["VIE", "BUD"], lat: 48.955, lng: 19.586, altitude: 1900, transferMinutes: [240, 210],
    conditionSearchQueries: ["Jasná Low Tatras snow report today conditions", "Jasná ski conditions current snow depth"],
    pricingSearchQueries: ["Jasná ski pass price 2025 skipass denný", "Jasná hotel apartment price per night"],
    sentimentSearchTerms: ["Jasná Low Tatras snow conditions ski review"],
    defaultCosts: { accommodationPerNight: 45, activityCostPerDay: 38, clubMedPerNight: 175, clubMedActivityIncluded: true } },
  w16: { name: "Åre", country: "SE", region: "Scandinavia", seasons: ["winter"], hubs: ["ARN", "OSL"], lat: 63.399, lng: 13.080, altitude: 1274, transferMinutes: [360, 420],
    conditionSearchQueries: ["Åre Sweden snow report today snörapport", "Åre ski conditions current"],
    pricingSearchQueries: ["Åre ski pass price 2025 dagspass SEK", "Åre hotel apartment price per night"],
    sentimentSearchTerms: ["Åre Sweden snow conditions ski review"],
    defaultCosts: { accommodationPerNight: 110, activityCostPerDay: 58, clubMedPerNight: 0, clubMedActivityIncluded: false } },
  w17: { name: "Hintertux", country: "AT", region: "Alps", seasons: ["winter"], hubs: ["INN", "MUC"], lat: 47.060, lng: 11.660, altitude: 3250, transferMinutes: [90, 150],
    conditionSearchQueries: ["Hintertux glacier snow report today Schneebericht", "Hintertux Gletscher ski conditions current"],
    pricingSearchQueries: ["Hintertux glacier ski pass price 2025 Tageskarte", "Hintertux hotel apartment price per night"],
    sentimentSearchTerms: ["Hintertux glacier ski conditions snow review"],
    defaultCosts: { accommodationPerNight: 100, activityCostPerDay: 58, clubMedPerNight: 0, clubMedActivityIncluded: false } },
  s1:  { name: "Peniche", country: "PT", region: "Atlantic Coast", seasons: ["summer"], hubs: ["LIS"], lat: 39.356, lng: -9.381, transferMinutes: [75],
    conditionSearchQueries: ["Peniche surf report today Supertubos", "Peniche Portugal weather conditions today"],
    pricingSearchQueries: ["Peniche surf rental price per day board wetsuit", "Peniche Portugal accommodation price per night"],
    sentimentSearchTerms: ["Peniche surf conditions Supertubos review"],
    safeMonths: [4,5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 55, activityCostPerDay: 35, clubMedPerNight: 195, clubMedActivityIncluded: true, carRentalPerDay: 25 } },
  s2:  { name: "Tarifa", country: "ES", region: "Mediterranean", seasons: ["summer"], hubs: ["AGP", "SVQ"], lat: 36.014, lng: -5.604, transferMinutes: [120, 150],
    conditionSearchQueries: ["Tarifa wind report today kitesurf conditions", "Tarifa Spain weather today"],
    pricingSearchQueries: ["Tarifa kitesurf rental price per day equipment", "Tarifa hotel apartment price per night"],
    sentimentSearchTerms: ["Tarifa kitesurf wind conditions review"],
    safeMonths: [4,5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 65, activityCostPerDay: 45, clubMedPerNight: 220, clubMedActivityIncluded: true, carRentalPerDay: 30 } },
  s3:  { name: "Dahab", country: "EG", region: "Red Sea", seasons: ["summer"], hubs: ["SSH"], lat: 28.500, lng: 34.513, transferMinutes: [60],
    conditionSearchQueries: ["Dahab wind conditions today kitesurf diving", "Dahab Egypt weather today"],
    pricingSearchQueries: ["Dahab kitesurf rental price per day", "Dahab hotel price per night"],
    sentimentSearchTerms: ["Dahab wind kitesurf diving conditions review"],
    safeMonths: [1,2,3,4,5,6,9,10,11,12], defaultCosts: { accommodationPerNight: 25, activityCostPerDay: 20, clubMedPerNight: 0, clubMedActivityIncluded: false, carRentalPerDay: 15 } },
  s4:  { name: "Essaouira", country: "MA", region: "Atlantic Coast", seasons: ["summer"], hubs: ["ESS", "RAK"], lat: 31.513, lng: -9.770, transferMinutes: [15, 150],
    conditionSearchQueries: ["Essaouira wind surf conditions today", "Essaouira Morocco weather today"],
    pricingSearchQueries: ["Essaouira windsurf rental price per day", "Essaouira hotel riad price per night"],
    sentimentSearchTerms: ["Essaouira wind surf conditions review"],
    safeMonths: [3,4,5,6,7,8,9,10,11], defaultCosts: { accommodationPerNight: 35, activityCostPerDay: 25, clubMedPerNight: 165, clubMedActivityIncluded: true, carRentalPerDay: 20 } },
  s5:  { name: "Biarritz", country: "FR", region: "Atlantic Coast", seasons: ["summer"], hubs: ["BIQ", "BOD"], lat: 43.483, lng: -1.558, transferMinutes: [5, 120],
    conditionSearchQueries: ["Biarritz surf report today Grande Plage", "Biarritz France weather conditions today"],
    pricingSearchQueries: ["Biarritz surf lesson rental price per day", "Biarritz hotel price per night"],
    sentimentSearchTerms: ["Biarritz surf conditions Grande Plage review"],
    safeMonths: [5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 100, activityCostPerDay: 40, clubMedPerNight: 275, clubMedActivityIncluded: true, carRentalPerDay: 35 } },
  s6:  { name: "Ericeira", country: "PT", region: "Atlantic Coast", seasons: ["summer"], hubs: ["LIS"], lat: 38.963, lng: -9.415, transferMinutes: [50],
    conditionSearchQueries: ["Ericeira surf report today conditions", "Ericeira Portugal weather today"],
    pricingSearchQueries: ["Ericeira surf rental price per day board", "Ericeira accommodation price per night"],
    sentimentSearchTerms: ["Ericeira surf conditions WSR review"],
    safeMonths: [4,5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 60, activityCostPerDay: 30, clubMedPerNight: 210, clubMedActivityIncluded: true, carRentalPerDay: 22 } },
  s7:  { name: "Fuerteventura", country: "ES", region: "Canary Islands", seasons: ["summer"], hubs: ["FUE"], lat: 28.359, lng: -14.053, transferMinutes: [20],
    conditionSearchQueries: ["Fuerteventura surf wind report today", "Fuerteventura weather conditions today"],
    pricingSearchQueries: ["Fuerteventura surf rental price per day", "Fuerteventura hotel price per night"],
    sentimentSearchTerms: ["Fuerteventura surf wind conditions review"],
    safeMonths: [1,2,3,4,5,6,7,8,9,10,11,12], defaultCosts: { accommodationPerNight: 55, activityCostPerDay: 30, clubMedPerNight: 190, clubMedActivityIncluded: true, carRentalPerDay: 20 } },
  s8:  { name: "Zanzibar", country: "TZ", region: "Indian Ocean", seasons: ["summer"], hubs: ["ZNZ", "DAR"], lat: -6.165, lng: 39.202, transferMinutes: [20, 90],
    conditionSearchQueries: ["Zanzibar kitesurf conditions Paje today", "Zanzibar weather today"],
    pricingSearchQueries: ["Zanzibar Paje kitesurf rental price per day", "Zanzibar hotel price per night"],
    sentimentSearchTerms: ["Zanzibar kitesurf conditions Paje beach review"],
    safeMonths: [6,7,8,9,10,1,2], defaultCosts: { accommodationPerNight: 45, activityCostPerDay: 35, clubMedPerNight: 250, clubMedActivityIncluded: true, carRentalPerDay: 18 } },
  s9:  { name: "Hossegor", country: "FR", region: "Atlantic Coast", seasons: ["summer"], hubs: ["BIQ", "BOD"], lat: 43.664, lng: -1.441, transferMinutes: [25, 120],
    conditionSearchQueries: ["Hossegor surf report today La Gravière", "Hossegor weather conditions today"],
    pricingSearchQueries: ["Hossegor surf rental price per day", "Hossegor hotel price per night"],
    sentimentSearchTerms: ["Hossegor surf conditions La Gravière review"],
    safeMonths: [5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 85, activityCostPerDay: 35, clubMedPerNight: 260, clubMedActivityIncluded: true, carRentalPerDay: 30 } },
  s10: { name: "Sagres", country: "PT", region: "Atlantic Coast", seasons: ["summer"], hubs: ["FAO"], lat: 37.009, lng: -8.940, transferMinutes: [75],
    conditionSearchQueries: ["Sagres surf report today Algarve", "Sagres Portugal weather today"],
    pricingSearchQueries: ["Sagres surf rental price per day", "Sagres hotel price per night"],
    sentimentSearchTerms: ["Sagres surf conditions Algarve review"],
    safeMonths: [4,5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 55, activityCostPerDay: 28, clubMedPerNight: 185, clubMedActivityIncluded: true, carRentalPerDay: 22 } },
  s11: { name: "Taghazout", country: "MA", region: "Atlantic Coast", seasons: ["summer"], hubs: ["AGA"], lat: 30.545, lng: -9.714, transferMinutes: [30],
    conditionSearchQueries: ["Taghazout surf report today Anchor Point", "Taghazout Morocco weather today"],
    pricingSearchQueries: ["Taghazout surf rental price per day", "Taghazout hotel riad price per night"],
    sentimentSearchTerms: ["Taghazout surf conditions Anchor Point review"],
    safeMonths: [1,2,3,4,5,9,10,11,12], defaultCosts: { accommodationPerNight: 30, activityCostPerDay: 22, clubMedPerNight: 155, clubMedActivityIncluded: true, carRentalPerDay: 15 } },
  s12: { name: "Crete", country: "GR", region: "Mediterranean", seasons: ["summer"], hubs: ["HER"], lat: 35.240, lng: 24.470, transferMinutes: [30],
    conditionSearchQueries: ["Crete beach weather conditions today", "Crete Greece sea temperature today"],
    pricingSearchQueries: ["Crete water sports rental price per day", "Crete hotel price per night"],
    sentimentSearchTerms: ["Crete beach conditions weather hiking review"],
    safeMonths: [4,5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 65, activityCostPerDay: 25, clubMedPerNight: 230, clubMedActivityIncluded: true, carRentalPerDay: 25 } },
  s13: { name: "Sardinia", country: "IT", region: "Mediterranean", seasons: ["summer"], hubs: ["CAG", "OLB"], lat: 39.224, lng: 9.122, transferMinutes: [30, 45],
    conditionSearchQueries: ["Sardinia windsurf conditions today", "Sardinia weather today sea conditions"],
    pricingSearchQueries: ["Sardinia windsurf rental price per day", "Sardinia hotel price per night"],
    sentimentSearchTerms: ["Sardinia windsurf conditions beach review"],
    safeMonths: [5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 80, activityCostPerDay: 35, clubMedPerNight: 245, clubMedActivityIncluded: true, carRentalPerDay: 28 } },
  s14: { name: "Lanzarote", country: "ES", region: "Canary Islands", seasons: ["summer"], hubs: ["ACE"], lat: 29.036, lng: -13.630, transferMinutes: [15],
    conditionSearchQueries: ["Lanzarote surf report today Famara", "Lanzarote weather conditions today"],
    pricingSearchQueries: ["Lanzarote surf rental price per day Famara", "Lanzarote hotel price per night"],
    sentimentSearchTerms: ["Lanzarote surf conditions Famara review"],
    safeMonths: [1,2,3,4,5,6,7,8,9,10,11,12], defaultCosts: { accommodationPerNight: 60, activityCostPerDay: 30, clubMedPerNight: 200, clubMedActivityIncluded: true, carRentalPerDay: 20 } },
  s15: { name: "Split", country: "HR", region: "Mediterranean", seasons: ["summer"], hubs: ["SPU", "ZAG"], lat: 43.508, lng: 16.440, transferMinutes: [20, 240],
    conditionSearchQueries: ["Split Croatia sea conditions today", "Split weather today"],
    pricingSearchQueries: ["Split Croatia water sports rental price", "Split hotel price per night"],
    sentimentSearchTerms: ["Split Croatia sea conditions summer review"],
    safeMonths: [5,6,7,8,9,10], defaultCosts: { accommodationPerNight: 60, activityCostPerDay: 30, clubMedPerNight: 210, clubMedActivityIncluded: true, carRentalPerDay: 25 } },
};

// ─── Firecrawl Search ───
async function firecrawlSearch(query: string, fcKey: string, limit = 3) {
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${fcKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit, scrapeOptions: { formats: ["markdown"], onlyMainContent: true } }),
    });
    if (!res.ok) { await res.text(); return []; }
    const data = await res.json();
    return (data?.data || []).map((r: any) => ({
      url: r.url || "", title: r.title || "", description: r.description || "", markdown: r.markdown?.slice(0, 2000) || "",
    }));
  } catch (e) { console.error("Firecrawl search error:", e); return []; }
}

// ─── Enrichment: Firecrawl → LLM extraction for a batch ───
async function enrichBatch(
  destinations: { id: string; name: string; country: string; mode: string; altitude?: number;
    conditionQueries: string[]; pricingQueries: string[] }[],
  fcKey: string, aiKey: string
): Promise<Record<string, { conditions: any; costs: any; conditionSources: string[]; pricingSources: string[] }>> {
  const isWinter = destinations[0]?.mode === "winter";
  const today = new Date().toISOString().split("T")[0];

  // Firecrawl scrape — 2 queries per destination, batched
  const scrapedData: Record<string, { conditionResults: any[]; pricingResults: any[]; conditionSources: string[]; pricingSources: string[] }> = {};
  for (let i = 0; i < destinations.length; i += 4) {
    const batch = destinations.slice(i, i + 4);
    const promises = batch.flatMap(d => [
      firecrawlSearch(d.conditionQueries[0], fcKey, 2).then(results => ({ id: d.id, type: "conditions" as const, results })),
      firecrawlSearch(d.pricingQueries[0], fcKey, 2).then(results => ({ id: d.id, type: "pricing" as const, results })),
    ]);
    const batchResults = await Promise.all(promises);
    for (const r of batchResults) {
      if (!scrapedData[r.id]) scrapedData[r.id] = { conditionResults: [], pricingResults: [], conditionSources: [], pricingSources: [] };
      if (r.type === "conditions") {
        scrapedData[r.id].conditionResults = r.results;
        scrapedData[r.id].conditionSources = r.results.map((x: any) => { try { return new URL(x.url || "https://unknown.com").hostname.replace("www.", ""); } catch { return ""; } }).filter(Boolean);
      } else {
        scrapedData[r.id].pricingResults = r.results;
        scrapedData[r.id].pricingSources = r.results.map((x: any) => { try { return new URL(x.url || "https://unknown.com").hostname.replace("www.", ""); } catch { return ""; } }).filter(Boolean);
      }
    }
    if (i + 4 < destinations.length) await new Promise(r => setTimeout(r, 500));
  }

  console.log(`Firecrawl scraped ${Object.keys(scrapedData).length}/${destinations.length} destinations`);

  // LLM extraction
  const destPrompts = destinations.map(d => {
    const scraped = scrapedData[d.id];
    const conditionText = scraped?.conditionResults?.map((r: any) =>
      `SOURCE: ${r.url}\nTITLE: ${r.title}\nCONTENT: ${(r.markdown || r.description || "").slice(0, 1500)}`
    ).join("\n---\n") || "NO DATA FOUND";
    const pricingText = scraped?.pricingResults?.map((r: any) =>
      `SOURCE: ${r.url}\nTITLE: ${r.title}\nCONTENT: ${(r.markdown || r.description || "").slice(0, 1500)}`
    ).join("\n---\n") || "NO DATA FOUND";
    return `## ${d.id}: ${d.name}, ${d.country}${d.altitude ? ` (${d.altitude}m)` : ""}\n\n### Current Conditions Data:\n${conditionText}\n\n### Pricing Data:\n${pricingText}`;
  }).join("\n\n========\n\n");

  const winterSchema = {
    type: "object",
    properties: {
      snowDepthBase: { type: "number" }, snowDepthPeak: { type: "number" },
      freshSnow48h: { type: "number" }, tempC: { type: "number" },
      freezeLevel: { type: "number" }, recentStorm: { type: "boolean" },
      liftStatus: { type: "string", enum: ["full", "partial", "closed"] },
      dataConfidence: { type: "string", enum: ["high", "medium", "low"] },
    },
    required: ["snowDepthBase", "snowDepthPeak", "freshSnow48h", "tempC", "freezeLevel", "recentStorm", "liftStatus", "dataConfidence"],
  };
  const summerSchema = {
    type: "object",
    properties: {
      waterTempC: { type: "number" }, swellHeightM: { type: "number" },
      swellPeriodS: { type: "number" }, windKnots: { type: "number" },
      uvIndex: { type: "number" }, sunnyDays: { type: "number" },
      rainyDays: { type: "number" },
      dataConfidence: { type: "string", enum: ["high", "medium", "low"] },
    },
    required: ["waterTempC", "swellHeightM", "swellPeriodS", "windKnots", "uvIndex", "sunnyDays", "rainyDays", "dataConfidence"],
  };

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You are a data EXTRACTION engine. Extract structured data from web-scraped content.\nRULES:\n1. ONLY extract explicitly stated data.\n2. If no data found, set dataConfidence to "low" and use reasonable estimates.\n3. For pricing: extract EXACT prices. Convert to EUR (CHF×1.07, GBP×1.17, SEK×0.088, BGN×0.51, GEL×0.34).\n4. Do NOT invent data.` },
          { role: "user", content: `Today is ${today}. Extract structured data:\n\n${destPrompts}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "set_destination_data",
            description: "Set extracted conditions and costs for all destinations",
            parameters: {
              type: "object",
              properties: {
                destinations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      conditions: isWinter ? winterSchema : summerSchema,
                      costs: {
                        type: "object",
                        properties: {
                          accommodationPerNight: { type: "number" }, activityCostPerDay: { type: "number" },
                          clubMedPerNight: { type: "number" }, clubMedActivityIncluded: { type: "boolean" },
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

    if (!res.ok) { console.error("LLM extraction error:", res.status, await res.text()); return {}; }
    const data = await res.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) { console.error("LLM returned no tool call"); return {}; }

    const parsed = JSON.parse(toolCall.function.arguments);
    const result: Record<string, { conditions: any; costs: any; conditionSources: string[]; pricingSources: string[] }> = {};
    for (const d of parsed.destinations || []) {
      if (d.id && d.conditions && d.costs) {
        const scraped = scrapedData[d.id];
        result[d.id] = { conditions: d.conditions, costs: d.costs, conditionSources: scraped?.conditionSources || [], pricingSources: scraped?.pricingSources || [] };
      }
    }
    console.log(`LLM extracted ${Object.keys(result).length}/${destinations.length}`);
    return result;
  } catch (e) { console.error("Enrichment failed:", e); return {}; }
}

// ─── Sentiment batch ───
async function fetchSentimentBatch(dests: { id: string; name: string; mode: string; sentimentTerms: string[] }[], fcKey: string, aiKey: string) {
  const results: Record<string, any> = {};

  async function processDest(d: typeof dests[0]) {
    try {
      const res = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: { Authorization: `Bearer ${fcKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query: d.sentimentTerms[0], limit: 3, tbs: "qdr:m" }),
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
                { role: "user", content: `Analyze these snippets about ${d.name} for ${activity}:\n${snippets.map((s, i) => `${i + 1}. ${s.slice(0, 200)}`).join("\n")}\n\nReturn JSON: {"vibeScore": <0-100>, "summary": "<2 sentences max, practical info>"}` },
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

  for (let i = 0; i < dests.length; i += 5) {
    await Promise.all(dests.slice(i, i + 5).map(processDest));
  }
  return results;
}

// ─── Main sync handler ───
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const fcKey = Deno.env.get("FIRECRAWL_API_KEY");
    const aiKey = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!fcKey || !aiKey) {
      return new Response(JSON.stringify({ success: false, error: "Missing API keys" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Optionally accept mode filter; default = sync both
    let body: any = {};
    try { body = await req.json(); } catch { /* empty body is fine */ }
    const modeFilter: string | undefined = body?.mode;

    const entries = Object.entries(REGISTRY).filter(([_, v]) => {
      if (modeFilter) return v.seasons.includes(modeFilter as any);
      return true;
    });

    console.log(`Starting sync for ${entries.length} destinations${modeFilter ? ` (${modeFilter} only)` : ""}`);

    // Process in batches of 4 to avoid Firecrawl rate limits
    // Process in batches of 2 (smaller = better LLM extraction reliability)
    const BATCH = 2;
    let totalSynced = 0;

    for (let i = 0; i < entries.length; i += BATCH) {
      const batch = entries.slice(i, i + BATCH);
      const mode = batch[0][1].seasons[0];

      // Step 1: Enrichment (conditions + pricing via Firecrawl → LLM)
      const enrichDests = batch.map(([id, v]) => ({
        id, name: v.name, country: v.country, mode,
        altitude: v.altitude,
        conditionQueries: v.conditionSearchQueries,
        pricingQueries: v.pricingSearchQueries,
      }));

      const groundedData = await enrichBatch(enrichDests, fcKey, aiKey);

      // Step 2: Sentiment AFTER enrichment (sequential to avoid Firecrawl rate limits)
      const sentimentDests = batch.map(([id, v]) => ({
        id, name: v.name, mode, sentimentTerms: v.sentimentSearchTerms,
      }));
      await new Promise(r => setTimeout(r, 1000)); // breathe before sentiment
      const sentimentData = await fetchSentimentBatch(sentimentDests, fcKey, aiKey);

      // Upsert each destination
      for (const [id, reg] of batch) {
        const enriched = groundedData[id];
        const sentiment = sentimentData[id];
        const destMode = reg.seasons[0];

        const row = {
          id,
          mode: destMode,
          name: reg.name,
          country: reg.country,
          region: reg.region,
          conditions: enriched?.conditions || {},
          costs: enriched?.costs || reg.defaultCosts,
          sentiment: sentiment || { vibeScore: 0, summary: "No data available.", sources: [], lastUpdated: new Date().toISOString() },
          condition_sources: enriched?.conditionSources || [],
          pricing_sources: enriched?.pricingSources || [],
          data_confidence: enriched?.conditions?.dataConfidence || "low",
          synced_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("destination_conditions").upsert(row, { onConflict: "id" });
        if (error) {
          console.error(`Upsert error for ${id}:`, error);
        } else {
          totalSynced++;
          console.log(`✓ Synced ${id}: ${reg.name} (confidence: ${row.data_confidence}, vibe: ${(sentiment?.vibeScore || 0)})`);
        }
      }

      // Pause between batches
      if (i + BATCH < entries.length) {
        console.log(`Pausing... (${totalSynced}/${entries.length} done)`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    console.log(`Sync complete: ${totalSynced}/${entries.length} destinations`);

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
