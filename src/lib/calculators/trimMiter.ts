import { CalculatorResult } from './types';

export function calculateTrimMiter(input: any): CalculatorResult {
  const wallAngle = parseFloat(input.wallAngle) || 90;
  const pieces = parseFloat(input.pieces) || 2;
  
  const miterAngle = wallAngle / pieces;
  const sawAngle = 90 - miterAngle; 
  
  const steps = [
    { label: 'Miter Angle (True)', expression: 'Wall Angle / Pieces', value: miterAngle.toFixed(2), unit: '°' },
    { label: 'Miter Saw Setting', expression: '90 - Miter Angle', value: sawAngle.toFixed(2), unit: '°' }
  ];

  return {
    calculatorKey: 'trimMiter',
    calculatorVersion: '1.0.0',
    input,
    normalizedInput: { wallAngle, pieces },
    result: { miterAngle, sawAngle },
    formulaSteps: steps,
    warnings: [],
    assumptions: []
  };
}
