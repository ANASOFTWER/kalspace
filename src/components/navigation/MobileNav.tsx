"use client";

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { LayoutDashboard, Building2, CheckSquare, MessageSquare, Menu } from 'lucide-react';
import clsx from 'clsx';

export default function MobileNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const items = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('virtual_office'), href: '/dashboard/office', icon: Building2 },
    { name: t('tasks'), href: '/dashboard/tasks', icon: CheckSquare },
    { name: t('chat'), href: '/dashboard/chat', icon: MessageSquare },
    { name: t('settings'), href: '/dashboard/settings', icon: Menu },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-card border-t border-card-border flex items-center justify-around px-2 z-50">
      {items.map((item) => {
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
    </nav>
  );
}
