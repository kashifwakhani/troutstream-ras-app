import React, { useState } from 'react';
import {
  Sliders,
  Save,
  RotateCcw,
  ShieldCheck,
  Building2,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { WaterQualityThresholds, FarmInfo } from '../../types';

interface SettingsScreenProps {
  thresholds: WaterQualityThresholds;
  farmInfo: FarmInfo;
  onUpdateThresholds: (thresholds: Partial<WaterQualityThresholds>) => void;
  onResetData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  thresholds,
  farmInfo,
  onUpdateThresholds,
  onResetData,
}) => {
  const [formData, setFormData] = useState<WaterQualityThresholds>(thresholds);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleChange = (field: keyof WaterQualityThresholds, val: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateThresholds(formData);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-1.5">
            <Sliders className="w-5 h-5 text-cyan-400" /> Thresholds & Farm Settings
          </h2>
          <p className="text-xs text-slate-400">
            Configure safety alerts and biologically optimal thresholds for Rainbow Trout
          </p>
        </div>
      </div>

      {savedMessage && (
        <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">Water quality thresholds saved and applied across all tanks!</span>
        </div>
      )}

      {/* Farm Information Card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-2">
        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-cyan-400" /> Facility Profile
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Facility Name</span>
            <span className="font-semibold text-white">{farmInfo.name}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Target Species</span>
            <span className="font-semibold text-cyan-300">{farmInfo.species}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">RAS System Type</span>
            <span className="font-medium text-slate-200">{farmInfo.rasType}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Lead Operator</span>
            <span className="font-semibold text-slate-200">{farmInfo.operatorName}</span>
          </div>
        </div>
      </div>

      {/* Thresholds Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Configurable Trout Thresholds
          </h3>
          <span className="text-[10px] text-slate-400">Triggers alert banners in UI</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              DO Critical Warning (&lt; mg/L)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.doMin}
              onChange={(e) => handleChange('doMin', Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono font-bold"
            />
            <span className="text-[9px] text-slate-500">Rainbow trout stress below 6.5 mg/L</span>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              DO Optimal Level (≥ mg/L)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.doOptimal}
              onChange={(e) => handleChange('doOptimal', Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono font-bold"
            />
            <span className="text-[9px] text-slate-500">Ideal range: 7.5 - 9.5 mg/L</span>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Water Temp Min (°C)
            </label>
            <input
              type="number"
              step="0.5"
              value={formData.tempMin}
              onChange={(e) => handleChange('tempMin', Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <span className="text-[9px] text-slate-500">Trout optimal min 12.0°C</span>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Water Temp Max (°C)
            </label>
            <input
              type="number"
              step="0.5"
              value={formData.tempMax}
              onChange={(e) => handleChange('tempMax', Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <span className="text-[9px] text-slate-500">Stress above 16.5°C; danger &gt;18.5°C</span>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              pH Min
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.phMin}
              onChange={(e) => handleChange('phMin', Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <span className="text-[9px] text-slate-500">Standard 6.8</span>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              pH Max
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.phMax}
              onChange={(e) => handleChange('phMax', Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <span className="text-[9px] text-slate-500">Standard 7.8</span>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Total Ammonia Nitrogen (TAN, mg/L)
            </label>
            <input
              type="number"
              step="0.05"
              value={formData.tanMax}
              onChange={(e) => handleChange('tanMax', Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <span className="text-[9px] text-slate-500">Biofilter threshold &lt;0.8 mg/L</span>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Un-ionized NH3 Toxic Max (mg/L)
            </label>
            <input
              type="number"
              step="0.001"
              value={formData.unionizedAmmoniaMax}
              onChange={(e) => handleChange('unionizedAmmoniaMax', Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <span className="text-[9px] text-slate-500">Max safe: 0.015 mg/L</span>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Nitrite Max (NO2-, mg/L)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.nitriteMax}
              onChange={(e) => handleChange('nitriteMax', Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <span className="text-[9px] text-slate-500">Toxicity limit &lt;0.15 mg/L</span>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Dissolved CO2 Max (mg/L)
            </label>
            <input
              type="number"
              step="1"
              value={formData.co2Max}
              onChange={(e) => handleChange('co2Max', Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <span className="text-[9px] text-slate-500">Degasser target &lt;12 mg/L</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-md shadow-cyan-500/20"
          >
            <Save className="w-4 h-4" /> Save Thresholds
          </button>
        </div>
      </form>

      {/* Danger Zone / Reset */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-xs text-white">Reset Demo Data</h4>
          <p className="text-[10px] text-slate-400">
            Restores 4 baseline tanks, realistic water quality logs, and feed records
          </p>
        </div>
        <button
          onClick={onResetData}
          className="px-3 py-1.5 rounded-xl border border-rose-800/80 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset All
        </button>
      </div>
    </div>
  );
};
