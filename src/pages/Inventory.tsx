import React, { useState, useRef } from 'react';
import { useAppStore, InventoryItem } from '../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent, Input, Button, Label } from '../components/ui';
import { Package, ScanLine, Wrench, Search, Plus } from 'lucide-react';
import jsQR from 'jsqr';
import { db } from '../services/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export function Inventory() {
  const { inventory, activeProjectId, user } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const [newItem, setNewItem] = useState({
    name: '',
    qrCode: '',
    location: '',
    assignedTo: '',
    status: 'In Stock' as InventoryItem['status']
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !user) return;
    
    try {
      await addDoc(collection(db, 'inventory'), {
        ...newItem,
        createdAt: Date.now()
      });
      setNewItem({ name: '', qrCode: '', location: '', assignedTo: '', status: 'In Stock' });
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          setSearchTerm(code.data);
          // or if adding: setNewItem({ ...newItem, qrCode: code.data });
        } else {
          alert('No QR code found in the image.');
        }
      }
    };
  };

  const filteredInventory = inventory.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.qrCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-serif italic font-light text-white">Inventory & Tools</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">Track materials and equipment</p>
        </div>
        <div className="flex gap-2">
           <input 
             type="file" 
             accept="image/*" 
             capture="environment" 
             className="hidden" 
             ref={fileInputRef} 
             onChange={handleScan}
           />
           <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
             <ScanLine className="w-4 h-4" /> Scan QR
           </Button>
           <Button className="gap-2" onClick={() => setIsAdding(!isAdding)}>
             <Plus className="w-4 h-4" /> Add Item
           </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="bg-[#161616]">
          <CardHeader>
            <CardTitle className="text-lg">New Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tool/Material Name</Label>
                <Input value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>QR/Barcode (Optional)</Label>
                <Input value={newItem.qrCode} onChange={e => setNewItem({...newItem, qrCode: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Assigned To</Label>
                <Input value={newItem.assignedTo} onChange={e => setNewItem({...newItem, assignedTo: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select 
                  className="w-full flex h-10 rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-2 text-sm text-[#E5E5E5] placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-transparent"
                  value={newItem.status}
                  onChange={e => setNewItem({...newItem, status: e.target.value as any})}
                >
                  <option value="In Stock">In Stock</option>
                  <option value="In Use">In Use</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                 <Button variant="ghost" type="button" onClick={() => setIsAdding(false)}>Cancel</Button>
                 <Button type="submit">Save</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
         <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
            <Input 
              className="pl-9" 
              placeholder="Search by name or QR code..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {filteredInventory.map(item => (
             <Card key={item.id} className="bg-[#111]">
               <CardContent className="p-4 flex items-start gap-4">
                 <div className="w-10 h-10 bg-[#D4AF37]/10 flex items-center justify-center rounded-sm shrink-0">
                    <Wrench className="w-5 h-5 text-[#D4AF37]" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{item.name}</h3>
                    <div className="text-xs text-[#A0A0A0] mt-1 space-y-1">
                      {item.qrCode && <div>QR: {item.qrCode}</div>}
                      <div>Location: {item.location || 'Unassigned'}</div>
                      {item.assignedTo && <div>User: {item.assignedTo}</div>}
                    </div>
                 </div>
                 <div className="shrink-0 text-right">
                    <span className={`inline-block px-2 py-1 text-[10px] uppercase tracking-widest rounded-sm ${
                      item.status === 'In Stock' ? 'bg-green-900/40 text-green-400' :
                      item.status === 'In Use' ? 'bg-blue-900/40 text-blue-400' :
                      item.status === 'Maintenance' ? 'bg-yellow-900/40 text-yellow-400' :
                      'bg-red-900/40 text-red-400'
                    }`}>
                      {item.status}
                    </span>
                 </div>
               </CardContent>
             </Card>
           ))}
           {filteredInventory.length === 0 && (
             <div className="col-span-full py-12 text-center text-[#A0A0A0]">
               <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
               <p>No inventory items found.</p>
             </div>
           )}
         </div>
      </div>
    </div>
  );
}
