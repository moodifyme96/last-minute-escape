import { useState, useEffect, useMemo } from 'react';
import { TravelMode, WinterConditions, SummerConditions, calculateDIYTotal } from '@/data/destinations';
import { DestinationFilters } from '@/components/FilterScreen';
import DestinationCard from './DestinationCard';
import { ArrowLeft, Luggage, Clock, Crown, ArrowUpDown, Wifi, WifiOff, Mountain, CalendarIcon, Plus, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useDestinations } from '@/hooks/useDestinations';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

type WinterSort = 'freshSnow' | 'diyTotal' | 'vibeScore' | 'altitude';
type SummerSort = 'swellHeight' | 'diyTotal' | 'vibeScore' | 'waterTemp';

interface DashboardProps {
  mode: TravelMode;
  days: number;
  onDaysChange: (days: number) => void;
  addLuggage: boolean;
  onToggleLuggage: () => void;
  onBack: () => void;
  departureDate: Date;
  onDepartureDateChange: (date: Date) => void;
  filters: DestinationFilters;
}

const Dashboard = ({ mode, days, onDaysChange, addLuggage, onToggleLuggage, onBack, departureDate, onDepartureDateChange, filters }: DashboardProps) => {
  const isWinter = mode === 'winter';
  const [showPremium, setShowPremium] = useState(false);
  const [sortBy, setSortBy] = useState<string>(isWinter ? 'freshSnow' : 'swellHeight');
  const [hasShownFilterToast, setHasShownFilterToast] = useState(false);
  const [hasShownLiveToast, setHasShownLiveToast] = useState(false);

  const depDateStr = format(departureDate, 'yyyy-MM-dd');
  const { destinations: allDestinations, totalAvailable, isLive, isLoading, isError, error, lateSeason, hasMore, isLoadingMore, loadMore } = useDestinations(mode, days, depDateStr, filters);

  // Climate guardrail: filter out unsafe summer destinations
  const { filtered, removedCount } = useMemo(() => {
    if (isWinter) return { filtered: allDestinations, removedCount: 0 };
    const safe = allDestinations.filter(d => (d.conditions as SummerConditions).safeSeasonFlag);
    return { filtered: safe, removedCount: allDestinations.length - safe.length };
  }, [allDestinations, isWinter]);

  // Toast for filtered destinations
  useEffect(() => {
    if (!isWinter && removedCount > 0 && !hasShownFilterToast) {
      setHasShownFilterToast(true);
      toast({
        title: '⚠ Climate Guardrail Active',
        description: `Filtered out ${removedCount} destination${removedCount > 1 ? 's' : ''} due to monsoon / off-season conditions.`,
      });
    }
  }, [isWinter, removedCount, hasShownFilterToast]);

  // Toast for live data status
  useEffect(() => {
    if (!isLoading && isLive && !hasShownLiveToast) {
      setHasShownLiveToast(true);
      const liveSources = [];
      if (isLive.weather) liveSources.push('Weather');
      if (isLive.weather) liveSources.push('Weather');
      if (isLive.sentiment) liveSources.push('Sentiment');
      if (liveSources.length > 0) {
        toast({
          title: '🟢 Live Data Connected',
          description: `${liveSources.join(' · ')} — data is real-time for top destinations.`,
        });
      } else {
        toast({
          title: '🟡 Using Cached Data',
          description: 'Live APIs unavailable. Showing last-known data.',
        });
      }
    }
  }, [isLoading, isLive, hasShownLiveToast]);

  // Sort logic
  const destinations = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      switch (sortBy) {
        case 'freshSnow':
          return (b.conditions as WinterConditions).freshSnow48h - (a.conditions as WinterConditions).freshSnow48h;
        case 'altitude':
          return (b.conditions as WinterConditions).altitude - (a.conditions as WinterConditions).altitude;
        case 'swellHeight':
          return (b.conditions as SummerConditions).swellHeightM - (a.conditions as SummerConditions).swellHeightM;
        case 'waterTemp':
          return (b.conditions as SummerConditions).waterTempC - (a.conditions as SummerConditions).waterTempC;
        case 'vibeScore':
          return b.sentiment.vibeScore - a.sentiment.vibeScore;
        case 'diyTotal':
          return calculateDIYTotal(a, days) - calculateDIYTotal(b, days);
        default:
          return 0;
      }
    });
    return arr;
  }, [filtered, sortBy, days, addLuggage]);

  const now = new Date();
  const deadline = new Date(now.getTime() + 96 * 60 * 60 * 1000);
  const hoursLeft = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));

  const sortOptions = isWinter
    ? [
        { value: 'freshSnow', label: 'FRESH SNOW 48H' },
        { value: 'diyTotal', label: 'DIY TOTAL ↑' },
        { value: 'vibeScore', label: 'VIBE SCORE' },
        { value: 'altitude', label: 'ALTITUDE' },
      ]
    : [
        { value: 'swellHeight', label: 'SWELL HEIGHT' },
        { value: 'diyTotal', label: 'DIY TOTAL ↑' },
        { value: 'vibeScore', label: 'VIBE SCORE' },
        { value: 'waterTemp', label: 'WATER TEMP' },
      ];

  return (
    <div className="min-h-screen scanline">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${isWinter ? 'text-terminal-cyan' : 'text-terminal-amber'}`}>
                {isWinter ? '❄ WINTER' : '☀ SUMMER'}
              </span>
              <span className="text-[10px] text-muted-foreground">
                / {destinations.length}{totalAvailable > 0 ? ` of ${totalAvailable}` : ''} DESTINATIONS / TLV ORIGIN
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Late season indicator */}
            {lateSeason && (
              <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-sm border border-terminal-amber text-terminal-amber bg-terminal-amber/10">
                <Mountain className="w-2.5 h-2.5" />
                LATE SEASON
              </span>
            )}
            {/* Live badge */}
            {!isLoading && (
              <span className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${
                isError
                  ? 'text-terminal-red border-terminal-red bg-terminal-red/10'
                  : 'text-terminal-green border-terminal-green bg-terminal-green/10'
              }`}>
                {isError ? <WifiOff className="w-2.5 h-2.5" /> : <Wifi className="w-2.5 h-2.5" />}
                {isError ? 'OFFLINE' : 'LIVE'}
              </span>
            )}
            {/* Data source pills */}
            {!isLoading && isLive && !isError && (
              <div className="hidden md:flex items-center gap-1">
                {['weather', 'sentiment'].map(src => (
                  <span key={src} className={`text-[8px] px-1 py-0.5 rounded-sm ${
                    isLive[src as keyof typeof isLive] ? 'bg-terminal-green/10 text-terminal-green' : 'bg-muted text-muted-foreground'
                  }`}>
                    {src.toUpperCase()} {isLive[src as keyof typeof isLive] ? '●' : '○'}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[10px] text-terminal-amber">
              <Clock className="w-3 h-3" />
              <span>{hoursLeft}H WINDOW</span>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="container flex items-center gap-4 py-2 border-t border-border flex-wrap">
          {/* Departure Date */}
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-3 h-3 text-muted-foreground" />
            <div className="flex gap-1">
              {[0, 1, 2, 3].map(offset => {
                const d = addDays(startOfDay(new Date()), offset + 1);
                const isSelected = startOfDay(departureDate).getTime() === d.getTime();
                return (
                  <button
                    key={offset}
                    onClick={() => onDepartureDateChange(d)}
                    className={cn(
                      'px-1.5 py-0.5 rounded-sm text-[9px] font-bold transition-all cursor-pointer border',
                      isSelected
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border text-muted-foreground hover:border-muted-foreground'
                    )}
                  >
                    {format(d, 'dd/MM')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">DURATION:</span>
            <input
              type="range"
              min={2}
              max={14}
              value={days}
              onChange={(e) => onDaysChange(parseInt(e.target.value))}
              className="flex-1 h-1 bg-muted rounded-sm appearance-none cursor-pointer accent-primary max-w-[200px]"
            />
            <span className="text-xs font-bold text-foreground w-8">{days}D</span>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-muted border border-border text-foreground text-[10px] px-1.5 py-1 rounded-sm cursor-pointer appearance-none"
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Luggage toggle */}
          <button
            onClick={onToggleLuggage}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-sm border text-[10px] transition-all cursor-pointer ${
              addLuggage
                ? 'border-foreground text-foreground bg-muted/50'
                : 'border-border text-muted-foreground'
            }`}
          >
            <Luggage className="w-3 h-3" />
            23KG {addLuggage ? '✓' : '✗'}
          </button>

          {/* Premium toggle */}
          <button
            onClick={() => setShowPremium(v => !v)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-sm border text-[10px] transition-all cursor-pointer ${
              showPremium
                ? 'border-terminal-amber text-terminal-amber bg-terminal-amber/10'
                : 'border-border text-muted-foreground'
            }`}
          >
            <Crown className="w-3 h-3" />
            PREMIUM {showPremium ? '✓' : '✗'}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="container py-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-border rounded-sm p-3 space-y-3"
              >
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-12 w-full" />
              </motion.div>
            ))}
          </div>
        ) : isError || destinations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <WifiOff className={`w-12 h-12 mb-4 ${isWinter ? 'text-terminal-cyan/30' : 'text-terminal-amber/30'}`} />
            <h2 className="text-lg font-bold text-foreground mb-2">Data Unavailable</h2>
            <p className="text-sm text-muted-foreground max-w-md mb-1">
              {isError
                ? 'Live data APIs could not be reached. This could be due to rate limits, network issues, or service downtime.'
                : 'No destination data was returned for this configuration.'}
            </p>
            {error && (
              <p className="text-[10px] text-terminal-red mt-2 font-mono max-w-md truncate">
                {error.message}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground mt-4">
              Try again in a few minutes or adjust your departure date.
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06 } },
              }}
            >
              <AnimatePresence mode="popLayout">
                {destinations.map((dest) => (
                  <motion.div
                    key={dest.id}
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 24, scale: 0.97 },
                      visible: { opacity: 1, y: 0, scale: 1 },
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    <DestinationCard
                      destination={dest}
                      days={days}
                      showPremium={showPremium}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Find More Button */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center mt-6"
              >
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className={cn(
                    'flex items-center gap-2 px-6 py-2.5 rounded-sm border text-xs font-bold tracking-wider transition-all cursor-pointer',
                    isWinter
                      ? 'border-terminal-cyan text-terminal-cyan hover:bg-terminal-cyan/10'
                      : 'border-terminal-amber text-terminal-amber hover:bg-terminal-amber/10',
                    isLoadingMore && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      SEARCHING...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      FIND MORE
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="text-center text-[9px] text-muted-foreground mt-6 pb-4 space-y-1">
          <div>
            LIVE DATA · PRICES IN EUR (EXCL. FLIGHTS) ·{' '}
            {isLive && (
              <>
                {isLive.weather && 'SNOW-FORECAST · OPEN-METEO '}
                {isLive.sentiment && '· AI SENTIMENT '}
                · FLIGHTS VIA GOOGLE FLIGHTS ·{' '}
              </>
            )}
            THE 96-HOUR PIVOT v1.0
          </div>
          {lateSeason && (
            <div className="text-terminal-amber">
              ▸ LATE SEASON MODE: HIGH-ALTITUDE RESORTS PRIORITIZED
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
