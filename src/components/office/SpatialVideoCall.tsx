"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Mic, Video, Settings, AlertCircle, Signal } from 'lucide-react';
import { Employee } from './Avatar';

interface SpatialVideoCallProps {
  nearbyEmployees: Employee[];
}

export default function SpatialVideoCall({ nearbyEmployees }: SpatialVideoCallProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (nearbyEmployees.length > 0) {
      setIsOpen(true);
    }
  }, [nearbyEmployees.length]);

  return (
    <div className="absolute top-20 right-6 z-35 flex flex-col items-end gap-3 pointer-events-none">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
      >
        <Video className={`w-4 h-4 ${nearbyEmployees.length > 0 ? 'text-success animate-pulse' : 'text-slate-400'}`} />
        <span className="text-xs font-bold">Spatial Video ({nearbyEmployees.length})</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="w-72 flex flex-col gap-3 pointer-events-none"
          >
            <AnimatePresence>
              {nearbyEmployees.map((emp) => (
                <motion.div
            key={emp.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="glass-card border border-primary/30 p-3 rounded-2xl flex flex-col gap-2 shadow-2xl pointer-events-auto bg-slate-950/85 backdrop-blur-xl"
          >
            {/* Mock Video Canvas */}
            <div className="relative aspect-video rounded-xl bg-slate-900 border border-white/5 overflow-hidden flex items-center justify-center">
              {/* Simulated Camera Feed Vibe */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/15 animate-pulse" />
              
              {/* Pulse waves to simulate video motion */}
              <div className="absolute w-28 h-28 rounded-full border border-primary/20 animate-ping opacity-30" />
              
              <div className="z-10 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-slate-800 text-white font-extrabold text-xl flex items-center justify-center border border-white/10 shadow-lg">
                  {emp.name.charAt(0)}
                </div>
              </div>

              {/* Status Overlay */}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-slate-300 flex items-center gap-1 font-medium">
                <Signal className="w-3 h-3 text-success" /> Connected
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                 <div className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-slate-300">
                    <Mic className="w-3.5 h-3.5" />
                 </div>
                 <div className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-slate-300">
                    <Video className="w-3.5 h-3.5" />
                 </div>
              </div>
            </div>

            {/* Employee Label */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white leading-none">{emp.name}</h4>
                <span className="text-[10px] text-slate-400 mt-1 block">{emp.role}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold">
                 <Volume2 className="w-3 h-3 animate-bounce" /> Spatial Active
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
            {nearbyEmployees.length === 0 && (
               <div className="glass-card border border-white/5 p-4 rounded-2xl flex items-start gap-3 bg-slate-950/70 backdrop-blur-md pointer-events-auto shadow-2xl">
                  <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                     <h4 className="text-xs font-bold text-slate-300">Spatial Video Call</h4>
                     <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Walk closer to other employees on the floor plan to automatically launch a spatial video/audio call with them.</p>
                  </div>
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
