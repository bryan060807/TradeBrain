import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Button } from '../components/ui';
import { ArrowLeft, Save, ShieldAlert, CheckCircle2, Download } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { CALCULATORS_REGISTRY } from '../lib/calculators/registry';
import { PdfExportButton } from '../components/PdfExportButton';

export function GenericCalculator() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { preferences, addRecentCalculator, saveCalculation, activeProjectId } = useAppStore();
  
  const calcDef = CALCULATORS_REGISTRY[id || ''];
  
  const [input, setInput] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any | null>(null);

  const executeCalculation = () => {
    if (!calcDef) return;
    const res = calcDef.calculate(input, preferences);
    setResult(res);
    if (id) addRecentCalculator(id);
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    executeCalculation();
  };

  const handleCommit = () => {
    if (!result || !id) return;
    saveCalculation({
        id: crypto.randomUUID(),
        projectId: activeProjectId,
        calculatorKey: id,
        title: `${calcDef.title} ${new Date().toLocaleTimeString()}`,
        date: Date.now(),
        result: result
    });
    alert('Mathematical output committed to local ledger.');
  };

  useEffect(() => {
    const onCalculate = () => {
      executeCalculation();
    };
    
    // Ensure we reference the latest handleCommit
    const onSave = () => {
      handleCommit();
    };

    window.addEventListener('voice-calculate', onCalculate);
    window.addEventListener('voice-save', onSave);
    
    return () => {
      window.removeEventListener('voice-calculate', onCalculate);
      window.removeEventListener('voice-save', onSave);
    };
  }); // Note: no dependency array to ensure closures capture the latest state

  if (!calcDef) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center text-[#A0A0A0] h-full border border-white/5 bg-[#0F0F0F] rounded-sm shadow-xl">
        <h2 className="text-4xl font-serif italic text-white mb-4 tracking-tight">Calculator Not Found</h2>
        <p className="font-light tracking-wide">The requested module is unavailable or still under development.</p>
        <Button onClick={() => navigate('/calculators')} variant="outline" className="mt-8">Return to Directory</Button>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 border-b border-white/10 pb-6">
        <Button variant="ghost" onClick={() => navigate('/calculators')} className="px-0 w-10 text-[#707070]">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <span className="text-[#D4AF37] text-[10px] font-semibold uppercase tracking-[0.3em]">Calculation Setup</span>
          <h1 className="text-4xl font-serif italic text-white mt-1 font-light">{calcDef.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle>Dimensional Inputs</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCalculate} className="space-y-6 mt-6">
                {calcDef.fields.map((field: any) => (
                  <div key={field.key} className="space-y-3">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <Input 
                      id={field.key} 
                      type={field.type} 
                      step={field.step} 
                      required={field.required}
                      value={input[field.key] || ''}
                      onChange={(e) => setInput({...input, [field.key]: e.target.value})} 
                    />
                  </div>
                ))}
                <Button type="submit" className="w-full mt-6">Execute Calculation</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8" id="calculator-result-container">
          {result ? (
            <div className="space-y-8 bg-[#0F0F0F] p-4 -m-4 rounded-md">
              <Card className="bg-[#0A0A0A] border-[#D4AF37]/30">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {calcDef.renderResult(result.result).map((resItem: any, idx: number) => (
                      <div key={idx} className={idx % 2 === 0 ? "sm:border-r border-b sm:border-b-0 border-white/10 pb-6 sm:pb-0" : ""}>
                        <p className="text-[10px] uppercase tracking-widest text-[#707070] mb-4">{resItem.label}</p>
                        <p className="text-4xl sm:text-5xl font-serif text-white tracking-tight break-words">{resItem.value}</p>
                        <p className="text-xs text-[#D4AF37] mt-3 font-mono">{resItem.sub}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {result.warnings?.length > 0 && (
                <div className="space-y-3">
                  {result.warnings.map((warn: any, i: number) => (
                    <div key={i} className={`p-5 rounded-sm border flex items-start gap-4 ${warn.severity === 'critical' ? 'bg-[#1A0A0A] border-red-900/50 text-red-100' : warn.severity === 'warning' ? 'bg-[#1A150A] border-[#D4AF37]/30 text-[#D4AF37]' : 'bg-[#0A101A] border-blue-900/50 text-blue-200'}`}>
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-[10px] uppercase tracking-widest mb-2">{warn.severity === 'critical' ? 'Critical Failure Risk' : warn.severity === 'warning' ? 'Standard Deviation' : 'System Notice'}</p>
                        <p className="text-sm font-light leading-relaxed">{warn.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Card>
                <CardHeader className="border-b border-white/5 pb-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <CardTitle>Cryptographic Audit Trail</CardTitle>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <PdfExportButton elementId="calculator-result-container" filename={`${calcDef.id}-report`} />
                      <Button variant="outline" className="h-10 text-[10px] gap-2 px-4 shadow-none w-full md:w-auto min-w-[120px]" onClick={handleCommit}>
                        <Save className="w-3 h-3" /> Commit Record
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-[10px] font-semibold text-[#707070] uppercase tracking-widest border-b border-white/10 pb-3 mb-4">Execution Steps</h4>
                      <div className="overflow-x-auto text-[#A0A0A0]">
                        <table className="w-full text-sm text-left">
                          <thead>
                            <tr className="border-b border-white/5">
                              <th className="py-3 font-normal text-xs uppercase tracking-wider">Metric</th>
                              <th className="py-3 font-normal text-xs uppercase tracking-wider">Formula Sequence</th>
                              <th className="py-3 font-normal text-xs uppercase tracking-wider text-right">Yield</th>
                            </tr>
                          </thead>
                          <tbody className="font-light">
                            {result.formulaSteps.map((step: any, i: number) => (
                              <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                <td className="py-3 text-[#E5E5E5]">{step.label}</td>
                                <td className="py-3 font-mono text-[10px] text-[#707070]">{step.expression}</td>
                                <td className="py-3 text-right font-mono text-xs text-[#D4AF37]">{step.value} <span className="text-[#A0A0A0]">{step.unit || ''}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-[#0A0A0A] p-6 rounded-sm border border-white/5 text-[11px] text-[#A0A0A0] font-light">
                      <div className="flex justify-between items-end border-b border-white/10 pb-3 mb-4">
                        <span className="uppercase tracking-widest text-[#707070]">Runtime Constraints</span>
                        <span className="font-mono text-[9px]">V.{result.calculatorVersion}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mb-6">
                        {result.assumptions?.map((assum: any, i: number) => (
                          <div key={i} className="flex justify-between items-center py-1">
                            <span>{assum.label}</span>
                            <span className="font-mono text-[#E5E5E5]">{String(assum.value)} <span className="text-[9px] text-[#707070] uppercase tracking-widest ml-2">[{assum.source}]</span></span>
                          </div>
                        ))}
                        {(!result.assumptions || result.assumptions.length === 0) && (
                          <div className="py-1 italic text-[#606060]">No external assumptions applied.</div>
                        )}
                      </div>
                      <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                        <span className="italic text-[#505050]">Disclaimer: Field verification mandatory prior to execution.</span>
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 rounded-full bg-[#D4AF37]"></div>
                          <div className="w-1 h-1 rounded-full bg-white/20"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full border border-white/10 bg-[#0F0F0F] rounded-sm flex flex-col items-center justify-center p-16 text-center shadow-xl">
              <CheckCircle2 className="w-8 h-8 mb-6 text-[#707070] opacity-50" />
              <p className="text-xl font-serif text-white tracking-tight mb-2">Awaiting Parameters</p>
              <p className="text-sm font-light text-[#A0A0A0]">System ready. Input parameters to generate execution layout.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
