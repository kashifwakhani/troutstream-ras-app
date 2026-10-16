import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  FileSpreadsheet,
  Filter,
  CheckCircle,
  Layers,
  Droplet,
  Utensils,
  Scale,
  Activity,
} from 'lucide-react';
import { FarmState } from '../../services/farmStorage';
import { exportToCSV } from '../../utils/csvExport';

interface ReportsScreenProps {
  state: FarmState;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ state }) => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [selectedTank, setSelectedTank] = useState<string>('all');
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const totalFarmFish = state.tanks.reduce((sum, t) => sum + t.fishCount, 0);
  const totalBiomassKg = state.tanks.reduce((sum, t) => sum + t.estimatedBiomassKg, 0);

  // Trigger CSV exports
  const handleExportWaterQuality = () => {
    exportToCSV('TroutStream_Water_Quality_Log', state.waterQualityReadings, {
      timestamp: 'Timestamp',
      waterLoopId: 'Loop ID',
      temperatureC: 'Temp (°C)',
      dissolvedOxygenMgL: 'DO (mg/L)',
      ph: 'pH',
      tanMgL: 'TAN (mg/L)',
      unionizedAmmoniaMgL: 'Un-ionized NH3 (mg/L)',
      nitriteMgL: 'Nitrite (mg/L)',
      nitrateMgL: 'Nitrate (mg/L)',
      alkalinityMgL: 'Alkalinity (mg/L)',
      co2MgL: 'CO2 (mg/L)',
      operator: 'Operator',
      status: 'Status',
    });
    showSuccess('Water Quality CSV Exported');
  };

  const handleExportFeed = () => {
    exportToCSV('TroutStream_Feed_Records', state.feedRecords, {
      timestamp: 'Timestamp',
      tankId: 'Tank ID',
      feedProductName: 'Feed Formulation',
      pelletSizeMm: 'Pellet Size (mm)',
      quantityKg: 'Quantity (kg)',
      sessionsCount: 'Sessions',
      feedingMethod: 'Method',
      batchNumber: 'Lot #',
      appetiteRating: 'Appetite',
      costEstimate: 'Estimated Cost ($)',
      operator: 'Operator',
    });
    showSuccess('Feeding Records CSV Exported');
  };

  const handleExportStock = () => {
    exportToCSV('TroutStream_Tank_Biomass_Summary', state.tanks, {
      code: 'Tank Code',
      name: 'Tank Name',
      volumeM3: 'Volume (m³)',
      fishCount: 'Fish Count',
      avgWeightG: 'Avg Weight (g)',
      estimatedBiomassKg: 'Estimated Biomass (kg)',
      densityKgM3: 'Stocking Density (kg/m³)',
      targetHarvestWeightG: 'Target Weight (g)',
      status: 'Status',
      notes: 'Notes',
    });
    showSuccess('Tank Biomass CSV Exported');
  };

  const handleExportSampling = () => {
    exportToCSV('TroutStream_Fish_Sampling_Growth', state.samplingRecords, {
      date: 'Date',
      tankId: 'Tank ID',
      sampledCount: 'Sampled Count',
      avgWeightG: 'Avg Weight (g)',
      minWeightG: 'Min Weight (g)',
      maxWeightG: 'Max Weight (g)',
      avgLengthCm: 'Avg Length (cm)',
      conditionFactorK: 'Fulton Condition K',
      sgrPctDay: 'SGR (%/day)',
      adgGramsDay: 'ADG (g/day)',
      daysToTargetHarvest: 'Days to Target',
      operator: 'Operator',
    });
    showSuccess('Fish Sampling & Growth CSV Exported');
  };

  const handleExportMortality = () => {
    exportToCSV('TroutStream_Mortality_Log', state.mortalityRecords, {
      timestamp: 'Timestamp',
      tankId: 'Tank ID',
      deadCount: 'Dead Count',
      suspectedCause: 'Cause',
      treatmentTaken: 'Action Taken',
      operator: 'Operator',
      notes: 'Notes',
    });
    showSuccess('Mortality Log CSV Exported');
  };

  const showSuccess = (msg: string) => {
    setExportSuccess(msg);
    setTimeout(() => setExportSuccess(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-1.5">
            <BarChart3 className="w-5 h-5 text-cyan-400" /> Farm Reports & Data Export
          </h2>
          <p className="text-xs text-slate-400">
            Generate printable summaries & export raw data sets to CSV
          </p>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{exportSuccess}</span>
        </div>
      )}

      {/* Daily Farm Summary Card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" /> Executive Facility Summary
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Total Fish Population</span>
            <span className="text-base font-bold text-white">{totalFarmFish.toLocaleString()} trout</span>
            <span className="text-[9px] text-slate-500 block">4 active production tanks</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Total Farm Biomass</span>
            <span className="text-base font-bold text-cyan-400">{totalBiomassKg.toLocaleString()} kg</span>
            <span className="text-[9px] text-slate-500 block">Est. Market Value: ${(totalBiomassKg * 9.5).toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-slate-300 pt-1">
          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Average Water Temp</span>
            <span className="font-mono text-cyan-300">14.1°C (Optimal)</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Average Dissolved Oxygen</span>
            <span className="font-mono text-emerald-300">9.1 mg/L (Safe)</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Total Feed Consumed Today</span>
            <span className="font-mono text-amber-300">47.9 kg</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400">Daily Mortality Rate</span>
            <span className="font-mono text-slate-300">0.007% (Normal)</span>
          </div>
        </div>
      </div>

      {/* CSV Data Export Center */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Download className="w-4 h-4 text-cyan-400" /> Download Module CSV Spreadsheets
        </h3>

        <div className="space-y-2">
          {/* Water Quality CSV */}
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                <Droplet className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Water Quality & RAS Loop Readings</h4>
                <p className="text-[10px] text-slate-400">
                  {state.waterQualityReadings.length} historical records (Temp, DO, pH, NH3, Nitrite)
                </p>
              </div>
            </div>
            <button
              onClick={handleExportWaterQuality}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>

          {/* Feed Records CSV */}
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/60">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Daily Feed & Nutrition History</h4>
                <p className="text-[10px] text-slate-400">
                  {state.feedRecords.length} records (kg rations, sessions, appetite, costs)
                </p>
              </div>
            </div>
            <button
              onClick={handleExportFeed}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>

          {/* Tanks & Biomass CSV */}
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-950 text-blue-400 border border-blue-800/60">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Tanks & Stocking Density Roster</h4>
                <p className="text-[10px] text-slate-400">
                  {state.tanks.length} tanks with count, volume, avg weights & biomass
                </p>
              </div>
            </div>
            <button
              onClick={handleExportStock}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>

          {/* Sampling & Growth CSV */}
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Fish Sampling & Growth Rates</h4>
                <p className="text-[10px] text-slate-400">
                  {state.samplingRecords.length} sample audits (SGR, ADG, Fulton's K, days to market)
                </p>
              </div>
            </div>
            <button
              onClick={handleExportSampling}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>

          {/* Mortality Log CSV */}
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-950 text-rose-400 border border-rose-800/60">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Mortality & Health Pathology Log</h4>
                <p className="text-[10px] text-slate-400">
                  {state.mortalityRecords.length} incidents recorded with causes and actions
                </p>
              </div>
            </div>
            <button
              onClick={handleExportMortality}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
