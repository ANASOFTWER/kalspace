"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useState } from 'react';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

export default function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  const currentLang = languages.find(l => l.code === locale) || languages[1];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-card-border hover:bg-white/5 transition-colors text-sm font-medium text-slate-200"
      >
        <Globe className="w-4 h-4 text-slate-400" />
        <span className="hidden sm:inline">{currentLang.flag} {currentLang.name}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-48 bg-card border border-card-border rounded-xl shadow-xl shadow-black/50 overflow-hidden z-50 animate-fade-in-up">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors
                  ${locale === lang.code ? 'bg-primary/20 text-primary font-medium' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
              >
                <span>{lang.flag}</span>
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
