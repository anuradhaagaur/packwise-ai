import React, { useEffect, useState } from 'react';
import { FlaskConical, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export interface AnalysisLoadingModalProps {
  isOpen: boolean;
  commodityName: string;
  onComplete: () => void;
}

const STEPS = [
  { id: 1, label: 'Biochemical Food Property Profiling', detail: 'Evaluating moisture activity, fat oxidation risk, and pH stability' },
  { id: 2, label: 'Dynamic Barrier Requirements Calculation', detail: 'Computing OTR, WVTR, and light barrier target matrices' },
  { id: 3, label: 'Material Database Multi-Factor Matching', detail: 'Scoring 13+ food packaging films against target constraints' },
  { id: 4, label: 'Circularity & MAP Gas Optimization', detail: 'Formulating modified atmosphere equilibrium and LCA profile' },
  { id: 5, label: 'Packaging Recommendation Synthesized', detail: 'Finalizing compatibility score, specifications, and alternatives' },
];

export const AnalysisLoadingModal: React.FC<AnalysisLoadingModalProps> = ({
  isOpen,
  commodityName,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 400);
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        {/* Animated Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center text-white shadow-glow">
          <FlaskConical className="w-8 h-8 animate-pulse" />
          <div className="absolute -inset-1 rounded-2xl bg-emerald-500/20 blur-md -z-10 animate-ping" />
        </div>

        <div>
          <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            Analyzing Packaging for <span className="text-emerald-500">{commodityName}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Running rule-based food science barrier engine & circularity scoring...
          </p>
        </div>

        {/* Steps List */}
        <div className="space-y-3 text-left pt-2">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300/60 dark:border-emerald-800/60'
                    : isCurrent
                    ? 'bg-cyan-50/70 dark:bg-cyan-950/30 border-cyan-400/80 dark:border-cyan-700/80 shadow-sm ring-1 ring-cyan-500/30'
                    : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-40'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[9px] text-slate-400">
                      {idx + 1}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-xs font-semibold ${
                      isDone
                        ? 'text-emerald-900 dark:text-emerald-200'
                        : isCurrent
                        ? 'text-cyan-900 dark:text-cyan-200 font-bold'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-[10px] text-cyan-700 dark:text-cyan-400 mt-0.5 animate-in fade-in">
                      {step.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300 rounded-full"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
