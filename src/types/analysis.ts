import { CommodityCategory, ProductForm, RespirationLevel, SensitivityTag, StorageType } from './commodity';
import { MaterialScore, PackagingMaterial } from './material';

export type TransportMode = 'Road' | 'Rail' | 'Air' | 'Sea' | 'Local Distribution';
export type MechanicalRisk = 'Low' | 'Medium' | 'High';
export type HandlingIntensity = 'Low' | 'Moderate' | 'High';
export type LightExposure = 'Low' | 'Medium' | 'High';
export type TemperatureFluctuation = 'Low' | 'Moderate' | 'High';

export interface AnalysisInput {
  commodity: string;
  category: CommodityCategory;
  freshProduce: boolean;
  moisture: number;         // % (0-100)
  oil: number;              // % (0-100)
  ph: number;               // 1-14
  respiration: RespirationLevel;
  respirationRate?: number | null; // mg CO2/kg.h
  sensitivities: SensitivityTag[];
  productForm: ProductForm;
  storageType: StorageType;
  temperature: number;      // °C
  humidity: number;         // % (10-100)
  shelfLifeTarget: number;  // days (1-730)
  lightExposure: LightExposure;
  transportMode: TransportMode;
  transportHours: number;   // hours (1-500)
  handling: HandlingIntensity;
  mechanicalRisk: MechanicalRisk;
  tempFluctuation: TemperatureFluctuation;
  sustainabilityPreference: number; // 1-5
  costPreference: number;           // 1-5
}

export interface FactorBreakdown {
  label: string;
  share: number;
}

export interface PackagingSpecifications {
  otr: string;
  wvtr: string;
  thickness: string;
  sealability: string;
  mechanical: string;
  map: string;
}

export interface MapConditions {
  o2: string;
  co2: string;
  n2: string;
  applicable: boolean;
}

export interface AlternativeMaterial {
  focus: 'Cost Focused' | 'Performance Focused' | 'Sustainability Focused';
  slug: string;
  name: string;
  compatibility: number;
  cost: string;
  barrier: string;
  sustainability: string;
  use: string;
}

export interface FreshProduceInsights {
  respiration: RespirationLevel;
  o2Management: string;
  co2Management: string;
  humidityManagement: string;
  condensationRisk: 'Low' | 'Moderate' | 'High';
}

export interface SustainabilityLCA {
  recyclability: number;
  complexity: number;
  usage: number;
  environmental: number;
  endOfLife: number;
  overall: number;
  note: string;
}

export interface RecommendationResult {
  materialSlug: string;
  materialName: string;
  compatibility: number;
  reasons: string[];
  specifications: PackagingSpecifications;
  factors: FactorBreakdown[];
  mapConditions: MapConditions;
  alternatives: AlternativeMaterial[];
  shelfLife: {
    min: number;
    max: number;
  };
  requirements: {
    moisture: number;
    oxygen: number;
    light: number;
    mechanical: number;
    sealability: number;
    permeability: number;
    transportRisk: number;
  };
  scores: MaterialScore[];
  freshProduce: FreshProduceInsights | null;
  sustainability: SustainabilityLCA;
}

export interface SavedAnalysis {
  id: string;
  createdAt: string;
  input: AnalysisInput;
  result: RecommendationResult;
  local?: boolean;
}
