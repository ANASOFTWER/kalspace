"use client";

import { useState, useEffect } from 'react';
import { Plus, Clock, AlertTriangle, X, Check, ArrowLeftRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
}

const INITIAL_TASKS: Task[] = [];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);

  // Add Task Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setIsDemo(true);
          setTasks(INITIAL_TASKS);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile || !profile.company_id) {
          setIsDemo(true);
          setTasks(INITIAL_TASKS);
          return;
        }

        setUserCompanyId(profile.company_id);

        const { data: dbTasks, error: dbError } = await supabase
          .from('tasks')
          .select('*')
          .eq('company_id', profile.company_id)
          .order('created_at', { ascending: false });

        if (dbError) throw dbError;

        setTasks(dbTasks || []);
        setIsDemo(false);
      } catch (err) {
        console.error('Error loading tasks, running in demo mode:', err);
        setIsDemo(true);
        setTasks(INITIAL_TASKS);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  const handleAddTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrorMsg('');

    try {
      if (isDemo) {
        const newMockTask: Task = {
          id: `mock-${Date.now()}`,
          title,
          status: 'todo',
          priority,
          due_date: dueDate
        };
        setTasks(prev => [newMockTask, ...prev]);
        setIsOpen(false);
        return;
      }

      if (!userCompanyId) {
        throw new Error('لم يتم العثور على معرف الشركة.');
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          company_id: userCompanyId,
          title,
          status: 'todo',
          priority,
          due_date: dueDate
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(error?.message || 'فشل حفظ المهمة.');
      }

      setTasks(prev => [data, ...prev]);
      setIsOpen(false);
    } catch (err: any) {
      console.error('Error adding task:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء إضافة المهمة.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const moveTaskStatus = async (taskId: string, currentStatus: 'todo' | 'in-progress' | 'done') => {
    let nextStatus: 'todo' | 'in-progress' | 'done' = 'in-progress';
    if (currentStatus === 'todo') nextStatus = 'in-progress';
    else if (currentStatus === 'in-progress') nextStatus = 'done';
    else if (currentStatus === 'done') nextStatus = 'todo';

    try {
      if (isDemo) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: nextStatus } : t));
        return;
      }

      const { error } = await supabase
        .from('tasks')
        .update({ status: nextStatus })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: nextStatus } : t));
    } catch (err) {
      console.error('Error updating task status:', err);
      alert('فشل تحديث حالة المهمة.');
    }
  };

  const columns = [
    { id: 'todo' as const, name: 'المهام القادمة (To Do)', color: 'bg-primary' },
    { id: 'in-progress' as const, name: 'قيد التنفيذ (In Progress)', color: 'bg-warning' },
    { id: 'done' as const, name: 'المنجزة (Done)', color: 'bg-success' },
  ];

  return (
    <div className="min-h-full p-4 md:p-6 pb-24 md:pb-6 flex flex-col animate-fade-in-up">


      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">المهام والمشاريع (Tasks)</h1>
          <p className="text-slate-400">إدارة ومتابعة سير مهام فريق العمل</p>
        </div>
        <button
          onClick={() => {
            setIsOpen(true);
            setTitle('');
            setPriority('medium');
            setDueDate('');
            setErrorMsg('');
          }}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-all shadow-lg shadow-primary/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> إضافة مهمة
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[450px]">
          {columns.map(col => {
            const columnTasks = tasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="flex flex-col bg-slate-900/40 border border-white/5 rounded-2xl p-4 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-3 h-3 rounded-full ${col.color}`} />
                  <h2 className="font-semibold text-white text-sm md:text-base">{col.name}</h2>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold ml-auto">
                    {columnTasks.length}
                  </span>
                </div>
                
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnTasks.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
                      <p className="text-xs text-slate-600">لا توجد مهام</p>
                    </div>
                  ) : (
                    columnTasks.map(task => (
                      <div key={task.id} className="glass-card p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between gap-4">
                        <h3 className="font-medium text-white text-sm leading-relaxed">{task.title}</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1.5 items-center">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              task.priority === 'high' ? 'bg-danger/20 text-danger' : task.priority === 'medium' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                            }`}>
                              {task.priority}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {task.due_date}
                            </span>
                          </div>
                          
                          {/* Move Task Status Button */}
                          <button
                            onClick={() => moveTaskStatus(task.id, task.status)}
                            className="p-1 bg-white/5 hover:bg-primary/20 rounded text-slate-400 hover:text-primary transition-colors flex items-center gap-1 text-[10px]"
                            title="نقل الحالة"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                            <span>تغيير</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative animate-fade-in-up">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-2">إضافة مهمة جديدة</h3>
            <p className="text-sm text-slate-400 mb-6">حدد تفاصيل المهمة وتاريخ استحقاقها لإسنادها للفريق.</p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger/25 rounded-lg text-danger text-sm font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">عنوان المهمة</label>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  rows={3}
                  placeholder="مثال: ربط صفحات لوحة التحكم بقاعدة البيانات"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors resize-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">الأولوية</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                  >
                    <option value="low">منخفضة (Low)</option>
                    <option value="medium">متوسطة (Medium)</option>
                    <option value="high">مرتفعة (High)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">تاريخ الاستحقاق</label>
                  <input
                    type="text"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    placeholder="مثال: 25 Aug أو Today"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                {submitLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'إضافة المهمة للوحة'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
