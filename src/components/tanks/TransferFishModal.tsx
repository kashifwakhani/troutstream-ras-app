import React, { useState } from 'react';
import { ArrowRightLeft, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Tank } from '../../types';
import { calculateBiomass, calculateStockingDensity } from '../../utils/aquacultureCalculations';

interface TransferFishModalProps {
  isOpen: boolean;
  onClose: () => void;
  tanks: Tank[];
  defaultSourceTankId?: string;
  onTransfer: (sourceTankId: string, destTankId: string, count: number, operator: string, reason: string) => void;
}

export const TransferFishModal: React.FC<TransferFishModalProps> = ({
  isOpen,
  onClose,
  tanks,
  defaultSourceTankId,
  onTransfer,
}) => {
  if (!isOpen) return null;

  const [sourceId, setSourceId] = useState<string>(defaultSourceTankId || tanks[0]?.id || '');
  const [destId, setDestId] = useState<string>(
    tanks.find((t) => t.id !== (defaultSourceTankId || tanks[0]?.id))?.id || ''
  );
  const [count, setCount] = useState<number>(500);
  const [operator, setOperator] = useState<string>('Markus L.');
  const [reason, setReason] = useState<string>('Size grading and density management');
  const [error, setError] = useState<string | null>(null);

  const sourceTank = tanks.find((t) => t.id === sourceId);
  const destTank = tanks.find((t) => t.id === destId);

  // Pre-calculations for transfer simulation
  const validCount = Math.max(0, count);
  const transferredBiomassKg = sourceTank ? calculateBiomass(validCount, sourceTank.avgWeightG) : 0;

  // New simulated source state
  const simSourceCount = sourceTank ? Math.max(0, sourceTank.fishCount - validCount) : 0;
  const simSourceBiomass = sourceTank ? calculateBiomass(simSourceCount, sourceTank.avgWeightG) : 0;
  const simSourceDensity = sourceTank ? calculateStockingDensity(simSourceBiomass, sourceTank.volumeM3) : 0;

  // New simulated dest state
  const simDestCount = destTank ? destTank.fishCount + validCount : 0;
  const simDestAvgWeight =
    destTank && sourceTank && simDestCount > 0
      ? Number(
          ((destTank.fishCount * destTank.avgWeightG + validCount * sourceTank.avgWeightG) / simDestCount).toFixed(1)
        )
      : 0;
  const simDestBiomass = calculateBiomass(simDestCount, simDestAvgWeight);
  const simDestDensity = destTank ? calculateStockingDensity(simDestBiomass, destTank.volumeM3) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (sourceId === destId) {
      setError('Source and Destination tank cannot be the same.');
      return;
    }
    if (!sourceTank) {
      setError('Please select a valid source tank.');
      return;
    }
    if (count <= 0) {
      setError('Transfer count must be greater than 0.');
      return;
    }
    if (count > sourceTank.fishCount) {
      setError(`Cannot transfer ${count} fish. ${sourceTank.name} only contains ${sourceTank.fishCount} fish.`);
      return;
    }
    if (!operator.trim()) {
      setError('Operator name is required.');
      return;
    }

    try {
      onTransfer(sourceId, destId, count, operator, reason);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Transfer failed due to a system error.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Transfer Trout Between Tanks</h3>
              <p className="text-xs text-slate-400">Transactional transfer preserves total farm population</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Source Tank */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Source Tank</label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
              >
                {tanks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code} - {t.name} ({t.fishCount} fish)
                  </option>
                ))}
              </select>
              {sourceTank && (
                <div className="text-[10px] text-slate-400 mt-1">
                  Avg: {sourceTank.avgWeightG}g • Density: {sourceTank.densityKgM3} kg/m³
                </div>
              )}
            </div>

            {/* Destination Tank */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Destination Tank</label>
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
              >
                {tanks
                  .filter((t) => t.id !== sourceId)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.code} - {t.name} ({t.fishCount} fish)
                    </option>
                  ))}
              </select>
              {destTank && (
                <div className="text-[10px] text-slate-400 mt-1">
                  Avg: {destTank.avgWeightG}g • Density: {destTank.densityKgM3} kg/m³
                </div>
              )}
            </div>
          </div>

          {/* Fish Count & Quick Chips */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <label className="font-medium">Number of Fish to Transfer</label>
              <span className="text-[10px] text-cyan-400">
                Transfers ~{transferredBiomassKg} kg biomass
              </span>
            </div>
            <input
              type="number"
              min={1}
              max={sourceTank?.fishCount || 100000}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 font-bold focus:outline-none focus:border-cyan-500"
            />
            {sourceTank && (
              <div className="flex items-center gap-1.5 mt-2">
                {[100, 250, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCount(Math.min(preset, sourceTank.fishCount))}
                    className="px-2 py-0.5 text-[10px] rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    +{preset}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCount(Math.floor(sourceTank.fishCount * 0.5))}
                  className="px-2 py-0.5 text-[10px] rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => setCount(sourceTank.fishCount)}
                  className="px-2 py-0.5 text-[10px] rounded-md bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold"
                >
                  All ({sourceTank.fishCount})
                </button>
              </div>
            )}
          </div>

          {/* Transfer Preview Card */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Post-Transfer Impact Preview
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block font-medium">{sourceTank?.code} (Source)</span>
                <div className="text-slate-200 font-bold">{simSourceCount.toLocaleString()} fish</div>
                <div className="text-[10px] text-cyan-400">{simSourceDensity} kg/m³ density</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block font-medium">{destTank?.code} (Dest)</span>
                <div className="text-slate-200 font-bold">{simDestCount.toLocaleString()} fish</div>
                <div className="text-[10px] text-emerald-400">
                  {simDestDensity} kg/m³ (avg {simDestAvgWeight}g)
                </div>
              </div>
            </div>
          </div>

          {/* Operator and Reason */}
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Reason</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition-all"
            >
              Execute Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
