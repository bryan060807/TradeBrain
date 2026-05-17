import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../services/firebase';
import { collection, query, orderBy, limit, addDoc, onSnapshot, serverTimestamp, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAppStore } from '../store/useAppStore';
import { Button, Input } from './ui';
import { Send, User as UserIcon, MessageSquare, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

type Message = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  createdAt: any;
};

export function ChatBoard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs.reverse());
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        senderId: user.uid,
        senderName: user.displayName,
        senderRole: user.role,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const handleClearChat = async () => {
    if (!user || user.role !== 'owner') return;
    
    try {
      const q = query(collection(db, 'messages'));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(document => 
        deleteDoc(doc(db, 'messages', document.id))
      );
      await Promise.all(deletePromises);
      setIsConfirmingClear(false);
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-[#161616] border border-white/5 rounded-sm overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A]">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-white">Company Comms Vector</span>
        </div>
        {user?.role === 'owner' && (
          isConfirmingClear ? (
             <div className="flex items-center gap-2">
               <span className="text-[10px] text-[#EF4444] uppercase tracking-widest">Confirm?</span>
               <Button variant="ghost" size="sm" onClick={handleClearChat} className="h-6 px-2 text-[#EF4444] hover:bg-[#EF4444]/20 border border-[#EF4444]/30">Yes</Button>
               <Button variant="ghost" size="sm" onClick={() => setIsConfirmingClear(false)} className="h-6 px-2 text-[#707070] hover:text-white">No</Button>
             </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setIsConfirmingClear(true)} className="h-8 px-2 text-[#707070] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors">
              <Trash2 className="w-4 h-4" />
            </Button>
          )
        )}
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.senderId === user?.uid ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[8px] uppercase tracking-widest text-[#707070]">{msg.senderName}</span>
              <span className="px-1 text-[7px] border border-[#D4AF37]/30 text-[#D4AF37] uppercase rounded-[2px]">{msg.senderRole}</span>
            </div>
            <div className={`max-w-[80%] p-3 rounded-sm text-sm font-light ${
              msg.senderId === user?.uid 
                ? 'bg-[#D4AF37]/10 text-white border-r-2 border-[#D4AF37]' 
                : 'bg-white/5 text-[#E5E5E5] border-l-2 border-white/20'
            }`}>
              {msg.text}
              {msg.createdAt && (
                <div className="mt-1 text-[8px] text-[#505050] text-right">
                  {format(msg.createdAt.toDate ? msg.createdAt.toDate() : new Date(), 'HH:mm')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-[#0A0A0A] border-t border-white/10 flex gap-2">
        <Input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Transmit report..."
          className="bg-[#121212] border-white/5 h-11"
        />
        <Button type="submit" className="h-11 w-11 p-0 shrink-0 bg-[#D4AF37] text-black">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
