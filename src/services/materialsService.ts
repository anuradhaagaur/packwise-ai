import { PackagingMaterial } from '../types/material';
import { SEED_MATERIALS } from '../data/seedMaterials';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_MATERIALS_KEY = 'packwise.materials.custom';

export function getCustomMaterials(): PackagingMaterial[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_MATERIALS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomMaterials(list: PackagingMaterial[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_MATERIALS_KEY, JSON.stringify(list));
  } catch {}
}

export async function fetchMaterials(): Promise<PackagingMaterial[]> {
  const custom = getCustomMaterials();
  const map = new Map<string, PackagingMaterial>();

  // Add seed materials
  SEED_MATERIALS.forEach(m => map.set(m.slug, m));
  // Add/override custom materials
  custom.forEach(m => map.set(m.slug, m));

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('materials').select('*').order('name');
      if (error) throw error;
      if (data && data.length > 0) {
        data.forEach(m => map.set(m.slug, m as PackagingMaterial));
      }
    } catch (err) {
      console.warn('Supabase materials query fallback to local:', err);
    }
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function addMaterial(item: Omit<PackagingMaterial, 'id'>): Promise<PackagingMaterial> {
  const newId = `mat-custom-${Date.now()}`;
  const material: PackagingMaterial = { ...item, id: newId };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('materials').insert(material).select().single();
      if (!error && data) return data as PackagingMaterial;
    } catch (err) {
      console.error('Supabase add material error:', err);
    }
  }

  const custom = getCustomMaterials();
  saveCustomMaterials([...custom.filter(m => m.slug !== material.slug), material]);
  return material;
}

export async function updateMaterial(slug: string, updates: Partial<PackagingMaterial>): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('materials').update(updates).eq('slug', slug);
    } catch (err) {
      console.error('Supabase update material error:', err);
    }
  }

  const custom = getCustomMaterials();
  const existing = custom.find(m => m.slug === slug) || SEED_MATERIALS.find(m => m.slug === slug);
  if (existing) {
    const updated = { ...existing, ...updates };
    saveCustomMaterials([...custom.filter(m => m.slug !== slug), updated]);
  }
}

export async function deleteMaterial(slug: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('materials').delete().eq('slug', slug);
    } catch (err) {
      console.error('Supabase delete material error:', err);
    }
  }

  const custom = getCustomMaterials();
  saveCustomMaterials(custom.filter(m => m.slug !== slug));
}
