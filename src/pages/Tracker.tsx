import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import { 
  Map as MapIcon, Crosshair, MapPin, Layers, 
  Maximize2, Plus, Minus, Move, Navigation2,
  Box, Info, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export function Tracker() {
  const { activeProjectId, projects } = useAppStore();
  const navigate = useNavigate();
  const [activeLayer, setActiveLayer] = useState<'architectural' | 'structural' | 'mep'>('architectural');
  
  const activeProject = projects.find(p => p.id === activeProjectId);

  // Mock markers for the coordination map
  const markers = [
    { id: 1, x: 35, y: 42, type: 'rfi', status: 'open', title: 'Column Offset Deviation' },
    { id: 2, x: 62, y: 28, type: 'punch', status: 'completed', title: 'Wall Finish L1' },
    { id: 3, x: 48, y: 75, type: 'capture', status: 'current', title: 'Active 3D Scan' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto flex flex-col h-[calc(100vh-120px)]">
      {/* Coordination Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-4 shrink-0 gap-4">
        <div>
          <h1 className="text-3xl font-serif italic font-light text-white tracking-tight">Spatial Coordination</h1>
          <p className="text-xs text-[#A0A0A0] mt-1 font-mono uppercase tracking-widest">
            {activeProject?.name || 'Assigned Sector'} • 2D Blueprint Overlay
          </p>
        </div>
        <div className="flex gap-2 bg-white/5 p-1 rounded-sm border border-white/5">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-[9px] uppercase tracking-widest h-8 ${activeLayer === 'architectural' ? 'bg-[#D4AF37] text-black' : 'text-[#707070]'}`}
            onClick={() => setActiveLayer('architectural')}
          >
            Arch
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-[9px] uppercase tracking-widest h-8 ${activeLayer === 'structural' ? 'bg-[#D4AF37] text-black' : 'text-[#707070]'}`}
            onClick={() => setActiveLayer('structural')}
          >
            Struct
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-[9px] uppercase tracking-widest h-8 ${activeLayer === 'mep' ? 'bg-[#D4AF37] text-black' : 'text-[#707070]'}`}
            onClick={() => setActiveLayer('mep')}
          >
            MEP
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Map Viewport */}
        <div className="flex-1 bg-[#050505] border border-white/10 rounded-sm relative overflow-hidden flex items-center justify-center">
          {/* Blueprint Pattern Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#D4AF37 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }}></div>
          
          <div className="relative w-[800px] h-[500px] bg-[#111] border border-white/5 shadow-2xl flex items-center justify-center overflow-hidden">
             {/* Simulated Blueprint Content */}
             <div className={`absolute inset-0 transition-opacity duration-500 bg-[url('https://images.unsplash.com/photo-1503387762-592dea58ef23?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center brightness-50 contrast-150 grayscale opacity-20`} />
             
             {/* Grid Lines */}
             <div className="absolute inset-0 pointer-events-none">
               {[...Array(10)].map((_, i) => <div key={`v-${i}`} className="absolute top-0 bottom-0 border-l border-white/5" style={{ left: `${i * 10}%` }} />)}
               {[...Array(10)].map((_, i) => <div key={`h-${i}`} className="absolute left-0 right-0 border-t border-white/5" style={{ top: `${i * 10}%` }} />)}
             </div>

             {/* Interactive Markers */}
             {markers.map(marker => (
               <motion.button
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 key={marker.id}
                 className="absolute z-10 p-1 group"
                 style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                 onClick={() => marker.type === 'capture' && navigate('/progress-mapping')}
               >
                 <div className={`relative transition-transform group-hover:scale-125`}>
                    {marker.type === 'capture' ? (
                      <Box className="w-5 h-5 text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
                    ) : marker.type === 'rfi' ? (
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                 </div>
                 
                 <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                    <div className="bg-black/90 border border-white/10 px-3 py-1 rounded-sm">
                      <p className="text-[9px] text-white uppercase font-bold tracking-widest">{marker.title}</p>
                    </div>
                 </div>
               </motion.button>
             ))}
          </div>

          {/* Map Controls */}
          <div className="absolute right-6 top-6 flex flex-col gap-2">
            <Button size="icon" variant="outline" className="bg-black/80 border-white/10 text-white hover:bg-white/10">
              <Plus className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="outline" className="bg-black/80 border-white/10 text-white hover:bg-white/10">
              <Minus className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="outline" className="bg-black/80 border-white/10 text-white hover:bg-white/10">
              <Navigation2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Legend */}
          <div className="absolute left-6 bottom-6 flex gap-4 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
              <span className="text-[8px] text-[#A0A0A0] uppercase tracking-widest">3D Scan Pt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-[8px] text-[#A0A0A0] uppercase tracking-widest">Conflict</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-[8px] text-[#A0A0A0] uppercase tracking-widest">Verified</span>
            </div>
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="w-full lg:w-80 space-y-6 overflow-y-auto pr-2 shrink-0">
          <Card className="bg-[#111] border-white/5 border-l-2 border-l-[#D4AF37]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-[0.2em] text-[#707070]">Active Site Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white/5 rounded-sm border border-white/5">
                 <p className="text-[10px] text-[#A0A0A0] mb-3 uppercase tracking-widest font-bold">Latest Capture Access</p>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#D4AF37]/10 flex items-center justify-center rounded-sm border border-[#D4AF37]/20">
                      <Box className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-xs text-white">L1 MEP Scanning</p>
                      <p className="text-[9px] text-[#505050]">2 hours ago • Sector NW</p>
                    </div>
                 </div>
                 <Button 
                   className="w-full mt-4 bg-white/5 hover:bg-[#D4AF37] hover:text-black transition-all border-white/10 text-[10px] uppercase tracking-widest h-9"
                   onClick={() => navigate('/progress-mapping')}
                 >
                   Jump to 3D Viewport
                 </Button>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] text-[#505050] uppercase tracking-widest">Sector Metrics</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-white/5 border border-white/5">
                    <p className="text-[8px] text-[#707070] uppercase">Progress</p>
                    <p className="text-lg text-white font-mono">82%</p>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5">
                    <p className="text-[8px] text-[#707070] uppercase">Accuracy</p>
                    <p className="text-lg text-[#D4AF37] font-mono">±4mm</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#0A0A0A] border-white/5">
            <CardHeader>
              <CardTitle className="text-[10px] uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-3 h-3 text-[#D4AF37]" /> Overlay Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[9px] text-[#707070] leading-relaxed">
                Blueprints automatically synchronized with Project Ledger. RFI locations are pinned using spatial anchoring.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-white/5 p-2 rounded-sm border border-white/5">
                  <span className="text-[9px] text-white">BIM Model Sync</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-2 rounded-sm border border-white/5">
                  <span className="text-[9px] text-white">Field Marks</span>
                  <span className="text-[9px] text-[#D4AF37] font-mono">3 Pending</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
