"use client";

import { useTranslations } from 'next-intl';
import LanguageSelector from '@/components/navigation/LanguageSelector';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Calendar, CheckSquare, Activity, ArrowRight, ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('nav'); // Reusing nav translations for some titles
  const locale = useLocale();
  const router = useRouter();

  const [userName, setUserName] = useState('أحمد');
  const [companyName, setCompanyName] = useState('شركة المستقبل للتقنية');
  const [mapImage, setMapImage] = useState('/images/office-maps/modern_medium.png');
  
  // States for images and loading
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [totalEmployees, setTotalEmployees] = useState<number>(0);
  const [todayMeetings, setTodayMeetings] = useState<number>(0);
  const [pendingTasks, setPendingTasks] = useState<number>(0);
  const [attendanceRate, setAttendanceRate] = useState<string>('0%');

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

    // 2. Fetch fresh profile and stats from Supabase
    const fetchProfileAndStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, company:companies(name, logo_url)')
          .eq('id', user.id)
          .single();

        if (profile) {
          if (profile.full_name) {
            setUserName(profile.full_name);
            localStorage.setItem('user_name', profile.full_name);
          }
          if (profile.avatar_url) setAvatarUrl(profile.avatar_url);

          const comp = profile.company as any;
          if (comp) {
            if (comp.name) {
              setCompanyName(comp.name);
              localStorage.setItem('company_name', comp.name);
            }
            if (comp.logo_url) setLogoUrl(comp.logo_url);
          }
        }

        // Fetch Dashboard Stats (Relies on RLS for company scoping)
        const [
          { count: empCount }, 
          { count: tasksCount },
          { count: meetingsCount },
          { count: attendanceCount }
        ] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('tasks').select('id', { count: 'exact', head: true }).neq('status', 'done'),
          supabase.from('meetings').select('id', { count: 'exact', head: true }).eq('date', new Date().toISOString().split('T')[0]),
          supabase.from('attendance').select('id', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0])
        ]);

        if (empCount !== null) setTotalEmployees(empCount);
        if (tasksCount !== null) setPendingTasks(tasksCount);
        if (meetingsCount !== null) setTodayMeetings(meetingsCount);
        if (empCount && empCount > 0 && attendanceCount !== null) {
          setAttendanceRate(`${Math.round((attendanceCount / empCount) * 100)}%`);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchProfileAndStats();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id);
      setAvatarUrl(data.publicUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading image');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // get company ID first
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
      if (!profile || !profile.company_id) throw new Error("No company found");

      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.company_id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('company-logos').getPublicUrl(filePath);
      
      await supabase.from('companies').update({ logo_url: data.publicUrl }).eq('id', profile.company_id);
      setLogoUrl(data.publicUrl);
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Error uploading company logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const stats = [
    { label: locale === 'ar' ? 'الموظفين (Total)' : 'Total Employees', value: totalEmployees.toString(), color: 'from-blue-500/20 to-blue-500/5', iconColor: 'text-blue-400', glow: 'shadow-blue-500/20', Icon: Users },
    { label: locale === 'ar' ? 'اجتماعات اليوم' : "Today's Meetings", value: todayMeetings.toString(), color: 'from-purple-500/20 to-purple-500/5', iconColor: 'text-purple-400', glow: 'shadow-purple-500/20', Icon: Calendar },
    { label: locale === 'ar' ? 'مهام قيد الانتظار' : 'Pending Tasks', value: pendingTasks.toString(), color: 'from-amber-500/20 to-amber-500/5', iconColor: 'text-amber-400', glow: 'shadow-amber-500/20', Icon: CheckSquare },
    { label: locale === 'ar' ? 'نسبة الحضور' : 'Attendance', value: attendanceRate, color: 'from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-400', glow: 'shadow-emerald-500/20', Icon: Activity }
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in-up">
      {/* Hidden File Inputs */}
      <input type="file" accept="image/*" className="hidden" ref={avatarInputRef} onChange={handleAvatarUpload} />
      <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={handleLogoUpload} />

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
           
           {/* Company Badge with Logo Upload */}
           <div 
             onClick={() => logoInputRef.current?.click()}
             className="hidden md:flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.2)] cursor-pointer hover:bg-white/10 transition-colors group"
             title="Upload Company Logo"
           >
              {isUploadingLogo ? (
                <Loader2 size={16} className="animate-spin text-slate-300" />
              ) : logoUrl ? (
                <img src={logoUrl} alt="Company Logo" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="relative flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute animate-ping opacity-75"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 relative z-10"></div>
                </div>
              )}
              <span className="text-sm font-semibold text-slate-200">{companyName}</span>
              {!logoUrl && !isUploadingLogo && <Upload size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
           </div>
           
           {/* Avatar Upload */}
           <div 
             onClick={() => avatarInputRef.current?.click()}
             className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-purple-600 p-[2px] cursor-pointer shadow-lg hover:scale-105 transition-transform group"
             title="Upload Profile Picture"
           >
             <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center overflow-hidden relative">
               {isUploadingAvatar ? (
                 <Loader2 size={20} className="animate-spin text-white" />
               ) : avatarUrl ? (
                 <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-white font-bold text-lg">{userName.charAt(0)}</span>
               )}
               {/* Hover Overlay for upload */}
               <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Upload size={16} className="text-white" />
               </div>
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
