import { AnalysisInput, AlternativeMaterial, FactorBreakdown, FreshProduceInsights, MapConditions, PackagingSpecifications, RecommendationResult, SustainabilityLCA } from '../types/analysis';
import { MaterialScore, PackagingMaterial } from '../types/material';
import { RespirationLevel } from '../types/commodity';

// Configurable Scoring Weights
export const SCORING_WEIGHTS = {
  moisture: 0.24,
  oxygen: 0.22,
  temperature: 0.14,
  mechanical: 0.13,
  shelfLife: 0.10,
  sealability: 0.06,
  light: 0.05,
  cost: 0.03,
  sustainability: 0.03,
};

export const FACTOR_LABELS: Record<keyof typeof SCORING_WEIGHTS, string> = {
  moisture: 'Moisture Protection',
  oxygen: 'Oxygen Barrier',
  temperature: 'Temperature Compatibility',
  mechanical: 'Mechanical Protection',
  shelfLife: 'Shelf-Life Target',
  sealability: 'Sealability & Integrity',
  light: 'Light Protection',
  cost: 'Cost Efficiency',
  sustainability: 'Sustainability Profile',
};

const RESPIRATION_RANKS: Record<RespirationLevel, number> = {
  'Very Low': 1,
  'Low': 2,
  'Moderate': 3,
  'High': 4,
  'Very High': 5,
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

// Calculate requirement profile (1 to 5 scale) from food inputs
export function calculateRequirements(input: AnalysisInput) {
  const hasSens = (s: string) => input.sensitivities.includes(s as any);
  const respRank = RESPIRATION_RANKS[input.respiration] || 1;

  // 1. Moisture requirement
  let moistureReq = 3.0;
  if (input.moisture < 10) moistureReq = 5.0;
  else if (input.moisture < 20) moistureReq = 4.5;
  else if (input.moisture < 45) moistureReq = 3.5;
  else if (input.moisture > 85) moistureReq = 2.5;

  if (hasSens('Moisture Sensitive')) moistureReq += 1.0;
  if (input.humidity >= 85) moistureReq += 0.5;
  if (input.freshProduce && respRank >= 4) moistureReq -= 1.0;

  // 2. Oxygen requirement
  let oxygenReq = 2.5;
  if (input.oil >= 20) oxygenReq += 1.5;
  else if (input.oil >= 8) oxygenReq += 1.0;

  if (hasSens('Oxygen Sensitive')) oxygenReq += 1.2;
  if (hasSens('Oxidation Sensitive')) oxygenReq += 1.0;
  if (hasSens('Aroma Sensitive')) oxygenReq += 0.5;
  if (input.shelfLifeTarget > 90) oxygenReq += 1.0;
  else if (input.shelfLifeTarget > 30) oxygenReq += 0.5;

  if (input.ph > 4.6 && hasSens('Microbial Spoilage Sensitive')) oxygenReq += 0.5;
  if (input.freshProduce && respRank >= 4) oxygenReq -= 2.0;

  // 3. Light requirement
  let lightReq = 1.5;
  if (hasSens('Light Sensitive')) lightReq += 2.5;
  if (input.oil >= 15) lightReq += 1.0;
  if (input.lightExposure === 'High') lightReq += 1.0;
  else if (input.lightExposure === 'Medium') lightReq += 0.5;

  // 4. Mechanical requirement
  const mechMap = { Low: 1.0, Medium: 2.5, High: 4.0 };
  const handMap = { Low: 0.5, Moderate: 1.5, High: 2.5 };
  const modeMap: Record<string, number> = {
    Air: 1.0,
    Sea: 1.2,
    Rail: 0.8,
    Road: 0.6,
    'Local Distribution': 0.2,
  };
  const hoursBonus = input.transportHours > 72 ? 1.5 : input.transportHours > 24 ? 1.0 : 0.3;
  const transportRisk = (mechMap[input.mechanicalRisk] + handMap[input.handling] + hoursBonus + (modeMap[input.transportMode] ?? 0.6)) / 2;
  
  let mechReq = clamp(transportRisk, 1, 5);
  if (input.productForm === 'Liquid' || input.productForm === 'Semi-solid') {
    mechReq += 0.5;
  }

  // 5. Sealability requirement
  let sealReq = 3.0;
  if (['Liquid', 'Semi-solid', 'Powder'].includes(input.productForm)) sealReq = 5.0;
  if (input.shelfLifeTarget > 60) sealReq += 0.5;
  if (input.storageType === 'Frozen') sealReq += 0.5;

  // 6. Permeability requirement (for respiring fresh produce)
  const permeabilityReq = input.freshProduce ? clamp(respRank, 1, 5) : 1.0;

  return {
    moisture: clamp(moistureReq, 1, 5),
    oxygen: clamp(oxygenReq, 1, 5),
    light: clamp(lightReq, 1, 5),
    mechanical: clamp(mechReq, 1, 5),
    sealability: clamp(sealReq, 1, 5),
    permeability: permeabilityReq,
    transportRisk: clamp(transportRisk, 1, 5),
  };
}

// Barrier score component
function scoreBarrier(materialVal: number, reqVal: number): number {
  return clamp(1 - Math.max(0, reqVal - materialVal) / 4, 0, 1);
}

// Temperature compatibility
function scoreTemperature(material: PackagingMaterial, input: AnalysisInput): number {
  const fluctuation = input.tempFluctuation === 'High' ? 8 : input.tempFluctuation === 'Moderate' ? 4 : 2;
  const minExpected = input.temperature - fluctuation;
  const maxExpected = input.temperature + fluctuation;

  if (minExpected >= material.temp_min && maxExpected <= material.temp_max) {
    return 1.0;
  }
  if (input.temperature >= material.temp_min && input.temperature <= material.temp_max) {
    return 0.75;
  }
  return 0.25;
}

// Fresh produce gas exchange matching
function scoreFreshProduceOTR(material: PackagingMaterial, reqs: ReturnType<typeof calculateRequirements>, input: AnalysisInput): number | null {
  if (!input.freshProduce || reqs.permeability < 3) return null;
  const otr = material.otr_value;
  if (otr >= 10000) return 1.0;
  if (otr >= 2000) return 0.82;
  if (otr >= 500) return 0.55;
  return 0.2;
}

// Full single material scoring
export function scoreMaterial(
  material: PackagingMaterial,
  input: AnalysisInput,
  reqs: ReturnType<typeof calculateRequirements>
): { material: PackagingMaterial; score: number; breakdown: Record<string, number> } {
  const produceOTR = scoreFreshProduceOTR(material, reqs, input);

  const breakdown: Record<string, number> = {
    moisture: scoreBarrier(material.moisture_barrier, reqs.moisture),
    oxygen: produceOTR ?? scoreBarrier(material.oxygen_barrier, reqs.oxygen),
    temperature: scoreTemperature(material, input),
    mechanical: scoreBarrier(material.mechanical_strength, reqs.mechanical),
    shelfLife: clamp(0.45 + 0.11 * ((material.oxygen_barrier + material.moisture_barrier) / 2) * (input.shelfLifeTarget > 45 ? 1.1 : 0.95), 0, 1),
    sealability: scoreBarrier(material.sealability, reqs.sealability),
    light: scoreBarrier(material.light_barrier, reqs.light),
    cost: clamp((6 - material.relative_cost) / 5 * (input.costPreference / 3), 0.2, 1.0),
    sustainability: clamp((material.sustainability / 5) * (input.sustainabilityPreference / 3), 0.2, 1.0),
  };

  // Adjust for fresh produce suffocating barriers
  if (input.freshProduce && reqs.permeability >= 4 && material.oxygen_barrier >= 4) {
    breakdown.oxygen = 0.25; // hermetic barriers suffocate respiring produce
  }

  // Adjust for high humidity condensations
  if (input.humidity >= 90 && material.moisture_barrier >= 5 && !material.fresh_produce_suitable) {
    breakdown.moisture = (breakdown.moisture ?? 0) * 0.8;
  }

  // Frozen limits
  if (input.storageType === 'Frozen' && material.temp_min > -18) {
    breakdown.temperature = Math.min(breakdown.temperature ?? 0, 0.3);
  }

  // Calculate weighted total score
  const totalWeighted = (Object.keys(SCORING_WEIGHTS) as Array<keyof typeof SCORING_WEIGHTS>).reduce((sum, key) => {
    return sum + SCORING_WEIGHTS[key] * (breakdown[key] ?? 0);
  }, 0);

  const finalScore = clamp(Math.round(totalWeighted * 100), 12, 98);

  return {
    material,
    score: finalScore,
    breakdown,
  };
}

// Generate factor share breakdown for explainable UI
export function calculateFactorShares(scored: ReturnType<typeof scoreMaterial>): FactorBreakdown[] {
  const activeKeys = (Object.keys(SCORING_WEIGHTS) as Array<keyof typeof SCORING_WEIGHTS>).filter(k => SCORING_WEIGHTS[k] >= 0.05);

  const rawValues = activeKeys.map(k => ({
    label: FACTOR_LABELS[k],
    value: SCORING_WEIGHTS[k] * (scored.breakdown[k] ?? 0),
  }));

  const totalSum = rawValues.reduce((sum, item) => sum + item.value, 0) || 1;

  const shares = rawValues.map(item => ({
    label: item.label,
    share: Math.round((item.value / totalSum) * 100),
  }));

  // Ensure exact 100% sum
  const diff = 100 - shares.reduce((s, i) => s + i.share, 0);
  if (shares[0]) {
    shares[0].share += diff;
  }

  return shares.sort((a, b) => b.share - a.share);
}

// Generate dynamic human-readable engineering reasons
export function generateReasons(material: PackagingMaterial, reqs: ReturnType<typeof calculateRequirements>, input: AnalysisInput): string[] {
  const reasons: string[] = [];

  if (input.freshProduce && reqs.permeability >= 4 && material.otr_value >= 2000) {
    reasons.push('Permeable structure supports live respiration and active gas exchange for fresh produce');
  }
  if (material.oxygen_barrier >= 4 && reqs.oxygen >= 3.5) {
    reasons.push('Strong oxygen barrier prevents lipid oxidation and oxidative degradation');
  }
  if (material.moisture_barrier >= 4 && reqs.moisture >= 3.5) {
    reasons.push(`Superior moisture barrier maintains target crispness / hydration at ${input.humidity}% RH`);
  }
  if (material.light_barrier >= 4 && reqs.light >= 3.0) {
    reasons.push('High-opacity light barrier protects photo-sensitive vitamins, lipids, and pigments');
  }
  if (material.temp_min <= input.temperature && material.temp_max >= input.temperature) {
    reasons.push(`Thermally stable for ${input.storageType.toLowerCase()} storage profile at ${input.temperature} °C`);
  }
  if (material.sealability >= 4) {
    reasons.push('High-integrity seal strength ensures leak resistance during handling and transit');
  }
  if (material.mechanical_strength >= 4 && reqs.mechanical >= 3.0) {
    reasons.push(`High puncture and tensile resistance satisfies ${input.transportMode} transport risk`);
  }
  if (input.shelfLifeTarget > 30 && (material.oxygen_barrier + material.moisture_barrier) / 2 >= 4) {
    reasons.push(`Robust dual-barrier chemistry enables extended ${input.shelfLifeTarget}-day shelf-life target`);
  }
  if (material.sustainability >= 4) {
    reasons.push(`${material.recyclability} end-of-life circular profile satisfies sustainability preference`);
  }
  if (material.relative_cost <= 2) {
    reasons.push('Economical cost profile suited for high-volume commercial production');
  }

  return reasons.slice(0, 6);
}

// Estimate shelf-life days
export function estimateShelfLife(input: AnalysisInput, scored: ReturnType<typeof scoreMaterial>): { min: number; max: number } {
  let baseDays = 120;
  if (input.moisture > 85) baseDays = 7;
  else if (input.moisture > 70) baseDays = 12;
  else if (input.moisture > 45) baseDays = 25;
  else if (input.moisture > 20) baseDays = 60;

  const storageMultipliers: Record<string, number> = {
    Ambient: 1.0,
    Chilled: 2.6,
    'Cold Storage': 3.1,
    Frozen: 7.0,
  };

  const mult = storageMultipliers[input.storageType] ?? 1.0;
  const scoreMult = 0.7 + 0.5 * (scored.score / 100);
  const phFactor = input.ph > 4.6 && input.moisture > 60 ? 0.8 : 1.0;
  const fluctFactor = input.tempFluctuation === 'High' ? 0.85 : input.tempFluctuation === 'Moderate' ? 0.93 : 1.0;

  const estimated = baseDays * mult * scoreMult * phFactor * fluctFactor;
  const minVal = Math.max(2, Math.round(estimated * 0.86));
  const maxVal = Math.max(minVal + 2, Math.round(estimated * 1.14));

  return { min: minVal, max: maxVal };
}

// Generate packaging technical specifications
export function generateSpecifications(material: PackagingMaterial, reqs: ReturnType<typeof calculateRequirements>): PackagingSpecifications {
  const levelLabel = (val: number) => (val >= 4.2 ? 'High' : val >= 3.0 ? 'Medium–High' : val >= 2.0 ? 'Medium' : 'Low');

  return {
    otr: reqs.permeability >= 4 ? 'High OTR Target (gas exchange)' : `${material.otr_label}`,
    wvtr: `${material.wvtr_label}`,
    thickness: material.thickness_range,
    sealability: levelLabel(material.sealability),
    mechanical: levelLabel(material.mechanical_strength),
    map: material.map_suitable ? 'Suitable / Recommended' : 'Not recommended',
  };
}

// Alternative material suggestions with 3 distinct lenses
export function generateAlternatives(
  allRanked: Array<ReturnType<typeof scoreMaterial>>,
  bestSlug: string
): AlternativeMaterial[] {
  const others = allRanked.filter(r => r.material.slug !== bestSlug);
  const costLabels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];

  const pickAlternative = (
    focus: 'Cost Focused' | 'Performance Focused' | 'Sustainability Focused',
    sortFn: (a: ReturnType<typeof scoreMaterial>, b: ReturnType<typeof scoreMaterial>) => number,
    use: string
  ): AlternativeMaterial | null => {
    const candidate = [...others].sort(sortFn)[0];
    if (!candidate) return null;
    const m = candidate.material;
    return {
      focus,
      slug: m.slug,
      name: m.name,
      compatibility: candidate.score,
      cost: costLabels[m.relative_cost - 1] ?? 'Moderate',
      barrier: `O₂ ${m.oxygen_barrier}/5 · H₂O ${m.moisture_barrier}/5`,
      sustainability: m.recyclability,
      use,
    };
  };

  const costAlternative = pickAlternative(
    'Cost Focused',
    (a, b) => a.material.relative_cost - b.material.relative_cost || b.score - a.score,
    'High-volume packing where unit packaging economics dominate'
  );

  const perfAlternative = pickAlternative(
    'Performance Focused',
    (a, b) =>
      b.material.oxygen_barrier + b.material.moisture_barrier - (a.material.oxygen_barrier + a.material.moisture_barrier) ||
      b.score - a.score,
    'Maximum hermetic barrier protection and extended indicative shelf-life'
  );

  const ecoAlternative = pickAlternative(
    'Sustainability Focused',
    (a, b) => b.material.sustainability - a.material.sustainability || b.score - a.score,
    'Bio-based, recyclable, or industrially compostable packaging strategy'
  );

  const list: AlternativeMaterial[] = [];
  const addedSlugs = new Set<string>();

  [costAlternative, perfAlternative, ecoAlternative].filter(Boolean).forEach(alt => {
    if (alt && !addedSlugs.has(alt.slug)) {
      addedSlugs.add(alt.slug);
      list.push(alt);
    } else if (alt) {
      const nextBest = others.find(o => !addedSlugs.has(o.material.slug) && o.material.slug !== alt.slug);
      if (nextBest) {
        addedSlugs.add(nextBest.material.slug);
        list.push({
          ...alt,
          slug: nextBest.material.slug,
          name: nextBest.material.name,
          compatibility: nextBest.score,
          cost: costLabels[nextBest.material.relative_cost - 1] ?? 'Moderate',
          barrier: `O₂ ${nextBest.material.oxygen_barrier}/5 · H₂O ${nextBest.material.moisture_barrier}/5`,
          sustainability: nextBest.material.recyclability,
        });
      }
    }
  });

  return list;
}

// Recommended MAP conditions
export function calculateMapConditions(input: AnalysisInput, reqs: ReturnType<typeof calculateRequirements>): MapConditions {
  if (input.freshProduce && reqs.permeability >= 3) {
    return { o2: '3–5%', co2: '5–10%', n2: 'Balance', applicable: true };
  }
  if (input.category === 'Meat' || input.category === 'Seafood') {
    return { o2: '0–1% (or 70% for red meat bloom)', co2: '30–40%', n2: 'Balance', applicable: true };
  }
  if (input.category === 'Dairy' || input.category === 'Bakery') {
    return { o2: '0–1%', co2: '20–30%', n2: 'Balance', applicable: true };
  }
  if (input.moisture < 15) {
    return { o2: '0–1% (Nitrogen Flush)', co2: '0–2%', n2: '98–100%', applicable: true };
  }
  return { o2: '2–5%', co2: '5–15%', n2: 'Balance', applicable: true };
}

// Sustainability Lifecycle Assessment
export function calculateSustainabilityLCA(material: PackagingMaterial): SustainabilityLCA {
  const recyclability = material.recyclability === 'High' || material.recyclability === 'Compostable' ? 5 : material.recyclability === 'Moderate' ? 3 : 1;
  const complexity = material.category.includes('Multilayer') || material.category.includes('Laminate') ? 2 : 4;
  const usage = clamp(6 - material.relative_cost, 1, 5);
  const environmental = material.sustainability;
  const endOfLife = material.recyclability === 'Compostable' ? 5 : recyclability;

  const overall = Math.round(((recyclability + complexity + usage + environmental + endOfLife) / 25) * 100);

  return {
    recyclability,
    complexity,
    usage,
    environmental,
    endOfLife,
    overall,
    note: 'Indicative prototype circularity profile based on material attributes and typical recycling streams. Actual validation requires ASTM/ISO testing.',
  };
}

// Main execution function
export function runPackagingAnalysis(input: AnalysisInput, materials: PackagingMaterial[]): RecommendationResult {
  const reqs = calculateRequirements(input);
  const ranked = materials.map(m => scoreMaterial(m, input, reqs)).sort((a, b) => b.score - a.score);

  const topMatch = ranked[0];
  if (!topMatch) {
    throw new Error('No materials available for analysis');
  }

  const bestMat = topMatch.material;

  const freshProduceInsights: FreshProduceInsights | null = input.freshProduce
    ? {
        respiration: input.respiration,
        o2Management: reqs.permeability >= 4 ? 'Active venting / Laser micro-perforation required' : 'Controlled permeability recommended',
        co2Management: reqs.permeability >= 4 ? 'Continuous CO₂ release to prevent anaerobic fermentation' : 'Moderate CO₂ buffering',
        humidityManagement: input.humidity >= 90 ? 'High — anti-fog coating / condensate management recommended' : 'Standard breathability',
        condensationRisk: input.humidity >= 88 && input.temperature <= 8 ? 'High' : input.humidity >= 75 ? 'Moderate' : 'Low',
      }
    : null;

  return {
    materialSlug: bestMat.slug,
    materialName: bestMat.name,
    compatibility: topMatch.score,
    reasons: generateReasons(bestMat, reqs, input),
    specifications: generateSpecifications(bestMat, reqs),
    factors: calculateFactorShares(topMatch),
    mapConditions: calculateMapConditions(input, reqs),
    alternatives: generateAlternatives(ranked, bestMat.slug),
    shelfLife: estimateShelfLife(input, topMatch),
    requirements: reqs,
    scores: ranked.map(r => ({
      slug: r.material.slug,
      name: r.material.name,
      score: r.score,
      breakdown: r.breakdown,
    })),
    freshProduce: freshProduceInsights,
    sustainability: calculateSustainabilityLCA(bestMat),
  };
}
