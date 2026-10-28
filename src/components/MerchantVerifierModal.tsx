import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, Search, AlertCircle } from 'lucide-react';
import { api } from '../services/baridimobClient';

interface MerchantVerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MerchantVerifierModal: React.FC<MerchantVerifierModalProps> = ({ isOpen, onClose }) => {
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<{
    checked: boolean;
    verified: boolean;
    reason?: string;
    transaction?: any;
    message?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await api.verifyPayment({
        reference: reference.trim(),
        amount: amount ? parseFloat(amount) : undefined,
      });

      setResult({
        checked: true,
        verified: res.verified,
        reason: res.reason,
        transaction: res.transaction,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل التحقق من العملية عبر خادم بريد الجزائر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full sm:max-w-md bg-[#141416] rounded-t-[32px] sm:rounded-[32px] border border-white/10 p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">التحقق من صحة الدفع والتاجر</h3>
              <p className="text-xs text-[#8E8E93]">التأكد الفوري عبر محرك بريد الجزائر (bm.verification)</p>
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

        <form onSubmit={handleVerify} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs text-[#8E8E93] mb-1.5 font-medium">
              رقم المرجع (Transaction Reference Number)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="مثال: FPE202509180832 أو CCP202510282327"
              className="w-full bg-[#1C1C1F] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder:text-[#555] focus:outline-none focus:border-white/30 text-left"
              dir="ltr"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-[#8E8E93] mb-1.5 font-medium">
              المبلغ للتحقق من التطابق (اختياري بالدينار الجزائري)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="2600"
              className="w-full bg-[#1C1C1F] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white font-mono placeholder:text-[#555] focus:outline-none focus:border-white/30 text-left"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 transition shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <span>جاري الفحص في خوادم بريد الجزائر...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>فحص العملية وتأكيد أصالتها</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/25 rounded-2xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Verification Result Display */}
        {result && (
          <div className="mt-5 p-4 rounded-2xl border transition-all animate-in fade-in">
            {result.verified ? (
              <div className="space-y-3 bg-[#25D366]/10 border-[#25D366]/30 p-4 rounded-2xl border">
                <div className="flex items-center gap-2 text-[#25D366]">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span className="font-bold text-sm">عملية موثوقة ومؤكدة رسمياً</span>
                </div>
                <p className="text-xs text-white/90">
                  تمت مطابقة المرجع بنجاح في سجلات بريد الجزائر.
                </p>

                {result.transaction && (
                  <div className="p-3 bg-black/50 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#8E8E93]">المبلغ:</span>
                      <span className="text-white font-bold num-font">{result.transaction.amount?.toLocaleString()} DZD</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 bg-red-500/10 border-red-500/30 p-4 rounded-2xl border">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span className="font-bold text-sm">لم يتم تأكيد العملية</span>
                </div>
                <p className="text-xs text-red-300">
                  سبب الرفض: {result.reason || 'لم يتم العثور على العملية'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
