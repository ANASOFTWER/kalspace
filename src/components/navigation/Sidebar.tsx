"use client";

import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { 
  LayoutDashboard, Building2, Users, Video, 
  CheckSquare, Clock, CalendarOff, MessageSquare, 
  BarChart3, Bell, CreditCard, Settings, LifeBuoy, LogOut,
  Briefcase
} from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '@/lib/supabase';

export default function Sidebar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      router.push('/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const navItems = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('virtual_office'), href: '/dashboard/office', icon: Building2 },
    { name: t('company_setup'), href: '/onboarding', icon: Briefcase },
    { name: t('employees'), href: '/dashboard/employees', icon: Users },
    { name: t('meetings'), href: '/dashboard/meetings', icon: Video },
    { name: t('tasks'), href: '/dashboard/tasks', icon: CheckSquare },
    { name: t('attendance'), href: '/dashboard/attendance', icon: Clock },
    { name: t('leave'), href: '/dashboard/leave', icon: CalendarOff },
    { name: t('chat'), href: '/dashboard/chat', icon: MessageSquare },
  ];

  const bottomItems = [
    { name: t('reports'), href: '/dashboard/reports', icon: BarChart3 },
    { name: t('notifications'), href: '/dashboard/notifications', icon: Bell },
    { name: t('billing'), href: '/dashboard/billing', icon: CreditCard },
    { name: t('settings'), href: '/dashboard/settings', icon: Settings },
    { name: t('support'), href: '/dashboard/support', icon: LifeBuoy },
  ];

  return (
    <aside className="w-64 h-screen hidden md:flex flex-col bg-card border-e border-card-border sticky top-0 shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">
          V
        </div>
        <div className="font-bold text-lg leading-tight">
          Virtual<br/>Business City
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
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

        <div className="pt-6 pb-2">
          <div className="h-px w-full bg-slate-800" />
        </div>

        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
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

      <div className="p-4 mt-auto border-t border-card-border">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-danger hover:bg-danger/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          {t('logout')}
        </button>
      </div>
    </aside>
  );
}
