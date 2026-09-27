import React, { useState } from 'react';
import { PackagingMaterial } from '../types/material';
import { MaterialCard } from '../components/materials/MaterialCard';
import { MaterialDetailModal } from '../components/materials/MaterialDetailModal';
import { MaterialCompareDock } from '../components/materials/MaterialCompareDock';
import { MaterialCompareModal } from '../components/materials/MaterialCompareModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../hooks/useToast';
import { Search, Database, Scale, ArrowUpDown, Filter, Sparkles } from 'lucide-react';

export interface MaterialsPageProps {
  materials: PackagingMaterial[];
  onStartAnalysisWithMaterial?: (material: PackagingMaterial) => void;
}

export const MaterialsPage: React.FC<MaterialsPageProps> = ({ materials }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'oxygen' | 'moisture' | 'cost' | 'eco'>('name');
  const [selectedDetailMaterial, setSelectedDetailMaterial] = useState<PackagingMaterial | null>(null);
  const [selectedCompareSlugs, setSelectedCompareSlugs] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const { info } = useToast();

  const categories = ['All', ...Array.from(new Set(materials.map((m) => m.category)))];

  const handleToggleCompare = (slug: string) => {
    setSelectedCompareSlugs((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((s) => s !== slug);
      }
      if (prev.length >= 3) {
        info('Compare Limit', 'Select up to 3 materials for side-by-side comparison.');
        return prev;
      }
      return [...prev, slug];
    });
  };

  const filtered = materials.filter((m) => {
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase()) ||
      m.typical_applications.some((a) => a.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'oxygen') return b.oxygen_barrier - a.oxygen_barrier;
    if (sortBy === 'moisture') return b.moisture_barrier - a.moisture_barrier;
    if (sortBy === 'cost') return a.relative_cost - b.relative_cost;
    if (sortBy === 'eco') return b.sustainability - a.sustainability;
    return 0;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
              <Database className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Engineering Library
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Packaging Materials Database
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Reference physical properties, barrier ratings, and commercial applications for 13+ food packaging films.
          </p>
        </div>

        {selectedCompareSlugs.length > 0 && (
          <Button
            size="sm"
            onClick={() => setCompareModalOpen(true)}
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Scale className="w-3.5 h-3.5 mr-1" />
            Compare ({selectedCompareSlugs.length}) Side-by-Side
          </Button>
        )}
      </div>

      {/* Search & Filters Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by material name, category, or application (e.g. EVOH, Coffee, LDPE)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="name">Alphabetical (Name)</option>
              <option value="oxygen">Highest O₂ Barrier</option>
              <option value="moisture">Highest Moisture Barrier</option>
              <option value="cost">Lowest Cost First</option>
              <option value="eco">Highest Circularity / Eco</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Materials Cards Grid */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((material) => (
            <MaterialCard
              key={material.slug}
              material={material}
              onOpenDetail={(m) => setSelectedDetailMaterial(m)}
              onToggleCompare={handleToggleCompare}
              isComparing={selectedCompareSlugs.includes(material.slug)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 p-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
          <Database className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No packaging materials matched
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or selecting another category filter.
          </p>
        </div>
      )}

      {/* Floating Compare Dock */}
      <MaterialCompareDock
        selectedSlugs={selectedCompareSlugs}
        materials={materials}
        onRemoveSlug={(slug) => setSelectedCompareSlugs((p) => p.filter((s) => s !== slug))}
        onClearAll={() => setSelectedCompareSlugs([])}
        onOpenCompareModal={() => setCompareModalOpen(true)}
      />

      {/* Detail Modal */}
      <MaterialDetailModal
        material={selectedDetailMaterial}
        isOpen={Boolean(selectedDetailMaterial)}
        onClose={() => setSelectedDetailMaterial(null)}
      />

      {/* Compare Modal */}
      <MaterialCompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        selectedSlugs={selectedCompareSlugs}
        materials={materials}
      />
    </div>
  );
};
