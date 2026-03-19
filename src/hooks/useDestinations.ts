import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TravelMode, Destination } from '@/data/types';
import { DestinationFilters } from '@/components/FilterScreen';

export interface LiveFlags {
  flights: boolean;
  weather: boolean;
  sentiment: boolean;
}

interface FetchResult {
  success: boolean;
  data: (Destination & { _liveFlights?: boolean; _liveWeather?: boolean; _liveSentiment?: boolean; effectiveDays?: number })[];
  totalAvailable: number;
  live: LiveFlags;
  lateSeason?: boolean;
}

async function fetchPage(
  mode: TravelMode, days: number, departureDate: string | undefined,
  offset: number, limit: number, filters?: DestinationFilters
): Promise<FetchResult> {
  const { data, error } = await supabase.functions.invoke('fetch-destinations', {
    body: {
      mode, days, departureDate, offset, limit,
      filters: filters ? {
        altitudeRange: filters.altitudeRange,
        countries: filters.countries,
        regions: filters.regions,
      } : undefined,
    },
  });

  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || 'Failed to fetch destinations');

  return data as FetchResult;
}

const INITIAL_LIMIT = 4;
const MORE_LIMIT = 3;

export function useDestinations(mode: TravelMode, days: number, departureDate?: string, filters?: DestinationFilters) {
  const [accumulated, setAccumulated] = useState<FetchResult['data']>([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [liveFlags, setLiveFlags] = useState<LiveFlags | null>(null);
  const [lateSeason, setLateSeason] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const offsetRef = useRef(0);

  // Reset when params change (including filters)
  const filtersKey = filters ? `${filters.altitudeRange.join('-')}-${filters.countries.join(',')}-${filters.regions.join(',')}-${filters.slopeRange.join('-')}` : 'none';
  const paramsKey = `${mode}-${days}-${departureDate}-${filtersKey}`;
  const prevParamsKey = useRef(paramsKey);

  if (prevParamsKey.current !== paramsKey) {
    prevParamsKey.current = paramsKey;
    setAccumulated([]);
    setTotalAvailable(0);
    setLiveFlags(null);
    setLateSeason(false);
    offsetRef.current = 0;
  }

  const query = useQuery({
    queryKey: ['destinations', mode, days, departureDate, filtersKey, 'initial'],
    queryFn: () => fetchPage(mode, days, departureDate, 0, INITIAL_LIMIT, filters),
    staleTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data) {
      setAccumulated(query.data.data);
      setTotalAvailable(query.data.totalAvailable);
      setLiveFlags(query.data.live);
      setLateSeason(query.data.lateSeason ?? false);
      offsetRef.current = query.data.data.length;
    }
  }, [query.data]);

  const hasMore = accumulated.length < totalAvailable;

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const result = await fetchPage(mode, days, departureDate, offsetRef.current, MORE_LIMIT, filters);
      setAccumulated(prev => [...prev, ...result.data]);
      offsetRef.current += result.data.length;
      if (result.live) {
        setLiveFlags(prev => prev ? {
          flights: prev.flights || result.live.flights,
          weather: prev.weather || result.live.weather,
          sentiment: prev.sentiment || result.live.sentiment,
        } : result.live);
      }
    } catch (e) {
      console.error('Load more failed:', e);
    } finally {
      setIsLoadingMore(false);
    }
  }, [mode, days, departureDate, filters, isLoadingMore, hasMore]);

  return {
    destinations: accumulated,
    totalAvailable,
    isLive: liveFlags,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isMock: false,
    lateSeason,
    hasMore,
    isLoadingMore,
    loadMore,
  };
}
