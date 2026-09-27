import { AnalysisInput, FactorBreakdown, MapConditions, PackagingSpecifications, AlternativeMaterial } from './analysis';

export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  company?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ReportRecord {
  id: string;
  user_id: string;
  analysis_id: string;
  report_title: string;
  content: {
    input: AnalysisInput;
    recommendedMaterial: string;
    compatibility: number;
    specifications: PackagingSpecifications;
    reasons: string[];
    factors: FactorBreakdown[];
    mapConditions: MapConditions;
    alternatives: AlternativeMaterial[];
    shelfLife: { min: number; max: number };
    timestamp: string;
  };
  created_at: string;
}

export interface AnalysisShareRecord {
  id: string;
  analysis_id: string;
  share_token: string;
  is_public: boolean;
  expires_at?: string;
  created_at: string;
}
