"use client";

import { CreditCard, Check, Shield } from 'lucide-react';

export default function BillingPage() {
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
