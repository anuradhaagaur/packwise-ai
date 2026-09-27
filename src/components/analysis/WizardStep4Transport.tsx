import React from 'react';
import { AnalysisInput, HandlingIntensity, MechanicalRisk, TransportMode } from '../../types/analysis';
import { Truck, ShieldCheck, DollarSign, Leaf, Clock, Navigation } from 'lucide-react';

export interface WizardStep4TransportProps {
  input: AnalysisInput;
  onChange: (updates: Partial<AnalysisInput>) => void;
}

const TRANSPORT_MODES: { mode: TransportMode; label: string; icon: string }[] = [
  { mode: 'Road', label: 'Road Freight (Reefer / Dry Truck)', icon: '🚛' },
  { mode: 'Rail', label: 'Rail Cargo / Long Haul', icon: '🚆' },
  { mode: 'Air', label: 'Air Cargo Express', icon: '✈️' },
  { mode: 'Sea', label: 'Maritime Container Shipping', icon: '🚢' },
  { mode: 'Local Distribution', label: 'Last-Mile / Urban Distribution', icon: '🛵' },
];

export const WizardStep4Transport: React.FC<WizardStep4TransportProps> = ({ input, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display">
          4. Transportation & Commercial Priorities
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Mechanical stresses, logistics duration, and business weight preferences.
        </p>
      </div>

      {/* Transport Mode */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-cyan-500" /> Primary Transportation Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {TRANSPORT_MODES.map((tm) => {
            const isSelected = input.transportMode === tm.mode;
            return (
              <button
                key={tm.mode}
                type="button"
                onClick={() => onChange({ transportMode: tm.mode })}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-sm ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span className="text-xl">{tm.icon}</span>
                <div>
                  <p className="font-bold text-xs">{tm.mode}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{tm.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Transit Hours, Mechanical Risk, Handling */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Transit Hours */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-500" /> Transit Duration (Hours)
          </label>
          <input
            type="number"
            min="1"
            max="720"
            value={input.transportHours}
            onChange={(e) => onChange({ transportHours: parseInt(e.target.value) || 24 })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono font-bold"
          />
        </div>

        {/* Mechanical Risk */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Puncture / Mechanical Risk
          </label>
          <select
            value={input.mechanicalRisk}
            onChange={(e) => onChange({ mechanicalRisk: e.target.value as MechanicalRisk })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            {(['Low', 'Medium', 'High'] as MechanicalRisk[]).map((r) => (
              <option key={r} value={r}>
                {r} Risk
              </option>
            ))}
          </select>
        </div>

        {/* Handling Intensity */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-amber-500" /> Handling Intensity
          </label>
          <select
            value={input.handling}
            onChange={(e) => onChange({ handling: e.target.value as HandlingIntensity })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            {(['Low', 'Moderate', 'High'] as HandlingIntensity[]).map((h) => (
              <option key={h} value={h}>
                {h} Handling
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Priorities Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
        {/* Sustainability Priority */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-500" /> Sustainability & Circularity Priority
            </label>
            <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
              Level {input.sustainabilityPreference}/5
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={input.sustainabilityPreference}
            onChange={(e) => onChange({ sustainabilityPreference: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Standard (1)</span>
            <span>Balanced (3)</span>
            <span>Zero-Waste / Bio (5)</span>
          </div>
        </div>

        {/* Cost Priority */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-cyan-500" /> Cost Economy Priority
            </label>
            <span className="text-xs font-bold font-mono text-cyan-600 dark:text-cyan-400">
              Level {input.costPreference}/5
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={input.costPreference}
            onChange={(e) => onChange({ costPreference: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Performance First (1)</span>
            <span>Balanced (3)</span>
            <span>Cost-Driven (5)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
