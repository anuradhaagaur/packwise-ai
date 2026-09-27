import React from 'react';
import { PackagingMaterial } from '../../types/material';
import { Button } from '../ui/Button';
import { Scale, X, ArrowRight } from 'lucide-react';

export interface MaterialCompareDockProps {
  selectedSlugs: string[];
  materials: PackagingMaterial[];
  onRemoveSlug: (slug: string) => void;
  onClearAll: () => void;
  onOpenCompareModal: () => void;
}

export const MaterialCompareDock: React.FC<MaterialCompareDockProps> = ({
  selectedSlugs,
  materials,
  onRemoveSlug,
  onClearAll,
  onOpenCompareModal,
}) => {
  if (selectedSlugs.length === 0) return null;

  const selectedMaterials = selectedSlugs
    .map((s) => materials.find((m) => m.slug === s))
    .filter(Boolean) as PackagingMaterial[];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-in slide-in-from-bottom duration-300">
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/95 dark:bg-slate-900/95 text-white border border-slate-700/80 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Chips */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <div className="flex items-center gap-1.5 shrink-0 text-xs font-semibold text-emerald-400">
            <Scale className="w-4 h-4" />
            <span>Comparing ({selectedSlugs.length}/3):</span>
          </div>

          <div className="flex items-center gap-2">
            {selectedMaterials.map((mat) => (
              <div
                key={mat.slug}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium shrink-0"
              >
                <span className="truncate max-w-[120px]">{mat.name}</span>
                <button
                  onClick={() => onRemoveSlug(mat.slug)}
                  className="text-slate-400 hover:text-white transition-colors"
                  aria-label="Remove material"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onClearAll}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1"
          >
            Clear
          </button>
          <Button
            size="sm"
            onClick={onOpenCompareModal}
            className="text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 shrink-0"
          >
            Compare Side-by-Side <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
