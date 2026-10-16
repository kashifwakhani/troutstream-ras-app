import { z } from 'zod';

export const tankSchema = z.object({
  name: z.string().min(2, 'Tank name must be at least 2 characters'),
  code: z.string().min(1, 'Tank code required (e.g. T-01)'),
  type: z.enum(['circular', 'd_ended', 'raceway', 'nursery_tray']),
  volumeM3: z.coerce.number().positive('Water volume must be greater than 0 m³'),
  diameterM: z.coerce.number().positive('Diameter must be positive').optional(),
  depthM: z.coerce.number().positive('Depth must be positive').optional(),
  fishCount: z.coerce.number().int().min(0, 'Fish count cannot be negative'),
  avgWeightG: z.coerce.number().min(0.1, 'Average fish weight must be at least 0.1g'),
  stockingDate: z.string().min(4, 'Stocking date required'),
  targetHarvestWeightG: z.coerce.number().min(50, 'Target weight typically 350-1000g for trout'),
  status: z.enum(['active', 'quarantine', 'cleaning', 'fallow']),
  waterLoopId: z.string().default('loop-alpha'),
  notes: z.string().optional(),
});

export const waterQualitySchema = z.object({
  tankId: z.string().optional(),
  waterLoopId: z.string().default('loop-alpha'),
  timestamp: z.string(),
  temperatureC: z.coerce.number().min(4, 'Temp too low (<4°C)').max(28, 'Temp too high (>28°C)'),
  dissolvedOxygenMgL: z.coerce.number().min(0.5, 'DO must be positive').max(20, 'DO max 20 mg/L'),
  ph: z.coerce.number().min(4.0, 'pH must be >= 4').max(10.0, 'pH must be <= 10'),
  tanMgL: z.coerce.number().min(0, 'TAN cannot be negative').max(10, 'TAN max 10 mg/L'),
  nitriteMgL: z.coerce.number().min(0, 'Nitrite cannot be negative').max(10, 'Nitrite max 10 mg/L'),
  nitrateMgL: z.coerce.number().min(0, 'Nitrate cannot be negative').max(300, 'Nitrate max 300 mg/L'),
  alkalinityMgL: z.coerce.number().min(10, 'Alkalinity min 10 mg/L').max(500, 'Alkalinity max 500 mg/L'),
  co2MgL: z.coerce.number().min(0, 'CO2 cannot be negative').max(50, 'CO2 max 50 mg/L'),
  flowRateM3H: z.coerce.number().min(0).default(85),
  waterLevelPct: z.coerce.number().min(50).max(105).default(100),
  operator: z.string().min(2, 'Operator name required'),
  notes: z.string().optional(),
});

export const feedRecordSchema = z.object({
  tankId: z.string().min(1, 'Select a tank'),
  feedProductId: z.string().min(1, 'Select feed formulation'),
  quantityKg: z.coerce.number().positive('Quantity must be greater than 0 kg'),
  sessionsCount: z.coerce.number().int().min(1, 'At least 1 session').max(12, 'Max 12 sessions'),
  feedingMethod: z.enum(['hand', 'automatic_feeder', 'demand_feeder']),
  batchNumber: z.string().optional(),
  operator: z.string().min(2, 'Operator name required'),
  appetiteRating: z.enum(['poor', 'moderate', 'good', 'aggressive']),
  notes: z.string().optional(),
});

export const transferFishSchema = z
  .object({
    sourceTankId: z.string().min(1, 'Select source tank'),
    destTankId: z.string().min(1, 'Select destination tank'),
    fishCount: z.coerce.number().int().positive('Must transfer at least 1 fish'),
    operator: z.string().min(2, 'Operator name required'),
    reason: z.string().min(3, 'Reason for transfer required'),
  })
  .refine((data) => data.sourceTankId !== data.destTankId, {
    message: 'Destination tank must be different from source tank',
    path: ['destTankId'],
  });

export const samplingSchema = z.object({
  tankId: z.string().min(1, 'Select a tank'),
  date: z.string().min(4, 'Date required'),
  sampledCount: z.coerce.number().int().min(5, 'Minimum 5 fish for statistically useful sample'),
  avgWeightG: z.coerce.number().positive('Average weight must be positive'),
  minWeightG: z.coerce.number().positive().optional(),
  maxWeightG: z.coerce.number().positive().optional(),
  avgLengthCm: z.coerce.number().positive().optional(),
  operator: z.string().min(2, 'Operator name required'),
  notes: z.string().optional(),
});

export const mortalitySchema = z.object({
  tankId: z.string().min(1, 'Select a tank'),
  timestamp: z.string(),
  deadCount: z.coerce.number().int().positive('Dead fish count must be at least 1'),
  suspectedCause: z.string().min(3, 'Suspected cause required'),
  symptoms: z.string().optional(),
  behaviorNotes: z.string().optional(),
  treatmentTaken: z.string().optional(),
  operator: z.string().min(2, 'Operator name required'),
  notes: z.string().optional(),
});

export const thresholdsSchema = z.object({
  tempMin: z.coerce.number().min(5).max(18),
  tempMax: z.coerce.number().min(12).max(22),
  doMin: z.coerce.number().min(4).max(8),
  doOptimal: z.coerce.number().min(7).max(12),
  phMin: z.coerce.number().min(6.0).max(7.4),
  phMax: z.coerce.number().min(7.4).max(8.5),
  tanMax: z.coerce.number().min(0.2).max(2.0),
  unionizedAmmoniaMax: z.coerce.number().min(0.005).max(0.05),
  nitriteMax: z.coerce.number().min(0.05).max(0.5),
  nitrateMax: z.coerce.number().min(20).max(150),
  co2Max: z.coerce.number().min(5).max(30),
  alkalinityMin: z.coerce.number().min(40).max(150),
});
