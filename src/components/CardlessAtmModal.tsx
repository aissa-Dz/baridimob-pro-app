import React, { useState, useEffect } from 'react';
import { X, Copy, Check, QrCode, Clock, Sparkles, AlertCircle, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api, RealCardlessCode } from '../services/baridimobClient';

interface CardlessAtmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_AMOUNTS = [2000, 5000, 10000, 20000];

export const CardlessAtmModal: React.FC<CardlessAtmModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState<number>(5000);
  const [activeCodes, setActiveCodes] = useState<RealCardlessCode[]>([]);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCodes();
    }
  }, [isOpen]);

  const loadCodes = async () => {
    try {
      const list = await api.getCardlessCodes();
      setActiveCodes(list);
    } catch (e) {
      console.warn('Error loading cardless codes', e);
    }
  };

  if (!isOpen) return null;

  const handleGenerateCode = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.createCardlessCode(amount);
      await loadCodes();

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.55 }
      });

      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'تعذر توليد كود السحب من بريد الجزائر');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCode = async (id: string) => {
    try {
      await api.deleteCardlessCode(id);
      await loadCodes();
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'تعذر إلغاء كود السحب');
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const currentActiveCode = activeCodes.find((c) => c.status === 'active' || !c.status);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full sm:max-w-md bg-[#141416] rounded-t-[32px] sm:rounded-[32px] border border-white/10 p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F5A3FF] to-[#B84BFF] text-black flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">سحب ATM بدون بطاقة</h3>
              <p className="text-xs text-[#8E8E93]">خدمة السحب الفوري من أي موزع بريد الجزائر</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1C1C1F] hover:bg-[#2A2A2E] text-[#8E8E93] hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Code Display Card */}
        {currentActiveCode && currentActiveCode.code ? (
          <div className="mt-5 space-y-4">
            <div className="p-5 rounded-[26px] bg-gradient-to-br from-[#1C1C20] to-[#141416] border border-white/10 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#F5A3FF] via-[#D972FF] to-[#B84BFF]" />
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#25D366]/10 text-[#25D366] rounded-full text-xs font-semibold mb-2">
                <Clock className="w-3.5 h-3.5" />
                <span>كود سحب نشط من بريد الجزائر</span>
              </div>

              <div className="text-xs text-[#8E8E93] mt-1">كود السحب السري الآلي (ATM PIN):</div>

              {/* Massive 6-Digit PIN Display */}
              <div className="my-3 py-3 px-4 bg-black/60 rounded-2xl border border-white/10 flex items-center justify-center gap-2">
                <span className="text-3xl font-extrabold tracking-[10px] text-white num-font select-all">
                  {currentActiveCode.code}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(currentActiveCode.code!, currentActiveCode.id)}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
                  title="نسخ الكود"
                >
                  {copiedCodeId === currentActiveCode.id ? (
                    <Check className="w-5 h-5 text-[#25D366]" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-white px-2">
                <span>المبلغ: {currentActiveCode.amount?.toLocaleString()} DZD</span>
                <button
                  type="button"
                  onClick={() => handleCancelCode(currentActiveCode.id)}
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 font-normal text-[11px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>إلغاء الكود</span>
                </button>
              </div>

              {/* Steps Guide */}
              <div className="mt-4 pt-3 border-t border-white/[0.08] text-right space-y-2 text-xs text-[#8E8E93]">
                <div className="flex items-center gap-2 text-white/90">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>توجه إلى أي موزع آلي GAB تابع لبريد الجزائر</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>اختر من شاشة الصراف: "عمليات بدون بطاقة"</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>أدخل هذا الكود السري واستلم نقودك مباشرة</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Generate Form */
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#F5A3FF]/15 via-[#D972FF]/15 to-[#B84BFF]/15 border border-[#D972FF]/30 flex items-center gap-3">
              <QrCode className="w-8 h-8 text-[#F5A3FF] shrink-0" />
              <p className="text-xs text-white/90 leading-relaxed">
                هل نسيت بطاقتك الذهبية؟ يمكنك سحب السيولة النقدية فوراً من الصراف الآلي عبر كود سحب مؤقت يصدره بريد الجزائر.
              </p>
            </div>

            {/* Amount Selection */}
            <div>
              <label className="block text-xs text-[#8E8E93] mb-2 font-medium">اختر المبلغ المراد سحبه</label>
              <div className="grid grid-cols-2 gap-2.5">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`py-3 px-4 rounded-2xl border text-sm font-bold num-font transition flex items-center justify-between ${
                      amount === amt
                        ? 'bg-white text-black border-white shadow-lg'
                        : 'bg-[#1C1C1F] text-white border-white/10 hover:bg-[#252529]'
                    }`}
                  >
                    <span>{amt.toLocaleString()} DZD</span>
                    <span className="text-[11px] font-normal opacity-70">سنتيم {amt * 100}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 text-xs text-center flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                onClick={handleGenerateCode}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#F5A3FF] via-[#D972FF] to-[#B84BFF] text-black font-extrabold rounded-2xl hover:opacity-90 transition shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? 'جاري الاتصال بخادم بريد الجزائر...' : `توليد كود السحب (${amount.toLocaleString()} DZD)`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
