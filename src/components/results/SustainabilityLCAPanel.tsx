import React from 'react';
import { SustainabilityLCA } from '../../types/analysis';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Leaf, Recycle, Box, Feather, Sparkles } from 'lucide-react';

export interface SustainabilityLCAPanelProps {
  sustainability: SustainabilityLCA;
}

export const SustainabilityLCAPanel: React.FC<SustainabilityLCAPanelProps> = ({ sustainability }) => {
  const metrics = [
    { label: 'Recyclability Stream Rating', value: `${sustainability.recyclability} / 5`, pct: sustainability.recyclability * 20, icon: Recycle, color: 'text-emerald-500' },
    { label: 'Layer Complexity / Monomaterial Suitability', value: `${sustainability.complexity} / 5`, pct: sustainability.complexity * 20, icon: Box, color: 'text-cyan-500' },
    { label: 'Raw Material Resource Intensity', value: `${sustainability.usage} / 5`, pct: sustainability.usage * 20, icon: Feather, color: 'text-amber-500' },
    { label: 'End of Life Circular Recovery', value: `${sustainability.endOfLife} / 5`, pct: sustainability.endOfLife * 20, icon: Leaf, color: 'text-emerald-600' },
  ];

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
            Environmental Circularity & LCA Assessment
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {sustainability.overall}% Overall Circularity
          </span>
          <Badge variant="emerald">ISO 14040 Principles</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/50 dark:bg-slate-900/50 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                  {m.label}
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{m.value}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${m.pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
        {sustainability.note}
      </p>
    </Card>
  );
};
