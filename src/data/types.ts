export type TravelMode = 'winter' | 'summer';

// ─── Flight Schema ───
export interface Flights {
  origin: 'TLV';
  hub: string;             // nearest airport code (GVA, MUC, TRN…)
  airportTransfer: number; // one-way transfer cost
  googleFlightsUrl: string; // deep link to Google Flights for this route
  estimatedPrice?: number | null; // round-trip flight estimate in EUR
}

// ─── Resort Conditions Schema ───
export interface WinterConditions {
  snowDepthBase: number;    // cm
  snowDepthPeak: number;    // cm
  freshSnow48h: number;    // cm fallen in last 48h — KEY for filtering
  tempC: number;
  freezeLevel: number;     // metres
  recentStorm: boolean;
  stormDaysAgo?: number;
  liftStatus: 'full' | 'partial' | 'closed';
  altitude: number;        // resort base altitude in metres
}

export interface SummerConditions {
  waterTempC: number;
  swellHeightM: number;
  swellPeriodS: number;    // seconds between swells
  windKnots: number;       // for kite
  uvIndex: number;
  sunnyDays: number;       // forecast 7d
  rainyDays: number;
  safeSeasonFlag: boolean; // false = monsoon/off-season warning
}

export type ResortConditions = WinterConditions | SummerConditions;

// ─── NLP Sentiment Schema ───
export interface SentimentSource {
  platform: string;        // e.g. "r/skiing", "Snowheads FB", "Surf-Forecast"
  snippet: string;         // one-line quote
}

export interface NLPSentiment {
  vibeScore: number;         // 0–100 composite
  summary: string;           // 2-sentence AI-generated summary
  sources: SentimentSource[]; // min 2 for triangulation
  lastUpdated: string;       // ISO timestamp
}

// ─── Cost Schema ───
export interface Costs {
  accommodationPerNight: number;
  activityCostPerDay: number;    // skipass or surf rental
  clubMedPerNight: number;       // 0 = not available
  clubMedActivityIncluded: boolean;
  carRentalPerDay?: number;      // summer only
}

// ─── Root Destination Schema ───
export interface Destination {
  id: string;
  name: string;
  country: string;         // ISO 2-letter
  region: string;          // e.g. "Alps", "Atlantic Coast"
  mode: TravelMode;
  slopeKm?: number;        // km of pistes/slopes (winter) or coastline (summer)
  flights: Flights;
  conditions: ResortConditions;
  sentiment: NLPSentiment;
  costs: Costs;
}

// ─── Computed helpers (excludes flights — user checks Google Flights separately) ───
export const calculateDIYTotal = (dest: Destination, days: number): number => {
  const f = dest.flights;
  const c = dest.costs;
  const flightCost = f.estimatedPrice || 0;
  const transfers = f.airportTransfer * 2;
  const accommodation = c.accommodationPerNight * (days - 1);
  const activity = c.activityCostPerDay * days;
  return flightCost + transfers + accommodation + activity;
};

export const calculateClubMedTotal = (dest: Destination, days: number): number => {
  if (dest.costs.clubMedPerNight === 0) return 0;
  const f = dest.flights;
  const flightCost = f.estimatedPrice || 0;
  const transfers = f.airportTransfer * 2;
  const clubMed = dest.costs.clubMedPerNight * (days - 1);
  return flightCost + transfers + clubMed;
};

// ─── Filtering helpers ───
export const hasRecentSnow = (dest: Destination): boolean => {
  if (dest.mode !== 'winter') return false;
  return (dest.conditions as WinterConditions).freshSnow48h > 0;
};

export const isHighAltitude = (dest: Destination): boolean => {
  if (dest.mode !== 'winter') return false;
  return (dest.conditions as WinterConditions).altitude >= 2000;
};

export const isSafeSeason = (dest: Destination): boolean => {
  if (dest.mode !== 'summer') return true;
  return (dest.conditions as SummerConditions).safeSeasonFlag;
};
