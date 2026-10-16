import React, { useState } from 'react';
import { Scale, X, AlertCircle } from 'lucide-react';
import { Tank } from '../../types';

interface AddSamplingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tanks: Tank[];
  defaultTankId?: string;
  onAddSampling: (data: any) => void;
}

export const AddSamplingModal: React.FC<AddSamplingModalProps> = ({
  isOpen,
  onClose,
  tanks,
  defaultTankId,
  onAddSampling,
}) => {
  if (!isOpen) return null;

  const [tankId, setTankId] = useState<string>(defaultTankId || tanks[0]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [sampledCount, setSampledCount] = useState<number>(50);
  const [avgWeightG, setAvgWeightG] = useState<number>(245.0);
  const [minWeightG, setMinWeightG] = useState<number>(210.0);
  const [maxWeightG, setMaxWeightG] = useState<number>(285.0);
  const [avgLengthCm, setAvgLengthCm] = useState<number>(26.8);
  const [operator, setOperator] = useState<string>('Markus L.');
  const [notes, setNotes] = useState<string>('Biometric weight check. Fish active, no signs of erosion.');
  const [error, setError] = useState<string | null>(null);

  const selectedTank = tanks.find((t) => t.id === tankId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tankId) {
      setError('Please select a tank.');
      return;
    }
    if (sampledCount <= 0 || avgWeightG <= 0) {
      setError('Sampled count and average weight must be greater than 0.');
      return;
    }

    onAddSampling({
      tankId,
      date,
      sampledCount: Number(sampledCount),
      avgWeightG: Number(avgWeightG),
      minWeightG: minWeightG ? Number(minWeightG) : undefined,
      maxWeightG: maxWeightG ? Number(maxWeightG) : undefined,
      avgLengthCm: avgLengthCm ? Number(avgLengthCm) : undefined,
      operator,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl my-8">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Record Fish Sampling</h3>
              <p className="text-xs text-slate-400">Updates average weight, SGR, and harvest estimate</p>
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
                    {t.code} - {t.name} (Current: {t.avgWeightG}g)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Sampling Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Number Sampled</label>
              <input
                type="number"
                min="5"
                value={sampledCount}
                onChange={(e) => setSampledCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Average Weight (g)</label>
              <input
                type="number"
                step="0.1"
                value={avgWeightG}
                onChange={(e) => setAvgWeightG(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Min Weight (g)</label>
              <input
                type="number"
                step="0.1"
                value={minWeightG}
                onChange={(e) => setMinWeightG(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Max Weight (g)</label>
              <input
                type="number"
                step="0.1"
                value={maxWeightG}
                onChange={(e) => setMaxWeightG(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Avg Length (cm)</label>
              <input
                type="number"
                step="0.1"
                value={avgLengthCm}
                onChange={(e) => setAvgLengthCm(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Condition, fin status..."
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
              className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-md shadow-cyan-500/20"
            >
              Save Sample & Update Biomass
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
