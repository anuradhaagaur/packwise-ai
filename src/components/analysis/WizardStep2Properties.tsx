import React from 'react';
import { AnalysisInput } from '../../types/analysis';
import { RespirationLevel, SensitivityTag } from '../../types/commodity';
import { Droplets, Flame, Activity, ShieldAlert, Sparkles } from 'lucide-react';

export interface WizardStep2PropertiesProps {
  input: AnalysisInput;
  onChange: (updates: Partial<AnalysisInput>) => void;
}

const SENSITIVITY_OPTIONS: SensitivityTag[] = [
  'Moisture Sensitive',
  'Oxygen Sensitive',
  'Light Sensitive',
  'Aroma Sensitive',
  'Oxidation Sensitive',
  'Microbial Spoilage Sensitive',
];

const RESPIRATION_LEVELS: RespirationLevel[] = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];

export const WizardStep2Properties: React.FC<WizardStep2PropertiesProps> = ({ input, onChange }) => {
  const toggleSensitivity = (tag: SensitivityTag) => {
    const exists = input.sensitivities.includes(tag);
    if (exists) {
      onChange({ sensitivities: input.sensitivities.filter((s) => s !== tag) });
    } else {
      onChange({ sensitivities: [...input.sensitivities, tag] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display">
          2. Food Intrinsic Properties & Vulnerabilities
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Specify the biochemical attributes that dictate oxygen, water vapor, and microbial barrier requirements.
        </p>
      </div>

      {/* Numeric Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Moisture % */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-500" /> Moisture Content
            </label>
            <span className="text-sm font-bold font-mono text-cyan-600 dark:text-cyan-400">{input.moisture}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={input.moisture}
            onChange={(e) => onChange({ moisture: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Dry (0%)</span>
            <span>Intermediate (50%)</span>
            <span>Wet / Hydrated (100%)</span>
          </div>
        </div>

        {/* Fat / Oil % */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Fat / Lipid Content
            </label>
            <span className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400">{input.oil}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={input.oil}
            onChange={(e) => onChange({ oil: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Lean (0%)</span>
            <span>Moderate (20%)</span>
            <span>High Fat / Oil (100%)</span>
          </div>
        </div>

        {/* pH Level */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-500" /> Acidity / pH Level
            </label>
            <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">pH {input.ph}</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="14.0"
            step="0.1"
            value={input.ph}
            onChange={(e) => onChange({ ph: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Acidic (pH 2)</span>
            <span>Neutral (pH 7)</span>
            <span>Alkaline (pH 12)</span>
          </div>
        </div>
      </div>

      {/* Fresh Produce Respiration Section */}
      {input.freshProduce && (
        <div className="p-4 rounded-xl border border-emerald-300/60 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Fresh Produce Respiration Rate
              </h4>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400">
                Determines required O₂/CO₂ gas transmission rate (OTR) to avoid anaerobic fermentation.
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100">
              {input.respiration} Respiration
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {RESPIRATION_LEVELS.map((lvl) => {
              const active = input.respiration === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onChange({ respiration: lvl })}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-emerald-200/60 dark:border-emerald-800/60 hover:bg-emerald-100/50'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sensitivities Multi-Select */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Food Vulnerabilities & Degradation Sensitivities
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {SENSITIVITY_OPTIONS.map((tag) => {
            const checked = input.sensitivities.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleSensitivity(tag)}
                className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2.5 ${
                  checked
                    ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                    checked
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 bg-transparent'
                  }`}
                >
                  {checked && <span className="text-[10px] font-bold">✓</span>}
                </div>
                <span>{tag}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
