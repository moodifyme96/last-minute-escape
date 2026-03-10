import { TravelMode, getDestinations } from '@/data/destinations';
import DestinationCard from './DestinationCard';
import { ArrowLeft, Luggage, Clock } from 'lucide-react';

interface DashboardProps {
  mode: TravelMode;
  days: number;
  onDaysChange: (days: number) => void;
  addLuggage: boolean;
  onToggleLuggage: () => void;
  onBack: () => void;
}

const Dashboard = ({ mode, days, onDaysChange, addLuggage, onToggleLuggage, onBack }: DashboardProps) => {
  const destinations = getDestinations(mode);
  const isWinter = mode === 'winter';

  const now = new Date();
  const deadline = new Date(now.getTime() + 96 * 60 * 60 * 1000);
  const hoursLeft = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));

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
              <span className="text-[10px] text-muted-foreground">/ 15 DESTINATIONS / TLV ORIGIN</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-terminal-amber">
            <Clock className="w-3 h-3" />
            <span>{hoursLeft}H WINDOW</span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="container flex items-center gap-4 py-2 border-t border-border">
          <div className="flex items-center gap-2 flex-1">
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
            />
          ))}
        </div>

        <div className="text-center text-[9px] text-muted-foreground mt-6 pb-4">
          ALL DATA IS MOCKED · PRICES FOR ILLUSTRATION ONLY · LAST MINUTE ESCAPE v0.1
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
