"use client";

import { BarChart3, TrendingUp, Users, Calendar, Clock } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="h-full p-4 md:p-6 flex flex-col animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">التقارير (Reports)</h1>
          <p className="text-slate-400">تحليلات الأداء والتقارير العامة للشركة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'معدل الإنتاجية (Productivity)', val: '87%', change: '+4.2%', color: 'text-success' },
          { label: 'ساعات العمل هذا الشهر', val: '1,420 ساعة', change: '+12%', color: 'text-primary' },
          { label: 'معدل الغياب والتأخير', val: '3.1%', change: '-0.8%', color: 'text-warning' },
        ].map((item, i) => (
          <div key={i} className="glass-card rounded-2xl p-6 border border-white/5">
             <h3 className="text-sm font-medium text-slate-400 mb-4">{item.label}</h3>
             <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-white">{item.val}</span>
                <span className={`text-xs font-semibold ${item.color}`}>{item.change}</span>
             </div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl border border-white/5 flex-1 overflow-hidden p-6">
         <h2 className="text-lg font-semibold text-white mb-6">نشاط الأقسام هذا الأسبوع</h2>
         <div className="h-64 flex items-end gap-6 justify-around pt-6">
            {[
              { name: 'الإدارة', height: 'h-40', color: 'bg-primary' },
              { name: 'الهندسة', height: 'h-56', color: 'bg-secondary' },
              { name: 'المبيعات', height: 'h-32', color: 'bg-success' },
              { name: 'التسويق', height: 'h-24', color: 'bg-warning' },
              { name: 'الموارد البشرية', height: 'h-16', color: 'bg-slate-700' },
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-3 w-16">
                 <div className="w-full bg-slate-900 rounded-t-lg relative flex items-end justify-center h-52">
                    <div className={`w-full rounded-t-lg ${bar.height} ${bar.color} transition-all duration-1000`} />
                 </div>
                 <span className="text-xs text-slate-400 text-center font-medium">{bar.name}</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
