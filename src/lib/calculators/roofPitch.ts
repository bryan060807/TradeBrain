import { CalculatorResult } from './types';

export function calculateRoofPitch(input: any): CalculatorResult {
  const pitch = parseFloat(input.pitch) || 0;
  
  const radians = Math.atan(pitch / 12);
  const degrees = radians * (180 / Math.PI);
  const percentSlope = (pitch / 12) * 100;
  
  const steps = [
    { label: 'Degrees', expression: 'atan(Pitch / 12)', value: degrees.toFixed(2), unit: '°' },
    { label: 'Percent Slope', expression: '(Pitch / 12) * 100', value: percentSlope.toFixed(2), unit: '%' }
  ];

  return {
    calculatorKey: 'roofPitchConverter',
    calculatorVersion: '1.0.0',
    input,
    normalizedInput: { pitch },
    result: { degrees, percentSlope },
    formulaSteps: steps,
    warnings: [],
    assumptions: []
  };
}
