import { CalculatorResult } from './types';

export function calculateHipValley(input: any): CalculatorResult {
  const span = parseFloat(input.span) || 0;
  const pitch = parseFloat(input.pitch) || 0;
  const ridge = parseFloat(input.ridgeThickness) || 1.5;
  
  const run = span / 2;
  const adjustedRun = run - (ridge / 2);
  const hipRun = adjustedRun * Math.SQRT2;
  
  const hipRatio = Math.sqrt(Math.pow(16.9705627, 2) + Math.pow(pitch, 2)) / 16.9705627;
  const hipLength = hipRun * hipRatio;

  const steps = [
    { label: 'Common Run', expression: 'Span / 2', value: run.toFixed(2), unit: 'in' },
    { label: 'Adjusted Hip Run', expression: '(Common Run - Ridge/2) x sqrt(2)', value: hipRun.toFixed(2), unit: 'in' },
    { label: 'Hip Length Ratio', expression: 'sqrt(16.97² + Pitch²) / 16.97', value: hipRatio.toFixed(4) },
    { label: 'Hip/Valley Length', expression: 'Hip Run x Hip Ratio', value: hipLength.toFixed(2), unit: 'in' },
  ];

  return {
    calculatorKey: 'hipValley',
    calculatorVersion: '1.0.0',
    input,
    normalizedInput: { span, pitch, ridge },
    result: { hipLength, hipRun },
    formulaSteps: steps,
    warnings: [],
    assumptions: []
  };
}
