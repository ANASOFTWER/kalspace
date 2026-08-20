"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar, { Employee } from './Avatar';
import OfficeSidebar from './OfficeSidebar';
import InviteModal from './InviteModal';
import { useTranslations } from 'next-intl';
import { 
  Coffee, HelpCircle, Play, 
  Plus, Sparkles, X, Award, ScreenShare, ArrowRightLeft,
  Armchair, Sofa, Flower2, TreePine, Monitor, Check, Trash2,
  Tv, Volume2, ShieldCheck, Flame, RefreshCw, Zap, Edit3
} from 'lucide-react';
import clsx from 'clsx';

const EXTRA_MOCK_EMPLOYEES: Employee[] = [
  { id: '1', name: 'أحمد السبيعي', role: 'CEO', department: 'Management', status: 'online', x: 80, y: 120, videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop' },
  { id: '2', name: 'سارة خالد', role: 'Product Manager', department: 'Product', status: 'busy', x: 420, y: 100, videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
  { id: '3', name: 'John Doe', role: 'Lead Developer', department: 'Engineering', status: 'meeting', x: 540, y: 100, videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  { id: '4', name: 'فاطمة علي', role: 'HR Manager', department: 'HR', status: 'online', x: 250, y: 120 },
  { id: '5', name: 'علي حسين', role: 'Backend Engineer', department: 'Engineering', status: 'online', x: 650, y: 100 },
  { id: '6', name: 'نورة العتيبي', role: 'UI/UX Designer', department: 'Product', status: 'online', x: 420, y: 200 },
  { id: '7', name: 'خالد القحطاني', role: 'Financial Analyst', department: 'Management', status: 'busy', x: 540, y: 200 },
];

interface Furniture {
  id: string;
  name: string;
  type: 'chair' | 'table' | 'whiteboard' | 'coffee' | 'screen' | 'arcade' | 'plant' | 'sofa' | 'pool' | 'pingpong' | 'dj' | 'restroom_toilet' | 'restroom_sink' | 'kitchen_counter';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  emoji?: string;
  label?: string;
}

interface RoomZone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  borderStyle: string;
  label: string;
  arLabel: string;
  themeColor: string;
  glow: string;
}

interface StickyNote {
  id: string;
  text: string;
  color: string;
  author: string;
}

interface OfficeDoor {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'horizontal' | 'vertical';
  room: string;
}

const OFFICE_DOORS: OfficeDoor[] = [
  // Executive Office door (vertical on right wall)
  { id: 'door_ceo', x: 195, y: 140, width: 10, height: 50, type: 'vertical', room: 'Executive Office' },
  // HR Office door (vertical on right wall)
  { id: 'door_hr', x: 335, y: 140, width: 10, height: 50, type: 'vertical', room: 'HR Office' },
  // Meeting Room door (horizontal on top wall)
  { id: 'door_boardroom', x: 280, y: 290, width: 50, height: 10, type: 'horizontal', room: 'Meeting Room' },
  // Kitchen door (horizontal on top wall)
  { id: 'door_kitchen', x: 810, y: 490, width: 50, height: 10, type: 'horizontal', room: 'Kitchen' },
  // Bathroom door (horizontal on top wall)
  { id: 'door_restroom', x: 1020, y: 600, width: 40, height: 10, type: 'horizontal', room: 'Bathroom' },
];

export default function VirtualOffice() {
  const t = useTranslations('nav');
  const [employees, setEmployees] = useState<Employee[]>(EXTRA_MOCK_EMPLOYEES.slice(0, 4));
  const [loggedInUserId, setLoggedInUserId] = useState<string>('1'); // CEO by default
  const [currentRoom, setCurrentRoom] = useState('SaaS Main Office');
  const [activeInteractive, setActiveInteractive] = useState<string | null>(null);
  const [privateCallTargetId, setPrivateCallTargetId] = useState<string | null>(null);
  
  // Interactive mini-features state
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([
    { id: '1', text: 'Daily Standup at 10 AM 🎯', color: 'bg-yellow-400/90 text-slate-900', author: 'سارة خالد' },
    { id: '2', text: 'Commit clean code & review PRs! 💻', color: 'bg-cyan-400/90 text-slate-900', author: 'John Doe' },
  ]);
  const [newNoteText, setNewNoteText] = useState('');
  const [coffeeStatus, setCoffeeStatus] = useState<string | null>(null);
  const [arcadeScore, setArcadeScore] = useState(0);
  const [billiardsScore, setBilliardsScore] = useState(0);
  const [pingPongRallies, setPingPongRallies] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapWidth = 1200;
  const mapHeight = 800;

  // Container size tracking for responsive fit
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 1200, h: 800 });
  const baseScale = Math.min(containerSize.w / mapWidth, containerSize.h / mapHeight);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Dynamic Company Size & Background mapping
  const [companySize, setCompanySize] = useState<string>('2-5');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDeskId, setEditingDeskId] = useState<string | null>(null);
  const [editingDeskValue, setEditingDeskValue] = useState<string>('');
  const [movingIconId, setMovingIconId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const lastPanPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [isAudioAmbientOn, setIsAudioAmbientOn] = useState<boolean>(false);

  // CEO Profile Custom Modals State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [ceoEditName, setCeoEditName] = useState('');
  const [ceoEditImage, setCeoEditImage] = useState('');

  // Add Employee Custom Modal State
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [newEmpId, setNewEmpId] = useState('');
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('Engineering');
  const [newEmpImage, setNewEmpImage] = useState('');

  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientNodesRef = useRef<any[]>([]);

  // Synthesize background office hum (servers, air-con hum) using Web Audio synth
  useEffect(() => {
    if (isAudioAmbientOn) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // Create low hum generator (Brown Noise)
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; 
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 140; 

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.06; 

        noiseNode.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        noiseNode.start(0);

        ambientNodesRef.current = [noiseNode, gainNode];
      } catch (err) {
        console.error("Web Audio API failed", err);
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      ambientNodesRef.current = [];
    }
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [isAudioAmbientOn]);

  // States for interactive walking direction and movement states
  const [movingAvatars, setMovingAvatars] = useState<Record<string, { isMoving: boolean; prevX: number; prevY: number; scaleX: number }>>({});

  // Dynamic desk names state for CEO, HR and 5 employee desks
  const [furnitureNames, setFurnitureNames] = useState<Record<string, string>>({
    ceo_desk: 'مكتب المدير التنفيذي',
    hr_desk: 'مكتب شؤون الموظفين',
    eng_desk1: 'مكتب 1',
    eng_desk2: 'مكتب 2',
    eng_desk3: 'مكتب 3',
    eng_desk4: 'مكتب 4',
    eng_desk5: 'مكتب 5',
  });
  const [selectedDeskMenuId, setSelectedDeskMenuId] = useState<string | null>(null);

  // Define Rooms mapping to the new 2D blueprint map coordinates
  // Image layout: TOP ROW: Kitchen | CEO Office | HR Office | Boardroom
  //               BOT ROW: Restroom | Open Workspace | Entertainment Lounge
  const getRoomsForFloor = (roomName: string): RoomZone[] => {
    return [
      // TOP ROW
      { id: 'zone_ceo', name: 'Executive Office', x: 40, y: 50, width: 175, height: 195, color: 'bg-transparent', borderStyle: 'border-amber-500/10 hover:border-amber-400/40 hover:bg-amber-500/[0.02]', label: 'Executive Office', arLabel: '👑 مكتب المدير التنفيذي', themeColor: 'text-amber-400', glow: 'shadow-[0_0_50px_rgba(245,158,11,0.03)]' },
      { id: 'zone_hr', name: 'HR Office', x: 215, y: 50, width: 140, height: 195, color: 'bg-transparent', borderStyle: 'border-teal-500/10 hover:border-teal-500/40 hover:bg-teal-500/[0.02]', label: 'HR Office', arLabel: '👥 مكتب شؤون الموظفين', themeColor: 'text-teal-400', glow: 'shadow-[0_0_50px_rgba(20,184,166,0.03)]' },
      { id: 'zone_cowork', name: 'Open Coworking', x: 355, y: 50, width: 400, height: 230, color: 'bg-transparent', borderStyle: 'border-cyan-500/10 hover:border-cyan-500/40 hover:bg-cyan-500/[0.02]', label: 'Private Offices', arLabel: '💻 المكاتب الخاصة', themeColor: 'text-cyan-400', glow: 'shadow-[0_0_50px_rgba(34,211,238,0.03)]' },
      { id: 'zone_relax', name: 'Relax Lounge', x: 755, y: 50, width: 395, height: 240, color: 'bg-transparent', borderStyle: 'border-pink-500/10 hover:border-pink-500/40 hover:bg-pink-500/[0.02]', label: 'Entertainment Lounge', arLabel: '🎮 صالة الترفيه', themeColor: 'text-pink-400', glow: 'shadow-[0_0_50px_rgba(236,72,153,0.03)]' },
      // MIDDLE ROW
      { id: 'zone_board', name: 'Meeting Room', x: 40, y: 290, width: 310, height: 160, color: 'bg-transparent', borderStyle: 'border-purple-500/10 hover:border-purple-500/40 hover:bg-purple-500/[0.02]', label: 'Meeting Room', arLabel: '📊 قاعة الاجتماعات', themeColor: 'text-purple-400', glow: 'shadow-[0_0_50px_rgba(168,85,247,0.03)]' },
      { id: 'zone_break', name: 'Break Area', x: 755, y: 300, width: 310, height: 190, color: 'bg-transparent', borderStyle: 'border-green-500/10 hover:border-green-500/40 hover:bg-green-500/[0.02]', label: 'Break Area', arLabel: '☕ منطقة الاستراحة', themeColor: 'text-green-400', glow: 'shadow-[0_0_50px_rgba(34,197,94,0.03)]' },
      // BOTTOM ROW
      { id: 'zone_training', name: 'Training Room', x: 40, y: 450, width: 310, height: 260, color: 'bg-transparent', borderStyle: 'border-blue-500/10 hover:border-blue-500/40 hover:bg-blue-500/[0.02]', label: 'Training Room', arLabel: '🏫 قاعة التدريب', themeColor: 'text-blue-400', glow: 'shadow-[0_0_50px_rgba(59,130,246,0.03)]' },
      { id: 'zone_kitchen', name: 'Kitchen & Cafe', x: 755, y: 495, width: 265, height: 200, color: 'bg-transparent', borderStyle: 'border-orange-500/10 hover:border-orange-500/40 hover:bg-orange-500/[0.02]', label: 'Kitchen & Cafe', arLabel: '☕ المطبخ', themeColor: 'text-orange-400', glow: 'shadow-[0_0_50px_rgba(251,146,60,0.03)]' },
      { id: 'zone_restroom', name: 'Restroom', x: 1020, y: 600, width: 120, height: 110, color: 'bg-transparent', borderStyle: 'border-slate-500/15 hover:border-slate-400 hover:bg-slate-800/[0.04]', label: 'Bathroom', arLabel: '🚻 دورة المياه', themeColor: 'text-slate-300', glow: 'shadow-[0_0_50px_rgba(148,163,184,0.02)]' },
    ];
  };

  // Define clickable furniture hotspots overlays matching the 2D blueprint map coordinates
  const getFurnitureForRoom = (roomName: string): Furniture[] => {
    return [
      // Executive Office (x:40-215, y:50-245)
      { id: 'ceo_desk', name: 'CEO Desk', type: 'table', x: 60, y: 100, width: 120, height: 70, color: 'bg-amber-500/[0.01] border border-amber-500/20 hover:bg-amber-500/10' },
      
      // HR Office (x:215-355, y:50-245)
      { id: 'hr_desk', name: 'HR Desk', type: 'table', x: 240, y: 100, width: 90, height: 55, color: 'bg-teal-500/[0.01] border border-teal-500/20 hover:bg-teal-500/10' },
      { id: 'hr_chair', name: 'HR Chair', type: 'chair', x: 265, y: 165, width: 40, height: 40, color: 'bg-teal-500/[0.01] border border-teal-500/15 hover:bg-teal-500/10', emoji: '💺' },

      // Private Offices / Open Coworking desks (x:355-755, y:50-280)
      { id: 'eng_desk1', name: 'مكتب 1', type: 'table', x: 380, y: 75, width: 90, height: 55, color: 'bg-cyan-500/[0.01] border border-cyan-500/20 hover:bg-cyan-500/10' },
      { id: 'eng_desk2', name: 'مكتب 2', type: 'table', x: 500, y: 75, width: 90, height: 55, color: 'bg-cyan-500/[0.01] border border-cyan-500/20 hover:bg-cyan-500/10' },
      { id: 'eng_desk3', name: 'مكتب 3', type: 'table', x: 620, y: 75, width: 90, height: 55, color: 'bg-cyan-500/[0.01] border border-cyan-500/20 hover:bg-cyan-500/10' },
      { id: 'eng_desk4', name: 'مكتب 4', type: 'table', x: 380, y: 175, width: 90, height: 55, color: 'bg-cyan-500/[0.01] border border-cyan-500/20 hover:bg-cyan-500/10' },
      { id: 'eng_desk5', name: 'مكتب 5', type: 'table', x: 500, y: 175, width: 90, height: 55, color: 'bg-cyan-500/[0.01] border border-cyan-500/20 hover:bg-cyan-500/10' },

      // Meeting Room (x:40-350, y:290-450)
      { id: 'board_table', name: 'Meeting Table', type: 'table', x: 100, y: 330, width: 200, height: 80, color: 'bg-purple-500/[0.01] border border-purple-500/20 hover:bg-purple-500/10' },
      { id: 'board_screen', name: 'Main Display', type: 'screen', x: 55, y: 410, width: 80, height: 30, color: 'bg-purple-500/[0.01] border border-purple-500/20 hover:bg-purple-500/10', emoji: '📺' },

      // Entertainment / Games (x:755-1150, y:50-240)
      { id: 'game_billiards', name: 'Billiards Table', type: 'pool', x: 810, y: 70, width: 120, height: 70, color: 'bg-transparent' },
      { id: 'game_pingpong', name: 'Ping Pong Table', type: 'pingpong', x: 970, y: 110, width: 120, height: 80, color: 'bg-transparent' },

      // Break Area (x:755-1065, y:300-490)
      { id: 'espresso_bar', name: 'Espresso Bar', type: 'coffee', x: 900, y: 310, width: 60, height: 50, color: 'bg-orange-500/[0.01] border border-orange-500/20 hover:bg-orange-500/10', emoji: '☕' },

      // Kitchen (x:755-1020, y:495-695)
      { id: 'kitchen_counter', name: 'Kitchen Counter', type: 'kitchen_counter', x: 770, y: 530, width: 200, height: 55, color: 'bg-orange-500/[0.01] border border-orange-500/20 hover:bg-orange-500/10', emoji: '🍳' },

      // Bathroom (x:1020-1140, y:600-710)
      { id: 'toilet_1', name: 'Toilet', type: 'restroom_toilet', x: 1070, y: 650, width: 45, height: 40, color: 'bg-slate-500/[0.01] border border-slate-500/20 hover:bg-slate-500/10', emoji: '🚽' },
      { id: 'sink_1', name: 'Wash Sink', type: 'restroom_sink', x: 1025, y: 650, width: 40, height: 40, color: 'bg-slate-500/[0.01] border border-slate-500/20 hover:bg-slate-500/10', emoji: '🚰' },
      

    ];
  };

  const [roomFurnitures, setRoomFurnitures] = useState<Furniture[]>([]);
  const [roomZones, setRoomZones] = useState<RoomZone[]>([]);
  const [customRoomsList, setCustomRoomsList] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState('شركة المستقبل للتقنية');
  const [todoList, setTodoList] = useState<string[]>(['مراجعة كود التحديث الجديد', 'تحديث ترجمات الواجهة العربية', 'اجتماع التخطيط الربع سنوي']);
  const [todoInput, setTodoInput] = useState('');
  const [pomodoroSeconds, setPomodoroSeconds] = useState<number>(1500);
  const [pomodoroActive, setPomodoroActive] = useState<boolean>(false);
  const [isSharingScreen, setIsSharingScreen] = useState<boolean>(false);
  const [slides, setSlides] = useState<string[]>([
    'خطة إطلاق منصة Kalspace الربعية 🚀',
    'التركيز على الصوت الفضائي وخصوصية المكاتب',
    'مؤشرات الأداء وزيادة إنتاجية الفريق 40%'
  ]);
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [flushTrigger, setFlushTrigger] = useState<boolean>(false);
  const [cleanliness, setCleanliness] = useState<number>(75);
  const [plantLevel, setPlantLevel] = useState<number>(2);
  const [inviteOpen, setInviteOpen] = useState<boolean>(false);

  // Load custom rooms list & company name & size
  useEffect(() => {
    const saved = localStorage.getItem('kalspace_custom_rooms');
    if (saved) setCustomRoomsList(JSON.parse(saved));
    const savedCompanyName = localStorage.getItem('company_name');
    if (savedCompanyName) setCompanyName(savedCompanyName);
    const savedSize = localStorage.getItem('company_size');
    if (savedSize) setCompanySize(savedSize);
    
    // Set default room zones & furnitures
    setRoomZones(getRoomsForFloor(currentRoom));
    setRoomFurnitures(getFurnitureForRoom(currentRoom));
  }, [currentRoom]);

  // Save employees list helper
  const saveEmployees = (newEmployees: Employee[]) => {
    setEmployees(newEmployees);
    localStorage.setItem('kalspace_employees', JSON.stringify(newEmployees));
  };

  // Adjust mock employee count based on company size selection
  useEffect(() => {
    const savedEmployees = localStorage.getItem('kalspace_employees');
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    } else {
      let count = 4;
      if (companySize === '6-10') count = 5;
      else if (companySize === '11-15') count = 6;
      else if (companySize === '16+') count = 7;
      
      const defaultCEO = {
        id: '1',
        name: localStorage.getItem('ceo_name') || 'أحمد السبيعي',
        role: 'CEO',
        department: 'Management',
        status: 'online' as const,
        x: 80,
        y: 120,
        profileImage: localStorage.getItem('ceo_image') || undefined
      };
      
      const list = [defaultCEO, ...EXTRA_MOCK_EMPLOYEES.slice(1, count)];
      setEmployees(list);
    }
    localStorage.setItem('company_size', companySize);
  }, [companySize]);

  // Open profile modal automatically on first visit if CEO profile is not set
  useEffect(() => {
    const savedCeoName = localStorage.getItem('ceo_name');
    if (!savedCeoName) {
      setCeoEditName('أحمد السبيعي');
      setShowProfileModal(true);
    }
  }, []);

  // Track avatar movement directions and movement states for fluid animations
  useEffect(() => {
    setMovingAvatars(prev => {
      const next = { ...prev };
      employees.forEach(emp => {
        const last = prev[emp.id] || { isMoving: false, prevX: emp.x, prevY: emp.y, scaleX: 1 };
        const isNowMoving = Math.abs(emp.x - last.prevX) > 2 || Math.abs(emp.y - last.prevY) > 2;
        let scale = last.scaleX;
        if (emp.x < last.prevX) scale = -1; // facing left
        if (emp.x > last.prevX) scale = 1;  // facing right
        next[emp.id] = { isMoving: isNowMoving, prevX: emp.x, prevY: emp.y, scaleX: scale };
      });
      return next;
    });
  }, [employees]);

  // Pomodoro countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (pomodoroActive && pomodoroSeconds > 0) {
      timer = setInterval(() => setPomodoroSeconds(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [pomodoroActive, pomodoroSeconds]);

  const currentUser = employees.find(emp => emp.id === loggedInUserId) || employees[0];
  const canEditMap = currentUser.role === 'CEO';

  // Spatial Proximity Calculation for Private Bubble
  const spatialBubbleTarget = useMemo(() => {
    const nearby = employees.find(emp => {
      if (emp.id === loggedInUserId) return false;
      const dist = Math.hypot((currentUser.x - emp.x), (currentUser.y - emp.y));
      return dist < 140;
    });
    return nearby || null;
  }, [employees, currentUser.x, currentUser.y, loggedInUserId]);

  // Reactive door open/close states based on employee proximity to doorways
  const openDoorsMap = useMemo(() => {
    const openMap: Record<string, boolean> = {};
    OFFICE_DOORS.forEach(door => {
      const doorCenterX = door.x + door.width / 2;
      const doorCenterY = door.y + door.height / 2;
      const isAnyEmployeeNear = employees.some(emp => {
        const empCenterX = emp.x + 45;
        const empCenterY = emp.y + 45;
        const distance = Math.hypot(empCenterX - doorCenterX, empCenterY - doorCenterY);
        return distance < 65; 
      });
      openMap[door.id] = isAnyEmployeeNear;
    });
    return openMap;
  }, [employees]);

  // Restroom Smart Privacy Logic
  const restroomZone = roomZones.find(z => z.id === 'zone_restroom');
  
  const employeesWithRestroomLogic = useMemo(() => {
    if (!restroomZone) return employees;
    return employees.map(emp => {
      const inRestroom = (
        emp.x >= restroomZone.x - 20 &&
        emp.x <= restroomZone.x + restroomZone.width &&
        emp.y >= restroomZone.y - 20 &&
        emp.y <= restroomZone.y + restroomZone.height
      );
      if (inRestroom) {
        return { ...emp, isHidden: true };
      }
      return { ...emp, isHidden: false };
    });
  }, [employees, restroomZone]);

  const restroomOccupiedCount = useMemo(() => {
    if (!restroomZone) return 0;
    return employees.filter(emp => 
      emp.x >= restroomZone.x - 20 &&
      emp.x <= restroomZone.x + restroomZone.width &&
      emp.y >= restroomZone.y - 20 &&
      emp.y <= restroomZone.y + restroomZone.height
    ).length;
  }, [employees, restroomZone]);

  const isRestroomOccupied = restroomOccupiedCount > 0;

  // Keyboard navigation for user (WASD)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const speed = 25;
      let dx = 0;
      let dy = 0;
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') dy = -speed;
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') dy = speed;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') dx = -speed;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') dx = speed;

      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        setEmployees(prev => prev.map(emp => {
          if (emp.id === loggedInUserId) {
            const nextX = Math.max(40, Math.min(mapWidth - 120, emp.x + dx));
            const nextY = Math.max(40, Math.min(mapHeight - 120, emp.y + dy));
            return { ...emp, x: nextX, y: nextY };
          }
          return emp;
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loggedInUserId, mapWidth, mapHeight]);

  const lastRightClickTimeRef = useRef<number>(0);

  // Double right click on map to walk
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent native browser context menu
    const now = Date.now();
    const timeDiff = now - lastRightClickTimeRef.current;
    lastRightClickTimeRef.current = now;

    if (timeDiff < 300) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Account for zoom level in canvas positioning
      const clickX = (e.clientX - rect.left) / zoomLevel;
      const clickY = (e.clientY - rect.top) / zoomLevel;

      setEmployees(prev => prev.map(emp => {
        if (emp.id === loggedInUserId) {
          return { ...emp, x: Math.max(40, Math.min(mapWidth - 120, clickX - 45)), y: Math.max(40, Math.min(mapHeight - 120, clickY - 45)) };
        }
        return emp;
      }));
    }
  };

  // Click on map to place/move furniture in build mode
  const handleCanvasClick = (e: React.MouseEvent) => {
    const mapEl = e.currentTarget as HTMLElement;
    const rect = mapEl.getBoundingClientRect();
    const scaleX = mapWidth / rect.width;
    const scaleY = mapHeight / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    if (movingIconId) {
      setRoomFurnitures(prev => prev.map(f => f.id === movingIconId ? { ...f, x: Math.max(0, clickX - f.width / 2), y: Math.max(0, clickY - f.height / 2) } : f));
      setMovingIconId(null);
      return;
    }
  };

  // Check proximity for action items
  const checkInteraction = (furniture: Furniture) => {
    if (['chair', 'sofa'].includes(furniture.type)) return false;
    const playerCenterX = currentUser.x + 45;
    const playerCenterY = currentUser.y + 45;
    const furnCenterX = furniture.x + furniture.width / 2;
    const furnCenterY = furniture.y + furniture.height / 2;
    const distance = Math.hypot(playerCenterX - furnCenterX, playerCenterY - furnCenterY);
    return distance < 140; 
  };

  const handleTeleport = (targetZoneName: string) => {
    const zone = roomZones.find(z => z.name === targetZoneName || z.arLabel === targetZoneName);
    if (zone) {
      setEmployees(prev => prev.map(emp => 
        emp.id === loggedInUserId ? { ...emp, x: zone.x + zone.width / 2 - 45, y: zone.y + zone.height / 2 - 45 } : emp
      ));
    }
  };

  const handleFileChange = (file: File | undefined, setBase64: (val: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCeoProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ceoEditName.trim()) return;

    localStorage.setItem('ceo_name', ceoEditName.trim());
    if (ceoEditImage) {
      localStorage.setItem('ceo_image', ceoEditImage);
    }

    const updated = employees.map(emp => {
      if (emp.id === '1') {
        return {
          ...emp,
          name: ceoEditName.trim(),
          profileImage: ceoEditImage || emp.profileImage,
          videoUrl: undefined
        };
      }
      return emp;
    });

    saveEmployees(updated);
    setShowProfileModal(false);
  };

  const handleSaveNewEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpId.trim() || !newEmpName.trim() || !newEmpRole.trim()) return;

    if (employees.some(emp => emp.id === newEmpId.trim())) {
      alert('رقم التعريف هذا مستخدم بالفعل لموظف آخر!');
      return;
    }

    const nextIndex = employees.length + 1;
    const newEmp: Employee = {
      id: newEmpId.trim(),
      name: newEmpName.trim(),
      role: newEmpRole.trim(),
      department: newEmpDept,
      status: 'online',
      x: 380 + (nextIndex * 30) % 250,
      y: 75 + (nextIndex * 25) % 120,
      profileImage: newEmpImage || undefined,
      videoUrl: undefined
    };

    const updated = [...employees, newEmp];
    saveEmployees(updated);

    setNewEmpId('');
    setNewEmpName('');
    setNewEmpRole('');
    setNewEmpDept('Engineering');
    setNewEmpImage('');
    setShowAddEmployeeModal(false);
  };

  const handleDeleteEmployee = (id: string) => {
    const updated = employees.filter(e => e.id !== id);
    saveEmployees(updated);
  };

  const handleCallMeeting = () => {
    const boardZone = roomZones.find(z => z.id === 'zone_board') || { x: 450, y: 450 };
    setEmployees(prev => prev.map((emp, i) => ({
      ...emp,
      x: boardZone.x + 40 + (i % 4) * 60,
      y: boardZone.y + 80 + Math.floor(i / 4) * 60
    })));
  };

  // Determine dynamic blueprint background mapping based on companySize choice
  const getBlueprintBackground = () => {
    let imgPath = '/images/office-maps/small.png';
    if (companySize === '6-10') imgPath = '/images/office-maps/medium.png';
    else if (companySize === '11-15') imgPath = '/images/office-maps/large.png';
    else if (companySize === '16+') imgPath = '/images/office-maps/xlarge.png';

    return {
      backgroundImage: `url('${imgPath}?v=5')`,
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#090d1f'
    };
  };

  // Rename desk/office dynamically
  const handleRenameDesk = (id: string, currentName: string) => {
    const newName = window.prompt("أدخل الاسم الجديد للمكتب:", currentName);
    if (newName && newName.trim()) {
      setFurnitureNames(prev => ({ ...prev, [id]: newName.trim() }));
    }
  };

  return (
    <div className="w-full h-full min-h-[700px] relative bg-[#02040a] rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex select-none" dir="rtl">
      <style jsx global>{`
        @keyframes volumetric-pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.03); }
        }
        @keyframes custom-steam {
          0% { transform: translateY(0) scaleX(1); opacity: 0.4; }
          50% { transform: translateY(-10px) scaleX(1.1); opacity: 0.7; }
          100% { transform: translateY(-20px) scaleX(0.9); opacity: 0; }
        }
        @keyframes radar-pulse {
          0% { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .volumetric-light-cyan {
          background: radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 70%);
          animation: volumetric-pulse 4s ease-in-out infinite;
        }
        .volumetric-light-gold {
          background: radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%);
          animation: volumetric-pulse 4s ease-in-out infinite;
        }
        .volumetric-light-purple {
          background: radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%);
          animation: volumetric-pulse 4s ease-in-out infinite;
        }
        .volumetric-light-pink {
          background: radial-gradient(circle, rgba(244,114,182,0.2) 0%, transparent 70%);
          animation: volumetric-pulse 4s ease-in-out infinite;
        }
        .volumetric-light-teal {
          background: radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%);
          animation: volumetric-pulse 4s ease-in-out infinite;
        }
        .custom-steam-particle {
          animation: custom-steam 2.5s ease-in-out infinite;
        }
        .radar-pulse-ring {
          animation: radar-pulse 2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
        }
        .glassmorphism-tooltip {
          background: rgba(10, 15, 30, 0.75);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 15px rgba(34, 211, 238, 0.2);
        }
        .night-mode .volumetric-light-cyan {
          background: radial-gradient(circle, rgba(34,211,238,0.45) 0%, transparent 70%);
        }
        .night-mode .volumetric-light-gold {
          background: radial-gradient(circle, rgba(245,158,11,0.45) 0%, transparent 70%);
        }
        .night-mode .volumetric-light-purple {
          background: radial-gradient(circle, rgba(168,85,247,0.45) 0%, transparent 70%);
        }
        .night-mode .volumetric-light-pink {
          background: radial-gradient(circle, rgba(244,114,182,0.45) 0%, transparent 70%);
        }
        .night-mode .volumetric-light-teal {
          background: radial-gradient(circle, rgba(20,184,166,0.35) 0%, transparent 70%);
        }
      `}</style>
      
      {/* ═══ MAP DISPLAY CONTAINER ═══ */}
      <div className="flex-1 h-full relative flex flex-col min-w-0">
        
        {/* Top Controls Header */}
        <div className="relative w-full px-5 py-4 bg-slate-950 border-b border-white/10 z-40 flex flex-wrap gap-4 justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2 drop-shadow-md">
              <span className="text-cyan-400 font-extrabold">{companyName}</span>
              <span className="text-slate-400 text-sm font-normal">({currentRoom})</span>
            </h2>
            <div className="flex items-center gap-2 mt-1 drop-shadow text-xs text-slate-300">
              <span>التحكم:</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-mono font-bold">W A S D</kbd>
              <span>أو انقر بالماوس في أي مكان للتحرك / استخدم عجلة الماوس للتكبير والتصغير</span>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            
            {/* 2D Blueprint Company Space / Size Selector */}
            <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl border border-white/15 px-3 py-1.5 rounded-xl shadow-lg">
              <span className="text-xs font-bold text-slate-300">مساحة الشركة:</span>
              <select 
                value={companySize} 
                onChange={(e) => setCompanySize(e.target.value)}
                className="bg-slate-800 text-cyan-300 font-bold text-xs rounded-lg px-2 py-1 outline-none border border-cyan-500/30 cursor-pointer"
              >
                <option value="2-5">2 - 5 موظفين (مساحة صغيرة)</option>
                <option value="6-10">6 - 10 موظفين (مساحة متوسطة)</option>
                <option value="11-15">11 - 15 موظف (مساحة كبيرة)</option>
                <option value="16+">16+ موظف (مساحة ضخمة)</option>
              </select>
            </div>

            {/* User Profile Switcher */}
            <div className="flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-xl border border-white/15 p-1.5 rounded-xl shadow-lg">
              <div className="text-right">
                <div className="text-xs font-black text-white flex items-center gap-1">
                  {currentUser.role === 'CEO' && <span className="text-amber-400">👑</span>}
                  {currentUser.name}
                  {currentUser.role === 'CEO' && (
                    <button 
                      onClick={() => {
                        setCeoEditName(currentUser.name);
                        setCeoEditImage(currentUser.profileImage || '');
                        setShowProfileModal(true);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-bold text-[10px] underline cursor-pointer mr-1 pointer-events-auto"
                      title="تعديل الملف الشخصي للمدير"
                    >
                      (تعديل)
                    </button>
                  )}
                </div>
                <select 
                  value={loggedInUserId}
                  onChange={(e) => setLoggedInUserId(e.target.value)}
                  className="text-[11px] text-cyan-400 font-bold bg-transparent outline-none cursor-pointer"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id} className="bg-slate-900 text-white">
                      {emp.role} - {emp.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600">
                {currentUser.profileImage ? (
                  <img src={currentUser.profileImage} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-white text-xs">{currentUser.name.charAt(0)}</span>
                )}
              </div>
            </div>

            {/* Ambient Sound Toggle */}
            <button 
              onClick={() => setIsAudioAmbientOn(!isAudioAmbientOn)}
              className={clsx(
                "px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 shadow-lg pointer-events-auto",
                isAudioAmbientOn 
                  ? "bg-emerald-600/90 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse" 
                  : "bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white"
              )}
              title={isAudioAmbientOn ? "إيقاف صوت المكتب" : "تشغيل صوت المكتب الفضائي"}
            >
              <span>{isAudioAmbientOn ? '🔊' : '🔇'}</span> 
              <span>صوت المكتب</span>
            </button>

            {/* Night Mode Toggle */}
            <button 
              onClick={() => setIsNightMode(!isNightMode)}
              className={clsx(
                "px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 shadow-lg pointer-events-auto",
                isNightMode 
                  ? "bg-indigo-600/90 border-indigo-400 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]" 
                  : "bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white"
              )}
              title={isNightMode ? "وضع النهار" : "وضع الليل"}
            >
              <span>{isNightMode ? '🌙' : '🌞'}</span> 
              <span>وضع الليل</span>
            </button>

            {/* Invite Button */}
            <button 
              onClick={() => setInviteOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500 text-xs font-bold transition-all shadow-lg flex items-center gap-1.5"
            >
              <span>👥</span> دعوة فريقك
            </button>

            {/* Edit Mode */}
            {canEditMap && (
              <button 
                onClick={() => setIsEditMode(!isEditMode)} 
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shadow-lg ${
                  isEditMode 
                    ? 'bg-amber-600 border-amber-400 text-white animate-pulse' 
                    : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:text-white'
                }`}
              >
                {isEditMode ? 'إنهاء التعديل' : '🛠️ وضع البناء'}
              </button>
            )}
          </div>
        </div>

        {/* ═══ MAP CANVAS ═══ */}
        <div 
          ref={containerRef}
          className="flex-1 w-full relative overflow-hidden bg-[#090d1f]"
          onWheel={(e) => {
            e.preventDefault();
            // Calculate mouse position relative to the map content
            const mapEl = containerRef.current;
            if (!mapEl) return;
            const rect = mapEl.getBoundingClientRect();
            
            // Mouse position as percentage of container
            const mouseXPercent = ((e.clientX - rect.left) / rect.width) * 100;
            const mouseYPercent = ((e.clientY - rect.top) / rect.height) * 100;
            setZoomOrigin({ x: mouseXPercent, y: mouseYPercent });
            
            const zoomFactor = -e.deltaY * 0.0015;
            setZoomLevel(prev => {
              const next = Math.max(1, Math.min(4, prev + zoomFactor));
              // Reset pan when zooming back to 1
              if (next <= 1) setPanOffset({ x: 0, y: 0 });
              return next;
            });
          }}
          onMouseDown={(e) => {
            // Start panning on middle-click or left-click when zoomed in
            if (e.button === 1 || (e.button === 0 && zoomLevel > 1.1)) {
              isPanningRef.current = true;
              lastPanPosRef.current = { x: e.clientX, y: e.clientY };
              e.preventDefault();
            }
          }}
          onMouseMove={(e) => {
            if (isPanningRef.current) {
              const dx = e.clientX - lastPanPosRef.current.x;
              const dy = e.clientY - lastPanPosRef.current.y;
              lastPanPosRef.current = { x: e.clientX, y: e.clientY };
              setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            }
          }}
          onMouseUp={() => { isPanningRef.current = false; }}
          onMouseLeave={() => { isPanningRef.current = false; }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Main Map - scales to fill container, then zoom multiplies on top */}
          <div 
            onClick={handleCanvasClick}
            onContextMenu={handleContextMenu}
            className={clsx(isNightMode && "night-mode")}
            style={{ 
              width: `${mapWidth}px`, 
              height: `${mapHeight}px`,
              ...getBlueprintBackground(),
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(calc(-50% + ${panOffset.x}px), calc(-50% + ${panOffset.y}px)) scale(${baseScale * zoomLevel})`,
              transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
              transition: isPanningRef.current ? 'none' : 'transform 0.15s ease-out',
              cursor: zoomLevel > 1.1 ? 'grab' : 'default',
            }}
          >
            {/* Night Mode Vignette Layer */}
            {isNightMode && (
              <div className="absolute inset-0 bg-[#070b24]/55 mix-blend-mode-multiply pointer-events-none rounded-3xl z-20 transition-all duration-700" />
            )}
            
            {/* ═══ ROOM HOTSPOTS AND VOLUMETRIC neon LIGHT FLOODS ═══ */}
            {roomZones.map((zone) => (
              <div
                key={zone.id}
                className={`absolute rounded-3xl border-2 transition-all p-5 flex flex-col justify-between ${zone.color} ${zone.borderStyle} ${zone.glow}`}
                style={{
                  left: `${zone.x}px`,
                  top: `${zone.y}px`,
                  width: `${zone.width}px`,
                  height: `${zone.height}px`,
                }}
              >
                {/* Volumetric Lights overlays */}
                {zone.id === 'zone_ceo' && <div className="absolute inset-0 volumetric-light-gold rounded-3xl pointer-events-none" />}
                {zone.id === 'zone_cowork' && <div className="absolute inset-0 volumetric-light-cyan rounded-3xl pointer-events-none" />}
                {zone.id === 'zone_hr' && <div className="absolute inset-0 volumetric-light-teal rounded-3xl pointer-events-none" />}
                {zone.id === 'zone_board' && <div className="absolute inset-0 volumetric-light-purple rounded-3xl pointer-events-none" />}
                {zone.id === 'zone_relax' && <div className="absolute inset-0 volumetric-light-pink rounded-3xl pointer-events-none" />}

                {/* Room Name Badge & Restroom Indicator */}
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/90 border border-white/20 text-[10px] font-extrabold shadow-lg z-10 pointer-events-none">
                  <span className={zone.themeColor}>{zone.arLabel}</span>
                </div>

                {/* Smart Restroom LED Sign - positioned inside the restroom */}
                {zone.id === 'zone_restroom' && (
                  <div 
                    style={{ left: '50%', bottom: '20px', transform: 'translateX(-50%)' }}
                    className={`absolute px-3 py-1 rounded-full text-xs font-extrabold shadow-2xl flex items-center gap-1.5 transition-all z-10 ${
                      isRestroomOccupied 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500 animate-pulse shadow-[0_0_15px_#f43f5e]' 
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500 shadow-[0_0_15px_#10b981]'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isRestroomOccupied ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
                    {isRestroomOccupied ? '🔴 مشغول' : '🟢 متاح'}
                  </div>
                )}
              </div>
            ))}

            {/* ═══ ANIMATED OFFICE DOORS ═══ */}
            {OFFICE_DOORS.map(door => {
              const isOpen = openDoorsMap[door.id];
              return (
                <div
                  key={door.id}
                  className="absolute bg-amber-800/85 border border-amber-950/60 rounded-sm shadow-md transition-all duration-500 origin-top-left z-20 pointer-events-none"
                  style={{
                    left: `${door.x}px`,
                    top: `${door.y}px`,
                    width: `${door.width}px`,
                    height: `${door.height}px`,
                    transform: isOpen 
                      ? (door.type === 'horizontal' ? 'rotate(-90deg) scale(0.95)' : 'rotate(90deg) scale(0.95)')
                      : 'none',
                    opacity: 0.95,
                  }}
                />
              );
            })}

            {/* ═══ FURNITURE & HIGH-FIDELITY INTERACTIVE OBJECTS ═══ */}
            {roomFurnitures.map((f) => {
              const isNear = checkInteraction(f);
              const customName = furnitureNames[f.id] || f.name;
              
              // Only render interactive text/edit badges for desks
              const isDesk = f.id === 'ceo_desk' || f.id === 'hr_desk' || f.id.includes('eng_desk');

              return (
                <div
                  key={f.id}
                  className={clsx(
                    "absolute rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer",
                    isDesk ? "bg-slate-900/40 border border-cyan-500/20 hover:border-cyan-400/60 p-2" : f.color,
                    movingIconId === f.id && "ring-2 ring-amber-400 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.5)]"
                  )}
                  style={{
                    left: `${f.x}px`,
                    top: `${f.y}px`,
                    width: `${f.width}px`,
                    height: `${f.height}px`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isEditMode) {
                      setMovingIconId(f.id);
                    } else if (isDesk) {
                      setSelectedDeskMenuId(f.id);
                    } else {
                      setActiveInteractive(f.type);
                    }
                  }}
                >
                  
                  {/* Desks render dynamic assigned names with small edit pen icon */}
                  {isDesk ? (
                    <div className="flex flex-col items-center gap-1 text-center w-full relative">
                      {editingDeskId === f.id ? (
                        <div className="flex items-center gap-1 bg-slate-950/90 border border-cyan-400 rounded-lg p-0.5 pointer-events-auto z-50">
                          <input
                            type="text"
                            value={editingDeskValue}
                            onChange={(e) => setEditingDeskValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (editingDeskValue.trim()) {
                                  setFurnitureNames(prev => ({ ...prev, [f.id]: editingDeskValue.trim() }));
                                }
                                setEditingDeskId(null);
                              } else if (e.key === 'Escape') {
                                setEditingDeskId(null);
                              }
                            }}
                            className="bg-transparent text-white text-[10px] w-20 outline-none px-1 py-0.5 font-bold"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (editingDeskValue.trim()) {
                                  setFurnitureNames(prev => ({ ...prev, [f.id]: editingDeskValue.trim() }));
                              }
                              setEditingDeskId(null);
                            }}
                            className="p-1 text-emerald-400 hover:bg-slate-800 rounded transition-all"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 justify-center">
                          <span className="text-[10px] font-black text-white drop-shadow truncate max-w-[85px]">
                            {customName}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingDeskId(f.id);
                              setEditingDeskValue(customName);
                            }}
                            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-cyan-300 transition-all pointer-events-auto"
                            title="تعديل اسم المكتب"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                      
                      {/* Interactive Popover Menu */}
                      <AnimatePresence>
                        {selectedDeskMenuId === f.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 5 }}
                            className="absolute -top-24 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-white/20 rounded-2xl p-2.5 flex flex-col gap-1.5 shadow-[0_10px_25px_rgba(0,0,0,0.6)] z-50 whitespace-nowrap pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                setActiveInteractive('table');
                                setSelectedDeskMenuId(null);
                              }}
                              className="px-3.5 py-1.5 hover:bg-cyan-500 hover:text-slate-950 text-[10px] font-extrabold text-cyan-300 rounded-lg text-right transition-all flex items-center gap-1"
                            >
                              💻 ابدأ جلسة التركيز (Pomodoro)
                            </button>
                            <button
                              onClick={() => {
                                setEditingDeskId(f.id);
                                setEditingDeskValue(customName);
                                setSelectedDeskMenuId(null);
                              }}
                              className="px-3.5 py-1.5 hover:bg-slate-800 text-[10px] font-extrabold text-slate-200 rounded-lg text-right transition-all flex items-center gap-1"
                            >
                              ✏️ تعديل اسم المكتب
                            </button>
                            <button
                              onClick={() => setSelectedDeskMenuId(null)}
                              className="px-3.5 py-1 hover:bg-rose-500/20 text-rose-400 text-[10px] font-extrabold rounded-lg text-center transition-all border border-rose-500/20"
                            >
                              إلغاء
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {/* Mini monitor light */}
                      <div className="w-4 h-1.5 rounded-sm bg-cyan-400 animate-pulse mt-0.5" />
                    </div>
                  ) : null}

                  {/* Interactive Floating Action Button when Player is Near */}
                  {!isEditMode && isNear && (
                    <div 
                      className="absolute -top-14 left-1/2 -translate-x-1/2 px-4 py-1.5 glassmorphism-tooltip rounded-xl shadow-2xl animate-bounce text-xs font-bold text-cyan-300 whitespace-nowrap z-50 pointer-events-none"
                    >
                      ⚡ انقر لبدء التفاعل
                    </div>
                  )}
                </div>
              );
            })}

            {/* ═══ SPATIAL PROXIMITY LINE FOR REAL CALLS (NO BLUE CIRCLE OVERLAY) ═══ */}
            {spatialBubbleTarget && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                <line 
                  x1={currentUser.x + 45} 
                  y1={currentUser.y + 45} 
                  x2={spatialBubbleTarget.x + 45} 
                  y2={spatialBubbleTarget.y + 45} 
                  stroke="rgba(34, 211, 238, 0.6)" 
                  strokeWidth="3" 
                  strokeDasharray="6, 4"
                  className="animate-[pulse_1.5s_infinite]"
                />
              </svg>
            )}

            {/* ═══ EMPLOYEES & 3D ANIMATED AVATARS ═══ */}
            {employeesWithRestroomLogic.map((emp) => {
              if (emp.isHidden) return null; // Complete privacy hiding inside Restroom
              const mv = movingAvatars[emp.id] || { isMoving: false, scaleX: 1 };
              return (
                <div 
                  key={emp.id} 
                  className="absolute"
                  style={{ 
                    left: `${emp.x}px`, 
                    top: `${emp.y}px`, 
                    zIndex: 25 
                  }}
                >
                  <div 
                    className={clsx(
                      "transition-all duration-300",
                      mv.isMoving && "animate-[avatar-bob_0.5s_infinite]"
                    )}
                    style={{ transform: `scaleX(${mv.scaleX})` }}
                  >
                    <Avatar 
                      employee={{ ...emp, x: 0, y: 0 }} 
                      isCurrentUser={emp.id === loggedInUserId}
                      onDelete={canEditMap ? () => handleDeleteEmployee(emp.id) : undefined}
                      onPrivateCall={() => setPrivateCallTargetId(emp.id)}
                    />
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </div>

      {/* ═══ COLLAPSIBLE RIGHT SIDEBAR ═══ */}
      <OfficeSidebar 
        employees={employees} 
        currentUser={currentUser} 
        onTeleport={handleTeleport}
        onSelectRoom={setCurrentRoom}
        currentRoom={currentRoom}
        onAddEmployee={() => setShowAddEmployeeModal(true)}
        onDeleteEmployee={handleDeleteEmployee}
        onCallMeeting={handleCallMeeting}
        customRoomsList={customRoomsList}
        onCreateCompanyClick={() => {}}
        spatialBubbleTarget={spatialBubbleTarget}
        onInviteClick={() => setInviteOpen(true)}
      />

      {/* ═══ INVITE TEAM MODAL ═══ */}
      <InviteModal 
        isOpen={inviteOpen} 
        onClose={() => setInviteOpen(false)} 
        companyName={companyName}
      />

      {/* ═══ CEO PROFILE REGISTRATION/EDIT MODAL ═══ */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/20 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
                <h3 className="font-extrabold text-white text-base">👑 تسجيل ملف المدير التنفيذي</h3>
                <button 
                  onClick={() => setShowProfileModal(false)} 
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveCeoProfile} className="p-6 space-y-6">
                <div className="flex flex-col items-center gap-3">
                  {ceoEditImage ? (
                    <img src={ceoEditImage} className="w-24 h-24 rounded-full object-cover border-2 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-3xl">👤</div>
                  )}
                  <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 px-4 py-2 rounded-xl text-xs text-slate-200 transition-all font-bold">
                    <span>📤 رفع صورة المدير</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        handleFileChange(file, setCeoEditImage);
                      }} 
                    />
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">اسم المدير التنفيذي</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="ادخل اسمك الكامل..."
                    value={ceoEditName}
                    onChange={(e) => setCeoEditName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-cyan-500 text-slate-950 font-black rounded-xl hover:bg-cyan-400 transition-all"
                  >
                    حفظ وإكمال التسجيل
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ ADD NEW EMPLOYEE MODAL ═══ */}
      <AnimatePresence>
        {showAddEmployeeModal && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/20 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
                <h3 className="font-extrabold text-white text-base">👥 إضافة موظف جديد للمكتب</h3>
                <button 
                  onClick={() => setShowAddEmployeeModal(false)} 
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveNewEmployee} className="p-6 space-y-4">
                <div className="flex flex-col items-center gap-3">
                  {newEmpImage ? (
                    <img src={newEmpImage} className="w-20 h-20 rounded-full object-cover border-2 border-cyan-500 shadow-md" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-2xl">👤</div>
                  )}
                  <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 px-4 py-2 rounded-xl text-xs text-slate-200 transition-all font-bold">
                    <span>📤 رفع صورة الموظف</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        handleFileChange(file, setNewEmpImage);
                      }} 
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">رقم التعريف (ID)</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="مثال: 101"
                      value={newEmpId}
                      onChange={(e) => setNewEmpId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">اسم الموظف</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="الاسم الكامل"
                      value={newEmpName}
                      onChange={(e) => setNewEmpName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">المسمى الوظيفي</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="مثال: Designer"
                      value={newEmpRole}
                      onChange={(e) => setNewEmpRole(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">القسم</label>
                    <select 
                      value={newEmpDept}
                      onChange={(e) => setNewEmpDept(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      <option value="Management">الإدارة</option>
                      <option value="Engineering">الهندسة والتطوير</option>
                      <option value="Product">المنتج والتصميم</option>
                      <option value="HR">الموارد البشرية</option>
                      <option value="Sales">المبيعات</option>
                      <option value="Marketing">التسويق</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-3">
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-cyan-500 text-slate-950 font-black rounded-xl hover:bg-cyan-400 transition-all"
                  >
                    حفظ وإضافة الموظف
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowAddEmployeeModal(false)}
                    className="px-4 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ HIGH-FIDELITY INTERACTIVE MODALS ═══ */}
      <AnimatePresence>
        {activeInteractive && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/20 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  {activeInteractive === 'whiteboard' && '📝 سبورة الملاحظات والتخطيط'}
                  {activeInteractive === 'coffee' && '☕ ركن القهوة والنشاط'}
                  {activeInteractive === 'screen' && '🖥️ شاشة الاجتماع التفاعلية'}
                  {activeInteractive === 'arcade' && '🎮 جهاز الأركيد الكلاسيكي'}
                  {activeInteractive === 'pool' && '🎱 صالة البلياردو'}
                  {activeInteractive === 'pingpong' && '🏓 صالة تنس الطاولة'}
                  {activeInteractive === 'table' && '💻 محطة العمل والتركيز'}
                  {activeInteractive === 'plant' && '🌿 العناية بالنباتات المكتبية'}
                  {activeInteractive === 'restroom_toilet' && '🚽 سيفون دورة المياه'}
                  {activeInteractive === 'restroom_sink' && '🚰 غسيل الأيدي والتعقيم'}
                </h3>
                <button 
                  onClick={() => setActiveInteractive(null)} 
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                
                {/* 1. WORKSTATION (POMODORO & TODO) */}
                {activeInteractive === 'table' && (
                  <div className="space-y-6">
                    <div className="bg-slate-950 border border-white/10 rounded-2xl p-6 text-center space-y-4">
                      <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider">⏱️ مؤقت التركيز (Pomodoro Focus)</span>
                      <div className="text-5xl font-black text-white font-mono">
                        {String(Math.floor(pomodoroSeconds / 60)).padStart(2, '0')}:{String(pomodoroSeconds % 60).padStart(2, '0')}
                      </div>
                      <div className="flex gap-3 justify-center">
                        <button 
                          onClick={() => setPomodoroActive(!pomodoroActive)}
                          className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-xl transition-all shadow-lg"
                        >
                          {pomodoroActive ? 'إيقاف مؤقت' : 'بدء جلسة التركيز 🚀'}
                        </button>
                        <button 
                          onClick={() => { setPomodoroActive(false); setPomodoroSeconds(1500); }}
                          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
                        >
                          إعادة ضبط
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-xs font-extrabold text-slate-300">📝 قائمة المهام السريعة</span>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {todoList.map((task, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-950/60 border border-white/5 rounded-xl text-sm text-slate-200">
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400">✓</span>
                              <span>{task}</span>
                            </div>
                            <button onClick={() => setTodoList(prev => prev.filter((_, i) => i !== idx))} className="text-rose-400 hover:text-rose-300">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="أضف مهمة جديدة..."
                          value={todoInput}
                          onChange={(e) => setTodoInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && todoInput.trim()) {
                              setTodoList(prev => [...prev, todoInput.trim()]);
                              setTodoInput('');
                            }
                          }}
                          className="flex-1 px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-cyan-400"
                        />
                        <button 
                          onClick={() => {
                            if (todoInput.trim()) {
                              setTodoList(prev => [...prev, todoInput.trim()]);
                              setTodoInput('');
                            }
                          }}
                          className="px-5 py-2.5 bg-cyan-500 text-slate-950 font-bold rounded-xl hover:bg-cyan-400"
                        >
                          إضافة
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CONFERENCE BOARDROOM DISPLAY */}
                {activeInteractive === 'screen' && (
                  <div className="space-y-5 text-center">
                    <div className="bg-slate-950 border border-purple-500/30 rounded-2xl p-8 min-h-[180px] flex flex-col items-center justify-center space-y-4">
                      {isSharingScreen ? (
                        <div className="text-right w-full font-mono text-xs text-green-400 bg-black/80 p-4 rounded-xl space-y-1">
                          <p>&gt; Kalspace Live Stream Screen v2.4.0</p>
                          <p>&gt; Video: 1080p 60fps WebRTC Connected</p>
                          <p className="text-cyan-300">&gt; Status: Broadcasting to 8 team members</p>
                        </div>
                      ) : (
                        <>
                          <span className="text-xs font-bold text-purple-400">شريحة العرض {activeSlide + 1} من {slides.length}</span>
                          <h4 className="text-xl font-black text-white">{slides[activeSlide]}</h4>
                        </>
                      )}
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button 
                        onClick={() => setActiveSlide(prev => (prev - 1 + slides.length) % slides.length)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                      >
                        الشريحة السابقة ◀
                      </button>
                      <button 
                        onClick={() => setIsSharingScreen(!isSharingScreen)}
                        className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all ${isSharingScreen ? 'bg-rose-500 text-white' : 'bg-purple-600 text-white hover:bg-purple-500'}`}
                      >
                        {isSharingScreen ? 'إيقاف البث' : '📺 مشاركة الشاشة الحية'}
                      </button>
                      <button 
                        onClick={() => setActiveSlide(prev => (prev + 1) % slides.length)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                      >
                        ▶ الشريحة التالية
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. 3D BILLIARDS POOL GAME */}
                {activeInteractive === 'pool' && (
                  <div className="space-y-6 text-center">
                    <div className="bg-emerald-950/80 border-4 border-amber-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                      <div className="text-3xl mb-2">🎱</div>
                      <p className="text-sm text-emerald-200 font-bold mb-1">الكرات المسقطة في الجيوب</p>
                      <p className="text-4xl font-black text-white">{billiardsScore} / 15</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button 
                        onClick={() => setBilliardsScore(prev => Math.min(15, prev + 1))}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-lg transition-all"
                      >
                        🎯 ضرب الكرة بالعصا
                      </button>
                      <button 
                        onClick={() => setBilliardsScore(0)}
                        className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                      >
                        إعادة رص الكرات
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. TABLE TENNIS PING PONG */}
                {activeInteractive === 'pingpong' && (
                  <div className="space-y-6 text-center">
                    <div className="bg-blue-950/80 border-4 border-blue-600 rounded-3xl p-8 shadow-2xl">
                      <div className="text-3xl mb-2">🏓</div>
                      <p className="text-sm text-blue-200 font-bold mb-1">عدد التمريرات المتتالية (Rallies)</p>
                      <p className="text-4xl font-black text-white">{pingPongRallies}</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button 
                        onClick={() => setPingPongRallies(prev => prev + 1)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-lg transition-all"
                      >
                        🏓 رد الكرة بالمضرب
                      </button>
                      <button 
                        onClick={() => setPingPongRallies(0)}
                        className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                      >
                        إعادة الجولة
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. ESPRESSO COFFEE */}
                {activeInteractive === 'coffee' && (
                  <div className="space-y-6 text-center">
                    <div className="bg-amber-950/60 border border-amber-500/30 rounded-2xl p-8">
                      <div className="text-5xl mb-3 animate-bounce">☕</div>
                      <h4 className="text-xl font-bold text-amber-300">آلة الإسبريسو الإيطالية</h4>
                      <p className="text-xs text-slate-300 mt-1">احصل على جرعة كافيين لزيادة سرعة شخصيتك في المكتب!</p>
                    </div>
                    <button 
                      onClick={() => {
                        setCoffeeStatus('Speed Boost Active 🚀');
                        setActiveInteractive(null);
                        setTimeout(() => setCoffeeStatus(null), 10000);
                      }}
                      className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg"
                    >
                      ☕ تحضير وشرب القهوة
                    </button>
                  </div>
                )}

                {/* 6. TOILET FLUSH */}
                {activeInteractive === 'restroom_toilet' && (
                  <div className="space-y-6 text-center">
                    <div className="bg-slate-950 border border-slate-700 rounded-2xl p-8">
                      <div className="text-5xl mb-3">🚽</div>
                      <p className="text-sm text-slate-300 font-bold">سيفون المياه الذكي</p>
                    </div>
                    <button 
                      onClick={() => {
                        setFlushTrigger(true);
                        setTimeout(() => setFlushTrigger(false), 2000);
                      }}
                      className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl shadow-lg"
                    >
                      {flushTrigger ? '🌊 جاري سحب المياه...' : '💧 سحب السيفون'}
                    </button>
                  </div>
                )}

                {/* 7. HAND WASH SINK */}
                {activeInteractive === 'restroom_sink' && (
                  <div className="space-y-6 text-center">
                    <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-8 space-y-3">
                      <div className="text-5xl">🚰</div>
                      <p className="text-sm text-cyan-300 font-bold">مستوى التعقيم والنظافة</p>
                      <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full rounded-full transition-all" style={{ width: `${cleanliness}%` }} />
                      </div>
                      <span className="text-xs font-bold text-white">{cleanliness}%</span>
                    </div>
                    <button 
                      onClick={() => setCleanliness(100)}
                      className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl shadow-lg"
                    >
                      🧼 غسل اليدين بالصابون
                    </button>
                  </div>
                )}

                {/* 8. WATER PLANT */}
                {activeInteractive === 'plant' && (
                  <div className="space-y-6 text-center">
                    <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-8">
                      <div className="text-5xl mb-2">🪴</div>
                      <p className="text-sm text-emerald-300 font-bold">مستوى نمو النبتة: {plantLevel}</p>
                    </div>
                    <button 
                      onClick={() => setPlantLevel(prev => prev + 1)}
                      className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg"
                    >
                      💧 سقي النبتة
                    </button>
                  </div>
                )}

                {/* 9. RETRO ARCADE */}
                {activeInteractive === 'arcade' && (
                  <div className="space-y-6 text-center">
                    <div className="bg-purple-950/80 border border-pink-500/30 rounded-2xl p-8">
                      <div className="text-5xl mb-2 animate-bounce">👾</div>
                      <p className="text-xs text-pink-300 font-bold mb-1">النقاط القياسية (Score)</p>
                      <p className="text-4xl font-black text-white">{arcadeScore}</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button 
                        onClick={() => setArcadeScore(prev => prev + 10)}
                        className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-black rounded-xl shadow-lg"
                      >
                        🕹️ لعب / كسب 10 نقاط!
                      </button>
                      <button onClick={() => setArcadeScore(0)} className="px-4 py-3 bg-slate-800 text-slate-300 rounded-xl">
                        إعادة
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
