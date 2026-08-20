import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['ar', 'en', 'fr', 'es', 'de', 'zh-CN', 'ja', 'ko'],
  defaultLocale: 'ar',
});

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
