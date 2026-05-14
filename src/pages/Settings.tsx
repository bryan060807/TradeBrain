import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Button } from '../components/ui';
import { useAppStore } from '../store/useAppStore';
import { db } from '../services/firebase';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Users, Shield, Crown } from 'lucide-react';

export function Settings() {
  const navigate = useNavigate();
  const { preferences, updatePreferences, user } = useAppStore();
  const [isSaved, setIsSaved] = React.useState(false);
  const [roster, setRoster] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (user?.role !== 'owner') return;
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRoster(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const changeRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      if (userId === user?.uid) {
        useAppStore.getState().updateUserRole(newRole as any);
      }
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleUpdate = (key: keyof typeof preferences, value: any) => {
    updatePreferences({ [key]: value });
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-12 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[#D4AF37] text-[10px] font-semibold uppercase tracking-[0.3em]">Configuration</span>
          <h1 className="text-4xl font-serif italic text-white mt-2 font-light">System Settings</h1>
          <p className="text-[#A0A0A0] mt-4 font-light text-sm max-w-md">Manage metric thresholds, default parameters, and operational baselines.</p>
        </div>
        <Button onClick={handleSave} className="bg-[#D4AF37] hover:bg-[#C9A32D] text-black shrink-0">
          {isSaved ? "Saved!" : "Save Settings"}
        </Button>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle>Calculation Defaults</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label>Default Stud Spacing (inches)</Label>
                <Input 
                  type="number" 
                  value={preferences.defaultStudSpacingIn} 
                  onChange={(e) => handleUpdate('defaultStudSpacingIn', parseFloat(e.target.value))} 
                />
              </div>
              <div className="space-y-3">
                <Label>Default Waste Allowance (%)</Label>
                <Input 
                  type="number" 
                  value={preferences.defaultWastePercent} 
                  onChange={(e) => handleUpdate('defaultWastePercent', parseFloat(e.target.value))} 
                />
              </div>
              <div className="space-y-3">
                <Label>Stair Target Riser (inches)</Label>
                <Input 
                  type="number" step="0.125"
                  value={preferences.stairTargetRiser} 
                  onChange={(e) => handleUpdate('stairTargetRiser', parseFloat(e.target.value))} 
                />
              </div>
              <div className="space-y-3">
                <Label>Stair Target Tread (inches)</Label>
                <Input 
                  type="number" step="0.125"
                  value={preferences.stairTargetTread} 
                  onChange={(e) => handleUpdate('stairTargetTread', parseFloat(e.target.value))} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle>Project Context Defaults</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label>Default Project Type</Label>
                <select 
                   className="flex h-11 md:h-10 w-full rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-2 text-sm text-[#E5E5E5] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] min-h-[44px] md:min-h-0"
                   value={preferences.defaultProjectType || 'Residential'}
                   onChange={(e) => handleUpdate('defaultProjectType', e.target.value)}
                 >
                   <option value="Residential">Residential</option>
                   <option value="Commercial">Commercial</option>
                   <option value="Industrial">Industrial</option>
                   <option value="Municipal">Municipal</option>
                   <option value="Other">Other</option>
                 </select>
              </div>
              <div className="space-y-3">
                <Label>Default Crew Assigned</Label>
                <Input 
                  value={preferences.defaultCrewAssigned || ''} 
                  placeholder="e.g. framing-team-alpha"
                  onChange={(e) => handleUpdate('defaultCrewAssigned', e.target.value)} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle>Workforce & Roster</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-white/5 bg-[#0A0A0A] rounded-sm">
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">Company Roster Configuration</h4>
                  <p className="text-[10px] uppercase tracking-widest text-[#A0A0A0]">Add union members, update roles, edit staff details</p>
                </div>
                <Button onClick={() => navigate('/workforce')} className="text-xs shrink-0 self-start sm:self-auto min-w-[140px] bg-white/10 hover:bg-white/20 border border-white/20">
                  Manage Roster &rarr;
                </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle>Assistant Settings</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                 <Label>AI Voice</Label>
                 <select 
                   className="flex h-11 md:h-10 w-full rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-2 text-sm text-[#E5E5E5] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] min-h-[44px] md:min-h-0"
                   value={preferences.aiVoice || 'Zephyr'}
                   onChange={(e) => handleUpdate('aiVoice', e.target.value)}
                 >
                   <option value="Zephyr">Zephyr (Default)</option>
                   <option value="Puck">Puck</option>
                   <option value="Charon">Charon</option>
                   <option value="Kore">Kore</option>
                   <option value="Fenrir">Fenrir</option>
                 </select>
                 <p className="text-[#A0A0A0] text-xs">Choose the voice footprint for the AI Assistant.</p>
               </div>
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle>Account & Localization</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
             <div className="grid grid-cols-1 gap-8">
               <div className="space-y-3">
                 <Label>Preferred Units</Label>
                 <select 
                   className="flex h-11 md:h-10 w-full rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-2 text-sm text-[#E5E5E5] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] min-h-[44px] md:min-h-0"
                   value={preferences.units}
                   onChange={(e) => handleUpdate('units', e.target.value)}
                 >
                   <option value="imperial">Imperial (Inches/Feet)</option>
                   <option value="metric">Metric (Millimeters/Meters)</option>
                 </select>
               </div>
               <div className="pt-4">
                 <Button variant="outline" className="w-full text-red-400 border-red-900/50 hover:bg-red-900/10">Wipe Local Storage</Button>
               </div>
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle>Integrations & Sync</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-white/5 bg-[#0A0A0A] rounded-sm">
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">Procore Sync</h4>
                  <p className="text-[10px] uppercase tracking-widest text-[#A0A0A0]">Push RFIs, Reports, and Audits to Procore</p>
                </div>
                <Button variant="outline" className="text-xs">Connect</Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-white/5 bg-[#0A0A0A] rounded-sm">
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">QuickBooks / Payroll</h4>
                  <p className="text-[10px] uppercase tracking-widest text-[#A0A0A0]">Sync worker hours from Daily Reports</p>
                </div>
                <Button variant="outline" className="text-xs">Connect</Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-white/5 bg-[#0A0A0A] rounded-sm">
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">Primavera P6 or MS Project</h4>
                  <p className="text-[10px] uppercase tracking-widest text-[#A0A0A0]">Export schedule updates</p>
                </div>
                <Button variant="outline" className="text-xs">Connect</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#D4AF37]/30 bg-[#D4AF37]/5">
          <CardHeader className="border-b border-[#D4AF37]/10 pb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#D4AF37]" />
              <CardTitle className="text-[#D4AF37]">Viewpoint Simulator</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-xs text-[#A0A0A0] leading-relaxed">
                As an administrative user, you can simulate different role viewpoints to verify the interface and permission structures. Selecting a role below will immediately update your dashboard and access levels.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {(['owner'] as const).map((role) => (
                  <Button
                    key={role}
                    variant={user?.role === role ? 'primary' : 'outline'}
                    className={`h-16 flex flex-col gap-1 ${user?.role === role ? 'bg-[#D4AF37] text-black' : 'border-white/10'}`}
                    onClick={() => {
                       if (user) changeRole(user.uid, 'owner');
                    }}
                  >
                    <span className="text-[10px] uppercase tracking-widest font-bold">Owner</span>
                    <span className="text-[9px] opacity-60 uppercase font-light">Lead View</span>
                  </Button>
                ))}
                {(['foreman'] as const).map((role) => (
                  <Button
                    key={role}
                    variant={user?.role === role ? 'primary' : 'outline'}
                    className={`h-16 flex flex-col gap-1 ${user?.role === role ? 'bg-[#D4AF37] text-black' : 'border-white/10'}`}
                    onClick={() => {
                       if (user) changeRole(user.uid, 'foreman');
                    }}
                  >
                    <span className="text-[10px] uppercase tracking-widest font-bold">Foreman</span>
                    <span className="text-[9px] opacity-60 uppercase font-light">Execution</span>
                  </Button>
                ))}
                {(['laborer'] as const).map((role) => (
                  <Button
                    key={role}
                    variant={user?.role === role ? 'primary' : 'outline'}
                    className={`h-16 flex flex-col gap-1 ${user?.role === role ? 'bg-[#D4AF37] text-black' : 'border-white/10'}`}
                    onClick={() => {
                       if (user) changeRole(user.uid, 'laborer');
                    }}
                  >
                    <span className="text-[10px] uppercase tracking-widest font-bold">Laborer</span>
                    <span className="text-[9px] opacity-60 uppercase font-light">Workforce</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#D4AF37]" />
              <CardTitle>Company Roster & Role Assignment</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {user?.role !== 'owner' ? (
              <div className="bg-red-900/10 border border-red-900/50 rounded-sm p-6 text-center">
                <Shield className="w-8 h-8 text-red-500/80 mx-auto mb-3" />
                <p className="text-red-400 font-medium font-serif italic text-lg">Access Restricted</p>
                <p className="text-red-200/70 text-sm mt-2 max-w-sm mx-auto">
                  Role assignment and roster management is restricted to Owner accounts. Please contact an administrator to request role changes.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {roster.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-white/5 bg-[#0A0A0A] rounded-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#161616] flex items-center justify-center border border-white/10">
                        {member.role === 'owner' ? <Crown className="w-5 h-5 text-[#D4AF37]" /> : <Shield className="w-5 h-5 text-[#707070]" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{member.displayName || member.email}</p>
                        <p className="text-[10px] uppercase tracking-widest text-[#707070]">{member.role}</p>
                      </div>
                    </div>
                    
                    {member.id !== user?.uid && (
                      <select 
                        className="h-8 rounded-sm border border-white/20 bg-[#0A0A0A] px-2 text-[10px] uppercase tracking-widest text-[#E5E5E5] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        value={member.role}
                        onChange={(e) => changeRole(member.id, e.target.value)}
                      >
                        <option value="owner">Owner</option>
                        <option value="foreman">Foreman</option>
                        <option value="laborer">Laborer</option>
                      </select>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
