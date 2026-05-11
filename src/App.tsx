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
import { ProjectDashboard } from './pages/ProjectDashboard';
import { Audits } from './pages/Audits';
import { SafetyBriefings } from './pages/SafetyBriefings';
import { RFIs } from './pages/RFIs';
import { MenuPage } from './pages/MenuPage';
import { Chat } from './pages/Chat';
import { PlanViewer } from './pages/PlanViewer';
import { KnowledgeBank } from './pages/KnowledgeBank';
import { Inventory } from './pages/Inventory';
import { PunchLists } from './pages/PunchLists';
import { DailyReports } from './pages/DailyReports';
import { ProgressMapping } from './pages/ProgressMapping';
import { Tracker } from './pages/Tracker';
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
            <Route path="tracker" element={<Tracker />} />
            <Route path="audits" element={<Audits />} />
            <Route path="safety-briefings" element={<SafetyBriefings />} />
            <Route path="rfis" element={<RFIs />} />
            <Route path="chat" element={<Chat />} />
            <Route path="plan-viewer" element={<PlanViewer />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="knowledge" element={<KnowledgeBank />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="punch-lists" element={<PunchLists />} />
            <Route path="reports" element={<DailyReports />} />
            <Route path="progress-mapping" element={<ProgressMapping />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

