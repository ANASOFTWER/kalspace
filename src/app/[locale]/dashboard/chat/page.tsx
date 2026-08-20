"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, Hash, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  channel: string;
  created_at: string;
}

interface TeamMember {
  id: string;
  full_name: string;
  role: string;
  status?: string;
}

const MOCK_CHANNELS = [
  { id: 'general', name: 'العامة (general)' },
  { id: 'engineering', name: 'المطورين (engineering)' },
  { id: 'design', name: 'التصميم (design)' },
];

const MOCK_MESSAGES: Message[] = [];

const MOCK_DMS: TeamMember[] = [];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [channels] = useState(MOCK_CHANNELS);
  const [activeChannel, setActiveChannel] = useState('general');
  const [dms, setDms] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState('أنا');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load initial settings and data
  useEffect(() => {
    async function loadChatInfo() {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setIsDemo(true);
          setMessages(MOCK_MESSAGES);
          setDms(MOCK_DMS);
          return;
        }

        const userId = session.user.id;
        setCurrentUserId(userId);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('company_id, full_name')
          .eq('id', userId)
          .single();

        if (profileError || !profile || !profile.company_id) {
          setIsDemo(true);
          setMessages(MOCK_MESSAGES);
          setDms(MOCK_DMS);
          return;
        }

        setUserCompanyId(profile.company_id);
        setCurrentUserName(profile.full_name || 'أنا');

        // Load DMs (team profiles)
        const { data: team, error: teamError } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('company_id', profile.company_id);

        if (teamError) throw teamError;

        // Assign some dummy presence status for visual interest
        const statuses = ['online', 'busy', 'meeting', 'offline'];
        const mappedDms = (team || []).map((t, idx) => ({
          ...t,
          status: statuses[idx % statuses.length]
        }));
        setDms(mappedDms);

        // Load Messages for general channel
        const { data: chatData, error: msgError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('company_id', profile.company_id)
          .eq('channel', activeChannel)
          .order('created_at', { ascending: true });

        if (msgError) throw msgError;

        setMessages(chatData || []);
        setIsDemo(false);
      } catch (err) {
        console.error('Error loading chat, running in demo mode:', err);
        setIsDemo(true);
        setMessages(MOCK_MESSAGES);
        setDms(MOCK_DMS);
      } finally {
        setLoading(false);
      }
    }

    loadChatInfo();
  }, [activeChannel]);

  // Realtime subscription for messages
  useEffect(() => {
    if (isDemo || !userCompanyId) return;

    const channel = supabase
      .channel('realtime-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `company_id=eq.${userCompanyId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.channel === activeChannel) {
            setMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userCompanyId, activeChannel, isDemo]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const textToSend = inputText;
      setInputText('');

      if (isDemo) {
        const newMsg: Message = {
          id: `mock-${Date.now()}`,
          sender_id: currentUserId || 'mock-user',
          sender_name: currentUserName,
          text: textToSend,
          channel: activeChannel,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMsg]);
        return;
      }

      if (!userCompanyId || !currentUserId) return;

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          company_id: userCompanyId,
          sender_id: currentUserId,
          sender_name: currentUserName,
          text: textToSend,
          channel: activeChannel
        })
        .select()
        .single();

      if (error || !data) throw error;

      // Update state (if realtime trigger hasn't fired it yet)
      setMessages(prev => {
        if (prev.some(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
    } catch (err) {
      console.error('Error sending message:', err);
      alert('فشل إرسال الرسالة.');
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Just Now';
    }
  };

  return (
    <div className="h-full p-4 md:p-6 flex flex-col animate-fade-in-up">


      <div className="flex-1 flex bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden min-h-[500px] h-[calc(100vh-140px)]">
        {/* Chat Sidebar */}
        <div className="w-64 border-r border-white/5 flex flex-col p-4 shrink-0 hidden md:flex">
          <h2 className="text-lg font-bold text-white mb-6">المراسلات (Messages)</h2>
          
          <div className="space-y-6 flex-1 overflow-y-auto pr-1">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">القنوات (Channels)</span>
              <div className="space-y-1">
                {channels.map(ch => (
                  <button 
                    key={ch.id} 
                    onClick={() => setActiveChannel(ch.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                      activeChannel === ch.id 
                        ? 'bg-primary/10 text-primary font-semibold' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Hash className="w-4 h-4" /> {ch.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">الرسائل المباشرة (DMs)</span>
              <div className="space-y-1">
                {dms.map(dm => (
                  <button 
                    key={dm.id} 
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      dm.status === 'online' ? 'bg-success' : dm.status === 'busy' ? 'bg-warning' : dm.status === 'meeting' ? 'bg-danger' : 'bg-slate-500'
                    }`} />
                    <span>{dm.full_name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full bg-slate-950/20">
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/10">
            <span className="font-bold text-white flex items-center gap-1.5 text-sm md:text-base">
              <Hash className="w-4 h-4 text-primary" />
              {channels.find(c => c.id === activeChannel)?.name || activeChannel}
            </span>
          </div>
          
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                لا توجد رسائل في هذه القناة بعد. ابدأ محادثة جديدة!
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="flex gap-3 animate-fade-in-up">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white shrink-0 text-sm">
                    {msg.sender_name ? msg.sender_name.charAt(0) : '?'}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-white text-xs md:text-sm">{msg.sender_name}</span>
                      <span className="text-[9px] text-slate-500">{formatTime(msg.created_at)}</span>
                    </div>
                    <p className="text-slate-300 text-xs md:text-sm mt-1 leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-4 border-t border-white/5 flex gap-2 bg-slate-900/10">
            <input
              type="text"
              placeholder="اكتب رسالتك..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors text-xs md:text-sm"
            />
            <button 
              type="submit" 
              className="p-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-all shadow-lg shadow-primary/25"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
