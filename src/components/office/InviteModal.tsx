"use client";

import { useState, useEffect } from 'react';
import { X, Copy, Mail, Check, Loader2, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  companyId?: string;
  locale?: string;
}

export default function InviteModal({ isOpen, onClose, companyName, companyId, locale = 'ar' }: InviteModalProps) {
  const [copied, setCopied] = useState(false);
  const [emails, setEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  useEffect(() => {
    async function generateInviteLink() {
      if (!isOpen) return;

      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kalspace.com';
      
      if (!companyId || companyId === 'kalspace_shared_demo_room') {
        // Fallback for local testing / demo mode
        setGeneratedLink(`${origin}/${locale}/signup?token=demo-uuid-token-12345`);
        return;
      }

      try {
        setLoading(true);
        // Create a real invitation row in Supabase
        const { data, error } = await supabase
          .from('invitations')
          .insert({
            email: `guest-${Date.now()}@temp.com`, // Unique temp email
            role: 'employee',
            company_id: companyId
          })
          .select()
          .single();

        if (error || !data) {
          throw error || new Error('Failed to create invitation');
        }

        setGeneratedLink(`${origin}/${locale}/signup?token=${data.token}`);
      } catch (err) {
        console.error('Error generating invite link in modal:', err);
        // Fallback to basic company setup signup link
        setGeneratedLink(`${origin}/${locale}/signup`);
      } finally {
        setLoading(false);
      }
    }

    generateInviteLink();
  }, [isOpen, companyId, locale]);

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emails.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setEmails('');
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[80] p-4 font-sans">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-right"
            dir="rtl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-950/40">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>👥</span> دعوت زملائك وفريقك للعمل
              </h3>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              
              {/* Copy Link Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">رابط دعوة الموظفين المباشر</label>
                <div className="flex gap-2 bg-slate-950 border border-white/10 rounded-xl p-2 items-center">
                  <input 
                    type="text" 
                    readOnly 
                    value={generatedLink}
                    className="flex-1 bg-transparent text-xs text-left text-slate-300 outline-none select-all px-2 font-mono"
                  />
                  <button 
                    onClick={handleCopy}
                    className={`p-2.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold shrink-0 ${
                      copied ? 'bg-success text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4 animate-bounce" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                  </button>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSend} className="space-y-3">
                <label className="text-xs font-bold text-slate-400">إرسال دعوة عبر البريد الإلكتروني</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="example@company.com, example2@company.com" 
                    value={emails}
                    onChange={(e) => setEmails(e.target.value)}
                    disabled={loading}
                    className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-amber-500 outline-none transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={loading || !emails.trim()}
                    className="px-5 py-3 bg-primary hover:bg-primary-hover disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center gap-1.5"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    <span>إرسال دعوة</span>
                  </button>
                </div>
                {success && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="text-xs text-success font-bold"
                  >
                    ✓ تم إرسال الدعوات بنجاح! سيتم إخطار فريقك عبر البريد.
                  </motion.p>
                )}
              </form>

              {/* OR QR Code Mockup */}
              <div className="border-t border-white/5 pt-5 flex items-center justify-between gap-6">
                <div className="space-y-1 flex-1">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-amber-500" />
                    رمز الاستجابة السريعة (QR Code)
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    يمكن للموظفين مسح الرمز ضوئياً بهواتفهم الذكية للدخول فوراً إلى المساحة الافتراضية للشركة والبدء بالعمل المشترك.
                  </p>
                </div>
                <div className="w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                  {/* Stylized QR Code SVG mockup */}
                  <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                    <rect x="0" y="0" width="25" height="25" fill="currentColor" />
                    <rect x="5" y="5" width="15" height="15" fill="white" />
                    <rect x="9" y="9" width="7" height="7" fill="currentColor" />

                    <rect x="75" y="0" width="25" height="25" fill="currentColor" />
                    <rect x="80" y="5" width="15" height="15" fill="white" />
                    <rect x="84" y="9" width="7" height="7" fill="currentColor" />

                    <rect x="0" y="75" width="25" height="25" fill="currentColor" />
                    <rect x="5" y="80" width="15" height="15" fill="white" />
                    <rect x="9" y="84" width="7" height="7" fill="currentColor" />

                    {/* Styled dots to look like a real QR code */}
                    <rect x="35" y="5" width="5" height="15" fill="currentColor" />
                    <rect x="45" y="10" width="10" height="5" fill="currentColor" />
                    <rect x="60" y="5" width="5" height="5" fill="currentColor" />

                    <rect x="35" y="35" width="15" height="5" fill="currentColor" />
                    <rect x="55" y="30" width="15" height="15" fill="currentColor" />
                    <rect x="85" y="35" width="10" height="5" fill="currentColor" />

                    <rect x="5" y="35" width="10" height="10" fill="currentColor" />
                    <rect x="20" y="55" width="15" height="5" fill="currentColor" />

                    <rect x="45" y="50" width="10" height="20" fill="currentColor" />
                    <rect x="65" y="60" width="5" height="15" fill="currentColor" />
                    <rect x="85" y="75" width="10" height="10" fill="currentColor" />
                    <rect x="75" y="85" width="5" height="10" fill="currentColor" />

                    {/* Logo block in the center */}
                    <rect x="40" y="40" width="20" height="20" fill="white" rx="4" />
                    <circle cx="50" cy="50" r="6" fill="#3b82f6" />
                  </svg>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
