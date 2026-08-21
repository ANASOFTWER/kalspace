"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart3, TrendingUp, Users, Calendar, Clock, Loader2 } from 'lucide-react';

interface DeptStat {
  name: string;
  count: number;
  height: string;
  color: string;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  
  const [productivity, setProductivity] = useState('0%');
  const [workHours, setWorkHours] = useState('0 ساعة');
  const [absenceRate, setAbsenceRate] = useState('0%');
  
  const [deptStats, setDeptStats] = useState<DeptStat[]>([
    { name: 'الإدارة', count: 0, height: 'h-4', color: 'bg-primary' },
    { name: 'الهندسة', count: 0, height: 'h-4', color: 'bg-secondary' },
    { name: 'المبيعات', count: 0, height: 'h-4', color: 'bg-success' },
    { name: 'التسويق', count: 0, height: 'h-4', color: 'bg-warning' },
    { name: 'الموارد البشرية', count: 0, height: 'h-4', color: 'bg-slate-700' },
  ]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // 1. Productivity: Tasks done vs total
        const { count: totalTasks } = await supabase.from('tasks').select('*', { count: 'exact', head: true });
        const { count: doneTasks } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'done');
        
        if (totalTasks && totalTasks > 0 && doneTasks !== null) {
          setProductivity(`${Math.round((doneTasks / totalTasks) * 100)}%`);
        }

        // 2. Work Hours: Estimate 8 hours per attendance record this month
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        const { count: attendanceCount } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth);
        
        if (attendanceCount !== null) {
          setWorkHours(`${attendanceCount * 8} ساعة`);
        }

        // 3. Absence Rate: Active leaves / total employees
        const { count: totalEmployees } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: activeLeaves } = await supabase.from('leaves').select('*', { count: 'exact', head: true }).eq('status', 'approved');
        
        if (totalEmployees && totalEmployees > 0 && activeLeaves !== null) {
          setAbsenceRate(`${Math.round((activeLeaves / totalEmployees) * 100)}%`);
        }

        // 4. Department Activity (Profiles Grouped by Role)
        if (totalEmployees && totalEmployees > 0) {
          const { data: profiles } = await supabase.from('profiles').select('role');
          
          if (profiles) {
            const roleCounts: Record<string, number> = {
              'admin': 0, 'manager': 0, 'developer': 0, 'sales': 0, 'marketing': 0, 'hr': 0, 'employee': 0
            };
            
            profiles.forEach(p => {
              if (roleCounts[p.role] !== undefined) roleCounts[p.role]++;
              else roleCounts['employee']++;
            });

            // Map roles to our chart categories
            const maxCount = Math.max(...Object.values(roleCounts), 1); // Avoid division by zero
            
            const getHeightClass = (count: number) => {
              const percentage = count / maxCount;
              if (percentage === 0) return 'h-4';
              if (percentage < 0.3) return 'h-16';
              if (percentage < 0.6) return 'h-32';
              if (percentage < 0.9) return 'h-48';
              return 'h-56';
            };

            setDeptStats([
              { name: 'الإدارة', count: roleCounts['admin'] + roleCounts['manager'], height: getHeightClass(roleCounts['admin'] + roleCounts['manager']), color: 'bg-primary' },
              { name: 'الهندسة', count: roleCounts['developer'], height: getHeightClass(roleCounts['developer']), color: 'bg-secondary' },
              { name: 'المبيعات', count: roleCounts['sales'], height: getHeightClass(roleCounts['sales']), color: 'bg-success' },
              { name: 'التسويق', count: roleCounts['marketing'], height: getHeightClass(roleCounts['marketing']), color: 'bg-warning' },
              { name: 'الموارد', count: roleCounts['hr'], height: getHeightClass(roleCounts['hr']), color: 'bg-slate-700' },
            ]);
          }
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="h-full p-4 md:p-6 flex flex-col animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">التقارير (Reports)</h1>
          <p className="text-slate-400">تحليلات الأداء والتقارير العامة للشركة</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { label: 'معدل الإنتاجية (Productivity)', val: productivity, change: '+4.2%', color: 'text-success' },
              { label: 'ساعات العمل هذا الشهر', val: workHours, change: '+12%', color: 'text-primary' },
              { label: 'معدل الغياب والتأخير', val: absenceRate, change: '-0.8%', color: 'text-warning' },
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
             <h2 className="text-lg font-semibold text-white mb-6">نشاط الأقسام الفعلي (حسب الموظفين)</h2>
             <div className="h-64 flex items-end gap-6 justify-around pt-6">
                {deptStats.map((bar, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 w-16 group">
                     <div className="w-full bg-slate-900 rounded-t-lg relative flex items-end justify-center h-52">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none">
                          {bar.count} موظف
                        </div>
                        <div className={`w-full rounded-t-lg ${bar.height} ${bar.color} transition-all duration-1000 ease-out`} />
                     </div>
                     <span className="text-xs text-slate-400 text-center font-medium whitespace-nowrap">{bar.name}</span>
                  </div>
                ))}
             </div>
          </div>
        </>
      )}
    </div>
  );
}
