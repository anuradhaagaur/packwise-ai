import React from 'react';
import { AnalysisInput, LightExposure, TemperatureFluctuation } from '../../types/analysis';
import { StorageType } from '../../types/commodity';
import { Thermometer, Gauge, Clock, Sun, Zap } from 'lucide-react';

export interface WizardStep3StorageProps {
  input: AnalysisInput;
  onChange: (updates: Partial<AnalysisInput>) => void;
}

const STORAGE_TYPES: { type: StorageType; defaultTemp: number; defaultRH: number; label: string }[] = [
  { type: 'Ambient', defaultTemp: 25, defaultRH: 60, label: 'Ambient (Room Temp, 20–25°C)' },
  { type: 'Chilled', defaultTemp: 4, defaultRH: 88, label: 'Chilled (Cold Chain, 2–6°C)' },
  { type: 'Cold Storage', defaultTemp: 2, defaultRH: 90, label: 'Cold Storage (1–4°C)' },
  { type: 'Frozen', defaultTemp: -18, defaultRH: 95, label: 'Frozen (-18°C or lower)' },
];

export const WizardStep3Storage: React.FC<WizardStep3StorageProps> = ({ input, onChange }) => {
  const handleStorageTypeChange = (st: typeof STORAGE_TYPES[number]) => {
    onChange({
      storageType: st.type,
      temperature: st.defaultTemp,
      humidity: st.defaultRH,
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display">
          3. Storage Conditions & Target Shelf-Life
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Specify environmental parameters throughout storage and retail distribution.
        </p>
      </div>

      {/* Storage Type Radio Cards */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Storage Environment Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {STORAGE_TYPES.map((st) => {
            const isSelected = input.storageType === st.type;
            return (
              <button
                key={st.type}
                type="button"
                onClick={() => handleStorageTypeChange(st)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-sm ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <p className="font-bold text-xs">{st.type}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Default {st.defaultTemp}°C · {st.defaultRH}% RH
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Temp, RH, Shelf Life Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Temperature */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-cyan-500" /> Temperature (°C)
          </label>
          <input
            type="number"
            value={input.temperature}
            onChange={(e) => onChange({ temperature: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono font-bold"
          />
        </div>

        {/* Relative Humidity */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-emerald-500" /> Relative Humidity (%)
          </label>
          <input
            type="number"
            min="10"
            max="100"
            value={input.humidity}
            onChange={(e) => onChange({ humidity: parseInt(e.target.value) || 50 })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono font-bold"
          />
        </div>

        {/* Shelf Life Target */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Target Shelf-Life (Days)
          </label>
          <input
            type="number"
            min="1"
            max="730"
            value={input.shelfLifeTarget}
            onChange={(e) => onChange({ shelfLifeTarget: parseInt(e.target.value) || 30 })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono font-bold"
          />
        </div>
      </div>

      {/* Light Exposure & Temp Fluctuations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-500" /> Retail Light Exposure
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Low', 'Medium', 'High'] as LightExposure[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => onChange({ lightExposure: lvl })}
                className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                  input.lightExposure === lvl
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-500" /> Cold-Chain Temperature Fluctuation
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Low', 'Moderate', 'High'] as TemperatureFluctuation[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => onChange({ tempFluctuation: lvl })}
                className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                  input.tempFluctuation === lvl
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-200 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
