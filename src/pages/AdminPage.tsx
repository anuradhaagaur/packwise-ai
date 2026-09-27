import React, { useState } from 'react';
import { Commodity, CommodityCategory, RespirationLevel } from '../types/commodity';
import { PackagingMaterial, RecyclabilityLevel } from '../types/material';
import { addCommodity, updateCommodity, deleteCommodity } from '../services/commoditiesService';
import { addMaterial, updateMaterial, deleteMaterial } from '../services/materialsService';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Database,
  Apple,
  Layers,
  Sparkles,
  Lock,
  CheckCircle2
} from 'lucide-react';

export interface AdminPageProps {
  commodities: Commodity[];
  materials: PackagingMaterial[];
  onRefreshData: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  commodities,
  materials,
  onRefreshData,
}) => {
  const { isAdmin, user, toggleAdminRole } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'commodities' | 'materials'>('commodities');
  const [commodityModalOpen, setCommodityModalOpen] = useState(false);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);

  // Commodity form state
  const [commForm, setCommForm] = useState<Partial<Commodity>>({
    name: '',
    slug: '',
    category: 'Vegetables',
    fresh_produce: true,
    default_moisture: 80,
    default_oil: 1,
    default_ph: 5.5,
    default_respiration: 'Moderate',
    typical_storage: 'Chilled',
  });

  // Material form state
  const [matForm, setMatForm] = useState<Partial<PackagingMaterial>>({
    name: '',
    slug: '',
    category: 'Polyolefins',
    description: '',
    oxygen_barrier: 3,
    moisture_barrier: 3,
    light_barrier: 2,
    sealability: 4,
    mechanical_strength: 4,
    relative_cost: 2,
    recyclability: 'High',
    sustainability: 4,
    otr_value: 100,
    otr_label: 'Moderate OTR',
    wvtr_value: 10,
    wvtr_label: 'Moderate WVTR',
    thickness_range: '30 – 80 µm',
    temp_min: -20,
    temp_max: 80,
    map_suitable: true,
    fresh_produce_suitable: false,
    typical_applications: ['Food packaging'],
  });

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
          Admin Laboratory Access Required
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          You are currently signed in as a standard researcher. Toggle to Admin Mode to manage the food science database and packaging materials catalog.
        </p>
        <Button onClick={toggleAdminRole} className="w-full text-xs font-bold">
          <Shield className="w-4 h-4 mr-1.5" /> Enable Lab Admin Mode
        </Button>
      </div>
    );
  }

  const handleSaveCommodity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commForm.name) {
      error('Commodity name is required');
      return;
    }
    const slug = commForm.slug || commForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    try {
      await addCommodity({
        ...commForm,
        slug,
        name: commForm.name,
        category: commForm.category || 'Other',
        fresh_produce: commForm.fresh_produce || false,
        default_moisture: Number(commForm.default_moisture) || 50,
        default_oil: Number(commForm.default_oil) || 2,
        default_ph: Number(commForm.default_ph) || 6,
        default_respiration: (commForm.default_respiration as RespirationLevel) || 'Very Low',
        moisture_sensitivity: 'Moderate',
        perishability: 'Moderate',
        typical_storage: commForm.typical_storage || 'Ambient',
      } as any);

      success('Commodity Saved', `${commForm.name} is now available for analysis.`);
      setCommodityModalOpen(false);
      onRefreshData();
    } catch (err: any) {
      error('Failed to save commodity', err.message);
    }
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matForm.name) {
      error('Material name is required');
      return;
    }
    const slug = matForm.slug || matForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    try {
      await addMaterial({
        ...matForm,
        slug,
        name: matForm.name,
        category: matForm.category || 'Polyolefins',
        description: matForm.description || '',
        oxygen_barrier: Number(matForm.oxygen_barrier) || 3,
        moisture_barrier: Number(matForm.moisture_barrier) || 3,
        light_barrier: Number(matForm.light_barrier) || 2,
        sealability: Number(matForm.sealability) || 4,
        mechanical_strength: Number(matForm.mechanical_strength) || 4,
        relative_cost: Number(matForm.relative_cost) || 2,
        recyclability: (matForm.recyclability as RecyclabilityLevel) || 'High',
        sustainability: Number(matForm.sustainability) || 3,
        otr_value: Number(matForm.otr_value) || 100,
        otr_label: matForm.otr_label || 'Calibrated OTR',
        wvtr_value: Number(matForm.wvtr_value) || 10,
        wvtr_label: matForm.wvtr_label || 'Calibrated WVTR',
        thickness_range: matForm.thickness_range || '25 – 80 µm',
        temp_min: Number(matForm.temp_min) || -20,
        temp_max: Number(matForm.temp_max) || 80,
        map_suitable: Boolean(matForm.map_suitable),
        fresh_produce_suitable: Boolean(matForm.fresh_produce_suitable),
        typical_applications: matForm.typical_applications || ['Packaging'],
      } as any);

      success('Material Saved', `${matForm.name} added to catalog.`);
      setMaterialModalOpen(false);
      onRefreshData();
    } catch (err: any) {
      error('Failed to save material', err.message);
    }
  };

  const handleDeleteComm = async (slug: string) => {
    try {
      await deleteCommodity(slug);
      success('Commodity deleted');
      onRefreshData();
    } catch (err: any) {
      error('Failed to delete', err.message);
    }
  };

  const handleDeleteMat = async (slug: string) => {
    try {
      await deleteMaterial(slug);
      success('Material deleted');
      onRefreshData();
    } catch (err: any) {
      error('Failed to delete', err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
              <Shield className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Lab Administration Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Food Science & Material Database Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Add, update, or remove commodities, biochemical baseline defaults, and packaging polymer parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'commodities' ? (
            <Button
              size="sm"
              onClick={() => {
                setCommForm({ name: '', category: 'Vegetables', fresh_produce: true, default_moisture: 80, default_oil: 1, default_ph: 5.5, default_respiration: 'Moderate', typical_storage: 'Chilled' });
                setCommodityModalOpen(true);
              }}
              className="text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add New Commodity
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setMatForm({ name: '', category: 'Polyolefins', oxygen_barrier: 3, moisture_barrier: 3, light_barrier: 2, sealability: 4, mechanical_strength: 4, relative_cost: 2, recyclability: 'High', sustainability: 3, otr_value: 100, otr_label: 'Moderate OTR', wvtr_value: 10, wvtr_label: 'Moderate WVTR', thickness_range: '30 – 80 µm', temp_min: -20, temp_max: 80, map_suitable: true, fresh_produce_suitable: false, typical_applications: ['Food packaging'] });
                setMaterialModalOpen(true);
              }}
              className="text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add New Material
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('commodities')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'commodities'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Apple className="w-4 h-4" /> Commodities Catalog ({commodities.length})
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'materials'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" /> Materials Catalog ({materials.length})
        </button>
      </div>

      {/* Commodities Manager */}
      {activeTab === 'commodities' && (
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Commodity Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Fresh Produce</th>
                  <th className="py-2.5 px-3">Default H₂O %</th>
                  <th className="py-2.5 px-3">Default Fat %</th>
                  <th className="py-2.5 px-3">pH</th>
                  <th className="py-2.5 px-3">Typical Storage</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {commodities.map((c) => (
                  <tr key={c.slug} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                      {c.name}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="cyan" className="text-[10px]">{c.category}</Badge>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {c.fresh_produce ? <span className="text-emerald-500 font-bold">Yes (EMAP)</span> : 'No'}
                    </td>
                    <td className="py-3 px-3 font-mono">{c.default_moisture}%</td>
                    <td className="py-3 px-3 font-mono">{c.default_oil}%</td>
                    <td className="py-3 px-3 font-mono">{c.default_ph}</td>
                    <td className="py-3 px-3">{c.typical_storage}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteComm(c.slug)}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                        title="Delete Commodity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Materials Manager */}
      {activeTab === 'materials' && (
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Material Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">O₂ Barrier</th>
                  <th className="py-2.5 px-3">H₂O Barrier</th>
                  <th className="py-2.5 px-3">Thickness</th>
                  <th className="py-2.5 px-3">Cost</th>
                  <th className="py-2.5 px-3">Circularity</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {materials.map((m) => (
                  <tr key={m.slug} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                      {m.name}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="cyan" className="text-[10px]">{m.category}</Badge>
                    </td>
                    <td className="py-3 px-3 font-mono">{m.oxygen_barrier}/5</td>
                    <td className="py-3 px-3 font-mono">{m.moisture_barrier}/5</td>
                    <td className="py-3 px-3 font-mono">{m.thickness_range}</td>
                    <td className="py-3 px-3 font-mono text-emerald-600 font-bold">{'$'.repeat(m.relative_cost)}</td>
                    <td className="py-3 px-3">{m.recyclability}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteMat(m.slug)}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                        title="Delete Material"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Commodity Modal */}
      <Modal
        isOpen={commodityModalOpen}
        onClose={() => setCommodityModalOpen(false)}
        title="Add Food Commodity"
        description="Register a new food matrix with standard biochemical baselines."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCommodity} className="space-y-4">
          <Input
            label="Commodity Display Name"
            placeholder="e.g. Fresh Hass Avocado"
            value={commForm.name}
            onChange={(e) => setCommForm({ ...commForm, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={commForm.category}
                onChange={(e) => setCommForm({ ...commForm, category: e.target.value as CommodityCategory })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                {['Fruits', 'Vegetables', 'Cereals', 'Pulses', 'Dairy', 'Meat', 'Seafood', 'Bakery', 'Spices', 'Processed Food', 'Other'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Typical Storage
              </label>
              <select
                value={commForm.typical_storage}
                onChange={(e) => setCommForm({ ...commForm, typical_storage: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                {['Ambient', 'Chilled', 'Cold Storage', 'Frozen'].map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Moisture %"
              type="number"
              value={commForm.default_moisture}
              onChange={(e) => setCommForm({ ...commForm, default_moisture: parseFloat(e.target.value) })}
            />
            <Input
              label="Fat/Oil %"
              type="number"
              value={commForm.default_oil}
              onChange={(e) => setCommForm({ ...commForm, default_oil: parseFloat(e.target.value) })}
            />
            <Input
              label="pH Level"
              type="number"
              step="0.1"
              value={commForm.default_ph}
              onChange={(e) => setCommForm({ ...commForm, default_ph: parseFloat(e.target.value) })}
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs font-semibold">Live Respiring Fresh Produce</span>
            <input
              type="checkbox"
              checked={commForm.fresh_produce}
              onChange={(e) => setCommForm({ ...commForm, fresh_produce: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setCommodityModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-bold">
              Save Commodity
            </Button>
          </div>
        </form>
      </Modal>

      {/* Material Modal */}
      <Modal
        isOpen={materialModalOpen}
        onClose={() => setMaterialModalOpen(false)}
        title="Add Packaging Material"
        description="Register a new polymer or multilayer composite with barrier metrics."
        maxWidth="xl"
      >
        <form onSubmit={handleSaveMaterial} className="space-y-4">
          <Input
            label="Material Name"
            placeholder="e.g. PVDC Coated PET / PE"
            value={matForm.name}
            onChange={(e) => setMatForm({ ...matForm, name: e.target.value })}
            required
          />

          <Input
            label="Technical Description"
            placeholder="High oxygen barrier composite for modified atmosphere packaging..."
            value={matForm.description}
            onChange={(e) => setMatForm({ ...matForm, description: e.target.value })}
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="O₂ Barrier (1-5)"
              type="number"
              min="1"
              max="5"
              value={matForm.oxygen_barrier}
              onChange={(e) => setMatForm({ ...matForm, oxygen_barrier: parseInt(e.target.value) })}
            />
            <Input
              label="H₂O Barrier (1-5)"
              type="number"
              min="1"
              max="5"
              value={matForm.moisture_barrier}
              onChange={(e) => setMatForm({ ...matForm, moisture_barrier: parseInt(e.target.value) })}
            />
            <Input
              label="Thickness Range"
              value={matForm.thickness_range}
              onChange={(e) => setMatForm({ ...matForm, thickness_range: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="OTR Value (cc/m2.day)"
              type="number"
              value={matForm.otr_value}
              onChange={(e) => setMatForm({ ...matForm, otr_value: parseFloat(e.target.value) })}
            />
            <Input
              label="WVTR Value (g/m2.day)"
              type="number"
              value={matForm.wvtr_value}
              onChange={(e) => setMatForm({ ...matForm, wvtr_value: parseFloat(e.target.value) })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setMaterialModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-bold">
              Save Material
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
