import React from 'react';
import { PackagingMaterial } from '../../types/material';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Check, X, Wind, Droplets, Sun, Zap, Shield, Leaf, DollarSign } from 'lucide-react';

export interface MaterialCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlugs: string[];
  materials: PackagingMaterial[];
}

export const MaterialCompareModal: React.FC<MaterialCompareModalProps> = ({
  isOpen,
  onClose,
  selectedSlugs,
  materials,
}) => {
  const selectedMaterials = selectedSlugs
    .map((s) => materials.find((m) => m.slug === s))
    .filter(Boolean) as PackagingMaterial[];

  if (selectedMaterials.length === 0) return null;

  const compareRows = [
    { label: 'Category', render: (m: PackagingMaterial) => <Badge variant="cyan">{m.category}</Badge> },
    { label: 'OTR (Oxygen Transmission)', render: (m: PackagingMaterial) => <span className="font-mono font-bold">{m.otr_value} cc/m²·day</span> },
    { label: 'WVTR (Water Vapor)', render: (m: PackagingMaterial) => <span className="font-mono font-bold">{m.wvtr_value} g/m²·day</span> },
    { label: 'Film Thickness Range', render: (m: PackagingMaterial) => <span className="font-mono">{m.thickness_range}</span> },
    {
      label: 'Oxygen Barrier (1–5)',
      render: (m: PackagingMaterial) => (
        <div className="flex items-center gap-2">
          <span className="font-bold">{m.oxygen_barrier}/5</span>
          <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full" style={{ width: `${(m.oxygen_barrier / 5) * 100}%` }} />
          </div>
        </div>
      ),
    },
    {
      label: 'Moisture Barrier (1–5)',
      render: (m: PackagingMaterial) => (
        <div className="flex items-center gap-2">
          <span className="font-bold">{m.moisture_barrier}/5</span>
          <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full" style={{ width: `${(m.moisture_barrier / 5) * 100}%` }} />
          </div>
        </div>
      ),
    },
    {
      label: 'Light Barrier (1–5)',
      render: (m: PackagingMaterial) => <span className="font-mono">{m.light_barrier}/5</span>,
    },
    {
      label: 'Sealability & Integrity (1–5)',
      render: (m: PackagingMaterial) => <span className="font-mono">{m.sealability}/5</span>,
    },
    {
      label: 'Mechanical Strength (1–5)',
      render: (m: PackagingMaterial) => <span className="font-mono">{m.mechanical_strength}/5</span>,
    },
    {
      label: 'Temperature Window',
      render: (m: PackagingMaterial) => <span className="font-mono">{m.temp_min}°C to {m.temp_max}°C</span>,
    },
    {
      label: 'Relative Cost Index',
      render: (m: PackagingMaterial) => <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{'$'.repeat(m.relative_cost)}</span>,
    },
    {
      label: 'Sustainability Rating',
      render: (m: PackagingMaterial) => <span className="font-mono font-bold">{m.sustainability}/5</span>,
    },
    {
      label: 'Recyclability Stream',
      render: (m: PackagingMaterial) => <span className="text-xs font-semibold">{m.recyclability}</span>,
    },
    {
      label: 'MAP Gas Flushing',
      render: (m: PackagingMaterial) => (
        m.map_suitable ? (
          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
            <Check className="w-4 h-4" /> Suitable
          </span>
        ) : (
          <span className="text-rose-500 flex items-center gap-1">
            <X className="w-4 h-4" /> Not Recommended
          </span>
        )
      ),
    },
    {
      label: 'Fresh Produce Suitability',
      render: (m: PackagingMaterial) => (
        m.fresh_produce_suitable ? (
          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
            <Check className="w-4 h-4" /> Breathable / EMAP
          </span>
        ) : (
          <span className="text-slate-400">Standard Barrier</span>
        )
      ),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Packaging Materials 3-Way Side-by-Side Comparison"
      description="Comparing technical barrier parameters, mechanical strengths, cost, and circularity from database."
      maxWidth="4xl"
    >
      <div className="space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 text-slate-400 uppercase text-[10px] tracking-wider w-1/4">
                  Parameter
                </th>
                {selectedMaterials.map((mat) => (
                  <th key={mat.slug} className="py-3 px-4 font-display text-sm font-bold text-slate-900 dark:text-slate-100">
                    {mat.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {compareRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-900/40">
                    {row.label}
                  </td>
                  {selectedMaterials.map((mat) => (
                    <td key={mat.slug} className="py-3 px-4 text-slate-800 dark:text-slate-200">
                      {row.render(mat)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} className="text-xs">
            Close Comparison
          </Button>
        </div>
      </div>
    </Modal>
  );
};
