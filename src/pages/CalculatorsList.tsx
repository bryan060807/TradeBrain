import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../components/ui';
import { useAppStore } from '../store/useAppStore';
import { Ruler, LayoutTemplate, Star, StarOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AVAILABLE_CALCULATORS = [
  { key: 'stairRiseRun', name: 'Stair Rise / Run', desc: 'Calculate riser heights, tread length, and stair layout.' },
  { key: 'wallStudCount', name: 'Wall Stud Count', desc: 'Estimate studs needed for walls including openings.' },
  { key: 'commonRafter', name: 'Common Rafter', desc: 'Compute rafter lengths, plumb cuts, and birdsmouths.' },
  { key: 'hipValleyRafter', name: 'Hip/Valley Rafter', desc: 'Calculate specialized rafter dimensions and intercept angles.' },
  { key: 'roofPitchConverter', name: 'Roof Pitch Converter', desc: 'Convert pitch units (Rise per 12" run) to degrees and percent slope.' },
  { key: 'trimMiter', name: 'Trim Miter / Bevel', desc: 'Calculate saw base settings for odd-angle baseboard or crown corner cuts.' },
  { key: 'joistLayout', name: 'Joist & Rim Board Layout', desc: 'Produce exact tape measure layout targets for floors and walls.' },
  { key: 'sheetGoods', name: 'Sheet Goods Estimator', desc: 'Estimate plywood/drywall sheet counts with automatic waste calculation.' },
  { key: 'boardFeet', name: 'Board Feet', desc: 'Calculate exact board-feet for material estimates.' },
  { key: 'openingLayout', name: 'Opening Layout Helper', desc: 'Calculate position for kings and jacks relative to wall center.' },
  { key: 'balusterSpacing', name: 'Baluster Spacing', desc: 'Layout uniform spacing for handrail balusters and spindles.' },
  { key: 'materialWaste', name: 'Material Waste Adjuster', desc: 'Automatically apply waste percent and bundle/package rounding calculations.' }
];

export function CalculatorsList() {
  const { favoriteCalculators, addFavoriteCalculator, removeFavoriteCalculator } = useAppStore();
  const navigate = useNavigate();

  return (
    <div className="space-y-12">
      <div className="border-b border-white/10 pb-6">
        <span className="text-[#D4AF37] text-[10px] font-semibold uppercase tracking-[0.3em]">Directory</span>
        <h1 className="text-4xl font-serif italic text-white mt-2 font-light">Calculators</h1>
        <p className="text-[#A0A0A0] mt-4 font-light text-sm max-w-md">Deterministic formulas for precise field computations.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {AVAILABLE_CALCULATORS.map((calc) => {
          const isFav = favoriteCalculators.includes(calc.key);
          return (
            <Card key={calc.key} className="flex flex-col hover:border-[#D4AF37]/50 transition-colors cursor-pointer group" onClick={() => navigate(`/calculators/${calc.key}`)}>
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5 space-y-0">
                <CardTitle className="text-xs flex items-center gap-3">
                  <Ruler className="w-4 h-4 text-[#D4AF37]" />
                  {calc.name}
                </CardTitle>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    isFav ? removeFavoriteCalculator(calc.key) : addFavoriteCalculator(calc.key);
                  }}
                  className="text-[#D4AF37] hover:scale-110 transition-transform"
                >
                  {isFav ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4 text-[#707070] group-hover:text-[#D4AF37]" />}
                </button>
              </CardHeader>
              <CardContent className="flex-1 mt-4">
                <p className="text-sm text-[#A0A0A0] font-light leading-relaxed">{calc.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
