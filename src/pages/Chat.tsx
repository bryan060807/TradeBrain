import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { db } from '../services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, Input, Button } from '../components/ui';
import { MessageSquare, Send, Users } from 'lucide-react';

type Message = {
  id: string;
  projectId: string;
  senderId: string;
  senderEmail: string;
  text: string;
  createdAt: number;
};

export function Chat() {
  const { user, projects, activeProjectId } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatProject, setChatProject] = useState(activeProjectId || 'general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
      setMessages(msgs.reverse());
    });
    
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatProject]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;
    
    try {
      await addDoc(collection(db, 'messages'), {
        projectId: chatProject,
        senderId: user.uid,
        senderEmail: user.email,
        text: newMessage.trim(),
        createdAt: Date.now()
      });
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  const filteredMessages = messages.filter(m => m.projectId === chatProject);

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-[80vh] flex flex-col">
      <div className="flex justify-between items-end border-b border-white/10 pb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-serif italic font-light text-white">Team Chat</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">Instant messaging for project collaboration</p>
        </div>
        <div className="flex gap-4 items-center">
           <select
              className="h-9 rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-1 text-xs text-[#E5E5E5] focus:ring-[#D4AF37]"
              value={chatProject}
              onChange={(e) => setChatProject(e.target.value)}
           >
              <option value="general">General (All Projects)</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
           </select>
        </div>
      </div>

      <Card className="bg-[#111] border-white/5 flex-1 flex flex-col min-h-0">
        <CardHeader className="border-b border-white/5 py-4 shrink-0">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-[#D4AF37]" /> 
            {chatProject === 'general' ? 'General Channel' : projects.find(p => p.id === chatProject)?.name || 'Project Channel'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4 overflow-hidden min-h-0 gap-4">
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {filteredMessages.map(msg => {
              const isMe = msg.senderId === user?.uid;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-[#707070] mb-1 px-1">
                    {isMe ? 'You' : msg.senderEmail.split('@')[0]} • {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <div className={`max-w-[85%] px-4 py-2 rounded-sm text-sm ${
                    isMe ? 'bg-[#D4AF37]/20 text-[#E5E5E5] border border-[#D4AF37]/20' : 'bg-[#161616] text-[#E5E5E5] border border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            {filteredMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-[#A0A0A0] opacity-50 pb-20">
                <MessageSquare className="w-12 h-12 mb-4" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSend} className="flex gap-2 shrink-0 pt-2 border-t border-white/5">
            <Input 
              placeholder="Type a message..." 
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!newMessage.trim()} className="w-12 px-0 flex justify-center">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
