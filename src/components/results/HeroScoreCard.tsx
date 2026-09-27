import React from 'react';
import { RecommendationResult, SavedAnalysis } from '../../types/analysis';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatScoreTier } from '../../utils/formatters';
import { Sparkles, CheckCircle2, ShieldCheck, Clock, Layers, Leaf, Calendar } from 'lucide-react';

export interface HeroScoreCardProps {
  analysis: SavedAnalysis;
}

export const HeroScoreCard: React.FC<HeroScoreCardProps> = ({ analysis }) => {
  const result = analysis.result;
  const tier = formatScoreTier(result.compatibility);

  // SVG circular gauge geometry
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (result.compatibility / 100) * circumference;

  return (
    <Card className="p-6 sm:p-8 bg-gradient-to-br from-white via-emerald-50/20 to-cyan-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-emerald-950/20 border-emerald-500/30 dark:border-emerald-500/20 shadow-xl relative overflow-hidden">
      {/* Background glow halos */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
        {/* Left Side Details */}
        <div className="space-y-4 max-w-2xl text-center lg:text-left">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-600 text-white flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> Optimal Material Match
            </span>
            <Badge variant="cyan">{analysis.input.commodity}</Badge>
            <Badge variant="slate">{analysis.input.storageType} ({analysis.input.temperature}°C)</Badge>
            {analysis.input.freshProduce && <Badge variant="emerald">Fresh Produce EMAP</Badge>}
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight leading-snug">
              {result.materialName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Synthesized by PACKWISE AI rule model to satisfy oxygen protection, moisture transmission, cold-chain temperature thresholds, and target shelf-life.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Indicative Shelf-Life
              </p>
              <p className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                {result.shelfLife.min} – {result.shelfLife.max} Days
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                <Layers className="w-3.5 h-3.5 text-cyan-500" /> Target Thickness
              </p>
              <p className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                {result.specifications.thickness}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Seal Integrity
              </p>
              <p className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                {result.specifications.sealability}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Circularity LCA
              </p>
              <p className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                {result.sustainability.overall}% Rating
              </p>
            </div>
          </div>
        </div>

        {/* Right Side Circular Gauge */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="10"
                fill="none"
              />
              {/* Animated Progress circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-emerald-500 dark:stroke-emerald-400 transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Inner Score Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tighter">
                {result.compatibility}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                Score
              </span>
            </div>
          </div>

          <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border ${tier.bg} ${tier.color} ${tier.border}`}>
            {tier.label}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            Prototype Compatibility Score
          </p>
        </div>
      </div>
    </Card>
  );
};
