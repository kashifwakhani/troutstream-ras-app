import React, { useState } from 'react';
import {
  Utensils,
  Plus,
  DollarSign,
  Package,
  Calendar,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { FeedRecord, FeedProduct, Tank } from '../../types';
import { AddFeedRecordModal } from './AddFeedRecordModal';

interface FeedManagementScreenProps {
  feedRecords: FeedRecord[];
  feedProducts: FeedProduct[];
  tanks: Tank[];
  onAddFeed: (record: any) => void;
}

export const FeedManagementScreen: React.FC<FeedManagementScreenProps> = ({
  feedRecords,
  feedProducts,
  tanks,
  onAddFeed,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTankFilter, setSelectedTankFilter] = useState<string>('all');

  const totalFarmBiomass = tanks.reduce((sum, t) => sum + t.estimatedBiomassKg, 0);

  // Filter records
  const filteredRecords = feedRecords.filter((r) => {
    if (selectedTankFilter === 'all') return true;
    return r.tankId === selectedTankFilter;
  });

  // Today's total feed
  const todayStr = '2026-10-16';
  const todayRecords = feedRecords.filter((r) => r.timestamp.startsWith(todayStr));
  const todayFeedKg = todayRecords.reduce((sum, r) => sum + r.quantityKg, 0);
  const todayCost = todayRecords.reduce((sum, r) => sum + r.costEstimate, 0);

  // Overall feed stats
  const totalAllTimeFeedKg = feedRecords.reduce((sum, r) => sum + r.quantityKg, 0);
  const totalFeedCost = feedRecords.reduce((sum, r) => sum + r.costEstimate, 0);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-1.5">
            <Utensils className="w-5 h-5 text-amber-400" /> Daily Feeding & Nutrition
          </h2>
          <p className="text-xs text-slate-400">
            {todayFeedKg.toFixed(1)} kg fed today • Est. ${todayCost.toFixed(2)} cost
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Log Feeding
        </button>
      </div>

      {/* Daily Metrics Snapshot */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Today Farm Feed</span>
          <span className="text-lg font-black text-amber-400">{todayFeedKg.toFixed(1)}</span>
          <span className="text-[10px] text-slate-400 block">kg total</span>
        </div>

        <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Ration (% Biomass)</span>
          <span className="text-lg font-black text-cyan-400">
            {totalFarmBiomass > 0 ? ((todayFeedKg / totalFarmBiomass) * 100).toFixed(2) : 0}%
          </span>
          <span className="text-[10px] text-slate-400 block">target 1.3%</span>
        </div>

        <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Daily Cost</span>
          <span className="text-lg font-black text-emerald-400">${todayCost.toFixed(1)}</span>
          <span className="text-[10px] text-slate-400 block">USD</span>
        </div>
      </div>

      {/* Warehouse Feed Stock Inventory Status */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-200">Feed Inventory & Pellets</h3>
          </div>
          <span className="text-[10px] text-slate-400">Extruded floating & slow sinking</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {feedProducts.map((p) => {
            const isLow = p.stockRemainingKg < 200;
            return (
              <div
                key={p.id}
                className={`p-2.5 rounded-xl border text-xs ${
                  isLow ? 'bg-amber-950/30 border-amber-800/60' : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-200">{p.brand} {p.pelletSizeMm}mm</span>
                  {isLow && (
                    <span className="text-[9px] font-bold text-amber-400 bg-amber-950 px-1 rounded border border-amber-800">
                      LOW
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">{p.productName}</div>
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/80">
                  <span className="font-bold text-slate-300">{p.stockRemainingKg} kg</span>
                  <span className="text-[10px] text-slate-400">${p.unitPricePerKg}/kg</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feeding Logs List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300">Feeding Session History</h3>
          <select
            value={selectedTankFilter}
            onChange={(e) => setSelectedTankFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Tanks</option>
            {tanks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.code} - {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2.5">
          {filteredRecords.map((r) => {
            const tank = tanks.find((t) => t.id === r.tankId);
            const appetiteColors: Record<string, string> = {
              aggressive: 'text-emerald-400 bg-emerald-950/80 border-emerald-800',
              good: 'text-cyan-400 bg-cyan-950/80 border-cyan-800',
              moderate: 'text-amber-400 bg-amber-950/80 border-amber-800',
              poor: 'text-rose-400 bg-rose-950/80 border-rose-800',
            };

            return (
              <div
                key={r.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 p-3.5 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 font-bold">
                      {tank?.code || 'TANK'}
                    </span>
                    <span className="text-xs font-bold text-white">{tank?.name || 'Tank'}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                    {new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs bg-slate-950/60 p-2 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Quantity</span>
                    <span className="font-extrabold text-amber-400 text-sm">{r.quantityKg} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Pellet / Method</span>
                    <span className="text-slate-300 font-medium">
                      {r.pelletSizeMm}mm ({r.feedingMethod.replace('_', ' ')})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Sessions</span>
                    <span className="text-slate-200 font-bold">{r.sessionsCount} runs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Cost</span>
                    <span className="text-emerald-400 font-mono font-bold">${r.costEstimate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-400">
                    Product: <span className="text-slate-300 font-medium">{r.feedProductName}</span>
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${
                      appetiteColors[r.appetiteRating] || appetiteColors.good
                    }`}
                  >
                    {r.appetiteRating} Appetite
                  </span>
                </div>

                {r.notes && (
                  <p className="text-[11px] text-slate-400 bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/40">
                    {r.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Feed Modal */}
      <AddFeedRecordModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tanks={tanks}
        feedProducts={feedProducts}
        onAddFeed={onAddFeed}
      />
    </div>
  );
};
