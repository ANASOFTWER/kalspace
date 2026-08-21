"use client";

import { useTranslations } from 'next-intl';
import LanguageSelector from '@/components/navigation/LanguageSelector';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Calendar, CheckSquare, Activity, ArrowRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('nav'); // Reusing nav translations for some titles
  const locale = useLocale();
  const router = useRouter();

  const [userName, setUserName] = useState('أحمد');
  const [companyName, setCompanyName] = useState('شركة المستقبل للتقنية');
  const [mapImage, setMapImage] = useState('/images/office-maps/modern_medium.png');

  useEffect(() => {
    // 1. load local data first for fast render
    const savedUserName = localStorage.getItem('user_name');
    if (savedUserName) setUserName(savedUserName);

    const savedCompanyName = localStorage.getItem('company_name');
    if (savedCompanyName) setCompanyName(savedCompanyName);
    
    // Load map image from theme
    const theme = localStorage.getItem('company_theme') || 'modern';
    const size = localStorage.getItem('office_size') || 'medium';
    setMapImage(`/images/office-maps/${theme}_${size}.png`);

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

  const stats = [
    { label: locale === 'ar' ? 'الموظفين المتصلين' : 'Employees Online', value: '12 / 24', color: 'from-blue-500/20 to-blue-500/5', iconColor: 'text-blue-400', glow: 'shadow-blue-500/20', Icon: Users },
    { label: locale === 'ar' ? 'اجتماعات اليوم' : "Today's Meetings", value: '8', color: 'from-purple-500/20 to-purple-500/5', iconColor: 'text-purple-400', glow: 'shadow-purple-500/20', Icon: Calendar },
    { label: locale === 'ar' ? 'مهام قيد الانتظار' : 'Pending Tasks', value: '14', color: 'from-amber-500/20 to-amber-500/5', iconColor: 'text-amber-400', glow: 'shadow-amber-500/20', Icon: CheckSquare },
    { label: locale === 'ar' ? 'نسبة الحضور' : 'Attendance', value: '92%', color: 'from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-400', glow: 'shadow-emerald-500/20', Icon: Activity }
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-1">
            {locale === 'ar' ? `مرحباً ${userName}` : `Welcome ${userName}`} 👋
          </h1>
          <p className="text-slate-400 font-medium">
            {locale === 'ar' ? 'أهلاً بك في مقر شركتك الافتراضي' : 'Welcome to your virtual office headquarters'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           <LanguageSelector />
           
           <div className="hidden md:flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.2)]">
              <div className="relative flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute animate-ping opacity-75"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 relative z-10"></div>
              </div>
              <span className="text-sm font-semibold text-slate-200">{companyName}</span>
           </div>
           
           {/* Avatar */}
           <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-purple-600 p-[2px] cursor-pointer shadow-lg hover:scale-105 transition-transform">
             <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
               <span className="text-white font-bold text-lg">{userName.charAt(0)}</span>
             </div>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl border border-white/10 flex flex-col justify-between h-36 hover:-translate-y-1 hover:shadow-xl hover:border-white/20 transition-all duration-300 group`}
          >
            <div className="flex justify-between items-start">
              <span className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors">{stat.label}</span>
              <div className={`p-2 rounded-lg bg-white/5 ${stat.iconColor} shadow-inner`}>
                <stat.Icon size={18} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white tracking-tight">{stat.value}</span>
              <div className={`w-2 h-2 rounded-full bg-current ${stat.iconColor} ${stat.glow} animate-pulse`} />
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard Preview / Map */}
      <div className="relative rounded-3xl border border-white/10 overflow-hidden shadow-2xl group">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10"></div>
        
        <div className="relative aspect-[21/10] md:aspect-[21/8] flex flex-col">
           {/* Map Background Image */}
           <div 
             className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
             style={{ backgroundImage: `url('${mapImage}')` }}
           ></div>
           
           <div className="absolute inset-0 bg-black/40 z-0 transition-opacity duration-300 group-hover:bg-black/20"></div>

           {/* Content overlay */}
           <div className="relative z-20 flex-1 flex flex-col justify-between p-6 md:p-8">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-3 bg-slate-950/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-lg">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]"></div>
                 <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Live Virtual Headquarters</h2>
               </div>
             </div>

             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-auto">
               <div>
                  <div className="inline-flex items-center gap-4 bg-slate-950/70 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl transition-transform hover:scale-105">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                      <div className="absolute inset-2 bg-primary rounded-full shadow-[0_0_15px_#3b82f6]"></div>
                    </div>
                    <div>
                      <p className="text-white font-bold text-xl leading-tight">12</p>
                      <p className="text-slate-300 text-xs font-medium uppercase tracking-wider">Employees Online</p>
                    </div>
                  </div>
               </div>

               <button 
                 onClick={() => router.push(`/${locale}/office`)}
                 className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-bold transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:-translate-y-1"
               >
                 {locale === 'ar' ? 'دخول المكتب' : 'Enter Office'}
                 {locale === 'ar' ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
               </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
