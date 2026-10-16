import React, { useState } from 'react';
import { Activity, X, AlertCircle } from 'lucide-react';
import { Tank } from '../../types';

interface AddMortalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  tanks: Tank[];
  defaultTankId?: string;
  onAddMortality: (data: any) => void;
}

export const AddMortalityModal: React.FC<AddMortalityModalProps> = ({
  isOpen,
  onClose,
  tanks,
  defaultTankId,
  onAddMortality,
}) => {
  if (!isOpen) return null;

  const [tankId, setTankId] = useState<string>(defaultTankId || tanks[0]?.id || '');
  const [timestamp, setTimestamp] = useState<string>(new Date().toISOString().slice(0, 16));
  const [deadCount, setDeadCount] = useState<number>(2);
  const [suspectedCause, setSuspectedCause] = useState<string>('Mechanical abrasion (post-grading)');
  const [symptoms, setSymptoms] = useState<string>('Slight fin abrasion, clean gills');
  const [behaviorNotes, setBehaviorNotes] = useState<string>('Rest of population schooling normally');
  const [treatmentTaken, setTreatmentTaken] = useState<string>('Carcasses incinerated/frozen; salt bath checked');
  const [operator, setOperator] = useState<string>('Markus L.');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const selectedTank = tanks.find((t) => t.id === tankId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tankId) {
      setError('Please select a tank.');
      return;
    }
    if (deadCount <= 0) {
      setError('Dead fish count must be at least 1.');
      return;
    }
    if (selectedTank && deadCount > selectedTank.fishCount) {
      setError(`Cannot record ${deadCount} dead fish. Tank only has ${selectedTank.fishCount} fish.`);
      return;
    }

    onAddMortality({
      tankId,
      timestamp: new Date(timestamp).toISOString(),
      deadCount: Number(deadCount),
      suspectedCause,
      symptoms: symptoms ? symptoms.split(',').map((s) => s.trim()) : [],
      behaviorNotes,
      treatmentTaken,
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
            <div className="p-2 rounded-xl bg-rose-950 border border-rose-800 text-rose-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Record Mortality / Health Incident</h3>
              <p className="text-xs text-slate-400">Deducts from tank count and logs permanent history</p>
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
                    {t.code} - {t.name} ({t.fishCount} trout)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Time Observed</label>
              <input
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Dead Count</label>
              <input
                type="number"
                min="1"
                value={deadCount}
                onChange={(e) => setDeadCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-rose-300 font-bold focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Suspected Cause</label>
              <select
                value={suspectedCause}
                onChange={(e) => setSuspectedCause(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Mechanical abrasion (post-grading)">Handling / Grading Stress</option>
                <option value="Natural weakling cull">Natural Weakling Cull</option>
                <option value="Jumping / Escape">Tank Jumping</option>
                <option value="Suspected bacterial/fin erosion">Fin Erosion / Bacterial</option>
                <option value="Hypoxia / Aeration dip">Hypoxia / Low DO Dip</option>
                <option value="Unknown / Biologist review">Other / Under Review</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Observed Symptoms</label>
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Skin abrasion, pale gills, lethargy..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Action / Quarantine Taken</label>
            <input
              type="text"
              value={treatmentTaken}
              onChange={(e) => setTreatmentTaken(e.target.value)}
              placeholder="e.g. Removed carcasses, increased pure oxygen supply..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Additional Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Water condition snapshot..."
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
              className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-slate-950 transition-colors shadow-md shadow-rose-500/20"
            >
              Log Mortality
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
