import { SummerConditions } from '@/data/types';
import { Waves, Wind, Sun, CloudRain } from 'lucide-react';

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

export default SummerEnvDisplay;
