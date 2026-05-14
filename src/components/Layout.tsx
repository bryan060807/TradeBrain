import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Calculator, Folder, Settings, Mic, MicOff, AlertCircle, ExternalLink, Library, Wrench, CheckSquare, FileText, Map, ClipboardCheck, ShieldCheck, WifiOff, Menu, MessageSquare, Layers, Box, Users } from 'lucide-react';
import { useLiveAgent } from '../hooks/useLiveAgent';
import { useFirestoreSync } from '../hooks/useFirestoreSync';
import { useAppStore } from '../store/useAppStore';
import { Button } from './ui';

export const ALL_MODULES = [
  { id: 'calculators', path: '/calculators', label: 'Calculators', icon: Calculator },
  { id: 'tracker', path: '/tracker', label: 'Tracker', icon: Map },
  { id: 'plan-viewer', path: '/plan-viewer', label: 'Plans', icon: Layers },
  { id: 'progress-mapping', path: '/progress-mapping', label: '3D Mapping', icon: Box },
  { id: 'chat', path: '/chat', label: 'Chat', icon: MessageSquare },
  { id: 'rfis', path: '/rfis', label: 'RFIs', icon: FileText },
  { id: 'audits', path: '/audits', label: 'Audits', icon: ClipboardCheck },
  { id: 'safety', path: '/safety-briefings', label: 'Safety', icon: ShieldCheck },
  { id: 'knowledge', path: '/knowledge', label: 'Knowledge', icon: Library },
  { id: 'inventory', path: '/inventory', label: 'Inventory', icon: Wrench },
  { id: 'punch-lists', path: '/punch-lists', label: 'Punch List', icon: CheckSquare },
  { id: 'reports', path: '/reports', label: 'Reports', icon: FileText },
  { id: 'workforce', path: '/workforce', label: 'Workforce', icon: Users },
];

export function Layout() {
  const navigate = useNavigate();
  useFirestoreSync();
  const { preferences } = useAppStore();
  const pinnedModules = preferences?.pinnedModules || [];
  
  const { 
    isConnected, isConnecting, connect, disconnect, agentResponse, clearAgentResponse, userTranscript, error, clearError 
  } = useLiveAgent();

  const [showTranscript, setShowTranscript] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-hide transcript
  useEffect(() => {
    if (userTranscript) {
      setShowTranscript(true);
      const timer = setTimeout(() => setShowTranscript(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [userTranscript]);

  const toggleListening = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-[#E5E5E5] flex-col md:flex-row overflow-hidden font-sans">
      <nav className="md:w-64 bg-[#0A0A0A]/95 backdrop-blur-md border-t md:border-t-0 border-[#D4AF37]/20 border-r border-white/10 flex flex-col justify-between fixed bottom-0 w-full md:relative md:h-full z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
        <div className="p-6 hidden md:flex items-center space-x-3 border-b border-white/10">
          <div className="w-8 h-8 rounded-sm overflow-hidden shrink-0 bg-[#0A0A0A] border border-white/10 shadow-lg">
            <img src="/TradeBrain_Logo(1).png" alt="TradeBrain Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-display font-semibold tracking-tight text-white truncate">TradeBrain</span>
        </div>
        <div className="flex xl:flex-col justify-around md:justify-start w-full md:mt-6 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:pb-6 md:p-6 gap-2 xl:gap-4 overflow-x-auto overflow-y-hidden">
          <NavLink 
            to="/" 
            className={({isActive}) => `flex flex-col xl:flex-row items-center xl:items-start justify-center xl:justify-start gap-1 xl:gap-4 px-2 py-3 xl:p-3 rounded-sm transition-colors text-[10px] xl:text-xs uppercase tracking-widest min-w-[64px] min-h-[44px] ${isActive ? 'text-[#D4AF37] border-t-2 xl:border-b-0 xl:border-t-0 xl:border-l-2 border-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#707070] border-t-2 border-transparent xl:border-0 hover:text-white hover:bg-white/5'}`}
          >
            <Home className="w-6 h-6 xl:w-4 xl:h-4" />
            <span className="mt-1 xl:mt-0">Jobsite</span>
          </NavLink>
          <NavLink 
            to="/projects" 
            className={({isActive}) => `flex flex-col xl:flex-row items-center xl:items-start justify-center xl:justify-start gap-1 xl:gap-4 px-2 py-3 xl:p-3 rounded-sm transition-colors text-[10px] xl:text-xs uppercase tracking-widest min-w-[64px] min-h-[44px] ${isActive ? 'text-[#D4AF37] border-t-2 xl:border-b-0 xl:border-t-0 xl:border-l-2 border-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#707070] border-t-2 border-transparent xl:border-0 hover:text-white hover:bg-white/5'}`}
          >
            <Folder className="w-6 h-6 xl:w-4 xl:h-4" />
            <span className="mt-1 xl:mt-0">Projects</span>
          </NavLink>
          
          {pinnedModules.map(modId => {
            const mod = ALL_MODULES.find(m => m.id === modId);
            if (!mod) return null;
            return (
              <NavLink 
                key={mod.id}
                to={mod.path} 
                className={({isActive}) => `flex flex-col xl:flex-row items-center xl:items-start justify-center xl:justify-start gap-1 xl:gap-4 px-2 py-3 xl:p-3 rounded-sm transition-colors text-[10px] xl:text-xs uppercase tracking-widest min-w-[64px] min-h-[44px] ${isActive ? 'text-[#D4AF37] border-t-2 xl:border-b-0 xl:border-t-0 xl:border-l-2 border-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#707070] border-t-2 border-transparent xl:border-0 hover:text-white hover:bg-white/5'}`}
              >
                <mod.icon className="w-6 h-6 xl:w-4 xl:h-4" />
                <span className="mt-1 xl:mt-0 xl:block whitespace-nowrap">{mod.label}</span>
              </NavLink>
            );
          })}

          <NavLink 
            to="/menu" 
            className={({isActive}) => `flex flex-col xl:flex-row items-center xl:items-start justify-center xl:justify-start gap-1 xl:gap-4 px-2 py-3 xl:p-3 rounded-sm transition-colors text-[10px] xl:text-xs uppercase tracking-widest min-w-[64px] min-h-[44px] ${isActive ? 'text-[#D4AF37] border-t-2 xl:border-b-0 xl:border-t-0 xl:border-l-2 border-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#707070] border-t-2 border-transparent xl:border-0 hover:text-white hover:bg-white/5'}`}
          >
            <Menu className="w-6 h-6 xl:w-4 xl:h-4" />
            <span className="mt-1 xl:mt-0">Menu</span>
          </NavLink>

          <NavLink 
            to="/settings" 
            className={({isActive}) => `flex flex-col xl:flex-row items-center xl:items-start justify-center xl:justify-start gap-1 xl:gap-4 px-2 py-3 xl:p-3 rounded-sm transition-colors text-[10px] xl:text-xs uppercase tracking-widest min-w-[64px] min-h-[44px] hidden md:flex ${isActive ? 'text-[#D4AF37] border-t-2 xl:border-b-0 xl:border-t-0 xl:border-l-2 border-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#707070] border-t-2 border-transparent xl:border-0 hover:text-white hover:bg-white/5'}`}
          >
            <Settings className="w-6 h-6 xl:w-4 xl:h-4" />
            <span className="mt-1 xl:mt-0">Settings</span>
          </NavLink>
        </div>
      </nav>
      
      <main className="flex-1 overflow-y-auto pb-32 md:pb-0 bg-[#0F0F0F] relative">
        {isOffline && (
          <div className="bg-yellow-900/50 border-b border-yellow-500/50 text-yellow-200 text-xs px-4 py-2 flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>You are currently offline. Working in offline mode. Changes will sync when reconnected.</span>
          </div>
        )}
        <div className="p-4 md:p-12 max-w-5xl mx-auto">
          <Outlet />
        </div>
        
        {/* Voice Command FAB */}
        <div className="fixed bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] md:bottom-12 right-4 md:right-6 flex flex-col items-end gap-4 z-50">
          {error && (
            <div className="bg-red-900/80 border border-red-500/50 text-white text-xs p-4 rounded-sm flex flex-col gap-3 shadow-lg backdrop-blur-md max-w-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-semibold">Error Starting Agent</span>
                </div>
                <button onClick={clearError} className="text-white/70 hover:text-white">&times;</button>
              </div>
              <p className="leading-relaxed text-red-200">{error}</p>
            </div>
          )}
          
          {agentResponse && (
            <div className="bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-white text-xs p-4 rounded-sm shadow-xl backdrop-blur-md max-w-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[#D4AF37] font-semibold text-[10px] uppercase tracking-wider">Assistant</span>
                <button onClick={clearAgentResponse} className="text-[#A0A0A0] hover:text-white">&times;</button>
              </div>
              <p className="leading-relaxed">{agentResponse}</p>
            </div>
          )}
          
          {showTranscript && isConnected && userTranscript && (
            <div className="bg-[#161616]/90 border border-white/10 text-white text-xs p-3 rounded-sm shadow-xl backdrop-blur-md font-mono flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <span className="text-[#D4AF37]">&gt;</span> "{userTranscript}"
            </div>
          )}
          
          <button 
            onClick={toggleListening}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border ${
              isConnecting
                ? 'bg-[#161616] border-[#D4AF37] text-[#D4AF37]'
                : isConnected 
                ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' 
                : 'bg-[#050505] border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#161616] hover:scale-105'
            }`}
            title={isConnecting ? "Connecting to Live AI..." : isConnected ? "Stop Live AI" : "Start Live AI"}
          >
            {isConnecting ? (
               <div className="w-6 h-6 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin"></div>
            ) : isConnected ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
            
            {/* Listening indicator rings */}
            {isConnected && !isConnecting && (
               <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-20"></div>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
