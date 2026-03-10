import { Destination, WinterEnv, SummerEnv, calculateDIYTotal, calculateClubMedTotal } from '@/data/destinations';
import { Snowflake, Sun, Waves, CloudRain, Wind, Thermometer, Mountain, AlertTriangle, Plane, Luggage, DollarSign } from 'lucide-react';

interface DestinationCardProps {
  destination: Destination;
  days: number;
  addLuggage: boolean;
}

const DestinationCard = ({ destination: dest, days, addLuggage }: DestinationCardProps) => {
  const isWinter = dest.mode === 'winter';
  const env = dest.env;
  const diyTotal = calculateDIYTotal(dest, days, addLuggage);
  const clubTotal = calculateClubMedTotal(dest, days, addLuggage);

  const flights = dest.outbound.baseFare + dest.returnFlight.baseFare;
  const baggage = addLuggage ? dest.baggageFee * 2 : 0;
  const transfers = dest.airportTransfer * 2;
  const accommodation = dest.accommodationPerNight * (days - 1);
  const activity = dest.activityCostPerDay * days;

  return (
    <div className={`border rounded-sm p-0 overflow-hidden ${isWinter ? 'border-winter bg-winter' : 'border-summer bg-summer'} ${isWinter ? 'glow-winter' : 'glow-summer'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${isWinter ? 'text-terminal-cyan' : 'text-terminal-amber'}`}>
            {dest.code}
          </span>
          <span className="text-foreground font-semibold text-sm">{dest.name}</span>
          <span className="text-muted-foreground text-[10px]">{dest.country}</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">TLV→{dest.code}</span>
      </div>

      {/* Zone 1: Environmental */}
      <div className="px-3 py-2 border-b border-border">
        <div className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-widest">
          ▸ ENV DATA
        </div>
        {isWinter ? (
          <WinterEnvDisplay env={env as WinterEnv} />
        ) : (
          <SummerEnvDisplay env={env as SummerEnv} />
        )}
        <div className="mt-2 p-1.5 bg-muted/50 rounded-sm border border-border">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Community Sentiment</div>
          <p className="text-[10px] text-secondary-foreground leading-tight">{dest.sentiment}</p>
        </div>
      </div>

      {/* Zone 2: Flights */}
      <div className="px-3 py-2 border-b border-border">
        <div className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-widest">
          ▸ FLIGHTS (TLV)
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <div className="text-muted-foreground flex items-center gap-1">
              <Plane className="w-2.5 h-2.5" /> OUT
            </div>
            <div className="text-foreground">{dest.outbound.airline}</div>
            <div className="text-secondary-foreground">{dest.outbound.departure}→{dest.outbound.arrival}</div>
            <div className="text-terminal-amber font-bold">€{dest.outbound.baseFare}</div>
          </div>
          <div>
            <div className="text-muted-foreground flex items-center gap-1">
              <Plane className="w-2.5 h-2.5 rotate-180" /> RET
            </div>
            <div className="text-foreground">{dest.returnFlight.airline}</div>
            <div className="text-secondary-foreground">{dest.returnFlight.departure}→{dest.returnFlight.arrival}</div>
            <div className="text-terminal-amber font-bold">€{dest.returnFlight.baseFare}</div>
          </div>
        </div>
        <div className="mt-1.5 flex gap-3 text-[9px] text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Luggage className="w-2.5 h-2.5" />
            23kg: €{dest.baggageFee}×2
            {addLuggage ? <span className="text-foreground ml-0.5">✓</span> : <span className="text-terminal-red ml-0.5">✗</span>}
          </span>
          <span>Transfer: €{dest.airportTransfer}×2</span>
        </div>
      </div>

      {/* Zone 3: Totals */}
      <div className="px-3 py-2">
        <div className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-widest">
          ▸ {days}D COST AGGREGATOR
        </div>
        
        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9px] text-muted-foreground mb-2">
          <span>Flights</span><span className="text-right text-secondary-foreground">€{flights}</span>
          <span>Bags {addLuggage ? '(23kg)' : '(none)'}</span><span className="text-right text-secondary-foreground">€{baggage}</span>
          <span>Transfers</span><span className="text-right text-secondary-foreground">€{transfers}</span>
          <span>Accom. ×{days - 1}n</span><span className="text-right text-secondary-foreground">€{accommodation}</span>
          <span>{isWinter ? 'Skipass' : 'Rental'} ×{days}d</span><span className="text-right text-secondary-foreground">€{activity}</span>
        </div>

        {/* DIY Total */}
        <div className={`flex items-center justify-between p-1.5 rounded-sm border mb-1.5 ${isWinter ? 'border-winter' : 'border-summer'}`}>
          <span className="text-[10px] font-semibold text-foreground flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> DIY TOTAL
          </span>
          <span className={`text-sm font-bold ${isWinter ? 'text-terminal-cyan' : 'text-terminal-amber'}`}>
            €{diyTotal.toLocaleString()}
          </span>
        </div>

        {/* Club Med */}
        {clubTotal > 0 ? (
          <div className="flex items-center justify-between p-1.5 rounded-sm bg-muted/30 border border-border">
            <span className="text-[10px] text-muted-foreground">CLUB MED / PREMIUM</span>
            <span className="text-sm font-bold text-muted-foreground">€{clubTotal.toLocaleString()}</span>
          </div>
        ) : (
          <div className="flex items-center justify-between p-1.5 rounded-sm bg-muted/30 border border-border">
            <span className="text-[10px] text-muted-foreground">CLUB MED</span>
            <span className="text-[10px] text-terminal-red">N/A</span>
          </div>
        )}
      </div>
    </div>
  );
};

const WinterEnvDisplay = ({ env }: { env: WinterEnv }) => (
  <div className="grid grid-cols-3 gap-2 text-[10px]">
    <div>
      <div className="text-muted-foreground flex items-center gap-0.5"><Mountain className="w-2.5 h-2.5" /> Snow</div>
      <div className="text-terminal-cyan font-bold">{env.snowDepthBase}/{env.snowDepthPeak}cm</div>
      <div className="text-[9px] text-muted-foreground">base/peak</div>
    </div>
    <div>
      <div className="text-muted-foreground flex items-center gap-0.5"><Thermometer className="w-2.5 h-2.5" /> Temp</div>
      <div className="text-terminal-cyan font-bold">{env.tempC}°C</div>
    </div>
    <div>
      <div className="text-muted-foreground flex items-center gap-0.5"><Snowflake className="w-2.5 h-2.5" /> Storm</div>
      {env.recentStorm ? (
        <div className="flex items-center gap-0.5">
          <AlertTriangle className="w-2.5 h-2.5 text-terminal-amber" />
          <span className="text-terminal-amber font-bold">{env.stormDaysAgo}d ago</span>
        </div>
      ) : (
        <div className="text-muted-foreground">None</div>
      )}
    </div>
  </div>
);

const SummerEnvDisplay = ({ env }: { env: SummerEnv }) => (
  <div className="grid grid-cols-3 gap-2 text-[10px]">
    <div>
      <div className="text-muted-foreground flex items-center gap-0.5"><Waves className="w-2.5 h-2.5" /> Water</div>
      <div className="text-terminal-amber font-bold">{env.waterTempC}°C</div>
    </div>
    <div>
      <div className="text-muted-foreground flex items-center gap-0.5"><Wind className="w-2.5 h-2.5" /> Swell</div>
      <div className="text-terminal-amber font-bold">{env.swellHeightM}m</div>
    </div>
    <div>
      <div className="text-muted-foreground flex items-center gap-0.5">
        <Sun className="w-2.5 h-2.5" />/<CloudRain className="w-2.5 h-2.5" />
      </div>
      <div className="font-bold">
        <span className="text-terminal-amber">{env.sunnyDays}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-terminal-red">{env.rainyDays}</span>
      </div>
    </div>
  </div>
);

export default DestinationCard;
