import React, { useState } from 'react';
import { SavedAnalysis } from '../types/analysis';
import { PackagingMaterial } from '../types/material';
import { HeroScoreCard } from '../components/results/HeroScoreCard';
import { WhyRecommendedBreakdown } from '../components/results/WhyRecommendedBreakdown';
import { SpecificationsGrid } from '../components/results/SpecificationsGrid';
import { FreshProducePanel } from '../components/results/FreshProducePanel';
import { AlternativeCards } from '../components/results/AlternativeCards';
import { FullMaterialScoresTable } from '../components/results/FullMaterialScoresTable';
import { SustainabilityLCAPanel } from '../components/results/SustainabilityLCAPanel';
import { ShareModal } from '../components/results/ShareModal';
import { MaterialDetailModal } from '../components/materials/MaterialDetailModal';
import { MaterialCompareDock } from '../components/materials/MaterialCompareDock';
import { MaterialCompareModal } from '../components/materials/MaterialCompareModal';
import { generateAnalysisPDF } from '../lib/pdfGenerator';
import { createReportFromAnalysis } from '../services/reportsService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Download,
  Share2,
  Copy,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  FileCheck,
  Calendar,
  Layers,
  AlertCircle
} from 'lucide-react';

export interface ResultsPageProps {
  analysis: SavedAnalysis;
  materials: PackagingMaterial[];
  onNavigate: (page: string, params?: any) => void;
  onTweakAnalysis: (analysis: SavedAnalysis) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  analysis,
  materials,
  onNavigate,
  onTweakAnalysis,
}) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedDetailMaterial, setSelectedDetailMaterial] = useState<PackagingMaterial | null>(null);
  const [selectedCompareSlugs, setSelectedCompareSlugs] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { user } = useAuth();
  const { success, error, info } = useToast();

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      generateAnalysisPDF(analysis);
      await createReportFromAnalysis(analysis, user?.id);
      success('Technical Report Generated', 'PDF download initialized successfully.');
    } catch (err: any) {
      error('Failed to generate PDF', err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleToggleCompare = (slug: string) => {
    setSelectedCompareSlugs((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((s) => s !== slug);
      }
      if (prev.length >= 3) {
        info('Comparison Limit', 'You can compare up to 3 materials at once.');
        return prev;
      }
      return [...prev, slug];
    });
  };

  const handleSelectCompareAlternative = (slug: string) => {
    if (!selectedCompareSlugs.includes(analysis.result.materialSlug)) {
      setSelectedCompareSlugs([analysis.result.materialSlug, slug]);
    } else if (!selectedCompareSlugs.includes(slug)) {
      setSelectedCompareSlugs([...selectedCompareSlugs, slug].slice(0, 3));
    }
    setCompareModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-300 pb-16">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('dashboard')}
            className="text-xs"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
          </Button>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Analysis Results
          </span>
          {analysis.local && (
            <Badge variant="amber" className="text-[10px]">
              Local Browser Cache
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTweakAnalysis(analysis)}
            className="text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Tweak Parameters
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShareModalOpen(true)}
            className="text-xs font-semibold"
          >
            <Share2 className="w-3.5 h-3.5 mr-1" /> Share
          </Button>

          <Button
            variant="primary"
            size="sm"
            loading={isDownloading}
            onClick={handleDownloadPDF}
            className="text-xs font-bold shadow-sm"
          >
            <Download className="w-3.5 h-3.5 mr-1" /> Download Technical Report (PDF)
          </Button>
        </div>
      </div>

      {/* 1. Hero Recommendation Card */}
      <HeroScoreCard analysis={analysis} />

      {/* 2. Explainable Why Recommended Section */}
      <WhyRecommendedBreakdown result={analysis.result} />

      {/* 3. Fresh Produce EMAP Intelligence Panel (Conditional) */}
      {analysis.input.freshProduce && (
        <FreshProducePanel insights={analysis.result.freshProduce} />
      )}

      {/* 4. Technical Specifications & MAP Conditions Grid */}
      <SpecificationsGrid
        specifications={analysis.result.specifications}
        mapConditions={analysis.result.mapConditions}
      />

      {/* 5. Alternative Materials Lenses */}
      <AlternativeCards
        alternatives={analysis.result.alternatives}
        onSelectCompare={handleSelectCompareAlternative}
      />

      {/* 6. Environmental Circularity & LCA Section */}
      <SustainabilityLCAPanel sustainability={analysis.result.sustainability} />

      {/* 7. Full Material Database Comparison Ranking Table */}
      <FullMaterialScoresTable
        scores={analysis.result.scores}
        materials={materials}
        recommendedSlug={analysis.result.materialSlug}
        onOpenMaterialModal={(mat) => setSelectedDetailMaterial(mat)}
        onToggleCompare={handleToggleCompare}
        selectedCompareSlugs={selectedCompareSlugs}
      />

      {/* Floating Compare Dock */}
      <MaterialCompareDock
        selectedSlugs={selectedCompareSlugs}
        materials={materials}
        onRemoveSlug={(slug) => setSelectedCompareSlugs((p) => p.filter((s) => s !== slug))}
        onClearAll={() => setSelectedCompareSlugs([])}
        onOpenCompareModal={() => setCompareModalOpen(true)}
      />

      {/* Modals */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        analysisId={analysis.id}
        commodityName={analysis.input.commodity}
      />

      <MaterialDetailModal
        material={selectedDetailMaterial}
        isOpen={Boolean(selectedDetailMaterial)}
        onClose={() => setSelectedDetailMaterial(null)}
      />

      <MaterialCompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        selectedSlugs={selectedCompareSlugs}
        materials={materials}
      />
    </div>
  );
};
