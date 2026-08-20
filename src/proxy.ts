import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(ar|en|fr|es|de|zh-CN|ja|ko)/:path*']
};
