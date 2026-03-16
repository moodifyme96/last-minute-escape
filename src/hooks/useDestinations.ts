import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TravelMode, Destination } from '@/data/types';

export interface LiveFlags {
  flights: boolean;
  weather: boolean;
  sentiment: boolean;
}

interface FetchResult {
  success: boolean;
  data: (Destination & { _liveFlights?: boolean; _liveWeather?: boolean; _liveSentiment?: boolean; effectiveDays?: number })[];
  live: LiveFlags;
  lateSeason?: boolean;
}

async function fetchLiveDestinations(mode: TravelMode, days: number, departureDate?: string): Promise<FetchResult> {
  const { data, error } = await supabase.functions.invoke('fetch-destinations', {
    body: { mode, days, departureDate },
  });

  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || 'Failed to fetch destinations');

  return data as FetchResult;
}

export function useDestinations(mode: TravelMode, days: number, departureDate?: string) {
  const query = useQuery({
    queryKey: ['destinations', mode, days, departureDate],
    queryFn: () => fetchLiveDestinations(mode, days, departureDate),
    staleTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    destinations: query.data?.data ?? [],
    isLive: query.data?.live ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isMock: false,
    lateSeason: query.data?.lateSeason ?? false,
  };
}
