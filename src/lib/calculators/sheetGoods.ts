import { CalculatorResult } from './types';

export function calculateSheetGoods(input: any, prefs: any): CalculatorResult {
  const coverageSqFt = parseFloat(input.coverageSqFt) || 0;
  const sheetWidth = parseFloat(input.sheetWidth) || 4;
  const sheetLength = parseFloat(input.sheetLength) || 8;
  
  const sheetArea = sheetWidth * sheetLength;
  let sheetsNeeded = 0;
  let waste = 0;
  
  if (sheetArea > 0) {
    sheetsNeeded = coverageSqFt / sheetArea;
    waste = Math.ceil(sheetsNeeded * ((prefs.defaultWastePercent || 10) / 100));
  }
  
  const totalSheets = Math.ceil(sheetsNeeded) + waste;
  
  const steps = [
    { label: 'Sheet Area', expression: 'Width x Length', value: sheetArea, unit: 'sq ft' },
    { label: 'Raw Sheets', expression: 'Coverage / Sheet Area', value: sheetsNeeded.toFixed(2) },
    { label: 'Waste Allowance', expression: `Raw x ${prefs.defaultWastePercent}%`, value: waste },
  ];

  return {
    calculatorKey: 'sheetGoods',
    calculatorVersion: '1.0.0',
    input,
    normalizedInput: { coverageSqFt, sheetWidth, sheetLength },
    result: { totalSheets, rawSheets: sheetsNeeded, waste },
    formulaSteps: steps,
    warnings: [],
    assumptions: [
      { key: 'waste', label: 'Waste Percent', value: prefs.defaultWastePercent, source: 'system_default' }
    ]
  };
}
