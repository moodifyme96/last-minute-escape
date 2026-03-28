import { Destination, WinterConditions, SummerConditions, calculateDIYTotal, calculateClubMedTotal } from '@/data/destinations';
import { DollarSign, Crown, Wifi, WifiOff } from 'lucide-react';
import WinterEnvDisplay from './card/WinterEnvDisplay';
import SummerEnvDisplay from './card/SummerEnvDisplay';
import SentimentBox from './card/SentimentBox';
import FlightZone from './card/FlightZone';
import CostBreakdown from './card/CostBreakdown';

interface DestinationCardProps {
  destination: Destination & { _liveFlights?: boolean; _liveWeather?: boolean; _liveSentiment?: boolean; effectiveDays?: number };
  days: number;
  showPremium: boolean;
  departureDate?: string;
  returnDate?: string;
}

const DestinationCard = ({ destination: dest, days, showPremium, departureDate, returnDate }: DestinationCardProps) => {
  const isWinter = dest.mode === 'winter';
  const activityDays = dest.effectiveDays ?? days;
  const diyTotal = calculateDIYTotal(dest, activityDays);
  const clubTotal = calculateClubMedTotal(dest, activityDays);
  const f = dest.flights;
  const hasLiveData = dest._liveWeather || dest._liveSentiment;
  const daysLost = days - activityDays;

  return (
    <div className={`border rounded-sm p-0 overflow-hidden ${isWinter ? 'border-winter bg-winter glow-winter' : 'border-summer bg-summer glow-summer'}`}>
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
          {hasLiveData !== undefined && (
            <span className={`text-[8px] ${hasLiveData ? 'text-terminal-green' : 'text-muted-foreground'}`}>
              {hasLiveData ? '●' : '○'}
            </span>
          )}
        </div>
      </div>

      {/* Zone 1: Environmental + Sentiment */}
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">▸ CONDITIONS</span>
          {dest._liveWeather === false && (
            <span className="text-[8px] text-terminal-amber">CACHED</span>
          )}
        </div>
        {isWinter ? (
          <WinterEnvDisplay conditions={dest.conditions as WinterConditions} slopeKm={dest.slopeKm} />
        ) : (
          <SummerEnvDisplay conditions={dest.conditions as SummerConditions} />
        )}
        <SentimentBox sentiment={dest.sentiment} />
      </div>

      {/* Zone 2: Flights — Google Flights link */}
      <FlightZone flights={f} departureDate={departureDate} returnDate={returnDate} />

      {/* Zone 3: Totals */}
      <div className="px-3 py-2">
        <div className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-widest flex items-center gap-2">
          <span>▸ {activityDays}D ACTIVITY / {days}D TRIP{f.estimatedPrice ? '' : ' (EXCL. FLIGHTS)'}</span>
          {daysLost > 0 && (
            <span className="text-[8px] text-terminal-amber">({daysLost > 1 ? `${daysLost} days` : '1 day'} travel)</span>
          )}
        </div>

        {showPremium ? (
          clubTotal > 0 ? (
            <div className={`flex items-center justify-between p-2 rounded-sm border ${isWinter ? 'border-terminal-cyan bg-terminal-cyan/5' : 'border-terminal-amber bg-terminal-amber/5'}`}>
              <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-terminal-amber" /> CLUB MED / PREMIUM
              </span>
              <span className={`text-base font-bold ${isWinter ? 'text-terminal-cyan' : 'text-terminal-amber'}`}>
                €{clubTotal.toLocaleString()}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2 rounded-sm bg-muted/30 border border-border">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                <Crown className="w-3 h-3" /> CLUB MED
              </span>
              <span className="text-[10px] text-terminal-red">N/A FOR THIS DESTINATION</span>
            </div>
          )
        ) : (
          <>
            <CostBreakdown dest={dest} days={activityDays} isWinter={isWinter} />

            <div className={`flex items-center justify-between p-1.5 rounded-sm border mb-1.5 ${isWinter ? 'border-winter' : 'border-summer'}`}>
              <span className="text-[10px] font-semibold text-foreground flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> LOCAL COSTS
              </span>
              <span className={`text-sm font-bold ${isWinter ? 'text-terminal-cyan' : 'text-terminal-amber'}`}>
                €{diyTotal.toLocaleString()}
              </span>
            </div>

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
          </>
        )}
      </div>
    </div>
  );
};

export default DestinationCard;
