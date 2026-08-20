"use client";

import { useState, useEffect, useRef } from 'react';
import { Link } from '@/i18n/routing';
import LanguageSelector from '@/components/navigation/LanguageSelector';
import Image from 'next/image';
import { 
  ArrowRight, Check, Shield, Lock, Eye, Fingerprint,
  MessageSquare, Video, Users, Zap, ChevronDown,
  Timer, ListChecks, MonitorPlay, Star, Quote,
  Wifi, Globe, Clock, HeadphonesIcon, Play, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

/* ═══════════════════════════════════════════════════════
   HELPER: Section wrapper with scroll-triggered fade-in
   ═══════════════════════════════════════════════════════ */
function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   HELPER: Animated counter
   ═══════════════════════════════════════════════════════ */
function AnimCounter({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let s = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => { s += step; if (s >= target) { setCount(target); clearInterval(id); } else setCount(Math.floor(s)); }, 16);
    return () => clearInterval(id);
  }, [started, target, duration]);
  return <span ref={ref}>{String(count)}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════════ */
export default function LandingPage() {
  // Feature tabs
  const [activeFeature, setActiveFeature] = useState(0);
  const features = [
    { 
      title: 'صوت فضائي ثلاثي الأبعاد', 
      subtitle: 'اسمع كما لو كنت هناك',
      desc: 'تقنية الصوت الفضائي تجعل المحادثات تبدو طبيعية تماماً. كلما اقتربت من زميلك في المكتب الافتراضي، يزداد وضوح صوته تدريجياً — تماماً كما يحدث في المكتب الحقيقي. لا حاجة لروابط اجتماعات أو غرف منفصلة.',
      img: '/spatial-audio.jpg',
      color: 'from-cyan-500 to-blue-600',
      accent: 'text-cyan-300 font-bold',
      bgAccent: 'bg-cyan-500/10',
    },
    { 
      title: 'خصوصية مطلقة ومشفرة', 
      subtitle: 'حمايتك أولويتنا',
      desc: 'مناطق خصوصية ذكية تغلق الكاميرا والمايك تلقائياً. فقاعات تواصل مشفرة من طرف إلى طرف لا يمكن لأي شخص خارجها سماع أو قراءة محتواها. حماية على مستوى المؤسسات مع SSO و SOC 2 و GDPR.',
      img: '/privacy-shield.jpg',
      color: 'from-purple-500 to-violet-600',
      accent: 'text-purple-300 font-bold',
      bgAccent: 'bg-purple-500/10',
    },
    { 
      title: 'تعاون فريق حقيقي', 
      subtitle: 'أكثر من مجرد اجتماعات',
      desc: 'غرف اجتماعات بشاشات عرض مشتركة، سبورات تفاعلية، ومحطات عمل مدمج فيها مؤقت تركيز Pomodoro وقوائم مهام ذكية. كل شيء في مكان واحد بدون التنقل بين تطبيقات.',
      img: '/team-collab.jpg',
      color: 'from-violet-500 to-indigo-600',
      accent: 'text-violet-300 font-bold',
      bgAccent: 'bg-violet-500/10',
    },
  ];

  // Auto-rotate features
  useEffect(() => {
    const id = setInterval(() => setActiveFeature(p => (p + 1) % features.length), 7000);
    return () => clearInterval(id);
  }, []);

  // Testimonials
  const [testIdx, setTestIdx] = useState(0);
  const testimonials = [
    { name: 'محمد العتيبي', role: 'CEO، شركة التقنية المتقدمة', text: 'Kalspace غيّر طريقة تواصلنا كفريق عن بعد بالكامل. الصوت الفضائي والفقاعات الخاصة أعطونا شعور حقيقي بالتواجد معاً. إنتاجيتنا ارتفعت 40% خلال شهر واحد.', stars: 5, avatar: '👨‍💼' },
    { name: 'لينا الشمري', role: 'مديرة HR، مجموعة الابتكار', text: 'ميزة خصوصية المساحات الحساسة والمحطات التفاعلية جعلت الموظفين يشعرون بالراحة والإنتاجية. أفضل استثمار عملناه للعمل عن بعد.', stars: 5, avatar: '👩‍💻' },
    { name: 'فيصل المالكي', role: 'CTO، استوديو الألعاب', text: 'أخيراً منصة تجمع بين المتعة والعمل الجاد. الألعاب المصغرة وصالة الاستراحة أضافت روحاً لفريقنا المتفرق حول العالم.', stars: 5, avatar: '👨‍🔬' },
  ];
  useEffect(() => {
    const id = setInterval(() => setTestIdx(p => (p + 1) % testimonials.length), 6000);
    return () => clearInterval(id);
  }, []);

  // FAQ
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const faqs = [
    { q: 'هل Kalspace مجاني؟', a: 'نعم! نقدم باقة مجانية تتضمن حتى 10 مستخدمين مع جميع الميزات الأساسية. لا نحتاج بطاقة ائتمان للبدء.' },
    { q: 'كيف يعمل الصوت الفضائي؟', a: 'كلما اقتربت شخصيتك من زميلك في خريطة المكتب، يزداد وضوح الصوت بينكما تلقائياً وتدريجياً. ابتعد وينخفض. بالضبط كالواقع — لا حاجة لروابط أو غرف.' },
    { q: 'هل البيانات مشفرة؟', a: 'جميع المكالمات والرسائل مشفرة بتقنية WebRTC من طرف إلى طرف (E2E). نلتزم بمعايير SOC 2 و GDPR لحماية بيانات مؤسستك.' },
    { q: 'هل يمكنني تخصيص المكتب؟', a: 'بالكامل! ابنِ مكتبك من الصفر — أضف أثاثاً، اختر ديكوراً، عيّن أقساماً، وخصص كل تفصيلة تناسب ثقافة شركتك.' },
    { q: 'ما الأجهزة المدعومة؟', a: 'يعمل على جميع المتصفحات الحديثة بدون تحميل. متاح أيضاً كتطبيق سطح مكتب لـ Windows و Mac. تطبيق الهاتف قيد التطوير.' },
  ];

  return (
    <div className="min-h-screen bg-[#050510] text-white overflow-x-hidden" dir="rtl">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        .landing-page * { font-family: 'Inter', system-ui, sans-serif; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes float-slow { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(1deg); } }
        @keyframes marquee-rtl { 0% { transform: translateX(0); } 100% { transform: translateX(50%); } }
        @keyframes progress-bar { 0% { width: 0%; } 100% { width: 100%; } }
        .shimmer-text { background: linear-gradient(110deg, #f8fafc 35%, #ffffff 50%, #e2e8f0 65%); background-size: 200% 100%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s ease-in-out infinite; }
        .img-glow { filter: drop-shadow(0 0 80px rgba(59,130,246,0.25)); }
        .feature-progress { animation: progress-bar 7s linear; }
      `}</style>

      <div className="landing-page">

        {/* ═══ HEADER ═══ */}
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between backdrop-blur-2xl bg-[#050510]/85 border-b border-white/10 rounded-b-2xl shadow-xl">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8">
                <Image src="/logo.png" alt="Kalspace" fill className="object-contain" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">Kalspace</span>
            </div>
            <nav className="hidden md:flex items-center gap-10 text-sm text-slate-200 font-semibold">
              <a href="#features" className="hover:text-cyan-400 transition-colors duration-300">الميزات</a>
              <a href="#how" className="hover:text-cyan-400 transition-colors duration-300">كيف يعمل</a>
              <a href="#security" className="hover:text-cyan-400 transition-colors duration-300">الأمان</a>
              <a href="#pricing" className="hover:text-cyan-400 transition-colors duration-300">الأسعار</a>
            </nav>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <Link href="/login" className="text-sm font-semibold text-slate-200 hover:text-white transition-colors hidden sm:block">الدخول</Link>
              <Link href="/signup" className="px-5 py-2.5 text-sm font-bold bg-white text-[#050510] rounded-xl hover:bg-slate-100 transition-all shadow-lg hover:shadow-cyan-500/20">
                ابدأ مجاناً
              </Link>
            </div>
          </div>
        </header>

        {/* ═══ SECTION 1: HERO ═══ */}
        <section className="relative pt-36 pb-12 min-h-screen flex flex-col items-center justify-center">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-gradient-radial from-blue-600/15 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[100px]" />
          
          <div className="relative z-10 max-w-5xl mx-auto text-center px-6 space-y-8">
            {/* Chip */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-bold text-blue-300 shadow-lg">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              المنصة #1 للمكاتب الافتراضية — أكثر من 10,000 فريق يستخدمونها
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
              className="text-[clamp(2.6rem,7.5vw,5.8rem)] font-black leading-[1.08] tracking-tight">
              <span className="shimmer-text">مكتبك الحقيقي.</span>
              <br />
              <span className="bg-gradient-to-l from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">في أي مكان بالعالم.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="text-[clamp(1.05rem,2vw,1.35rem)] text-slate-200 max-w-2xl mx-auto leading-[1.8] font-normal drop-shadow-sm">
              مقر افتراضي تفاعلي يجمع فريقك بصوت فضائي، فقاعات خصوصية مشفرة، 
              ومحطات عمل ذكية — أكثر إنتاجية ومتعة من أي حل تقليدي.
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link href="/signup"
                className="group w-full sm:w-auto px-8 py-4 bg-white text-[#050510] rounded-xl font-extrabold text-base transition-all hover:bg-slate-100 hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2">
                ابدأ مجاناً — بدون بطاقة ائتمان
                <ArrowRight className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              </Link>
              <a href="#features"
                className="w-full sm:w-auto px-8 py-4 border border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg">
                <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" /> اكتشف الميزات
              </a>
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-6xl mx-auto mt-16 px-6"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.9)] img-glow" style={{ animation: 'float-slow 8s ease-in-out infinite' }}>
              <Image src="/hero-office.jpg" alt="Kalspace Virtual Office" width={1920} height={1080} className="w-full h-auto" priority />
              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050510]/30 via-transparent to-[#050510]/30" />
              {/* Bottom label */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-black/80 backdrop-blur-xl border border-white/20 text-xs font-bold text-white shadow-2xl">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
                مكتب افتراضي حي ثلاثي الأبعاد — 23 موظف متصل الآن
              </div>
            </div>
          </motion.div>
        </section>

        {/* ═══ SECTION 2: LOGO TICKER ═══ */}
        <section className="py-16 border-y border-white/10 bg-white/[0.01]">
          <p className="text-center text-xs font-bold text-slate-300 uppercase tracking-[0.25em] mb-10">تثق بنا فرق العمل في أفضل الشركات العالمية</p>
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-l from-transparent to-[#050510] z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-r from-transparent to-[#050510] z-10" />
            <div className="flex gap-20 items-center whitespace-nowrap" style={{ animation: 'marquee-rtl 40s linear infinite', width: 'max-content' }}>
              {[...Array(3)].map((_, r) => (
                <div key={r} className="flex gap-20 items-center">
                  {['Google', 'Microsoft', 'Amazon', 'Notion', 'Figma', 'Slack', 'Stripe', 'Vercel', 'Linear'].map(n => (
                    <span key={`${r}-${n}`} className="text-slate-400 font-extrabold text-2xl tracking-wide select-none hover:text-white transition-colors">{n}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ SECTION 3: FEATURES — Cinematic Tabs ═══ */}
        <section id="features" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <RevealSection>
              <div className="text-center mb-20 space-y-5">
                <p className="text-xs font-extrabold text-cyan-400 uppercase tracking-[0.25em]">الميزات الرئيسية</p>
                <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] font-black tracking-tight leading-[1.1] text-white">
                  ليست مجرد مكالمات فيديو.
                  <br />
                  <span className="text-slate-400">بل تجربة مكتبية متكاملة.</span>
                </h2>
              </div>
            </RevealSection>

            <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12 items-start">
              {/* Tabs */}
              <RevealSection delay={0.1}>
                <div className="space-y-4 sticky top-28">
                  {features.map((f, i) => (
                    <button key={i} onClick={() => setActiveFeature(i)}
                      className={`w-full text-right p-6 rounded-2xl border transition-all duration-500 relative overflow-hidden ${
                        activeFeature === i 
                          ? 'border-cyan-500/40 bg-white/[0.06] shadow-xl' 
                          : 'border-white/5 hover:border-white/15 hover:bg-white/[0.03]'
                      }`}
                    >
                      {activeFeature === i && (
                        <div className="absolute top-0 right-0 w-[4px] h-full rounded-full overflow-hidden bg-white/10">
                          <div className={`h-full bg-gradient-to-b ${f.color} feature-progress`} key={`progress-${i}-${activeFeature}`} />
                        </div>
                      )}
                      <div className="relative">
                        <p className={`text-xs uppercase tracking-[0.15em] mb-2 transition-colors ${activeFeature === i ? f.accent : 'text-slate-400'}`}>
                          {f.subtitle}
                        </p>
                        <h3 className={`text-xl font-bold mb-2 transition-colors ${activeFeature === i ? 'text-white' : 'text-slate-300'}`}>
                          {f.title}
                        </h3>
                        {activeFeature === i && (
                          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            className="text-sm text-slate-200 leading-[1.8] mt-3 font-normal">{f.desc}</motion.p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </RevealSection>

              {/* Image */}
              <RevealSection delay={0.2}>
                <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
                  <AnimatePresence mode="wait">
                    <motion.div key={activeFeature}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Image src={features[activeFeature].img} alt={features[activeFeature].title}
                        width={1200} height={675} className="w-full h-auto" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050510]/60 via-transparent to-transparent" />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </RevealSection>
            </div>
          </div>
        </section>

        {/* ═══ SECTION 4: HOW IT WORKS ═══ */}
        <section id="how" className="py-32 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent" />
          <div className="max-w-6xl mx-auto relative">
            <RevealSection>
              <div className="text-center mb-20 space-y-5">
                <p className="text-xs font-extrabold text-emerald-400 uppercase tracking-[0.25em]">كيف يعمل</p>
                <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] font-black tracking-tight text-white">
                  ابدأ خلال 3 دقائق فقط.
                </h2>
                <p className="text-slate-300 text-lg max-w-lg mx-auto">لا تحتاج تثبيت أي برامج معقدة. افتح المتصفح وابدأ العمل.</p>
              </div>
            </RevealSection>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'أنشئ مقر شركتك', desc: 'سجّل واختر تصميم مكتبك من القوالب ثلاثية الأبعاد الجاهزة أو ابنِه من الصفر. أضف مكاتب، غرف اجتماعات، وصالات ترفيه.', icon: '🏢' },
                { step: '02', title: 'ادعُ فريقك بضغطة زر', desc: 'شارك رابط الدعوة المباشر أو أرسل دعوات فورية عبر البريد الإلكتروني. ينضم فريقك مباشرة بدون تحميل.', icon: '👥' },
                { step: '03', title: 'ابدأ العمل والتعاون', desc: 'تحرّك في أرجاء المكتب، تحدّث مع زملائك بالصوت الفضائي الطبيعي، واستخدم محطات العمل الذكية.', icon: '🚀' },
              ].map((s, i) => (
                <RevealSection key={i} delay={i * 0.15}>
                  <div className="relative p-8 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-cyan-500/40 hover:bg-white/[0.06] transition-all duration-500 group shadow-lg">
                    <div className="absolute top-6 left-6 text-6xl font-black text-white/5 leading-none select-none group-hover:text-cyan-500/10 transition-colors">{s.step}</div>
                    <div className="relative">
                      <span className="text-4xl mb-6 block">{s.icon}</span>
                      <h3 className="text-xl font-bold mb-3 text-white">{s.title}</h3>
                      <p className="text-sm text-slate-300 leading-[1.8]">{s.desc}</p>
                    </div>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ SECTION 5: FULL-WIDTH FEATURE IMAGE ═══ */}
        <RevealSection className="py-16 px-6">
          <div className="max-w-7xl mx-auto relative">
            <div className="rounded-3xl overflow-hidden border border-white/15 relative shadow-2xl">
              <Image src="/hero-office.jpg" alt="Kalspace Office Overview" width={1920} height={1080} className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-12">
                <div className="max-w-2xl mr-auto text-right">
                  <h3 className="text-3xl md:text-4xl font-black mb-4 tracking-tight text-white">مقر شركة متكامل في شاشتك</h3>
                  <p className="text-slate-200 text-base leading-[1.8]">
                    خريطة تفاعلية بالكامل — أقسام، غرف اجتماعات، صالة استراحة وألعاب، ودورة مياه ذكية. 
                    كل عنصر فيها قابل للتفاعل والتخصيص ليناسب احتياجك وفريقك.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* ═══ SECTION 6: SECURITY ═══ */}
        <section id="security" className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <RevealSection>
              <div className="text-center mb-20 space-y-5">
                <p className="text-xs font-extrabold text-amber-400 uppercase tracking-[0.25em]">الأمان والامتثال</p>
                <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] font-black tracking-tight text-white">
                  أمان لا يقبل أي مساومة.
                </h2>
              </div>
            </RevealSection>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: 'تشفير شامل E2E', desc: 'جميع المكالمات والرسائل مشفرة من طرف إلى طرف بتقنية WebRTC المتطورة. لا يمكن لأي جهة ثالثة الوصول إليها.', gradient: 'from-emerald-500/15 to-transparent' },
                { icon: Fingerprint, title: 'تسجيل دخول موحد SSO', desc: 'ادمج مع Google Workspace أو Microsoft Azure AD أو Okta لتسجيل دخول آمن وسلس لجميع الموظفين.', gradient: 'from-blue-500/15 to-transparent' },
                { icon: Lock, title: 'معايير SOC 2 و GDPR', desc: 'نلتزم بأعلى معايير حماية البيانات والخصوصية العالمية. بياناتك مخزنة بأمان في مراكز بيانات معتمدة.', gradient: 'from-purple-500/15 to-transparent' },
              ].map((s, i) => (
                <RevealSection key={i} delay={i * 0.1}>
                  <div className={`p-8 rounded-2xl border border-white/10 bg-gradient-to-b ${s.gradient} hover:border-white/20 transition-all duration-500 space-y-5 shadow-lg`}>
                    <s.icon className="w-9 h-9 text-cyan-300" strokeWidth={1.75} />
                    <h3 className="text-xl font-bold text-white">{s.title}</h3>
                    <p className="text-sm text-slate-300 leading-[1.8]">{s.desc}</p>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ SECTION 7: STATS ═══ */}
        <section className="py-24 px-6 border-y border-white/10 bg-white/[0.01]">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { target: 10000, suffix: '+', label: 'مستخدم نشط يومياً', color: 'text-white' },
              { target: 50, suffix: '+', label: 'دولة حول العالم', color: 'text-white' },
              { target: 99, suffix: '.9%', label: 'وقت تشغيل مضمون', color: 'text-white' },
              { target: 24, suffix: '/7', label: 'دعم فني مستمر', color: 'text-white' },
            ].map((s, i) => (
              <RevealSection key={i} delay={i * 0.1} className="text-center">
                <div className={`text-[clamp(2.2rem,5vw,3.8rem)] font-black ${s.color} tracking-tight`}>
                  <AnimCounter target={s.target} suffix={s.suffix} />
                </div>
                <p className="text-sm text-slate-300 mt-2 font-semibold">{s.label}</p>
              </RevealSection>
            ))}
          </div>
        </section>

        {/* ═══ SECTION 8: TESTIMONIALS ═══ */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto">
            <RevealSection>
              <div className="text-center mb-16 space-y-5">
                <p className="text-xs font-extrabold text-cyan-400 uppercase tracking-[0.25em]">آراء العملاء</p>
                <h2 className="text-[clamp(2rem,3.5vw,2.8rem)] font-black tracking-tight text-white">
                  فرق حقيقية. نتائج مذهلة.
                </h2>
              </div>
            </RevealSection>

            <div className="relative min-h-[280px]">
              <AnimatePresence mode="wait">
                <motion.div key={testIdx}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center space-y-8 p-10 rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl"
                >
                  <div className="text-5xl">{testimonials[testIdx].avatar}</div>
                  <p className="text-xl md:text-2xl text-slate-100 leading-[1.8] font-normal max-w-2xl mx-auto">
                    &ldquo;{testimonials[testIdx].text}&rdquo;
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    {[...Array(testimonials[testIdx].stars)].map((_, s) => (
                      <Star key={s} className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow" />
                    ))}
                  </div>
                  <div>
                    <p className="font-extrabold text-white text-lg">{testimonials[testIdx].name}</p>
                    <p className="text-sm text-slate-300 mt-1">{testimonials[testIdx].role}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex justify-center gap-2.5 mt-8">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setTestIdx(i)}
                  className={`h-2 rounded-full transition-all duration-500 ${i === testIdx ? 'bg-cyan-400 w-8 shadow-[0_0_10px_#22d3ee]' : 'bg-white/20 w-4 hover:bg-white/40'}`} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══ SECTION 9: FAQ ═══ */}
        <section id="faq" className="py-32 px-6">
          <div className="max-w-3xl mx-auto">
            <RevealSection>
              <div className="text-center mb-16 space-y-5">
                <h2 className="text-[clamp(2rem,3.5vw,2.8rem)] font-black tracking-tight text-white">الأسئلة الشائعة</h2>
              </div>
            </RevealSection>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <RevealSection key={i} delay={i * 0.05}>
                  <div className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden">
                    <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                      className="w-full flex items-center justify-between p-6 text-right group">
                      <span className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors">{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-300 shrink-0 transition-transform duration-300 ${faqOpen === i ? 'rotate-180 text-cyan-400' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {faqOpen === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                          <p className="px-6 pb-6 text-sm text-slate-200 leading-[1.9] border-t border-white/5 pt-4">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ SECTION 10: FINAL CTA ═══ */}
        <section id="pricing" className="py-32 px-6">
          <RevealSection>
            <div className="max-w-4xl mx-auto text-center relative p-12 rounded-3xl border border-white/15 bg-gradient-to-b from-blue-950/20 to-purple-950/20 backdrop-blur-xl shadow-2xl">
              {/* Ambient glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[100px]" />
              <div className="relative space-y-8">
                <h2 className="text-[clamp(2.2rem,5vw,4.2rem)] font-black tracking-tight leading-[1.1] text-white">
                  جاهز لتجربة مقر افتراضي يبهر فريقك؟
                </h2>
                <p className="text-slate-200 text-lg max-w-xl mx-auto leading-[1.8]">
                  انضم لآلاف الفرق التي تعمل بإنتاجية أعلى وتواصل أفضل. مجاناً للبدء — بدون بطاقة ائتمان.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <Link href="/signup"
                    className="group px-10 py-4 bg-white text-[#050510] rounded-xl font-extrabold text-lg transition-all hover:bg-slate-100 hover:shadow-[0_0_50px_rgba(255,255,255,0.25)] flex items-center gap-2">
                    ابدأ مجاناً الآن <ArrowRight className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                  </Link>
                  <Link href="/login"
                    className="px-10 py-4 border border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-lg transition-all">
                    تسجيل الدخول
                  </Link>
                </div>
              </div>
            </div>
          </RevealSection>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="py-16 px-6 border-t border-white/10 bg-black/40">
          <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-10">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative w-7 h-7"><Image src="/logo.png" alt="Kalspace" fill className="object-contain" /></div>
                <span className="font-extrabold text-base text-white">Kalspace</span>
              </div>
              <p className="text-sm text-slate-300 leading-[1.9] max-w-xs">
                المنصة الأولى للمكاتب الافتراضية التفاعلية. صُممت لتجعل العمل عن بعد أكثر إنتاجية وإنسانية وتواصلاً.
              </p>
            </div>
            {[
              { title: 'المنتج', links: ['المكتب الافتراضي', 'الصوت الفضائي', 'الدردشة', 'غرف الاجتماعات'] },
              { title: 'الشركة', links: ['من نحن', 'المدونة', 'الوظائف', 'تواصل معنا'] },
              { title: 'القانوني', links: ['الخصوصية', 'الشروط', 'الأمان', 'GDPR'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-xs font-bold text-white mb-5 uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map(link => (
                    <li key={link}><a className="text-sm text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/10 text-center text-xs text-slate-400">
            © 2026 Kalspace. جميع الحقوق محفوظة.
          </div>
        </footer>

      </div>
    </div>
  );
}
