import React, { useState, useEffect } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { NewAnalysisPage } from './pages/NewAnalysisPage';
import { ResultsPage } from './pages/ResultsPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { AdminPage } from './pages/AdminPage';
import { fetchCommodities } from './services/commoditiesService';
import { fetchMaterials } from './services/materialsService';
import { fetchAnalyses, fetchAnalysisById, saveAnalysis } from './services/analysesService';
import { runPackagingAnalysis } from './services/recommendationEngine';
import { Commodity } from './types/commodity';
import { PackagingMaterial } from './types/material';
import { AnalysisInput, SavedAnalysis } from './types/analysis';
import { SAMPLE_SCENARIOS, SampleScenario } from './data/sampleScenarios';
import { useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import { AnalysisLoadingModal } from './components/analysis/AnalysisLoadingModal';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [materials, setMaterials] = useState<PackagingMaterial[]>([]);
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<SavedAnalysis | null>(null);
  const [tweakDraftInput, setTweakDraftInput] = useState<AnalysisInput | null>(null);

  // Demo run state
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoPendingInput, setDemoPendingInput] = useState<AnalysisInput | null>(null);

  const { user } = useAuth();
  const { success, info } = useToast();

  const loadAllData = async () => {
    try {
      const [comms, mats, ans] = await Promise.all([
        fetchCommodities(),
        fetchMaterials(),
        fetchAnalyses(user?.id),
      ]);
      setCommodities(comms);
      setMaterials(mats);
      setAnalyses(ans);
    } catch (err) {
      console.error('Failed to load platform data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user?.id]);

  // Handle URL hash / paths on initial load
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      if (hash.startsWith('results/')) {
        const id = hash.replace('results/', '');
        fetchAnalysisById(id, user?.id).then((found) => {
          if (found) {
            setActiveAnalysis(found);
            setCurrentPage('results');
          } else {
            setCurrentPage('dashboard');
          }
        });
      } else if (['dashboard', 'new-analysis', 'materials', 'history', 'reports', 'admin'].includes(hash)) {
        setCurrentPage(hash);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [user?.id]);

  const navigate = (page: string, params?: any) => {
    setCurrentPage(page);
    window.location.hash = page;
    if (page !== 'results') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRunDemo = () => {
    const tomatoScenario = SAMPLE_SCENARIOS[0]; // Chilled Tomato
    setDemoPendingInput(tomatoScenario.input);
    setIsDemoRunning(true);
  };

  const handleRunScenario = (scenario: SampleScenario) => {
    setDemoPendingInput(scenario.input);
    setIsDemoRunning(true);
  };

  const handleDemoAnimationComplete = async () => {
    setIsDemoRunning(false);
    if (!demoPendingInput || materials.length === 0) return;

    const result = runPackagingAnalysis(demoPendingInput, materials);
    const saved = await saveAnalysis(demoPendingInput, result, user?.id);
    setActiveAnalysis(saved);
    setAnalyses((prev) => [saved, ...prev.filter((a) => a.id !== saved.id)]);
    success('Demo Executed End-to-End', `Synthesized recommendation: ${result.materialName}`);
    navigate('results');
  };

  const handleAnalysisCompleted = (saved: SavedAnalysis) => {
    setActiveAnalysis(saved);
    setAnalyses((prev) => [saved, ...prev.filter((a) => a.id !== saved.id)]);
    navigate('results');
  };

  const handleTweakAnalysis = (analysis: SavedAnalysis) => {
    setTweakDraftInput(analysis.input);
    navigate('new-analysis');
    info('Parameters Loaded', `Tweaking inputs for ${analysis.input.commodity}`);
  };

  const handleOpenAnalysis = (analysis: SavedAnalysis) => {
    setActiveAnalysis(analysis);
    navigate('results');
  };

  return (
    <MainLayout
      currentPage={currentPage}
      onNavigate={navigate}
      onRunDemo={handleRunDemo}
    >
      {currentPage === 'dashboard' && (
        <DashboardPage
          analyses={analyses}
          materials={materials}
          commodities={commodities}
          onNavigate={navigate}
          onRunScenario={handleRunScenario}
        />
      )}

      {currentPage === 'new-analysis' && (
        <NewAnalysisPage
          commodities={commodities}
          materials={materials}
          onAnalysisCompleted={handleAnalysisCompleted}
          initialInput={tweakDraftInput}
        />
      )}

      {currentPage === 'results' && activeAnalysis && (
        <ResultsPage
          analysis={activeAnalysis}
          materials={materials}
          onNavigate={navigate}
          onTweakAnalysis={handleTweakAnalysis}
        />
      )}

      {currentPage === 'materials' && (
        <MaterialsPage
          materials={materials}
          onStartAnalysisWithMaterial={(mat) => {
            navigate('new-analysis');
          }}
        />
      )}

      {currentPage === 'history' && (
        <HistoryPage
          analyses={analyses}
          onOpenAnalysis={handleOpenAnalysis}
          onTweakAnalysis={handleTweakAnalysis}
          onNavigate={navigate}
          onRefresh={loadAllData}
        />
      )}

      {currentPage === 'reports' && (
        <ReportsPage
          analyses={analyses}
          onNavigate={navigate}
        />
      )}

      {currentPage === 'admin' && (
        <AdminPage
          commodities={commodities}
          materials={materials}
          onRefreshData={loadAllData}
        />
      )}

      {/* Global Demo Sequence Modal */}
      <AnalysisLoadingModal
        isOpen={isDemoRunning}
        commodityName={demoPendingInput?.commodity || 'Tomato (Fresh)'}
        onComplete={handleDemoAnimationComplete}
      />
    </MainLayout>
  );
};
