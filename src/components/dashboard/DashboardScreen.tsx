import React from 'react';
import {
  Fish,
  Scale,
  Utensils,
  Thermometer,
  Wind,
  Droplet,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { FarmState } from '../../services/farmStorage';
import { TabType } from '../layout/MobileShell';

interface DashboardScreenProps {
  state: FarmState;
  onNavigate: (tab: TabType) => void;
  onSelectTank: (tankId: string) => void;
  onOpenQuickAction: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  state,
  onNavigate,
  onSelectTank,
  onOpenQuickAction,
}) => {
  // Aggregate KPI Calculations
  const totalFish = state.tanks.reduce((sum, t) => sum + t.fishCount, 0);
  const totalBiomassKg = state.tanks.reduce((sum, t) => sum + t.estimatedBiomassKg, 0);
  const totalVolumeM3 = state.tanks.reduce((sum, t) => sum + t.volumeM3, 0);
  const avgDensityKgM3 = totalVolumeM3 > 0 ? Number((totalBiomassKg / totalVolumeM3).toFixed(1)) : 0;

  // Daily Feed consumption (readings timestamped today or latest batch)
  const todayStr = '2026-10-16'; // Aligned with runtime date
  const feedToday = state.feedRecords.filter((r) => r.timestamp.startsWith(todayStr));
  const dailyFeedKg = feedToday.length > 0
    ? feedToday.reduce((sum, r) => sum + r.quantityKg, 0)
    : state.feedRecords.slice(0, 4).reduce((sum, r) => sum + r.quantityKg, 0);

  // Daily Mortality
  const mortalityTodayRecords = state.mortalityRecords.filter((m) => m.timestamp.startsWith(todayStr));
  const mortalityTodayCount = mortalityTodayRecords.reduce((sum, m) => sum + m.deadCount, 0);
  const dailyMortalityRatePct = totalFish > 0 ? Number(((mortalityTodayCount / totalFish) * 100).toFixed(4)) : 0;

  // Latest Water Quality Reading
  const latestWQ = state.waterQualityReadings[0];

  // Active Alerts
  const activeAlerts: { id: string; message: string; severity: 'critical' | 'warning' }[] = [];
  if (latestWQ && latestWQ.alerts && latestWQ.alerts.length > 0) {
    latestWQ.alerts.forEach((alert, idx) => {
      activeAlerts.push({
        id: `wq-alert-${idx}`,
        message: alert,
        severity: latestWQ.status === 'critical' ? 'critical' : 'warning',
      });
    });
  }

  // Inventory Low-stock alerts
  state.inventory.forEach((item) => {
    if (item.currentStock <= item.minThreshold) {
      activeAlerts.push({
        id: `inv-${item.id}`,
        message: `Low stock alert: ${item.name} (${item.currentStock} ${item.unit} left)`,
        severity: 'warning',
      });
    }
  });

  return (
    <div className="space-y-4">
      {/* Farm Overview Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-cyan-950 p-4 border border-cyan-800/40 shadow-xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-300">
              System Online • Recirculating
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Fish Count */}
          <div className="bg-slate-900/80 backdrop-blur-sm p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center gap-1 font-medium">
                <Fish className="w-3.5 h-3.5 text-cyan-400" /> Total Stock
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-1 rounded">Live</span>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              {totalFish.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
              <span>Across {state.tanks.length} active tanks</span>
            </div>
          </div>

          {/* Biomass */}
          <div className="bg-slate-900/80 backdrop-blur-sm p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center gap-1 font-medium">
                <Scale className="w-3.5 h-3.5 text-blue-400" /> Est. Biomass
              </span>
              <span className="text-[10px] text-cyan-300 font-mono">avg {avgDensityKgM3} kg/m³</span>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              {totalBiomassKg.toLocaleString()} <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Target: ~4,200 kg finish
            </div>
          </div>
        </div>

        {/* Quick Secondary Stats Bar */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex items-center justify-between bg-slate-950/40 px-2.5 py-1.5 rounded-lg">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-amber-400" /> Daily Feed:
            </span>
            <span className="font-bold text-slate-200">
              {dailyFeedKg.toFixed(1)} kg <span className="text-[10px] text-slate-400 font-normal">({((dailyFeedKg / totalBiomassKg) * 100).toFixed(2)}%)</span>
            </span>
          </div>

          <div className="flex items-center justify-between bg-slate-950/40 px-2.5 py-1.5 rounded-lg">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-400" /> Today Mort:
            </span>
            <span className="font-bold text-slate-200">
              {mortalityTodayCount} fish <span className="text-[10px] text-emerald-400 font-normal">({dailyMortalityRatePct}%)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Active Alerts Section (if any) */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          {activeAlerts.slice(0, 2).map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs transition-all ${
                alert.severity === 'critical'
                  ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                  : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
              }`}
            >
              <AlertTriangle
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  alert.severity === 'critical' ? 'text-rose-400 animate-bounce' : 'text-amber-400'
                }`}
              />
              <div className="flex-1">
                <span className="font-semibold block">{alert.message}</span>
                <span className="text-[10px] text-slate-400">Rainbow trout thresholds exceeded. Check aeration or water flow.</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Water Quality Snapshot Card */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/50">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-100">Live Water Parameters</h2>
              <p className="text-[10px] text-slate-400">
                Latest probe reading • {latestWQ ? new Date(latestWQ.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('water')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 group"
          >
            History <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {latestWQ ? (
          <div className="grid grid-cols-3 gap-2">
            {/* DO */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/70 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">Dissolved O2</span>
              <div className="text-lg font-black text-emerald-400">
                {latestWQ.dissolvedOxygenMgL.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">mg/L</span>
              </div>
              <span className="text-[9px] text-emerald-400/90 font-medium bg-emerald-950/80 px-1.5 py-0.5 rounded-full inline-block mt-0.5">
                Safe (≥6.5)
              </span>
            </div>

            {/* Temp */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/70 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">Water Temp</span>
              <div className="text-lg font-black text-cyan-400">
                {latestWQ.temperatureC.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">°C</span>
              </div>
              <span className="text-[9px] text-cyan-400/90 font-medium bg-cyan-950/80 px-1.5 py-0.5 rounded-full inline-block mt-0.5">
                Optimal (12-16)
              </span>
            </div>

            {/* pH */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/70 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">pH Level</span>
              <div className="text-lg font-black text-blue-400">
                {latestWQ.ph.toFixed(2)}
              </div>
              <span className="text-[9px] text-blue-400/90 font-medium bg-blue-950/80 px-1.5 py-0.5 rounded-full inline-block mt-0.5">
                Safe (6.8-7.8)
              </span>
            </div>

            {/* TAN */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/70 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">TAN</span>
              <div className="text-base font-bold text-slate-200">
                {latestWQ.tanMgL.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">mg/L</span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono">Max &lt;0.8</span>
            </div>

            {/* Toxic NH3 */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/70 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">Un-ionized NH3</span>
              <div className="text-base font-bold text-emerald-400">
                {latestWQ.unionizedAmmoniaMgL.toFixed(4)}
              </div>
              <span className="text-[9px] text-slate-400 font-mono">&lt;0.015 safe</span>
            </div>

            {/* Nitrite */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/70 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">Nitrite (NO2-)</span>
              <div className="text-base font-bold text-slate-200">
                {latestWQ.nitriteMgL.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">mg/L</span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono">&lt;0.15 safe</span>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-slate-500 text-xs">No water readings recorded yet.</div>
        )}
      </div>

      {/* Tanks Carousel / Quick Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" /> Active Tanks ({state.tanks.length})
          </h2>
          <button
            onClick={() => onNavigate('tanks')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
          >
            Manage Tanks <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {state.tanks.map((tank) => (
            <div
              key={tank.id}
              onClick={() => onSelectTank(tank.id)}
              className="bg-slate-900 hover:bg-slate-850 p-3 rounded-xl border border-slate-800 transition-all cursor-pointer group shadow-sm hover:border-cyan-800/60"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                  {tank.code}: {tank.name.split(' ')[0]}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800/60 text-cyan-300 font-mono">
                  {tank.volumeM3}m³
                </span>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Stock:</span>
                  <span className="font-semibold">{tank.fishCount.toLocaleString()} trout</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Avg Wt:</span>
                  <span className="font-semibold text-cyan-400">{tank.avgWeightG}g</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Density:</span>
                  <span className="font-mono text-emerald-400">{tank.densityKgM3} kg/m³</span>
                </div>
              </div>

              {/* Mini progress bar towards target weight */}
              <div className="mt-2 pt-2 border-t border-slate-800/60">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Growth</span>
                  <span className="font-medium text-slate-300">
                    {Math.min(100, Math.round((tank.avgWeightG / tank.targetHarvestWeightG) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(100, (tank.avgWeightG / tank.targetHarvestWeightG) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Farm Activity Stream */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" /> Recent Farm Log
          </h2>
          <span className="text-[10px] text-slate-400">Real-time log</span>
        </div>

        <div className="space-y-2.5">
          {state.activityLogs.slice(0, 4).map((act) => (
            <div key={act.id} className="flex items-start gap-2.5 text-xs pb-2 border-b border-slate-800/60 last:border-0 last:pb-0">
              <div
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  act.severity === 'danger'
                    ? 'bg-rose-400'
                    : act.severity === 'warning'
                    ? 'bg-amber-400'
                    : 'bg-cyan-400'
                }`}
              ></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{act.action}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{act.details}</p>
                <span className="text-[9px] text-slate-500">By {act.operator}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
