import React, { useState } from 'react';
import { Utensils, X, AlertCircle } from 'lucide-react';
import { Tank, FeedProduct } from '../../types';

interface AddFeedRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  tanks: Tank[];
  feedProducts: FeedProduct[];
  defaultTankId?: string;
  onAddFeed: (record: any) => void;
}

export const AddFeedRecordModal: React.FC<AddFeedRecordModalProps> = ({
  isOpen,
  onClose,
  tanks,
  feedProducts,
  defaultTankId,
  onAddFeed,
}) => {
  if (!isOpen) return null;

  const [tankId, setTankId] = useState<string>(defaultTankId || tanks[0]?.id || '');
  const [feedProductId, setFeedProductId] = useState<string>(feedProducts[0]?.id || '');
  const [timestamp, setTimestamp] = useState<string>(new Date().toISOString().slice(0, 16));
  const [quantityKg, setQuantityKg] = useState<number>(14.5);
  const [sessionsCount, setSessionsCount] = useState<number>(3);
  const [feedingMethod, setFeedingMethod] = useState<'automatic_feeder' | 'hand' | 'demand_feeder'>(
    'automatic_feeder'
  );
  const [batchNumber, setBatchNumber] = useState<string>('LOT-2026-44B');
  const [operator, setOperator] = useState<string>('Markus L.');
  const [appetiteRating, setAppetiteRating] = useState<'poor' | 'moderate' | 'good' | 'aggressive'>('good');
  const [notes, setNotes] = useState<string>('Feeding response vigorous, pellets consumed in under 3 minutes.');
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = feedProducts.find((p) => p.id === feedProductId);
  const selectedTank = tanks.find((t) => t.id === tankId);

  // Feeding % of tank biomass
  const feedingRatePct =
    selectedTank && selectedTank.estimatedBiomassKg > 0
      ? Number(((quantityKg / selectedTank.estimatedBiomassKg) * 100).toFixed(2))
      : 0;

  const costEstimate = selectedProduct ? Number((quantityKg * selectedProduct.unitPricePerKg).toFixed(2)) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tankId || !feedProductId) {
      setError('Please select tank and feed product.');
      return;
    }
    if (quantityKg <= 0) {
      setError('Feed quantity must be greater than 0 kg.');
      return;
    }

    onAddFeed({
      tankId,
      timestamp: new Date(timestamp).toISOString(),
      feedProductId,
      feedProductName: selectedProduct ? `${selectedProduct.brand} ${selectedProduct.productName}` : 'Standard Pellet',
      pelletSizeMm: selectedProduct?.pelletSizeMm || 3.0,
      quantityKg: Number(quantityKg),
      sessionsCount: Number(sessionsCount),
      feedingMethod,
      batchNumber,
      operator,
      appetiteRating,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl my-8">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-950 border border-amber-800 text-amber-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Record Daily Feed Ration</h3>
              <p className="text-xs text-slate-400">Track feeding quantity, appetite, and ration cost</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Tank</label>
              <select
                value={tankId}
                onChange={(e) => setTankId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
              >
                {tanks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code} - {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Feeding Date & Time</label>
              <input
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Feed Formulation / Brand</label>
            <select
              value={feedProductId}
              onChange={(e) => setFeedProductId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            >
              {feedProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brand} {p.productName} ({p.pelletSizeMm}mm, {p.proteinPct}% Pro / {p.fatPct}% Fat) - ${p.unitPricePerKg}/kg
                </option>
              ))}
            </select>
            {selectedProduct && (
              <span className="text-[10px] text-slate-400 mt-1 block">
                Warehouse Stock: {selectedProduct.stockRemainingKg} kg remaining
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Feed Quantity (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={quantityKg}
                onChange={(e) => setQuantityKg(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Sessions Count</label>
              <input
                type="number"
                min="1"
                max="12"
                value={sessionsCount}
                onChange={(e) => setSessionsCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Feeding Method</label>
              <select
                value={feedingMethod}
                onChange={(e) => setFeedingMethod(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="automatic_feeder">Auto Feeder</option>
                <option value="hand">Hand Fed</option>
                <option value="demand_feeder">Demand Pendulum</option>
              </select>
            </div>
          </div>

          {/* Biomass % and Cost Estimation Box */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Ration / Body Weight:</span>
              <span className="font-bold text-cyan-400 text-sm">{feedingRatePct}% of biomass</span>
              <span className="text-[9px] text-slate-500 block">Ideal: 1.0 - 2.5% for trout</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Estimated Ration Cost:</span>
              <span className="font-bold text-amber-400 text-sm">${costEstimate.toFixed(2)}</span>
              <span className="text-[9px] text-slate-500 block">based on ${selectedProduct?.unitPricePerKg || 2.5}/kg</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Appetite Response</label>
              <select
                value={appetiteRating}
                onChange={(e) => setAppetiteRating(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
              >
                <option value="aggressive">Aggressive (Boiling water)</option>
                <option value="good">Good (Clean consumption)</option>
                <option value="moderate">Moderate (Slow response)</option>
                <option value="poor">Poor (Pellets settling)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Lot / Batch #</label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="LOT-..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Operator</label>
              <input
                type="text"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Behavior Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Surface break, appetite..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-md shadow-amber-500/20"
            >
              Log Feeding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
