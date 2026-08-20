"use client";

import { useTranslations } from 'next-intl';
import { useState, useEffect, use } from 'react';
import { useRouter } from '@/i18n/routing';
import { Check, ChevronRight, Upload, Coffee, Monitor, Leaf, ArrowLeft, Loader2, Link as LinkIcon } from 'lucide-react';

interface OfficeMapPreviewProps {
  theme: string;
  size: string;
  locale: string;
}

function OfficeMapPreview({ theme, size, locale }: OfficeMapPreviewProps) {
  // Determine which image to show based on size
  let imageSrc = '/images/office-maps/small.png';
  if (size === '6-10') imageSrc = '/images/office-maps/medium.png';
  if (size === '11-15') imageSrc = '/images/office-maps/large.png';
  if (size === '16-20' || size === '21-25' || size === '26+') imageSrc = '/images/office-maps/xlarge.png';

  // Apply a subtle CSS filter based on the selected theme for variety
  const getThemeFilter = () => {
    switch(theme) {
      case 'cozy':
        return 'sepia(20%) contrast(1.1) brightness(0.95)';
      case 'modern':
        return 'contrast(1.15) brightness(0.9) hue-rotate(180deg) saturate(1.2)';
      case 'green':
        return 'contrast(1.1) brightness(0.95) hue-rotate(90deg) saturate(1.3)';
      default:
        return 'none';
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden rounded-2xl border-2 border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
      {/* Background layer */}
      <div className="absolute inset-0 bg-[#070A13]" />
      
      {/* The Office Map Image */}
      <img 
        src={imageSrc} 
        alt={`Virtual office layout for ${size} people`} 
        className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 ease-out hover:scale-110"
        style={{ filter: getThemeFilter() }}
      />
      
      {/* Overlay vignette for depth */}
      <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.7)] pointer-events-none rounded-2xl" />
      
      {/* Floating indicator */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center space-x-2 space-x-reverse">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-xs font-medium text-slate-200">
          {locale === 'ar' ? 'معاينة حية للمكتب' : 'Live Office Preview'}
        </span>
      </div>
    </div>
  );
}

export default function OnboardingPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = use(params);
  const t = useTranslations('onboarding');
  const tAuth = useTranslations('auth');
  const router = useRouter();
  const locale = resolvedParams.locale || 'ar';
  const isAr = locale === 'ar';

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Step 1: Office Settings
  const [theme, setTheme] = useState('cozy');
  const [size, setSize] = useState('2-5');

  // Step 2: Space Details
  const [spaceName, setSpaceName] = useState('');
  const [spaceUrl, setSpaceUrl] = useState('');
  const [goal, setGoal] = useState('');
  const [isUrlEdited, setIsUrlEdited] = useState(false);

  // Step 3: Login finish
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadText, setLoadText] = useState('');
  const [authError, setAuthError] = useState('');
  const [oauthLoading, setOauthLoading] = useState<'google' | 'microsoft' | null>(null);

  // Load existing name if available
  useEffect(() => {
    const savedName = localStorage.getItem('company_name');
    if (savedName) {
      setSpaceName(savedName);
      setSpaceUrl(slugify(savedName));
    }
  }, []);

  // Update space URL automatically based on name if the user hasn't edited it manually
  useEffect(() => {
    if (!isUrlEdited) {
      setSpaceUrl(slugify(spaceName));
    }
  }, [spaceName, isUrlEdited]);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, '') // remove non-letters, non-numbers, non-spaces, non-hyphens
      .replace(/[\s_]+/g, '-')           // replace spaces/underscores with hyphens
      .replace(/^-+|-+$/g, '')           // remove leading/trailing hyphens
      .substring(0, 20);                 // limit length
  };

  const handleUrlChange = (val: string) => {
    setIsUrlEdited(true);
    // Allow any language letters, numbers, and hyphens
    const clean = val.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, '').substring(0, 20);
    setSpaceUrl(clean);
  };

  const isStep2Valid = spaceName.trim().length > 0 && spaceUrl.length >= 6 && spaceUrl.length <= 20 && goal !== '';

  const handleComplete = async (userEmail: string, method: string) => {
    setIsLoading(true);
    setAuthError('');
    
    // Multi-step loading process for a premium feel
    const progressSteps = isAr ? [
      { progress: 20, text: 'جاري التحقق من الهوية والمساحة...' },
      { progress: 50, text: 'جاري حجز النطاق الفرعي للمكتب...' },
      { progress: 75, text: 'جاري تهيئة الغرف وتوزيع الأثاث الافتراضي...' },
      { progress: 95, text: 'جاري إعداد لوحة التحكم الخاصة بك...' },
      { progress: 100, text: 'اكتمل الإنشاء! جاري نقلك لمكتبك...' }
    ] : [
      { progress: 20, text: 'Verifying identity and office space...' },
      { progress: 50, text: 'Reserving your virtual domain URL...' },
      { progress: 75, text: 'Initializing rooms and placing furniture...' },
      { progress: 95, text: 'Configuring your control panel dashboard...' },
      { progress: 100, text: 'Setup complete! Redirecting to your office...' }
    ];

    for (const stepInfo of progressSteps) {
      setLoadProgress(stepInfo.progress);
      setLoadText(stepInfo.text);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    // Save final configurations to localStorage
    localStorage.setItem('company_name', spaceName);
    localStorage.setItem('company_url_slug', spaceUrl);
    localStorage.setItem('company_theme', theme);
    localStorage.setItem('company_size', size);
    localStorage.setItem('company_goal', goal);
    localStorage.setItem('user_name', userEmail.split('@')[0]);
    localStorage.setItem('user_email', userEmail);
    localStorage.setItem('company_setup_completed', 'true');

    // Also persist custom theme/decor indicators for VirtualOffice component
    const mappedDecor = theme === 'cozy' ? 'wood' : theme === 'modern' ? 'cyberpunk' : 'nature';
    const mappedLighting = theme === 'cozy' ? 'warm' : theme === 'modern' ? 'neon-dim' : 'bright';
    localStorage.setItem(`kalspace_decor_SaaS Main Office`, mappedDecor);
    localStorage.setItem(`kalspace_lighting_SaaS Main Office`, mappedLighting);

    setIsLoading(false);
    router.push('/dashboard');
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError(isAr ? 'الرجاء إدخال البريد الإلكتروني وكلمة المرور.' : 'Please fill in both email and password.');
      return;
    }
    if (password.length < 6) {
      setAuthError(isAr ? 'يجب أن تتكون كلمة المرور من 6 خانات على الأقل.' : 'Password must be at least 6 characters.');
      return;
    }
    handleComplete(email, 'email');
  };

  const handleOAuthLogin = (provider: 'google' | 'microsoft') => {
    setOauthLoading(provider);
    setTimeout(() => {
      setOauthLoading(null);
      const mockEmail = provider === 'google' ? 'admin@google-login.com' : 'admin@microsoft-login.com';
      handleComplete(mockEmail, provider);
    }, 1500); // Simulated delay for OAuth popup login flow
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050816] text-white">
      {/* Gradient ambient glow background */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[180px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[180px] -z-10" />

      {/* Main card box */}
      <div className="w-full max-w-5xl p-6 md:p-10 glass-card rounded-2xl animate-fade-in-up m-4 relative z-10 border border-white/10">
        
        {/* Top bar header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            {step > 1 && !isLoading && (
              <button 
                onClick={() => setStep(step - 1)}
                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                title={t('back')}
              >
                <ArrowLeft className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
              </button>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {step === 1 && t('setup_office')}
                {step === 2 && t('name_space')}
                {step === 3 && t('finish_title')}
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                {step === 1 && t('setup_office_subtitle')}
                {step === 2 && t('url_label')}
                {step === 3 && t('disclaimer')}
              </p>
            </div>
          </div>
          <div className="text-sm font-medium text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-full border border-white/5">
            {isAr ? `الخطوة ${step} من ${totalSteps}` : `Step ${step} of ${totalSteps}`}
          </div>
        </div>

        {/* Step progress loader overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#050816]/90 backdrop-blur-md rounded-2xl z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
            <h3 className="text-xl font-bold mb-2">{isAr ? 'جاري تجهيز مساحتك الافتراضية' : 'Preparing Your Virtual Space'}</h3>
            <p className="text-slate-400 text-sm max-w-md mb-6">{loadText}</p>
            
            {/* Loading Progress Bar */}
            <div className="w-full max-w-md bg-slate-800 h-3 rounded-full overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-300 ease-out"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 mt-2 font-mono">{loadProgress}%</span>
          </div>
        )}

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-[420px]">
          
          {/* Step 1 Content: Theme & Size selection + Map Preview */}
          {step === 1 && (
            <>
              {/* Left Selector Column */}
              <div className="lg:col-span-6 space-y-8">
                {/* Theme selection */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-4">{t('theme')}</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'cozy', label: t('cozy'), icon: Coffee },
                      { id: 'modern', label: t('modern'), icon: Monitor },
                      { id: 'green', label: t('green'), icon: Leaf }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = theme === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setTheme(item.id)}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                            isActive 
                              ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10' 
                              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/70'
                          }`}
                        >
                          <Icon className={`w-8 h-8 mb-2 ${isActive ? 'text-primary' : 'text-slate-500'}`} />
                          <span className="text-sm font-semibold">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Size Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-4">{t('size')}</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {['2-5', '6-10', '11-15', '16-20', '21-25', '26+'].map((sz) => {
                      const isActive = size === sz;
                      return (
                        <button
                          key={sz}
                          onClick={() => setSize(sz)}
                          className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                            isActive 
                              ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10' 
                              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/70'
                          }`}
                        >
                          <span className="text-base font-bold">{sz}</span>
                          <span className="text-xs text-slate-500 mt-1">{t('people')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Map Preview Column */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center bg-slate-950/40 border border-slate-900 rounded-2xl p-6 lg:p-10 aspect-square max-w-[420px] mx-auto w-full">
                <div className="w-full h-full relative">
                  <OfficeMapPreview theme={theme} size={size} locale={locale} />
                </div>
              </div>
            </>
          )}

          {/* Step 2 Content: Space Details */}
          {step === 2 && (
            <div className="lg:col-span-12 max-w-xl mx-auto w-full space-y-6">
              {/* Space Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('space_name_label')}</label>
                <input 
                  type="text"
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-white"
                  required
                />
              </div>

              {/* Space URL Generated */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('url_label')}</label>
                <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                  <span className="px-4 text-slate-500 select-none bg-slate-950/50 border-r border-slate-850 py-3 text-sm font-mono flex items-center gap-1.5 animate-pulse">
                    <LinkIcon className="w-3.5 h-3.5" />
                    www.kalspace.com/
                  </span>
                  <input 
                    type="text"
                    value={spaceUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="my-company"
                    className="w-full bg-transparent px-4 py-3 outline-none text-white font-mono text-sm"
                    required
                  />
                </div>
                {spaceUrl.length > 0 && spaceUrl.length < 6 && (
                  <p className="text-xs text-amber-500 mt-2">
                    {isAr ? 'يجب أن يكون الرابط 6 أحرف على الأقل.' : 'URL slug must be at least 6 characters.'}
                  </p>
                )}
              </div>

              {/* Goal Select */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('goal_label')}</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-white appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: isAr ? 'left 1rem center' : 'right 1rem center', backgroundSize: '1.25em 1.25em', backgroundRepeat: 'no-repeat' }}
                >
                  <option value="" disabled className="bg-[#0f132a]">{t('goal_placeholder')}</option>
                  <option value="communication" className="bg-[#0f132a]">{t('goal_communication')}</option>
                  <option value="productivity" className="bg-[#0f132a]">{t('goal_productivity')}</option>
                  <option value="visibility" className="bg-[#0f132a]">{t('goal_visibility')}</option>
                  <option value="culture" className="bg-[#0f132a]">{t('goal_culture')}</option>
                  <option value="engagement" className="bg-[#0f132a]">{t('goal_engagement')}</option>
                  <option value="other" className="bg-[#0f132a]">{t('goal_other')}</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3 Content: Sign In / Finish (Login layout with office preview on the left) */}
          {step === 3 && (
            <>
              {/* Left Column: Configured Map Preview */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-950/40 border border-slate-900 rounded-2xl p-6 aspect-square max-w-[340px] mx-auto w-full">
                <OfficeMapPreview theme={theme} size={size} locale={locale} />
                <div className="mt-4 text-center">
                  <h4 className="text-base font-bold text-white">{spaceName}</h4>
                  <p className="text-xs text-primary font-mono mt-1">kumospace.com/{spaceUrl}</p>
                </div>
              </div>

              {/* Right Column: Custom Login Flow */}
              <div className="lg:col-span-7 space-y-6 bg-slate-900/20 p-6 rounded-xl border border-white/5 max-w-md mx-auto w-full">
                
                {authError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
                    {authError}
                  </div>
                )}

                {/* Email Sign In Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">{tAuth('email')}</label>
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">{tAuth('password')}</label>
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-white"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg py-2.5 text-sm font-semibold transition-all shadow-lg shadow-primary/25 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {t('sign_in_email')}
                  </button>
                </form>

                {/* OR Divider */}
                <div className="flex items-center justify-center gap-4 text-xs text-slate-500 uppercase tracking-widest my-2 select-none">
                  <div className="h-[1px] bg-slate-800 flex-1" />
                  <span>{t('or')}</span>
                  <div className="h-[1px] bg-slate-800 flex-1" />
                </div>

                {/* Social logins */}
                <div className="space-y-2.5">
                  <button
                    onClick={() => handleOAuthLogin('google')}
                    disabled={oauthLoading !== null}
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 rounded-lg py-2.5 text-sm font-semibold transition-all border border-slate-200 cursor-pointer disabled:opacity-50"
                  >
                    {oauthLoading === 'google' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.72 14.93 1 12 1 7.37 1 3.4 3.66 1.48 7.54l3.77 2.92c.9-2.7 3.43-4.52 6.75-4.52z"/>
                        <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.98 3.39-4.89 3.39-8.5z"/>
                        <path fill="#FBBC05" d="M5.25 14.77c-.24-.72-.37-1.49-.37-2.27s.13-1.55.37-2.27L1.48 7.31C.54 9.22 0 11.35 0 13.6s.54 4.38 1.48 6.29l3.77-2.92c-.24-.72-.37-1.49-.37-2.27z"/>
                        <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.1.74-2.51 1.18-4.3 1.18-3.32 0-5.85-1.82-6.75-4.52L1.48 16.83C3.4 20.71 7.37 23 12 23z"/>
                      </svg>
                    )}
                    {t('sign_in_google')}
                  </button>

                  <button
                    onClick={() => handleOAuthLogin('microsoft')}
                    disabled={oauthLoading !== null}
                    className="w-full flex items-center justify-center gap-3 bg-[#2F2F2F] hover:bg-[#3F3F3F] text-white rounded-lg py-2.5 text-sm font-semibold transition-all border border-white/5 cursor-pointer disabled:opacity-50"
                  >
                    {oauthLoading === 'microsoft' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 23 23">
                        <rect x="0" y="0" width="11" height="11" fill="#F25022" />
                        <rect x="12" y="0" width="11" height="11" fill="#7FBA00" />
                        <rect x="0" y="12" width="11" height="11" fill="#00A4EF" />
                        <rect x="12" y="12" width="11" height="11" fill="#FFB900" />
                      </svg>
                    )}
                    {t('sign_in_microsoft')}
                  </button>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Navigation Footer */}
        {step < totalSteps && (
          <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
            <button 
              onClick={() => setStep(Math.max(1, step - 1))}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'}`}
            >
              {t('back')}
            </button>
            
            <button 
              onClick={() => {
                if (step < totalSteps) setStep(step + 1);
              }}
              disabled={step === 2 && !isStep2Valid}
              className={`px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-all shadow-lg shadow-primary/25 flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none`}
            >
              {step === 1 ? t('next_name_space') : t('next_create_space')}
              <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
