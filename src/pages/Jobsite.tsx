import React, { useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../components/ui';
import { Plus, Image as ImageIcon, Briefcase, Users, LayoutDashboard, Construction } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChatBoard } from '../components/ChatBoard';

export function Jobsite() {
  const { activeProjectId, projects, recentCalculators, favoriteCalculators, preferences, updatePreferences, user, savedCalculations } = useAppStore();
  const navigate = useNavigate();

  const activeProject = activeProjectId ? projects.find(p => p.id === activeProjectId) : null;
  const recentAudits = savedCalculations.slice(0, 3);

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... same background logic ...
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxWidth = window.innerWidth;
        const maxHeight = window.innerHeight;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          updatePreferences({ jobsiteBackground: dataUrl });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div 
      className="space-y-8 relative -mx-4 md:-mx-12 -mt-4 md:-mt-12 p-4 md:p-12 min-h-[calc(100vh-80px)] md:min-h-screen flex flex-col"
      style={preferences.jobsiteBackground ? {
        backgroundImage: `url(${preferences.jobsiteBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } : undefined}
    >
      {preferences.jobsiteBackground && (
        <div className="absolute inset-0 bg-[#0F0F0F]/85 pointer-events-none z-0"></div>
      )}

      {/* Header Section */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-8 mt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></div>
             <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em]">Node Established • Site Alpha</span>
          </div>
          <h1 className="text-5xl font-serif text-white font-light tracking-tight">
            Greetings, <span className="italic">{user?.displayName?.split(' ')[0]}</span>
          </h1>
          <div className="flex items-center gap-6 text-[#707070] text-[11px] uppercase tracking-widest font-medium">
            <div className="flex items-center gap-2">
              <Briefcase className="w-3 h-3" />
              <span>{activeProject ? activeProject.name : 'No Active Project'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3" />
              <span>{user?.role} Access</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <label className="cursor-pointer">
             <input type="file" className="hidden" onChange={handleBackgroundUpload} accept="image/*" />
             <div className="inline-flex items-center justify-center rounded-sm text-[10px] uppercase tracking-[0.2em] font-bold transition-all border border-white/10 bg-white/5 hover:bg-white/10 h-11 px-6 text-white/70">
                 <ImageIcon className="w-3 h-3 mr-2" />
                 Environmental Overlay
             </div>
           </label>
           <Button variant="primary" className="h-11 px-8 text-[10px]" onClick={() => navigate('/calculators')}>
             Initiate Calculation
           </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: Communications & Projects */}
        <div className="lg:col-span-8 space-y-8">
          <ChatBoard />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card className="bg-[#121212]/50 backdrop-blur-sm border-white/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-[#707070] mb-2">
                    <LayoutDashboard className="w-3 h-3" />
                    <span className="text-[9px] uppercase tracking-widest">Active Operations</span>
                  </div>
                  <CardTitle className="text-lg">Project Scope</CardTitle>
                </CardHeader>
                <CardContent>
                  {activeProject ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] uppercase text-[#505050] tracking-tighter mb-1">Status</p>
                        <p className="text-sm text-white font-light">{activeProject.type || 'Standard Construction'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-[#505050] tracking-tighter mb-1">Location</p>
                        <p className="text-sm text-[#A0A0A0] font-light">{activeProject.location || 'Site Unspecified'}</p>
                      </div>
                      <Button variant="outline" className="w-full text-[10px] h-9 border-[#D4AF37]/30 text-[#D4AF37]" onClick={() => navigate('/projects')}>
                        Manage Projects
                      </Button>
                    </div>
                  ) : (
                    <div className="py-6 text-center space-y-4">
                      <p className="text-xs text-[#505050] font-light">No active project identified.</p>
                      <Button variant="outline" className="w-full text-[10px] h-9 border-white/10" onClick={() => navigate('/projects')}>
                        Select Assignment
                      </Button>
                    </div>
                  )}
                </CardContent>
             </Card>

             <Card className="bg-[#121212]/50 backdrop-blur-sm border-white/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-[#707070] mb-2">
                    <Plus className="w-3 h-3" />
                    <span className="text-[9px] uppercase tracking-widest">Mathematical Audits</span>
                  </div>
                  <CardTitle className="text-lg">Recent Ledger Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentAudits.map(calc => (
                      <div key={calc.id} className="p-3 bg-white/5 border border-white/5 rounded-sm hover:border-[#D4AF37]/30 transition-colors cursor-pointer group" onClick={() => navigate(`/calculators/${calc.calculatorKey}`)}>
                        <div className="flex justify-between items-start">
                          <p className="text-xs text-white truncate max-w-[150px]">{calc.title}</p>
                          <span className="text-[9px] text-[#707070] font-mono whitespace-nowrap ml-2">
                            {new Date(calc.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[9px] uppercase tracking-widest text-[#D4AF37] mt-1">{calc.calculatorKey.replace(/([A-Z])/g, ' $1')}</p>
                      </div>
                    ))}
                    {recentAudits.length === 0 && (
                      <div className="py-8 text-center text-[#505050] text-[10px] uppercase">No recent entries</div>
                    )}
                  </div>
                  <Button variant="ghost" className="w-full mt-4 text-[10px] h-9 text-[#707070]" onClick={() => navigate('/calculators')}>
                    View All Calculators
                  </Button>
                </CardContent>
             </Card>
          </div>
        </div>

        {/* Right Column: AI Assistant Summary */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="h-full bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border-[#D4AF37]/20 border-l-2">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-sm bg-[#D4AF37] flex items-center justify-center">
                    <Construction className="w-3 h-3 text-black" />
                  </div>
                  <CardTitle className="text-sm">TradeBrain Intelligence</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-black/40 p-4 rounded-sm border border-white/5">
                  <p className="text-xs text-[#D4AF37] leading-relaxed italic font-light">
                    "Welcome back, Foreman. I have synchronized with the latest site plans. We are currently tracking multiple active scopes. How shall we proceed with the current measurement verification?"
                  </p>
                </div>
                
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-widest text-[#707070]">Suggested Vectors</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-sm cursor-pointer transition-colors border-l border-transparent hover:border-[#D4AF37]" onClick={() => navigate('/knowledge')}>
                       <span className="text-xs text-[#A0A0A0]">Audit Knowledge Base</span>
                    </li>
                    <li className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-sm cursor-pointer transition-colors border-l border-transparent hover:border-[#D4AF37]" onClick={() => navigate('/calculators/stairRiseRun')}>
                       <span className="text-xs text-[#A0A0A0]">Verify Stair Compliance</span>
                    </li>
                    <li className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-sm cursor-pointer transition-colors border-l border-transparent hover:border-[#D4AF37]" onClick={() => navigate('/projects')}>
                       <span className="text-xs text-[#A0A0A0]">Crew Deployment Review</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 border-t border-white/5">
                   <Button variant="primary" className="w-full bg-[#D4AF37] text-black hover:bg-white transition-all" onClick={() => document.getElementById('ai-trigger-btn')?.click()}>
                     Execute Assistant Query
                   </Button>
                </div>
              </CardContent>
           </Card>
        </div>

      </div>
    </div>
  );
}
