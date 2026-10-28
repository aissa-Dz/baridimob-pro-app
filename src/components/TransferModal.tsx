import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/baridimobClient';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface SavedBeneficiary {
  name: string;
  rip: string;
}

const PRESET_AMOUNTS = [2000, 5000, 10000, 20000];
const SAVED_BENEFICIARIES_KEY = 'bm_pro_favorite_beneficiaries';

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [recipientRip, setRecipientRip] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [savedBeneficiaries, setSavedBeneficiaries] = useState<SavedBeneficiary[]>([]);
  const [amount, setAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState('');
  const [transRef, setTransRef] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(SAVED_BENEFICIARIES_KEY);
      if (stored) {
        try {
          const list: SavedBeneficiary[] = JSON.parse(stored);
          setSavedBeneficiaries(list);
          if (list.length > 0 && !recipientRip) {
            setRecipientRip(list[0].rip);
            setRecipientName(list[0].name);
          }
        } catch {
          // Ignore
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectBeneficiary = (ben: SavedBeneficiary) => {
    setRecipientRip(ben.rip);
    setRecipientName(ben.name);
    setError(null);
  };

  const handleRipChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 20);
    setRecipientRip(clean);
    setError(null);
  };

  // Step 1: Arm transfer and request real SMS OTP
  const handleProceedToOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;
    if (!recipientRip || recipientRip.length < 16) {
      setError('يرجى إدخال رقم RIP صحيح مكون من 20 رقماً يبدأ بـ 00799999');
      return;
    }
    if (!finalAmount || finalAmount < 100) {
      setError('الحد الأدنى للتحويل هو 100 دج');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.sendTransfer({
        recipientRip: recipientRip.trim(),
        amount: finalAmount,
      });

      if (res.state === 'otp_required' && res.transRef) {
        setTransRef(res.transRef);
        setStep('otp');
      } else {
        // Direct completion if no OTP required
        handleTransferCompleted();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل تجهيز عملية التحويل');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm transfer with real SMS OTP
  const handleConfirmTransfer = async () => {
    if (!otp || otp.length < 4) {
      setError('يرجى إدخال رمز التأكيد المرسل في رسالة SMS من 4040');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const finalAmount = customAmount ? parseFloat(customAmount) : amount;
      await api.sendTransfer({
        recipientRip: recipientRip.trim(),
        amount: finalAmount,
        otp: otp.trim(),
        transRef: transRef || undefined,
      });

      handleTransferCompleted();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل تأكيد التحويل المالي');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferCompleted = () => {
    // Save beneficiary to favorites
    const exists = savedBeneficiaries.find((b) => b.rip === recipientRip.trim());
    if (!exists) {
      const updated = [
        { name: recipientName || `مستفيد (${recipientRip.slice(-4)})`, rip: recipientRip.trim() },
        ...savedBeneficiaries,
      ].slice(0, 5);
      setSavedBeneficiaries(updated);
      localStorage.setItem(SAVED_BENEFICIARIES_KEY, JSON.stringify(updated));
    }

    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.5 }
    });

    onSuccess();
    handleClose();
  };

  const handleClose = () => {
    setStep('form');
    setOtp('');
    setTransRef(null);
    setError(null);
    onClose();
  };

  const finalAmount = customAmount ? parseFloat(customAmount) : amount;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full sm:max-w-md bg-[#141416] rounded-t-[32px] sm:rounded-[32px] border border-white/10 p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold">
              <ArrowUpRight className="w-5 h-5 text-black stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">تحويل فوري CCP</h3>
              <p className="text-xs text-[#8E8E93]">تحويل أموال فوري من حساب بريدي لآخر</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#1C1C1F] hover:bg-[#2A2A2E] text-[#8E8E93] hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleProceedToOtp} className="mt-5 space-y-4">
            {/* Saved Beneficiaries Horizontal Avatars */}
            {savedBeneficiaries.length > 0 && (
              <div>
                <label className="block text-xs text-[#8E8E93] mb-2 font-medium">مستفيدون محفوظون (نقرة واحدة للاختيار)</label>
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                  {savedBeneficiaries.map((ben, idx) => {
                    const isSelected = recipientRip === ben.rip;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectBeneficiary(ben)}
                        className="flex flex-col items-center gap-1.5 focus:outline-none flex-shrink-0 group"
                      >
                        <div
                          className={`w-12 h-12 rounded-full p-0.5 border-2 transition flex items-center justify-center bg-[#202024] ${
                            isSelected ? 'border-white scale-105' : 'border-transparent group-hover:border-white/30'
                          }`}
                        >
                          <span className="text-xs font-bold text-white">
                            {ben.name.slice(0, 2)}
                          </span>
                        </div>
                        <span className={`text-[11px] max-w-[65px] truncate text-center ${isSelected ? 'text-white font-semibold' : 'text-[#8E8E93]'}`}>
                          {ben.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RIP Input */}
            <div>
              <label className="block text-xs text-[#8E8E93] mb-1.5 font-medium">
                رقم الحساب البريدي الجاري (RIP — 20 رقماً)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={recipientRip}
                  onChange={(e) => handleRipChange(e.target.value)}
                  placeholder="00799999002345678901"
                  className="w-full bg-[#1C1C1F] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder:text-[#555] focus:outline-none focus:border-white/30 tracking-widest text-left"
                  dir="ltr"
                  required
                />
                <span className="absolute right-3.5 top-3.5 text-xs text-[#8E8E93] font-mono">
                  {recipientRip.length}/20
                </span>
              </div>
            </div>

            {/* Beneficiary Name (Optional) */}
            <div>
              <label className="block text-xs text-[#8E8E93] mb-1.5 font-medium">اسم المستفيد (لحفظه في المفضلة)</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="مثال: يونس بن علي"
                className="w-full bg-[#1C1C1F] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder:text-[#666] focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Preset Amount Pills */}
            <div>
              <label className="block text-xs text-[#8E8E93] mb-1.5 font-medium">مبلغ التحويل (دج)</label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2.5 rounded-2xl border text-sm font-bold num-font transition ${
                      amount === amt && !customAmount
                        ? 'bg-white text-black border-white shadow-lg'
                        : 'bg-[#1C1C1F] text-white border-white/10 hover:bg-[#252529]'
                    }`}
                  >
                    {amt.toLocaleString()} دج
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setAmount(0);
                }}
                placeholder="أو أدخل مبلغاً آخر بالدينار الجزائري"
                className="w-full bg-[#1C1C1F] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white font-mono placeholder:text-[#666] focus:outline-none focus:border-white/30 text-left"
                dir="ltr"
              />
            </div>

            {/* Fee Note */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#1C1C1F]/60 rounded-xl text-xs text-[#8E8E93]">
              <span>عمولة بريد الجزائر الرسمية:</span>
              <span className="text-white font-bold num-font">12.00 DZD</span>
            </div>

            {error && (
              <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 text-xs text-center flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Next Step Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 transition shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <span>جاري طلب كود SMS من بريد الجزائر...</span>
                ) : (
                  <>
                    <span>متابعة لتأكيد رمز الأمان OTP</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: Live SMS OTP Confirmation */
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-[#1C1C1F] rounded-2xl border border-white/[0.08] text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">تأكيد التحويل برمز SMS</h4>
              <p className="text-xs text-[#8E8E93]">
                تم إرسال رمز تأكيد فوري من 6 أرقام عبر الرقم <span className="text-white font-mono">4040</span> إلى هاتفك المسجل لدى بريد الجزائر.
              </p>

              <div className="my-2 p-2.5 bg-black/40 rounded-xl flex items-center justify-between text-xs">
                <span className="text-[#8E8E93]">المبلغ المراد تحويله:</span>
                <span className="text-white font-bold num-font text-sm">{finalAmount?.toLocaleString()} DZD</span>
              </div>
            </div>

            {/* OTP Input */}
            <div>
              <label className="block text-xs text-[#8E8E93] mb-1.5 font-medium text-center">
                أدخل رمز OTP المكون من 6 أرقام
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="------"
                className="w-full bg-[#1C1C1F] border border-white/20 rounded-2xl px-4 py-3 text-2xl text-center text-white font-mono tracking-[12px] placeholder:text-[#555] focus:outline-none focus:border-white"
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 text-xs text-center flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-1/3 py-3 bg-[#1C1C1F] hover:bg-[#2A2A2E] text-[#8E8E93] hover:text-white font-semibold rounded-2xl transition text-xs"
              >
                رجوع
              </button>
              <button
                type="button"
                onClick={handleConfirmTransfer}
                disabled={loading}
                className="flex-1 py-3 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 transition shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? 'جاري تأكيد التحويل لدى بريد الجزائر...' : 'تأكيد وإرسال التحويل'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
