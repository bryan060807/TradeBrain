import { CalculatorResult } from './types';

export function calculateOpeningLayout(input: any): CalculatorResult {
  const centerPos = parseFloat(input.centerPos) || 0;
  const roWidth = parseFloat(input.roWidth) || 0;
  const thickness = parseFloat(input.studThickness) || 1.5; 
  
  const leftJackInner = centerPos - (roWidth / 2);
  const rightJackInner = centerPos + (roWidth / 2);
  
  const leftKingOuter = leftJackInner - (thickness * 2); 
  const rightKingOuter = rightJackInner + (thickness * 2);
  
  const steps = [
    { label: 'Left Jack Inner', expression: 'Center - (RO / 2)', value: leftJackInner.toFixed(2), unit: 'in' },
    { label: 'Right Jack Inner', expression: 'Center + (RO / 2)', value: rightJackInner.toFixed(2), unit: 'in' },
    { label: 'Left King Outer', expression: 'Left Jack Inner - (2 x Thickness)', value: leftKingOuter.toFixed(2), unit: 'in' },
  ];

  return {
    calculatorKey: 'openingLayout',
    calculatorVersion: '1.0.0',
    input,
    normalizedInput: { centerPos, roWidth, thickness },
    result: { leftJackInner, rightJackInner, leftKingOuter, rightKingOuter },
    formulaSteps: steps,
    warnings: [],
    assumptions: []
  };
}
