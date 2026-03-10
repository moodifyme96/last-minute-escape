import { Destination } from '@/data/types';

interface CostBreakdownProps {
  dest: Destination;
  days: number;
  addLuggage: boolean;
  isWinter: boolean;
}

const CostBreakdown = ({ dest, days, addLuggage, isWinter }: CostBreakdownProps) => {
  const f = dest.flights;
  const c = dest.costs;
  const flights = f.outbound.baseFare + f.returnLeg.baseFare;
  const baggage = addLuggage ? f.baggageFee * 2 : 0;
  const transfers = f.airportTransfer * 2;
  const accommodation = c.accommodationPerNight * (days - 1);
  const activity = c.activityCostPerDay * days;

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9px] text-muted-foreground mb-2">
      <span>Flights</span><span className="text-right text-secondary-foreground">€{flights}</span>
      <span>Bags {addLuggage ? '(23kg)' : '(none)'}</span><span className="text-right text-secondary-foreground">€{baggage}</span>
      <span>Transfers</span><span className="text-right text-secondary-foreground">€{transfers}</span>
      <span>Accom. ×{days - 1}n</span><span className="text-right text-secondary-foreground">€{accommodation}</span>
      <span>{isWinter ? 'Skipass' : 'Rental'} ×{days}d</span><span className="text-right text-secondary-foreground">€{activity}</span>
    </div>
  );
};

export default CostBreakdown;
