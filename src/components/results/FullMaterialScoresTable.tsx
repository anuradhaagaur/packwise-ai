import React, { useState } from 'react';
import { MaterialScore, PackagingMaterial } from '../../types/material';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatScoreTier } from '../../utils/formatters';
import { ArrowUpDown, CheckCircle, Scale, ChevronRight } from 'lucide-react';

export interface FullMaterialScoresTableProps {
  scores: MaterialScore[];
  materials: PackagingMaterial[];
  recommendedSlug: string;
  onOpenMaterialModal: (material: PackagingMaterial) => void;
  onToggleCompare?: (slug: string) => void;
  selectedCompareSlugs?: string[];
}

export const FullMaterialScoresTable: React.FC<FullMaterialScoresTableProps> = ({
  scores,
  materials,
  recommendedSlug,
  onOpenMaterialModal,
  onToggleCompare,
  selectedCompareSlugs = [],
}) => {
  const [sortField, setSortField] = useState<'score' | 'name'>('score');
  const [sortAsc, setSortAsc] = useState(false);

  const materialsMap = new Map<string, PackagingMaterial>(materials.map((m) => [m.slug, m]));

  const sortedScores = [...scores].sort((a, b) => {
    if (sortField === 'score') {
      return sortAsc ? a.score - b.score : b.score - a.score;
    }
    return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
  });

  return (
    <Card className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
            Full Material Database Evaluation Ranking
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scored against all 13 reference packaging polymers and barrier composites.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Sort:</span>
          <button
            onClick={() => {
              if (sortField === 'score') setSortAsc(!sortAsc);
              else {
                setSortField('score');
                setSortAsc(false);
              }
            }}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 ${
              sortField === 'score'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-700'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            Score <ArrowUpDown className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              if (sortField === 'name') setSortAsc(!sortAsc);
              else {
                setSortField('name');
                setSortAsc(true);
              }
            }}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 ${
              sortField === 'name'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-700'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            Name <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Rank</th>
              <th className="py-2.5 px-3">Material Name & Category</th>
              <th className="py-2.5 px-3 text-center">Score</th>
              <th className="py-2.5 px-3">O₂ Barrier</th>
              <th className="py-2.5 px-3">H₂O Barrier</th>
              <th className="py-2.5 px-3">Cost</th>
              <th className="py-2.5 px-3">Circularity</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {sortedScores.map((item, idx) => {
              const mat = materialsMap.get(item.slug);
              const isRecommended = item.slug === recommendedSlug;
              const isComparing = selectedCompareSlugs.includes(item.slug);
              const tier = formatScoreTier(item.score);

              return (
                <tr
                  key={item.slug}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                    isRecommended ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-mono font-bold text-slate-400">
                    #{idx + 1}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => mat && onOpenMaterialModal(mat)}
                        className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 text-left transition-colors"
                      >
                        {item.name}
                      </button>
                      {isRecommended && (
                        <Badge variant="emerald" className="text-[10px] py-0">
                          Selected Match
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">{mat?.category || 'Polymer Film'}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-extrabold font-mono border ${tier.bg} ${tier.color} ${tier.border}`}>
                      {item.score}%
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                    {mat ? `${mat.oxygen_barrier}/5` : '—'}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                    {mat ? `${mat.moisture_barrier}/5` : '—'}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                    {mat ? '$'.repeat(mat.relative_cost) : '—'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                      {mat?.recyclability || 'High'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onToggleCompare && (
                        <button
                          type="button"
                          onClick={() => onToggleCompare(item.slug)}
                          className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                            isComparing
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {isComparing ? 'Comparing' : '+ Compare'}
                        </button>
                      )}
                      {mat && (
                        <button
                          type="button"
                          onClick={() => onOpenMaterialModal(mat)}
                          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                          aria-label="View material specs"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
