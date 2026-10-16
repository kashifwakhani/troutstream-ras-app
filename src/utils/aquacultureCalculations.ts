import { WaterQualityReading, WaterQualityThresholds, WaterQualityStatus } from '../types';

/**
 * Calculate total biomass in kilograms
 * Biomass (kg) = Fish count × Average weight (g) / 1000
 */
export function calculateBiomass(fishCount: number, avgWeightG: number): number {
  if (fishCount <= 0 || avgWeightG <= 0) return 0;
  return Number(((fishCount * avgWeightG) / 1000).toFixed(2));
}

/**
 * Calculate stocking density in kg/m3
 */
export function calculateStockingDensity(biomassKg: number, volumeM3: number): number {
  if (volumeM3 <= 0 || biomassKg <= 0) return 0;
  return Number((biomassKg / volumeM3).toFixed(2));
}

/**
 * Calculate toxic un-ionized ammonia (NH3) from Total Ammonia Nitrogen (TAN, mg/L),
 * pH, and Water Temperature (°C) using Emerson's equation.
 * Rainbow Trout are sensitive to NH3: > 0.02 mg/L causes chronic stress & gill damage.
 */
export function calculateUnionizedAmmonia(tanMgL: number, ph: number, tempC: number): number {
  if (tanMgL <= 0) return 0;
  const tempKelvin = tempC + 273.15;
  // pKa calculation for aqueous ammonia
  const pKa = 0.09018 + (2729.92 / tempKelvin);
  const exponent = pKa - ph;
  const fraction = 1 / (Math.pow(10, exponent) + 1);
  const nh3 = tanMgL * fraction;
  return Number(nh3.toFixed(4));
}

/**
 * Calculate Specific Growth Rate (SGR) in % per day
 * SGR = ((ln(W_final) - ln(W_initial)) / days) * 100
 */
export function calculateSGR(wInitialG: number, wFinalG: number, days: number): number {
  if (days <= 0 || wInitialG <= 0 || wFinalG <= 0) return 0;
  const sgr = ((Math.log(wFinalG) - Math.log(wInitialG)) / days) * 100;
  return Number(sgr.toFixed(2));
}

/**
 * Calculate Average Daily Gain (ADG) in grams/day
 */
export function calculateADG(wInitialG: number, wFinalG: number, days: number): number {
  if (days <= 0) return 0;
  const adg = (wFinalG - wInitialG) / days;
  return Number(adg.toFixed(2));
}

/**
 * Calculate Fulton's Condition Factor (K)
 * K = 100 * (Weight in g / (Length in cm)^3)
 * Rainbow Trout standard: 1.05 - 1.35 indicates excellent nutritional status.
 */
export function calculateConditionFactor(weightG: number, lengthCm: number): number {
  if (weightG <= 0 || lengthCm <= 0) return 0;
  const k = (100 * weightG) / Math.pow(lengthCm, 3);
  return Number(k.toFixed(2));
}

/**
 * Estimate days remaining to reach target harvest weight
 * Uses ADG or standard thermal growth coefficient for Rainbow Trout (~1.2 - 2.5 g/day in grow-out)
 */
export function estimateDaysToHarvest(currentWeightG: number, targetWeightG: number, adgGramsDay?: number): number {
  if (currentWeightG >= targetWeightG) return 0;
  const growthRate = (adgGramsDay && adgGramsDay > 0.1) ? adgGramsDay : 1.8; // default 1.8g/day for trout grow-out
  const remainingWeight = targetWeightG - currentWeightG;
  return Math.max(0, Math.round(remainingWeight / growthRate));
}

/**
 * Calculate Feed Conversion Ratio (FCR)
 * FCR = Total feed consumed (kg) / Biomass gain (kg)
 */
export function calculateFCR(feedConsumedKg: number, biomassGainKg: number): number {
  if (biomassGainKg <= 0 || feedConsumedKg <= 0) return 0;
  return Number((feedConsumedKg / biomassGainKg).toFixed(2));
}

/**
 * Recommended daily feeding rate (% of body weight) based on water temperature & fish size
 * In trout, optimum temperature is 13-15°C. Feeding drops when temp < 8°C or > 18°C.
 */
export function getRecommendedFeedingRatePct(avgWeightG: number, tempC: number): number {
  let baseRate = 1.5;
  if (avgWeightG < 10) baseRate = 3.5;
  else if (avgWeightG < 50) baseRate = 2.5;
  else if (avgWeightG < 150) baseRate = 1.8;
  else if (avgWeightG < 350) baseRate = 1.3;
  else baseRate = 1.0;

  // Temperature modifier (optimal 13-15 C)
  if (tempC < 8 || tempC > 19) return Number((baseRate * 0.4).toFixed(2));
  if (tempC < 11 || tempC > 17) return Number((baseRate * 0.75).toFixed(2));
  return Number(baseRate.toFixed(2));
}

/**
 * Evaluate water quality against trout thresholds
 */
export function evaluateWaterQuality(
  reading: Partial<WaterQualityReading>,
  thresholds: WaterQualityThresholds
): { status: WaterQualityStatus; alerts: string[] } {
  const alerts: string[] = [];
  let isCritical = false;
  let isWarning = false;

  // Dissolved Oxygen (DO is life-critical for Rainbow Trout)
  if (reading.dissolvedOxygenMgL !== undefined) {
    if (reading.dissolvedOxygenMgL < thresholds.doMin) {
      alerts.push(`Critical low DO: ${reading.dissolvedOxygenMgL} mg/L (min ${thresholds.doMin})`);
      isCritical = true;
    } else if (reading.dissolvedOxygenMgL < thresholds.doOptimal) {
      alerts.push(`Sub-optimal DO: ${reading.dissolvedOxygenMgL} mg/L (optimal ≥ ${thresholds.doOptimal})`);
      isWarning = true;
    }
  }

  // Temperature
  if (reading.temperatureC !== undefined) {
    if (reading.temperatureC > 18.5) {
      alerts.push(`Dangerously high water temp: ${reading.temperatureC}°C (max safe 18.5°C)`);
      isCritical = true;
    } else if (reading.temperatureC > thresholds.tempMax) {
      alerts.push(`Elevated water temp: ${reading.temperatureC}°C (target ≤ ${thresholds.tempMax}°C)`);
      isWarning = true;
    } else if (reading.temperatureC < thresholds.tempMin) {
      alerts.push(`Chilled water temp: ${reading.temperatureC}°C (target ≥ ${thresholds.tempMin}°C)`);
      isWarning = true;
    }
  }

  // pH
  if (reading.ph !== undefined) {
    if (reading.ph < 6.2 || reading.ph > 8.5) {
      alerts.push(`Critical pH imbalance: ${reading.ph} (safe range 6.8 - 7.8)`);
      isCritical = true;
    } else if (reading.ph < thresholds.phMin || reading.ph > thresholds.phMax) {
      alerts.push(`pH outside ideal range: ${reading.ph} (ideal ${thresholds.phMin} - ${thresholds.phMax})`);
      isWarning = true;
    }
  }

  // Un-ionized Ammonia
  if (reading.unionizedAmmoniaMgL !== undefined && reading.unionizedAmmoniaMgL > thresholds.unionizedAmmoniaMax) {
    alerts.push(`Toxic NH3 level: ${reading.unionizedAmmoniaMgL} mg/L (limit ${thresholds.unionizedAmmoniaMax})`);
    isCritical = true;
  } else if (reading.tanMgL !== undefined && reading.tanMgL > thresholds.tanMax) {
    alerts.push(`High Total Ammonia Nitrogen (TAN): ${reading.tanMgL} mg/L`);
    isWarning = true;
  }

  // Nitrite
  if (reading.nitriteMgL !== undefined) {
    if (reading.nitriteMgL > thresholds.nitriteMax * 2) {
      alerts.push(`Lethal Nitrite (NO2-): ${reading.nitriteMgL} mg/L (causes brown blood disease)`);
      isCritical = true;
    } else if (reading.nitriteMgL > thresholds.nitriteMax) {
      alerts.push(`High Nitrite: ${reading.nitriteMgL} mg/L (limit ${thresholds.nitriteMax} mg/L)`);
      isWarning = true;
    }
  }

  // Carbon Dioxide
  if (reading.co2MgL !== undefined && reading.co2MgL > thresholds.co2Max) {
    alerts.push(`Elevated CO2: ${reading.co2MgL} mg/L (causes nephrocalcinosis)`);
    isWarning = true;
  }

  // Alkalinity
  if (reading.alkalinityMgL !== undefined && reading.alkalinityMgL < thresholds.alkalinityMin) {
    alerts.push(`Low Alkalinity: ${reading.alkalinityMgL} mg/L (biofilter nitrification at risk)`);
    isWarning = true;
  }

  const status: WaterQualityStatus = isCritical ? 'critical' : isWarning ? 'warning' : 'normal';
  return { status, alerts };
}
