import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import { Map, Clock, FileText, CheckSquare, ClipboardCheck, PlayCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProjectDashboard() {
  const { projects, activeProjectId, setActiveProject } = useAppStore();
  const navigate = useNavigate();
  
  const activeProject = projects.find(p => p.id === activeProjectId);

  if (!activeProject) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <Map className="w-16 h-16 text-[#A0A0A0] opacity-20 mx-auto mb-6" />
        <h2 className="text-2xl font-serif text-white mb-2">No Project Selected</h2>
        <p className="text-[#A0A0A0] mb-8">Please select an active project to view the tracking dashboard, or create a new one.</p>
        <div className="flex gap-4 justify-center">
          <select 
            className="h-10 rounded-sm border border-white/20 bg-[#0A0A0A] px-4 py-2 text-sm text-[#E5E5E5] focus:ring-[#D4AF37]"
            value={activeProjectId || ''}
            onChange={(e) => setActiveProject(e.target.value)}
          >
            <option value="">Select Project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <Button onClick={() => navigate('/projects')}>View Projects</Button>
        </div>
      </div>
    );
  }

  // Mock schedule data
  const scheduleItems = [
    { phase: 'Site Prep & Excavation', status: 'Completed', dates: 'May 1 - May 10' },
    { phase: 'Foundation & Flatwork', status: 'In Progress', dates: 'May 11 - May 20' },
    { phase: 'Framing & Structural', status: 'Pending', dates: 'May 21 - Jun 15' },
    { phase: 'MEP Rough-in', status: 'Pending', dates: 'Jun 16 - Jul 10' },
  ];

  // Mock drawings data
  const drawings = [
    { title: 'A1.0 - Floor Plan', rev: 'Rev 2', date: 'May 5, 2026' },
    { title: 'S1.0 - Foundation Plan', rev: 'Rev 1', date: 'Apr 20, 2026' },
    { title: 'E1.0 - Electrical Plan', rev: 'Rev 3', date: 'May 10, 2026' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-serif italic font-light text-white">{activeProject.name} Dashboard</h1>
          <p className="text-sm text-[#A0A0A0] mt-1 flex gap-4">
            {activeProject.location && <span>📍 {activeProject.location}</span>}
            {activeProject.type && <span>🏗️ {activeProject.type}</span>}
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={() => navigate('/projects')}>Change Project</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Schedule & Status */}
        <div className="space-y-6 md:col-span-2">
          <Card className="bg-[#111]">
             <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between py-4">
               <CardTitle className="text-lg flex items-center gap-2"><Clock className="w-5 h-5 text-[#D4AF37]"/> Project Schedule</CardTitle>
               <span className="text-xs text-[#A0A0A0] uppercase tracking-widest">Est. Completion: Aug 2026</span>
             </CardHeader>
             <CardContent className="p-0">
               <div className="divide-y divide-white/5">
                 {scheduleItems.map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center p-4 hover:bg-white/5 transition-colors">
                     <div>
                       <h4 className="text-white font-medium">{item.phase}</h4>
                       <p className="text-xs text-[#A0A0A0]">{item.dates}</p>
                     </div>
                     <span className={`inline-block px-2 py-1 text-[10px] uppercase tracking-widest rounded-sm ${
                        item.status === 'Completed' ? 'bg-green-900/40 text-green-400' :
                        item.status === 'In Progress' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' :
                        'bg-white/10 text-[#A0A0A0]'
                     }`}>
                       {item.status}
                     </span>
                   </div>
                 ))}
               </div>
             </CardContent>
          </Card>

          <Card className="bg-[#111]">
             <CardHeader className="border-b border-white/5 py-4">
               <CardTitle className="text-lg flex items-center gap-2"><Map className="w-5 h-5 text-[#D4AF37]"/> Drawings & Plans</CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                 {drawings.map((dwg, idx) => (
                   <div key={idx} className="flex items-center gap-3 p-3 bg-[#161616] border border-white/10 rounded-sm cursor-pointer hover:border-[#D4AF37]/50 transition-colors">
                     <div className="w-10 h-10 bg-[#D4AF37]/10 flex items-center justify-center rounded-sm shrink-0">
                       <FileText className="w-5 h-5 text-[#D4AF37]" />
                     </div>
                     <div>
                       <h4 className="text-sm text-white font-medium leading-tight">{dwg.title}</h4>
                       <p className="text-[10px] text-[#A0A0A0] mt-1">{dwg.rev} • {dwg.date}</p>
                     </div>
                   </div>
                 ))}
                 <div className="flex flex-col items-center justify-center p-3 border border-dashed border-white/20 rounded-sm cursor-pointer hover:bg-white/5 transition-colors text-[#A0A0A0]">
                   <Plus className="w-6 h-6 mb-1" />
                   <span className="text-xs">Upload Revision</span>
                 </div>
               </div>
             </CardContent>
          </Card>
        </div>

        {/* Right Column: Quick Actions & Status */}
        <div className="space-y-6">
           <Card className="bg-[#111]">
             <CardHeader className="border-b border-white/5 py-4">
               <CardTitle className="text-lg">Site Tools</CardTitle>
             </CardHeader>
             <CardContent className="p-4 flex flex-col gap-3">
               <Button variant="outline" className="justify-start gap-3 h-12" onClick={() => navigate('/rfis')}>
                 <FileText className="w-5 h-5 text-[#D4AF37]" /> Manage RFIs
               </Button>
               <Button variant="outline" className="justify-start gap-3 h-12" onClick={() => navigate('/audits')}>
                 <ClipboardCheck className="w-5 h-5 text-[#D4AF37]" /> Site Inspections
               </Button>
               <Button variant="outline" className="justify-start gap-3 h-12" onClick={() => navigate('/punch-lists')}>
                 <CheckSquare className="w-5 h-5 text-[#D4AF37]" /> Punch List
               </Button>
               <Button variant="outline" className="justify-start gap-3 h-12" onClick={() => navigate('/safety-briefings')}>
                 <PlayCircle className="w-5 h-5 text-[#D4AF37]" /> Safety Briefings
               </Button>
             </CardContent>
           </Card>

           <Card className="bg-[#D4AF37]/10 border-[#D4AF37]/30">
             <CardContent className="p-5">
               <h3 className="text-[#D4AF37] font-semibold mb-2">Weather Condition</h3>
               <div className="text-3xl font-light text-white mb-1">72°F <span className="text-xl">☀️</span></div>
               <p className="text-xs text-[#E5E5E5] opacity-80">Clear skies. Good conditions for concrete pour.</p>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
