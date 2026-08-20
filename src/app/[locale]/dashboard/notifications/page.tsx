"use client";

import { Bell, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'تمت الموافقة على طلب إجازتك', desc: 'تمت الموافقة على طلب الإجازة السنوية من قِبل المدير التنفيذي أحمد السبيعي.', time: 'منذ ساعتين', icon: CheckCircle2, color: 'text-success bg-success/15' },
  { id: '2', title: 'عضو جديد انضم للفريق', desc: 'انضمت ريما عبدالله كـ UI/UX Designer لشركة المستقبل للتقنية.', time: 'منذ 5 ساعات', icon: UserPlus, color: 'text-primary bg-primary/15' },
  { id: '3', title: 'مهمة قاربت على الانتهاء', desc: 'المهمة "ربط قاعدة البيانات Supabase" تقترب من تاريخ الاستحقاق.', time: 'يوم أمس', icon: AlertCircle, color: 'text-warning bg-warning/15' },
];

export default function NotificationsPage() {
  return (
    <div className="h-full p-4 md:p-6 flex flex-col animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">الإشعارات (Notifications)</h1>
          <p className="text-slate-400">تحديثات وتنبيهات مباشرة لشركتك</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden flex-1 max-w-3xl">
         <div className="p-6 border-b border-white/5 flex items-center justify-between">
           <h2 className="text-lg font-semibold text-white">مركز التنبيهات</h2>
           <button className="text-xs text-primary hover:text-primary-hover font-semibold">تحديد الكل كمقروء</button>
         </div>
         <div className="divide-y divide-white/5 overflow-y-auto max-h-[500px]">
           {MOCK_NOTIFICATIONS.map(notif => (
             <div key={notif.id} className="p-6 flex items-start gap-4 hover:bg-white/5 transition-colors cursor-pointer">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${notif.color}`}>
                   <notif.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                   <h3 className="font-semibold text-white mb-1">{notif.title}</h3>
                   <p className="text-sm text-slate-400 leading-relaxed">{notif.desc}</p>
                   <span className="text-[10px] text-slate-500 block mt-2">{notif.time}</span>
                </div>
             </div>
           ))}
         </div>
      </div>
    </div>
  );
}
