import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Calculator, Folder, Settings, Mic, MicOff, AlertCircle, ExternalLink, Library } from 'lucide-react';
import { useLiveAgent } from '../hooks/useLiveAgent';
import { useFirestoreSync } from '../hooks/useFirestoreSync';
import { Button } from './ui';

export function Layout() {
  const navigate = useNavigate();
  useFirestoreSync();
  const { 
    isConnected, isConnecting, connect, disconnect, agentResponse, clearAgentResponse, userTranscript 
  } = useLiveAgent();

  const [showTranscript, setShowTranscript] = useState(false);

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
            to="/calculators" 
            className={({isActive}) => `flex flex-col xl:flex-row items-center xl:items-start justify-center xl:justify-start gap-1 xl:gap-4 px-2 py-3 xl:p-3 rounded-sm transition-colors text-[10px] xl:text-xs uppercase tracking-widest min-w-[64px] min-h-[44px] ${isActive ? 'text-[#D4AF37] border-t-2 xl:border-b-0 xl:border-t-0 xl:border-l-2 border-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#707070] border-t-2 border-transparent xl:border-0 hover:text-white hover:bg-white/5'}`}
          >
            <Calculator className="w-6 h-6 xl:w-4 xl:h-4" />
            <span className="mt-1 xl:mt-0">Calculators</span>
          </NavLink>
          <NavLink 
            to="/projects" 
            className={({isActive}) => `flex flex-col xl:flex-row items-center xl:items-start justify-center xl:justify-start gap-1 xl:gap-4 px-2 py-3 xl:p-3 rounded-sm transition-colors text-[10px] xl:text-xs uppercase tracking-widest min-w-[64px] min-h-[44px] ${isActive ? 'text-[#D4AF37] border-t-2 xl:border-b-0 xl:border-t-0 xl:border-l-2 border-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#707070] border-t-2 border-transparent xl:border-0 hover:text-white hover:bg-white/5'}`}
          >
            <Folder className="w-6 h-6 xl:w-4 xl:h-4" />
            <span className="mt-1 xl:mt-0">Projects</span>
          </NavLink>
          <NavLink 
            to="/knowledge" 
            className={({isActive}) => `flex flex-col xl:flex-row items-center xl:items-start justify-center xl:justify-start gap-1 xl:gap-4 px-2 py-3 xl:p-3 rounded-sm transition-colors text-[10px] xl:text-xs uppercase tracking-widest min-w-[64px] min-h-[44px] ${isActive ? 'text-[#D4AF37] border-t-2 xl:border-b-0 xl:border-t-0 xl:border-l-2 border-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#707070] border-t-2 border-transparent xl:border-0 hover:text-white hover:bg-white/5'}`}
          >
            <Library className="w-6 h-6 xl:w-4 xl:h-4" />
            <span className="mt-1 xl:mt-0">Knowledge</span>
          </NavLink>
          <NavLink 
            to="/settings" 
            className={({isActive}) => `flex flex-col xl:flex-row items-center xl:items-start justify-center xl:justify-start gap-1 xl:gap-4 px-2 py-3 xl:p-3 rounded-sm transition-colors text-[10px] xl:text-xs uppercase tracking-widest min-w-[64px] min-h-[44px] ${isActive ? 'text-[#D4AF37] border-t-2 xl:border-b-0 xl:border-t-0 xl:border-l-2 border-[#D4AF37] bg-[#D4AF37]/10' : 'text-[#707070] border-t-2 border-transparent xl:border-0 hover:text-white hover:bg-white/5'}`}
          >
            <Settings className="w-6 h-6 xl:w-4 xl:h-4" />
            <span className="mt-1 xl:mt-0">Settings</span>
          </NavLink>
        </div>
      </nav>
      
      <main className="flex-1 overflow-y-auto pb-32 md:pb-0 bg-[#0F0F0F] relative">
        <div className="p-4 md:p-12 max-w-5xl mx-auto">
          <Outlet />
        </div>
        
        {/* Voice Command FAB */}
        <div className="fixed bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] md:bottom-12 right-4 md:right-6 flex flex-col items-end gap-4 z-50">
          {(isConnected || isConnecting) && false && (
            <div className="bg-red-900/80 border border-red-500/50 text-white text-xs p-4 rounded-sm flex flex-col gap-3 shadow-lg backdrop-blur-md max-w-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">Error Occurred</span>
              </div>
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
