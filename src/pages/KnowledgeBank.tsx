import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Button, Input } from '../components/ui';
import { Upload, FileText, Trash2, Search, X, FolderSync } from 'lucide-react';

import { db } from '../services/firebase';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';

export function KnowledgeBank() {
  const { user, knowledgeBase, addKnowledgeItem, deleteKnowledgeItem, activeProjectId, projects } = useAppStore();
  const [search, setSearch] = useState('');
  
  const activeProj = projects.find(p => p.id === activeProjectId);

  const [isSaved, setIsSaved] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const textContent = await extractTextFromFile(file, content);
      
      const newId = crypto.randomUUID();
      const newItem = {
        projectId: activeProjectId,
        title: file.name,
        mimeType: file.type || 'application/octet-stream',
        content: textContent,
        createdAt: Date.now()
      };
      
      try {
        if (user) {
          const docRef = await addDoc(collection(db, 'knowledge'), newItem);
          addKnowledgeItem({ id: docRef.id, ...newItem });
        } else {
          addKnowledgeItem({ id: newId, ...newItem });
        }
      } catch (err) {
        console.error(err);
        addKnowledgeItem({ id: newId, ...newItem });
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    };
    if (file.type.startsWith('text/') || file.type === 'application/json' || file.name.endsWith('.md')) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const extractTextFromFile = async (file: File, readResult: string) => {
    // Basic text extraction representation.
    // For a real app we'd use PDF.js, Tesseract, etc.
    if (file.type.startsWith('text/') || file.name.endsWith('.md')) {
       return readResult;
    }
    // Return base64 or a placeholder if it's an image we couldn't parse in MVP.
    return `[File uploaded. Metadata: ${file.name}, ${file.type}, ${(file.size / 1024).toFixed(2)} KB]`;
  };

  const filteredItems = knowledgeBase.filter(k => 
    k.title.toLowerCase().includes(search.toLowerCase()) || 
    (k.projectId === activeProjectId)
  ); // By default show all, or prioritise active project

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif italic text-white mb-2 tracking-tight">Knowledge Bank</h1>
          <p className="text-[#A0A0A0] font-light">Upload documents, plans, and references for the AI Assistant.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3 mt-4 sm:mt-0">
           <label className="cursor-pointer">
             <input type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.md,.pdf,image/*,.json,.csv" />
             <div className="flex justify-center px-4 py-2 bg-[#D4AF37] hover:bg-[#C9A32D] text-black rounded-sm border border-[#D4AF37]/50 font-medium tracking-wide transition-colors items-center min-h-[44px]">
               <Upload className="w-4 h-4 mr-2" />
               Upload File
             </div>
           </label>
           <Button variant="outline" className="text-[#D4AF37] border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 min-h-[44px]" onClick={() => {
              setIsSaved(true);
              setTimeout(() => setIsSaved(false), 2000);
           }}>
             {isSaved ? "Saved!" : "Save"}
           </Button>
        </div>
      </div>

      <div className="bg-[#161616] border border-white/5 p-4 rounded-sm">
        <div className="flex items-center gap-2 bg-[#0A0A0A] border border-white/10 rounded-sm px-3 py-2 focus-within:border-[#D4AF37]/50 transition-colors">
          <Search className="w-4 h-4 text-[#A0A0A0]" />
          <input 
            type="text" 
            placeholder="Search knowledge bank..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-white w-full text-sm font-light placeholder:text-[#505050]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-[#505050] hover:text-[#A0A0A0]">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-[#161616] border border-white/5 rounded-sm p-4 relative group">
             <div className="absolute top-4 right-4 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={async () => {
                   try {
                     if (user && !item.id.startsWith('default-')) {
                       await deleteDoc(doc(db, 'knowledge', item.id));
                     }
                   } catch (e) { console.error(e); }
                   deleteKnowledgeItem(item.id);
               }} className="text-red-500/50 hover:text-red-500 bg-red-500/10 p-2 md:p-1.5 rounded-sm flex items-center justify-center min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0">
                 <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
               </button>
             </div>
             
             <div className="flex items-start gap-4">
               <div className="w-10 h-10 bg-[#0F0F0F] border border-white/10 flex items-center justify-center shrink-0">
                 <FileText className="w-5 h-5 text-[#D4AF37]" />
               </div>
               <div className="min-w-0 pr-8">
                 <h3 className="font-medium text-white truncate">{item.title}</h3>
                 <p className="text-xs text-[#707070] mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                 {item.projectId && (
                   <span className="inline-block mt-2 text-[10px] uppercase tracking-wider text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded-sm">
                     Project Specific
                   </span>
                 )}
               </div>
             </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-12 text-center text-[#707070] bg-[#161616] border border-white/5 rounded-sm">
             <FileText className="w-8 h-8 mx-auto mb-3 opacity-20" />
             <p className="font-light">No documents found. Upload plans or references above.</p>
          </div>
        )}
      </div>

    </div>
  );
}
