import { Flights } from '@/data/types';
import { Plane, ExternalLink } from 'lucide-react';

const FlightZone = ({ flights: f, departureDate, returnDate }: { flights: Flights; departureDate?: string; returnDate?: string }) => {
  const googleFlightsUrl = f.googleFlightsUrl || buildGoogleFlightsUrl(f.hub, departureDate, returnDate);

  return (
    <div className="px-3 py-2 border-b border-border">
      <div className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-widest">▸ FLIGHTS (TLV → {f.hub})</div>
      <a
        href={googleFlightsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-2 rounded-sm border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
      >
        <div className="flex items-center gap-2">
          <Plane className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          <div>
            <div className="text-[11px] font-semibold text-foreground">Check flights on Google Flights</div>
            <div className="text-[9px] text-muted-foreground">TLV → {f.hub} · Round trip · Real-time prices</div>
          </div>
        </div>
        <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
      </a>
      <div className="mt-1.5 text-[9px] text-muted-foreground">
        Transfer: €{f.airportTransfer}×2
      </div>
    </div>
  );
};

function buildGoogleFlightsUrl(hub: string, depDate?: string, retDate?: string): string {
  const base = 'https://www.google.com/travel/flights';
  if (depDate && retDate) {
    return `${base}?q=Flights+from+TLV+to+${hub}+on+${depDate}+return+${retDate}`;
  }
  return `${base}?q=Flights+from+TLV+to+${hub}`;
}

export default FlightZone;
