"use client";

import { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, Coffee, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AttendanceRecord {
  id: string;
  day: string;
  in: string;
  out: string;
  total: string;
  status: string;
}

const MOCK_RECORDS: AttendanceRecord[] = [];

export default function AttendancePage() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('--:--');
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Time ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        timeZone: 'Asia/Riyadh',
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load history and state
  useEffect(() => {
    async function loadAttendance() {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setIsDemo(true);
          setHistory(MOCK_RECORDS);
          return;
        }

        const userId = session.user.id;
        setCurrentUserId(userId);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', userId)
          .single();

        if (profileError || !profile || !profile.company_id) {
          setIsDemo(true);
          setHistory(MOCK_RECORDS);
          return;
        }

        setUserCompanyId(profile.company_id);

        // Fetch active session (where check_out is null)
        const { data: active, error: activeError } = await supabase
          .from('attendance')
          .select('*')
          .eq('user_id', userId)
          .is('check_out', null)
          .maybeSingle();

        if (active) {
          setCurrentSessionId(active.id);
          setIsCheckedIn(true);
          setIsOnBreak(active.status === 'Break');
        }

        // Fetch historical sessions
        const { data: records, error: listError } = await supabase
          .from('attendance')
          .select('*')
          .eq('user_id', userId)
          .order('check_in', { ascending: false })
          .limit(10);

        if (listError) throw listError;

        const formatted = (records || []).map(r => {
          const checkInDate = new Date(r.check_in);
          const checkOutDate = r.check_out ? new Date(r.check_out) : null;
          
          let totalTime = '--';
          if (checkOutDate) {
            const diffMs = checkOutDate.getTime() - checkInDate.getTime();
            const diffHrs = Math.floor(diffMs / 3600000);
            const diffMins = Math.floor((diffMs % 3600000) / 60000);
            totalTime = `${diffHrs}h ${diffMins}m`;
          }

          return {
            id: r.id,
            day: checkInDate.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'short' }),
            in: checkInDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            out: checkOutDate ? checkOutDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--',
            total: totalTime,
            status: r.status
          };
        });

        setHistory(formatted);
        setIsDemo(false);
      } catch (err) {
        console.error('Error loading attendance, running in demo mode:', err);
        setIsDemo(true);
        setHistory(MOCK_RECORDS);
      } finally {
        setLoading(false);
      }
    }

    loadAttendance();
  }, []);

  const handleClockIn = async () => {
    try {
      const now = new Date();
      if (isDemo) {
        setIsCheckedIn(true);
        setIsOnBreak(false);
        const newRecord: AttendanceRecord = {
          id: `mock-session`,
          day: 'اليوم',
          in: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          out: '--:--',
          total: 'Working',
          status: 'Working'
        };
        setHistory(prev => [newRecord, ...prev]);
        return;
      }

      if (!userCompanyId || !currentUserId) return;

      const { data, error } = await supabase
        .from('attendance')
        .insert({
          company_id: userCompanyId,
          user_id: currentUserId,
          status: 'Working'
        })
        .select()
        .single();

      if (error || !data) throw error;

      setCurrentSessionId(data.id);
      setIsCheckedIn(true);
      setIsOnBreak(false);

      // Refresh list
      const checkInDate = new Date(data.check_in);
      const newRecord = {
        id: data.id,
        day: checkInDate.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'short' }),
        in: checkInDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        out: '--:--',
        total: 'Working',
        status: 'Working'
      };
      setHistory(prev => [newRecord, ...prev]);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تسجيل الدخول.');
    }
  };

  const handleClockOut = async () => {
    try {
      const now = new Date();
      if (isDemo) {
        setIsCheckedIn(false);
        setIsOnBreak(false);
        setHistory(prev => prev.map(r => r.id === 'mock-session' ? {
          ...r,
          out: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          total: 'Completed',
          status: 'Completed'
        } : r));
        return;
      }

      if (!currentSessionId) return;

      const { data, error } = await supabase
        .from('attendance')
        .update({
          check_out: now.toISOString(),
          status: 'Completed'
        })
        .eq('id', currentSessionId)
        .select()
        .single();

      if (error) throw error;

      setIsCheckedIn(false);
      setIsOnBreak(false);
      setCurrentSessionId(null);

      // Refresh list
      const checkInDate = new Date(data.check_in);
      const checkOutDate = new Date(data.check_out);
      const diffMs = checkOutDate.getTime() - checkInDate.getTime();
      const diffHrs = Math.floor(diffMs / 3600000);
      const diffMins = Math.floor((diffMs % 3600000) / 60000);
      const totalTime = `${diffHrs}h ${diffMins}m`;

      setHistory(prev => prev.map(r => r.id === data.id ? {
        ...r,
        out: checkOutDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        total: totalTime,
        status: 'Completed'
      } : r));
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تسجيل الانصراف.');
    }
  };

  const handleBreakToggle = async () => {
    try {
      const newStatus = isOnBreak ? 'Working' : 'Break';
      if (isDemo) {
        setIsOnBreak(!isOnBreak);
        setHistory(prev => prev.map(r => r.id === 'mock-session' ? { ...r, status: newStatus } : r));
        return;
      }

      if (!currentSessionId) return;

      const { data, error } = await supabase
        .from('attendance')
        .update({ status: newStatus })
        .eq('id', currentSessionId)
        .select()
        .single();

      if (error) throw error;

      setIsOnBreak(newStatus === 'Break');
      setHistory(prev => prev.map(r => r.id === data.id ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تبديل حالة الاستراحة.');
    }
  };

  return (
    <div className="h-full p-4 md:p-6 flex flex-col animate-fade-in-up">
      {/* Demo Warning Banner */}
      {isDemo && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-2xl flex items-center gap-3 text-warning text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <strong>وضع المعاينة (Demo Mode):</strong> حركات الحضور تتم محاكاتها محلياً. لربطها بقاعدة بيانات حقيقية، يرجى تهيئة Supabase.
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">الحضور والانصراف (Attendance)</h1>
          <p className="text-slate-400">تتبع ساعات عملك اليومية وتسجيل حركتك</p>
        </div>
      </div>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Action Box */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center text-center">
            <h2 className="text-5xl font-bold text-white mb-2">{currentTime}</h2>
            <p className="text-slate-400 mb-6">الوقت الحالي (Asia/Riyadh)</p>
            
            {!isCheckedIn ? (
              <button 
                onClick={handleClockIn}
                className="w-full py-4 bg-success hover:bg-success/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-success/20"
              >
                <LogIn className="w-5 h-5" /> تسجيل الحضور (Clock In)
              </button>
            ) : (
              <div className="flex gap-3 w-full">
                <button 
                  onClick={handleBreakToggle}
                  className={`flex-1 py-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    isOnBreak ? 'bg-primary hover:bg-primary/95' : 'bg-warning hover:bg-warning/90'
                  }`}
                >
                  <Coffee className="w-5 h-5" /> {isOnBreak ? 'استئناف العمل' : 'استراحة (Break)'}
                </button>
                <button 
                  onClick={handleClockOut}
                  className="flex-1 py-4 bg-danger hover:bg-danger/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-danger/20"
                >
                  <LogOut className="w-5 h-5" /> الانصراف (Clock Out)
                </button>
              </div>
            )}
          </div>

          {/* History Log */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">سجل الحركات الأخير</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {history.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">لا توجد حركات حضور مسجلة.</p>
              ) : (
                history.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <div className="w-1/4 font-medium text-sm text-white">{record.day}</div>
                    <div className="w-1/4 text-slate-400 text-xs md:text-sm">دخول: <span className="text-white font-medium">{record.in}</span></div>
                    <div className="w-1/4 text-slate-400 text-xs md:text-sm">خروج: <span className="text-white font-medium">{record.out}</span></div>
                    <div className="w-1/4 text-right">
                      <span className={`px-2.5 py-1 rounded text-[10px] md:text-xs font-bold ${
                        record.status === 'Working' 
                          ? 'bg-primary/10 text-primary border border-primary/20' 
                          : record.status === 'Break'
                            ? 'bg-warning/10 text-warning border border-warning/20'
                            : 'bg-success/10 text-success border border-success/20'
                      }`}>
                        {record.status === 'Working' ? 'يعمل' : record.status === 'Break' ? 'في استراحة' : record.total}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
