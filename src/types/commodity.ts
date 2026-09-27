export type CommodityCategory =
  | 'Fruits'
  | 'Vegetables'
  | 'Cereals'
  | 'Pulses'
  | 'Dairy'
  | 'Meat'
  | 'Seafood'
  | 'Bakery'
  | 'Spices'
  | 'Processed Food'
  | 'Other';

export type RespirationLevel = 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High';
export type StorageType = 'Ambient' | 'Chilled' | 'Cold Storage' | 'Frozen';
export type ProductForm = 'Whole' | 'Cut' | 'Powder' | 'Liquid' | 'Semi-solid' | 'Processed';
export type SensitivityTag =
  | 'Moisture Sensitive'
  | 'Oxygen Sensitive'
  | 'Light Sensitive'
  | 'Aroma Sensitive'
  | 'Oxidation Sensitive'
  | 'Microbial Spoilage Sensitive';

export interface Commodity {
  id: string;
  slug: string;
  name: string;
  category: CommodityCategory;
  fresh_produce: boolean;
  default_moisture: number;
  default_oil: number;
  default_ph: number;
  default_respiration: RespirationLevel;
  moisture_sensitivity: 'Low' | 'Moderate' | 'High' | 'Very High';
  perishability: 'Low' | 'Moderate' | 'High' | 'Very High';
  typical_storage: StorageType;
  typical_shelf_life_days?: number;
  created_at?: string;
}
