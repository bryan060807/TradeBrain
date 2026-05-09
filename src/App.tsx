import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Jobsite } from './pages/Jobsite';
import { CalculatorsList } from './pages/CalculatorsList';
import { StairCalculator } from './pages/StairCalculator';
import { GenericCalculator } from './pages/GenericCalculator';
import { Settings } from './pages/Settings';
import { Projects } from './pages/Projects';
import { KnowledgeBank } from './pages/KnowledgeBank';

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center text-[#A0A0A0] h-full border border-white/5 bg-[#0F0F0F] rounded-sm shadow-xl">
      <h2 className="text-4xl font-serif italic text-white mb-4 tracking-tight">{title}</h2>
      <p className="font-light tracking-wide">System Module Integration Pending</p>
      <div className="mt-8 flex space-x-2">
        <div className="w-1 h-1 rounded-full bg-[#D4AF37]"></div>
        <div className="w-1 h-1 rounded-full bg-white/20"></div>
        <div className="w-1 h-1 rounded-full bg-white/20"></div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Jobsite />} />
          <Route path="calculators" element={<CalculatorsList />} />
          <Route path="calculators/stairRiseRun" element={<StairCalculator />} />
          <Route path="calculators/:id" element={<GenericCalculator />} />
          <Route path="projects" element={<Projects />} />
          <Route path="knowledge" element={<KnowledgeBank />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

