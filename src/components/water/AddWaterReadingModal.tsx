import React, { useState, useEffect } from 'react';
import { Droplet, X, AlertTriangle, CheckCircle, Calculator } from 'lucide-react';
import { Tank, WaterQualityThresholds } from '../../types';
import { calculateUnionizedAmmonia, evaluateWaterQuality } from '../../utils/aquacultureCalculations';

interface AddWaterReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tanks: Tank[];
  thresholds: WaterQualityThresholds;
  onAddReading: (reading: any) => void;
}

export const AddWaterReadingModal: React.FC<AddWaterReadingModalProps> = ({
  isOpen,
  onClose,
  tanks,
  thresholds,
  onAddReading,
}) => {
  if (!isOpen) return null;

  const [tankId, setTankId] = useState<string>('tank-4');
  const [waterLoopId, setWaterLoopId] = useState<string>('loop-alpha');
  const [timestamp, setTimestamp] = useState<string>(new Date().toISOString().slice(0, 16));
  const [temperatureC, setTemperatureC] = useState<number>(14.2);
  const [dissolvedOxygenMgL, setDissolvedOxygenMgL] = useState<number>(8.9);
  const [ph, setPh] = useState<number>(7.35);
  const [tanMgL, setTanMgL] = useState<number>(0.42);
  const [nitriteMgL, setNitriteMgL] = useState<number>(0.07);
  const [nitrateMgL, setNitrateMgL] = useState<number>(38.0);
  const [alkalinityMgL, setAlkalinityMgL] = useState<number>(112.0);
  const [co2MgL, setCo2MgL] = useState<number>(8.4);
  const [flowRateM3H, setFlowRateM3H] = useState<number>(85.0);
  const [waterLevelPct, setWaterLevelPct] = useState<number>(100);
  const [operator, setOperator] = useState<string>('Markus L.');
  const [notes, setNotes] = useState<string>('Routine morning photometer and multi-probe test.');

  // Live calculation of toxic un-ionized ammonia NH3
  const [calculatedNH3, setCalculatedNH3] = useState<number>(0);
  const [evaluation, setEvaluation] = useState<{ status: 'normal' | 'warning' | 'critical'; alerts: string[] }>({
    status: 'normal',
    alerts: [],
  });

  useEffect(() => {
    const nh3 = calculateUnionizedAmmonia(tanMgL, ph, temperatureC);
    setCalculatedNH3(nh3);
    const evalRes = evaluateWaterQuality(
      {
        temperatureC,
        dissolvedOxygenMgL,
        ph,
        tanMgL,
        unionizedAmmoniaMgL: nh3,
        nitriteMgL,
        nitrateMgL,
        alkalinityMgL,
        co2MgL,
      },
      thresholds
    );
    setEvaluation(evalRes);
  }, [temperatureC, dissolvedOxygenMgL, ph, tanMgL, nitriteMgL, nitrateMgL, alkalinityMgL, co2MgL, thresholds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddReading({
      tankId: tankId === 'loop' ? undefined : tankId,
      waterLoopId,
      timestamp: new Date(timestamp).toISOString(),
      temperatureC: Number(temperatureC),
      dissolvedOxygenMgL: Number(dissolvedOxygenMgL),
      ph: Number(ph),
      tanMgL: Number(tanMgL),
      nitriteMgL: Number(nitriteMgL),
      nitrateMgL: Number(nitrateMgL),
      alkalinityMgL: Number(alkalinityMgL),
      co2MgL: Number(co2MgL),
      flowRateM3H: Number(flowRateM3H),
      waterLevelPct: Number(waterLevelPct),
      operator,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Record Water Quality Test</h3>
              <p className="text-xs text-slate-400">Log multi-parameter probe & reagent test data</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {/* Target Location & Timestamp */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Sampling Location</label>
              <select
                value={tankId}
                onChange={(e) => setTankId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
              >
                <option value="loop">Shared RAS Main Sump / Loop</option>
                {tanks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code} - {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Primary Critical Parameters: DO, Temp, pH */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-[11px] font-bold text-emerald-400 mb-1">DO (mg/L)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="25"
                value={dissolvedOxygenMgL}
                onChange={(e) => setDissolvedOxygenMgL(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-sm text-emerald-300 font-bold focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[9px] text-slate-500 block mt-0.5">Min: {thresholds.doMin} mg/L</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-cyan-400 mb-1">Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="30"
                value={temperatureC}
                onChange={(e) => setTemperatureC(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-sm text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[9px] text-slate-500 block mt-0.5">Opt: 12 - 16°C</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-blue-400 mb-1">pH</label>
              <input
                type="number"
                step="0.01"
                min="4"
                max="10"
                value={ph}
                onChange={(e) => setPh(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-sm text-blue-300 font-bold focus:outline-none focus:border-blue-500"
              />
              <span className="text-[9px] text-slate-500 block mt-0.5">Opt: 6.8 - 7.8</span>
            </div>
          </div>

          {/* Nitrogen Cycle Parameters: TAN, Nitrite, Nitrate */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">TAN (mg/L)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={tanMgL}
                onChange={(e) => setTanMgL(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Nitrite NO2- (mg/L)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={nitriteMgL}
                onChange={(e) => setNitriteMgL(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Nitrate NO3- (mg/L)</label>
              <input
                type="number"
                step="1"
                min="0"
                value={nitrateMgL}
                onChange={(e) => setNitrateMgL(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Emerson Formula Automatic Calculation Callout */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Calculated Un-ionized NH3:</span>
                <div className="text-slate-100 font-mono font-bold text-sm">
                  {calculatedNH3.toFixed(4)} mg/L
                </div>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  calculatedNH3 > thresholds.unionizedAmmoniaMax
                    ? 'bg-rose-950 border border-rose-800 text-rose-300'
                    : 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                }`}
              >
                {calculatedNH3 > thresholds.unionizedAmmoniaMax ? 'TOXIC FOR TROUT' : 'Safe (<0.015)'}
              </span>
            </div>
          </div>

          {/* Secondary Parameters: Alkalinity, CO2, Flow */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Alkalinity (CaCO3)</label>
              <input
                type="number"
                step="1"
                value={alkalinityMgL}
                onChange={(e) => setAlkalinityMgL(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">CO2 (mg/L)</label>
              <input
                type="number"
                step="0.5"
                value={co2MgL}
                onChange={(e) => setCo2MgL(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Flow Rate (m³/h)</label>
              <input
                type="number"
                step="1"
                value={flowRateM3H}
                onChange={(e) => setFlowRateM3H(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Live Alerts Feedback */}
          {evaluation.alerts.length > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs space-y-1">
              <span className="font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Threshold Warnings:
              </span>
              {evaluation.alerts.map((al, idx) => (
                <div key={idx} className="text-[11px] pl-4 text-amber-300/90">
                  • {al}
                </div>
              ))}
            </div>
          )}

          {/* Operator and Notes */}
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
                placeholder="Water clarity, aeration check..."
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
              Save Water Reading
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
