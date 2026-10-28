import React, { useState } from 'react';
import { Lock, User, KeyRound, ShieldCheck, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { api } from '../services/baridimobClient';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Submit username & password to real SDK
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login.trim() || !password) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.login({
        login: login.trim(),
        password,
      });

      if (res.state === 'otp_required') {
        setInfoMessage(res.message || 'تم إرسال رمز تأكيد الجهاز عبر رسالة SMS من 4040');
        setStep('otp');
      } else {
        onLoginSuccess();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  // Submit device SMS OTP to real SDK
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('يرجى إدخال رمز التأكيد OTP المكون من 6 أرقام');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.confirmOtp(otp.trim());
      onLoginSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل التحقق من رمز OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] flex items-center justify-center p-4 selection:bg-[#25D366]/30" dir="rtl">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -translate-y-1/2 w-96 h-96 bg-[#00843D]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Liquid Glass Container */}
      <div className="w-full max-w-md bg-[#141416] border border-white/[0.08] rounded-[32px] p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Algérie Poste / BaridiMob Pro Emblem */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-[#00843D] to-[#25D366] flex items-center justify-center shadow-xl shadow-[#00843D]/30 ring-1 ring-white/20">
              <span className="font-extrabold text-black text-2xl tracking-tighter">BM</span>
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#25D366] ring-4 ring-[#141416]" />
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">BaridiMob Pro</h1>
          <p className="text-xs text-[#8E8E93] mt-1.5 max-w-[280px]">
            تطبيق المعاملات البريدية المتصل مباشرة بحسابك في بريد الجزائر عبر حزمة SDK الرسمية
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-start gap-3 text-right">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs text-red-300 leading-relaxed font-medium">
              {error}
            </div>
          </div>
        )}

        {infoMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/25 flex items-start gap-3 text-right">
            <ShieldCheck className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
            <div className="text-xs text-[#25D366] leading-relaxed font-medium">
              {infoMessage}
            </div>
          </div>
        )}

        {step === 'credentials' ? (
          /* Step 1: Username & Password */
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[#8E8E93] mb-1.5 font-medium text-right">
                اسم المستخدم / رقم الهاتف
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="اسم المستخدم في بريدي موب"
                  className="w-full bg-[#1C1C1F] border border-white/10 rounded-2xl py-3.5 pr-12 pl-4 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#25D366]/50 focus:ring-1 focus:ring-[#25D366]/50 transition text-left font-sans"
                  dir="ltr"
                  required
                />
                <User className="w-4 h-4 text-[#8E8E93] absolute right-4 top-4 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#8E8E93] mb-1.5 font-medium text-right">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  className="w-full bg-[#1C1C1F] border border-white/10 rounded-2xl py-3.5 pr-12 pl-12 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#25D366]/50 focus:ring-1 focus:ring-[#25D366]/50 transition font-mono text-left"
                  dir="ltr"
                  required
                />
                <Lock className="w-4 h-4 text-[#8E8E93] absolute right-4 top-4 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-[#8E8E93] hover:text-white absolute left-4 top-3.5 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 active:scale-[0.98] transition shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>جاري تسجيل الدخول عبر خادم بريد الجزائر...</span>
                </div>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: Device Confirmation SMS OTP */
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="text-center p-3 bg-[#1C1C1F] rounded-2xl border border-white/[0.06] mb-2">
              <KeyRound className="w-8 h-8 text-[#25D366] mx-auto mb-2" />
              <h2 className="text-sm font-bold text-white">تأكيد الجهاز الجديد (SMS OTP)</h2>
              <p className="text-xs text-[#8E8E93] mt-1">
                أدخل الرمز المكون من 6 أرقام المرسل عبر رسالة SMS من بريد الجزائر (4040)
              </p>
            </div>

            <div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="------"
                className="w-full bg-[#1C1C1F] border border-white/20 rounded-2xl py-3.5 text-center text-3xl font-mono text-white tracking-[14px] placeholder:text-[#555] focus:outline-none focus:border-[#25D366]"
                autoFocus
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setError(null);
                }}
                className="w-1/3 py-3.5 bg-[#1C1C1F] hover:bg-[#252529] text-xs font-semibold text-[#8E8E93] hover:text-white rounded-2xl transition"
              >
                رجوع
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 transition text-sm disabled:opacity-50"
              >
                {loading ? 'جاري التحقق...' : 'تأكيد الجهاز ومتابعة'}
              </button>
            </div>
          </form>
        )}

        {/* Security Footer Badge */}
        <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-center gap-2 text-[11px] text-[#8E8E93]">
          <ShieldCheck className="w-4 h-4 text-[#25D366]" />
          <span>اتصال مشفر 256-bit عبر حزمة baridimobsdk الرسمية</span>
        </div>
      </div>
    </div>
  );
};
