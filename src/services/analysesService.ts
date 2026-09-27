import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AnalysisInput, RecommendationResult, SavedAnalysis } from '../types/analysis';

const LOCAL_STORAGE_KEY = 'packwise.analyses.v2';
const DRAFT_STORAGE_KEY = 'packwise.draft';

export function getLocalAnalyses(): SavedAnalysis[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read local analyses:', err);
    return [];
  }
}

export function saveLocalAnalyses(analyses: SavedAnalysis[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(analyses.slice(0, 100)));
  } catch (err) {
    console.error('Failed to save local analyses:', err);
  }
}

export function saveDraftAnalysis(input: AnalysisInput) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(input));
  } catch (err) {
    console.error('Failed to save draft:', err);
  }
}

export function getDraftAnalysis(): AnalysisInput | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraftAnalysis() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DRAFT_STORAGE_KEY);
}

export async function saveAnalysis(
  input: AnalysisInput,
  result: RecommendationResult,
  userId?: string | null
): Promise<SavedAnalysis> {
  const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const createdAt = new Date().toISOString();

  // If Supabase is connected and user is logged in, write to Supabase
  if (isSupabaseConfigured && supabase && userId) {
    try {
      const { data: analysisData, error: analysisErr } = await supabase
        .from('analyses')
        .insert({
          user_id: userId,
          commodity_name: input.commodity,
          commodity_category: input.category,
          storage_type: input.storageType,
          inputs: input,
        })
        .select('id, created_at')
        .single();

      if (analysisErr) throw analysisErr;

      const dbId = analysisData.id;
      const dbCreatedAt = analysisData.created_at;

      // Insert recommendation
      const { error: recErr } = await supabase.from('recommendations').insert({
        analysis_id: dbId,
        user_id: userId,
        material_slug: result.materialSlug,
        material_name: result.materialName,
        compatibility: result.compatibility,
        shelf_life_min: result.shelfLife.min,
        shelf_life_max: result.shelfLife.max,
        reasons: result.reasons,
        specifications: result.specifications,
        factors: result.factors,
        map_conditions: result.mapConditions,
        alternatives: result.alternatives,
      });

      if (recErr) console.warn('Supabase recommendations insert warning:', recErr);

      // Insert material scores
      if (result.scores && result.scores.length > 0) {
        const { error: scoreErr } = await supabase.from('analysis_material_scores').insert(
          result.scores.map(s => ({
            analysis_id: dbId,
            user_id: userId,
            material_slug: s.slug,
            material_name: s.name,
            score: s.score,
            breakdown: s.breakdown,
          }))
        );
        if (scoreErr) console.warn('Supabase scores insert warning:', scoreErr);
      }

      const saved: SavedAnalysis = {
        id: dbId,
        createdAt: dbCreatedAt,
        input,
        result,
        local: false,
      };

      // Also mirror to local for fast access
      const current = getLocalAnalyses();
      saveLocalAnalyses([saved, ...current.filter(a => a.id !== saved.id)]);

      // Save in session for instant results viewing
      sessionStorage.setItem(`packwise.result.${dbId}`, JSON.stringify(saved));
      return saved;
    } catch (err) {
      console.error('Supabase save failed, falling back to local storage:', err);
    }
  }

  // Local fallback
  const localSaved: SavedAnalysis = {
    id: `local-${analysisId}`,
    createdAt,
    input,
    result,
    local: true,
  };

  const current = getLocalAnalyses();
  saveLocalAnalyses([localSaved, ...current]);
  sessionStorage.setItem(`packwise.result.${localSaved.id}`, JSON.stringify(localSaved));
  return localSaved;
}

export async function fetchAnalyses(userId?: string | null): Promise<SavedAnalysis[]> {
  const localList = getLocalAnalyses();

  if (isSupabaseConfigured && supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select(`
          id,
          created_at,
          inputs,
          recommendations (
            material_slug,
            material_name,
            compatibility,
            shelf_life_min,
            shelf_life_max,
            reasons,
            specifications,
            factors,
            map_conditions,
            alternatives
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const supabaseAnalyses: SavedAnalysis[] = data.map(item => {
          const rec = (item.recommendations as any)?.[0];
          const result: RecommendationResult = rec
            ? {
                materialSlug: rec.material_slug,
                materialName: rec.material_name,
                compatibility: Number(rec.compatibility),
                reasons: rec.reasons || [],
                specifications: rec.specifications || {},
                factors: rec.factors || [],
                mapConditions: rec.map_conditions || {},
                alternatives: rec.alternatives || [],
                shelfLife: { min: rec.shelf_life_min, max: rec.shelf_life_max },
                requirements: { oxygen: 0, moisture: 0, light: 0, mechanical: 0, sealability: 0, permeability: 0, transportRisk: 0 },
                scores: [],
                freshProduce: null,
                sustainability: { recyclability: 0, complexity: 0, usage: 0, environmental: 0, endOfLife: 0, overall: 0, note: '' },
              }
            : ({} as any);

          return {
            id: item.id,
            createdAt: item.created_at,
            input: item.inputs as AnalysisInput,
            result,
            local: false,
          };
        });

        // Merge supabase & local
        const combined = [...supabaseAnalyses, ...localList.filter(l => l.local)];
        return combined.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
    } catch (err) {
      console.warn('Supabase fetch failed, returning local analyses:', err);
    }
  }

  return localList.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function fetchAnalysisById(id: string, userId?: string | null): Promise<SavedAnalysis | null> {
  // Check session storage first for immediate navigation
  if (typeof window !== 'undefined') {
    try {
      const cached = sessionStorage.getItem(`packwise.result.${id}`);
      if (cached) return JSON.parse(cached);
    } catch {}
  }

  const localList = getLocalAnalyses();
  const foundLocal = localList.find(a => a.id === id);
  if (foundLocal) return foundLocal;

  if (isSupabaseConfigured && supabase && !id.startsWith('local-')) {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select(`
          id,
          created_at,
          inputs,
          recommendations (
            material_slug,
            material_name,
            compatibility,
            shelf_life_min,
            shelf_life_max,
            reasons,
            specifications,
            factors,
            map_conditions,
            alternatives
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        const rec = (data.recommendations as any)?.[0];
        const result: RecommendationResult = rec
          ? {
              materialSlug: rec.material_slug,
              materialName: rec.material_name,
              compatibility: Number(rec.compatibility),
              reasons: rec.reasons || [],
              specifications: rec.specifications || {},
              factors: rec.factors || [],
              mapConditions: rec.map_conditions || {},
              alternatives: rec.alternatives || [],
              shelfLife: { min: rec.shelf_life_min, max: rec.shelf_life_max },
              requirements: { oxygen: 0, moisture: 0, light: 0, mechanical: 0, sealability: 0, permeability: 0, transportRisk: 0 },
              scores: [],
              freshProduce: null,
              sustainability: { recyclability: 0, complexity: 0, usage: 0, environmental: 0, endOfLife: 0, overall: 0, note: '' },
            }
          : ({} as any);

        return {
          id: data.id,
          createdAt: data.created_at,
          input: data.inputs as AnalysisInput,
          result,
          local: false,
        };
      }
    } catch (err) {
      console.error('Failed to fetch from supabase:', err);
    }
  }

  return null;
}

export async function deleteAnalysis(id: string, userId?: string | null): Promise<void> {
  const current = getLocalAnalyses();
  saveLocalAnalyses(current.filter(a => a.id !== id));

  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(`packwise.result.${id}`);
  }

  if (isSupabaseConfigured && supabase && !id.startsWith('local-')) {
    try {
      const { error } = await supabase.from('analyses').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Failed to delete analysis on Supabase:', err);
    }
  }
}
