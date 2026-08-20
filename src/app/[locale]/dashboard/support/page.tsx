"use client";

import { HelpCircle, Mail, MessageCircle, AlertCircle } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="h-full p-4 md:p-6 flex flex-col animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">الدعم الفني (Support)</h1>
          <p className="text-slate-400">تواصل مع فريق الدعم الفني لحل مشكلتك</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Support Form */}
         <div className="lg:col-span-2 glass-card rounded-2xl border border-white/5 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">إرسال تذكرة دعم</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">عنوان المشكلة</label>
                  <input type="text" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white" placeholder="مثال: مشكلة في الصوت بالغرفة الافتراضية" required />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">وصف تفصيلي</label>
                  <textarea rows={4} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white resize-none" placeholder="اشرح لنا تفاصيل المشكلة..." required></textarea>
               </div>
               <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all">
                  إرسال التذكرة
               </button>
            </form>
         </div>

         {/* Support Info */}
         <div className="glass-card rounded-2xl border border-white/5 p-6 h-fit space-y-6">
            <div className="flex items-center gap-3">
               <HelpCircle className="w-6 h-6 text-primary" />
               <h2 className="text-lg font-semibold text-white">مركز المساعدة</h2>
            </div>
            
            <div className="space-y-4 text-sm">
               <div className="flex items-center gap-3 text-slate-300">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>support@kalspace.com</span>
               </div>
               <div className="flex items-center gap-3 text-slate-300">
                  <MessageCircle className="w-4 h-4 text-slate-400" />
                  <span>محادثة مباشرة (أوقات العمل)</span>
               </div>
               <div className="flex items-start gap-3 text-xs text-slate-400 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                  <span>متوسط وقت الرد على التذاكر خلال أوقات العمل الرسمية هو أقل من ساعة واحدة.</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
