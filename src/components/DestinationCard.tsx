import { Destination, WinterConditions, SummerConditions, calculateDIYTotal, calculateClubMedTotal } from '@/data/destinations';
import { Snowflake, Sun, Waves, CloudRain, Wind, Thermometer, Mountain, AlertTriangle, Plane, Luggage, DollarSign, TrendingUp } from 'lucide-react';

interface DestinationCardProps {
  destination: Destination;
  days: number;
  addLuggage: boolean;
}

const DestinationCard = ({ destination: dest, days, addLuggage }: DestinationCardProps) => {
  const isWinter = dest.mode === 'winter';
  const diyTotal = calculateDIYTotal(dest, days, addLuggage);
  const clubTotal = calculateClubMedTotal(dest, days, addLuggage);

  const f = dest.flights;
  const c = dest.costs;
  const flights = f.outbound.baseFare + f.returnLeg.baseFare;
  const baggage = addLuggage ? f.baggageFee * 2 : 0;
  const transfers = f.airportTransfer * 2;
  const accommodation = c.accommodationPerNight * (days - 1);
  const activity = c.activityCostPerDay * days;

  return (
    <div className={`border rounded-sm p-0 overflow-hidden ${isWinter ? 'border-winter bg-winter' : 'border-summer bg-summer'} ${isWinter ? 'glow-winter' : 'glow-summer'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${isWinter ? 'text-terminal-cyan' : 'text-terminal-amber'}`}>
            {f.hub}
          </span>
          <span className="text-foreground font-semibold text-sm">{dest.name}</span>
          <span className="text-muted-foreground text-[10px]">{dest.country}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground">{dest.region}</span>
          <span className="text-[10px] text-muted-foreground font-mono">TLV→{f.hub}</span>
        </div>
      </div>

      {/* Zone 1: Environmental + Sentiment */}
      <div className="px-3 py-2 border-b border-border">
        <div className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-widest">
          ▸ CONDITIONS
        </div>
        {isWinter ? (
          <WinterEnvDisplay conditions={dest.conditions as WinterConditions} />
        ) : (
          <SummerEnvDisplay conditions={dest.conditions as SummerConditions} />
        )}
        <div className="mt-2 p-1.5 bg-muted/50 rounded-sm border border-border">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">NLP Sentiment</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5 text-terminal-green" />
              <span className={`text-[10px] font-bold ${dest.sentiment.vibeScore >= 80 ? 'text-terminal-green' : dest.sentiment.vibeScore >= 60 ? 'text-terminal-amber' : 'text-terminal-red'}`}>
                {dest.sentiment.vibeScore}/100
              </span>
            </div>
          </div>
          <p className="text-[10px] text-secondary-foreground leading-tight">{dest.sentiment.summary}</p>
          <div className="flex gap-2 mt-1">
            {dest.sentiment.sources.map((s, i) => (
              <span key={i} className="text-[8px] text-muted-foreground bg-muted px-1 py-0.5 rounded-sm">{s.platform}</span>
            ))}
          </div>
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
            <div className="text-foreground">{f.outbound.airline}</div>
            <div className="text-secondary-foreground">{f.outbound.departure}→{f.outbound.arrival}</div>
            <div className="flex items-center gap-1">
              <span className="text-terminal-amber font-bold">€{f.outbound.baseFare}</span>
              {f.outbound.baggageIncluded && <span className="text-[8px] text-terminal-green">23kg✓</span>}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground flex items-center gap-1">
              <Plane className="w-2.5 h-2.5 rotate-180" /> RET
            </div>
            <div className="text-foreground">{f.returnLeg.airline}</div>
            <div className="text-secondary-foreground">{f.returnLeg.departure}→{f.returnLeg.arrival}</div>
            <div className="flex items-center gap-1">
              <span className="text-terminal-amber font-bold">€{f.returnLeg.baseFare}</span>
              {f.returnLeg.baggageIncluded && <span className="text-[8px] text-terminal-green">23kg✓</span>}
            </div>
          </div>
        </div>
        <div className="mt-1.5 flex gap-3 text-[9px] text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Luggage className="w-2.5 h-2.5" />
            23kg: €{f.baggageFee}×2
            {addLuggage ? <span className="text-foreground ml-0.5">✓</span> : <span className="text-terminal-red ml-0.5">✗</span>}
          </span>
          <span>Transfer: €{f.airportTransfer}×2</span>
        </div>
      </div>

      {/* Zone 3: Totals */}
      <div className="px-3 py-2">
        <div className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-widest">
          ▸ {days}D COST AGGREGATOR
        </div>
        
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

const WinterEnvDisplay = ({ conditions: c }: { conditions: WinterConditions }) => (
  <div className="grid grid-cols-4 gap-2 text-[10px]">
    <div>
      <div className="text-muted-foreground flex items-center gap-0.5"><Mountain className="w-2.5 h-2.5" /> Snow</div>
      <div className="text-terminal-cyan font-bold">{c.snowDepthBase}/{c.snowDepthPeak}cm</div>
      <div className="text-[9px] text-muted-foreground">base/peak</div>
    </div>
    <div>
      <div className="text-muted-foreground flex items-center gap-0.5"><Snowflake className="w-2.5 h-2.5" /> Fresh</div>
      <div className={`font-bold ${c.freshSnow48h > 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>{c.freshSnow48h}cm</div>
      <div className="text-[9px] text-muted-foreground">48h</div>
    </div>
    <div>
      <div className="text-muted-foreground flex items-center gap-0.5"><Thermometer className="w-2.5 h-2.5" /> Temp</div>
      <div className="text-terminal-cyan font-bold">{c.tempC}°C</div>
      <div className="text-[9px] text-muted-foreground">{c.altitude}m</div>
    </div>
    <div>
      <div className="text-muted-foreground flex items-center gap-0.5"><AlertTriangle className="w-2.5 h-2.5" /> Storm</div>
      {c.recentStorm ? (
        <div className="text-terminal-amber font-bold">{c.stormDaysAgo}d ago</div>
      ) : (
        <div className="text-muted-foreground">None</div>
      )}
      <div className={`text-[9px] ${c.liftStatus === 'full' ? 'text-terminal-green' : c.liftStatus === 'partial' ? 'text-terminal-amber' : 'text-terminal-red'}`}>
        Lifts: {c.liftStatus}
      </div>
    </div>
  </div>
);

const SummerEnvDisplay = ({ conditions: c }: { conditions: SummerConditions }) => (
  <div className="grid grid-cols-4 gap-2 text-[10px]">
    <div>
      <div className="text-muted-foreground flex items-center gap-0.5"><Waves className="w-2.5 h-2.5" /> Water</div>
      <div className="text-terminal-amber font-bold">{c.waterTempC}°C</div>
    </div>
    <div>
      <div className="text-muted-foreground flex items-center gap-0.5"><Waves className="w-2.5 h-2.5" /> Swell</div>
      <div className="text-terminal-amber font-bold">{c.swellHeightM}m</div>
      <div className="text-[9px] text-muted-foreground">{c.swellPeriodS}s</div>
    </div>
    <div>
      <div className="text-muted-foreground flex items-center gap-0.5"><Wind className="w-2.5 h-2.5" /> Wind</div>
      <div className="text-terminal-amber font-bold">{c.windKnots}kts</div>
      <div className="text-[9px] text-muted-foreground">UV {c.uvIndex}</div>
    </div>
    <div>
      <div className="text-muted-foreground flex items-center gap-0.5">
        <Sun className="w-2.5 h-2.5" />/<CloudRain className="w-2.5 h-2.5" />
      </div>
      <div className="font-bold">
        <span className="text-terminal-amber">{c.sunnyDays}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-terminal-red">{c.rainyDays}</span>
      </div>
      {!c.safeSeasonFlag && <div className="text-[9px] text-terminal-red">⚠ OFF-SEASON</div>}
    </div>
  </div>
);

export default DestinationCard;
