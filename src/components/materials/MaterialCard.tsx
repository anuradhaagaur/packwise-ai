import React from 'react';
import { PackagingMaterial } from '../../types/material';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Layers, Wind, Droplets, Sun, Scale, Info, Check } from 'lucide-react';

export interface MaterialCardProps {
  material: PackagingMaterial;
  onOpenDetail: (material: PackagingMaterial) => void;
  onToggleCompare: (slug: string) => void;
  isComparing: boolean;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onOpenDetail,
  onToggleCompare,
  isComparing,
}) => {
  return (
    <Card hoverable className="p-5 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex items-start justify-between gap-2">
          <Badge variant="cyan" className="text-[10px]">
            {material.category}
          </Badge>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
            {material.recyclability}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <button
            type="button"
            onClick={() => onOpenDetail(material)}
            className="text-left font-display font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors leading-snug"
          >
            {material.name}
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {material.description}
          </p>
        </div>

        {/* Barrier Indicators Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-0.5">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
              <Wind className="w-3 h-3 text-cyan-500" /> O₂ Barrier
            </span>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {material.oxygen_barrier} / 5
            </p>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-0.5">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
              <Droplets className="w-3 h-3 text-blue-500" /> H₂O Barrier
            </span>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {material.moisture_barrier} / 5
            </p>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-0.5">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
              <Sun className="w-3 h-3 text-amber-500" /> Light
            </span>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {material.light_barrier} / 5
            </p>
          </div>
        </div>

        {/* Thickness & Cost */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Thickness: <strong className="text-slate-700 dark:text-slate-300">{material.thickness_range}</strong></span>
          <span>Cost Index: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{'$'.repeat(material.relative_cost)}</strong></span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onOpenDetail(material)}
          className="flex-1 py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1"
        >
          <Info className="w-3.5 h-3.5 text-slate-400" />
          Datasheet
        </button>

        <button
          type="button"
          onClick={() => onToggleCompare(material.slug)}
          className={`py-1.5 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1 ${
            isComparing
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          {isComparing ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5 text-emerald-500" />}
          {isComparing ? 'Comparing' : 'Compare'}
        </button>
      </div>
    </Card>
  );
};
