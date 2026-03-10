import { NLPSentiment } from '@/data/types';
import { TrendingUp } from 'lucide-react';

const SentimentBox = ({ sentiment }: { sentiment: NLPSentiment }) => (
  <div className="mt-2 p-1.5 bg-muted/50 rounded-sm border border-border">
    <div className="flex items-center justify-between mb-0.5">
      <span className="text-[9px] text-muted-foreground uppercase tracking-wider">NLP Sentiment</span>
      <div className="flex items-center gap-1">
        <TrendingUp className="w-2.5 h-2.5 text-terminal-green" />
        <span className={`text-[10px] font-bold ${sentiment.vibeScore >= 80 ? 'text-terminal-green' : sentiment.vibeScore >= 60 ? 'text-terminal-amber' : 'text-terminal-red'}`}>
          {sentiment.vibeScore}/100
        </span>
      </div>
    </div>
    <p className="text-[10px] text-secondary-foreground leading-tight">{sentiment.summary}</p>
    <div className="flex gap-2 mt-1">
      {sentiment.sources.map((s, i) => (
        <span key={i} className="text-[8px] text-muted-foreground bg-muted px-1 py-0.5 rounded-sm">{s.platform}</span>
      ))}
    </div>
  </div>
);

export default SentimentBox;
