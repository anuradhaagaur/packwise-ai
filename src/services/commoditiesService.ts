import { Commodity } from '../types/commodity';
import { SEED_COMMODITIES } from '../data/seedCommodities';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_COMMODITIES_KEY = 'packwise.commodities.custom';

export function getCustomCommodities(): Commodity[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_COMMODITIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomCommodities(list: Commodity[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_COMMODITIES_KEY, JSON.stringify(list));
  } catch {}
}

export async function fetchCommodities(): Promise<Commodity[]> {
  const custom = getCustomCommodities();
  const initialMap = new Map<string, Commodity>();
  
  // Add seed commodities
  SEED_COMMODITIES.forEach(c => initialMap.set(c.slug, c));
  // Add/override custom commodities
  custom.forEach(c => initialMap.set(c.slug, c));

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('commodities').select('*').order('name');
      if (error) throw error;
      if (data && data.length > 0) {
        data.forEach(c => initialMap.set(c.slug, c as Commodity));
      }
    } catch (err) {
      console.warn('Supabase commodities query fallback to local:', err);
    }
  }

  return Array.from(initialMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function addCommodity(item: Omit<Commodity, 'id'>): Promise<Commodity> {
  const newId = `c-custom-${Date.now()}`;
  const commodity: Commodity = { ...item, id: newId };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('commodities').insert(commodity).select().single();
      if (!error && data) {
        return data as Commodity;
      }
    } catch (err) {
      console.error('Supabase add commodity failed:', err);
    }
  }

  const custom = getCustomCommodities();
  saveCustomCommodities([...custom.filter(c => c.slug !== commodity.slug), commodity]);
  return commodity;
}

export async function updateCommodity(slug: string, updates: Partial<Commodity>): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('commodities').update(updates).eq('slug', slug);
    } catch (err) {
      console.error('Supabase update commodity failed:', err);
    }
  }

  const custom = getCustomCommodities();
  const existing = custom.find(c => c.slug === slug) || SEED_COMMODITIES.find(c => c.slug === slug);
  if (existing) {
    const updated = { ...existing, ...updates };
    saveCustomCommodities([...custom.filter(c => c.slug !== slug), updated]);
  }
}

export async function deleteCommodity(slug: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('commodities').delete().eq('slug', slug);
    } catch (err) {
      console.error('Supabase delete commodity failed:', err);
    }
  }

  const custom = getCustomCommodities();
  saveCustomCommodities(custom.filter(c => c.slug !== slug));
}
