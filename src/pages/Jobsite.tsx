import React, { useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../components/ui';
import { Plus, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Jobsite() {
  const { activeProjectId, projects, recentCalculators, favoriteCalculators, preferences, updatePreferences } = useAppStore();
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

  return (
    <div 
      className="space-y-12 relative -mx-4 md:-mx-12 -mt-4 md:-mt-12 p-4 md:p-12 min-h-[calc(100vh-80px)] md:min-h-screen flex flex-col"
      style={preferences.jobsiteBackground ? {
        backgroundImage: `url(${preferences.jobsiteBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } : undefined}
    >
      {preferences.jobsiteBackground && (
        <div className="absolute inset-0 bg-[#0F0F0F]/80 pointer-events-none z-0"></div>
      )}

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mt-6 md:mt-0">
        <div>
          <span className="text-[#D4AF37] text-[10px] font-semibold uppercase tracking-[0.3em]">System Status: Active</span>
          <h1 className="text-4xl font-serif italic text-white mt-2 font-light">Jobsite Overview</h1>
          <p className="text-[#A0A0A0] mt-4 font-light text-sm max-w-md break-words">
            {activeProject ? `Active Project: ${activeProject.name}` : 'No active project selected. Operations will default to personal scope.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
           <label className="cursor-pointer">
             <input type="file" className="hidden" onChange={handleBackgroundUpload} accept="image/*" />
             <div className="inline-flex w-full sm:w-auto items-center justify-center rounded-sm text-xs uppercase tracking-widest font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37] border border-white/20 text-[#E5E5E5] hover:bg-white/5 min-h-[44px] px-6 py-2 text-[#D4AF37] border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 p-2">
                 <ImageIcon className="w-4 h-4 mr-2" />
                 Set Background
             </div>
           </label>
           {preferences.jobsiteBackground && (
             <Button variant="ghost" className="text-red-500/80 hover:text-red-500 hover:bg-red-500/10 min-h-[44px] w-full sm:w-auto" onClick={() => updatePreferences({ jobsiteBackground: null })}>
                Clear
             </Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <CardTitle>Favorite Calculators</CardTitle>
              <Button variant="ghost" className="h-6 px-0 text-[10px]" onClick={() => navigate('/calculators')}>View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            {favoriteCalculators.length > 0 ? (
              <ul className="space-y-1 mt-4">
                {favoriteCalculators.map(calc => (
                  <li key={calc} className="py-3 flex justify-between items-center hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0" onClick={() => navigate(`/calculators/${calc}`)}>
                    <span className="font-light text-sm text-[#E5E5E5] capitalize tracking-wide">{calc.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <Plus className="w-4 h-4 text-[#707070]" />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-[#A0A0A0] bg-[#0A0A0A] rounded-sm border border-white/5 mt-4">
                <p className="text-xs uppercase tracking-widest">No favorites yet</p>
                <Button variant="outline" className="mt-6" onClick={() => navigate('/calculators')}>Find Calculators</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="border-b border-white/10 pb-4">
              <CardTitle>Recent Calculations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
             <div className="text-center py-8 text-[#A0A0A0] bg-[#0A0A0A] rounded-sm border border-white/5 mt-4">
                <p className="text-xs uppercase tracking-widest font-light">No recent records detected.</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
