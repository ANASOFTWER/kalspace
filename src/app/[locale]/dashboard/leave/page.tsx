"use client";

import { useState, useEffect } from 'react';
import { CalendarPlus, FileText, CheckCircle2, Clock, X, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LeaveRequest {
  id: string;
  type: string;
  dates: string;
  duration: string;
  status: string;
}

const MOCK_LEAVES: LeaveRequest[] = [];

export default function LeavePage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Balance calculation (Simple mock offsets + dynamic updates)
  const [annualBalance, setAnnualBalance] = useState(14);
  const [sickBalance, setSickBalance] = useState(5);

  useEffect(() => {
    async function loadLeaves() {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setIsDemo(true);
          setLeaves(MOCK_LEAVES);
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
          setLeaves(MOCK_LEAVES);
          return;
        }

        setUserCompanyId(profile.company_id);

        const { data: dbLeaves, error: dbError } = await supabase
          .from('leaves')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (dbError) throw dbError;

        const formatted = (dbLeaves || []).map(l => {
          const typeName = l.type === 'annual' ? 'Annual Leave' : l.type === 'sick' ? 'Sick Leave' : 'Unpaid Leave';
          return {
            id: l.id,
            type: typeName,
            dates: `${l.start_date} - ${l.end_date}`,
            duration: l.duration,
            status: l.status.charAt(0).toUpperCase() + l.status.slice(1) // Capitalize (Approved, Pending, Rejected)
          };
        });

        // Compute balances: start from max and subtract approved leaves
        let annualUsed = 0;
        let sickUsed = 0;
        (dbLeaves || []).forEach(l => {
          if (l.status === 'approved') {
            const days = parseInt(l.duration) || 0;
            if (l.type === 'annual') annualUsed += days;
            if (l.type === 'sick') sickUsed += days;
          }
        });

        setAnnualBalance(Math.max(0, 30 - annualUsed));
        setSickBalance(Math.max(0, 10 - sickUsed));

        setLeaves(formatted);
        setIsDemo(false);
      } catch (err) {
        console.error('Error loading leaves, running in demo mode:', err);
        setIsDemo(true);
        setLeaves(MOCK_LEAVES);
      } finally {
        setLoading(false);
      }
    }

    loadLeaves();
  }, []);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrorMsg('');

    try {
      const typeName = leaveType === 'annual' ? 'Annual Leave' : leaveType === 'sick' ? 'Sick Leave' : 'Unpaid Leave';
      const formattedDuration = `${duration} Days`;

      if (isDemo) {
        const newMockLeave: LeaveRequest = {
          id: `mock-${Date.now()}`,
          type: typeName,
          dates: `${startDate} - ${endDate}`,
          duration: formattedDuration,
          status: 'Pending'
        };
        setLeaves(prev => [newMockLeave, ...prev]);
        setIsOpen(false);
        return;
      }

      if (!userCompanyId || !currentUserId) {
        throw new Error('لم يتم العثور على معلومات الهوية أو الشركة.');
      }

      const { data, error } = await supabase
        .from('leaves')
        .insert({
          company_id: userCompanyId,
          user_id: currentUserId,
          type: leaveType,
          start_date: startDate,
          end_date: endDate,
          duration: formattedDuration,
          status: 'pending'
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(error?.message || 'فشل تقديم طلب الإجازة.');
      }

      const formattedNew = {
        id: data.id,
        type: typeName,
        dates: `${data.start_date} - ${data.end_date}`,
        duration: data.duration,
        status: 'Pending'
      };

      setLeaves(prev => [formattedNew, ...prev]);
      setIsOpen(false);
    } catch (err: any) {
      console.error('Error requesting leave:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء تقديم طلب الإجازة.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="h-full p-4 md:p-6 flex flex-col animate-fade-in-up">


      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">طلبات الإجازات (Leave Requests)</h1>
          <p className="text-slate-400">إدارة وتقديم طلبات الإجازة والعطلات الخاصة بك</p>
        </div>
        <button
          onClick={() => {
            setIsOpen(true);
            setLeaveType('annual');
            setStartDate('');
            setEndDate('');
            setDuration('');
            setErrorMsg('');
          }}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-all shadow-lg shadow-primary/25 flex items-center gap-2"
        >
          <CalendarPlus className="w-4 h-4" /> طلب إجازة جديد
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'إجازة سنوية (Annual)', available: annualBalance, total: 30, color: 'text-primary' },
          { label: 'إجازة مرضية (Sick)', available: sickBalance, total: 10, color: 'text-warning' },
          { label: 'إجازة غير مدفوعة (Unpaid)', available: 'Unlimited', total: null, color: 'text-slate-400' },
        ].map((balance, i) => (
          <div key={i} className="glass-card rounded-2xl p-6 border border-white/10">
            <h3 className="text-slate-400 font-medium mb-4 text-sm">{balance.label}</h3>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-bold ${balance.color}`}>{balance.available}</span>
              {balance.total && <span className="text-slate-500 mb-1 text-xs">/ {balance.total} يوم</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Request History */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-white/10 flex-1 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-semibold text-white">الطلبات الأخيرة</h2>
          </div>
          <div className="flex-1 overflow-auto p-6 space-y-4">
            {leaves.length === 0 ? (
              <p className="text-sm text-slate-500 py-8 text-center">لا توجد طلبات إجازة سابقة.</p>
            ) : (
              leaves.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white text-sm">
                        {req.type === 'Annual Leave' ? 'إجازة سنوية' : req.type === 'Sick Leave' ? 'إجازة مرضية' : 'إجازة غير مدفوعة'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">{req.dates} • {req.duration === '1 Days' ? 'يوم واحد' : `${req.duration.split(' ')[0]} أيام`}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                    req.status === 'Approved' 
                      ? 'text-success bg-success/10 border border-success/20' 
                      : req.status === 'Pending'
                        ? 'text-warning bg-warning/10 border border-warning/20'
                        : 'text-danger bg-danger/10 border border-danger/20'
                  }`}>
                    {req.status === 'Approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {req.status === 'Approved' ? 'تمت الموافقة' : req.status === 'Pending' ? 'تحت المراجعة' : 'مرفوض'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Request Leave Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative animate-fade-in-up">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-2">تقديم طلب إجازة</h3>
            <p className="text-sm text-slate-400 mb-6">يرجى تحديد تفاصيل الإجازة وتواريخ الغياب بدقة.</p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger/25 rounded-lg text-danger text-sm font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">نوع الإجازة</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                >
                  <option value="annual">إجازة سنوية (Annual Leave)</option>
                  <option value="sick">إجازة مرضية (Sick Leave)</option>
                  <option value="unpaid">إجازة غير مدفوعة الأجر (Unpaid Leave)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">تاريخ البدء</label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    placeholder="مثال: 12 Aug"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">تاريخ الانتهاء</label>
                  <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    placeholder="مثال: 15 Aug"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">مدة الغياب (بالأيام)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  min={1}
                  placeholder="مثال: 4"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                {submitLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'تقديم الطلب للموافقة'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
