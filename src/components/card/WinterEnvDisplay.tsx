import { WinterConditions } from '@/data/types';
import { Mountain, Snowflake, Thermometer, AlertTriangle } from 'lucide-react';

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

export default WinterEnvDisplay;
