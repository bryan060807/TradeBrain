import { CalculatorResult } from './types';

export function calculateBoardFeet(input: any): CalculatorResult {
  const thickness = parseFloat(input.thickness) || 0;
  const width = parseFloat(input.width) || 0;
  const length = parseFloat(input.length) || 0;
  const qty = parseFloat(input.qty) || 1;
  
  const boardFeet = (thickness * width * length) / 12 * qty;
  
  const steps = [
    { label: 'Formula', expression: '((T x W x L) / 12) * Qty', value: boardFeet.toFixed(2), unit: 'BF' }
  ];

  return {
    calculatorKey: 'boardFeet',
    calculatorVersion: '1.0.0',
    input,
    normalizedInput: { thickness, width, length, qty },
    result: { boardFeet },
    formulaSteps: steps,
    warnings: [],
    assumptions: []
  };
}
