import { CalculatorResult } from './types';

export function calculateCommonRafter(input: any): CalculatorResult {
  const span = parseFloat(input.span) || 0;
  const pitch = parseFloat(input.pitch) || 0;
  const overhang = parseFloat(input.overhang) || 0;
  const ridge = parseFloat(input.ridgeThickness) || 1.5;
  
  const run = span / 2;
  const adjustedRun = run - (ridge / 2);
  
  const lineLengthRatio = Math.sqrt(Math.pow(12, 2) + Math.pow(pitch, 2)) / 12;
  
  const rafterLength = lineLengthRatio * adjustedRun;
  const tailLength = lineLengthRatio * overhang;

  const steps = [
    { label: 'Run', expression: 'Span / 2', value: run.toFixed(2), unit: 'in' },
    { label: 'Adjusted Run', expression: 'Run - (Ridge / 2)', value: adjustedRun.toFixed(2), unit: 'in' },
    { label: 'Line Length Ratio', expression: 'sqrt(12² + Pitch²) / 12', value: lineLengthRatio.toFixed(4) },
    { label: 'Rafter Length', expression: 'Ratio * Adjusted Run', value: rafterLength.toFixed(2), unit: 'in' },
  ];

  return {
    calculatorKey: 'commonRafter',
    calculatorVersion: '1.0.0',
    input,
    normalizedInput: { span, pitch, overhang, ridge },
    result: { rafterLength, tailLength, totalLength: rafterLength + tailLength },
    formulaSteps: steps,
    warnings: [],
    assumptions: [
      { key: 'ridge', label: 'Ridge Thickness', value: ridge, source: input.ridgeThickness ? 'user' : 'system_default' }
    ]
  };
}
