"use client";

import { useTranslations } from 'next-intl';
import LanguageSelector from '@/components/navigation/LanguageSelector';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const t = useTranslations('nav'); // Reusing nav translations for some titles

  const [userName, setUserName] = useState('أحمد');
  const [companyName, setCompanyName] = useState('شركة المستقبل للتقنية');

  useEffect(() => {
    // 1. load local data first for fast render
    const savedUserName = localStorage.getItem('user_name');
    if (savedUserName) setUserName(savedUserName);

    const savedCompanyName = localStorage.getItem('company_name');
    if (savedCompanyName) setCompanyName(savedCompanyName);

    // 2. Fetch fresh profile from Supabase to sync name and company name
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('full_name, company:companies(name)')
            .eq('id', user.id)
            .single();

          if (profile) {
            if (profile.full_name) {
              setUserName(profile.full_name);
              localStorage.setItem('user_name', profile.full_name);
            }
            const comp = profile.company as any;
            if (comp && comp.name) {
              setCompanyName(comp.name);
              localStorage.setItem('company_name', comp.name);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard profile:', err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">مرحباً {userName} 👋</h1>
          <p className="text-slate-400">أهلًا بك في مكتبك الافتراضي (Welcome to your virtual office)</p>
        </div>
        <div className="flex items-center gap-4">
           <LanguageSelector />
           <div className="hidden md:flex items-center gap-2 bg-card border border-card-border px-4 py-2 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-sm font-medium">{companyName}</span>
           </div>
           {/* Avatar Placeholder */}
           <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 overflow-hidden cursor-pointer">
              <span className="text-primary font-bold">{userName.charAt(0)}</span>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Employees Online', value: '12 / 24', color: 'bg-primary' },
          { label: "Today's Meetings", value: '8', color: 'bg-secondary' },
          { label: 'Pending Tasks', value: '14', color: 'bg-warning' },
          { label: 'Attendance', value: '92%', color: 'bg-success' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-xl border border-white/5 flex flex-col justify-between h-32 hover:border-white/10 transition-colors">
            <span className="text-sm text-slate-400 font-medium">{stat.label}</span>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white">{stat.value}</span>
              <div className={`w-3 h-3 rounded-full ${stat.color} shadow-[0_0_10px_currentColor]`} />
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard Preview / Map */}
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Live Virtual Headquarters</h2>
          <button className="text-sm text-primary hover:text-primary-hover font-medium transition-colors">
            Enter Office &rarr;
          </button>
        </div>
        <div className="relative aspect-[21/9] bg-slate-900/50 flex items-center justify-center">
           {/* We will build the actual isometric office in the /office route, this is just a preview */}
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 saturate-0 mix-blend-overlay"></div>
           <div className="z-10 text-center">
             <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4 border border-primary/50 animate-pulse">
                <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_#3b82f6]"></div>
             </div>
             <p className="text-slate-300 font-medium">12 employees currently in the office</p>
           </div>
        </div>
      </div>
    </div>
  );
}
