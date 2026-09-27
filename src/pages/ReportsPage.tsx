import React, { useState, useEffect } from 'react';
import { ReportRecord } from '../types/database';
import { SavedAnalysis } from '../types/analysis';
import { fetchReports, deleteReport } from '../services/reportsService';
import { generateAnalysisPDF } from '../lib/pdfGenerator';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatDate } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { FileText, Download, Trash2, Calendar, Sparkles, Shield, CheckCircle2 } from 'lucide-react';

export interface ReportsPageProps {
  analyses: SavedAnalysis[];
  onNavigate: (page: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ analyses, onNavigate }) => {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null);

  const { user } = useAuth();
  const { success, error } = useToast();

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchReports(user?.id);
      setReports(data);
      if (data.length > 0 && !selectedReport) {
        setSelectedReport(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [user?.id]);

  const handleDelete = async (id: string) => {
    try {
      await deleteReport(id, user?.id);
      success('Report deleted');
      setReports((prev) => prev.filter((r) => r.id !== id));
      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }
    } catch (err: any) {
      error('Failed to delete report', err.message);
    }
  };

  const handleDownloadReportPDF = (report: ReportRecord) => {
    const matchingAnalysis = analyses.find((a) => a.id === report.analysis_id);
    if (matchingAnalysis) {
      generateAnalysisPDF(matchingAnalysis);
      success('Report PDF Downloaded');
      return;
    }

    // Reconstruct analysis object from content if original is not in list
    const reconstructed: SavedAnalysis = {
      id: report.analysis_id,
      createdAt: report.created_at,
      input: report.content.input,
      result: {
        materialSlug: 'material-rec',
        materialName: report.content.recommendedMaterial,
        compatibility: report.content.compatibility,
        reasons: report.content.reasons,
        specifications: report.content.specifications,
        factors: report.content.factors,
        mapConditions: report.content.mapConditions,
        alternatives: report.content.alternatives,
        shelfLife: report.content.shelfLife,
        requirements: { moisture: 3, oxygen: 3, light: 2, mechanical: 3, sealability: 4, permeability: 1, transportRisk: 2 },
        scores: [],
        freshProduce: null,
        sustainability: { recyclability: 4, complexity: 3, usage: 3, environmental: 4, endOfLife: 4, overall: 76, note: 'LCA Profile' },
      },
    };
    generateAnalysisPDF(reconstructed);
    success('Report PDF Downloaded');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <FileText className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Technical Documentation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Packaging Evaluation Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Formal technical assessments, barrier datasheets, and regulatory compliance reports.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => onNavigate('new-analysis')}
          className="text-xs font-bold"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1" /> Generate New Report
        </Button>
      </div>

      {reports.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports Sidebar List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Available Reports ({reports.length})
            </h3>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {reports.map((r) => {
                const isSelected = selectedReport?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedReport(r)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Badge variant="cyan" className="text-[10px]">
                          {r.content.input.category}
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-400">
                          {formatDate(r.created_at)}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100 font-display">
                        {r.report_title}
                      </p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Recommended: {r.content.recommendedMaterial}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400">
                      <span>Score: {r.content.compatibility}%</span>
                      <span>Shelf life: {r.content.shelfLife.min}–{r.content.shelfLife.max}d</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Report Preview Document */}
          <div className="lg:col-span-2">
            {selectedReport ? (
              <Card className="p-6 sm:p-8 space-y-6">
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold font-display text-slate-900 dark:text-slate-100">
                      {selectedReport.report_title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Generated on {formatDate(selectedReport.created_at)} · ISO 14040 Principles
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleDownloadReportPDF(selectedReport)}
                      className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> Download PDF
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedReport.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Section 1: Executive Summary */}
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300/50 dark:border-emerald-800/50 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Executive Evaluation Summary
                  </span>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-slate-900 dark:text-white font-display">
                        {selectedReport.content.recommendedMaterial}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        Compatibility Score: <strong>{selectedReport.content.compatibility}%</strong> · Indicative Shelf-Life: <strong>{selectedReport.content.shelfLife.min}–{selectedReport.content.shelfLife.max} Days</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Product Parameters & Storage */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Commodity</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedReport.content.input.commodity}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Moisture & pH</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedReport.content.input.moisture}% · pH {selectedReport.content.input.ph}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Storage</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedReport.content.input.storageType} ({selectedReport.content.input.temperature}°C)</p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Target Shelf-Life</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedReport.content.input.shelfLifeTarget} Days</p>
                  </div>
                </div>

                {/* Section 3: Technical Specifications */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Engineered Packaging Specifications
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">OTR Target</span>
                      <p className="font-mono font-bold mt-0.5">{selectedReport.content.specifications.otr}</p>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">WVTR Target</span>
                      <p className="font-mono font-bold mt-0.5">{selectedReport.content.specifications.wvtr}</p>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Film Gauge</span>
                      <p className="font-mono font-bold mt-0.5">{selectedReport.content.specifications.thickness}</p>
                    </div>
                  </div>
                </div>

                {/* Section 4: Engineering Rationale */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Selection Justification Rules
                  </h4>
                  <div className="space-y-1.5">
                    {selectedReport.content.reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 p-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No reports generated yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Complete a packaging analysis and click "Download Technical Report" to automatically archive technical dossiers.
          </p>
          <Button size="sm" onClick={() => onNavigate('new-analysis')} className="text-xs font-bold mt-2">
            Start Packaging Analysis
          </Button>
        </div>
      )}
    </div>
  );
};
