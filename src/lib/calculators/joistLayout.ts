import { CalculatorResult } from './types';

export function calculateJoistLayout(input: any, prefs: any): CalculatorResult {
  const length = parseFloat(input.length) || 0;
  const spacing = parseFloat(input.spacing) || prefs.defaultStudSpacingIn || 16;
  const thickness = parseFloat(input.thickness) || 1.5;
  
  const totalJoists = Math.ceil(length / spacing) + 1;
  const firstMark = spacing - (thickness / 2); 
  
  const steps = [
    { label: 'Total Joists', expression: 'ceil(Length / Spacing) + 1', value: totalJoists },
    { label: 'First Mark', expression: 'Spacing - (Thickness / 2)', value: firstMark.toFixed(2), unit: 'in' },
  ];

  return {
    calculatorKey: 'joistLayout',
    calculatorVersion: '1.0.0',
    input,
    normalizedInput: { length, spacing, thickness },
    result: { totalJoists, firstMark },
    formulaSteps: steps,
    warnings: [],
    assumptions: [
      { key: 'spacing', label: 'Joist Spacing', value: spacing, source: input.spacing ? 'user' : 'system_default' }
    ]
  };
}
