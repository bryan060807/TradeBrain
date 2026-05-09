import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthProvider } from './components/AuthProvider';
import { Login } from './pages/Login';
import { Jobsite } from './pages/Jobsite';
import { CalculatorsList } from './pages/CalculatorsList';
import { StairCalculator } from './pages/StairCalculator';
import { GenericCalculator } from './pages/GenericCalculator';
import { Settings } from './pages/Settings';
import { Projects } from './pages/Projects';
import { KnowledgeBank } from './pages/KnowledgeBank';
import { useAppStore } from './store/useAppStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useAppStore();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
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
      </AuthProvider>
    </BrowserRouter>
  );
}

