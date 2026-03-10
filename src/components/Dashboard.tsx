import { useState, useEffect, useMemo } from 'react';
import { TravelMode, getDestinations, WinterConditions, SummerConditions, calculateDIYTotal } from '@/data/destinations';
import DestinationCard from './DestinationCard';
import { ArrowLeft, Luggage, Clock, Crown, ArrowUpDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type WinterSort = 'freshSnow' | 'diyTotal' | 'vibeScore' | 'altitude';
type SummerSort = 'swellHeight' | 'diyTotal' | 'vibeScore' | 'waterTemp';

interface DashboardProps {
  mode: TravelMode;
  days: number;
  onDaysChange: (days: number) => void;
  addLuggage: boolean;
  onToggleLuggage: () => void;
  onBack: () => void;
}

const Dashboard = ({ mode, days, onDaysChange, addLuggage, onToggleLuggage, onBack }: DashboardProps) => {
  const isWinter = mode === 'winter';
  const [showPremium, setShowPremium] = useState(false);
  const [sortBy, setSortBy] = useState<string>(isWinter ? 'freshSnow' : 'swellHeight');
  const [hasShownFilterToast, setHasShownFilterToast] = useState(false);

  const allDestinations = getDestinations(mode);

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
          return calculateDIYTotal(a, days, addLuggage) - calculateDIYTotal(b, days, addLuggage);
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
              <span className="text-[10px] text-muted-foreground">/ {destinations.length} DESTINATIONS / TLV ORIGIN</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-terminal-amber">
            <Clock className="w-3 h-3" />
            <span>{hoursLeft}H WINDOW</span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="container flex items-center gap-4 py-2 border-t border-border flex-wrap">
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {destinations.map((dest) => (
            <DestinationCard
              key={dest.id}
              destination={dest}
              days={days}
              addLuggage={addLuggage}
              showPremium={showPremium}
            />
          ))}
        </div>

        <div className="text-center text-[9px] text-muted-foreground mt-6 pb-4">
          ALL DATA IS MOCKED · PRICES FOR ILLUSTRATION ONLY · THE 96-HOUR PIVOT v0.2
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
