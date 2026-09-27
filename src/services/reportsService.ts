import { ReportRecord } from '../types/database';
import { SavedAnalysis } from '../types/analysis';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_REPORTS_KEY = 'packwise.reports.v2';

export function getLocalReports(): ReportRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalReports(reports: ReportRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(reports));
  } catch {}
}

export async function createReportFromAnalysis(analysis: SavedAnalysis, userId?: string | null): Promise<ReportRecord> {
  const title = `Technical Packaging Assessment — ${analysis.input.commodity}`;
  const record: ReportRecord = {
    id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    user_id: userId || 'anonymous',
    analysis_id: analysis.id,
    report_title: title,
    content: {
      input: analysis.input,
      recommendedMaterial: analysis.result.materialName,
      compatibility: analysis.result.compatibility,
      specifications: analysis.result.specifications,
      reasons: analysis.result.reasons,
      factors: analysis.result.factors,
      mapConditions: analysis.result.mapConditions,
      alternatives: analysis.result.alternatives,
      shelfLife: analysis.result.shelfLife,
      timestamp: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert({
          user_id: userId,
          analysis_id: analysis.id,
          report_title: title,
          content: record.content,
        })
        .select()
        .single();

      if (!error && data) {
        return data as ReportRecord;
      }
    } catch (err) {
      console.error('Supabase report creation error:', err);
    }
  }

  const existing = getLocalReports();
  saveLocalReports([record, ...existing.filter(r => r.analysis_id !== analysis.id)]);
  return record;
}

export async function fetchReports(userId?: string | null): Promise<ReportRecord[]> {
  const localList = getLocalReports();

  if (isSupabaseConfigured && supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const combined = [...data, ...localList.filter(l => !data.some(d => d.id === l.id))];
        return combined as ReportRecord[];
      }
    } catch (err) {
      console.warn('Supabase reports fetch fallback:', err);
    }
  }

  return localList;
}

export async function deleteReport(id: string, userId?: string | null): Promise<void> {
  const current = getLocalReports();
  saveLocalReports(current.filter(r => r.id !== id));

  if (isSupabaseConfigured && supabase && !id.startsWith('rep-')) {
    try {
      await supabase.from('reports').delete().eq('id', id);
    } catch (err) {
      console.error('Supabase report delete error:', err);
    }
  }
}
