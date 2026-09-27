import React from 'react';
import { AlternativeMaterial } from '../../types/analysis';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { DollarSign, Zap, Leaf, ArrowUpRight, Scale } from 'lucide-react';

export interface AlternativeCardsProps {
  alternatives: AlternativeMaterial[];
  onSelectCompare?: (slug: string) => void;
}

export const AlternativeCards: React.FC<AlternativeCardsProps> = ({ alternatives, onSelectCompare }) => {
  if (!alternatives || alternatives.length === 0) return null;

  const focusConfig = {
    'Cost Focused': {
      icon: DollarSign,
      badgeVariant: 'cyan' as const,
      borderColor: 'hover:border-cyan-500/50',
      bgGlow: 'dark:from-cyan-950/20',
    },
    'Performance Focused': {
      icon: Zap,
      badgeVariant: 'amber' as const,
      borderColor: 'hover:border-amber-500/50',
      bgGlow: 'dark:from-amber-950/20',
    },
    'Sustainability Focused': {
      icon: Leaf,
      badgeVariant: 'emerald' as const,
      borderColor: 'hover:border-emerald-500/50',
      bgGlow: 'dark:from-emerald-950/20',
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
            Alternative Packaging Options
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare alternative materials optimized for budget constraints, maximum protection, or eco-targets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alternatives.map((alt, idx) => {
          const config = focusConfig[alt.focus] || focusConfig['Cost Focused'];
          const Icon = config.icon;

          return (
            <Card
              key={idx}
              className={`p-5 space-y-4 bg-gradient-to-b from-white ${config.bgGlow} to-white dark:to-slate-900 border transition-all duration-200 ${config.borderColor} flex flex-col justify-between`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={config.badgeVariant} className="font-bold flex items-center gap-1">
                    <Icon className="w-3 h-3" />
                    {alt.focus}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                    {alt.compatibility}% Match
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
                    {alt.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {alt.use}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Cost Index</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{alt.cost}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">End of Life</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{alt.sustainability}</p>
                  </div>
                </div>
              </div>

              {onSelectCompare && (
                <button
                  type="button"
                  onClick={() => onSelectCompare(alt.slug)}
                  className="w-full mt-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5 text-emerald-500" />
                  Compare Specifications
                </button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
