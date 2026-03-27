// Re-export everything from the split modules for backward compat
export type { TravelMode, Destination, Flights, WinterConditions, SummerConditions, ResortConditions, NLPSentiment, SentimentSource, Costs } from './types';
export { calculateDIYTotal, calculateClubMedTotal, hasRecentSnow, isHighAltitude, isSafeSeason } from './types';
export { winterDestinations } from './winterDestinations';
export { summerDestinations } from './summerDestinations';

import { TravelMode, Destination } from './types';
import { winterDestinations } from './winterDestinations';
import { summerDestinations } from './summerDestinations';

export const getDestinations = (mode: TravelMode): Destination[] => {
  return mode === 'winter' ? winterDestinations : summerDestinations;
};
