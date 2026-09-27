import React, { useState } from 'react';
import { SavedAnalysis } from '../types/analysis';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { formatDate, formatScoreTier } from '../utils/formatters';
import { deleteAnalysis } from '../services/analysesService';
import { generateAnalysisPDF } from '../lib/pdfGenerator';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  History,
  Search,
  Trash2,
  ExternalLink,
  RotateCcw,
  Download,
  Calendar,
  Layers,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export interface HistoryPageProps {
  analyses: SavedAnalysis[];
  onOpenAnalysis: (analysis: SavedAnalysis) => void;
  onTweakAnalysis: (analysis: SavedAnalysis) => void;
  onNavigate: (page: string) => void;
  onRefresh: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  analyses,
  onOpenAnalysis,
  onTweakAnalysis,
  onNavigate,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [storageFilter, setStorageFilter] = useState('All');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useAuth();
  const { success, error } = useToast();

  const filtered = analyses.filter((a) => {
    const matchesStorage = storageFilter === 'All' || a.input.storageType === storageFilter;
    const matchesSearch =
      !search ||
      a.input.commodity.toLowerCase().includes(search.toLowerCase()) ||
      a.result.materialName.toLowerCase().includes(search.toLowerCase());
    return matchesStorage && matchesSearch;
  });

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteAnalysis(deleteTargetId, user?.id);
      success('Analysis deleted', 'Record removed from your history.');
      setDeleteTargetId(null);
      onRefresh();
    } catch (err: any) {
      error('Failed to delete', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <History className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Saved Assessments
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Analysis History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search, reopen, duplicate, or export your saved food packaging assessments.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => onNavigate('new-analysis')}
          className="text-xs font-bold"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1" /> New Analysis
        </Button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by commodity name or recommended packaging material..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['All', 'Ambient', 'Chilled', 'Cold Storage', 'Frozen'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStorageFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                storageFilter === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* List / Cards */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((item) => {
            const tier = formatScoreTier(item.result.compatibility);
            return (
              <Card
                key={item.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                {/* Info */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-base font-display text-slate-900 dark:text-slate-100">
                      {item.input.commodity}
                    </span>
                    <Badge variant="cyan" className="text-[10px]">
                      {item.input.category}
                    </Badge>
                    <Badge variant="slate" className="text-[10px]">
                      {item.input.storageType} ({item.input.temperature}°C)
                    </Badge>
                    {item.local && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-semibold">
                        [Browser Local]
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Recommended:{' '}
                    <strong className="text-emerald-700 dark:text-emerald-300">
                      {item.result.materialName}
                    </strong>
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {formatDate(item.createdAt)}
                    </span>
                    <span>·</span>
                    <span>Target: {item.input.shelfLifeTarget} days</span>
                    <span>·</span>
                    <span>Indicative: {item.result.shelfLife.min}–{item.result.shelfLife.max} days</span>
                  </div>
                </div>

                {/* Score & Actions */}
                <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold font-mono border ${tier.bg} ${tier.color} ${tier.border}`}>
                      {item.result.compatibility}% Match
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => generateAnalysisPDF(item)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                      title="Download PDF Report"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onTweakAnalysis(item)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                      title="Duplicate & Tweak"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <Button
                      size="sm"
                      onClick={() => onOpenAnalysis(item)}
                      className="text-xs font-semibold"
                    >
                      View Results <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </Button>

                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(item.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Analysis"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 p-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <History className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No analyses yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Start your first packaging analysis to evaluate barrier protection, shelf-life, and circularity.
          </p>
          <Button size="sm" onClick={() => onNavigate('new-analysis')} className="text-xs font-bold mt-2">
            Start Packaging Analysis
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        title="Delete Analysis Record"
        description="Are you sure you want to delete this packaging assessment? This action cannot be undone."
        maxWidth="sm"
      >
        <div className="flex items-center gap-3 justify-end pt-4">
          <Button variant="outline" size="sm" onClick={() => setDeleteTargetId(null)} className="text-xs">
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={isDeleting}
            onClick={handleDeleteConfirm}
            className="text-xs font-bold"
          >
            Delete Permanently
          </Button>
        </div>
      </Modal>
    </div>
  );
};
