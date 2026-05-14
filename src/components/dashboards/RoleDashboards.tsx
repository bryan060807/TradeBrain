import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, Users, LayoutDashboard, Construction, 
  FileText, CheckSquare, Wrench, ShieldCheck, 
  ClipboardCheck, Layers, MessageSquare, AlertCircle,
  TrendingUp, Clock, MapPin, Calculator, Plus, Box
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../ui';
import { Project, PunchListItem, DailyReport, RFI, UserProfile } from '../../store/useAppStore';

interface DashboardProps {
  user: UserProfile;
  activeProject: Project | null;
  projects: Project[];
  punchLists: PunchListItem[];
  dailyReports: DailyReport[];
  rfis: RFI[];
  savedCalculations: any[];
}

export function OwnerDashboard({ user, projects, dailyReports, rfis }: DashboardProps) {
  const navigate = useNavigate();
  const openRfis = rfis.filter(r => r.status === 'Open').length;
  const recentReports = dailyReports.slice(0, 3);
  const activeProjectsCount = projects.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Stats Overview */}
      <Card className="bg-[#121212]/50 border-white/5 col-span-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] text-[#707070] uppercase tracking-widest">Active Scopes</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl text-white font-light">{activeProjectsCount}</p>
                <TrendingUp className="w-4 h-4 text-green-500/50" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-[#707070] uppercase tracking-widest">Open RFIs</p>
              <p className="text-2xl text-[#D4AF37] font-light">{openRfis}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-[#707070] uppercase tracking-widest">Staff Count</p>
              <p className="text-2xl text-white font-light">12</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-[#707070] uppercase tracking-widest">Safety Streak</p>
              <p className="text-2xl text-white font-light">145d</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity / Reports */}
      <Card className="bg-[#121212]/50 border-white/5 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#D4AF37]" /> Shift Reports
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-[10px] text-[#707070]" onClick={() => navigate('/reports')}>View All</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentReports.length > 0 ? (
            recentReports.map(report => (
              <div key={report.id} className="p-4 bg-white/5 border border-white/5 rounded-sm hover:border-[#D4AF37]/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-medium text-white">Daily Summary</h4>
                  <span className="text-[10px] text-[#707070]">{new Date(report.date).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-[#A0A0A0] line-clamp-2 font-light italic">"{report.workCompleted}"</p>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-[#505050] text-xs">No recent shift reports found.</div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-[#D4AF37]/20">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest text-[#707070]">Executive Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start gap-3 h-12 bg-white/5 hover:bg-[#D4AF37]/10 border-white/10 group" onClick={() => navigate('/projects')}>
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs">Initialize Scope</span>
          </Button>
          <Button className="w-full justify-start gap-3 h-12 bg-white/5 hover:bg-[#D4AF37]/10 border-white/10" onClick={() => navigate('/rfis')}>
            <AlertCircle className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs">Review Open RFIs</span>
          </Button>
          <Button className="w-full justify-start gap-3 h-12 bg-white/5 hover:bg-[#D4AF37]/10 border-white/10" onClick={() => navigate('/audits')}>
            <ClipboardCheck className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs">Safety Audits</span>
          </Button>
          <Button className="w-full justify-start gap-3 h-12 bg-white/5 hover:bg-[#D4AF37]/10 border-white/10" onClick={() => navigate('/progress-mapping')}>
            <Box className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs">3D Progress Mapping</span>
          </Button>
          <Button className="w-full justify-start gap-3 h-12 bg-white/5 hover:bg-[#D4AF37]/10 border-[#D4AF37]/30 group" onClick={() => navigate('/workforce')}>
            <Users className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs text-[#D4AF37] font-medium">Workforce / Roster</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function ForemanDashboard({ user, activeProject, punchLists, dailyReports }: DashboardProps) {
  const navigate = useNavigate();
  const projectPunchList = punchLists.filter(p => p.projectId === activeProject?.id);
  const openPunchItems = projectPunchList.filter(p => p.status !== 'Completed').length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Current Site Focus */}
      <Card className="bg-[#121212]/50 border-white/5 lg:col-span-2">
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-white">{activeProject?.name || 'Assigned Scope'}</CardTitle>
              <p className="text-xs text-[#707070] mt-1">{activeProject?.location || 'Awaiting deployment confirmation'}</p>
            </div>
            <div className="px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full">
              <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest">Active Objective</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 bg-white/5 rounded-sm border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <CheckSquare className="w-5 h-5 text-[#D4AF37]" />
                <h4 className="text-xs uppercase tracking-widest text-[#A0A0A0]">Final Checks</h4>
              </div>
              <div className="flex items-end gap-3">
                <p className="text-3xl text-white font-light">{projectPunchList.length - openPunchItems}/{projectPunchList.length}</p>
                <p className="text-[10px] text-[#707070] mb-2 uppercase">Checks Completed</p>
              </div>
              <div className="w-full bg-[#1a1a1a] h-1 rounded-full mt-4">
                <div 
                  className="bg-[#D4AF37] h-full rounded-full" 
                  style={{ width: `${projectPunchList.length ? ((projectPunchList.length - openPunchItems) / projectPunchList.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="p-4 bg-white/5 rounded-sm border border-white/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-[#D4AF37]" />
                  <h4 className="text-xs uppercase tracking-widest text-[#A0A0A0]">Crew Status</h4>
                </div>
                <p className="text-sm text-white font-light">12 Personnel Active</p>
              </div>
              <Button variant="outline" size="sm" className="mt-4 text-[10px] h-8 border-white/10" onClick={() => navigate('/workforce')}>Manage Crew</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Foreman Tools */}
      <Card className="bg-[#0F0F0F] border-white/10">
        <CardHeader>
          <CardTitle className="text-xs uppercase tracking-[0.2em] text-[#707070]">Foreman Protocol</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start gap-4 h-14 bg-white/5 hover:bg-white/10 border-white/10" onClick={() => navigate('/reports')}>
            <FileText className="w-4 h-4 text-[#D4AF37]" />
            <div className="text-left">
              <p className="text-xs font-medium">Shift Report</p>
              <p className="text-[9px] text-[#505050] uppercase mt-0.5">Sync Site Activities</p>
            </div>
          </Button>
          <Button className="w-full justify-start gap-4 h-14 bg-white/5 hover:bg-white/10 border-white/10" onClick={() => navigate('/punch-lists')}>
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <div className="text-left">
              <p className="text-xs font-medium">Add Finding</p>
              <p className="text-[9px] text-[#505050] uppercase mt-0.5">Quality Control Entry</p>
            </div>
          </Button>
          <Button className="w-full justify-start gap-4 h-14 bg-white/5 hover:bg-white/10 border-white/10" onClick={() => navigate('/rfis')}>
            <FileText className="w-4 h-4 text-[#D4AF37]" />
            <div className="text-left">
              <p className="text-xs font-medium">Create RFI</p>
              <p className="text-[9px] text-[#505050] uppercase mt-0.5">Information Request</p>
            </div>
          </Button>
          <Button className="w-full justify-start gap-4 h-14 bg-white/5 hover:bg-white/10 border-white/10" onClick={() => navigate('/progress-mapping')}>
            <Box className="w-4 h-4 text-[#D4AF37]" />
            <div className="text-left">
              <p className="text-xs font-medium">3D Scan</p>
              <p className="text-[9px] text-[#505050] uppercase mt-0.5">Visual Progress</p>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function LaborerDashboard({ user, activeProject, savedCalculations }: DashboardProps) {
  const navigate = useNavigate();
  const recentCalcs = savedCalculations.slice(0, 3);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Assignment & Plans */}
      <Card className="bg-[#121212]/50 border-white/5 lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
            <CardTitle className="text-lg">Daily Operation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-[#D4AF37]/10 to-transparent rounded-sm border border-[#D4AF37]/20">
            <h3 className="text-sm font-medium text-white mb-2">Primary Assignment</h3>
            <p className="text-xl text-[#E5E5E5] font-light">
              {activeProject ? `Working on ${activeProject.name}` : 'Awaiting Deployment Assignment'}
            </p>
            {activeProject && (
              <div className="mt-4 flex gap-4">
                <Button size="sm" variant="outline" className="text-[10px] border-[#D4AF37]/30 text-[#D4AF37]" onClick={() => navigate('/plan-viewer')}>
                  <Layers className="w-3 h-3 mr-2" /> View Plans
                </Button>
                <Button size="sm" variant="outline" className="text-[10px] border-white/10" onClick={() => navigate('/safety-briefings')}>
                  <ShieldCheck className="w-3 h-3 mr-2" /> Daily Briefing
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-widest text-[#707070]">Recent Verifications</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentCalcs.map(calc => (
                <div key={calc.id} className="p-3 bg-white/5 border border-white/5 rounded-sm hover:border-[#D4AF37]/30 transition-colors cursor-pointer" onClick={() => navigate(`/calculators/${calc.calculatorKey}`)}>
                  <p className="text-[10px] text-white truncate mb-1">{calc.title}</p>
                  <p className="text-[8px] uppercase tracking-widest text-[#D4AF37]">{calc.calculatorKey.replace(/([A-Z])/g, ' $1')}</p>
                </div>
              ))}
              {recentCalcs.length === 0 && (
                <div className="p-3 bg-white/5 border border-white/10 border-dashed rounded-sm flex items-center justify-center">
                  <span className="text-[9px] text-[#505050]">No Recent Calcs</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workforce Kit */}
      <Card className="bg-[#0F0F0F] border-white/10">
        <CardHeader>
          <CardTitle className="text-xs uppercase tracking-[0.2em] text-[#707070]">Utility Terminal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start gap-4 h-14 bg-white/5 hover:bg-white/10 border-white/10" onClick={() => navigate('/calculators')}>
            <Calculator className="w-4 h-4 text-[#D4AF37]" />
            <div className="text-left">
              <p className="text-xs font-medium">Calculators</p>
              <p className="text-[9px] text-[#505050] uppercase mt-0.5">Execution Precision</p>
            </div>
          </Button>
          <Button className="w-full justify-start gap-4 h-14 bg-white/5 hover:bg-white/10 border-white/10" onClick={() => navigate('/knowledge')}>
            <Construction className="w-4 h-4 text-[#D4AF37]" />
            <div className="text-left">
              <p className="text-xs font-medium">Spec Sheet</p>
              <p className="text-[9px] text-[#505050] uppercase mt-0.5">Knowledge Access</p>
            </div>
          </Button>
          <Button className="w-full justify-start gap-4 h-14 bg-white/5 hover:bg-white/10 border-white/10" onClick={() => navigate('/chat')}>
            <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
            <div className="text-left">
              <p className="text-xs font-medium">Team Sync</p>
              <p className="text-[9px] text-[#505050] uppercase mt-0.5">Comms Protocol</p>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
