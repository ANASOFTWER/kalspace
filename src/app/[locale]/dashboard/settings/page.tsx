"use client";

import { useState } from 'react';
import { Settings, Shield, User, Building } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');

  return (
    <div className="h-full p-4 md:p-6 flex flex-col animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">الإعدادات (Settings)</h1>
          <p className="text-slate-400">إدارة حسابك الشخصي وإعدادات الشركة العامة</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden min-h-[500px]">
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 border-r lg:border-r border-white/5 flex flex-col p-4 shrink-0">
           <div className="space-y-1">
             {[
               { id: 'account', label: 'الملف الشخصي', icon: User },
               { id: 'company', label: 'تفاصيل الشركة', icon: Building },
               { id: 'security', label: 'الأمان والخصوصية', icon: Shield },
             ].map(tab => (
               <button 
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                   activeTab === tab.id ? 'bg-primary text-white font-medium' : 'text-slate-400 hover:text-white hover:bg-white/5'
                 }`}
               >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
               </button>
             ))}
           </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-6 lg:p-8 space-y-6">
           {activeTab === 'account' && (
             <div className="space-y-6 max-w-xl">
                <h2 className="text-lg font-semibold text-white">إعدادات الملف الشخصي (Account Profile)</h2>
                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">اسم المستخدم</label>
                   <input type="text" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white" defaultValue="أحمد السبيعي" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">البريد الإلكتروني</label>
                   <input type="email" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white" defaultValue="ahmed@company.com" disabled />
                </div>
                <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all">حفظ التغييرات</button>
             </div>
           )}

           {activeTab === 'company' && (
             <div className="space-y-6 max-w-xl">
                <h2 className="text-lg font-semibold text-white">بيانات الشركة (Company Details)</h2>
                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">اسم الشركة</label>
                   <input type="text" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white" defaultValue="شركة المستقبل للتقنية" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">الصناعة</label>
                   <input type="text" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white" defaultValue="Technology" />
                </div>
                <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all">حفظ البيانات</button>
             </div>
           )}

           {activeTab === 'security' && (
             <div className="space-y-6 max-w-xl">
                <h2 className="text-lg font-semibold text-white">تأمين الحساب (Security Settings)</h2>
                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">كلمة المرور الحالية</label>
                   <input type="password" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white" placeholder="••••••••" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">كلمة المرور الجديدة</label>
                   <input type="password" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white" placeholder="••••••••" />
                </div>
                <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all">تغيير كلمة المرور</button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
