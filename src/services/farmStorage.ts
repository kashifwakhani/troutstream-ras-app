import {
  FarmInfo,
  Tank,
  WaterQualityThresholds,
  WaterQualityReading,
  FeedProduct,
  FeedRecord,
  FishStockMovement,
  FishSamplingRecord,
  MortalityRecord,
  EquipmentItem,
  MaintenanceRecord,
  ResourceUsageRecord,
  InventoryItem,
  ExpenseRecord,
  ActivityLogItem,
} from '../types';
import {
  initialFarmInfo,
  defaultThresholds,
  initialTanks,
  initialFeedProducts,
  initialWaterQualityReadings,
  initialFeedRecords,
  initialStockMovements,
  initialSamplingRecords,
  initialMortalityRecords,
  initialEquipment,
  initialMaintenanceRecords,
  initialResourceUsage,
  initialInventory,
  initialExpenses,
  initialActivityLogs,
} from '../db/initialData';
import {
  calculateBiomass,
  calculateStockingDensity,
  calculateUnionizedAmmonia,
  evaluateWaterQuality,
  calculateSGR,
  calculateADG,
  calculateConditionFactor,
  estimateDaysToHarvest,
} from '../utils/aquacultureCalculations';

const STORAGE_KEY = 'troutstream_ras_v1';

export interface FarmState {
  farmInfo: FarmInfo;
  thresholds: WaterQualityThresholds;
  tanks: Tank[];
  feedProducts: FeedProduct[];
  feedRecords: FeedRecord[];
  waterQualityReadings: WaterQualityReading[];
  stockMovements: FishStockMovement[];
  samplingRecords: FishSamplingRecord[];
  mortalityRecords: MortalityRecord[];
  equipment: EquipmentItem[];
  maintenanceRecords: MaintenanceRecord[];
  resourceUsage: ResourceUsageRecord[];
  inventory: InventoryItem[];
  expenses: ExpenseRecord[];
  activityLogs: ActivityLogItem[];
}

function getInitialState(): FarmState {
  return {
    farmInfo: initialFarmInfo,
    thresholds: defaultThresholds,
    tanks: initialTanks,
    feedProducts: initialFeedProducts,
    feedRecords: initialFeedRecords,
    waterQualityReadings: initialWaterQualityReadings,
    stockMovements: initialStockMovements,
    samplingRecords: initialSamplingRecords,
    mortalityRecords: initialMortalityRecords,
    equipment: initialEquipment,
    maintenanceRecords: initialMaintenanceRecords,
    resourceUsage: initialResourceUsage,
    inventory: initialInventory,
    expenses: initialExpenses,
    activityLogs: initialActivityLogs,
  };
}

class FarmStorageService {
  private state: FarmState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): FarmState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Verify key tables exist
        if (parsed.tanks && parsed.waterQualityReadings && parsed.feedRecords) {
          return parsed;
        }
      }
    } catch {
      // LocalStorage empty or parsing failed
    }
    const fresh = getInitialState();
    this.saveState(fresh);
    return fresh;
  }

  private saveState(state: FarmState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Quota exceeded or private browsing
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getState(): FarmState {
    return this.state;
  }

  public resetDemoData() {
    this.state = getInitialState();
    this.saveState(this.state);
  }

  // --- TANKS ---
  public getTanks(): Tank[] {
    return this.state.tanks;
  }

  public getTankById(id: string): Tank | undefined {
    return this.state.tanks.find((t) => t.id === id);
  }

  public addTank(tankData: Omit<Tank, 'id' | 'estimatedBiomassKg' | 'densityKgM3' | 'lastUpdated'>): Tank {
    const id = `tank-${Date.now()}`;
    const estimatedBiomassKg = calculateBiomass(tankData.fishCount, tankData.avgWeightG);
    const densityKgM3 = calculateStockingDensity(estimatedBiomassKg, tankData.volumeM3);

    const newTank: Tank = {
      ...tankData,
      id,
      estimatedBiomassKg,
      densityKgM3,
      lastUpdated: new Date().toISOString(),
    };

    this.state.tanks.push(newTank);
    this.logActivity('New Tank Added', `Created ${newTank.name} (${newTank.volumeM3}m³)`, 'stock', 'info');
    this.saveState(this.state);
    return newTank;
  }

  public updateTank(id: string, updates: Partial<Tank>): Tank {
    const index = this.state.tanks.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Tank with id ${id} not found`);

    const current = this.state.tanks[index];
    const fishCount = updates.fishCount !== undefined ? updates.fishCount : current.fishCount;
    const avgWeightG = updates.avgWeightG !== undefined ? updates.avgWeightG : current.avgWeightG;
    const volumeM3 = updates.volumeM3 !== undefined ? updates.volumeM3 : current.volumeM3;

    const estimatedBiomassKg = calculateBiomass(fishCount, avgWeightG);
    const densityKgM3 = calculateStockingDensity(estimatedBiomassKg, volumeM3);

    const updated: Tank = {
      ...current,
      ...updates,
      fishCount,
      avgWeightG,
      volumeM3,
      estimatedBiomassKg,
      densityKgM3,
      lastUpdated: new Date().toISOString(),
    };

    this.state.tanks[index] = updated;
    this.logActivity('Tank Updated', `Updated details for ${updated.name}`, 'stock', 'info');
    this.saveState(this.state);
    return updated;
  }

  /**
   * Transactional Fish Transfer between tanks
   * Guarantees total farm fish count preservation!
   */
  public transferFish(
    sourceTankId: string,
    destTankId: string,
    transferCount: number,
    operator: string,
    reason: string
  ): { sourceTank: Tank; destTank: Tank; movement: FishStockMovement } {
    if (sourceTankId === destTankId) {
      throw new Error('Source and destination tank must be different.');
    }
    if (transferCount <= 0) {
      throw new Error('Transfer count must be greater than zero.');
    }

    const sourceIndex = this.state.tanks.findIndex((t) => t.id === sourceTankId);
    const destIndex = this.state.tanks.findIndex((t) => t.id === destTankId);

    if (sourceIndex === -1 || destIndex === -1) {
      throw new Error('Source or destination tank not found.');
    }

    const source = this.state.tanks[sourceIndex];
    const dest = this.state.tanks[destIndex];

    if (source.fishCount < transferCount) {
      throw new Error(`Insufficient fish in ${source.name}. Available: ${source.fishCount}, requested: ${transferCount}`);
    }

    const farmFishCountBefore = this.state.tanks.reduce((acc, t) => acc + t.fishCount, 0);

    // Calculate biomass transferred
    const transferredBiomassKg = calculateBiomass(transferCount, source.avgWeightG);

    // Update Source Tank
    const newSourceCount = source.fishCount - transferCount;
    const newSourceBiomass = calculateBiomass(newSourceCount, source.avgWeightG);
    const newSourceDensity = calculateStockingDensity(newSourceBiomass, source.volumeM3);

    const updatedSource: Tank = {
      ...source,
      fishCount: newSourceCount,
      estimatedBiomassKg: newSourceBiomass,
      densityKgM3: newSourceDensity,
      lastUpdated: new Date().toISOString(),
    };

    // Update Destination Tank with weighted average weight
    const totalDestFish = dest.fishCount + transferCount;
    const combinedWeightG =
      totalDestFish > 0
        ? (dest.fishCount * dest.avgWeightG + transferCount * source.avgWeightG) / totalDestFish
        : source.avgWeightG;

    const roundedDestAvgWeight = Number(combinedWeightG.toFixed(1));
    const newDestBiomass = calculateBiomass(totalDestFish, roundedDestAvgWeight);
    const newDestDensity = calculateStockingDensity(newDestBiomass, dest.volumeM3);

    const updatedDest: Tank = {
      ...dest,
      fishCount: totalDestFish,
      avgWeightG: roundedDestAvgWeight,
      estimatedBiomassKg: newDestBiomass,
      densityKgM3: newDestDensity,
      lastUpdated: new Date().toISOString(),
    };

    // Create Stock Movement record
    const movement: FishStockMovement = {
      id: `mov-${Date.now()}`,
      farmId: this.state.farmInfo.id,
      timestamp: new Date().toISOString(),
      movementType: 'transfer',
      sourceTankId: source.id,
      destinationTankId: dest.id,
      fishCount: transferCount,
      avgWeightG: source.avgWeightG,
      biomassKg: transferredBiomassKg,
      reason: reason || `Transfer from ${source.name} to ${dest.name}`,
      operator,
    };

    // Commit Transaction in memory
    this.state.tanks[sourceIndex] = updatedSource;
    this.state.tanks[destIndex] = updatedDest;
    this.state.stockMovements.unshift(movement);

    // Verify Farm Invariant
    const farmFishCountAfter = this.state.tanks.reduce((acc, t) => acc + t.fishCount, 0);
    if (farmFishCountBefore !== farmFishCountAfter) {
      throw new Error('Integrity check failed: Total farm fish count was not preserved during transfer.');
    }

    this.logActivity(
      'Fish Transfer Completed',
      `Transferred ${transferCount.toLocaleString()} trout from ${source.name} to ${dest.name} (${transferredBiomassKg} kg)`,
      'stock',
      'info',
      operator
    );

    this.saveState(this.state);
    return { sourceTank: updatedSource, destTank: updatedDest, movement };
  }

  // --- WATER QUALITY ---
  public addWaterQualityReading(
    readingData: Omit<WaterQualityReading, 'id' | 'unionizedAmmoniaMgL' | 'status' | 'alerts' | 'farmId'>
  ): WaterQualityReading {
    const nh3 = calculateUnionizedAmmonia(readingData.tanMgL, readingData.ph, readingData.temperatureC);
    const evalResult = evaluateWaterQuality(
      {
        ...readingData,
        unionizedAmmoniaMgL: nh3,
      },
      this.state.thresholds
    );

    const newReading: WaterQualityReading = {
      ...readingData,
      id: `wq-${Date.now()}`,
      farmId: this.state.farmInfo.id,
      unionizedAmmoniaMgL: nh3,
      status: evalResult.status,
      alerts: evalResult.alerts,
    };

    this.state.waterQualityReadings.unshift(newReading);

    const severity = evalResult.status === 'critical' ? 'danger' : evalResult.status === 'warning' ? 'warning' : 'info';
    this.logActivity(
      'Water Test Logged',
      `DO: ${newReading.dissolvedOxygenMgL} mg/L, Temp: ${newReading.temperatureC}°C, pH: ${newReading.ph}${
        newReading.alerts.length > 0 ? ` (${newReading.alerts[0]})` : ''
      }`,
      'water',
      severity,
      newReading.operator
    );

    this.saveState(this.state);
    return newReading;
  }

  // --- FEED MANAGEMENT ---
  public addFeedRecord(
    feedData: Omit<FeedRecord, 'id' | 'farmId' | 'costEstimate'>
  ): FeedRecord {
    const product = this.state.feedProducts.find((p) => p.id === feedData.feedProductId);
    const unitPrice = product ? product.unitPricePerKg : 2.5;
    const costEstimate = Number((feedData.quantityKg * unitPrice).toFixed(2));

    const newRecord: FeedRecord = {
      ...feedData,
      id: `feed-${Date.now()}`,
      farmId: this.state.farmInfo.id,
      costEstimate,
    };

    // Deduct stock if product exists
    if (product) {
      product.stockRemainingKg = Math.max(0, Number((product.stockRemainingKg - feedData.quantityKg).toFixed(1)));
    }

    this.state.feedRecords.unshift(newRecord);
    this.logActivity(
      'Feeding Recorded',
      `Fed ${newRecord.quantityKg} kg ${newRecord.feedProductName} to ${
        this.getTankById(newRecord.tankId)?.name || 'Tank'
      }`,
      'feed',
      'info',
      newRecord.operator
    );

    this.saveState(this.state);
    return newRecord;
  }

  // --- FISH SAMPLING & GROWTH ---
  public addSamplingRecord(
    data: Omit<FishSamplingRecord, 'id' | 'farmId' | 'estimatedBiomassKg' | 'sgrPctDay' | 'adgGramsDay' | 'conditionFactorK' | 'daysToTargetHarvest'>
  ): FishSamplingRecord {
    const tank = this.getTankById(data.tankId);
    if (!tank) throw new Error('Tank not found for sampling.');

    // Fulton's condition factor if length provided
    const conditionFactorK = data.avgLengthCm ? calculateConditionFactor(data.avgWeightG, data.avgLengthCm) : undefined;

    // Look for previous sampling for SGR & ADG calculation
    const previousSampling = this.state.samplingRecords
      .filter((s) => s.tankId === data.tankId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    let sgrPctDay: number | undefined;
    let adgGramsDay: number | undefined;

    if (previousSampling) {
      const days = Math.max(1, Math.round((new Date(data.date).getTime() - new Date(previousSampling.date).getTime()) / (1000 * 3600 * 24)));
      sgrPctDay = calculateSGR(previousSampling.avgWeightG, data.avgWeightG, days);
      adgGramsDay = calculateADG(previousSampling.avgWeightG, data.avgWeightG, days);
    }

    const estimatedBiomassKg = calculateBiomass(tank.fishCount, data.avgWeightG);
    const daysToTargetHarvest = estimateDaysToHarvest(data.avgWeightG, tank.targetHarvestWeightG, adgGramsDay);

    const record: FishSamplingRecord = {
      ...data,
      id: `samp-${Date.now()}`,
      farmId: this.state.farmInfo.id,
      conditionFactorK,
      sgrPctDay,
      adgGramsDay,
      estimatedBiomassKg,
      daysToTargetHarvest,
    };

    // Update tank average weight and biomass directly
    this.updateTank(data.tankId, {
      avgWeightG: data.avgWeightG,
    });

    this.state.samplingRecords.unshift(record);
    this.logActivity(
      'Fish Sampled',
      `Sampled ${data.sampledCount} trout in ${tank.name}. New avg: ${data.avgWeightG}g (${daysToTargetHarvest}d to target)`,
      'stock',
      'info',
      data.operator
    );

    this.saveState(this.state);
    return record;
  }

  // --- MORTALITY & HEALTH ---
  public addMortalityRecord(
    mortData: Omit<MortalityRecord, 'id' | 'farmId'>
  ): MortalityRecord {
    const tank = this.getTankById(mortData.tankId);
    if (!tank) throw new Error('Tank not found.');

    const newFishCount = Math.max(0, tank.fishCount - mortData.deadCount);
    this.updateTank(mortData.tankId, { fishCount: newFishCount });

    // Stock movement log
    const movement: FishStockMovement = {
      id: `mov-${Date.now()}`,
      farmId: this.state.farmInfo.id,
      timestamp: mortData.timestamp,
      movementType: 'mortality',
      sourceTankId: tank.id,
      fishCount: mortData.deadCount,
      avgWeightG: tank.avgWeightG,
      biomassKg: calculateBiomass(mortData.deadCount, tank.avgWeightG),
      reason: `Mortality: ${mortData.suspectedCause}`,
      operator: mortData.operator,
    };
    this.state.stockMovements.unshift(movement);

    const record: MortalityRecord = {
      ...mortData,
      id: `mort-${Date.now()}`,
      farmId: this.state.farmInfo.id,
    };

    this.state.mortalityRecords.unshift(record);
    const severity = mortData.deadCount > 10 ? 'danger' : mortData.deadCount > 3 ? 'warning' : 'info';
    this.logActivity(
      'Mortality Logged',
      `${mortData.deadCount} dead in ${tank.name}. Cause: ${mortData.suspectedCause}`,
      'stock',
      severity,
      mortData.operator
    );

    this.saveState(this.state);
    return record;
  }

  // --- EQUIPMENT & MAINTENANCE ---
  public updateEquipmentStatus(id: string, status: EquipmentItem['status']): void {
    const eq = this.state.equipment.find((e) => e.id === id);
    if (eq) {
      eq.status = status;
      this.logActivity('Equipment Status Change', `${eq.name} set to ${status}`, 'equipment', status === 'warning' ? 'warning' : 'info');
      this.saveState(this.state);
    }
  }

  public addMaintenanceRecord(maintData: Omit<MaintenanceRecord, 'id' | 'farmId'>): MaintenanceRecord {
    const record: MaintenanceRecord = {
      ...maintData,
      id: `maint-${Date.now()}`,
      farmId: this.state.farmInfo.id,
    };
    this.state.maintenanceRecords.unshift(record);

    // Update equipment next service due
    const eq = this.state.equipment.find((e) => e.id === maintData.equipmentId);
    if (eq) {
      eq.lastServiceDate = maintData.timestamp.slice(0, 10);
      eq.nextServiceDue = maintData.nextDueDate;
    }

    this.logActivity('Maintenance Logged', `${maintData.taskType}: ${maintData.equipmentName}`, 'equipment', 'info', maintData.operator);
    this.saveState(this.state);
    return record;
  }

  // --- RESOURCE USAGE ---
  public addResourceUsage(usage: Omit<ResourceUsageRecord, 'id' | 'farmId'>): ResourceUsageRecord {
    const record: ResourceUsageRecord = {
      ...usage,
      id: `usage-${Date.now()}`,
      farmId: this.state.farmInfo.id,
    };
    this.state.resourceUsage.unshift(record);
    this.saveState(this.state);
    return record;
  }

  // --- INVENTORY & EXPENSES ---
  public updateInventoryStock(id: string, newStock: number): void {
    const item = this.state.inventory.find((i) => i.id === id);
    if (item) {
      item.currentStock = newStock;
      this.saveState(this.state);
    }
  }

  public addExpense(exp: Omit<ExpenseRecord, 'id' | 'farmId'>): ExpenseRecord {
    const record: ExpenseRecord = {
      ...exp,
      id: `exp-${Date.now()}`,
      farmId: this.state.farmInfo.id,
    };
    this.state.expenses.unshift(record);
    this.saveState(this.state);
    return record;
  }

  // --- THRESHOLDS ---
  public updateThresholds(newThresholds: Partial<WaterQualityThresholds>): void {
    this.state.thresholds = {
      ...this.state.thresholds,
      ...newThresholds,
    };
    // Re-evaluate existing water quality readings with new thresholds
    this.state.waterQualityReadings = this.state.waterQualityReadings.map((reading) => {
      const evalResult = evaluateWaterQuality(reading, this.state.thresholds);
      return {
        ...reading,
        status: evalResult.status,
        alerts: evalResult.alerts,
      };
    });
    this.saveState(this.state);
  }

  // --- ACTIVITY LOG ---
  public logActivity(
    action: string,
    details: string,
    category: ActivityLogItem['category'],
    severity: ActivityLogItem['severity'] = 'info',
    operator: string = 'System'
  ) {
    const item: ActivityLogItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      farmId: this.state.farmInfo.id,
      timestamp: new Date().toISOString(),
      action,
      details,
      operator,
      category,
      severity,
    };
    this.state.activityLogs.unshift(item);
    if (this.state.activityLogs.length > 50) {
      this.state.activityLogs.pop();
    }
  }
}

export const farmStorage = new FarmStorageService();
