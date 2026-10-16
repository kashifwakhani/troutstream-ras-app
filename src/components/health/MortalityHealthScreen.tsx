import React, { useState } from 'react';
import {
  Activity,
  Plus,
  AlertTriangle,
  CheckCircle,
  Calendar,
  ShieldAlert,
} from 'lucide-react';
import { MortalityRecord, Tank } from '../../types';
import { AddMortalityModal } from './AddMortalityModal';

interface MortalityHealthScreenProps {
  mortalityRecords: MortalityRecord[];
  tanks: Tank[];
  onAddMortality: (data: any) => void;
}

export const MortalityHealthScreen: React.FC<MortalityHealthScreenProps> = ({
  mortalityRecords,
  tanks,
  onAddMortality,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTank, setSelectedTank] = useState<string>('all');

  const totalFarmFish = tanks.reduce((sum, t) => sum + t.fishCount, 0);

  // Filtered records
  const filtered = mortalityRecords.filter((m) => {
    if (selectedTank === 'all') return true;
    return m.tankId === selectedTank;
  });

  // Today's mortalities
  const todayStr = '2026-10-16';
  const todayRecords = mortalityRecords.filter((m) => m.timestamp.startsWith(todayStr));
  const todayDeadCount = todayRecords.reduce((sum, m) => sum + m.deadCount, 0);
  const dailyMortalityRatePct = totalFarmFish > 0 ? Number(((todayDeadCount / totalFarmFish) * 100).toFixed(4)) : 0;

  // Cumulative mortalities
  const totalDeadAllTime = mortalityRecords.reduce((sum, m) => sum + m.deadCount, 0);

  // Status badge logic: Rainbow trout normal daily mortality is < 0.05%
  const isElevated = dailyMortalityRatePct > 0.1;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-1.5">
            <Activity className="w-5 h-5 text-rose-400" /> Mortality & Fish Health
          </h2>
          <p className="text-xs text-slate-400">
            Pathology tracking • Mortality rate analytics • Action logs
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-bold transition-colors shadow-md shadow-rose-500/20"
        >
          <Plus className="w-4 h-4" /> Log Mortality
        </button>
      </div>

      {/* Health KPIs */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Today Dead</span>
          <span className="text-lg font-black text-white">{todayDeadCount}</span>
          <span className="text-[10px] text-slate-400 block">trout</span>
        </div>

        <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Daily Mort Rate</span>
          <span className={`text-lg font-black ${isElevated ? 'text-rose-400' : 'text-emerald-400'}`}>
            {dailyMortalityRatePct}%
          </span>
          <span className="text-[10px] text-slate-400 block">Normal &lt;0.05%</span>
        </div>

        <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Total Cumulative</span>
          <span className="text-lg font-black text-slate-200">{totalDeadAllTime}</span>
          <span className="text-[10px] text-slate-400 block">historical</span>
        </div>
      </div>

      {/* Alert banner if elevated */}
      {isElevated ? (
        <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <span className="font-bold block">Elevated Mortality Warning</span>
            <span className="text-[11px] text-slate-300">
              Mortality spike detected (&gt;0.1%). Check DO probes, biofilter TAN, and inspect for fin abrasion.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2 text-slate-300">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Mortality within safe commercial benchmark (survival rate &gt;99.9%).</span>
        </div>
      )}

      {/* Historical Incidents List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300">Health & Mortality Incidents</h3>
          <select
            value={selectedTank}
            onChange={(e) => setSelectedTank(e.target.value)}
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
          {filtered.map((m) => {
            const tank = tanks.find((t) => t.id === m.tankId);

            return (
              <div
                key={m.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 p-3.5 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-rose-950 border border-rose-800 text-rose-300 font-bold">
                      {m.deadCount} Dead
                    </span>
                    <span className="text-xs font-bold text-white">{tank?.name || 'Tank'}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(m.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} •{' '}
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="text-xs text-slate-200">
                  <span className="text-slate-400">Cause:</span>{' '}
                  <span className="font-semibold text-rose-300">{m.suspectedCause}</span>
                </div>

                {m.symptoms && m.symptoms.length > 0 && (
                  <div className="text-[11px] text-slate-400">
                    <span className="text-slate-500">Symptoms:</span> {m.symptoms.join(', ')}
                  </div>
                )}

                {m.treatmentTaken && (
                  <div className="text-[11px] text-emerald-300/90 bg-emerald-950/30 p-2 rounded-lg border border-emerald-800/40">
                    <span className="font-medium text-emerald-400">Action:</span> {m.treatmentTaken}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Logged by {m.operator}</span>
                  {m.waterQualitySnapshot && (
                    <span>
                      Probe: {m.waterQualitySnapshot.tempC}°C • {m.waterQualitySnapshot.doMgL} mg/L DO
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Mortality Modal */}
      <AddMortalityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tanks={tanks}
        onAddMortality={onAddMortality}
      />
    </div>
  );
};
