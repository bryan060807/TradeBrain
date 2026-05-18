import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent, Input, Button, Label } from '../components/ui';
import { FileText, Camera, Plus, Calendar, Clock, Package, ShieldCheck } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

export function DailyReports() {
  const { dailyReports, projects, activeProjectId, user, safetyBriefings } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [filterProject, setFilterProject] = useState(activeProjectId || 'all');
  
  const [newReport, setNewReport] = useState({
    date: new Date().toISOString().split('T')[0],
    projectId: activeProjectId || '',
    workCompleted: '',
    workerHours: '',
    materialsUsed: '',
    incidents: '',
    safetyBriefingId: '',
  });

  const dailyReportTemplates: Record<string, { work: string; materials: string; hours: string }> = {
    'Custom': { work: '', materials: '', hours: '' },
    'Concrete Pour (Foundation)': {
      work: 'Completed setup of vapor barrier and rebar grid for Sector B. 40 cubic yards poured. Finished vibrating and screeding. Curing compound applied to final surface.',
      materials: '40 cu yds 4000psi concrete, 1500 ft #4 rebar, 20 gallons curing compound.',
      hours: '56'
    },
    'Framing (Level 1)': {
      work: 'Erected exterior wall panels for North and East elevations. Plumbed and braced structural members. Began installing interior load-bearing headers.',
      materials: '250 2x6x10 studs, 40 2x4x10 studs, 2 boxes 16d nails, 15 sheets OSB.',
      hours: '40'
    },
    'MEP Rough-in': {
      work: 'Electricians ran conduit for main lighting circuits in south wing. Plumbers completed DWV (Drain Waste Vent) stack through 2nd floor chasing. Passed initial rough-in pressure tests.',
      materials: '400ft 3/4" EMT, 20 junction boxes, 80ft 3" PVC pipe, PVC primer/cement.',
      hours: '64'
    },
    'Rain Delay / Standby': {
      work: 'Heavy rain starting at 0800. Exterior site work halted. Crew pumped out accumulated water from foundation trenches. Relocated to interior cleanup and material sorting.',
      materials: 'Fuel for trash pumps, 4 heavy-duty tarps.',
      hours: '16'
    }
  };

  const handleTemplateSelect = (templateKey: string) => {
    const t = dailyReportTemplates[templateKey];
    if (t) {
      setNewReport(prev => ({
        ...prev,
        workCompleted: t.work,
        materialsUsed: t.materials,
        workerHours: t.hours
      }));
    }
  };

  const [photos, setPhotos] = useState<string[]>([]);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
       // In a real app we upload to Firebase Storage
       setPhotos([...photos, URL.createObjectURL(file)]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'daily_reports'), {
        projectId: newReport.projectId,
        date: new Date(newReport.date).getTime(),
        workCompleted: newReport.workCompleted,
        workerHours: Number(newReport.workerHours) || 0,
        materialsUsed: newReport.materialsUsed,
        incidents: newReport.incidents || '',
        safetyBriefingId: newReport.safetyBriefingId || '',
        photoUrls: photos,
        ownerId: user.uid,
        createdAt: Date.now()
      });
      setNewReport({
        date: new Date().toISOString().split('T')[0],
        projectId: activeProjectId || '',
        workCompleted: '',
        workerHours: '',
        materialsUsed: '',
        incidents: '',
        safetyBriefingId: '',
      });
      setPhotos([]);
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReports = dailyReports.filter(r => filterProject === 'all' || r.projectId === filterProject)
    .sort((a, b) => b.date - a.date);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-serif italic font-light text-white">Daily Reports</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">Log progress, hours, and materials</p>
        </div>
        <div className="flex gap-4 items-center">
           <select
              className="h-9 rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-1 text-xs text-[#E5E5E5] focus:ring-[#D4AF37]"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
           >
              <option value="all">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
           </select>
           <Button className="gap-2" onClick={() => setIsAdding(!isAdding)}>
             <Plus className="w-4 h-4" /> New Report
           </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="bg-[#161616]">
          <CardHeader>
            <CardTitle className="text-lg">Log Daily Report</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2 flex gap-4">
                   <div className="flex-1">
                     <Label>Load Template</Label>
                     <select 
                       className="w-full flex h-10 rounded-sm border border-white/20 bg-[#161616] px-3 py-2 text-sm text-[#D4AF37] focus:ring-[#D4AF37]"
                       onChange={e => handleTemplateSelect(e.target.value)}
                     >
                       <option value="Custom">Custom / Blank</option>
                       {Object.keys(dailyReportTemplates).filter(k => k !== 'Custom').map(k => <option key={k} value={k}>{k}</option>)}
                     </select>
                   </div>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={newReport.date} onChange={e => setNewReport({...newReport, date: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Project</Label>
                  <select 
                    className="w-full flex h-10 rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-2 text-sm text-[#E5E5E5] focus:ring-[#D4AF37]"
                    value={newReport.projectId}
                    onChange={e => setNewReport({...newReport, projectId: e.target.value})}
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Work Completed Today</Label>
                  <textarea 
                    className="w-full min-h-[100px] rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-2 text-sm text-[#E5E5E5] focus:ring-1 focus:ring-[#D4AF37]"
                    value={newReport.workCompleted} 
                    onChange={e => setNewReport({...newReport, workCompleted: e.target.value})} 
                    placeholder="Describe tasks finished..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Worker Hours</Label>
                  <Input type="number" step="0.5" value={newReport.workerHours} onChange={e => setNewReport({...newReport, workerHours: e.target.value})} placeholder="e.g. 40" required />
                </div>
                <div className="space-y-2">
                  <Label>Materials Used / Delivered</Label>
                  <Input value={newReport.materialsUsed} onChange={e => setNewReport({...newReport, materialsUsed: e.target.value})} placeholder="e.g. 40 sheets drywall" />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>Safety Briefing (Optional)</Label>
                  <select 
                    className="w-full flex h-10 rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-2 text-sm text-[#E5E5E5] focus:ring-[#D4AF37]"
                    value={newReport.safetyBriefingId}
                    onChange={e => setNewReport({...newReport, safetyBriefingId: e.target.value})}
                  >
                    <option value="">None</option>
                    {safetyBriefings.filter(b => b.projectId === newReport.projectId && newReport.projectId !== '').map(b => (
                      <option key={b.id} value={b.id}>{b.title} ({new Date(b.date).toLocaleDateString()})</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>Incidents / Notes (Optional)</Label>
                  <textarea 
                    className="w-full min-h-[60px] rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-2 text-sm text-[#E5E5E5] focus:ring-1 focus:ring-[#D4AF37]"
                    value={newReport.incidents} 
                    onChange={e => setNewReport({...newReport, incidents: e.target.value})} 
                    placeholder="Describe any safety incidents or important notes..."
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2 mt-2 pt-4 border-t border-white/5">
                  <Label className="flex justify-between items-center">
                    <span>Site Photos</span>
                    <label className="cursor-pointer text-[#D4AF37] text-xs hover:underline flex items-center gap-1">
                      <Camera className="w-3 h-3" /> Add Photo
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoCapture} />
                    </label>
                  </Label>
                  {photos.length > 0 && (
                     <div className="flex flex-wrap gap-2 mt-2">
                       {photos.map((url, i) => (
                         <div key={i} className="relative w-20 h-20 border border-white/20 rounded-sm overflow-hidden bg-black">
                           <img src={url} alt="Site" className="w-full h-full object-cover opacity-80" />
                           <button type="button" onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/50 w-5 h-5 flex items-center justify-center rounded-sm text-white text-[10px]">X</button>
                         </div>
                       ))}
                     </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                 <Button variant="ghost" type="button" onClick={() => setIsAdding(false)}>Cancel</Button>
                 <Button type="submit">Submit Report</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filteredReports.map(report => (
          <Card key={report.id} className="bg-[#111]">
            <CardContent className="p-6">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#A0A0A0]" />
                      {new Date(report.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    {report.projectId && projects.find(p => p.id === report.projectId) && (
                      <div className="text-xs text-[#D4AF37] uppercase tracking-widest mt-1">
                        {projects.find(p => p.id === report.projectId)?.name}
                      </div>
                    )}
                  </div>
               </div>
               
               <div className="text-sm text-[#E5E5E5] whitespace-pre-wrap mb-4 bg-white/5 p-3 rounded-sm border border-white/5">
                 {report.workCompleted}
               </div>
               
               <div className="flex flex-wrap gap-4 text-xs text-[#A0A0A0] mb-4">
                 {report.workerHours > 0 && (
                   <div className="flex items-center gap-1.5 bg-[#0A0A0A] border border-white/10 px-2 py-1 rounded-sm"><Clock className="w-3.5 h-3.5" /> {report.workerHours} hrs</div>
                 )}
                 {report.materialsUsed && (
                   <div className="flex items-center gap-1.5 bg-[#0A0A0A] border border-white/10 px-2 py-1 rounded-sm"><Package className="w-3.5 h-3.5" /> {report.materialsUsed}</div>
                 )}
               </div>

               {report.incidents && (
                 <div className="mb-4 p-3 rounded-sm border border-red-500/20 bg-red-500/10 text-red-200 text-sm whitespace-pre-wrap">
                   <strong className="font-semibold block mb-1">Incidents / Notes:</strong>
                   {report.incidents}
                 </div>
               )}

               {report.safetyBriefingId && safetyBriefings.find(b => b.id === report.safetyBriefingId) && (
                 <div className="mb-4 p-3 rounded-sm border border-blue-500/20 bg-blue-500/10 text-blue-200 text-sm flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                   <span>Safety Briefing Conducted: <strong>{safetyBriefings.find(b => b.id === report.safetyBriefingId)?.title}</strong></span>
                 </div>
               )}

               {report.photoUrls && report.photoUrls.length > 0 && (
                 <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
                   {report.photoUrls.map((url, i) => (
                     <div key={i} className="shrink-0 w-32 h-32 rounded-sm overflow-hidden border border-white/10 snap-start">
                       <img src={url} alt="Report Photo" className="w-full h-full object-cover" />
                     </div>
                   ))}
                 </div>
               )}
            </CardContent>
          </Card>
        ))}
        {filteredReports.length === 0 && (
          <div className="py-12 text-center text-[#A0A0A0]">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No daily reports found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
