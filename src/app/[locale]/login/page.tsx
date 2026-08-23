"use client";

import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import Image from 'next/image';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let msg = error.message;
        if (error.message === 'Invalid login credentials') {
          msg = 'بيانات تسجيل الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور.';
        }
        setErrorMsg(msg);
        setLoading(false);
        return;
      }

      // Fetch user profile to ensure they are assigned a company
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, companies(name)')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          localStorage.setItem('company_name', profile.companies?.name || '');
          localStorage.setItem('user_name', profile.full_name || '');
        }
      }

      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء تسجيل الدخول.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050816]">
      {/* Background Decorative */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-md p-8 glass-card rounded-2xl animate-fade-in-up m-4">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-24 h-24 mb-4 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Image src="/logo.png" alt="Kalspace Logo" fill className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t('welcome_back')}</h1>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/25 rounded-lg text-danger text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('email')}</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="name@company.com"
              required
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-300">{t('password')}</label>
              <a href="#" className="text-xs text-primary hover:text-primary-hover">{t('forgot_password')}</a>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-3 font-semibold transition-all shadow-lg shadow-primary/25 mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              t('login')
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-8">
          {t('dont_have_account')} <Link href="/signup" className="text-primary hover:text-primary-hover font-medium">{t('signup')}</Link>
        </p>
      </div>
    </div>
  );
}
