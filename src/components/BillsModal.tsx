import React, { useState } from 'react';
import { X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/baridimobClient';
import { IdoomLogo, SonelgazLogo } from './BrandLogos';

interface BillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface BillerOption {
  id: string;
  name: string;
  category: string;
  fieldLabel: string;
  placeholder: string;
}

const BILLERS: BillerOption[] = [
  {
    id: 'idoom',
    name: 'اتصالات الجزائر Idoom FTTH/ADSL',
    category: 'انترنت وهاتف ثابت',
    fieldLabel: 'رقم الهاتف الثابت أو معرف العقد',
    placeholder: '21323891456',
  },
  {
    id: 'sonelgaz',
    name: 'سونلغاز — Sonelgaz (كهرباء وغاز)',
    category: 'طاقة ومرافق عمومية',
    fieldLabel: 'رقم الزبون أو مرجع الفاتورة',
    placeholder: '984512034',
  },
  {
    id: 'ade',
    name: 'الجزائرية للمياه — ADE',
    category: 'مياه شرب وتوزيع',
    fieldLabel: 'رقم عقد الزبون (Reference Client)',
    placeholder: '14589201',
  },
  {
    id: 'seaal',
    name: 'سيال الجزائر — SEAAL',
    category: 'مياه وتطهير العاصمة وتيبازة',
    fieldLabel: 'رقم العقد أو الفاتورة',
    placeholder: '05874123',
  },
];

export const BillsModal: React.FC<BillsModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedBiller, setSelectedBiller] = useState<BillerOption>(BILLERS[0]);
  const [contractNumber, setContractNumber] = useState('');
  const [amount, setAmount] = useState<number>(2600);
  const [invoiceId, setInvoiceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractNumber.trim()) {
      setError('يرجى إدخال رقم العقد أو الفاتورة');
      return;
    }
    if (!amount || amount <= 0) {
      setError('يرجى تحديد مبلغ الفاتورة');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.payBill({
        biller: selectedBiller.name,
        contractNumber: contractNumber.trim(),
        invoiceId: invoiceId.trim() || undefined,
        amount,
      });

      confetti({
        particleCount: 70,
        spread: 75,
        origin: { y: 0.6 }
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'تعذر تسديد الفاتورة عبر خادم بريد الجزائر');
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
            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold">
              <FileText className="w-5 h-5 text-black stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">تسديد الفواتير والخدمات (FPE)</h3>
              <p className="text-xs text-[#8E8E93]">محرك الدفع الإلكتروني الرسمي لبريد الجزائر</p>
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Billers Selection */}
          <div>
            <label className="block text-xs text-[#8E8E93] mb-2 font-medium">اختر المؤسسة أو الهيئة</label>
            <div className="grid grid-cols-2 gap-2">
              {BILLERS.map((b) => {
                const isSelected = selectedBiller.id === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setSelectedBiller(b);
                      setError(null);
                    }}
                    className={`p-3 rounded-2xl border text-right transition flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-white bg-[#222226] ring-1 ring-white/50'
                        : 'border-white/10 bg-[#1C1C1F] hover:bg-[#252529]'
                    }`}
                  >
                    {b.id === 'idoom' ? (
                      <IdoomLogo size={28} />
                    ) : b.id === 'sonelgaz' ? (
                      <SonelgazLogo size={28} />
                    ) : b.id === 'ade' ? (
                      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                        ADE
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-cyan-700 flex items-center justify-center text-white text-[10px] font-bold">
                        SEAL
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white truncate">{b.name.split(' ')[0]}</div>
                      <div className="text-[10px] text-[#8E8E93] truncate">{b.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contract / Reference Field */}
          <div>
            <label className="block text-xs text-[#8E8E93] mb-1.5 font-medium">
              {selectedBiller.fieldLabel}
            </label>
            <input
              type="text"
              value={contractNumber}
              onChange={(e) => setContractNumber(e.target.value)}
              placeholder={selectedBiller.placeholder}
              className="w-full bg-[#1C1C1F] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder:text-[#555] focus:outline-none focus:border-white/30 text-left"
              dir="ltr"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs text-[#8E8E93] mb-1.5 font-medium">مبلغ الفاتورة المستحق (دج)</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#1C1C1F] border border-white/10 rounded-2xl px-4 py-3 text-lg font-bold num-font text-white placeholder:text-[#555] focus:outline-none focus:border-white/30 text-left"
                dir="ltr"
                required
              />
              <span className="absolute right-4 top-3.5 text-sm text-[#8E8E93]">DZD</span>
            </div>
          </div>

          {/* Invoice ID */}
          <div>
            <label className="block text-xs text-[#8E8E93] mb-1.5 font-medium">معرف الفاتورة (Invoice Reference - اختياري)</label>
            <input
              type="text"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              placeholder="INV-2026-FPE"
              className="w-full bg-[#1C1C1F] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white font-mono placeholder:text-[#555] focus:outline-none focus:border-white/30 text-left"
              dir="ltr"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 text-xs text-center flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Pay Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 transition shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <span>جاري إرسال الدفع إلى خادم FPE...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>تسديد {amount?.toLocaleString()} دج فورياً عبر FPE</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
