import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TravelMode, Destination } from '@/data/types';
import { getDestinations } from '@/data/destinations';

interface FetchResult {
  success: boolean;
  data: Destination[];
  live: { flights: boolean; weather: boolean; sentiment: boolean };
}

async function fetchLiveDestinations(mode: TravelMode, days: number): Promise<FetchResult> {
  const { data, error } = await supabase.functions.invoke('fetch-destinations', {
    body: { mode, days },
  });

  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || 'Failed to fetch destinations');

  return data as FetchResult;
}

export function useDestinations(mode: TravelMode, days: number) {
  const fallback = getDestinations(mode);

  const query = useQuery({
    queryKey: ['destinations', mode, days],
    queryFn: () => fetchLiveDestinations(mode, days),
    staleTime: 15 * 60 * 1000, // 15 min cache
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    destinations: query.data?.data ?? fallback,
    isLive: query.data?.live ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isMock: !query.data?.success,
  };
}
