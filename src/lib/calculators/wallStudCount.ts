import { CalculatorResult } from './types';

export function calculateWallStudCount(input: any, defaults: { defaultStudSpacingIn: number, defaultWastePercent: number }): CalculatorResult {
  const length = parseFloat(input.wallLength) || 0;
  const spacing = parseFloat(input.studSpacing) || defaults.defaultStudSpacingIn;
  const openings = parseInt(input.openings) || 0;
  const corners = parseInt(input.corners) || 0;
  
  const steps: any[] = [];
  const assumptions: any[] = [
    { key: 'spacing', label: 'Stud Spacing', value: spacing, source: input.studSpacing ? 'user' : 'system_default' },
    { key: 'waste', label: 'Waste Percent', value: defaults.defaultWastePercent, source: 'system_default' }
  ];
  
  const baseStuds = Math.ceil(length / spacing) + 1;
  steps.push({ label: 'Base Studs', expression: 'ceil(Length / Spacing) + 1', value: baseStuds });
  
  const cornerStuds = corners * 2;
  steps.push({ label: 'Corner Studs', expression: 'Corners * 2 (Assuming 3-stud)', value: cornerStuds });
  
  const openingStuds = openings * 3;
  steps.push({ label: 'Opening Extra', expression: 'Openings * 3 (Kings/Jacks)', value: openingStuds });
  
  const total = baseStuds + cornerStuds + openingStuds;
  const waste = Math.ceil(total * (defaults.defaultWastePercent / 100));
  
  return {
    calculatorKey: 'wallStudCount',
    calculatorVersion: '1.0.0',
    input,
    normalizedInput: { length, spacing, openings, corners },
    result: { totalStuds: total + waste, baseStuds, cornerStuds, openingStuds, waste },
    formulaSteps: steps,
    warnings: [],
    assumptions
  };
}
