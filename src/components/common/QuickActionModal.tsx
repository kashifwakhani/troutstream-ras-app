import React from 'react';
import {
  X,
  Droplets,
  Utensils,
  ArrowRightLeft,
  Scale,
  Activity,
  Wrench,
} from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (
    action: 'water' | 'feed' | 'transfer' | 'sampling' | 'mortality' | 'maintenance'
  ) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'water' as const,
      title: 'Water Quality Reading',
      subtitle: 'Log DO, Temp, pH, TAN probe & photometer test',
      icon: Droplets,
      color: 'text-cyan-400 bg-cyan-950 border-cyan-800',
    },
    {
      id: 'feed' as const,
      title: 'Feed Ration Session',
      subtitle: 'Log kg fed, brand formulation, and appetite response',
      icon: Utensils,
      color: 'text-amber-400 bg-amber-950 border-amber-800',
    },
    {
      id: 'transfer' as const,
      title: 'Transfer Fish Between Tanks',
      subtitle: 'Grade or move trout with density & count conservation',
      icon: ArrowRightLeft,
      color: 'text-blue-400 bg-blue-950 border-blue-800',
    },
    {
      id: 'sampling' as const,
      title: 'Fish Sampling & Biometrics',
      subtitle: 'Record sample weights, lengths, SGR, and condition K',
      icon: Scale,
      color: 'text-emerald-400 bg-emerald-950 border-emerald-800',
    },
    {
      id: 'mortality' as const,
      title: 'Log Mortality / Health Event',
      subtitle: 'Record dead count, suspected pathology & treatment',
      icon: Activity,
      color: 'text-rose-400 bg-rose-950 border-rose-800',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-[32px] sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-slate-800/60">
          <div>
            <h3 className="font-bold text-sm text-white">Quick Farm Action</h3>
            <p className="text-[11px] text-slate-400">One-tap entry for active farm operators</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  onSelectAction(act.id);
                  onClose();
                }}
                className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 transition-all text-left group"
              >
                <div className={`p-2.5 rounded-xl border ${act.color} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-[11px] text-slate-400">{act.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 bg-slate-950/50 border-t border-slate-800/60 text-center">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
