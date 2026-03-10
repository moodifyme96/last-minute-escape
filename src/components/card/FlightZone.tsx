import { Flights } from '@/data/types';
import { Plane, Luggage } from 'lucide-react';

const FlightZone = ({ flights: f, addLuggage }: { flights: Flights; addLuggage: boolean }) => (
  <div className="px-3 py-2 border-b border-border">
    <div className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-widest">▸ FLIGHTS (TLV)</div>
    <div className="grid grid-cols-2 gap-2 text-[10px]">
      <div>
        <div className="text-muted-foreground flex items-center gap-1"><Plane className="w-2.5 h-2.5" /> OUT</div>
        <div className="text-foreground">{f.outbound.airline}</div>
        <div className="text-secondary-foreground">{f.outbound.departure}→{f.outbound.arrival}</div>
        <div className="flex items-center gap-1">
          <span className="text-terminal-amber font-bold">€{f.outbound.baseFare}</span>
          {f.outbound.baggageIncluded && <span className="text-[8px] text-terminal-green">23kg✓</span>}
        </div>
      </div>
      <div>
        <div className="text-muted-foreground flex items-center gap-1"><Plane className="w-2.5 h-2.5 rotate-180" /> RET</div>
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
);

export default FlightZone;
