import React from 'react';
import { PackagingMaterial } from '../../types/material';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Wind,
  Droplets,
  Sun,
  Shield,
  Zap,
  DollarSign,
  Leaf,
  Layers,
  Thermometer,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export interface MaterialDetailModalProps {
  material: PackagingMaterial | null;
  isOpen: boolean;
  onClose: () => void;
  onStartAnalysisWithMaterial?: (material: PackagingMaterial) => void;
}

export const MaterialDetailModal: React.FC<MaterialDetailModalProps> = ({
  material,
  isOpen,
  onClose,
  onStartAnalysisWithMaterial,
}) => {
  if (!material) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={material.name}
      description={`${material.category} · Technical Polymer Datasheet & Barrier Specs`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Description & Quick Tags */}
        <div className="space-y-2">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {material.description}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="cyan">{material.category}</Badge>
            <Badge variant="slate">Recyclability: {material.recyclability}</Badge>
            {material.map_suitable && <Badge variant="emerald">MAP Gas Flush Suitable</Badge>}
            {material.fresh_produce_suitable && <Badge variant="emerald">Fresh Produce Breathable</Badge>}
          </div>
        </div>

        {/* 6-Core Radar Metrics */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Barrier & Physical Property Ratings (1–5 Scale)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Oxygen Barrier', val: material.oxygen_barrier, icon: Wind, color: 'text-cyan-500' },
              { label: 'Moisture Barrier', val: material.moisture_barrier, icon: Droplets, color: 'text-blue-500' },
              { label: 'Light Barrier', val: material.light_barrier, icon: Sun, color: 'text-amber-500' },
              { label: 'Sealability', val: material.sealability, icon: Zap, color: 'text-purple-500' },
              { label: 'Mechanical Strength', val: material.mechanical_strength, icon: Shield, color: 'text-emerald-500' },
              { label: 'Circularity Rating', val: material.sustainability, icon: Leaf, color: 'text-emerald-600' },
            ].map((prop, idx) => {
              const Icon = prop.icon;
              return (
                <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${prop.color}`} /> {prop.label}
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{prop.val}/5</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(prop.val / 5) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quantitative Engineering Specifications Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Laboratory Quantitative Parameters
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">OTR (Oxygen Transmission)</span>
              <p className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {material.otr_value} cc/m²·day
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{material.otr_label}</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">WVTR (Water Vapor)</span>
              <p className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {material.wvtr_value} g/m²·day
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{material.wvtr_label}</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Thickness Range</span>
              <p className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {material.thickness_range}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Typical commercial gauge</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Temperature Tolerance</span>
              <p className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {material.temp_min}°C to {material.temp_max}°C
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Cold-chain to heat tolerance</p>
            </div>
          </div>
        </div>

        {/* Typical Applications */}
        {material.typical_applications && material.typical_applications.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Typical Commercial Applications
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {material.typical_applications.map((app, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium border border-emerald-200/50 dark:border-emerald-800/50"
                >
                  {app}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
