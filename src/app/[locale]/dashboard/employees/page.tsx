"use client";

import { useState, useEffect } from 'react';
import { Search, MessageSquare, Phone, Plus, X, Copy, Check, AlertTriangle, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';

interface Employee {
  id: string;
  full_name: string;
  role: string;
  company_id: string | null;
  status?: string; // mocked status
  is_terminated?: boolean;
  termination_reason?: string;
}

const MOCK_EMPLOYEES: Employee[] = [];

const ROLE_LABELS: Record<string, { title: string; dept: string }> = {
  admin: { title: 'مدير النظام (Admin)', dept: 'الإدارة' },
  manager: { title: 'مدير (Manager)', dept: 'الإدارة' },
  hr: { title: 'موارد بشرية (HR)', dept: 'الموارد البشرية' },
  developer: { title: 'مطور (Developer)', dept: 'التطوير التقني' },
  designer: { title: 'مصمم (Designer)', dept: 'التصميم' },
  sales: { title: 'مبيعات (Sales)', dept: 'المبيعات' },
  marketing: { title: 'تسويق (Marketing)', dept: 'التسويق' },
  support: { title: 'دعم فني (Support)', dept: 'خدمة العملاء' },
  finance: { title: 'مالية (Finance)', dept: 'المالية' },
  employee: { title: 'موظف (Employee)', dept: 'عام' },
  other: { title: 'أخرى (Other)', dept: 'أخرى' }
};

export default function EmployeesPage() {
  const locale = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [userRole, setUserRole] = useState<string>('employee');
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Invitation Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('employee');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Termination Modal State
  const [terminateEmployee, setTerminateEmployee] = useState<Employee | null>(null);
  const [terminationReason, setTerminationReason] = useState('');
  const [terminationLoading, setTerminationLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Get current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          // If no supabase session, fall back to demo mode
          setIsDemo(true);
          setEmployees(MOCK_EMPLOYEES);
          setUserRole('admin'); // allow testing invitation in demo mode
          return;
        }

        setCurrentUserId(session.user.id);

        // Fetch current user profile to verify company and role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('company_id, role')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile || !profile.company_id) {
          setIsDemo(true);
          const saved = localStorage.getItem('kalspace_employees');
          if (saved) {
            try {
              const list = JSON.parse(saved).map((emp: any) => ({
                id: emp.id,
                full_name: emp.name,
                role: emp.role,
                company_id: null,
                status: emp.status || 'online'
              }));
              setEmployees(list);
            } catch (e) {
              setEmployees([]);
            }
          } else {
            setEmployees([]);
          }
          return;
        }

        setUserRole(profile.role);
        setUserCompanyId(profile.company_id);

        // Fetch all employees in the same company
        const { data: team, error: teamError } = await supabase
          .from('profiles')
          .select('*')
          .eq('company_id', profile.company_id);

        if (teamError) throw teamError;

        // Assign some dummy presence status for visual interest
        const statuses = ['online', 'busy', 'meeting', 'offline'];
        const mappedTeam = (team || [])
          .filter(member => !member.is_terminated)
          .map((member, index) => ({
            ...member,
            status: statuses[index % statuses.length],
          }));

        setEmployees(mappedTeam);
        setIsDemo(false);
      } catch (err) {
        console.error('Error fetching real employees, running in mock mode:', err);
        setIsDemo(true);
        setEmployees(MOCK_EMPLOYEES);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError('');
    setGeneratedLink('');
    setCopied(false);

    try {
      if (isDemo) {
        // Mock generation in demo mode
        const mockToken = 'demo-uuid-token-12345';
        const link = `${window.location.origin}/${locale}/signup?token=${mockToken}`;
        setGeneratedLink(link);
        return;
      }

      if (!userCompanyId) {
        throw new Error('لم يتم العثور على معرف الشركة الحالي.');
      }

      // Generate invitation in Supabase
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          email: inviteEmail,
          role: inviteRole,
          company_id: userCompanyId,
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(error?.message || 'فشل توليد رمز الدعوة.');
      }

      const link = `${window.location.origin}/${locale}/signup?token=${data.token}`;
      setGeneratedLink(link);
    } catch (err: any) {
      console.error('Error creating invitation:', err);
      setInviteError(err.message || 'حدث خطأ أثناء إنشاء الدعوة.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTerminateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminateEmployee) return;
    setTerminationLoading(true);
    try {
      if (isDemo) {
        setEmployees(prev => {
          const updated = prev.filter(emp => emp.id !== terminateEmployee.id);
          const saved = localStorage.getItem('kalspace_employees');
          if (saved) {
            try {
              const parsed = JSON.parse(saved).filter((emp: any) => emp.id !== terminateEmployee.id);
              localStorage.setItem('kalspace_employees', JSON.stringify(parsed));
            } catch (e) {}
          }
          return updated;
        });
        setTerminateEmployee(null);
        setTerminationReason('');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_terminated: true, 
          termination_reason: terminationReason 
        })
        .eq('id', terminateEmployee.id);

      if (error) throw error;

      setEmployees(prev => prev.filter(emp => emp.id !== terminateEmployee.id));
      setTerminateEmployee(null);
      setTerminationReason('');
    } catch (err) {
      console.error('Error terminating employee:', err);
      alert('حدث خطأ أثناء فصل الموظف. يرجى المحاولة مرة أخرى.');
    } finally {
      setTerminationLoading(false);
    }
  };

  const filtered = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full p-4 md:p-6 flex flex-col animate-fade-in-up">


      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">الموظفون (Employees)</h1>
          <p className="text-slate-400">شاهد وتواصل مع موظفي شركتك</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Invite Employee Button - Enabled for Admins */}
          {userRole === 'admin' && (
            <button
              onClick={() => {
                setIsInviteOpen(true);
                setInviteEmail('');
                setGeneratedLink('');
                setInviteError('');
              }}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold flex items-center gap-2 transition-all shadow-lg shadow-primary/15"
            >
              <Plus className="w-5 h-5" />
              دعوة موظف جديد
            </button>
          )}

          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <Search className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث عن موظف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 border border-white/5 rounded-2xl">
          <p className="text-slate-400">لا يوجد موظفون يطابقون معايير البحث.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(emp => (
            <div key={emp.id} className="glass-card p-6 rounded-2xl border border-white/5 flex items-start gap-4 hover:border-white/10 transition-colors">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-slate-800 text-white font-bold text-xl flex items-center justify-center border border-slate-700">
                  {emp.full_name ? emp.full_name.charAt(0) : '?'}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 ${
                  emp.status === 'online' ? 'bg-success' : emp.status === 'busy' ? 'bg-warning' : emp.status === 'meeting' ? 'bg-danger' : 'bg-slate-500'
                }`} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white truncate">{emp.full_name}</h3>
                <p className="text-sm text-slate-400 truncate">{ROLE_LABELS[emp.role]?.title || emp.role}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded bg-white/5 border border-white/5 text-xs text-slate-400 font-medium">
                  {ROLE_LABELS[emp.role]?.dept || 'عام'}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => router.push(`/dashboard/office?chatWith=${emp.id}`)}
                  className="p-2 bg-white/5 hover:bg-primary/20 rounded-lg text-slate-400 hover:text-primary transition-colors"
                  title="مراسلة خاصة"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => router.push(`/dashboard/office?callWith=${emp.id}`)}
                  className="p-2 bg-white/5 hover:bg-success/20 rounded-lg text-slate-400 hover:text-success transition-colors"
                  title="اتصال خاص"
                >
                  <Phone className="w-4 h-4" />
                </button>
                {(userRole === 'admin' || userRole === 'manager' || userRole === 'hr') && emp.id !== currentUserId && (
                  <button 
                    onClick={() => {
                      setTerminateEmployee(emp);
                      setTerminationReason('');
                    }}
                    className="p-2 bg-white/5 hover:bg-danger/20 rounded-lg text-slate-400 hover:text-danger transition-colors"
                    title="إنهاء الخدمات"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invitation Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative animate-fade-in-up">
            <button
              onClick={() => setIsInviteOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-2">دعوة موظف جديد</h3>
            <p className="text-sm text-slate-400 mb-6">أدخل البريد الإلكتروني للموظف لتوليد رابط دعوة خاص للانضمام لشركتك.</p>

            {inviteError && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger/25 rounded-lg text-danger text-sm font-medium">
                {inviteError}
              </div>
            )}

            {!generatedLink ? (
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">الدور الوظيفي</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    {Object.entries(ROLE_LABELS).map(([key, value]) => (
                      <option key={key} value={key}>{value.title}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {inviteLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'إنشاء رمز الدعوة'
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4 animate-fade-in-up">
                <div className="p-3 bg-success/15 border border-success/30 rounded-lg text-success text-sm text-center font-semibold">
                  تم إنشاء رابط الدعوة بنجاح!
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">رابط التسجيل الخاص بالموظف</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedLink}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs select-all focus:outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center justify-center"
                      title="نسخ الرابط"
                    >
                      {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setIsInviteOpen(false)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
                >
                  إغلاق
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Termination Modal */}
      {terminateEmployee && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative animate-fade-in-up">
            <button
              onClick={() => setTerminateEmployee(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 text-danger">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-xl font-bold text-white">إنهاء خدمات موظف</h3>
            </div>
            
            <p className="text-sm text-slate-400 mb-6">
              أنت على وشك فصل الموظف <strong className="text-white">{terminateEmployee.full_name}</strong> من الشركة. سيتم حجب دخوله عن النظام فوراً وعرض سبب الفصل له بشكل خاص.
            </p>

            <form onSubmit={handleTerminateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">أسباب الفصل / إنهاء الخدمة</label>
                <textarea
                  value={terminationReason}
                  onChange={(e) => setTerminationReason(e.target.value)}
                  required
                  rows={4}
                  placeholder="اكتب أسباب إنهاء الخدمة بالتفصيل هنا..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-danger transition-colors text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTerminateEmployee(null)}
                  className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-850 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={terminationLoading}
                  className="flex-1 py-2.5 bg-danger hover:bg-danger/90 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                >
                  {terminationLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'تأكيد فصل الموظف'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
