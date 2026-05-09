import { CalculatorResult } from './types';

export function calculateMaterialWaste(input: any, prefs: any): CalculatorResult {
  const baseQty = parseFloat(input.baseQty) || 0;
  const wastePct = parseFloat(input.wastePercent) || prefs.defaultWastePercent || 10;
  const pkgQty = parseFloat(input.packageQty) || 1;
  const unit = input.unit || 'units';

  const totalExact = baseQty * (1 + wastePct / 100);
  let packagesNeeded = 0;
  if(pkgQty > 0) {
      packagesNeeded = Math.ceil(totalExact / pkgQty);
  }
  const finalQty = packagesNeeded * pkgQty;
  const extra = finalQty - baseQty;
  
  const steps = [
    { label: 'Exact Total w/ Waste', expression: `Base + (Base * ${wastePct}%)`, value: totalExact.toFixed(2), unit },
    { label: 'Packages Needed', expression: 'ceil(Exact Total / Pkg Qty)', value: packagesNeeded },
    { label: 'Final Procured Qty', expression: 'Packages * Pkg Qty', value: finalQty, unit },
  ];

  return {
    calculatorKey: 'materialWaste',
    calculatorVersion: '1.0.0',
    input,
    normalizedInput: { baseQty, wastePct, pkgQty, unit },
    result: { packagesNeeded, finalQty, extra },
    formulaSteps: steps,
    warnings: [],
    assumptions: [
      { key: 'wastePercent', label: 'Waste Percentage', value: wastePct, source: input.wastePercent ? 'user' : 'company_standard' }
    ]
  };
}
