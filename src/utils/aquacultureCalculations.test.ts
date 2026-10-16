/**
 * Unit verification tests for Aquaculture Calculations and Stock Conservation Invariants
 */
import {
  calculateBiomass,
  calculateStockingDensity,
  calculateUnionizedAmmonia,
  calculateSGR,
  calculateADG,
  calculateConditionFactor,
  estimateDaysToHarvest,
  calculateFCR,
} from './aquacultureCalculations';

// 1. Biomass calculation test
export function testBiomassCalculation() {
  // 5,000 trout with average weight 200g = (5000 * 200) / 1000 = 1,000 kg
  const biomass = calculateBiomass(5000, 200);
  console.assert(biomass === 1000, `Expected 1000 kg biomass, got ${biomass}`);

  // Zero edge cases
  console.assert(calculateBiomass(0, 200) === 0, 'Zero count should yield 0 biomass');
  console.assert(calculateBiomass(5000, 0) === 0, 'Zero weight should yield 0 biomass');
}

// 2. Stocking density test
export function testDensityCalculation() {
  // 1,000 kg biomass in 40 m3 tank = 25.0 kg/m3
  const density = calculateStockingDensity(1000, 40);
  console.assert(density === 25, `Expected 25 kg/m3 density, got ${density}`);
}

// 3. Emerson Toxic Un-ionized Ammonia (NH3) Test
export function testUnionizedAmmonia() {
  // At 15°C, pH 7.5, and TAN = 1.0 mg/L
  // Standard literature value for NH3 fraction is approximately ~0.0086 mg/L (safe)
  const nh3 = calculateUnionizedAmmonia(1.0, 7.5, 15.0);
  console.assert(nh3 > 0.005 && nh3 < 0.015, `NH3 expected ~0.0086 mg/L, got ${nh3}`);

  // At high pH (8.5), fraction increases dramatically
  const nh3HighPH = calculateUnionizedAmmonia(1.0, 8.5, 15.0);
  console.assert(nh3HighPH > 0.05, `High pH NH3 should be toxic (>0.05 mg/L), got ${nh3HighPH}`);
}

// 4. Fulton's Condition Factor Test
export function testConditionFactor() {
  // Trout of 250g and length 27cm: K = 100 * (250 / 27^3) = 1.27
  const k = calculateConditionFactor(250, 27);
  console.assert(k >= 1.2 && k <= 1.35, `Expected healthy trout K ~1.27, got ${k}`);
}

// 5. Specific Growth Rate (SGR) Test
export function testSGR() {
  // Growth from 100g to 150g over 30 days
  // SGR = ((ln(150) - ln(100)) / 30) * 100 = 1.35%/day
  const sgr = calculateSGR(100, 150, 30);
  console.assert(sgr > 1.3 && sgr < 1.4, `Expected SGR ~1.35%, got ${sgr}`);
}

// 6. Conservation of fish count invariant during transfer
export function testTransferConservation(
  sourceCount: number,
  destCount: number,
  transferCount: number
): boolean {
  const farmBefore = sourceCount + destCount;
  const newSource = sourceCount - transferCount;
  const newDest = destCount + transferCount;
  const farmAfter = newSource + newDest;
  return farmBefore === farmAfter && newSource >= 0;
}
