import { CalculatorResult } from './types';

export interface StairInput {
  totalRiseInches: number;
  targetRiserHeight?: number;
  targetTreadDepth?: number;
  maxRiser?: number;
  minTread?: number;
}

export function calculateStairRiseRun(input: StairInput, defaults: { maxRiser: number, minTread: number, targetRiser: number, targetTread: number }): CalculatorResult {
  const steps: CalculatorResult['formulaSteps'] = [];
  const warnings: CalculatorResult['warnings'] = [];
  const assumptions: CalculatorResult['assumptions'] = [];

  const maxRiser = input.maxRiser || defaults.maxRiser;
  const minTread = input.minTread || defaults.minTread;
  const targetRiser = input.targetRiserHeight || defaults.targetRiser;
  const targetTread = input.targetTreadDepth || defaults.targetTread;

  assumptions.push({ key: 'maxRiser', label: 'Max Riser Height', value: maxRiser, source: input.maxRiser ? 'user' : 'system_default' });
  assumptions.push({ key: 'minTread', label: 'Min Tread Depth', value: minTread, source: input.minTread ? 'user' : 'system_default' });

  let numRisers = Math.round(input.totalRiseInches / targetRiser);
  let actualRiserHeight = input.totalRiseInches / numRisers;

  // Correct if over max
  if (actualRiserHeight > maxRiser) {
    numRisers += 1;
    actualRiserHeight = input.totalRiseInches / numRisers;
    warnings.push({ severity: 'info', code: 'ADJ_RISER', message: 'Added a riser to stay below maximum allowed height.' });
  }

  const numTreads = numRisers - 1;
  const totalRun = numTreads * targetTread;
  
  steps.push({ label: 'Riser Count', expression: 'Total Rise / Target Riser (rounded)', value: numRisers });
  steps.push({ label: 'Actual Riser Height', expression: 'Total Rise / Riser Count', value: actualRiserHeight.toFixed(3), unit: 'in' });
  steps.push({ label: 'Tread Count', expression: 'Riser Count - 1', value: numTreads });
  steps.push({ label: 'Total Run', expression: 'Tread Count * Target Tread Depth', value: totalRun.toFixed(3), unit: 'in' });

  // Angle
  const stairAngleRad = Math.atan(actualRiserHeight / targetTread);
  const stairAngleDeg = stairAngleRad * (180 / Math.PI);
  steps.push({ label: 'Stair Angle', expression: 'atan(Riser / Tread)', value: stairAngleDeg.toFixed(2), unit: '°' });

  if (stairAngleDeg > 42) {
    warnings.push({ severity: 'warning', code: 'STEEP_ANGLE', message: 'Stair angle exceeds 42°. Check local safety code.' });
  }

  // Very steep stairs warning
  if (actualRiserHeight > 8.25) {
     warnings.push({ severity: 'critical', code: 'CODE_RISK', message: 'This may involve structural or code-compliance decisions. Riser exceeds common limits. Verify with local code requirements or a licensed professional before proceeding.' });
  }

  return {
    calculatorKey: 'stairRiseRun',
    calculatorVersion: '1.0.0',
    input: input as unknown as Record<string, unknown>,
    normalizedInput: { totalRiseInches: input.totalRiseInches, maxRiser, minTread, targetRiser, targetTread },
    result: {
      numRisers,
      actualRiserHeight,
      numTreads,
      totalRun,
      stairAngleDeg
    },
    formulaSteps: steps,
    warnings,
    assumptions
  };
}
