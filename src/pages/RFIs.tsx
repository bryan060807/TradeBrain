import React, { useState } from 'react';
import { useAppStore, RFI } from '../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent, Input, Button, Label } from '../components/ui';
import { HelpCircle, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

export function RFIs() {
  const { rfis, projects, activeProjectId, user } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [filterProject, setFilterProject] = useState(activeProjectId || 'all');
  const [expandedRfiId, setExpandedRfiId] = useState<string | null>(null);
  
  const [newRfi, setNewRfi] = useState({
    projectId: activeProjectId || '',
    number: '',
    title: '',
    question: '',
    proposedSolution: '',
    priority: 'Medium' as RFI['priority'],
    assignedTo: '',
  });

  const rfiTemplates: Record<string, { title: string; question: string; proposed: string }> = {
    'Custom': { title: '', question: '', proposed: '' },
    'Structural Interference': {
      title: 'Structural Steel Interference with HVAC',
      question: 'HVAC duct routed per plan M1.0 conflicts with steel beam W12x26 at gridline B4. Beam is 6" lower than indicated on structural drawings.',
      proposed: 'Route ducting below beam and drop ceiling height locally by 8", OR split duct into two smaller sections to pass through web openings if approved by Structural Engineer.'
    },
    'Material Substitution': {
      title: 'Material Substitution Request: Interior Paint',
      question: 'Specified Sherwin Williams Promar 200 is currently on a 4-week backorder from local distributors.',
      proposed: 'Substitute with Benjamin Moore Ultra Spec 500 at no additional cost to owner.'
    },
    'Plan Discrepancy': {
      title: 'Dimension Discrepancy on A2.1',
      question: 'Wall dimension on plan A2.1 shows 14\'-6", but the associated details on A8.4 indicate the room width should be 15\'-0".',
      proposed: 'Requesting clarification from Architect on the intended dimension before framing commences.'
    }
  };

  const handleTemplateSelect = (templateKey: string) => {
    const t = rfiTemplates[templateKey];
    if (t) {
      setNewRfi(prev => ({
        ...prev,
        title: t.title,
        question: t.question,
        proposedSolution: t.proposed
      }));
    }
  };

  const [answerText, setAnswerText] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newRfi.projectId || !newRfi.title) return;
    
    try {
      await addDoc(collection(db, 'rfis'), {
        ...newRfi,
        status: 'Open',
        createdAt: Date.now()
      });
      setNewRfi({
        projectId: activeProjectId || '',
        number: '',
        title: '',
        question: '',
        proposedSolution: '',
        priority: 'Medium',
        assignedTo: '',
      });
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: string, status: RFI['status']) => {
    try {
      if (user) {
        await updateDoc(doc(db, 'rfis', id), { status });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitAnswer = async (id: string) => {
    try {
      if (user && answerText) {
        await updateDoc(doc(db, 'rfis', id), { 
          answer: answerText,
          status: 'Answered'
        });
        setAnswerText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRfis = rfis.filter(r => filterProject === 'all' || r.projectId === filterProject)
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-serif italic font-light text-white">Requests for Information</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">Submit, track, and resolve documentation queries</p>
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
             <Plus className="w-4 h-4" /> New RFI
           </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="bg-[#161616]">
          <CardHeader>
            <CardTitle className="text-lg">Draft RFI</CardTitle>
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
                       {Object.keys(rfiTemplates).filter(k => k !== 'Custom').map(k => <option key={k} value={k}>{k}</option>)}
                     </select>
                   </div>
                </div>
                <div className="space-y-2">
                  <Label>RFI # (Optional)</Label>
                  <Input value={newRfi.number} onChange={e => setNewRfi({...newRfi, number: e.target.value})} placeholder="e.g. RFI-001" />
                </div>
                <div className="space-y-2">
                  <Label>Project</Label>
                  <select 
                    className="w-full flex h-10 rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-2 text-sm text-[#E5E5E5] focus:ring-[#D4AF37]"
                    value={newRfi.projectId}
                    onChange={e => setNewRfi({...newRfi, projectId: e.target.value})}
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Title / Subject</Label>
                  <Input value={newRfi.title} onChange={e => setNewRfi({...newRfi, title: e.target.value})} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Question / Description</Label>
                  <textarea 
                    className="w-full min-h-[100px] rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-2 text-sm text-[#E5E5E5] focus:ring-1 focus:ring-[#D4AF37]"
                    value={newRfi.question} 
                    onChange={e => setNewRfi({...newRfi, question: e.target.value})} 
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Proposed Solution (Optional)</Label>
                  <textarea 
                    className="w-full min-h-[60px] rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-2 text-sm text-[#E5E5E5] focus:ring-1 focus:ring-[#D4AF37]"
                    value={newRfi.proposedSolution} 
                    onChange={e => setNewRfi({...newRfi, proposedSolution: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <select 
                    className="w-full flex h-10 rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-2 text-sm text-[#E5E5E5] focus:ring-[#D4AF37]"
                    value={newRfi.priority}
                    onChange={e => setNewRfi({...newRfi, priority: e.target.value as any})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Supplier / Tech Line</Label>
                  <Input value={newRfi.assignedTo} onChange={e => setNewRfi({...newRfi, assignedTo: e.target.value})} placeholder="e.g. NAPA, AutoZone, Master Tech" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6 border-t border-white/5 pt-4">
                 <Button variant="ghost" type="button" onClick={() => setIsAdding(false)}>Cancel</Button>
                 <Button type="submit">Submit Request</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filteredRfis.map(rfi => {
          const isExpanded = expandedRfiId === rfi.id;
          return (
            <Card key={rfi.id} className="bg-[#111]">
              <div 
                className="p-5 cursor-pointer hover:bg-white/5 transition-colors flex justify-between items-start"
                onClick={() => setExpandedRfiId(isExpanded ? null : rfi.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[#D4AF37] font-mono text-sm">{rfi.number || 'RFI'}</span>
                    <h3 className="font-semibold text-white">{rfi.title}</h3>
                  </div>
                  <div className="flex gap-4 text-xs text-[#A0A0A0]">
                    {rfi.projectId && projects.find(p => p.id === rfi.projectId) && (
                      <div>{projects.find(p => p.id === rfi.projectId)?.name}</div>
                    )}
                    <div>Opened: {new Date(rfi.createdAt).toLocaleDateString()}</div>
                    {rfi.assignedTo && <div>To: {rfi.assignedTo}</div>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`inline-block px-2 py-1 text-[9px] uppercase tracking-widest rounded-sm ${
                    rfi.status === 'Open' ? 'bg-red-900/40 text-red-400' :
                    rfi.status === 'In Review' ? 'bg-yellow-900/40 text-yellow-400' :
                    rfi.status === 'Answered' ? 'bg-blue-900/40 text-blue-400' :
                    'bg-green-900/40 text-green-400'
                  }`}>
                    {rfi.status}
                  </span>
                  {rfi.priority === 'High' && (
                    <span className="text-red-400 text-[10px] uppercase font-bold">High Priority</span>
                  )}
                </div>
                <div className="ml-4 text-[#A0A0A0]">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
              
              {isExpanded && (
                <CardContent className="px-5 pb-5 pt-0 border-t border-white/5">
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="text-xs text-[#707070] uppercase tracking-widest mb-1">Question</h4>
                      <p className="text-sm text-[#E5E5E5] whitespace-pre-wrap">{rfi.question}</p>
                    </div>
                    {rfi.proposedSolution && (
                      <div>
                        <h4 className="text-xs text-[#707070] uppercase tracking-widest mb-1">Proposed Solution</h4>
                        <p className="text-sm text-[#E5E5E5] whitespace-pre-wrap">{rfi.proposedSolution}</p>
                      </div>
                    )}
                    
                    <div className="bg-[#0A0A0A] p-4 rounded-sm border border-white/10 mt-6">
                      <h4 className="text-xs text-[#D4AF37] uppercase tracking-widest mb-2 flex items-center gap-2">
                        <HelpCircle className="w-3.5 h-3.5" /> Official Answer
                      </h4>
                      {rfi.answer ? (
                        <p className="text-sm text-white whitespace-pre-wrap">{rfi.answer}</p>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-[#A0A0A0] italic">No answer provided yet.</p>
                          <div className="flex gap-2">
                            <textarea
                              className="flex-1 min-h-[60px] rounded-sm border border-white/20 bg-[#161616] px-3 py-2 text-sm text-[#E5E5E5] focus:ring-1 focus:ring-[#D4AF37]"
                              placeholder="Provide an answer..."
                              value={answerText}
                              onChange={(e) => setAnswerText(e.target.value)}
                            />
                            <Button 
                              className="shrink-0 self-end"
                              onClick={() => submitAnswer(rfi.id)}
                            >
                              Submit Answer
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-4 justify-end border-t border-white/5">
                       {rfi.status === 'Open' && (
                         <Button variant="outline" className="h-8 text-xs" onClick={() => updateStatus(rfi.id, 'In Review')}>Mark In Review</Button>
                       )}
                       {rfi.status !== 'Closed' && (
                         <Button variant="outline" className="h-8 text-xs" onClick={() => updateStatus(rfi.id, 'Closed')}>Close Request</Button>
                       )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
        {filteredRfis.length === 0 && (
          <div className="py-12 text-center text-[#A0A0A0]">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
