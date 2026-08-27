"use client";

import { useEffect, useState } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import MobileNav from '@/components/navigation/MobileNav';
import { supabase } from '@/lib/supabase';
import { AlertOctagon, LogOut, RefreshCw } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    async function checkTermination() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }

        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userProfile) {
          setProfile(userProfile);
        }
      } catch (err) {
        console.error('Error checking profile status:', err);
      } finally {
        setLoading(false);
      }
    }

    checkTermination();
  }, []);

  const handleResetAndLeave = async () => {
    if (!profile) return;
    setIsResetting(true);
    try {
      // Update profile in Supabase to leave company and clear termination
      const { error } = await supabase
        .from('profiles')
        .update({
          company_id: null,
          is_terminated: false,
          termination_reason: null
        })
        .eq('id', profile.id);

      if (error) throw error;

      // Log out auth session to start completely fresh
      await supabase.auth.signOut();
      
      // Redirect to login
      router.push(`/${locale}/login`);
    } catch (err) {
      console.error('Error resetting company settings:', err);
      alert('حدث خطأ أثناء مغادرة الشركة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#050816] items-center justify-center">
        <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is terminated, block view and show termination notice
  if (profile?.is_terminated) {
    return (
      <div className="flex h-screen w-full bg-[#050510] items-center justify-center p-4">
        <div className="glass-card max-w-lg w-full border border-danger/20 rounded-3xl p-8 md:p-10 space-y-6 text-center shadow-[0_20px_50px_rgba(239,68,68,0.15)] animate-fade-in-up">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-danger/10 border border-danger/30 flex items-center justify-center text-danger">
            <AlertOctagon className="w-8 h-8 animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">إشعار إنهاء الخدمات (Termination Notice)</h1>
            <p className="text-sm text-slate-400">عزيزي الموظف، يؤسفنا إبلاغك بقرار إنهاء خدماتك.</p>
          </div>

          <div className="bg-danger/5 border border-danger/15 rounded-2xl p-5 text-right space-y-2">
            <span className="text-xs text-danger font-bold uppercase tracking-wider block">سبب إنهاء الخدمة:</span>
            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
              {profile.termination_reason || 'لم يتم تحديد سبب محدد.'}
            </p>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            تم إلغاء صلاحيات دخولك لمساحة العمل الخاصة بهذه الشركة. نتمنى لك التوفيق في مسيرتك المهنية القادمة.
          </p>

          <div className="pt-4 flex flex-col gap-3">
            <button
              onClick={handleResetAndLeave}
              disabled={isResetting}
              className="w-full py-3 bg-danger hover:bg-danger/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-danger/25 flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  جاري تسجيل الخروج...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  مغادرة الشركة والبدء من جديد
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOfficePage = pathname?.endsWith('/office');

  return (
    <div className="flex h-screen bg-[#050816] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <main className={`flex-1 overflow-y-auto md:pb-0 ${isOfficePage ? 'pb-0' : 'pb-16'}`}>
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
