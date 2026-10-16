import React, { useState } from 'react';
import { Layers, X, AlertCircle } from 'lucide-react';
import { Tank, TankType, TankStatus } from '../../types';
import { calculateBiomass, calculateStockingDensity } from '../../utils/aquacultureCalculations';

interface AddEditTankModalProps {
  isOpen: boolean;
  onClose: () => void;
  tankToEdit?: Tank | null;
  onSave: (tankData: any) => void;
}

export const AddEditTankModal: React.FC<AddEditTankModalProps> = ({
  isOpen,
  onClose,
  tankToEdit,
  onSave,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(tankToEdit?.name || '');
  const [code, setCode] = useState(tankToEdit?.code || 'T-05');
  const [type, setType] = useState<TankType>(tankToEdit?.type || 'circular');
  const [volumeM3, setVolumeM3] = useState(tankToEdit?.volumeM3 || 30);
  const [diameterM, setDiameterM] = useState(tankToEdit?.diameterM || 5.5);
  const [depthM, setDepthM] = useState(tankToEdit?.depthM || 1.25);
  const [fishCount, setFishCount] = useState(tankToEdit?.fishCount || 5000);
  const [avgWeightG, setAvgWeightG] = useState(tankToEdit?.avgWeightG || 120);
  const [stockingDate, setStockingDate] = useState(tankToEdit?.stockingDate || '2026-09-01');
  const [targetHarvestWeightG, setTargetHarvestWeightG] = useState(tankToEdit?.targetHarvestWeightG || 450);
  const [status, setStatus] = useState<TankStatus>(tankToEdit?.status || 'active');
  const [notes, setNotes] = useState(tankToEdit?.notes || '');
  const [error, setError] = useState<string | null>(null);

  const previewBiomass = calculateBiomass(fishCount, avgWeightG);
  const previewDensity = calculateStockingDensity(previewBiomass, volumeM3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Tank name and code are required.');
      return;
    }
    if (volumeM3 <= 0) {
      setError('Water volume must be greater than 0.');
      return;
    }
    if (fishCount < 0 || avgWeightG <= 0) {
      setError('Fish count and average weight must be valid.');
      return;
    }

    onSave({
      name,
      code,
      type,
      volumeM3: Number(volumeM3),
      diameterM: Number(diameterM),
      depthM: Number(depthM),
      fishCount: Number(fishCount),
      avgWeightG: Number(avgWeightG),
      stockingDate,
      targetHarvestWeightG: Number(targetHarvestWeightG),
      status,
      waterLoopId: 'loop-alpha',
      notes,
      farmId: 'farm-alpine-1',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl my-8">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {tankToEdit ? `Edit Tank ${tankToEdit.code}` : 'Add New RAS Tank'}
              </h3>
              <p className="text-xs text-slate-400">Configure geometry, stocking, and target harvest</p>
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Tank Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. T-05"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tank Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TankType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="circular">Circular</option>
                <option value="d_ended">D-Ended / Octagonal</option>
                <option value="raceway">Raceway</option>
                <option value="nursery_tray">Nursery Tray</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Tank Name / Cohort</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Growout Tank 5"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Volume (m³)</label>
              <input
                type="number"
                step="0.1"
                value={volumeM3}
                onChange={(e) => setVolumeM3(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Diameter (m)</label>
              <input
                type="number"
                step="0.1"
                value={diameterM}
                onChange={(e) => setDiameterM(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Depth (m)</label>
              <input
                type="number"
                step="0.05"
                value={depthM}
                onChange={(e) => setDepthM(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Fish Count</label>
              <input
                type="number"
                value={fishCount}
                onChange={(e) => setFishCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Avg Weight (g)</label>
              <input
                type="number"
                step="0.1"
                value={avgWeightG}
                onChange={(e) => setAvgWeightG(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-bold"
              />
            </div>
          </div>

          {/* Auto calculated card */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Calculated Biomass</span>
              <span className="font-bold text-white text-sm">{previewBiomass.toLocaleString()} kg</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Stocking Density</span>
              <span className={`font-mono font-bold text-sm ${previewDensity > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {previewDensity} kg/m³
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Weight (g)</label>
              <input
                type="number"
                value={targetHarvestWeightG}
                onChange={(e) => setTargetHarvestWeightG(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tank Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TankStatus)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="active">Active</option>
                <option value="quarantine">Quarantine</option>
                <option value="cleaning">Cleaning / Fallow</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Feeding responses, grading notes, water velocity settings..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
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
              className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
            >
              {tankToEdit ? 'Save Changes' : 'Create Tank'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
