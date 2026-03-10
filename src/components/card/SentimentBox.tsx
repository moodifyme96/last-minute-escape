import { NLPSentiment } from '@/data/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const SentimentBox = ({ sentiment }: { sentiment: NLPSentiment }) => {
  const Icon = sentiment.vibeScore >= 70 ? TrendingUp : sentiment.vibeScore >= 40 ? Minus : TrendingDown;
  const iconColor = sentiment.vibeScore >= 80 ? 'text-terminal-green' : sentiment.vibeScore >= 60 ? 'text-terminal-amber' : 'text-terminal-red';
  const noData = sentiment.vibeScore === 0 && sentiment.sources.length === 0;

  return (
    <div className="mt-2 p-1.5 bg-muted/50 rounded-sm border border-border">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">NLP Sentiment</span>
        <div className="flex items-center gap-1">
          <Icon className={`w-2.5 h-2.5 ${iconColor}`} />
          <span className={`text-[10px] font-bold ${sentiment.vibeScore >= 80 ? 'text-terminal-green' : sentiment.vibeScore >= 60 ? 'text-terminal-amber' : sentiment.vibeScore > 0 ? 'text-terminal-red' : 'text-muted-foreground'}`}>
            {noData ? '—' : `${sentiment.vibeScore}/100`}
          </span>
        </div>
      </div>
      <p className="text-[10px] text-secondary-foreground leading-tight">{sentiment.summary}</p>
      {sentiment.sources.length > 0 && (
        <div className="flex gap-2 mt-1 flex-wrap">
          {sentiment.sources.map((s, i) => (
            <span key={i} className="text-[8px] text-muted-foreground bg-muted px-1 py-0.5 rounded-sm" title={s.snippet}>
              {s.platform}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SentimentBox;
