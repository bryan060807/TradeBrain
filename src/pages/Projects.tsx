import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Button, Label } from '../components/ui';
import { useAppStore } from '../store/useAppStore';
import { Folder, Plus, Trash2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export function Projects() {
  const { projects, activeProjectId, setActiveProject, addProject, deleteProject, savedCalculations, removeCalculation, preferences } = useAppStore();
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState(preferences.defaultProjectType || 'Residential');
  const [newLocation, setNewLocation] = useState('');
  const [newScope, setNewScope] = useState('');
  const [newCrewAssigned, setNewCrewAssigned] = useState(preferences.defaultCrewAssigned || '');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    const newProject = {
      id: crypto.randomUUID(),
      name: newProjectName.trim(),
      type: newProjectType,
      location: newLocation,
      scope: newScope,
      crewAssigned: newCrewAssigned,
      createdAt: Date.now(),
    };
    
    addProject(newProject);
    setActiveProject(newProject.id);
    
    // reset form
    setNewProjectName('');
    setNewLocation('');
    setNewScope('');
    setNewProjectType(preferences.defaultProjectType || 'Residential');
    setNewCrewAssigned(preferences.defaultCrewAssigned || '');
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <div className="border-b border-white/10 pb-6 flex justify-between items-end">
        <div>
          <span className="text-[#D4AF37] text-[10px] font-semibold uppercase tracking-[0.3em]">Workspaces</span>
          <h1 className="text-4xl font-serif italic text-white mt-2 font-light">Project Scope</h1>
          <p className="text-[#A0A0A0] mt-4 font-light text-sm max-w-md">Organize documentation, restrict visibility, and isolate operational records.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle>Initialize New Scope</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[#A0A0A0] text-xs">Project Identifier</Label>
                    <Input 
                      value={newProjectName} 
                      onChange={(e) => setNewProjectName(e.target.value)} 
                      placeholder="e.g. 1422 Elm St Remodel"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[#A0A0A0] text-xs">Project Target (Address/Location)</Label>
                    <Input 
                      value={newLocation} 
                      onChange={(e) => setNewLocation(e.target.value)} 
                      placeholder="e.g. 1422 Elm St, NY"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#A0A0A0] text-xs">Category</Label>
                      <select 
                         className="flex h-11 md:h-10 w-full rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-2 text-sm text-[#E5E5E5] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] min-h-[44px] md:min-h-0"
                         value={newProjectType}
                         onChange={(e) => setNewProjectType(e.target.value)}
                       >
                         <option value="Residential">Residential</option>
                         <option value="Commercial">Commercial</option>
                         <option value="Industrial">Industrial</option>
                         <option value="Municipal">Municipal</option>
                         <option value="Other">Other</option>
                       </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#A0A0A0] text-xs">Assigned Crew</Label>
                      <Input 
                        value={newCrewAssigned} 
                        onChange={(e) => setNewCrewAssigned(e.target.value)} 
                        placeholder="e.g. framing-alpha"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#A0A0A0] text-xs">Operational Scope</Label>
                    <textarea 
                      className="flex w-full rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-2 text-sm text-[#E5E5E5] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] min-h-[80px]"
                      value={newScope} 
                      onChange={(e) => setNewScope(e.target.value)} 
                      placeholder="Broad description of the tasks..."
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2">
                  <Plus className="w-4 h-4" /> Initialize
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-[#A0A0A0] border border-white/5 bg-[#0F0F0F] rounded-sm shadow-xl">
              <Folder className="w-8 h-8 mb-4 text-[#707070] opacity-50" />
              <p className="tracking-wide font-light">No operational scopes detected.</p>
            </div>
          ) : (
            projects.map(proj => (
              <Card 
                key={proj.id} 
                className={`transition-colors ${activeProjectId === proj.id ? 'border-[#D4AF37]/50 bg-[#161616]' : 'border-white/5 hover:border-white/20'}`}
              >
                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 ${activeProjectId === proj.id ? 'bg-[#D4AF37]/10' : 'bg-white/5'}`}>
                      <Folder className={`w-5 h-5 ${activeProjectId === proj.id ? 'text-[#D4AF37]' : 'text-[#707070]'}`} />
                    </div>
                    <div>
                      <h3 className="text-white tracking-wide break-words">{proj.name}</h3>
                      <div className="text-[10px] uppercase tracking-widest text-[#707070] mt-1 space-y-1">
                        <p>Established {format(proj.createdAt, 'MMM dd, yyyy')}</p>
                        {(proj.location || proj.type) && (
                          <p className="text-[#A0A0A0]">
                            {proj.type && <span>{proj.type}</span>}
                            {proj.type && proj.location && <span className="mx-1">•</span>}
                            {proj.location && <span className="break-words">{proj.location}</span>}
                          </p>
                        )}
                        {proj.crewAssigned && (
                          <p className="text-[#808080] break-words">Crew: {proj.crewAssigned}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 border-t border-white/5 pt-4 sm:border-0 sm:pt-0 w-full sm:w-auto justify-end">
                    {activeProjectId !== proj.id && (
                      <Button variant="ghost" className="h-10 text-[10px]" onClick={() => setActiveProject(proj.id)}>
                        Engage Scope
                      </Button>
                    )}
                    {activeProjectId === proj.id && (
                      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#D4AF37] mr-4">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    )}
                    <Button variant="ghost" className="h-10 w-10 p-0 text-red-500/50 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center" onClick={() => deleteProject(proj.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
                
                {activeProjectId === proj.id && (
                  <div className="border-t border-white/5 bg-[#0F0F0F] p-6">
                    {proj.scope && (
                      <div className="mb-6">
                        <h4 className="text-[10px] uppercase tracking-widest text-[#707070] mb-2">Operational Scope</h4>
                        <p className="text-sm font-light text-[#E5E5E5] leading-relaxed bg-[#161616] p-4 rounded-sm border border-white/5">{proj.scope}</p>
                      </div>
                    )}
                    <h4 className="text-[10px] uppercase tracking-widest text-[#707070] mb-4">Saved Cryptographic Ledgers</h4>
                    {savedCalculations.filter((c: any) => c.projectId === proj.id).length === 0 ? (
                       <p className="text-xs text-[#505050] italic">No mathematical outputs bound to this scope.</p>
                    ) : (
                      <div className="space-y-2">
                        {savedCalculations.filter((c: any) => c.projectId === proj.id).map((calc: any) => (
                          <div key={calc.id} className="flex items-center justify-between p-3 border border-white/5 bg-[#161616] rounded-sm">
                             <div>
                               <p className="text-sm font-medium text-[#E5E5E5]">{calc.title}</p>
                               <p className="text-[10px] text-[#707070] font-mono mt-1">{format(calc.date, 'MMM dd yyyy - HH:mm:ss')}</p>
                             </div>
                             <Button variant="ghost" className="h-6 w-6 p-0 text-red-500/30 hover:text-red-400" onClick={() => removeCalculation(calc.id)}>
                               <Trash2 className="w-3 h-3" />
                             </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
