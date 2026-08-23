"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Phone, User, Mic, MicOff, Video, VideoOff, Sparkles } from 'lucide-react';
import clsx from 'clsx';

type Status = 'online' | 'busy' | 'meeting' | 'offline';

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  status: Status;
  x: number;
  y: number;
  avatarUrl?: string;
  videoUrl?: string;
  isVideoOn?: boolean;
  isMuted?: boolean;
  isHidden?: boolean;
  isPrivate?: boolean;
  profileImage?: string;
}

const statusColors = {
  online: 'bg-emerald-500 shadow-[0_0_8px_#10b981]',
  busy: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]',
  meeting: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]',
  offline: 'bg-slate-500'
};

const departmentStyles: Record<string, { gradient: string; accent: string; icon: string }> = {
  'Management': { gradient: 'from-amber-500 to-yellow-600', accent: 'border-amber-400', icon: '👑' },
  'Engineering': { gradient: 'from-cyan-500 to-blue-600', accent: 'border-cyan-400', icon: '💻' },
  'Product': { gradient: 'from-purple-500 to-indigo-600', accent: 'border-purple-400', icon: '🎨' },
  'HR': { gradient: 'from-emerald-500 to-teal-600', accent: 'border-emerald-400', icon: '👥' },
  'Sales': { gradient: 'from-rose-500 to-pink-600', accent: 'border-rose-400', icon: '📊' },
  'Marketing': { gradient: 'from-orange-500 to-amber-600', accent: 'border-orange-400', icon: '🚀' },
};

interface FloatingEmoji {
  id: number;
  emoji: string;
}

export default function Avatar({ 
  employee, 
  isCurrentUser, 
  onDelete, 
  onPrivateCall 
}: { 
  employee: Employee; 
  isCurrentUser?: boolean; 
  onDelete?: () => void; 
  onPrivateCall?: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [videoOn, setVideoOn] = useState(employee.isVideoOn ?? true);
  const [muted, setMuted] = useState(employee.isMuted ?? false);
  const [webcamFailed, setWebcamFailed] = useState(false);
  const [emojis, setEmojis] = useState<FloatingEmoji[]>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  
  // Capture real local webcam if this is the current user
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCurrentUser && videoOn) {
      setWebcamFailed(false);
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(s => {
          stream = s;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = s;
          }
        })
        .catch(err => {
          console.warn("Webcam access denied or unavailable, falling back to mock video.", err);
          setWebcamFailed(true);
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCurrentUser, videoOn]);

  // Employee avatar component

  if (employee.isHidden) return null;

  const dept = departmentStyles[employee.department] || { gradient: 'from-slate-600 to-slate-700', accent: 'border-slate-500', icon: '💼' };

  return (
    <motion.div
      className="absolute cursor-pointer select-none"
      initial={{ x: employee.x, y: employee.y }}
      animate={{ x: employee.x, y: employee.y }}
      transition={{ type: 'spring', stiffness: 140, damping: 20 }}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
      style={{ left: 0, top: 0, zIndex: showMenu ? 60 : 25 }}
    >
      <style jsx global>{`
        @keyframes avatar-bob {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.02); }
        }
        @keyframes emoji-float {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          20% { opacity: 1; transform: translateY(-20px) scale(1.1); }
          100% { transform: translateY(-80px) scale(0.8); opacity: 0; }
        }
        .avatar-3d-model {
          animation: avatar-bob 3s ease-in-out infinite;
        }
        .floating-reaction-emoji {
          animation: emoji-float 2s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
        }
      `}</style>

      <div className={clsx(
        "relative flex flex-col items-center group transition-all duration-300",
        employee.isPrivate && "opacity-40"
      )}>



        {/* ═══ 2. FLOATING VIDEO TILE ABOVE AVATAR ═══ */}
        <div className="relative mb-1">
          <div 
            className={clsx(
              "relative w-[96px] h-[72px] rounded-2xl border-2 overflow-hidden shadow-2xl transition-all duration-300 backdrop-blur-md bg-slate-950/90",
              isCurrentUser ? "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]" : "border-slate-600/80 hover:border-slate-300 shadow-black/90",
              muted && "ring-2 ring-rose-500/60 border-rose-500",
              employee.isPrivate && "border-rose-500 border-dashed"
            )}
          >
            {/* Real Video / Mock Video / Avatar Initial */}
            {videoOn ? (
              <div className="absolute inset-0 bg-slate-950 flex items-center justify-center overflow-hidden">
                {isCurrentUser && !webcamFailed ? (
                  <video 
                    ref={localVideoRef}
                    autoPlay 
                    muted 
                    playsInline
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : employee.videoUrl ? (
                  <video 
                    src={employee.videoUrl} 
                    autoPlay 
                    loop 
                    muted={muted} 
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : employee.profileImage ? (
                  <img src={employee.profileImage} alt={employee.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center">
                    <span className="font-extrabold text-white text-lg drop-shadow">{employee.name.charAt(0)}</span>
                  </div>
                )}
                {/* Speaking Equalizer Waveform Overlay */}
                {!muted && employee.status === 'online' && (
                  <div className="absolute bottom-1 right-1 flex items-end gap-0.5 z-10 px-1 py-0.5 rounded bg-black/60 backdrop-blur-sm">
                    <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-[bounce_0.8s_infinite]" />
                    <span className="w-0.5 h-3.5 bg-emerald-400 rounded-full animate-[bounce_1.1s_infinite_0.2s]" />
                    <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-[bounce_0.7s_infinite_0.4s]" />
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-base">
                  {employee.name.charAt(0)}
                </div>
              </div>
            )}

            {/* Mic Indicator Badge */}
            <div className="absolute top-1 right-1 flex gap-1 z-20">
              <div className={clsx("w-4 h-4 rounded-full flex items-center justify-center text-[8px] backdrop-blur-md text-white shadow-md", muted ? "bg-rose-600/90" : "bg-black/70")}>
                {muted ? <MicOff className="w-2.5 h-2.5" /> : <Mic className="w-2.5 h-2.5" />}
              </div>
            </div>

            {/* Status Dot */}
            <div className={clsx("absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full border border-slate-950 z-20", statusColors[employee.status])} />
          </div>

          {/* Floating Pill Name Tag */}
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-950/95 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full text-[10px] text-white font-extrabold whitespace-nowrap z-30 shadow-lg flex items-center gap-1.5">
            {employee.profileImage ? (
              <img 
                src={employee.profileImage} 
                alt={employee.name} 
                className="w-4 h-4 rounded-full object-cover border border-white/20" 
              />
            ) : (
              <span>{dept.icon}</span>
            )}
            {employee.isPrivate && <span className="text-[9px]">🔒</span>}
            <span className="tracking-tight">{employee.name} (ID: {employee.id})</span>
          </div>
        </div>

        {/* ═══ 3. PREMIUM GLOSSY CIRCULAR AVATAR UNDERNEATH ═══ */}
        <div className="relative flex flex-col items-center mt-1">
          <div className={clsx(
            "w-12 h-12 rounded-full bg-gradient-to-br border-2 shadow-2xl flex items-center justify-center text-white font-black text-sm relative select-none pointer-events-none avatar-3d-model",
            dept.gradient,
            dept.accent
          )}>
            {/* Outer department icon layer */}
            <span className="text-sm drop-shadow">{employee.name.charAt(0)}</span>
          </div>

          {/* Isometric Ground Contact Shadow */}
          <div className="w-10 h-2 bg-black/40 rounded-full blur-[2px] mt-1" />
        </div>

      </div>

      {/* ═══ ACTION / CONTROLS POPOVER MENU ═══ */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute top-36 left-1/2 -translate-x-1/2 bg-slate-950/95 backdrop-blur-2xl border border-white/20 rounded-2xl p-2.5 flex gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 whitespace-nowrap"
          >
            {isCurrentUser ? (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); setVideoOn(!videoOn); }}
                  className={clsx("px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shadow-md", videoOn ? "bg-slate-800 text-white hover:bg-slate-700 border border-white/10" : "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30")}
                >
                  {videoOn ? <Video className="w-3.5 h-3.5 text-cyan-400" /> : <VideoOff className="w-3.5 h-3.5 text-rose-400" />}
                  الكاميرا
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
                  className={clsx("px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shadow-md", !muted ? "bg-slate-800 text-white hover:bg-slate-700 border border-white/10" : "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30")}
                >
                  {!muted ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-rose-400" />}
                  المايكروفون
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPrivateCall) onPrivateCall();
                  }}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                  title="Private Call"
                >
                  <Phone className="w-3.5 h-3.5" />
                  مكالمة خاصة
                </button>
                {onDelete && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400 transition-all text-xs" 
                    title="حذف الموظف"
                  >
                    🗑️
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
