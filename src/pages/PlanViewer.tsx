import React, { useRef, useState } from 'react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import { PenTool, Eraser, Undo, Redo, Download, ZoomIn, ZoomOut, Save } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

import { mockBlueprints } from '../lib/mockBlueprints';

export function PlanViewer() {
  const [activePlan, setActivePlan] = useState(mockBlueprints[0]);
  const [localImage, setLocalImage] = useState<string | null>(null);
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [isEraser, setIsEraser] = useState(false);
  const [scale, setScale] = useState(1);

  const handleClear = () => {
    canvasRef.current?.clearCanvas();
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleRedo = () => {
    canvasRef.current?.redo();
  };

  const handleEraser = () => {
    canvasRef.current?.eraseMode(!isEraser);
    setIsEraser(!isEraser);
  };

  const currentImageUrl = localImage || activePlan.url;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       const url = URL.createObjectURL(e.target.files[0]);
       setLocalImage(url);
    }
  };

  const handlePlanSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalImage(null);
    setActivePlan(mockBlueprints.find(p => p.id === e.target.value) || mockBlueprints[0]);
  };

  const handleSave = async () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await canvasRef.current.exportImage("png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `markup.png`;
      a.click();
    } catch (e) {
      console.error(e);
      alert("Could not export image. Please try uploading a local file or checking browser permissions.");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto flex flex-col h-[85vh]">
      <div className="flex justify-between items-end border-b border-white/10 pb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-serif italic font-light text-white">Digital Plan View & Markup</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">View blueprints, upload plans, and annotate drawings</p>
        </div>
        <div className="flex gap-4 items-center">
            <div className="relative">
              <input type="file" title="Upload" id="plan-upload" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <label htmlFor="plan-upload" className="cursor-pointer flex items-center h-9 rounded-sm border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 text-xs text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors">
                Upload Plan
              </label>
            </div>
           <select
              className="h-9 rounded-sm border border-white/20 bg-[#0A0A0A] px-3 py-1 text-xs text-[#E5E5E5] focus:ring-[#D4AF37] max-w-[200px] truncate"
              value={activePlan.id}
              onChange={handlePlanSelect}
           >
              {mockBlueprints.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
           </select>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        <Card className="w-full md:w-16 flex md:flex-col gap-2 p-2 bg-[#111] border-white/5 shrink-0 overflow-x-auto md:overflow-visible">
          <Button variant={isEraser ? "default" : "ghost"} className="h-12 md:w-full px-0 justify-center" onClick={handleEraser} title="Toggle Eraser">
            <Eraser className="w-5 h-5" />
          </Button>
          <Button variant="ghost" className="h-12 md:w-full px-0 justify-center" onClick={() => { setIsEraser(false); canvasRef.current?.eraseMode(false); }} title="Pen">
            <PenTool className="w-5 h-5 text-[#D4AF37]" />
          </Button>
          <div className="md:h-px w-px md:w-full bg-white/10 my-2 shrink-0"></div>
          <Button variant="ghost" className="h-12 md:w-full px-0 justify-center" onClick={handleUndo} title="Undo">
            <Undo className="w-5 h-5" />
          </Button>
          <Button variant="ghost" className="h-12 md:w-full px-0 justify-center" onClick={handleRedo} title="Redo">
            <Redo className="w-5 h-5" />
          </Button>
          <div className="md:h-px w-px md:w-full bg-white/10 my-2 shrink-0"></div>
          <Button variant="ghost" className="h-12 md:w-full px-0 justify-center" onClick={() => setScale(s => Math.min(s + 0.25, 3))} title="Zoom In">
            <ZoomIn className="w-5 h-5" />
          </Button>
          <Button variant="ghost" className="h-12 md:w-full px-0 justify-center" onClick={() => setScale(s => Math.max(s - 0.25, 0.5))} title="Zoom Out">
            <ZoomOut className="w-5 h-5" />
          </Button>
          <div className="flex-1 hidden md:block"></div>
          <Button variant="outline" className="h-12 md:w-full px-0 justify-center" onClick={handleSave} title="Save Markup">
            <Save className="w-5 h-5 text-[#D4AF37]" />
          </Button>
        </Card>

        <div className="flex-1 bg-[#1A1A1A] rounded-sm border border-white/5 overflow-hidden relative group">
          <div className="absolute top-4 left-4 z-10 bg-black/80 px-3 py-1.5 rounded-sm backdrop-blur-sm border border-white/10 text-xs tracking-widest text-[#D4AF37] shadow-lg">
            {activePlan.title} • ZOOM: {Math.round(scale * 100)}%
          </div>
          
          <div className="w-full h-full overflow-auto bg-[#0a0a0a]" style={{ cursor: isEraser ? 'cell' : 'crosshair' }}>
             <div 
               style={{ 
                 width: `${100 * scale}%`, 
                 height: `${100 * scale}%`, 
                 minWidth: '100%', 
                 minHeight: '100%',
                 transformOrigin: 'top left',
                 transition: 'width 0.2s, height 0.2s'
               }}
             >
               <ReactSketchCanvas
                  ref={canvasRef}
                  strokeWidth={4}
                  strokeColor="#ff3333"
                  canvasColor="transparent"
                  backgroundImage={currentImageUrl}
                  preserveBackgroundImageAspectRatio="xMidYMid meet"
                  className="w-full h-full border-none!"
               />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
