import React, { useState, useEffect } from 'react';
import { AnalysisInput, RecommendationResult, SavedAnalysis } from '../types/analysis';
import { Commodity } from '../types/commodity';
import { PackagingMaterial } from '../types/material';
import { WizardStep1Product } from '../components/analysis/WizardStep1Product';
import { WizardStep2Properties } from '../components/analysis/WizardStep2Properties';
import { WizardStep3Storage } from '../components/analysis/WizardStep3Storage';
import { WizardStep4Transport } from '../components/analysis/WizardStep4Transport';
import { AnalysisLoadingModal } from '../components/analysis/AnalysisLoadingModal';
import { runPackagingAnalysis } from '../services/recommendationEngine';
import { saveAnalysis, saveDraftAnalysis, getDraftAnalysis, clearDraftAnalysis } from '../services/analysesService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Sparkles, ArrowLeft, ArrowRight, RotateCcw, Bookmark, Play, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface NewAnalysisPageProps {
  commodities: Commodity[];
  materials: PackagingMaterial[];
  onAnalysisCompleted: (saved: SavedAnalysis) => void;
  initialInput?: AnalysisInput | null;
}

const DEFAULT_INPUT: AnalysisInput = {
  commodity: 'Tomato (Fresh)',
  category: 'Vegetables',
  freshProduce: true,
  moisture: 94.0,
  oil: 0.2,
  ph: 4.2,
  respiration: 'High',
  respirationRate: 45,
  sensitivities: ['Moisture Sensitive', 'Microbial Spoilage Sensitive'],
  productForm: 'Whole',
  storageType: 'Chilled',
  temperature: 4,
  humidity: 90,
  shelfLifeTarget: 21,
  lightExposure: 'Low',
  transportMode: 'Road',
  transportHours: 24,
  handling: 'Moderate',
  mechanicalRisk: 'Medium',
  tempFluctuation: 'Moderate',
  sustainabilityPreference: 4,
  costPreference: 3,
};

export const NewAnalysisPage: React.FC<NewAnalysisPageProps> = ({
  commodities,
  materials,
  onAnalysisCompleted,
  initialInput,
}) => {
  const [step, setStep] = useState(1);
  const [input, setInput] = useState<AnalysisInput>(initialInput || DEFAULT_INPUT);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingResult, setPendingResult] = useState<RecommendationResult | null>(null);

  const { user } = useAuth();
  const { success, error, info } = useToast();

  useEffect(() => {
    if (initialInput) {
      setInput(initialInput);
    } else {
      const draft = getDraftAnalysis();
      if (draft) {
        setInput(draft);
      }
    }
  }, [initialInput]);

  const handleUpdateInput = (updates: Partial<AnalysisInput>) => {
    setInput((prev) => {
      const next = { ...prev, ...updates };
      saveDraftAnalysis(next);
      return next;
    });
  };

  const handleReset = () => {
    clearDraftAnalysis();
    setInput(DEFAULT_INPUT);
    setStep(1);
    info('Analysis inputs reset to defaults');
  };

  const handleRunAnalysis = () => {
    if (!input.commodity.trim()) {
      error('Please enter a commodity name in Step 1');
      setStep(1);
      return;
    }

    try {
      const result = runPackagingAnalysis(input, materials);
      setPendingResult(result);
      setIsAnalyzing(true);
    } catch (err: any) {
      error('Analysis failed', err.message || 'Could not score materials');
    }
  };

  const handleAnalysisAnimationComplete = async () => {
    setIsAnalyzing(false);
    if (!pendingResult) return;

    try {
      const saved = await saveAnalysis(input, pendingResult, user?.id);
      clearDraftAnalysis();

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#3b82f6'],
        });
      } catch {}

      success('Analysis Completed', `Optimal packaging: ${pendingResult.materialName}`);
      onAnalysisCompleted(saved);
    } catch (err: any) {
      error('Could not save analysis', err.message);
    }
  };

  const stepTitles = [
    { num: 1, title: 'Product', desc: 'Category & Form' },
    { num: 2, title: 'Properties', desc: 'Moisture, pH & Lipids' },
    { num: 3, title: 'Storage', desc: 'Temp, RH & Shelf-Life' },
    { num: 4, title: 'Transport', desc: 'Logistics & Weights' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              New Packaging Evaluation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Describe Your Food Product
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Four streamlined steps. Defaults are auto-filled from the food science library and fully adjustable.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="text-xs">
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
          </Button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {stepTitles.map((s) => {
          const isDone = s.num < step;
          const isCurrent = s.num === step;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                isCurrent
                  ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20 shadow-sm'
                  : isDone
                  ? 'border-emerald-300/60 dark:border-emerald-800/60 bg-white/70 dark:bg-slate-900/60 text-emerald-800 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Step 0{s.num}
                </span>
                {isDone && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              </div>
              <p className="text-xs font-bold truncate font-display">{s.title}</p>
              <p className="text-[10px] opacity-80 truncate hidden sm:block">{s.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Active Step Card */}
      <Card className="p-6 sm:p-8">
        {step === 1 && (
          <WizardStep1Product
            input={input}
            onChange={handleUpdateInput}
            commodities={commodities}
          />
        )}
        {step === 2 && (
          <WizardStep2Properties input={input} onChange={handleUpdateInput} />
        )}
        {step === 3 && (
          <WizardStep3Storage input={input} onChange={handleUpdateInput} />
        )}
        {step === 4 && (
          <WizardStep4Transport input={input} onChange={handleUpdateInput} />
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-200 dark:border-slate-800">
          <div>
            {step > 1 && (
              <Button
                variant="outline"
                size="md"
                onClick={() => setStep((s) => s - 1)}
                className="text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Previous Step
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step < 4 ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => setStep((s) => s + 1)}
                className="text-xs font-bold"
              >
                Next Step <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleRunAnalysis}
                className="text-sm font-bold shadow-glow"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Run Packaging Analysis
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Loading Modal Sequence */}
      <AnalysisLoadingModal
        isOpen={isAnalyzing}
        commodityName={input.commodity}
        onComplete={handleAnalysisAnimationComplete}
      />
    </div>
  );
};
