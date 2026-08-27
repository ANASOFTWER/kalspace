"use client";

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { 
  LayoutDashboard, Building2, Briefcase, Users, Video, 
  CheckSquare, Clock, CalendarOff, MessageSquare, 
  BarChart3, Bell, CreditCard, Settings, LifeBuoy, LogOut,
  Globe, X, Menu
} from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileNav() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [isCEO, setIsCEO] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          if (profile) {
            setIsCEO(profile.role === 'CEO' || profile.role === 'admin' || profile.role === 'manager');
          }
        }
      } catch (err) {
        console.error('Error fetching role in mobile nav:', err);
      } finally {
        setLoading(false);
      }
    }
    checkRole();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      router.push('/login');
      setIsDrawerOpen(false);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  // Main 4 quick items
  const tabItems = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('virtual_office'), href: '/dashboard/office', icon: Building2 },
    { name: t('tasks'), href: '/dashboard/tasks', icon: CheckSquare },
    { name: t('chat'), href: '/dashboard/chat', icon: MessageSquare },
  ];

  // Full menu items
  const menuItems = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('virtual_office'), href: '/dashboard/office', icon: Building2 },
    ...(isCEO ? [{ name: t('company_setup'), href: '/onboarding', icon: Briefcase }] : []),
    { name: t('employees'), href: '/dashboard/employees', icon: Users },
    { name: t('meetings'), href: '/dashboard/meetings', icon: Video },
    { name: t('tasks'), href: '/dashboard/tasks', icon: CheckSquare },
    { name: t('attendance'), href: '/dashboard/attendance', icon: Clock },
    { name: t('leave'), href: '/dashboard/leave', icon: CalendarOff },
    { name: t('chat'), href: '/dashboard/chat', icon: MessageSquare },
    { name: t('reports'), href: '/dashboard/reports', icon: BarChart3 },
    { name: t('notifications'), href: '/dashboard/notifications', icon: Bell },
    ...(isCEO ? [{ name: t('billing'), href: '/dashboard/billing', icon: CreditCard }] : []),
    { name: t('settings'), href: '/dashboard/settings', icon: Settings },
    { name: t('support'), href: '/dashboard/support', icon: LifeBuoy },
  ];

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-card border-t border-card-border flex items-center justify-around px-2 z-50">
        {tabItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-primary" : "text-slate-400 hover:text-slate-100"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none">{item.name}</span>
            </Link>
          );
        })}

        {/* 5th button: Toggle Drawer */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className={clsx(
            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
            isDrawerOpen ? "text-primary" : "text-slate-400 hover:text-slate-100"
          )}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">{t('settings')}</span>
        </button>
      </nav>

      {/* Slide-over Fullscreen Navigation Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />

            {/* Drawer Container */}
            <motion.div
              initial={{ x: dir === 'rtl' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: dir === 'rtl' ? '100%' : '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={clsx(
                "fixed top-0 bottom-0 w-80 max-w-[85vw] bg-card border-card-border shadow-2xl flex flex-col z-50 md:hidden overflow-y-auto",
                dir === 'rtl' ? "right-0 border-l" : "left-0 border-r"
              )}
              dir={dir}
            >
              {/* Header */}
              <div className="p-6 flex items-center justify-between border-b border-card-border shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">
                    V
                  </div>
                  <div className="font-bold text-base leading-tight text-white">
                    Virtual<br/>Business City
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      onClick={() => setIsDrawerOpen(false)}
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-primary text-white shadow-md shadow-primary/20" 
                          : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-card-border space-y-2 shrink-0 bg-slate-950/20">
                <div className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-slate-400">
                  <Globe className="w-5 h-5 shrink-0" />
                  <select 
                    value={locale}
                    onChange={(e) => {
                      router.replace(pathname, { locale: e.target.value });
                      setIsDrawerOpen(false);
                    }}
                    className="bg-transparent outline-none w-full cursor-pointer hover:text-white transition-colors text-white"
                  >
                    <option value="ar" className="text-black bg-white dark:bg-slate-900 dark:text-white">العربية</option>
                    <option value="en" className="text-black bg-white dark:bg-slate-900 dark:text-white">English</option>
                    <option value="fr" className="text-black bg-white dark:bg-slate-900 dark:text-white">Français</option>
                    <option value="es" className="text-black bg-white dark:bg-slate-900 dark:text-white">Español</option>
                    <option value="de" className="text-black bg-white dark:bg-slate-900 dark:text-white">Deutsch</option>
                    <option value="zh-CN" className="text-black bg-white dark:bg-slate-900 dark:text-white">中文</option>
                    <option value="ja" className="text-black bg-white dark:bg-slate-900 dark:text-white">日本語</option>
                    <option value="ko" className="text-black bg-white dark:bg-slate-900 dark:text-white">한국어</option>
                  </select>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  {t('logout')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
