import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui';
import { Image as ImageIcon, Briefcase, Users, LayoutDashboard, Construction, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChatBoard } from '../components/ChatBoard';
import { OwnerDashboard, ForemanDashboard, LaborerDashboard } from '../components/dashboards/RoleDashboards';

export function Jobsite() {
  const { 
    activeProjectId, 
    projects, 
    preferences, 
    updatePreferences, 
    user, 
    savedCalculations,
    punchLists,
    dailyReports,
    rfis
  } = useAppStore();
  const navigate = useNavigate();

  const activeProject = activeProjectId ? projects.find(p => p.id === activeProjectId) : null;

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const renderDashboard = () => {
    if (!user) return null;
    
    const props = {
      user,
      activeProject,
      projects,
      punchLists,
      dailyReports,
      rfis,
      savedCalculations
    };

    switch (user.role) {
      case 'owner':
        return <OwnerDashboard {...props} />;
      case 'foreman':
        return <ForemanDashboard {...props} />;
      case 'laborer':
      default:
        return <LaborerDashboard {...props} />;
    }
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
        <div className="absolute inset-0 bg-[#0F0F0F]/90 pointer-events-none z-0"></div>
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
          <div className="flex flex-wrap items-center gap-6 text-[#707070] text-[11px] uppercase tracking-widest font-medium">
            <div className="flex items-center gap-2">
              <Briefcase className="w-3 h-3" />
              <span className="text-white/80">{activeProject ? activeProject.name : 'No Active Project'}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCircle className="w-3 h-3" />
              <span className="text-[#D4AF37]">{user?.role} Terminal</span>
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

      {/* Dashboard Grid */}
      <div className="relative z-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {renderDashboard()}
          </div>
          <div className="lg:col-span-4">
             <ChatBoard />
          </div>
        </div>
      </div>
    </div>
  );
}
