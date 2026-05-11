import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent, Input, Button, Label } from '../components/ui';
import { ShieldCheck, Plus, Link as LinkIcon, Users } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

export function SafetyBriefings() {
  const { safetyBriefings, projects, activeProjectId, user } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [filterProject, setFilterProject] = useState(activeProjectId || 'all');
  
  const [newBriefing, setNewBriefing] = useState({
    title: '',
    projectId: activeProjectId || '',
    date: new Date().toISOString().split('T')[0],
    content: '',
  });

  const [signatureName, setSignatureName] = useState('');
  const [signingId, setSigningId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      await addDoc(collection(db, 'safety_briefings'), {
        title: newBriefing.title,
        projectId: newBriefing.projectId,
        date: new Date(newBriefing.date).getTime(),
        content: newBriefing.content,
        signatures: [],
        createdAt: Date.now()
      });
      setNewBriefing({
        title: '',
        projectId: activeProjectId || '',
        date: new Date().toISOString().split('T')[0],
        content: '',
      });
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSign = async (e: React.FormEvent, briefingId: string, currentSignatures: any[]) => {
    e.preventDefault();
    if (!user || !signatureName.trim()) return;
    
    try {
      const newSignature = {
        name: signatureName.trim(),
        signedAt: Date.now()
      };
      
      await updateDoc(doc(db, 'safety_briefings', briefingId), {
        signatures: [...currentSignatures, newSignature]
      });
      setSignatureName('');
      setSigningId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBriefings = safetyBriefings.filter(r => filterProject === 'all' || r.projectId === filterProject)
    .sort((a, b) => b.date - a.date);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-serif italic font-light text-white">Safety Briefings</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">Distribute docs and track team sign-offs</p>
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
             <Plus className="w-4 h-4" /> New Briefing
           </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="bg-[#161616]">
          <CardHeader>
            <CardTitle className="text-lg">Schedule Safety Briefing</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Briefing Title/Topic</Label>
                  <Input value={newBriefing.title} onChange={e => setNewBriefing({...newBriefing, title: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Project</Label>
                  <select 
                    className="w-full flex h-10 rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-2 text-sm text-[#E5E5E5] focus:ring-[#D4AF37]"
                    value={newBriefing.projectId}
                    onChange={e => setNewBriefing({...newBriefing, projectId: e.target.value})}
                  >
                    <option value="">General (All Projects)</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={newBriefing.date} onChange={e => setNewBriefing({...newBriefing, date: e.target.value})} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Content or Document URL</Label>
                  <textarea 
                    className="w-full min-h-[100px] rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-2 text-sm text-[#E5E5E5] focus:ring-1 focus:ring-[#D4AF37]"
                    value={newBriefing.content} 
                    onChange={e => setNewBriefing({...newBriefing, content: e.target.value})} 
                    placeholder="Enter the safety brief content or link to a PDF..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                 <Button variant="ghost" type="button" onClick={() => setIsAdding(false)}>Cancel</Button>
                 <Button type="submit">Publish Briefing</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filteredBriefings.map(briefing => (
          <Card key={briefing.id} className="bg-[#111]">
            <CardContent className="p-6">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                      {briefing.title}
                    </h3>
                    <div className="text-xs text-[#A0A0A0] mt-1 space-y-1">
                      {briefing.projectId && projects.find(p => p.id === briefing.projectId) && (
                        <div className="text-[#D4AF37] uppercase tracking-widest">{projects.find(p => p.id === briefing.projectId)?.name}</div>
                      )}
                      <div>Date: {new Date(briefing.date).toLocaleDateString()}</div>
                    </div>
                  </div>
               </div>
               
               <div className="text-sm text-[#E5E5E5] whitespace-pre-wrap mb-6 bg-white/5 p-4 rounded-sm border border-white/5">
                 {briefing.content.startsWith('http') ? (
                   <a href={briefing.content} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#D4AF37] hover:underline">
                     <LinkIcon className="w-4 h-4" /> View Document
                   </a>
                 ) : (
                   briefing.content
                 )}
               </div>

               <div className="border-t border-white/10 pt-4">
                 <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                   <Users className="w-4 h-4" /> Team Sign-offs ({briefing.signatures?.length || 0})
                 </h4>
                 
                 {briefing.signatures && briefing.signatures.length > 0 && (
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                     {briefing.signatures.map((sig, idx) => (
                       <div key={idx} className="bg-[#0A0A0A] p-2 rounded-sm border border-white/5 flex flex-col">
                         <span className="text-sm text-white">{sig.name}</span>
                         <span className="text-[10px] text-[#A0A0A0]">{new Date(sig.signedAt).toLocaleString()}</span>
                       </div>
                     ))}
                   </div>
                 )}
                 
                 {signingId === briefing.id ? (
                   <form onSubmit={(e) => handleSign(e, briefing.id, briefing.signatures || [])} className="flex gap-2">
                     <Input 
                       placeholder="Enter your full name..." 
                       value={signatureName}
                       onChange={e => setSignatureName(e.target.value)}
                       className="max-w-[250px]"
                       required
                     />
                     <Button type="submit">Sign Complete</Button>
                     <Button type="button" variant="ghost" onClick={() => { setSigningId(null); setSignatureName(''); }}>Cancel</Button>
                   </form>
                 ) : (
                   <Button variant="outline" className="text-xs h-8" onClick={() => setSigningId(briefing.id)}>Add Signature</Button>
                 )}
               </div>
            </CardContent>
          </Card>
        ))}
        {filteredBriefings.length === 0 && (
          <div className="py-12 text-center text-[#A0A0A0]">
            <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No safety briefings found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
