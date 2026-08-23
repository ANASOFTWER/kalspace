"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Settings, Shield, User, Building, Globe, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  // User & Profile States
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  // Company States
  const [companyId, setCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Password States
  const [newPassword, setNewPassword] = useState('');

  // Action Statuses
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }

        const uId = session.user.id;
        setUserId(uId);
        setEmail(session.user.email || '');

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', uId)
          .single();

        if (profile) {
          setFullName(profile.full_name || '');
          setRole(profile.role || 'employee');
          
          if (profile.company_id) {
            setCompanyId(profile.company_id);
            // Fetch company
            const { data: company } = await supabase
              .from('companies')
              .select('name')
              .eq('id', profile.company_id)
              .single();
            
            if (company) {
              setCompanyName(company.name || '');
            }
          }
        }
      } catch (err) {
        console.error('Error loading settings data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', userId);

      if (error) throw error;
      setSuccessMsg('تم حفظ تغييرات الملف الشخصي بنجاح!');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ الملف الشخصي.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      if (!companyId) throw new Error('لم يتم العثور على شركة مرتبطة بحسابك.');

      const { error } = await supabase
        .from('companies')
        .update({ name: companyName })
        .eq('id', companyId);

      if (error) throw error;
      setSuccessMsg('تم حفظ بيانات الشركة بنجاح!');
    } catch (err: any) {
      console.error('Error updating company:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ بيانات الشركة.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      if (!newPassword || newPassword.length < 6) {
        throw new Error('يجب ألا تقل كلمة المرور الجديدة عن 6 أحرف.');
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      setSuccessMsg('تم تحديث كلمة المرور بنجاح!');
      setNewPassword('');
    } catch (err: any) {
      console.error('Error updating password:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء تحديث كلمة المرور.');
    } finally {
      setUpdating(false);
    }
  };

  const isManager = role === 'admin' || role === 'manager' || role === 'CEO';

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-slate-400 text-sm">جاري تحميل بيانات الإعدادات...</p>
      </div>
    );
  }

  return (
    <div className="h-full p-4 md:p-6 flex flex-col animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">الإعدادات (Settings)</h1>
          <p className="text-slate-400">إدارة حسابك الشخصي وإعدادات الشركة العامة</p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-3 text-sm font-semibold max-w-3xl" dir="rtl">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-3 text-sm font-semibold max-w-3xl" dir="rtl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden min-h-[500px]" dir="rtl">
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 border-l lg:border-l border-white/5 flex flex-col p-4 shrink-0">
           <div className="space-y-1">
             {[
               { id: 'account', label: 'الملف الشخصي', icon: User },
               { id: 'company', label: 'تفاصيل الشركة', icon: Building },
               { id: 'security', label: 'الأمان والخصوصية', icon: Shield },
               { id: 'language', label: 'اللغة (Language)', icon: Globe },
             ].map(tab => (
               <button 
                 key={tab.id}
                 onClick={() => {
                   setActiveTab(tab.id);
                   setSuccessMsg('');
                   setErrorMsg('');
                 }}
                 className={`w-full text-right px-3 py-2.5 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                   activeTab === tab.id ? 'bg-primary text-white font-medium shadow-md shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                 }`}
               >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
               </button>
             ))}
           </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-6 lg:p-8 space-y-6 text-right">
           {activeTab === 'account' && (
             <form onSubmit={handleSaveProfile} className="space-y-6 max-w-xl">
                <h2 className="text-lg font-semibold text-white">إعدادات الملف الشخصي (Account Profile)</h2>
                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">الاسم بالكامل</label>
                   <input 
                     type="text" 
                     className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-4 py-2.5 text-white outline-none focus:border-primary text-sm" 
                     value={fullName}
                     onChange={(e) => setFullName(e.target.value)}
                     required
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-400 mb-2">البريد الإلكتروني (غير قابل للتعديل)</label>
                   <input 
                     type="email" 
                     className="w-full bg-slate-950/40 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-500 text-sm cursor-not-allowed" 
                     value={email} 
                     disabled 
                   />
                </div>
                <button 
                  type="submit" 
                  disabled={updating}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                   {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                   <span>حفظ التغييرات</span>
                </button>
             </form>
           )}

           {activeTab === 'company' && (
             <form onSubmit={handleSaveCompany} className="space-y-6 max-w-xl">
                <h2 className="text-lg font-semibold text-white">بيانات الشركة (Company Details)</h2>
                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">اسم الشركة</label>
                   <input 
                     type="text" 
                     className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-4 py-2.5 text-white outline-none focus:border-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed" 
                     value={companyName}
                     onChange={(e) => setCompanyName(e.target.value)}
                     disabled={!isManager}
                     required
                   />
                   {!isManager && (
                     <p className="text-xs text-amber-500 mt-2">عذراً، يسمح فقط لمديري ومسؤولي الشركة بتعديل اسم الشركة.</p>
                   )}
                </div>
                {isManager && (
                  <button 
                    type="submit" 
                    disabled={updating}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                     {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                     <span>حفظ البيانات</span>
                  </button>
                )}
             </form>
           )}

           {activeTab === 'security' && (
             <form onSubmit={handleSaveSecurity} className="space-y-6 max-w-xl">
                <h2 className="text-lg font-semibold text-white">تأمين الحساب (Security Settings)</h2>
                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">كلمة المرور الجديدة</label>
                   <input 
                     type="password" 
                     className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-4 py-2.5 text-white outline-none focus:border-primary text-sm" 
                     placeholder="ادخل كلمة المرور الجديدة (أكثر من 6 خانات)" 
                     value={newPassword}
                     onChange={(e) => setNewPassword(e.target.value)}
                     required
                   />
                </div>
                <button 
                  type="submit" 
                  disabled={updating}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                   {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                   <span>تحديث كلمة المرور</span>
                </button>
             </form>
           )}

           {activeTab === 'language' && (
             <div className="space-y-6 max-w-xl">
                <h2 className="text-lg font-semibold text-white">تفضيلات اللغة (Language Preferences)</h2>
                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">اختر لغتك الأم (Choose your native language)</label>
                   <select 
                     value={locale}
                     onChange={(e) => router.replace(pathname, { locale: e.target.value })}
                     className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-primary"
                   >
                     <option value="ar" className="text-black bg-white dark:bg-slate-900 dark:text-white">العربية (Arabic)</option>
                     <option value="en" className="text-black bg-white dark:bg-slate-900 dark:text-white">English (الإنجليزية)</option>
                     <option value="fr" className="text-black bg-white dark:bg-slate-900 dark:text-white">Français (French)</option>
                     <option value="es" className="text-black bg-white dark:bg-slate-900 dark:text-white">Español (Spanish)</option>
                     <option value="de" className="text-black bg-white dark:bg-slate-900 dark:text-white">Deutsch (German)</option>
                     <option value="zh-CN" className="text-black bg-white dark:bg-slate-900 dark:text-white">中文 (Chinese)</option>
                     <option value="ja" className="text-black bg-white dark:bg-slate-900 dark:text-white">日本語 (Japanese)</option>
                     <option value="ko" className="text-black bg-white dark:bg-slate-900 dark:text-white">한국어 (Korean)</option>
                   </select>
                </div>
                <p className="text-sm text-slate-400">ستتغير لغة الواجهة فور اختيارك. (The interface language will change immediately after selection.)</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
