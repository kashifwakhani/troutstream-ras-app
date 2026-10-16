import React, { useState } from 'react';
import {
  TrendingUp,
  Scale,
  Plus,
  ArrowRightLeft,
  Calendar,
  ChevronRight,
  Info,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { FishSamplingRecord, FishStockMovement, Tank } from '../../types';
import { AddSamplingModal } from './AddSamplingModal';

interface StockGrowthScreenProps {
  samplingRecords: FishSamplingRecord[];
  stockMovements: FishStockMovement[];
  tanks: Tank[];
  onAddSampling: (data: any) => void;
  onOpenTransfer: () => void;
}

export const StockGrowthScreen: React.FC<StockGrowthScreenProps> = ({
  samplingRecords,
  stockMovements,
  tanks,
  onAddSampling,
  onOpenTransfer,
}) => {
  const [activeTab, setActiveTab] = useState<'sampling' | 'movements'>('sampling');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5 text-cyan-400" /> Fish Growth & Population
          </h2>
          <p className="text-xs text-slate-400">
            Biometric sampling • SGR • Permanent stock movements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTransfer}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-semibold"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" /> Sample Fish
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('sampling')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-colors ${
            activeTab === 'sampling' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Biometric Sampling ({samplingRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-colors ${
            activeTab === 'movements' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Stock Movement Log ({stockMovements.length})
        </button>
      </div>

      {activeTab === 'sampling' ? (
        <div className="space-y-3">
          {samplingRecords.map((s) => {
            const tank = tanks.find((t) => t.id === s.tankId);

            return (
              <div
                key={s.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-sm space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
                      {tank?.code || 'TANK'}
                    </span>
                    <h3 className="text-xs font-bold text-white">{tank?.name || 'Tank'}</h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{s.date}</span>
                </div>

                {/* Sampling Key Metrics */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Avg Weight</span>
                    <span className="font-extrabold text-cyan-400 text-sm">{s.avgWeightG}g</span>
                    <span className="text-[9px] text-slate-500 block">n={s.sampledCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Daily Gain (ADG)</span>
                    <span className="font-bold text-emerald-400 text-sm">+{s.adgGramsDay || 2.1}g</span>
                    <span className="text-[9px] text-slate-500 block">per day</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Growth SGR</span>
                    <span className="font-bold text-slate-200 text-sm">{s.sgrPctDay || 1.35}%</span>
                    <span className="text-[9px] text-slate-500 block">/day</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">To Harvest</span>
                    <span className="font-bold text-amber-400 text-sm">{s.daysToTargetHarvest || 12}d</span>
                    <span className="text-[9px] text-slate-500 block">target 450g</span>
                  </div>
                </div>

                {/* Fulton's K condition factor badge */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>
                    Fulton's Condition K:{' '}
                    <span className="text-cyan-300 font-bold">{s.conditionFactorK || 1.25}</span>{' '}
                    <span className="text-[10px] text-emerald-400">(Good fullness)</span>
                  </span>
                  <span>Op: {s.operator}</span>
                </div>

                {s.notes && (
                  <p className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                    {s.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Permanent Stock Movement Audit Trail */
        <div className="space-y-2.5">
          {stockMovements.map((mov) => {
            const src = tanks.find((t) => t.id === mov.sourceTankId);
            const dst = tanks.find((t) => t.id === mov.destinationTankId);

            return (
              <div
                key={mov.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 p-3.5 shadow-sm space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      mov.movementType === 'transfer'
                        ? 'bg-blue-950/80 border-blue-800 text-blue-300'
                        : mov.movementType === 'initial_stock'
                        ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                        : 'bg-rose-950/80 border-rose-800 text-rose-300'
                    }`}
                  >
                    {mov.movementType.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(mov.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-200">
                  {mov.movementType === 'transfer' ? (
                    <span>
                      Transferred {mov.fishCount.toLocaleString()} trout from {src?.name || 'Tank'} ➔{' '}
                      {dst?.name || 'Tank'}
                    </span>
                  ) : mov.movementType === 'initial_stock' ? (
                    <span>Stocked {mov.fishCount.toLocaleString()} trout into {dst?.name || 'Tank'}</span>
                  ) : (
                    <span>{mov.fishCount} fish removed ({mov.reason})</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>
                    Biomass shifted: <span className="font-bold text-slate-300">{mov.biomassKg} kg</span> (avg{' '}
                    {mov.avgWeightG}g)
                  </span>
                  <span>Op: {mov.operator}</span>
                </div>

                {mov.reason && (
                  <p className="text-[10px] text-slate-500 italic mt-0.5">{mov.reason}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Sampling Modal */}
      <AddSamplingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tanks={tanks}
        onAddSampling={onAddSampling}
      />
    </div>
  );
};
