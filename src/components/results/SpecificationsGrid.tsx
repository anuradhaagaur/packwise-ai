import React from 'react';
import { MapConditions, PackagingSpecifications } from '../../types/analysis';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Layers, Wind, Droplets, Shield, Zap, Sparkles } from 'lucide-react';

export interface SpecificationsGridProps {
  specifications: PackagingSpecifications;
  mapConditions: MapConditions;
}

export const SpecificationsGrid: React.FC<SpecificationsGridProps> = ({
  specifications,
  mapConditions,
}) => {
  const specs = [
    {
      label: 'Oxygen Transmission Rate (OTR)',
      value: specifications.otr,
      desc: 'cc / m² · 24h · 1 atm (ASTM D3985 standard)',
      icon: Wind,
      color: 'text-cyan-500',
    },
    {
      label: 'Water Vapor Transmission Rate (WVTR)',
      value: specifications.wvtr,
      desc: 'g / m² · 24h · 90% RH (ASTM F1249 standard)',
      icon: Droplets,
      color: 'text-blue-500',
    },
    {
      label: 'Film Gauge / Thickness Range',
      value: specifications.thickness,
      desc: 'Micro-meter (µm) thickness window',
      icon: Layers,
      color: 'text-purple-500',
    },
    {
      label: 'Heat Sealability & Integrity',
      value: specifications.sealability,
      desc: 'Hermetic seal strength and hot-tack tolerance',
      icon: Zap,
      color: 'text-amber-500',
    },
    {
      label: 'Tensile & Puncture Strength',
      value: specifications.mechanical,
      desc: 'Puncture resistance during logistics and stacking',
      icon: Shield,
      color: 'text-emerald-500',
    },
    {
      label: 'Modified Atmosphere Packaging (MAP)',
      value: specifications.map,
      desc: mapConditions.applicable
        ? `Target gas blend: O₂ ${mapConditions.o2} · CO₂ ${mapConditions.co2} · N₂ ${mapConditions.n2}`
        : 'Gas flushing not recommended for this commodity type',
      icon: Sparkles,
      color: 'text-indigo-500',
    },
  ];

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
            Engineered Technical Packaging Specifications
          </h3>
        </div>
        <Badge variant="cyan">Technical Datasheet</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {specs.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
              <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {item.value}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
