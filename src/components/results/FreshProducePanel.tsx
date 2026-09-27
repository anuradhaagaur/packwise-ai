import React from 'react';
import { FreshProduceInsights } from '../../types/analysis';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Apple, Wind, Droplets, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export interface FreshProducePanelProps {
  insights: FreshProduceInsights | null;
}

export const FreshProducePanel: React.FC<FreshProducePanelProps> = ({ insights }) => {
  if (!insights) return null;

  return (
    <Card className="p-6 border-emerald-500/40 bg-gradient-to-br from-emerald-50/50 via-white to-cyan-50/30 dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 space-y-5">
      <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-800/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
            <Apple className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 font-display">
            Fresh Produce Post-Harvest Packaging Intelligence
          </h3>
        </div>
        <Badge variant="emerald">Live Respiration Analysis</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Respiration Level */}
        <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-emerald-200/70 dark:border-emerald-800/70 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <Wind className="w-3.5 h-3.5" /> Respiration Category
          </div>
          <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {insights.respiration}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Active cellular metabolic rate consuming O₂ and releasing CO₂ & heat.
          </p>
        </div>

        {/* O2 / Permeability Management */}
        <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-emerald-200/70 dark:border-emerald-800/70 space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-300 text-xs font-semibold">
            <Wind className="w-3.5 h-3.5" /> Gas Exchange Strategy
          </div>
          <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {insights.o2Management}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Prevents anaerobic fermentation while maintaining beneficial 3–5% O₂ levels.
          </p>
        </div>

        {/* Moisture & Anti-fog */}
        <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-emerald-200/70 dark:border-emerald-800/70 space-y-1">
          <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Droplets className="w-3.5 h-3.5" /> Transpiration Control
          </div>
          <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {insights.humidityManagement}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Vapor transmission to suppress surface droplet pooling and mould germination.
          </p>
        </div>

        {/* Condensation Risk */}
        <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-emerald-200/70 dark:border-emerald-800/70 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" /> Condensation Risk
          </div>
          <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {insights.condensationRisk} Risk
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Cold-chain temperature fluctuations trigger rapid dew-point condensation.
          </p>
        </div>
      </div>
    </Card>
  );
};
