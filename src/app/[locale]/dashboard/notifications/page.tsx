"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, UserPlus, CheckCircle2, AlertCircle, Calendar, ClipboardList, Loader2 } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  icon: any;
  color: string;
  createdAt: Date;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRealNotifications() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }

        // 1. Fetch current profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profile || !profile.company_id) {
          setLoading(false);
          return;
        }

        const companyId = profile.company_id;
        const isAdmin = profile.role === 'admin' || profile.role === 'manager';
        const items: NotificationItem[] = [];

        // 2. Fetch new team profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (profiles) {
          profiles.forEach(p => {
            if (p.id !== profile.id) {
              const roleTitle = p.role === 'admin' || p.role === 'manager' ? 'مدير' : 'موظف';
              items.push({
                id: `profile-${p.id}`,
                title: 'عضو جديد انضم للفريق',
                desc: `انضم ${p.full_name || 'موظف جديد'} كـ ${roleTitle} للشركة.`,
                time: formatTime(p.created_at),
                icon: UserPlus,
                color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
                createdAt: new Date(p.created_at)
              });
            }
          });
        }

        // 3. Fetch leaves
        const leavesQuery = supabase.from('leaves').select('*, profiles:user_id(full_name)');
        if (isAdmin) {
          leavesQuery.eq('company_id', companyId);
        } else {
          leavesQuery.eq('user_id', profile.id);
        }

        const { data: leaves } = await leavesQuery
          .order('created_at', { ascending: false })
          .limit(5);

        if (leaves) {
          leaves.forEach(l => {
            const empName = l.profiles ? (l.profiles as any).full_name : 'موظف';
            const leaveType = l.type === 'sick' ? 'مرضية' : l.type === 'unpaid' ? 'غير مدفوعة' : 'سنوية';
            
            if (isAdmin) {
              items.push({
                id: `leave-${l.id}`,
                title: 'طلب إجازة جديد بحاجة لمراجعتك',
                desc: `قدّم الموظف ${empName} طلب إجازة ${leaveType} لمدة ${l.duration} أيام وهي بانتظار الاعتماد.`,
                time: formatTime(l.created_at),
                icon: AlertCircle,
                color: l.status === 'pending' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                createdAt: new Date(l.created_at)
              });
            } else {
              const statusText = l.status === 'approved' ? 'مقبول' : l.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار';
              items.push({
                id: `leave-${l.id}`,
                title: 'تحديث طلب إجازتك',
                desc: `حالة طلب إجازتك الـ ${leaveType} تم تحديثها لتصبح: ${statusText}.`,
                time: formatTime(l.created_at),
                icon: CheckCircle2,
                color: l.status === 'approved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : l.status === 'rejected' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                createdAt: new Date(l.created_at)
              });
            }
          });
        }

        // 4. Fetch meetings
        const { data: meetings } = await supabase
          .from('meetings')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (meetings) {
          meetings.forEach(m => {
            items.push({
              id: `meeting-${m.id}`,
              title: 'اجتماع جديد مجدول',
              desc: `تمت جدولة اجتماع بعنوان "${m.title}" بتاريخ ${m.date} في تمام الساعة ${m.time}.`,
              time: formatTime(m.created_at),
              icon: Calendar,
              color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
              createdAt: new Date(m.created_at)
            });
          });
        }

        // 5. Fetch tasks
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (tasks) {
          tasks.forEach(t => {
            const priorityText = t.priority === 'high' ? 'عالية' : t.priority === 'low' ? 'منخفضة' : 'متوسطة';
            items.push({
              id: `task-${t.id}`,
              title: 'مهمة جديدة بالمكتب',
              desc: `تمت إضافة المهمة "${t.title}" ذات أولوية ${priorityText} وتستحق في تاريخ ${t.due_date}.`,
              time: formatTime(t.created_at),
              icon: ClipboardList,
              color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
              createdAt: new Date(t.created_at)
            });
          });
        }

        // Sort combined list by date descending
        items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setNotifications(items);
      } catch (err) {
        console.error('Error fetching real notifications:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRealNotifications();
  }, []);

  function formatTime(createdAtStr: string) {
    const created = new Date(createdAtStr);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHrs < 24) return `منذ ${diffHrs} ساعة`;
    return created.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });
  }

  return (
    <div className="h-full p-4 md:p-6 flex flex-col animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">الإشعارات (Notifications)</h1>
          <p className="text-slate-400">تحديثات وتنبيهات مباشرة لشركتك من قاعدة البيانات</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden flex-1 max-w-3xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between" dir="rtl">
          <h2 className="text-lg font-semibold text-white">مركز التنبيهات</h2>
          {!loading && notifications.length > 0 && (
            <span className="text-xs bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold px-2 py-0.5 rounded-full">
              {notifications.length} إشعار
            </span>
          )}
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-slate-400 text-sm">جاري جلب الإشعارات والتحركات الحالية...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3 text-center" dir="rtl">
            <Bell className="w-12 h-12 text-slate-600 mb-2" />
            <h3 className="text-base font-bold text-white">علبة الإشعارات فارغة</h3>
            <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
              لا توجد نشاطات أو تحديثات مسجلة في شركتك حتى الآن. بمجرد تسجيل حضور أو إسناد مهام أو جدولة اجتماعات ستظهر هنا فوراً.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5 overflow-y-auto max-h-[500px]">
            {notifications.map(notif => (
              <div key={notif.id} className="p-6 flex items-start gap-4 hover:bg-white/5 transition-colors cursor-pointer" dir="rtl">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${notif.color}`}>
                  <notif.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-right">
                  <h3 className="font-semibold text-white mb-1">{notif.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{notif.desc}</p>
                  <span className="text-[10px] text-slate-500 block mt-2">{notif.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
