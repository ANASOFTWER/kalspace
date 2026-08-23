"use client";

import { useState, useEffect } from 'react';
import { Users, MessageSquare, Paintbrush, Compass, Smile, Radio, ChevronRight, ChevronLeft, Menu } from 'lucide-react';
import { Employee } from './Avatar';
import { motion, AnimatePresence } from 'framer-motion';

interface OfficeSidebarProps {
  employees: Employee[];
  currentUser: Employee;
  onTeleport: (targetId: string) => void;
  onSelectRoom: (roomName: string) => void;
  currentRoom: string;
  onAddEmployee?: () => void;
  onDeleteEmployee?: (id: string) => void;
  onCallMeeting?: (selectedIds: string[]) => void;
  customRoomsList?: string[];
  onCreateCompanyClick?: () => void;
  spatialBubbleTarget?: Employee | null;
  onInviteClick?: () => void;
  chatMessages?: any[];
  onSendChat?: (text: string, target: string) => void;
  onStartPrivateCall?: (targetId: string) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  activeTab?: 'people' | 'chat' | 'rooms';
  onTabChange?: (tab: 'people' | 'chat' | 'rooms') => void;
  defaultMessageTarget?: string;
  unreadCount?: number;
  onClearChat?: () => void;
}

export default function OfficeSidebar({ 
  employees, 
  currentUser, 
  onTeleport, 
  onSelectRoom,
  currentRoom,
  onAddEmployee,
  onDeleteEmployee,
  onCallMeeting,
  customRoomsList = [],
  onCreateCompanyClick,
  spatialBubbleTarget,
  onInviteClick,
  chatMessages: chatMessagesProp,
  onSendChat,
  onStartPrivateCall,
  isOpen: isOpenProp,
  onOpenChange,
  activeTab: activeTabProp,
  onTabChange,
  defaultMessageTarget,
  unreadCount = 0,
  onClearChat,
}: OfficeSidebarProps) {
  const activeEmployees = employees.filter(emp => !emp.is_terminated);
  
  interface ChatMessage {
    id: string;
    author: string;
    text: string;
    time: string;
    isPrivate?: boolean;
    recipientName?: string;
  }
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const displayedMessages = chatMessagesProp || chatMessages;
  const [inputText, setInputText] = useState('');
  const [messageTarget, setMessageTarget] = useState<string>('all');

  useEffect(() => {
    if (defaultMessageTarget) {
      setMessageTarget(defaultMessageTarget);
    }
  }, [defaultMessageTarget]);

  const [isOpenState, setIsOpenState] = useState(false);
  const isOpen = isOpenProp !== undefined ? isOpenProp : isOpenState;
  const setIsOpen = onOpenChange || setIsOpenState;

  const [activeTabState, setActiveTabState] = useState<'people' | 'chat' | 'rooms'>('people');
  const activeTab = activeTabProp !== undefined ? activeTabProp : activeTabState;
  const setActiveTab = onTabChange || setActiveTabState;

  // RBAC permissions
  const isManager = currentUser.role === 'CEO' || currentUser.role === 'admin' || currentUser.role === 'manager';
  const isHR = currentUser.department === 'HR';
  const canManageEmployees = isManager || isHR;

  // Meeting Selection Mode
  const [selectMode, setSelectMode] = useState(false);
  const [selectedForMeeting, setSelectedForMeeting] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedForMeeting);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedForMeeting(newSet);
  };

  const handleSummon = () => {
    if (onCallMeeting && selectedForMeeting.size > 0) {
      onCallMeeting(Array.from(selectedForMeeting));
      setSelectMode(false);
      setSelectedForMeeting(newSet => { newSet.clear(); return newSet; });
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    if (onSendChat) {
      onSendChat(inputText, messageTarget);
    } else {
      const isPrivate = messageTarget !== 'all';
      const targetEmployee = (messageTarget as string) === 'spatial_bubble' ? spatialBubbleTarget : employees.find(emp => emp.id === messageTarget);
      
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        author: currentUser.name,
        text: inputText,
        time: 'Just Now',
        isPrivate: isPrivate || (messageTarget as string) === 'spatial_bubble',
        recipientName: targetEmployee ? targetEmployee.name : undefined
      }]);
    }
    setInputText('');
  };



  return (
    <>
      {/* Floating Toggle Button (Visible when closed) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="absolute top-24 left-6 z-40 bg-slate-900/90 border border-slate-700 text-white p-2.5 rounded-xl shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-2 group pointer-events-auto"
        >
          <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold px-1 hidden md:block">القائمة</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse border border-slate-900 shadow-lg">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Collapsible Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="h-full border-l border-white/15 bg-slate-950/95 backdrop-blur-xl flex flex-col z-45 w-[320px] absolute right-0 top-0 overflow-hidden shadow-[-20px_0_40px_rgba(0,0,0,0.5)]"
          >
            {/* Collapse Button Header */}
            <div className="flex items-center justify-between p-3 border-b border-white/10 shrink-0" dir="rtl">
               <h3 className="text-white font-bold text-sm tracking-wide">المقر الافتراضي</h3>
               <button 
                 onClick={() => setIsOpen(false)}
                 className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-all"
               >
                  <ChevronRight className="w-4 h-4" />
               </button>
            </div>

            {/* Tabs Header */}
            <div className="flex border-b border-white/10 p-2 shrink-0">
          {[
            { id: 'people', label: 'الموظفين', icon: Users },
            { id: 'chat', label: 'الدردشة', icon: MessageSquare },
            { id: 'rooms', label: 'الشركات/الغرف', icon: Compass },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === tab.id ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="relative">
                {tab.label}
                {tab.id === 'chat' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-3.5 bg-red-500 text-white text-[8px] font-bold w-3 h-3 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </span>
            </button>
          ))}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
         {activeTab === 'people' && (
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">In this space ({activeEmployees.length})</h3>
                {canManageEmployees && (
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setSelectMode(!selectMode)}
                      className={`p-1.5 rounded-md text-[10px] font-bold transition-all ${selectMode ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                      title="Select for Meeting"
                    >
                      Meeting
                    </button>
                    <button 
                      onClick={onAddEmployee}
                      className="p-1.5 rounded-md text-[10px] font-bold bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all"
                      title="Add Employee"
                    >
                      + Add
                    </button>
                    {onInviteClick && (
                       <button 
                         onClick={onInviteClick}
                         className="p-1.5 rounded-md text-[10px] font-bold bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
                         title="Invite Team"
                       >
                         👥 Invite
                       </button>
                     )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {activeEmployees.map(emp => (
                  <div key={emp.id} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between gap-3">
                     <div className="flex items-center gap-2 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm">
                             {emp.name.charAt(0)}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-slate-900" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{emp.name}</h4>
                          <span className="text-[9px] text-slate-400 block truncate">{emp.role}</span>
                        </div>
                     </div>
                     {/* Conditional Actions based on Permissions & Mode */}
                     <div className="flex items-center gap-1.5">
                       {selectMode ? (
                         <input 
                           type="checkbox" 
                           checked={selectedForMeeting.has(emp.id)}
                           onChange={() => toggleSelection(emp.id)}
                           className="w-4 h-4 rounded border-slate-600 accent-primary"
                         />
                       ) : (
                         <>
                            {emp.id !== currentUser.id && (
                              <div className="flex gap-1 items-center">
                                <button 
                                  onClick={() => onTeleport(emp.id)}
                                  className="px-2.5 py-1 bg-primary/20 hover:bg-primary text-primary hover:text-white text-[10px] font-bold rounded transition-all shrink-0"
                                >
                                  Teleport
                                </button>
                                {onStartPrivateCall && (
                                  <button 
                                    onClick={() => onStartPrivateCall(emp.id)}
                                    className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded border border-emerald-500/30 transition-all shrink-0 font-bold"
                                    title="مكالمة خاصة"
                                  >
                                    📞
                                  </button>
                                )}
                              </div>
                            )}
                           {/* Delete Button for Managers/HR */}
                           {canManageEmployees && onDeleteEmployee && emp.id !== currentUser.id && (isManager || emp.role !== 'CEO') && (
                             <button 
                               onClick={() => onDeleteEmployee(emp.id)}
                               className="px-2 py-1 bg-danger/10 hover:bg-danger text-danger hover:text-white text-[10px] font-bold rounded transition-all shrink-0 ml-1"
                               title="Delete Employee"
                             >
                               🗑️
                             </button>
                           )}
                         </>
                       )}
                     </div>
                  </div>
                ))}
              </div>
              
              {/* Meeting Summon Button */}
              {selectMode && (
                <button 
                  onClick={handleSummon}
                  disabled={selectedForMeeting.size === 0}
                  className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                >
                  Summon to Boardroom ({selectedForMeeting.size})
                </button>
              )}
           </div>
         )}

         {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
               <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3 shrink-0" dir="rtl">
                 <h3 className="text-xs font-bold text-slate-400">المحادثات</h3>
                 {onClearChat && (
                   <button 
                     onClick={onClearChat}
                     className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[10px] text-red-400 hover:text-red-300 font-bold rounded-lg transition-all"
                   >
                     مسح الدردشة
                   </button>
                 )}
               </div>
               <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
                  {displayedMessages.map(msg => (
                   <div key={msg.id} className={`p-2.5 border rounded-xl ${msg.isPrivate ? 'bg-indigo-900/40 border-indigo-500/50' : 'bg-slate-900/40 border-slate-800'}`}>
                      <div className="flex items-baseline justify-between mb-1">
                         <span className="text-[10px] font-bold text-slate-300">
                           {msg.author} 
                           {msg.isPrivate && <span className="text-indigo-400"> (Private to {msg.recipientName})</span>}
                         </span>
                         <span className="text-[8px] text-slate-500">{msg.time}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-normal">{msg.text}</p>
                   </div>
                 ))}
              </div>
              <div className="mt-auto space-y-2">
                 <select 
                   value={messageTarget}
                   onChange={(e) => setMessageTarget(e.target.value)}
                   className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-primary transition-colors"
                 >
                   <option value="all">Everyone (Public)</option>
                   {spatialBubbleTarget && (
                     <option value="spatial_bubble">🔒 Private Spatial Bubble (With {spatialBubbleTarget.name})</option>
                   )}
                   <optgroup label="Direct Message (Private)">
                     {activeEmployees.filter(e => e.id !== currentUser.id).map(emp => (
                       <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                     ))}
                   </optgroup>
                 </select>
                 <form onSubmit={handleSendChat} className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    />
                    <button type="submit" className="px-3 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition-colors">
                       Send
                    </button>
                 </form>
              </div>
           </div>
         )}

         {activeTab === 'rooms' && (
           <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Office Floors</h3>
                {onCreateCompanyClick && isManager && (
                  <button 
                    onClick={onCreateCompanyClick}
                    className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 rounded-lg text-[10px] text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/10 flex items-center gap-1"
                  >
                    <span>🏢</span>
                    <span>تأسيس شركة</span>
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                 {[
                   { name: 'SaaS Main Office', desc: 'Main team working space', bg: 'bg-primary' },
                   { name: 'Gaming & Sports Lounge', desc: 'Billiards, Table Tennis, Arcades', bg: 'bg-indigo-600' },
                   { name: 'Rooftop Party Lounge', desc: 'Social lounge & drinks bar', bg: 'bg-secondary' },
                   { name: 'Quiet Zen Garden', desc: 'Quiet workspace with soft tunes', bg: 'bg-emerald-800' },
                   ...customRoomsList.map(name => ({
                      name,
                      desc: 'شركة مخصصة تم إنشاؤها وتصميمها بالكامل',
                      bg: 'bg-amber-900'
                    }))
                 ].map(room => (
                   <button
                     key={room.name}
                     onClick={() => onSelectRoom(room.name)}
                     className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                       currentRoom === room.name 
                         ? 'border-primary bg-primary/10' 
                         : 'border-slate-850 bg-slate-900/50 hover:bg-slate-900'
                     }`}
                   >
                      <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-white text-xs ${room.bg}`}>
                         {room.name.charAt(0)}
                      </div>
                      <div>
                         <h4 className="text-xs font-bold text-white">{room.name}</h4>
                         <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{room.desc}</p>
                      </div>
                   </button>
                 ))}
              </div>
           </div>
         )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
