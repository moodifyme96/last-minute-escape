import { TravelMode } from '@/data/destinations';
import { Snowflake, Sun, Luggage, Clock, Zap, CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, addDays, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

interface LandingScreenProps {
  onSelectMode: (mode: TravelMode) => void;
  days: number;
  onDaysChange: (days: number) => void;
  departureDate: Date;
  onDepartureDateChange: (date: Date) => void;
}

const LandingScreen = ({ onSelectMode, days, onDaysChange, departureDate, onDepartureDateChange }: LandingScreenProps) => {
  const now = new Date();
  const minDate = startOfDay(addDays(now, 0)); // today
  const maxDate = startOfDay(addDays(now, 4));  // 4 days out

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 scanline">
      {/* Title Block */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="text-[10px] text-muted-foreground tracking-[0.5em] uppercase mb-2">
          ── SYSTEM ONLINE ──
        </div>
        <h1 className="text-4xl md:text-6xl font-bold font-display text-foreground tracking-tight">
          THE 96-HOUR PIVOT
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Last-minute decision engine for travelers from TLV. Live flights, real conditions, AI sentiment.
        </p>
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>DEPARTURE WINDOW: {format(minDate, 'dd MMM')} → {format(maxDate, 'dd MMM')}</span>
        </div>
        <motion.div
          className="flex items-center justify-center gap-1.5 text-[10px] text-terminal-amber mt-1"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Zap className="w-3 h-3" />
          96 HOURS REMAINING
        </motion.div>
      </motion.div>

      {/* Mode Selection */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.button
          onClick={() => onSelectMode('winter')}
          className="group border border-winter rounded-sm p-6 bg-winter glow-winter transition-all cursor-pointer text-left"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Snowflake className="w-10 h-10 text-terminal-cyan mx-auto mb-3 group-hover:animate-spin" />
          <div className="text-xl font-display font-bold text-terminal-cyan text-center">WINTER</div>
          <div className="text-xs text-muted-foreground mt-1 text-center">Snowboard / Ski</div>
          <div className="text-[10px] text-terminal-dim mt-3 space-y-0.5">
            <div>▸ 17 Alpine, Pyrenees & Caucasus Destinations</div>
            <div>▸ Live Snow Reports + AI Vibe Scores</div>
            <div>▸ DIY vs Club Med Cost Matrix</div>
            <div>▸ Late Season High-Altitude Priority</div>
          </div>
        </motion.button>

        <motion.button
          onClick={() => onSelectMode('summer')}
          className="group border border-summer rounded-sm p-6 bg-summer glow-summer transition-all cursor-pointer text-left"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Sun className="w-10 h-10 text-terminal-amber mx-auto mb-3 group-hover:animate-spin" />
          <div className="text-xl font-display font-bold text-terminal-amber text-center">SUMMER</div>
          <div className="text-xs text-muted-foreground mt-1 text-center">Surf / Kite / Action</div>
          <div className="text-[10px] text-terminal-dim mt-3 space-y-0.5">
            <div>▸ 15 Coastal & Island Destinations</div>
            <div>▸ Swell + Wind + Water Temp Data</div>
            <div>▸ Climate Guardrail (Monsoon Filter)</div>
            <div>▸ Rental Car Estimates Included</div>
          </div>
        </motion.button>
      </motion.div>

      {/* Controls */}
      <motion.div
        className="w-full max-w-2xl space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        {/* Departure Date Picker */}
        <div className="border border-border rounded-sm p-4 bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">▸ DEPARTURE DATE</span>
            <span className="text-[9px] text-terminal-amber">WITHIN 96H WINDOW</span>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map(offset => {
              const d = addDays(startOfDay(now), offset + 1);
              const isSelected = startOfDay(departureDate).getTime() === d.getTime();
              const dayLabel = offset === 0 ? 'TOMORROW' : format(d, 'EEE').toUpperCase();
              return (
                <button
                  key={offset}
                  onClick={() => onDepartureDateChange(d)}
                  className={cn(
                    'flex-1 border rounded-sm p-2 text-center transition-all cursor-pointer',
                    isSelected
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-muted-foreground'
                  )}
                >
                  <div className="text-[9px] font-bold">{dayLabel}</div>
                  <div className="text-xs font-semibold">{format(d, 'dd MMM')}</div>
                </button>
              );
            })}
          </div>
        </div>

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

      </motion.div>

      {/* Feature badges */}
      <motion.div
        className="mt-8 flex flex-wrap justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {['AMADEUS FLIGHTS', 'AI CONDITIONS', 'FIRECRAWL SENTIMENT', 'AI VIBE SCORING', 'MULTI-HUB COMPARE'].map(label => (
          <span key={label} className="text-[8px] text-terminal-dim border border-border rounded-sm px-2 py-0.5">
            {label}
          </span>
        ))}
      </motion.div>

      {/* Footer */}
      <div className="mt-4 text-[9px] text-muted-foreground text-center">
        <div>ORIGIN: TLV (Ben Gurion) · PRICES IN EUR · v1.0</div>
        <div className="mt-1">SELECT A MODE TO LOAD DASHBOARD ▴</div>
      </div>
    </div>
  );
};

export default LandingScreen;
