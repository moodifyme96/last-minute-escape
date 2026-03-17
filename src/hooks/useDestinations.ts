import { useState, useCallback, useRef, useEffect } from 'react';
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
  totalAvailable: number;
  live: LiveFlags;
  lateSeason?: boolean;
}

async function fetchPage(mode: TravelMode, days: number, departureDate: string | undefined, offset: number, limit: number): Promise<FetchResult> {
  const { data, error } = await supabase.functions.invoke('fetch-destinations', {
    body: { mode, days, departureDate, offset, limit },
  });

  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || 'Failed to fetch destinations');

  return data as FetchResult;
}

const INITIAL_LIMIT = 4;
const MORE_LIMIT = 3;

export function useDestinations(mode: TravelMode, days: number, departureDate?: string) {
  const [accumulated, setAccumulated] = useState<FetchResult['data']>([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [liveFlags, setLiveFlags] = useState<LiveFlags | null>(null);
  const [lateSeason, setLateSeason] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const offsetRef = useRef(0);

  // Reset when params change
  const paramsKey = `${mode}-${days}-${departureDate}`;
  const prevParamsKey = useRef(paramsKey);

  if (prevParamsKey.current !== paramsKey) {
    prevParamsKey.current = paramsKey;
    setAccumulated([]);
    setTotalAvailable(0);
    setLiveFlags(null);
    setLateSeason(false);
    offsetRef.current = 0;
  }

  // Initial fetch (first 4)
  const query = useQuery({
    queryKey: ['destinations', mode, days, departureDate, 'initial'],
    queryFn: () => fetchPage(mode, days, departureDate, 0, INITIAL_LIMIT),
    staleTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Sync initial results
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
      const result = await fetchPage(mode, days, departureDate, offsetRef.current, MORE_LIMIT);
      setAccumulated(prev => [...prev, ...result.data]);
      offsetRef.current += result.data.length;
      // Merge live flags (OR)
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
  }, [mode, days, departureDate, isLoadingMore, hasMore]);

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
