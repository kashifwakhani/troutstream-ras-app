/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MobileShell, TabType } from './components/layout/MobileShell';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { TankListScreen } from './components/tanks/TankListScreen';
import { WaterQualityScreen } from './components/water/WaterQualityScreen';
import { FeedManagementScreen } from './components/feed/FeedManagementScreen';
import { StockGrowthScreen } from './components/stock/StockGrowthScreen';
import { MortalityHealthScreen } from './components/health/MortalityHealthScreen';
import { EquipmentOperationsScreen } from './components/operations/EquipmentOperationsScreen';
import { ReportsScreen } from './components/reports/ReportsScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { QuickActionModal } from './components/common/QuickActionModal';
import { AddWaterReadingModal } from './components/water/AddWaterReadingModal';
import { AddFeedRecordModal } from './components/feed/AddFeedRecordModal';
import { TransferFishModal } from './components/tanks/TransferFishModal';
import { AddSamplingModal } from './components/stock/AddSamplingModal';
import { AddMortalityModal } from './components/health/AddMortalityModal';
import { farmStorage, FarmState } from './services/farmStorage';

export default function App() {
  const [farmState, setFarmState] = useState<FarmState>(farmStorage.getState());
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');

  // Quick Action & Modals state
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [waterModalOpen, setWaterModalOpen] = useState(false);
  const [feedModalOpen, setFeedModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [samplingModalOpen, setSamplingModalOpen] = useState(false);
  const [mortalityModalOpen, setMortalityModalOpen] = useState(false);

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = farmStorage.subscribe(() => {
      setFarmState({ ...farmStorage.getState() });
    });
    return unsubscribe;
  }, []);

  const handleQuickActionSelect = (
    action: 'water' | 'feed' | 'transfer' | 'sampling' | 'mortality' | 'maintenance'
  ) => {
    switch (action) {
      case 'water':
        setWaterModalOpen(true);
        break;
      case 'feed':
        setFeedModalOpen(true);
        break;
      case 'transfer':
        setTransferModalOpen(true);
        break;
      case 'sampling':
        setSamplingModalOpen(true);
        break;
      case 'mortality':
        setMortalityModalOpen(true);
        break;
      case 'maintenance':
        setCurrentTab('operations');
        break;
    }
  };

  return (
    <MobileShell
      currentTab={currentTab}
      onSelectTab={(tab) => setCurrentTab(tab)}
      state={farmState}
      onOpenQuickAction={() => setQuickActionOpen(true)}
      onResetData={() => farmStorage.resetDemoData()}
    >
      {/* Active Tab Screen */}
      {(() => {
        switch (currentTab) {
          case 'dashboard':
            return (
              <DashboardScreen
                key="tab-dashboard"
                state={farmState}
                onNavigate={(tab) => setCurrentTab(tab)}
                onSelectTank={(tankId) => setCurrentTab('tanks')}
                onOpenQuickAction={() => setQuickActionOpen(true)}
              />
            );
          case 'tanks':
            return (
              <TankListScreen
                key="tab-tanks"
                tanks={farmState.tanks}
                onUpdateTank={(id, updates) => farmStorage.updateTank(id, updates)}
                onAddTank={(data) => farmStorage.addTank(data)}
                onTransfer={(sourceId, destId, count, op, reason) =>
                  farmStorage.transferFish(sourceId, destId, count, op, reason)
                }
                onSelectTank={(tankId) => {}}
              />
            );
          case 'water':
            return (
              <WaterQualityScreen
                key="tab-water"
                readings={farmState.waterQualityReadings}
                tanks={farmState.tanks}
                thresholds={farmState.thresholds}
                onAddReading={(data) => farmStorage.addWaterQualityReading(data)}
              />
            );
          case 'feed':
            return (
              <FeedManagementScreen
                key="tab-feed"
                feedRecords={farmState.feedRecords}
                feedProducts={farmState.feedProducts}
                tanks={farmState.tanks}
                onAddFeed={(data) => farmStorage.addFeedRecord(data)}
              />
            );
          case 'health_growth':
            return (
              <div key="tab-health-growth" className="space-y-6">
                <StockGrowthScreen
                  samplingRecords={farmState.samplingRecords}
                  stockMovements={farmState.stockMovements}
                  tanks={farmState.tanks}
                  onAddSampling={(data) => farmStorage.addSamplingRecord(data)}
                  onOpenTransfer={() => setTransferModalOpen(true)}
                />
                <MortalityHealthScreen
                  mortalityRecords={farmState.mortalityRecords}
                  tanks={farmState.tanks}
                  onAddMortality={(data) => farmStorage.addMortalityRecord(data)}
                />
              </div>
            );
          case 'operations':
            return (
              <div key="tab-operations" className="space-y-6">
                <EquipmentOperationsScreen
                  equipment={farmState.equipment}
                  maintenanceRecords={farmState.maintenanceRecords}
                  resourceUsage={farmState.resourceUsage}
                  inventory={farmState.inventory}
                  onUpdateStatus={(id, status) => farmStorage.updateEquipmentStatus(id, status)}
                  onAddMaintenance={(data) => farmStorage.addMaintenanceRecord(data)}
                  onUpdateStock={(id, stock) => farmStorage.updateInventoryStock(id, stock)}
                />
                <MortalityHealthScreen
                  mortalityRecords={farmState.mortalityRecords}
                  tanks={farmState.tanks}
                  onAddMortality={(data) => farmStorage.addMortalityRecord(data)}
                />
                <StockGrowthScreen
                  samplingRecords={farmState.samplingRecords}
                  stockMovements={farmState.stockMovements}
                  tanks={farmState.tanks}
                  onAddSampling={(data) => farmStorage.addSamplingRecord(data)}
                  onOpenTransfer={() => setTransferModalOpen(true)}
                />
              </div>
            );
          case 'reports':
            return (
              <div key="tab-reports" className="space-y-6">
                <ReportsScreen state={farmState} />
                <SettingsScreen
                  thresholds={farmState.thresholds}
                  farmInfo={farmState.farmInfo}
                  onUpdateThresholds={(thr) => farmStorage.updateThresholds(thr)}
                  onResetData={() => farmStorage.resetDemoData()}
                />
              </div>
            );
          case 'settings':
            return (
              <SettingsScreen
                key="tab-settings"
                thresholds={farmState.thresholds}
                farmInfo={farmState.farmInfo}
                onUpdateThresholds={(thr) => farmStorage.updateThresholds(thr)}
                onResetData={() => farmStorage.resetDemoData()}
              />
            );
          default:
            return null;
        }
      })()}

      {/* Global Quick Action Bottom Sheet */}
      <QuickActionModal
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        onSelectAction={handleQuickActionSelect}
      />

      {/* Standalone Triggered Modals */}
      <AddWaterReadingModal
        isOpen={waterModalOpen}
        onClose={() => setWaterModalOpen(false)}
        tanks={farmState.tanks}
        thresholds={farmState.thresholds}
        onAddReading={(data) => farmStorage.addWaterQualityReading(data)}
      />

      <AddFeedRecordModal
        isOpen={feedModalOpen}
        onClose={() => setFeedModalOpen(false)}
        tanks={farmState.tanks}
        feedProducts={farmState.feedProducts}
        onAddFeed={(data) => farmStorage.addFeedRecord(data)}
      />

      <TransferFishModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        tanks={farmState.tanks}
        onTransfer={(sourceId, destId, count, op, reason) =>
          farmStorage.transferFish(sourceId, destId, count, op, reason)
        }
      />

      <AddSamplingModal
        isOpen={samplingModalOpen}
        onClose={() => setSamplingModalOpen(false)}
        tanks={farmState.tanks}
        onAddSampling={(data) => farmStorage.addSamplingRecord(data)}
      />

      <AddMortalityModal
        isOpen={mortalityModalOpen}
        onClose={() => setMortalityModalOpen(false)}
        tanks={farmState.tanks}
        onAddMortality={(data) => farmStorage.addMortalityRecord(data)}
      />
    </MobileShell>
  );
}
