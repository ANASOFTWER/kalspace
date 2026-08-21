"use client";

import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import Image from 'next/image';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function SignupForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [invitation, setInvitation] = useState<any>(null);

  // Retrieve token from search parameters
  const token = searchParams.get('token');

  // Verify invitation token if present
  useEffect(() => {
    async function verifyInvitation() {
      if (!token) return;

      try {
        setLoading(true);
        const { data, error } = await supabase.rpc('verify_invitation', { p_token: token });

        if (error || !data) {
          setErrorMsg(
            t.has('invalid_invitation') ? t('invalid_invitation') : 'رمز الدعوة غير صالح أو منتهي الصلاحية.'
          );
          return;
        }

        if (data.status !== 'pending') {
          setErrorMsg(
            t.has('invalid_invitation') ? t('invalid_invitation') : 'رمز الدعوة غير صالح أو تم استخدامه.'
          );
          return;
        }

        // Check if invitation is expired (e.g. older than 7 days)
        if (new Date(data.expires_at) < new Date()) {
          setErrorMsg(
            t.has('invitation_expired') ? t('invitation_expired') : 'انتهت صلاحية هذه الدعوة.'
          );
          return;
        }

        setInvitation(data);
        setEmail(data.email); // Auto-fill invitee email
        setCompanyName(data.company_name || ''); // Auto-fill company name
      } catch (err) {
        console.error('Error verifying invitation:', err);
        setErrorMsg('حدث خطأ أثناء التحقق من الدعوة.');
      } finally {
        setLoading(false);
      }
    }

    verifyInvitation();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      let finalCompanyId = null;

      if (invitation) {
        // If registering with an invitation, use the invitation's company
        finalCompanyId = invitation.company_id;
      } else {
        // Normal signup: create a new company first
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .insert({ name: companyName })
          .select()
          .single();

        if (companyError || !companyData) {
          throw new Error(companyError?.message || 'فشل إنشاء الشركة الجديدة.');
        }
        finalCompanyId = companyData.id;
      }

      // Register the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: invitation ? invitation.role : 'admin',
            company_id: finalCompanyId,
          },
        },
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'فشل عملية إنشاء الحساب.');
      }

      // If registered with an invitation, update the invitation status to accepted
      if (invitation) {
        await supabase
          .from('invitations')
          .update({ status: 'accepted' })
          .eq('id', invitation.id);
      }

      // Store in localStorage for temporary local usage/mock compatibility
      localStorage.setItem('company_name', companyName);
      localStorage.setItem('user_name', name);
      localStorage.setItem('user_email', email);

      // Redirect to onboarding or dashboard
      if (invitation) {
        router.push('/dashboard'); // Employees go straight to dashboard
      } else {
        router.push('/onboarding'); // Admins set up their virtual office
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMsg(err.message || 'حدث خطأ غير متوقع أثناء التسجيل.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg p-8 glass-card rounded-2xl animate-fade-in-up m-4">
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-24 h-24 mb-4 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Image src="/logo.png" alt="Kalspace Logo" fill className="object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-white">{t('create_account')}</h1>
        {invitation && (
          <p className="text-sm text-success mt-2 font-medium bg-success/10 px-3 py-1 rounded-full">
            أنت تنضم إلى شركة: {companyName}
          </p>
        )}
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/25 rounded-lg text-danger text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Hide Company Name input if registering via invitation */}
        {!invitation && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('company_name')}</label>
            <input 
              type="text" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Acme Corp"
              required
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">{t('name')}</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">{t('email')}</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!invitation} // Prevent email modification if invited
            className={`w-full border rounded-lg px-4 py-3 text-white focus:outline-none transition-colors ${
              invitation 
                ? 'bg-slate-800/40 border-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900/50 border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary'
            }`}
            placeholder="name@company.com"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">{t('password')}</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-3 font-semibold transition-all shadow-lg shadow-primary/25 mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            t('signup')
          )}
        </button>
      </form>

      <p className="text-center text-sm text-slate-400 mt-8">
        {t('already_have_account')} <Link href="/login" className="text-primary hover:text-primary-hover font-medium">{t('login')}</Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050816]">
      {/* Background Decorative */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -z-10" />

      <Suspense fallback={<div className="text-white text-center py-20 animate-pulse">جاري التحميل...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
