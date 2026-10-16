import React, { useState } from 'react';
import {
  Waves,
  Plus,
  ArrowRightLeft,
  Edit2,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Activity,
  Info,
} from 'lucide-react';
import { Tank } from '../../types';
import { TransferFishModal } from './TransferFishModal';
import { AddEditTankModal } from './AddEditTankModal';

interface TankListScreenProps {
  tanks: Tank[];
  onUpdateTank: (id: string, updates: Partial<Tank>) => void;
  onAddTank: (data: any) => void;
  onTransfer: (sourceId: string, destId: string, count: number, operator: string, reason: string) => void;
  onSelectTank: (tankId: string) => void;
}

export const TankListScreen: React.FC<TankListScreenProps> = ({
  tanks,
  onUpdateTank,
  onAddTank,
  onTransfer,
  onSelectTank,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string | undefined>(undefined);
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [tankToEdit, setTankToEdit] = useState<Tank | null>(null);

  const filteredTanks = tanks.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const totalFarmBiomass = tanks.reduce((sum, t) => sum + t.estimatedBiomassKg, 0);
  const totalFarmFish = tanks.reduce((sum, t) => sum + t.fishCount, 0);

  const handleOpenTransfer = (tankId?: string) => {
    setSelectedSourceId(tankId);
    setTransferModalOpen(true);
  };

  const handleOpenEdit = (tank: Tank) => {
    setTankToEdit(tank);
    setAddEditModalOpen(true);
  };

  const handleOpenAdd = () => {
    setTankToEdit(null);
    setAddEditModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Top Action & Summary Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-1.5">
            <Waves className="w-5 h-5 text-cyan-400" /> Tank Inventory & Stock
          </h2>
          <p className="text-xs text-slate-400">
            {totalFarmFish.toLocaleString()} trout • {totalFarmBiomass.toLocaleString()} kg biomass
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenTransfer()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors shadow-md shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" /> Add Tank
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
        {['all', 'active', 'quarantine', 'cleaning'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-1 px-2 rounded-lg capitalize transition-colors font-medium text-center ${
              filter === tab
                ? 'bg-slate-800 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tank Cards Grid */}
      <div className="space-y-3">
        {filteredTanks.map((tank) => {
          const harvestProgress = Math.min(100, Math.round((tank.avgWeightG / tank.targetHarvestWeightG) * 100));

          return (
            <div
              key={tank.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-sm hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-800/80 text-cyan-300 font-bold">
                      {tank.code}
                    </span>
                    <h3 className="font-bold text-sm text-white">{tank.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {tank.type} • {tank.volumeM3} m³ volume (Ø {tank.diameterM || 5.0}m × {tank.depthM || 1.2}m)
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenTransfer(tank.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                    title="Transfer fish out of this tank"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(tank)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Edit Tank details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Biomass Calculation Formula Box */}
              <div className="my-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Fish Count</span>
                  <span className="font-extrabold text-white text-sm">{tank.fishCount.toLocaleString()}</span>
                  <span className="text-[9px] text-slate-500 block">trout</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Avg Weight</span>
                  <span className="font-extrabold text-cyan-400 text-sm">{tank.avgWeightG} g</span>
                  <span className="text-[9px] text-slate-500 block">target {tank.targetHarvestWeightG}g</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Biomass (kg)</span>
                  <span className="font-extrabold text-emerald-400 text-sm">
                    {tank.estimatedBiomassKg.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono block">
                    {tank.densityKgM3} kg/m³
                  </span>
                </div>
              </div>

              {/* Growth Progress & Notes */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-cyan-400" /> Market Ready Progress
                  </span>
                  <span className="font-semibold text-slate-300 text-[11px]">{harvestProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${harvestProgress}%` }}
                  ></div>
                </div>
              </div>

              {tank.notes && (
                <div className="mt-3 text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800/50 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                  <span>{tank.notes}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Transfer Fish Modal */}
      <TransferFishModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        tanks={tanks}
        defaultSourceTankId={selectedSourceId}
        onTransfer={onTransfer}
      />

      {/* Add / Edit Tank Modal */}
      <AddEditTankModal
        isOpen={addEditModalOpen}
        onClose={() => setAddEditModalOpen(false)}
        tankToEdit={tankToEdit}
        onSave={(data) => {
          if (tankToEdit) {
            onUpdateTank(tankToEdit.id, data);
          } else {
            onAddTank(data);
          }
        }}
      />
    </div>
  );
};
