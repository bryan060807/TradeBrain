import React, { useState, useRef } from 'react';
import { useAppStore, PunchListItem } from '../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent, Input, Button, Label } from '../components/ui';
import { CheckSquare, Camera, Plus, MapPin, PenTool } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';

export function PunchLists() {
  const { punchLists, projects, activeProjectId, user } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [filterProject, setFilterProject] = useState(activeProjectId || 'all');
  
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    assignedTo: '',
    deadline: '',
    projectId: activeProjectId || '',
  });
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isMarkingUp, setIsMarkingUp] = useState(false);
  const canvasRef = useRef<ReactSketchCanvasRef>(null);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
       setPhotoPreview(URL.createObjectURL(file));
       setIsMarkingUp(true); // Automatically open markup
    }
  };

  const handleSaveMarkup = async () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await canvasRef.current.exportImage("png");
      setPhotoPreview(dataUrl);
      setIsMarkingUp(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title || !user) return;
    
    try {
      await addDoc(collection(db, 'punch_lists'), {
        ...newItem,
        photoUrl: photoPreview,
        status: 'Open',
        deadline: newItem.deadline ? new Date(newItem.deadline).getTime() : 0,
        createdAt: Date.now()
      });
      setNewItem({ title: '', description: '', assignedTo: '', deadline: '', projectId: activeProjectId || '' });
      setPhotoPreview(null);
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: string, status: PunchListItem['status']) => {
    try {
      if (user) {
        await updateDoc(doc(db, 'punch_lists', id), { status });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLists = punchLists.filter(p => filterProject === 'all' || p.projectId === filterProject);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-serif italic font-light text-white">Punch Lists</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">Track and resolve deficiencies</p>
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
             <Plus className="w-4 h-4" /> New Item
           </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="bg-[#161616]">
          <CardHeader>
            <CardTitle className="text-lg">Add Punch List Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Issue Title</Label>
                  <Input value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Project</Label>
                  <select 
                    className="w-full flex h-10 rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-2 text-sm text-[#E5E5E5] focus:ring-[#D4AF37]"
                    value={newItem.projectId}
                    onChange={e => setNewItem({...newItem, projectId: e.target.value})}
                  >
                    <option value="">No Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Input value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Assigned To</Label>
                  <Input value={newItem.assignedTo} onChange={e => setNewItem({...newItem, assignedTo: e.target.value})} placeholder="e.g. Electrician, John Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Deadline</Label>
                  <Input type="date" value={newItem.deadline} onChange={e => setNewItem({...newItem, deadline: e.target.value})} />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>Photo Documentation</Label>
                  {isMarkingUp && photoPreview ? (
                    <div className="space-y-4">
                      <div className="relative w-full h-[300px] border border-white/20 rounded-sm overflow-hidden bg-[#0A0A0A]">
                        <ReactSketchCanvas
                          ref={canvasRef}
                          strokeWidth={4}
                          strokeColor="#ff3333"
                          canvasColor="transparent"
                          backgroundImage={photoPreview}
                          preserveBackgroundImageAspectRatio="xMidYMid meet"
                          className="w-full h-full border-none!"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" onClick={handleSaveMarkup} className="gap-2">
                          <PenTool className="w-4 h-4" /> Save Markup
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setIsMarkingUp(false)}>
                          Cancel Markup
                        </Button>
                      </div>
                    </div>
                  ) : photoPreview ? (
                     <div className="relative w-48 h-48 border border-white/20 rounded-sm overflow-hidden bg-black group">
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Button type="button" variant="outline" size="sm" onClick={() => setIsMarkingUp(true)} className="gap-2">
                            <PenTool className="w-4 h-4" /> Markup
                          </Button>
                        </div>
                        <button type="button" onClick={() => setPhotoPreview(null)} className="absolute top-2 right-2 bg-black/50 p-1 rounded-sm text-white">X</button>
                     </div>
                  ) : (
                    <div className="flex items-center gap-4">
                       <label className="cursor-pointer">
                         <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoCapture} />
                         <div className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-sm transition-colors">
                           <Camera className="w-4 h-4" /> Capture Photo
                         </div>
                       </label>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/5">
                 <Button variant="ghost" type="button" onClick={() => setIsAdding(false)}>Cancel</Button>
                 <Button type="submit">Create Item</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLists.map(item => (
          <Card key={item.id} className="bg-[#111] overflow-hidden flex flex-col">
            {item.photoUrl && (
              <div className="w-full h-40 bg-black/50 border-b border-white/5 relative">
                 <img src={item.photoUrl} alt="Deficiency" className="w-full h-full object-cover opacity-80" />
                 {item.markupData && (
                   <div className="absolute inset-0 border-2 border-red-500 m-4 rounded-full opacity-50 pointer-events-none"></div>
                 )}
              </div>
            )}
            <CardContent className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                 <h3 className="font-semibold text-white leading-tight">{item.title}</h3>
                 <span className={`shrink-0 ml-2 px-2 py-0.5 text-[9px] uppercase tracking-wider rounded-sm ${
                    item.status === 'Open' ? 'bg-red-900/40 text-red-400 border border-red-500/20' : 
                    item.status === 'In Progress' ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-500/20' : 
                    'bg-green-900/40 text-green-400 border border-green-500/20'
                 }`}>
                   {item.status}
                 </span>
              </div>
              <p className="text-xs text-[#A0A0A0] mb-4 line-clamp-2">{item.description}</p>
              
              <div className="mt-auto space-y-2 text-[10px] text-[#707070] uppercase tracking-widest">
                 {item.projectId && projects.find(p => p.id === item.projectId) && (
                   <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {projects.find(p => p.id === item.projectId)?.name}</div>
                 )}
                 {item.assignedTo && <div>Assignee: <span className="text-[#E5E5E5]">{item.assignedTo}</span></div>}
                 {item.deadline > 0 && <div>Due: <span className="text-[#E5E5E5]">{new Date(item.deadline).toLocaleDateString()}</span></div>}
              </div>
              
              <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                 {item.status === 'Open' && (
                   <Button variant="outline" className="flex-1 h-8 text-[10px]" onClick={() => updateStatus(item.id, 'In Progress')}>Start</Button>
                 )}
                 {(item.status === 'Open' || item.status === 'In Progress') && (
                   <Button className="flex-1 h-8 text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 border-transparent hover:border-[#D4AF37]/50" onClick={() => updateStatus(item.id, 'Completed')}>Mark Done</Button>
                 )}
                 {item.status === 'Completed' && (
                   <div className="flex items-center justify-center w-full gap-2 text-green-400 text-xs font-medium py-1">
                     <CheckSquare className="w-4 h-4" /> Resolved
                   </div>
                 )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredLists.length === 0 && (
          <div className="col-span-full py-12 text-center text-[#A0A0A0]">
            <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No punch list items found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
