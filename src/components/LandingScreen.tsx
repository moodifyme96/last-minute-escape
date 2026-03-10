import { TravelMode } from '@/data/destinations';
import { Snowflake, Sun, Luggage, Clock } from 'lucide-react';

interface LandingScreenProps {
  onSelectMode: (mode: TravelMode) => void;
  days: number;
  onDaysChange: (days: number) => void;
  addLuggage: boolean;
  onToggleLuggage: () => void;
}

const LandingScreen = ({ onSelectMode, days, onDaysChange, addLuggage, onToggleLuggage }: LandingScreenProps) => {
  // Generate departure window text
  const now = new Date();
  const deadline = new Date(now.getTime() + 96 * 60 * 60 * 1000);
  const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 scanline">
      {/* Title Block */}
      <div className="text-center mb-10">
        <div className="text-[10px] text-muted-foreground tracking-[0.5em] uppercase mb-2">
          ── SYSTEM ONLINE ──
        </div>
        <h1 className="text-4xl md:text-6xl font-bold font-display text-foreground tracking-tight">
          LAST MINUTE ESCAPE
        </h1>
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>DEPARTURE WINDOW: {formatDate(now)} → {formatDate(deadline)}</span>
        </div>
        <div className="text-[10px] text-terminal-amber mt-1 animate-pulse">
          ▸ 96 HOURS REMAINING
        </div>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 w-full max-w-2xl">
        <button
          onClick={() => onSelectMode('winter')}
          className="group border border-winter rounded-sm p-6 bg-winter glow-winter hover:scale-[1.02] transition-all cursor-pointer"
        >
          <Snowflake className="w-10 h-10 text-terminal-cyan mx-auto mb-3 group-hover:animate-spin" />
          <div className="text-xl font-display font-bold text-terminal-cyan">WINTER</div>
          <div className="text-xs text-muted-foreground mt-1">Snowboard / Ski</div>
          <div className="text-[10px] text-terminal-dim mt-2">15 Alpine Destinations</div>
          <div className="text-[10px] text-terminal-dim">Snow Reports · Ski Passes · Transfers</div>
        </button>

        <button
          onClick={() => onSelectMode('summer')}
          className="group border border-summer rounded-sm p-6 bg-summer glow-summer hover:scale-[1.02] transition-all cursor-pointer"
        >
          <Sun className="w-10 h-10 text-terminal-amber mx-auto mb-3 group-hover:animate-spin" />
          <div className="text-xl font-display font-bold text-terminal-amber">SUMMER</div>
          <div className="text-xs text-muted-foreground mt-1">Surf / Action</div>
          <div className="text-[10px] text-terminal-dim mt-2">15 Coastal Destinations</div>
          <div className="text-[10px] text-terminal-dim">Swell Data · Surf Rentals · Transfers</div>
        </button>
      </div>

      {/* Controls */}
      <div className="w-full max-w-2xl space-y-4">
        {/* Duration Slider */}
        <div className="border border-border rounded-sm p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">▸ DURATION</span>
            <span className="text-sm font-bold text-foreground">{days} DAYS</span>
          </div>
          <input
            type="range"
            min={2}
            max={14}
            value={days}
            onChange={(e) => onDaysChange(parseInt(e.target.value))}
            className="w-full h-1 bg-muted rounded-sm appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
            <span>2d</span>
            <span>7d</span>
            <span>14d</span>
          </div>
        </div>

        {/* Luggage Toggle */}
        <button
          onClick={onToggleLuggage}
          className={`w-full border rounded-sm p-3 flex items-center justify-between transition-all cursor-pointer ${
            addLuggage ? 'border-foreground bg-muted/50' : 'border-border bg-card'
          }`}
        >
          <div className="flex items-center gap-2">
            <Luggage className={`w-4 h-4 ${addLuggage ? 'text-foreground' : 'text-muted-foreground'}`} />
            <span className="text-xs">ADD 23KG LUGGAGE (PER FLIGHT)</span>
          </div>
          <div className={`w-8 h-4 rounded-full flex items-center transition-all ${addLuggage ? 'bg-primary justify-end' : 'bg-muted justify-start'}`}>
            <div className={`w-3 h-3 rounded-full mx-0.5 ${addLuggage ? 'bg-primary-foreground' : 'bg-muted-foreground'}`} />
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 text-[9px] text-muted-foreground text-center">
        <div>ORIGIN: TLV (Ben Gurion) · PRICES IN EUR · ALL MOCK DATA</div>
        <div className="mt-1">SELECT A MODE TO LOAD DASHBOARD ▴</div>
      </div>
    </div>
  );
};

export default LandingScreen;
