"use client";

import { useState, useEffect } from 'react';
import { CalendarPlus, FileText, CheckCircle2, Clock, X, AlertTriangle, User, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import clsx from 'clsx';

interface LeaveRequest {
  id: string;
  type: string;
  dates: string;
  duration: string;
  status: string;
  reason?: string;
  manager_comment?: string;
  employee_name?: string;
  user_id?: string;
}

export default function LeavePage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [allCompanyLeaves, setAllCompanyLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('employee');

  // Tab State for Manager
  const [activeTab, setActiveTab] = useState<'personal' | 'employees'>('personal');

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState('');
  const [reason, setReason] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Manager Actions State
  const [managerComments, setManagerComments] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // Balance calculation
  const [annualBalance, setAnnualBalance] = useState(14);
  const [sickBalance, setSickBalance] = useState(5);

  async function loadLeaves() {
    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setIsDemo(true);
        return;
      }

      const userId = session.user.id;
      setCurrentUserId(userId);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, company_id')
        .eq('id', userId)
        .single();

      if (profileError || !profile || !profile.company_id) {
        setIsDemo(true);
        return;
      }

      const companyId = profile.company_id;
      setUserCompanyId(companyId);
      setCurrentUserRole(profile.role);

      const isAdmin = profile.role === 'admin' || profile.role === 'manager';

      // 1. Fetch own leaves
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
          status: l.status.charAt(0).toUpperCase() + l.status.slice(1),
          reason: l.reason || undefined,
          manager_comment: l.manager_comment || undefined,
          user_id: l.user_id
        };
      });

      // 2. Compute balances based on approved leaves
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

      // 3. Fetch all company leaves if Admin/Manager
      if (isAdmin) {
        const { data: dbCompanyLeaves, error: dbCompError } = await supabase
          .from('leaves')
          .select('*, profiles:user_id(full_name)')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });

        if (dbCompError) throw dbCompError;

        const formattedCompany = (dbCompanyLeaves || []).map(l => {
          const typeName = l.type === 'annual' ? 'Annual Leave' : l.type === 'sick' ? 'Sick Leave' : 'Unpaid Leave';
          return {
            id: l.id,
            type: typeName,
            dates: `${l.start_date} - ${l.end_date}`,
            duration: l.duration,
            status: l.status.charAt(0).toUpperCase() + l.status.slice(1),
            reason: l.reason || undefined,
            manager_comment: l.manager_comment || undefined,
            employee_name: l.profiles ? (l.profiles as any).full_name : 'موظف',
            user_id: l.user_id
          };
        });
        setAllCompanyLeaves(formattedCompany);
      }

      setIsDemo(false);
    } catch (err) {
      console.error('Error loading leaves:', err);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
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
          status: 'Pending',
          reason: reason || undefined
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
          status: 'pending',
          reason: reason
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
        status: 'Pending',
        reason: data.reason || undefined
      };

      setLeaves(prev => [formattedNew, ...prev]);
      setIsOpen(false);
      
      // Auto reload to sync balances
      loadLeaves();
    } catch (err: any) {
      console.error('Error requesting leave:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء تقديم طلب الإجازة.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDecision = async (requestId: string, status: 'approved' | 'rejected') => {
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      const comment = managerComments[requestId] || '';
      
      if (isDemo) {
        setAllCompanyLeaves(prev => prev.map(req => req.id === requestId ? { ...req, status: status === 'approved' ? 'Approved' : 'Rejected', manager_comment: comment } : req));
        return;
      }

      const { error } = await supabase
        .from('leaves')
        .update({ status, manager_comment: comment })
        .eq('id', requestId);

      if (error) throw error;

      // Reload data to reflect change
      await loadLeaves();
    } catch (err: any) {
      console.error('Error updating leave request:', err);
      alert(err.message || 'حدث خطأ أثناء تحديث الطلب.');
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const isManager = currentUserRole === 'admin' || currentUserRole === 'manager';

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
            setReason('');
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

      {/* Tab Switcher for Manager */}
      {isManager && (
        <div className="flex border-b border-white/10 mb-6 gap-6" dir="rtl">
          <button
            onClick={() => setActiveTab('personal')}
            className={clsx(
              "pb-3 text-sm font-bold transition-all relative",
              activeTab === 'personal' ? "text-primary border-b-2 border-primary" : "text-slate-400 hover:text-white"
            )}
          >
            طلباتي الشخصية ({leaves.length})
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={clsx(
              "pb-3 text-sm font-bold transition-all relative",
              activeTab === 'employees' ? "text-primary border-b-2 border-primary" : "text-slate-400 hover:text-white"
            )}
          >
            طلبات الموظفين المعلقة ({allCompanyLeaves.filter(l => l.status === 'Pending').length})
          </button>
        </div>
      )}

      {/* Request History */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-white/10 flex-1 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex items-center justify-between" dir="rtl">
            <h2 className="text-lg font-semibold text-white">
              {activeTab === 'personal' ? 'طلباتي الأخيرة' : 'كافة طلبات إجازة الموظفين'}
            </h2>
          </div>
          
          <div className="flex-1 overflow-auto p-6 space-y-4">
            {activeTab === 'personal' ? (
              leaves.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">لا توجد طلبات إجازة سابقة.</p>
              ) : (
                leaves.map((req) => (
                  <div key={req.id} className="flex flex-col p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                          <h4 className="font-medium text-white text-sm">
                            {req.type === 'Annual Leave' ? 'إجازة سنوية' : req.type === 'Sick Leave' ? 'إجازة مرضية' : 'إجازة غير مدفوعة'}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1" dir="rtl">{req.dates} • {req.duration === '1 Days' ? 'يوم واحد' : `${req.duration.split(' ')[0]} أيام`}</p>
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
                    
                    {req.reason && (
                      <div className="mt-3 p-3 bg-slate-950/40 rounded-lg text-xs text-slate-400 text-right" dir="rtl">
                        <strong>سبب الطلب:</strong> {req.reason}
                      </div>
                    )}

                    {req.manager_comment && (
                      <div className="mt-2 p-3 bg-indigo-950/20 border border-indigo-500/10 rounded-lg text-xs text-right" dir="rtl">
                        <strong className="text-indigo-300">تعليق المدير:</strong> <span className="text-slate-300">{req.manager_comment}</span>
                      </div>
                    )}
                  </div>
                ))
              )
            ) : (
              allCompanyLeaves.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">لا توجد طلبات إجازة معلقة للموظفين.</p>
              ) : (
                allCompanyLeaves.map((req) => (
                  <div key={req.id} className="flex flex-col p-5 bg-slate-900/50 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-colors space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                          <h4 className="font-bold text-white text-sm">{req.employee_name}</h4>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                            ID: {req.user_id ? req.user_id.slice(0, 8) : 'unknown'}
                          </span>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                        req.status === 'Approved' 
                          ? 'text-success bg-success/10 border border-success/20' 
                          : req.status === 'Pending'
                            ? 'text-warning bg-warning/10 border border-warning/20'
                            : 'text-danger bg-danger/10 border border-danger/20'
                      }`}>
                        {req.status === 'Approved' ? 'معتمد' : req.status === 'Pending' ? 'معلق وبانتظار قرارك' : 'مرفوض'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-950/30 p-3.5 rounded-xl text-xs text-slate-300 text-right" dir="rtl">
                      <div>
                        <strong>نوع الإجازة:</strong> {req.type === 'Annual Leave' ? 'إجازة سنوية' : req.type === 'Sick Leave' ? 'إجازة مرضية' : 'إجازة غير مدفوعة'}
                      </div>
                      <div>
                        <strong>المدة:</strong> {req.duration.split(' ')[0]} أيام ({req.dates})
                      </div>
                    </div>

                    {req.reason && (
                      <div className="p-3 bg-slate-950/60 rounded-xl text-xs text-slate-400 text-right" dir="rtl">
                        <strong>السبب المرفق من الموظف:</strong> {req.reason}
                      </div>
                    )}

                    {req.status === 'Pending' ? (
                      <div className="space-y-3 pt-2" dir="rtl">
                        <textarea
                          placeholder="اكتب تعليقاً أو سبب الرفض/القبول هنا (اختياري)..."
                          rows={2}
                          value={managerComments[req.id] || ''}
                          onChange={(e) => setManagerComments(prev => ({ ...prev, [req.id]: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2 text-white outline-none focus:border-primary text-xs"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDecision(req.id, 'approved')}
                            disabled={actionLoading[req.id]}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/10"
                          >
                            موافقة واعتماد الإجازة
                          </button>
                          <button
                            onClick={() => handleDecision(req.id, 'rejected')}
                            disabled={actionLoading[req.id]}
                            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/10"
                          >
                            رفض طلب الإجازة
                          </button>
                        </div>
                      </div>
                    ) : (
                      req.manager_comment && (
                        <div className="p-3 bg-indigo-950/20 border border-indigo-500/10 rounded-xl text-xs text-right" dir="rtl">
                          <strong className="text-indigo-300">تعليقك/ردك:</strong> <span className="text-slate-300">{req.manager_comment}</span>
                        </div>
                      )
                    )}
                  </div>
                ))
              )
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

            <h3 className="text-xl font-bold text-white mb-2 text-right">تقديم طلب إجازة</h3>
            <p className="text-sm text-slate-400 mb-6 text-right">يرجى تحديد تفاصيل الإجازة وتواريخ الغياب بدقة.</p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger/25 rounded-lg text-danger text-sm font-medium text-right">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRequestSubmit} className="space-y-4 text-right">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">نوع الإجازة</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                  dir="rtl"
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

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">سبب الإجازة (الرسالة للمدير)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="اكتب هنا سبب طلبك للإجازة بالتفصيل..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors text-xs"
                  dir="rtl"
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
