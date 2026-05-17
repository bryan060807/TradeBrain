import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { ALL_MODULES } from '../components/Layout';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import { useNavigate } from 'react-router-dom';
import { Settings, Pin, PinOff } from 'lucide-react';

export function MenuPage() {
  const { preferences, updatePreferences } = useAppStore();
  const navigate = useNavigate();
  
  const pinnedModules = preferences?.pinnedModules || [];

  const togglePin = (modId: string) => {
    if (pinnedModules.includes(modId)) {
      updatePreferences({ pinnedModules: pinnedModules.filter(id => id !== modId) });
    } else {
      // Limit to max 4 pins to avoid overflowing bottom nav on mobile
      if (pinnedModules.length >= 4) {
        // Remove the oldest pin and add the new one
        updatePreferences({ pinnedModules: [...pinnedModules.slice(1), modId] });
      } else {
        updatePreferences({ pinnedModules: [...pinnedModules, modId] });
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-serif italic font-light text-white">App Menu</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">Access all modules and customize your quick bar</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-sm p-4 text-xs text-[#A0A0A0] mb-6">
        <p>You can pin up to 4 modules to your quick navigation bar for faster access.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {ALL_MODULES.map(mod => {
          const isPinned = pinnedModules.includes(mod.id);
          return (
            <Card key={mod.id} className="bg-[#111] hover:bg-[#161616] transition-colors border-white/5">
              <CardContent className="p-4 flex flex-col items-center text-center gap-4">
                <div 
                  className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center cursor-pointer hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-colors"
                  onClick={() => navigate(mod.path)}
                >
                  <mod.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1 leading-tight truncate px-1">{mod.label}</h3>
                </div>
                <Button 
                  variant="outline" 
                  className={`w-full h-8 text-xs gap-2 ${isPinned ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30' : ''}`}
                  onClick={() => togglePin(mod.id)}
                >
                  {isPinned ? <><PinOff className="w-3 h-3" /> Unpin</> : <><Pin className="w-3 h-3" /> Pin to Bar</>}
                </Button>
              </CardContent>
            </Card>
          );
        })}
        
        {/* Render Settings as well, but it cannot be pinned (already handled in Layout) */}
        <Card className="bg-[#111] hover:bg-[#161616] transition-colors border-white/5">
          <CardContent className="p-4 flex flex-col items-center text-center gap-4">
            <div 
              className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center cursor-pointer hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-colors"
              onClick={() => navigate('/settings')}
            >
              <Settings className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-medium text-white mb-1 leading-tight truncate px-1">Settings</h3>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
