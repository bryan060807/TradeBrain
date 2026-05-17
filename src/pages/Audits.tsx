import React, { useState } from 'react';
import { useAppStore, Audit } from '../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent, Input, Button, Label } from '../components/ui';
import { ClipboardCheck, Plus, CheckCircle, XCircle } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

export function Audits() {
  const { audits, projects, activeProjectId, user } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [filterProject, setFilterProject] = useState(activeProjectId || 'all');
  
  const [newAudit, setNewAudit] = useState({
    projectId: activeProjectId || '',
    type: 'Multipoint',
    date: new Date().toISOString().split('T')[0],
    inspector: user?.email || '',
    checklistText: "Verify all lights\\nCheck tire tread depth\\nInspect brake pads",
  });

  const auditTemplates: Record<string, string> = {
    'Custom': '',
    'OSHA 1926 Safety Union Standard': 'Verify all union workers have current required certifications on file\\nCheck plumb and square on all load-bearing walls\\nVerify header sizing and jack studs\\nInspect anchor bolts and sill plates\\nCheck fire blocking installation',
    'Union Pre-Pour Inspection': 'Verify trench depth and width meet local union code\\nCheck rebar sizing, spacing, and clearance\\nInspect vapor barrier integrity\\nVerify formwork bracing and stakes\\nCheck placement of embedded conduit/plumbing',
    'OSHA Safety Walkthrough': 'Check PPE compliance (Hardhats, Safety Glasses)\\nInspect scaffolding tags and guardrails\\nVerify GFCI protection on all temporary power\\nCheck trench shoring/sloping\\nEnsure fire extinguishers are present and charged',
    'Punch List (Final)': 'Check all interior paint for touchups\\nTest all switches, outlets, and fixtures\\nVerify HVAC register airflow\\nInspect doors for smooth operation and latching\\nCheck flooring for defects/scratches',
  };

  const handleTemplateSelect = (templateKey: string) => {
    if (auditTemplates[templateKey]) {
       setNewAudit({ ...newAudit, checklistText: auditTemplates[templateKey], type: templateKey === 'Custom' ? newAudit.type : templateKey });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const checklistArray = newAudit.checklistText.split('\n').filter(s => s.trim() !== '').map(item => ({
        item: item.trim(),
        pass: null as null | boolean,
      }));

      await addDoc(collection(db, 'audits'), {
        projectId: newAudit.projectId,
        type: newAudit.type,
        date: new Date(newAudit.date).getTime(),
        inspector: newAudit.inspector,
        status: 'Draft',
        checklist: checklistArray,
        createdAt: Date.now()
      });
      setNewAudit({
        projectId: activeProjectId || '',
        type: 'Multipoint',
        date: new Date().toISOString().split('T')[0],
        inspector: user?.email || '',
        checklistText: "Verify all lights\\nCheck tire tread depth\\nInspect brake pads",
      });
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    }
  };

  const updateChecklistItem = async (auditId: string, itemIdx: number, pass: boolean, currentList: Audit['checklist']) => {
    if (!user) return;
    const newList = [...currentList];
    newList[itemIdx] = { ...newList[itemIdx], pass };
    try {
      await updateDoc(doc(db, 'audits', auditId), {
        checklist: newList
      });
    } catch (e) {
      console.error("Error updating audit:", e);
    }
  };

  const markComplete = async (auditId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'audits', auditId), {
        status: 'Completed'
      });
    } catch (e) {
      console.error("Error completing audit:", e);
    }
  };

  const filteredAudits = audits.filter(r => filterProject === 'all' || r.projectId === filterProject)
    .sort((a, b) => b.date - a.date);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-serif italic font-light text-white">Audits</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">Conduct safety and quality inspections</p>
        </div>
        <div className="flex gap-4 items-center">
           <select
              className="h-9 rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-1 text-xs text-[#E5E5E5] focus:ring-[#D4AF37]"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
           >
              <option value="all">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
           </select>
           <Button className="gap-2" onClick={() => setIsAdding(!isAdding)}>
             <Plus className="w-4 h-4" /> New Audit
           </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="bg-[#161616]">
          <CardHeader>
            <CardTitle className="text-lg">Start New Audit</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2 flex gap-4">
                   <div className="flex-1">
                     <Label>Load Template</Label>
                     <select 
                       className="w-full flex h-10 rounded-sm border border-white/20 bg-[#161616] px-3 py-2 text-sm text-[#D4AF37] focus:ring-[#D4AF37]"
                       onChange={e => handleTemplateSelect(e.target.value)}
                     >
                       <option value="Custom">Custom / Blank</option>
                       {Object.keys(auditTemplates).filter(k => k !== 'Custom').map(k => <option key={k} value={k}>{k}</option>)}
                     </select>
                   </div>
                </div>
                <div className="space-y-2">
                  <Label>Project</Label>
                  <select 
                    className="w-full flex h-10 rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-2 text-sm text-[#E5E5E5] focus:ring-[#D4AF37]"
                    value={newAudit.projectId}
                    onChange={e => setNewAudit({...newAudit, projectId: e.target.value})}
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Inspection Type</Label>
                  <Input 
                    className="w-full flex h-10 rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-2 text-sm text-[#E5E5E5] focus:ring-[#D4AF37]"
                    value={newAudit.type}
                    onChange={e => setNewAudit({...newAudit, type: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={newAudit.date} onChange={e => setNewAudit({...newAudit, date: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Inspector</Label>
                  <Input value={newAudit.inspector} onChange={e => setNewAudit({...newAudit, inspector: e.target.value})} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Checklist Items (One per line)</Label>
                  <textarea 
                    className="w-full min-h-[100px] rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-2 text-sm text-[#E5E5E5] focus:ring-1 focus:ring-[#D4AF37]"
                    value={newAudit.checklistText.replace(/\\n/g, '\n')} 
                    onChange={e => setNewAudit({...newAudit, checklistText: e.target.value.replace(/\n/g, '\\n')})} 
                    placeholder="Enter items to check..."
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                 <Button variant="ghost" type="button" onClick={() => setIsAdding(false)}>Cancel</Button>
                 <Button type="submit">Create Audit</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filteredAudits.map(audit => (
          <Card key={audit.id} className="bg-[#111]">
            <CardContent className="p-6">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5 text-[#D4AF37]" />
                      {audit.type} Audit
                    </h3>
                    <div className="text-xs text-[#A0A0A0] mt-1 space-y-1">
                      {audit.projectId && projects.find(p => p.id === audit.projectId) && (
                        <div className="text-[#D4AF37] uppercase tracking-widest">{projects.find(p => p.id === audit.projectId)?.name}</div>
                      )}
                      <div>Date: {new Date(audit.date).toLocaleDateString()}</div>
                      <div>Inspector: {audit.inspector}</div>
                    </div>
                  </div>
                  <span className={`inline-block px-2 py-1 text-[10px] uppercase tracking-widest rounded-sm ${
                    audit.status === 'Completed' ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'
                  }`}>
                    {audit.status}
                  </span>
               </div>
               
               <div className="space-y-2 mt-6">
                 <h4 className="text-sm font-medium text-white mb-3">Checklist</h4>
                 {audit.checklist?.map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-sm border border-white/5">
                     <span className="text-sm text-[#E5E5E5]">{item.item}</span>
                     <div className="flex gap-2">
                       <Button 
                         variant="outline" 
                         className={`h-8 px-2 ${item.pass === true ? 'bg-green-900/40 border-green-500/50 text-green-400' : 'border-white/10'}`}
                         onClick={() => updateChecklistItem(audit.id, idx, true, audit.checklist)}
                         disabled={audit.status === 'Completed'}
                       >
                         <CheckCircle className="w-4 h-4" />
                       </Button>
                       <Button 
                         variant="outline" 
                         className={`h-8 px-2 ${item.pass === false ? 'bg-red-900/40 border-red-500/50 text-red-400' : 'border-white/10'}`}
                         onClick={() => updateChecklistItem(audit.id, idx, false, audit.checklist)}
                         disabled={audit.status === 'Completed'}
                       >
                         <XCircle className="w-4 h-4" />
                       </Button>
                     </div>
                   </div>
                 ))}
               </div>

               {audit.status !== 'Completed' && (
                 <div className="mt-6 flex justify-end">
                   <Button onClick={() => markComplete(audit.id)}>Mark Audit Complete</Button>
                 </div>
               )}
            </CardContent>
          </Card>
        ))}
        {filteredAudits.length === 0 && (
          <div className="py-12 text-center text-[#A0A0A0]">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No audits found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
