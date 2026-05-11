import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import { 
  Box, Maximize2, ExternalLink, Calendar, RefreshCcw, 
  Info, Layers, Zap, Eye, SplitSquareVertical, 
  ChevronRight, Camera, HardHat, Crosshair, MessageSquare
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';

const MOCK_TOURS = [
  { 
    id: '1', 
    title: 'Site Alpha - L1 MEP Rough-in', 
    date: '2024-05-10', 
    provider: 'Polycam',
    url: 'https://poly.cam/capture/15f629c5-1ad9-4fef-9054-07527aa19e34',
    accuracy: '98.2%',
    tags: ['Mechanical', 'Electrical', 'Plumbing'],
    observations: [
      { id: 'obs1', type: 'clash', title: 'HVAC vs Fire Sprinkler', description: 'Main supply duct conflicting with head placement in Sector NW-04.', severity: 'high', sector: 'NW-04' },
      { id: 'obs2', type: 'compliance', title: 'ADA Clearance Verification', description: 'Entryway width measured at 35.8" - verify against 36" requirement.', severity: 'medium', sector: 'Entrance' }
    ]
  },
  { 
    id: '2', 
    title: 'Site Alpha - Structural Shell', 
    date: '2024-04-28', 
    provider: 'Polycam',
    url: 'https://poly.cam/capture/c49ccff4-71be-4977-9dd7-a4b3dcf49b38',
    accuracy: '99.5%',
    tags: ['Structural', 'Foundation'],
    observations: [
      { id: 'obs3', type: 'quality', title: 'Slab Finish Issue', description: 'Spalling observed near Column G-12. Grinding required.', severity: 'low', sector: 'G-12' }
    ]
  }
];

export function ProgressMapping() {
  const { activeProjectId, projects, punchLists } = useAppStore();
  const [activeTour, setActiveTour] = useState(MOCK_TOURS[0]);
  const [sidebarTab, setSidebarTab] = useState<'timeline' | 'observations'>('timeline');
  const [isComparing, setIsComparing] = useState(false);
  const [viewMode, setViewMode] = useState<'reality' | 'bim' | 'overlay'>('reality');
  
  const activeProject = projects.find(p => p.id === activeProjectId);
  const relevantPunchItems = punchLists.filter(p => p.status !== 'Completed' && p.projectId === activeProjectId);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto flex flex-col h-[calc(100vh-120px)]">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 shrink-0 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D4AF37]/10 rounded-sm">
              <Box className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h1 className="text-3xl font-serif italic font-light text-white tracking-tight">Spatial Intelligence</h1>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#707070] ml-11">
            {activeProject?.name || 'Protocol'} • Digital Twin v4.2 Internal
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white/5 p-1 rounded-sm border border-white/5">
            <button 
              onClick={() => setViewMode('reality')}
              className={`px-4 py-2 text-[10px] uppercase tracking-widest transition-all ${viewMode === 'reality' ? 'bg-[#D4AF37] text-black font-bold' : 'text-[#707070] hover:text-white'}`}
            >
              Reality
            </button>
            <button 
              onClick={() => setViewMode('bim')}
              className={`px-4 py-2 text-[10px] uppercase tracking-widest transition-all ${viewMode === 'bim' ? 'bg-[#D4AF37] text-black font-bold' : 'text-[#707070] hover:text-white'}`}
            >
              BIM Model
            </button>
            <button 
              onClick={() => setViewMode('overlay')}
              className={`px-4 py-2 text-[10px] uppercase tracking-widest transition-all ${viewMode === 'overlay' ? 'bg-[#D4AF37] text-black font-bold' : 'text-[#707070] hover:text-white'}`}
            >
              Deviation
            </button>
          </div>
          
          <Button variant="outline" className="border-[#D4AF37]/30 text-[#D4AF37] text-[10px] uppercase tracking-widest h-10 px-6 gap-2">
            <Camera className="w-3 h-3" />
            Capture Observation
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Advanced Intelligence Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 overflow-y-auto pr-2">
          
          <div className="flex border-b border-white/5">
            <button 
              onClick={() => setSidebarTab('timeline')}
              className={`flex-1 pb-3 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${sidebarTab === 'timeline' ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-[#505050] border-transparent'}`}
            >
              Timeline
            </button>
            <button 
              onClick={() => setSidebarTab('observations')}
              className={`flex-1 pb-3 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${sidebarTab === 'observations' ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-[#505050] border-transparent'}`}
            >
              Observations ({activeTour.observations.length})
            </button>
          </div>

          <AnimatePresence mode="wait">
            {sidebarTab === 'timeline' ? (
              <motion.div 
                key="timeline"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="space-y-3">
                  {MOCK_TOURS.map(tour => (
                    <motion.button
                      key={tour.id}
                      whileHover={{ x: 4 }}
                      onClick={() => setActiveTour(tour)}
                      className={`w-full text-left p-4 rounded-sm border transition-all relative overflow-hidden group ${
                        activeTour.id === tour.id 
                          ? 'bg-[#1a1a1a] border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.05)]' 
                          : 'bg-[#0F0F0F] border-white/5 hover:border-white/10'
                      }`}
                    >
                      {activeTour.id === tour.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]"></div>
                      )}
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[9px] font-bold uppercase tracking-tight ${activeTour.id === tour.id ? 'text-[#D4AF37]' : 'text-[#505050]'}`}>
                          {tour.provider} SCANNED
                        </span>
                        <span className="text-[9px] text-[#707070] font-mono">{tour.date}</span>
                      </div>
                      <h4 className="text-xs font-medium text-white mb-2 leading-relaxed">{tour.title}</h4>
                      <div className="flex gap-1 flex-wrap">
                        {tour.tags.map(tag => (
                          <span key={tag} className="text-[8px] px-1.5 py-0.5 bg-white/5 border border-white/5 text-[#A0A0A0] uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="observations"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {activeTour.observations.map(obs => (
                  <div key={obs.id} className="p-4 bg-[#111] border border-white/5 rounded-sm hover:border-[#D4AF37]/30 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-bold uppercase ${
                        obs.severity === 'high' ? 'bg-red-500/10 text-red-500' : 
                        obs.severity === 'medium' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {obs.type}
                      </span>
                      <span className="text-[9px] text-[#707070] font-mono uppercase">{obs.sector}</span>
                    </div>
                    <h4 className="text-xs font-medium text-white mb-1 group-hover:text-[#D4AF37] transition-colors">{obs.title}</h4>
                    <p className="text-[10px] text-[#707070] leading-relaxed line-clamp-2">{obs.description}</p>
                  </div>
                ))}
                
                {relevantPunchItems.length > 0 && (
                  <div className="pt-4 border-t border-white/5 mt-4">
                    <p className="text-[9px] uppercase tracking-widest text-[#505050] mb-3">Sync'd Punch List</p>
                    <div className="space-y-2">
                      {relevantPunchItems.slice(0, 3).map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-sm border border-white/5">
                           <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></div>
                           <span className="text-[10px] text-white/70 truncate">{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="bg-[#0A0A0A] border-white/5 border-t-[#D4AF37]/20 border-t-2 mt-auto">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1">
                <p className="text-[9px] uppercase tracking-widest text-[#707070]">Reality Sync Accuracy</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl text-white font-light tracking-tighter">{activeTour.accuracy}</span>
                  <span className="text-[9px] text-green-500 pb-1 font-mono">MATCH</span>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-white/5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-[#505050]">Slab Compliance</span>
                  <span className="text-green-500">Passed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#505050]">MEP Clash Check</span>
                  <span className="text-orange-500">2 Warnings</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Viewport */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className={`flex-1 rounded-sm border border-white/5 overflow-hidden relative ${viewMode === 'overlay' ? 'ring-2 ring-[#D4AF37]/20 ring-inset' : ''}`}>
            
            {/* HUD Content Overlay */}
            <div className="absolute inset-x-0 top-0 z-20 p-6 pointer-events-none flex justify-between items-start">
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-sm pointer-events-auto space-y-3">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Eye className={`w-3 h-3 ${viewMode !== 'reality' ? 'text-[#D4AF37]' : 'text-white/40'}`} />
                    <span className="text-[10px] text-white uppercase tracking-widest">{viewMode} Mode</span>
                  </div>
                  <div className="h-4 w-px bg-white/10" />
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-3 h-3 text-[#D4AF37]" />
                    <span className="text-[10px] text-white font-mono uppercase tracking-tighter">Sector {activeTour.observations[0]?.sector || 'Main'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pointer-events-auto">
                <button onClick={() => setViewMode(viewMode === 'overlay' ? 'reality' : 'overlay')} className={`p-3 rounded-sm border transition-all ${viewMode === 'overlay' ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-black/60 text-white/60 border-white/10 hover:border-white/30'}`}>
                  <Zap className="w-4 h-4" />
                </button>
                <button onClick={() => window.open(activeTour.url, '_blank')} className="p-3 bg-black/60 text-white/60 border border-white/10 rounded-sm hover:border-white/30 transition-all">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Smart Deviation UI */}
            {viewMode === 'overlay' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-30 pointer-events-none"
              >
                {/* Horizontal scan line animation */}
                <motion.div 
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-[2px] bg-[#D4AF37]/40 shadow-[0_0_15px_#D4AF37] z-40"
                />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[80%] h-[60%] border-2 border-[#D4AF37]/10 rounded-lg relative">
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37]" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]" />
                  </div>
                </div>

                <div className="absolute bottom-32 right-12 space-y-3 pointer-events-auto">
                  <div className="bg-black/90 border-l-2 border-[#D4AF37] p-4 backdrop-blur-md shadow-2xl">
                    <p className="text-[9px] uppercase tracking-widest text-[#707070] mb-1">Clash Detection Alpha</p>
                    <p className="text-xs text-white font-medium mb-3">Pipe Run Deviation L1-04</p>
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] text-[#D4AF37] font-mono">X: +14mm</span>
                       <span className="text-[10px] text-[#D4AF37] font-mono">Y: -02mm</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <iframe 
              src={activeTour.url}
              className={`w-full h-full relative z-10 border-none transition-all duration-700 ${
                viewMode === 'overlay' ? 'grayscale opacity-70 sepia-[0.2] blur-[0.5px]' : 
                viewMode === 'bim' ? 'invert hue-rotate-180 brightness-50 contrast-125' : ''
              }`}
              allowFullScreen
              allow="xr-spatial-tracking"
              title={activeTour.title}
            />

            {/* Bottom Controls Area */}
            <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-between items-end pointer-events-none">
              <div className="flex gap-2 pointer-events-auto">
                <Button variant="outline" className="bg-black/80 border-white/10 text-white backdrop-blur-md h-12 px-6 gap-3 group hover:border-[#D4AF37]/50 transition-all">
                  <Layers className="w-4 h-4 text-[#D4AF37]" />
                  <div className="text-left">
                    <p className="text-[8px] uppercase tracking-widest text-[#707070]">BIM Shell</p>
                    <p className="text-[10px] text-white">Version 2.4 Active</p>
                  </div>
                </Button>
                <Button variant="outline" className="bg-black/80 border-white/10 text-white backdrop-blur-md h-12 px-6 gap-3 group hover:border-[#D4AF37]/50 transition-all">
                  <RefreshCcw className="w-4 h-4 text-[#D4AF37]" />
                  <div className="text-left">
                    <p className="text-[8px] uppercase tracking-widest text-[#707070]">Sync State</p>
                    <p className="text-[10px] text-white">Live Data Connected</p>
                  </div>
                </Button>
              </div>

              <div className="bg-[#D4AF37] text-black px-6 py-3 rounded-sm font-bold shadow-2xl pointer-events-auto cursor-pointer hover:bg-white transition-colors flex items-center gap-3">
                <HardHat className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-widest">Mark Field Verification</span>
              </div>
            </div>
          </div>

          <div className="h-20 bg-[#0F0F0F] border border-white/5 rounded-sm flex items-center justify-between px-8">
            <div className="flex items-center gap-12">
              <div className="space-y-1">
                <p className="text-[8px] uppercase tracking-widest text-[#505050]">Current Resolution</p>
                <p className="text-xs text-white font-mono">4K Photorealistic</p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] uppercase tracking-widest text-[#505050]">Spatial Error Margin</p>
                <p className="text-xs text-[#D4AF37] font-mono">±1.2mm</p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] uppercase tracking-widest text-[#505050]">Last Synced</p>
                <p className="text-xs text-white font-mono">Just Now</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button variant="ghost" className="text-[10px] uppercase tracking-widest text-[#707070] hover:text-[#D4AF37]">
                View Full Audit History
              </Button>
              <Button size="sm" className="bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest px-6 h-10">
                Share Viewport
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

