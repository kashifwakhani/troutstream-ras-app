import React, { useState } from 'react';
import {
  Droplets,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Thermometer,
  Wind,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { WaterQualityReading, Tank, WaterQualityThresholds } from '../../types';
import { AddWaterReadingModal } from './AddWaterReadingModal';

interface WaterQualityScreenProps {
  readings: WaterQualityReading[];
  tanks: Tank[];
  thresholds: WaterQualityThresholds;
  onAddReading: (reading: any) => void;
}

export const WaterQualityScreen: React.FC<WaterQualityScreenProps> = ({
  readings,
  tanks,
  thresholds,
  onAddReading,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<'do' | 'temp' | 'ph' | 'tan'>('do');

  const filteredReadings = readings.filter((r) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'loop') return !r.tankId;
    return r.tankId === selectedFilter;
  });

  const latestReading = readings[0];

  // SVG Chart points calculation for the selected metric
  // reverse to chronological order for chart display
  const chartData = [...readings].slice(0, 10).reverse();
  const getMetricVal = (r: WaterQualityReading): number => {
    switch (selectedMetric) {
      case 'do':
        return Number(r.dissolvedOxygenMgL);
      case 'temp':
        return Number(r.temperatureC);
      case 'ph':
        return Number(r.ph);
      case 'tan':
        return Number(r.tanMgL);
      default:
        return 0;
    }
  };

  const values = chartData.map(getMetricVal).filter((v) => typeof v === 'number' && !isNaN(v));
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 10;
  const range = maxVal > minVal ? maxVal - minVal : 1;

  // Chart coordinates (SVG viewbox 300 x 100)
  const points = chartData.map((r, i) => {
    const val = getMetricVal(r);
    const safeVal = typeof val === 'number' && !isNaN(val) ? val : minVal;
    const x = chartData.length > 1 ? Math.round((i / (chartData.length - 1)) * 280 + 10) : 150;
    const y = Math.round(90 - ((safeVal - minVal) / range) * 70);
    return `${x},${y}`;
  });
  const polylineStr = points.join(' ');

  const strokeColor =
    selectedMetric === 'do'
      ? '#10b981'
      : selectedMetric === 'temp'
      ? '#06b6d4'
      : selectedMetric === 'ph'
      ? '#3b82f6'
      : '#f59e0b';

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-1.5">
            <Droplets className="w-5 h-5 text-cyan-400" /> Water Quality & RAS Loop
          </h2>
          <p className="text-xs text-slate-400">
            {readings.length} recorded tests • Optimal Rainbow Trout parameters
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" /> Log Reading
        </button>
      </div>

      {/* Interactive Trend Chart Card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-200">Historical Trend (Last 10 Tests)</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
            <button
              onClick={() => setSelectedMetric('do')}
              className={`px-2 py-0.5 rounded ${
                selectedMetric === 'do' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'
              }`}
            >
              DO (mg/L)
            </button>
            <button
              onClick={() => setSelectedMetric('temp')}
              className={`px-2 py-0.5 rounded ${
                selectedMetric === 'temp' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
              }`}
            >
              Temp (°C)
            </button>
            <button
              onClick={() => setSelectedMetric('ph')}
              className={`px-2 py-0.5 rounded ${
                selectedMetric === 'ph' ? 'bg-blue-500/20 text-blue-300 font-bold' : 'text-slate-400'
              }`}
            >
              pH
            </button>
            <button
              onClick={() => setSelectedMetric('tan')}
              className={`px-2 py-0.5 rounded ${
                selectedMetric === 'tan' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'
              }`}
            >
              TAN
            </button>
          </div>
        </div>

        {/* SVG Mini Chart */}
        <div className="w-full h-28 relative my-2 bg-slate-950/40 rounded-xl p-2 border border-slate-800/50">
          {chartData.length > 1 ? (
            <svg
              key={`chart-${selectedMetric}`}
              viewBox="0 0 300 100"
              className="w-full h-full overflow-visible"
            >
              <g key="trend-layer">
                <polyline
                  key="line-stroke"
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={polylineStr}
                />
                <g key="points-layer">
                  {points.map((pt, idx) => {
                    const [cx, cy] = pt.split(',');
                    return (
                      <circle
                        key={`dot-${idx}`}
                        cx={cx}
                        cy={cy}
                        r="3.5"
                        fill="#0f172a"
                        stroke={strokeColor}
                        strokeWidth="2"
                      />
                    );
                  })}
                </g>
              </g>
            </svg>
          ) : (
            <div key="empty-trend" className="h-full flex items-center justify-center text-xs text-slate-500">
              Not enough points for trendline
            </div>
          )}
          <div className="flex justify-between text-[9px] text-slate-500 mt-1">
            <span>Older Tests</span>
            <span>Latest Reading ({values[values.length - 1] !== undefined ? values[values.length - 1] : '--'})</span>
          </div>
        </div>
      </div>

      {/* Threshold Reference Card for Trout Operators */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3.5 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-300">Rainbow Trout Target Range Reference</span>
          <span className="text-[10px] text-cyan-400 font-medium">Oncorhynchus mykiss</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
          <div className="bg-slate-950/60 p-2 rounded-xl">
            <span className="text-slate-200 font-semibold block">Dissolved Oxygen (DO)</span>
            <span>Target: &gt; 7.5 mg/L • Warning: &lt; {thresholds.doMin} mg/L</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-xl">
            <span className="text-slate-200 font-semibold block">Water Temperature</span>
            <span>Opt: {thresholds.tempMin} - {thresholds.tempMax}°C • Danger: &gt; 18.5°C</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-xl">
            <span className="text-slate-200 font-semibold block">pH Level</span>
            <span>Safe: {thresholds.phMin} - {thresholds.phMax}</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-xl">
            <span className="text-slate-200 font-semibold block">Un-ionized NH3</span>
            <span>Target: &lt; 0.015 mg/L (Max: {thresholds.unionizedAmmoniaMax})</span>
          </div>
        </div>
      </div>

      {/* Filter and Historical Readings List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300">Historical Readings</h3>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Locations</option>
            <option value="loop">Shared Loop Sump</option>
            {tanks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.code} - {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2.5">
          {filteredReadings.map((reading) => {
            const tank = tanks.find((t) => t.id === reading.tankId);
            const isAbnormal = reading.status !== 'normal';

            return (
              <div
                key={reading.id}
                className={`bg-slate-900 rounded-2xl border p-3.5 transition-all ${
                  reading.status === 'critical'
                    ? 'border-rose-800/80 bg-rose-950/20'
                    : reading.status === 'warning'
                    ? 'border-amber-800/80 bg-amber-950/20'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 font-bold">
                      {tank ? tank.code : 'LOOP-MAIN'}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {tank ? tank.name : 'Recirculation Sump Loop'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(reading.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Primary readings row */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs my-2 bg-slate-950/60 p-2 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-400 block">DO</span>
                    <span className="font-bold text-emerald-400">{reading.dissolvedOxygenMgL.toFixed(1)}</span>
                    <span className="text-[9px] text-slate-500 block">mg/L</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Temp</span>
                    <span className="font-bold text-cyan-400">{reading.temperatureC.toFixed(1)}°C</span>
                    <span className="text-[9px] text-slate-500 block">water</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">pH</span>
                    <span className="font-bold text-blue-400">{reading.ph.toFixed(2)}</span>
                    <span className="text-[9px] text-slate-500 block">probe</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">NH3</span>
                    <span
                      className={`font-mono font-bold ${
                        reading.unionizedAmmoniaMgL > thresholds.unionizedAmmoniaMax
                          ? 'text-rose-400'
                          : 'text-slate-200'
                      }`}
                    >
                      {reading.unionizedAmmoniaMgL.toFixed(4)}
                    </span>
                    <span className="text-[9px] text-slate-500 block">mg/L</span>
                  </div>
                </div>

                {/* Secondary parameters */}
                <div className="text-[10px] text-slate-400 flex items-center justify-between px-1">
                  <span>TAN: {reading.tanMgL} mg/L • NO2: {reading.nitriteMgL} mg/L • NO3: {reading.nitrateMgL} mg/L</span>
                  <span>Op: {reading.operator}</span>
                </div>

                {/* Alerts if triggered */}
                {reading.alerts && reading.alerts.length > 0 && (
                  <div className="mt-2 text-[10px] text-amber-300 bg-amber-950/50 p-1.5 rounded-lg border border-amber-800/40">
                    ⚠ {reading.alerts.join('; ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Reading Modal */}
      <AddWaterReadingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tanks={tanks}
        thresholds={thresholds}
        onAddReading={onAddReading}
      />
    </div>
  );
};
