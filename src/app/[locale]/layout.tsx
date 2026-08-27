import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSansArabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-noto-arabic" });

export const metadata: Metadata = {
  metadataBase: new URL("https://kalspace.com"),
  title: {
    default: "Kalspace - Your Real Office, Anywhere | مكتبك الافتراضي المتكامل",
    template: "%s | Kalspace"
  },
  description: "A complete digital headquarters for remote and hybrid teams. Stand next to your coworkers, chat in real-time, and collaborate seamlessly. مساحة عمل رقمية متكاملة للفرق الهجينة وعن بعد.",
  keywords: [
    "Kalspace", "virtual office", "remote work", "hybrid teams", "spatial audio chat", "digital workspace",
    "مكتب افتراضي", "مساحة عمل رقمية", "العمل عن بعد", "كالسبيس", "مكتب رقمي", "إدارة فرق العمل"
  ],
  authors: [{ name: "Kalspace Team", url: "https://kalspace.com" }],
  creator: "Kalspace",
  publisher: "Kalspace",
  icons: {
    icon: "/logo.png?v=2",
    shortcut: "/logo.png?v=2",
    apple: "/logo.png?v=2",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_AR",
    url: "https://kalspace.com",
    title: "Kalspace - Your Real Office, Anywhere | مكتبك الافتراضي المتكامل",
    description: "A complete digital headquarters for remote and hybrid teams. Stand next to your coworkers, chat in real-time, and collaborate seamlessly. مساحة عمل رقمية متكاملة للفرق الهجينة وعن بعد.",
    siteName: "Kalspace",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Kalspace Logo",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kalspace - Your Real Office, Anywhere | مكتبك الافتراضي المتكامل",
    description: "A complete digital headquarters for remote and hybrid teams.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://kalspace.com",
    languages: {
      "ar": "https://kalspace.com/ar",
      "en": "https://kalspace.com/en",
    }
  }
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();

  // Arabic gets RTL and specific font
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const fontClass = locale === 'ar' ? notoSansArabic.variable : inter.variable;

  return (
    <html lang={locale} dir={dir} className={`${fontClass} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#050816] text-slate-100 font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
