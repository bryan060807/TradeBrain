import { CalculatorResult } from './types';

export function calculateBalusterSpacing(input: any): CalculatorResult {
  const openingLength = parseFloat(input.openingLength) || 0;
  const balusterWidth = parseFloat(input.balusterWidth) || 0;
  const maxGap = parseFloat(input.maxGap) || 4;
  
  const gaps = Math.ceil((openingLength + balusterWidth) / (balusterWidth + maxGap));
  const balusters = gaps - 1;
  
  let actualGap = 0;
  const warnings: any[] = [];
  
  if (gaps > 0) {
    actualGap = (openingLength - (balusters * balusterWidth)) / gaps;
  }
  
  const steps = [
    { label: 'Estimated Gaps', expression: 'ceil((opening + width) / (width + maxGap))', value: gaps },
    { label: 'Baluster Count', expression: 'Gaps - 1', value: balusters },
    { label: 'Actual Gap', expression: '(Opening - (Balusters x width)) / Gaps', value: actualGap.toFixed(3), unit: 'in' },
  ];

  if (actualGap > maxGap) {
     warnings.push({ severity: 'critical', code: 'EXCEEDS_GAP', message: 'Calculated gap exceeds maximum allowed limits.' });
  }

  return {
    calculatorKey: 'balusterSpacing',
    calculatorVersion: '1.0.0',
    input,
    normalizedInput: { openingLength, balusterWidth, maxGap },
    result: { balusters, actualGap },
    formulaSteps: steps,
    warnings,
    assumptions: []
  };
}
