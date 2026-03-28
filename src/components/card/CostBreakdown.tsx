import { Destination } from '@/data/types';

interface CostBreakdownProps {
  dest: Destination;
  days: number;
  isWinter: boolean;
}

const CostBreakdown = ({ dest, days, isWinter }: CostBreakdownProps) => {
  const f = dest.flights;
  const c = dest.costs;
  const transfers = f.airportTransfer * 2;
  const accommodation = c.accommodationPerNight * (days - 1);
  const activity = c.activityCostPerDay * days;

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9px] text-muted-foreground mb-2">
      {f.estimatedPrice && (
        <>
          <span>Flights (round trip)</span>
          <span className="text-right text-secondary-foreground">~€{f.estimatedPrice}</span>
        </>
      )}
      <span>Transfers</span><span className="text-right text-secondary-foreground">€{transfers}</span>
      <span>Accom. ×{days - 1}n</span><span className="text-right text-secondary-foreground">€{accommodation}</span>
      <span>{isWinter ? 'Skipass' : 'Rental'} ×{days}d</span><span className="text-right text-secondary-foreground">€{activity}</span>
      {!f.estimatedPrice && (
        <span className="text-[8px] italic col-span-2 mt-0.5">+ flights (check Google Flights link above)</span>
      )}
    </div>
  );
};

export default CostBreakdown;
