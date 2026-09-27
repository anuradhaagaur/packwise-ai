import React, { useState } from 'react';
import { Commodity, CommodityCategory, ProductForm } from '../../types/commodity';
import { AnalysisInput } from '../../types/analysis';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Search, Sparkles, AlertCircle, Apple, Wheat, Milk, Fish, Cake, Flame, Package } from 'lucide-react';

export interface WizardStep1ProductProps {
  input: AnalysisInput;
  onChange: (updates: Partial<AnalysisInput>) => void;
  commodities: Commodity[];
}

const CATEGORIES: CommodityCategory[] = [
  'Fruits',
  'Vegetables',
  'Cereals',
  'Pulses',
  'Dairy',
  'Meat',
  'Seafood',
  'Bakery',
  'Spices',
  'Processed Food',
  'Other',
];

const PRODUCT_FORMS: ProductForm[] = ['Whole', 'Cut', 'Powder', 'Liquid', 'Semi-solid', 'Processed'];

export const WizardStep1Product: React.FC<WizardStep1ProductProps> = ({
  input,
  onChange,
  commodities,
}) => {
  const [search, setSearch] = useState('');

  const filteredCommodities = commodities.filter((c) => {
    const matchesCategory = input.category === 'Other' || c.category === input.category;
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectCommodity = (commodity: Commodity) => {
    const isFresh = commodity.fresh_produce;
    onChange({
      commodity: commodity.name,
      category: commodity.category,
      freshProduce: isFresh,
      moisture: commodity.default_moisture,
      oil: commodity.default_oil,
      ph: commodity.default_ph,
      respiration: commodity.default_respiration,
      storageType: commodity.typical_storage,
      temperature:
        commodity.typical_storage === 'Chilled'
          ? 4
          : commodity.typical_storage === 'Cold Storage'
          ? 2
          : commodity.typical_storage === 'Frozen'
          ? -18
          : 25,
      humidity: commodity.typical_storage === 'Ambient' ? 60 : 88,
      shelfLifeTarget: commodity.typical_shelf_life_days || 30,
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display">
          1. Select or Describe Food Product
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Pick a reference commodity from our database or specify custom product parameters below.
        </p>
      </div>

      {/* Category Pills */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Product Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const isSelected = input.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  const isProduce = ['Fruits', 'Vegetables'].includes(cat);
                  onChange({ category: cat, freshProduce: isProduce });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200/50 dark:border-slate-700/50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset Commodity Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Quick-Select Preset Commodity
          </label>
          <span className="text-[11px] text-slate-400">
            {filteredCommodities.length} {input.category !== 'Other' ? input.category : 'total'} items
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search commodities (e.g. Tomato, Rice, Salmon, Paneer)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>

        {/* Commodity Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
          {filteredCommodities.slice(0, 16).map((c) => {
            const isChosen = input.commodity === c.name;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectCommodity(c)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isChosen
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 shadow-sm ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-semibold text-xs truncate">{c.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                  <span>{c.default_moisture}% H₂O</span>
                  <span>·</span>
                  <span>{c.typical_storage}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Commodity Name & Product Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Active Commodity Name
          </label>
          <input
            type="text"
            value={input.commodity}
            onChange={(e) => onChange({ commodity: e.target.value })}
            placeholder="e.g. Fresh Cherry Tomatoes"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Physical Product Form
          </label>
          <select
            value={input.productForm}
            onChange={(e) => onChange({ productForm: e.target.value as ProductForm })}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          >
            {PRODUCT_FORMS.map((form) => (
              <option key={form} value={form}>
                {form}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fresh Produce Toggle Notice */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Apple className="w-4 h-4 text-emerald-500 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Live Respiring Fresh Produce Logic
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Enables Equilibrium Modified Atmosphere Packaging (EMAP) and gas breathability rules.
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={input.freshProduce}
            onChange={(e) => onChange({ freshProduce: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
      </div>
    </div>
  );
};
