import React, { useState } from 'react';
import {
  Wrench,
  Zap,
  Droplet,
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Power,
  RotateCw,
} from 'lucide-react';
import { EquipmentItem, MaintenanceRecord, ResourceUsageRecord, InventoryItem } from '../../types';

interface EquipmentOperationsScreenProps {
  equipment: EquipmentItem[];
  maintenanceRecords: MaintenanceRecord[];
  resourceUsage: ResourceUsageRecord[];
  inventory: InventoryItem[];
  onUpdateStatus: (id: string, status: EquipmentItem['status']) => void;
  onAddMaintenance: (data: any) => void;
  onUpdateStock: (id: string, stock: number) => void;
}

export const EquipmentOperationsScreen: React.FC<EquipmentOperationsScreenProps> = ({
  equipment,
  maintenanceRecords,
  resourceUsage,
  inventory,
  onUpdateStatus,
  onAddMaintenance,
  onUpdateStock,
}) => {
  const [activeTab, setActiveTab] = useState<'equipment' | 'usage' | 'inventory'>('equipment');
  const [selectedEqForStatus, setSelectedEqForStatus] = useState<EquipmentItem | null>(null);

  // Totals for resource usage
  const latestUsage = resourceUsage[0];
  const totalPowerKwh = resourceUsage.reduce((sum, u) => sum + u.electricityKwh, 0);
  const totalWaterM3 = resourceUsage.reduce((sum, u) => sum + u.freshwaterAddedM3, 0);
  const totalOxygenKg = resourceUsage.reduce((sum, u) => sum + u.liquidOxygenKg, 0);

  const statusColors: Record<EquipmentItem['status'], { badge: string; dot: string }> = {
    running: { badge: 'bg-emerald-950/80 border-emerald-800 text-emerald-300', dot: 'bg-emerald-400' },
    warning: { badge: 'bg-amber-950/80 border-amber-800 text-amber-300', dot: 'bg-amber-400' },
    maintenance: { badge: 'bg-blue-950/80 border-blue-800 text-blue-300', dot: 'bg-blue-400' },
    offline: { badge: 'bg-rose-950/80 border-rose-800 text-rose-300', dot: 'bg-rose-400' },
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-1.5">
            <Wrench className="w-5 h-5 text-cyan-400" /> RAS Operations & Assets
          </h2>
          <p className="text-xs text-slate-400">
            Filtration, Biofilters, Power, Water & Energy Metrics
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('equipment')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-colors ${
            activeTab === 'equipment' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          RAS Equipment ({equipment.length})
        </button>
        <button
          onClick={() => setActiveTab('usage')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-colors ${
            activeTab === 'usage' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Water & Energy
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-colors ${
            activeTab === 'inventory' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Supplies Inventory ({inventory.length})
        </button>
      </div>

      {activeTab === 'equipment' ? (
        <div className="space-y-3">
          {equipment.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-3.5 shadow-sm space-y-2 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs text-white flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${statusColors[item.status].dot}`}></span>
                    {item.name}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Location: {item.location} {item.powerKw ? `• ${item.powerKw} kW` : ''}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <select
                    value={item.status}
                    onChange={(e) => onUpdateStatus(item.id, e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-200 focus:outline-none"
                  >
                    <option value="running">Running</option>
                    <option value="warning">Warning</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-950/60 p-2 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 block">Run Hours</span>
                  <span className="font-bold text-slate-200">{item.runHours} hrs</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Last Service</span>
                  <span className="text-slate-300 font-mono text-[11px]">{item.lastServiceDate || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Next Due</span>
                  <span className="text-cyan-400 font-mono text-[11px]">{item.nextServiceDue || 'N/A'}</span>
                </div>
              </div>

              {item.notes && (
                <p className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                  {item.notes}
                </p>
              )}
            </div>
          ))}

          {/* Maintenance History */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 mt-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" /> Recent Maintenance History
            </h3>
            <div className="space-y-2">
              {maintenanceRecords.map((m) => (
                <div key={m.id} className="text-xs p-2 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-200">
                    <span>{m.equipmentName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(m.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{m.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Task: {m.taskType.replace('_', ' ')} • Cost: ${m.cost}</span>
                    <span>Op: {m.operator}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'usage' ? (
        <div className="space-y-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">Freshwater Added</span>
              <span className="text-lg font-black text-cyan-400">{latestUsage?.freshwaterAddedM3 || 4.8}</span>
              <span className="text-[10px] text-slate-400 block">m³ today (4%)</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">Electricity</span>
              <span className="text-lg font-black text-amber-400">{latestUsage?.electricityKwh || 312}</span>
              <span className="text-[10px] text-slate-400 block">kWh/day</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-0.5">Liquid O2</span>
              <span className="text-lg font-black text-emerald-400">{latestUsage?.liquidOxygenKg || 28.5}</span>
              <span className="text-[10px] text-slate-400 block">kg consumed</span>
            </div>
          </div>

          {/* Daily Usage Records List */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-200">Daily Utility Consumption Logs</h3>
            <div className="space-y-2">
              {resourceUsage.map((u) => (
                <div key={u.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>{u.date}</span>
                    <span className="text-emerald-400 font-mono">${u.dailyCost} total cost</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-400">
                    <span>💧 Water: {u.freshwaterAddedM3} m³</span>
                    <span>⚡ Power: {u.electricityKwh} kWh</span>
                    <span>💨 O2: {u.liquidOxygenKg} kg</span>
                  </div>
                  {u.notes && <p className="text-[10px] text-slate-500">{u.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Supplies Inventory */
        <div className="space-y-3">
          {inventory.map((inv) => {
            const isLow = inv.currentStock <= inv.minThreshold;

            return (
              <div
                key={inv.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isLow ? 'bg-amber-950/20 border-amber-800/80' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h3 className="font-bold text-xs text-white">{inv.name}</h3>
                    <span className="text-[10px] text-slate-400">
                      Supplier: {inv.supplier} • Unit: ${inv.unitCost}
                    </span>
                  </div>
                  {isLow && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-300">
                      LOW STOCK ALERT
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Stock Balance:</span>
                    <span className="font-extrabold text-white text-sm">
                      {inv.currentStock} {inv.unit}
                    </span>
                    <span className="text-[10px] text-slate-500">(Min threshold: {inv.minThreshold})</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateStock(inv.id, inv.currentStock + 5)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px] font-bold"
                    >
                      +5 Restock
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
