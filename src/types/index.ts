// TypeScript types for Rainbow Trout RAS Farm Manager

export type TankStatus = 'active' | 'quarantine' | 'cleaning' | 'fallow';
export type TankType = 'circular' | 'd_ended' | 'raceway' | 'nursery_tray';

export interface Tank {
  id: string;
  farmId: string;
  name: string;
  code: string;
  type: TankType;
  volumeM3: number;
  diameterM?: number;
  depthM?: number;
  fishCount: number;
  avgWeightG: number;
  estimatedBiomassKg: number;
  densityKgM3: number;
  stockingDate: string;
  targetHarvestWeightG: number;
  status: TankStatus;
  waterLoopId: string;
  notes: string;
  lastUpdated: string;
}

export type WaterQualityStatus = 'normal' | 'warning' | 'critical';

export interface WaterQualityReading {
  id: string;
  farmId: string;
  tankId?: string; // Optional if shared RAS loop
  waterLoopId: string;
  timestamp: string; // ISO string
  temperatureC: number;
  dissolvedOxygenMgL: number;
  ph: number;
  tanMgL: number; // Total Ammonia Nitrogen
  unionizedAmmoniaMgL: number; // NH3 (calculated or measured)
  nitriteMgL: number; // NO2-
  nitrateMgL: number; // NO3-
  alkalinityMgL: number; // as CaCO3
  co2MgL: number; // Dissolved carbon dioxide
  flowRateM3H: number; // Recirculation flow rate
  waterLevelPct: number; // % full
  operator: string;
  notes?: string;
  status: WaterQualityStatus;
  alerts: string[];
}

export interface WaterQualityThresholds {
  tempMin: number; // Optimal 12-16 C, min 8
  tempMax: number; // Optimal max 16 C, danger > 18.5 C
  doMin: number; // Warning < 7.0, Danger < 6.0 mg/L
  doOptimal: number; // 7.5 - 9.5 mg/L
  phMin: number; // Warning < 6.8
  phMax: number; // Warning > 7.8
  tanMax: number; // Warning > 1.0 mg/L
  unionizedAmmoniaMax: number; // Danger > 0.02 mg/L
  nitriteMax: number; // Danger > 0.2 mg/L
  nitrateMax: number; // Warning > 75 mg/L
  co2Max: number; // Warning > 15 mg/L
  alkalinityMin: number; // Warning < 80 mg/L
}

export interface FeedProduct {
  id: string;
  brand: string;
  productName: string;
  pelletSizeMm: number;
  proteinPct: number;
  fatPct: number;
  unitPricePerKg: number;
  stockRemainingKg: number;
}

export interface FeedRecord {
  id: string;
  farmId: string;
  tankId: string;
  timestamp: string;
  feedProductId: string;
  feedProductName: string;
  pelletSizeMm: number;
  quantityKg: number;
  sessionsCount: number;
  feedingMethod: 'hand' | 'automatic_feeder' | 'demand_feeder';
  batchNumber: string;
  operator: string;
  appetiteRating: 'poor' | 'moderate' | 'good' | 'aggressive';
  notes?: string;
  costEstimate: number;
}

export type MovementType = 'initial_stock' | 'arrival' | 'transfer' | 'mortality' | 'cull' | 'harvest';

export interface FishStockMovement {
  id: string;
  farmId: string;
  timestamp: string;
  movementType: MovementType;
  sourceTankId?: string;
  destinationTankId?: string;
  fishCount: number;
  avgWeightG: number;
  biomassKg: number;
  reason: string;
  operator: string;
}

export interface FishSamplingRecord {
  id: string;
  farmId: string;
  tankId: string;
  date: string;
  sampledCount: number;
  avgWeightG: number;
  minWeightG: number;
  maxWeightG: number;
  avgLengthCm?: number;
  conditionFactorK?: number; // Fulton's K = 100 * (W / L^3)
  sgrPctDay?: number; // Specific growth rate
  adgGramsDay?: number; // Average daily gain
  estimatedBiomassKg: number;
  daysToTargetHarvest: number;
  operator: string;
  notes?: string;
}

export interface MortalityRecord {
  id: string;
  farmId: string;
  tankId: string;
  timestamp: string;
  deadCount: number;
  suspectedCause: string;
  symptoms: string[];
  behaviorNotes?: string;
  waterQualitySnapshot?: {
    tempC: number;
    doMgL: number;
    ph: number;
    tanMgL: number;
  };
  treatmentTaken?: string;
  medicationUsed?: string;
  dosage?: string;
  operator: string;
  notes?: string;
}

export type EquipmentCategory =
  | 'pump'
  | 'drum_filter'
  | 'mbbr'
  | 'aeration'
  | 'oxygen_cone'
  | 'degasser'
  | 'uv'
  | 'chiller'
  | 'generator'
  | 'sensor';

export type EquipmentStatus = 'running' | 'warning' | 'maintenance' | 'offline';

export interface EquipmentItem {
  id: string;
  farmId: string;
  name: string;
  category: EquipmentCategory;
  location: string;
  status: EquipmentStatus;
  installationDate: string;
  powerKw?: number;
  lastServiceDate: string;
  nextServiceDue: string;
  runHours: number;
  notes: string;
}

export interface MaintenanceRecord {
  id: string;
  farmId: string;
  equipmentId: string;
  equipmentName: string;
  timestamp: string;
  taskType: 'routine_inspection' | 'cleaning' | 'backwash' | 'part_replacement' | 'emergency_repair';
  description: string;
  partsReplaced?: string;
  cost: number;
  operator: string;
  nextDueDate: string;
}

export interface ResourceUsageRecord {
  id: string;
  farmId: string;
  date: string;
  freshwaterAddedM3: number;
  waterDischargedM3: number;
  electricityKwh: number;
  liquidOxygenKg: number;
  dailyCost: number;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  farmId: string;
  name: string;
  category: 'feed' | 'oxygen' | 'chemicals' | 'spare_parts' | 'testing';
  currentStock: number;
  unit: string;
  minThreshold: number;
  unitCost: number;
  supplier: string;
  lastRestocked: string;
}

export interface ExpenseRecord {
  id: string;
  farmId: string;
  date: string;
  category: 'feed' | 'fingerlings' | 'electricity' | 'oxygen' | 'water' | 'labor' | 'maintenance' | 'supplies';
  description: string;
  amount: number;
  vendor: string;
  paymentMethod: string;
}

export interface ActivityLogItem {
  id: string;
  farmId: string;
  timestamp: string;
  action: string;
  details: string;
  operator: string;
  category: 'water' | 'feed' | 'stock' | 'equipment' | 'system';
  severity: 'info' | 'warning' | 'danger';
}

export interface FarmInfo {
  id: string;
  name: string;
  location: string;
  species: string; // "Rainbow Trout (Oncorhynchus mykiss)"
  rasType: string;
  totalWaterVolumeM3: number;
  operatorName: string;
}
