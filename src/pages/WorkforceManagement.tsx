import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from '../components/ui';
import { useAppStore } from '../store/useAppStore';
import { db } from '../services/firebase';
import { collection, query, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { Users, Shield, Crown, Settings, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function WorkforceManagement() {
  const { user } = useAppStore();
  const navigate = useNavigate();
  const [roster, setRoster] = React.useState<any[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('laborer');

  React.useEffect(() => {
    if (user?.role !== 'owner') {
      navigate('/');
      return;
    }
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRoster(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [user, navigate]);

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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      // In a real app, this would use Cloud Functions to create an auth user
      // For this demo, we'll just create a mock user record
      await addDoc(collection(db, 'users'), {
        email: inviteEmail,
        displayName: 'Pending Invite',
        role: inviteRole,
        isPending: true
      });
      setInviteEmail('');
      setIsInviting(false);
    } catch (error) {
      console.error("Failed to invite:", error);
    }
  };

  const ownersCount = roster.filter(r => r.role === 'owner').length;
  const foremanCount = roster.filter(r => r.role === 'foreman').length;
  const laborerCount = roster.filter(r => r.role === 'laborer').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[#D4AF37] text-[10px] font-semibold uppercase tracking-[0.3em]">Administration</span>
          <h1 className="text-4xl font-serif italic text-white mt-2 font-light">Workforce Management</h1>
          <p className="text-[#A0A0A0] mt-4 font-light text-sm max-w-md">Oversee company roster, designate leadership roles, and modify internal access levels.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsInviting(!isInviting)}>
          <UserPlus className="w-4 h-4" /> Invite Employee
        </Button>
      </div>

      {isInviting && (
        <Card className="bg-[#161616] border-[#D4AF37]/30">
          <CardHeader>
             <CardTitle className="text-lg">Invite New Employee</CardTitle>
          </CardHeader>
          <CardContent>
             <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="space-y-2 flex-1">
                  <Label>Email Address</Label>
                  <Input type="email" placeholder="worker@company.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
                </div>
                <div className="space-y-2 w-full sm:w-48 shrink-0">
                  <Label>Initial Role</Label>
                  <select 
                    className="w-full flex h-10 rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-2 text-sm text-[#E5E5E5] focus:ring-[#D4AF37]"
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                  >
                    <option value="owner">Owner</option>
                    <option value="foreman">Foreman</option>
                    <option value="laborer">Laborer</option>
                  </select>
                </div>
                <Button type="submit" className="h-10">Send Invite</Button>
             </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#121212]/50 border-white/5">
          <CardContent className="p-6">
            <h3 className="text-[10px] uppercase tracking-widest text-[#707070] mb-2">Total Owners</h3>
            <p className="text-3xl font-light text-[#D4AF37]">{ownersCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#121212]/50 border-white/5">
          <CardContent className="p-6">
            <h3 className="text-[10px] uppercase tracking-widest text-[#707070] mb-2">Total Foremen</h3>
            <p className="text-3xl font-light text-white">{foremanCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#121212]/50 border-white/5">
          <CardContent className="p-6">
            <h3 className="text-[10px] uppercase tracking-widest text-[#707070] mb-2">Total Laborers</h3>
            <p className="text-3xl font-light text-white">{laborerCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D4AF37]" />
            <CardTitle>Company Roster</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {roster.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border border-white/5 bg-[#0A0A0A] rounded-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#161616] flex items-center justify-center border border-white/10">
                    {member.role === 'owner' ? <Crown className="w-6 h-6 text-[#D4AF37]" /> : <Shield className="w-6 h-6 text-[#707070]" />}
                  </div>
                  <div>
                    <p className="text-base font-medium text-white">{member.displayName || member.email}</p>
                    <p className="text-xs uppercase tracking-widest text-[#707070] mt-1">Current Role: <span className="text-[#D4AF37]">{member.role}</span></p>
                  </div>
                </div>
                
                {member.id !== user?.uid ? (
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] uppercase text-[#505050]">Change Role:</span>
                    <select 
                      className="h-10 rounded-sm border border-white/20 bg-[#111] px-4 text-xs uppercase tracking-widest text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37] min-w-[140px]"
                      value={member.role}
                      onChange={(e) => changeRole(member.id, e.target.value)}
                    >
                      <option value="owner">Owner</option>
                      <option value="foreman">Foreman</option>
                      <option value="laborer">Laborer</option>
                    </select>
                  </div>
                ) : (
                  <span className="text-[10px] uppercase tracking-widest text-[#505050]">Current User (You)</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
