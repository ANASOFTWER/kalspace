"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CreditCard, Check, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    async function checkRole() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsAuthorized(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const role = profile.role;
          setIsAuthorized(role === 'CEO' || role === 'admin' || role === 'manager');
        }
      } catch (err) {
        console.error('Error checking role on billing page:', err);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    }
    checkRole();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-slate-400 text-sm">جاري التحقق من صلاحيات الوصول...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in-up" dir="rtl">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6 shadow-lg shadow-rose-500/5">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">غير مصرح بالدخول</h1>
        <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-8">
          عذراً، الوصول لصفحة الفواتير والاشتراكات متاح فقط لمديري ومسؤولي الشركة التنفيذيين.
        </p>
        <Link 
          href="/dashboard"
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-lg text-sm font-semibold transition-all border border-white/5"
        >
          العودة للوحة التحكم
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full p-4 md:p-6 flex flex-col animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">الفواتير والاشتراكات (Billing)</h1>
          <p className="text-slate-400">إدارة خطط الاشتراك والدفع والميزات المفعلة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Current Plan Summary */}
         <div className="lg:col-span-2 glass-card rounded-2xl border border-white/5 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">الاشتراك الحالي (Current Plan)</h2>
            <div className="p-6 bg-primary/10 border border-primary/20 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                  <h3 className="text-2xl font-bold text-white mb-1">الخطة الاحترافية (Pro Plan)</h3>
                  <p className="text-sm text-slate-400">تجدد تلقائياً في 28 أغسطس 2026</p>
               </div>
               <div className="text-right">
                  <div className="text-3xl font-bold text-white mb-1">$49 <span className="text-xs text-slate-400">/ شهرياً</span></div>
                  <span className="inline-block px-2.5 py-1 rounded bg-success/20 text-success text-xs font-semibold">مفعل ونشط</span>
               </div>
            </div>

            <div>
               <h3 className="font-semibold text-white mb-4">طريقة الدفع المسجلة</h3>
               <div className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl">
                  <div className="w-12 h-8 bg-slate-800 border border-slate-750 flex items-center justify-center font-bold text-slate-400 rounded">
                     VISA
                  </div>
                  <div>
                     <p className="font-medium text-white">Visa انتهى بـ 4242</p>
                     <p className="text-xs text-slate-400">تنتهي الصلاحية في 12/29</p>
                  </div>
                  <button className="text-xs text-primary hover:text-primary-hover font-semibold ml-auto">تحديث</button>
               </div>
            </div>
         </div>

         {/* Security & Plan Switcher */}
         <div className="glass-card rounded-2xl border border-white/5 p-6 h-fit space-y-6">
            <div className="flex items-center gap-3">
               <Shield className="w-6 h-6 text-primary" />
               <h2 className="text-lg font-semibold text-white">تأمين المدفوعات</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">تتم معالجة المدفوعات وتخزين بيانات بطاقة الائتمان بشكل آمن عبر Stripe. لا يتم تخزين معلومات الدفع الحساسة على خوادمنا.</p>
            <div className="pt-4 border-t border-white/5">
               <button className="w-full py-3 bg-slate-800 hover:bg-slate-750 rounded-lg text-white font-semibold text-sm transition-all">
                  عرض سجل الفواتير والدفع
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
