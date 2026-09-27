export type RecyclabilityLevel = 'High' | 'Moderate' | 'Low' | 'Compostable' | 'Specialized';

export interface PackagingMaterial {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  oxygen_barrier: number;      // 1-5
  moisture_barrier: number;    // 1-5
  light_barrier: number;       // 1-5
  sealability: number;         // 1-5
  mechanical_strength: number; // 1-5
  relative_cost: number;       // 1-5
  recyclability: RecyclabilityLevel;
  sustainability: number;      // 1-5
  otr_value: number;           // cc/m2.day
  otr_label: string;
  wvtr_value: number;          // g/m2.day
  wvtr_label: string;
  thickness_range: string;
  temp_min: number;            // °C
  temp_max: number;            // °C
  map_suitable: boolean;
  fresh_produce_suitable: boolean;
  typical_applications: string[];
  created_at?: string;
}

export interface MaterialScore {
  slug: string;
  name: string;
  score: number;
  breakdown: Record<string, number>;
}
