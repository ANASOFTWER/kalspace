import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSansArabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-noto-arabic" });

export const metadata: Metadata = {
  title: "Kalspace - Your Real Office, Anywhere",
  description: "A complete digital headquarters for remote and hybrid teams.",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  // Arabic gets RTL and specific font
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const fontClass = locale === 'ar' ? notoSansArabic.variable : inter.variable;

  return (
    <html lang={locale} dir={dir} className={`${fontClass} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#050816] text-slate-100 font-sans">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
