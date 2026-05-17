import { calculateWallStudCount } from './wallStudCount';
import { calculateCommonRafter } from './commonRafter';
import { calculateBoardFeet } from './boardFeet';
import { calculateRoofPitch } from './roofPitch';
import { calculateBalusterSpacing } from './balusterSpacing';
import { calculateSheetGoods } from './sheetGoods';
import { calculateMaterialWaste } from './materialWaste';
import { calculateHipValley } from './hipValley';
import { calculateTrimMiter } from './trimMiter';
import { calculateJoistLayout } from './joistLayout';
import { calculateOpeningLayout } from './openingLayout';

export const CALCULATORS_REGISTRY: Record<string, any> = {
  wallStudCount: {
    id: 'wallStudCount',
    title: 'Wall Stud Count',
    fields: [
      { key: 'wallLength', label: 'Total Wall Length (inches)', type: 'number', step: '1', required: true },
      { key: 'studSpacing', label: 'Stud Spacing (inches, optional)', type: 'number', step: '0.125' },
      { key: 'corners', label: 'Number of Corners', type: 'number', step: '1', required: true },
      { key: 'openings', label: 'Number of Openings (Doors/Windows)', type: 'number', step: '1', required: true }
    ],
    calculate: (input: any, prefs: any) => calculateWallStudCount(input, { defaultStudSpacingIn: prefs.defaultStudSpacingIn, defaultWastePercent: prefs.defaultWastePercent }),
    renderResult: (res: any) => [
      { label: 'Total Studs', value: res.totalStuds, sub: `Includes ${res.waste} for waste` },
      { label: 'Base + Corners', value: res.baseStuds + res.cornerStuds, sub: `Base: ${res.baseStuds}, Corners: ${res.cornerStuds}` }
    ]
  },
  commonRafter: {
    id: 'commonRafter',
    title: 'Common Rafter',
    fields: [
      { key: 'span', label: 'Span (inches)', type: 'number', step: '0.125', required: true },
      { key: 'pitch', label: 'Pitch (Rise per 12" run)', type: 'number', step: '0.5', required: true },
      { key: 'overhang', label: 'Overhang (inches)', type: 'number', step: '0.125' },
      { key: 'ridgeThickness', label: 'Ridge Thickness (inches, e.g. 1.5)', type: 'number', step: '0.125' }
    ],
    calculate: (input: any) => calculateCommonRafter(input),
    renderResult: (res: any) => [
      { label: 'Rafter Length', value: res.rafterLength.toFixed(3) + '″', sub: 'From ridge to birdsmouth' },
      { label: 'Tail Length', value: res.tailLength.toFixed(3) + '″', sub: 'Overhang extension' }
    ]
  },
  boardFeet: {
    id: 'boardFeet',
    title: 'Board Feet',
    fields: [
      { key: 'thickness', label: 'Thickness (inches)', type: 'number', step: '0.125', required: true },
      { key: 'width', label: 'Width (inches)', type: 'number', step: '0.125', required: true },
      { key: 'length', label: 'Length (feet)', type: 'number', step: '0.125', required: true },
      { key: 'qty', label: 'Quantity', type: 'number', step: '1', required: true }
    ],
    calculate: (input: any) => calculateBoardFeet(input),
    renderResult: (res: any) => [
      { label: 'Total Board Feet', value: res.boardFeet.toFixed(2), sub: 'BF' }
    ]
  },
  roofPitchConverter: {
    id: 'roofPitchConverter',
    title: 'Roof Pitch Converter',
    fields: [
      { key: 'pitch', label: 'Pitch (Rise per 12" run)', type: 'number', step: '0.125', required: true }
    ],
    calculate: (input: any) => calculateRoofPitch(input),
    renderResult: (res: any) => [
      { label: 'Degrees', value: res.degrees.toFixed(2) + '°', sub: 'Angle in degrees' },
      { label: 'Percent Slope', value: res.percentSlope.toFixed(2) + '%', sub: 'Gradient' }
    ]
  },
  balusterSpacing: {
    id: 'balusterSpacing',
    title: 'Baluster Spacing',
    fields: [
      { key: 'openingLength', label: 'Opening Length (inches)', type: 'number', step: '0.125', required: true },
      { key: 'balusterWidth', label: 'Baluster Width (inches)', type: 'number', step: '0.125', required: true },
      { key: 'maxGap', label: 'Max Allowed Gap (inches, usually 4)', type: 'number', step: '0.125', required: true }
    ],
    calculate: (input: any) => calculateBalusterSpacing(input),
    renderResult: (res: any) => [
      { label: 'Balusters Needed', value: res.balusters, sub: 'Total count' },
      { label: 'Actual Gap', value: res.actualGap.toFixed(3) + '″', sub: 'Space between balusters' }
    ]
  },
  sheetGoods: {
    id: 'sheetGoods',
    title: 'Sheet Goods Estimator',
    fields: [
      { key: 'coverageSqFt', label: 'Total Area to Cover (Sq Ft)', type: 'number', step: '1', required: true },
      { key: 'sheetWidth', label: 'Sheet Width (ft, Default 4)', type: 'number', step: '0.5' },
      { key: 'sheetLength', label: 'Sheet Length (ft, Default 8)', type: 'number', step: '0.5' }
    ],
    calculate: (input: any, prefs: any) => calculateSheetGoods(input, prefs),
    renderResult: (res: any) => [
      { label: 'Total Sheets', value: res.totalSheets, sub: `Includes ${res.waste} for waste` },
      { label: 'Raw Sheets', value: res.rawSheets.toFixed(1), sub: 'Mathematical yield' }
    ]
  },
  materialWaste: {
    id: 'materialWaste',
    title: 'Material Waste Adjuster',
    fields: [
      { key: 'baseQty', label: 'Base Quantity', type: 'number', step: '0.1', required: true },
      { key: 'wastePercent', label: 'Waste Percent (Optional override)', type: 'number', step: '1' },
      { key: 'packageQty', label: 'Units per Package (Default 1)', type: 'number', step: '1' },
      { key: 'unit', label: 'Unit label (e.g. ea, sqft, lnft)', type: 'text' }
    ],
    calculate: (input: any, prefs: any) => calculateMaterialWaste(input, prefs),
    renderResult: (res: any) => [
      { label: 'Procured Qty', value: res.finalQty, sub: `Yields ${res.extra} extra` },
      { label: 'Packages', value: res.packagesNeeded, sub: 'Whole packages to buy' }
    ]
  },
  hipValleyRafter: {
    id: 'hipValleyRafter',
    title: 'Hip/Valley Rafter',
    fields: [
      { key: 'span', label: 'Common Span (inches)', type: 'number', step: '0.125', required: true },
      { key: 'pitch', label: 'Pitch (Rise per 12" run)', type: 'number', step: '0.5', required: true },
      { key: 'ridgeThickness', label: 'Ridge/Hip Thickness (inches)', type: 'number', step: '0.125' }
    ],
    calculate: (input: any) => calculateHipValley(input),
    renderResult: (res: any) => [
      { label: 'Hip Length', value: res.hipLength.toFixed(3) + '″', sub: 'Theoretical length' },
      { label: 'Hip Run', value: res.hipRun.toFixed(3) + '″', sub: 'Diagonal run' }
    ]
  },
  trimMiter: {
    id: 'trimMiter',
    title: 'Trim Miter / Bevel',
    fields: [
      { key: 'wallAngle', label: 'Wall Corner Angle (degrees)', type: 'number', step: '0.1', required: true },
      { key: 'pieces', label: 'Pieces in Corner (Default 2)', type: 'number', step: '1' }
    ],
    calculate: (input: any) => calculateTrimMiter(input),
    renderResult: (res: any) => [
      { label: 'Miter Saw Setting', value: res.sawAngle.toFixed(2) + '°', sub: 'Miter angle on saw' },
      { label: 'True Miter Angle', value: res.miterAngle.toFixed(2) + '°', sub: 'Mathematical corner division' }
    ]
  },
  joistLayout: {
    id: 'joistLayout',
    title: 'Joist & Rim Board Layout',
    fields: [
      { key: 'length', label: 'Floor/Wall Length (inches)', type: 'number', step: '0.125', required: true },
      { key: 'spacing', label: 'Joist Spacing (inches, Default 16)', type: 'number', step: '0.125' },
      { key: 'thickness', label: 'Joist Thickness (inches, Default 1.5)', type: 'number', step: '0.125' }
    ],
    calculate: (input: any, prefs: any) => calculateJoistLayout(input, prefs),
    renderResult: (res: any) => [
      { label: 'Total Joists', value: res.totalJoists, sub: 'Including ends' },
      { label: 'First Mark', value: res.firstMark.toFixed(3) + '″', sub: 'First physical mark on rim board' }
    ]
  },
  openingLayout: {
    id: 'openingLayout',
    title: 'Opening Layout Helper',
    fields: [
      { key: 'centerPos', label: 'Center Position on Wall (inches)', type: 'number', step: '0.125', required: true },
      { key: 'roWidth', label: 'Rough Opening Width (inches)', type: 'number', step: '0.125', required: true },
      { key: 'studThickness', label: 'Stud Thickness (inches, Default 1.5)', type: 'number', step: '0.125' }
    ],
    calculate: (input: any) => calculateOpeningLayout(input),
    renderResult: (res: any) => [
      { label: 'Left Jack', value: res.leftJackInner.toFixed(3) + '″', sub: 'Inside measurement' },
      { label: 'Right Jack', value: res.rightJackInner.toFixed(3) + '″', sub: 'Inside measurement' }
    ]
  }
};
