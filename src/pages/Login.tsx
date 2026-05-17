import React from 'react';
import { loginWithGoogle } from '../services/firebase';
import { Button } from '../components/ui';
import { ShieldCheck, HardHat, Construction } from 'lucide-react';
import { motion } from 'motion/react';

export function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-6 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-[#161616] p-10 border border-white/5 rounded-sm shadow-2xl relative z-10"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4AF37]/10 rounded-sm mb-6 border border-[#D4AF37]/20">
            <Construction className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl font-serif italic text-white tracking-tight mb-2">TradeBrain</h1>
          <p className="text-[#707070] text-sm uppercase tracking-widest font-light">Foreman's Digital Interface</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-xs text-[#A0A0A0] uppercase tracking-widest border-l-2 border-[#D4AF37] pl-4 py-1">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Secure Authentication Required</span>
            </div>
            <p className="text-[#808080] text-sm font-light leading-relaxed">
              Access the company-wide knowledge base, real-time jobsite communication, and cryptographic field audits.
            </p>
          </div>

          <Button 
            className="w-full h-14 bg-white text-black hover:bg-[#D4AF37] transition-all group relative overflow-hidden"
            onClick={loginWithGoogle}
          >
            <span className="relative z-10 flex items-center justify-center gap-3 font-bold text-sm tracking-widest uppercase">
              Authenticate via Google Secure
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
          </Button>

          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border border-[#161616] bg-[#202020] flex items-center justify-center">
                <HardHat className="w-4 h-4 text-[#707070]" />
              </div>
              <div className="w-8 h-8 rounded-full border border-[#161616] bg-[#D4AF37]/20 flex items-center justify-center">
                <Construction className="w-4 h-4 text-[#D4AF37]" />
              </div>
            </div>
            <span className="text-[10px] text-[#505050] uppercase tracking-tighter">Enterprise Construction Protocol v4.2</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
