import React, { useState, useEffect } from 'react';
import { X, Smartphone, Zap, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MobilisLogo, DjezzyLogo, OoredooLogo } from './BrandLogos';
import { api } from '../services/baridimobClient';

interface FlexyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Operator = 'mobilis' | 'djezzy' | 'ooredoo';

interface SavedContact {
  name: string;
  phone: string;
  op: Operator;
}

const PRESET_AMOUNTS = [200, 500, 1000, 2000];
const SAVED_CONTACTS_KEY = 'bm_pro_favorite_numbers';

export const FlexyModal: React.FC<FlexyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [phone, setPhone] = useState('');
  const [operator, setOperator] = useState<Operator>('mobilis');
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [contactName, setContactName] = useState('');
  const [savedContacts, setSavedContacts] = useState<SavedContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(SAVED_CONTACTS_KEY);
      if (stored) {
        try {
          const list: SavedContact[] = JSON.parse(stored);
          setSavedContacts(list);
          if (list.length > 0 && !phone) {
            setPhone(list[0].phone);
            setOperator(list[0].op);
          }
        } catch {
          // Ignore
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Auto-detect operator from prefix (06 -> Mobilis, 07 -> Djezzy, 05 -> Ooredoo)
  const handlePhoneChange = (val: string) => {
    setPhone(val);
    setError(null);
    const clean = val.replace(/\s+/g, '');
    if (clean.startsWith('06')) {
      setOperator('mobilis');
    } else if (clean.startsWith('07')) {
      setOperator('djezzy');
    } else if (clean.startsWith('05')) {
      setOperator('ooredoo');
    }
  };

  const handleSelectContact = (c: SavedContact) => {
    setPhone(c.phone);
    setOperator(c.op);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;
    if (!phone || phone.length < 10) {
      setError('يرجى إدخال رقم هاتف جزائري صحيح من 10 أرقام');
      return;
    }
    if (!finalAmount || finalAmount < 100) {
      setError('الحد الأدنى للشحن هو 100 دج');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.topupMobile({
        operator,
        phone: phone.trim(),
        amount: finalAmount,
      });

      // Save number to favorite contacts for 2-click UX
      const exists = savedContacts.find((c) => c.phone === phone.trim());
      if (!exists) {
        const updated = [
          { name: contactName || (operator === 'mobilis' ? 'موبيليس' : operator === 'djezzy' ? 'جيزي' : 'أوريدو'), phone: phone.trim(), op: operator },
          ...savedContacts
        ].slice(0, 5);
        setSavedContacts(updated);
        localStorage.setItem(SAVED_CONTACTS_KEY, JSON.stringify(updated));
      }

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'تعذر إتمام عملية الشحن عبر خادم بريد الجزائر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full sm:max-w-md bg-[#141416] rounded-t-[32px] sm:rounded-[32px] border border-white/10 p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold text-xl">
              +
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">شحن رصيد الهاتف (فليكسي)</h3>
              <p className="text-xs text-[#8E8E93]">شحن فوري ومباشر لجميع المتعاملين</p>
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
          {/* Operator Selector with Auto-detect */}
          <div>
            <label className="block text-xs text-[#8E8E93] mb-2 font-medium">المتعامل (يتم التعرف تلقائياً)</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setOperator('mobilis')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 transition ${
                  operator === 'mobilis'
                    ? 'border-[#00843D] bg-[#00843D]/10 ring-1 ring-[#00843D]'
                    : 'border-white/10 bg-[#1C1C1F] hover:bg-[#242428]'
                }`}
              >
                <MobilisLogo size={30} />
                <span className="text-xs font-semibold text-white">Mobilis (06)</span>
              </button>

              <button
                type="button"
                onClick={() => setOperator('djezzy')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 transition ${
                  operator === 'djezzy'
                    ? 'border-[#E30613] bg-[#E30613]/10 ring-1 ring-[#E30613]'
                    : 'border-white/10 bg-[#1C1C1F] hover:bg-[#242428]'
                }`}
              >
                <DjezzyLogo size={30} />
                <span className="text-xs font-semibold text-white">Djezzy (07)</span>
              </button>

              <button
                type="button"
                onClick={() => setOperator('ooredoo')}
                className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 transition ${
                  operator === 'ooredoo'
                    ? 'border-[#ED1C24] bg-[#ED1C24]/10 ring-1 ring-[#ED1C24]'
                    : 'border-white/10 bg-[#1C1C1F] hover:bg-[#242428]'
                }`}
              >
                <OoredooLogo size={30} />
                <span className="text-xs font-semibold text-white">Ooredoo (05)</span>
              </button>
            </div>
          </div>

          {/* Phone Number Input */}
          <div>
            <label className="block text-xs text-[#8E8E93] mb-1.5 font-medium">رقم الهاتف المستفيد</label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="0661 23 45 67"
                className="w-full bg-[#1C1C1F] border border-white/10 rounded-2xl px-4 py-3 text-base text-white font-mono placeholder:text-[#555] focus:outline-none focus:border-white/30 tracking-wider text-left"
                dir="ltr"
                required
              />
              <Smartphone className="w-5 h-5 text-[#8E8E93] absolute right-3.5 top-3.5" />
            </div>

            {/* Quick 2-click saved contacts */}
            {savedContacts.length > 0 && (
              <div className="flex items-center gap-2 mt-2 overflow-x-auto no-scrollbar py-1">
                <span className="text-[11px] text-[#8E8E93] whitespace-nowrap">أرقام مفضلة (نقرة واحدة):</span>
                {savedContacts.map((c, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectContact(c)}
                    className="px-2.5 py-1 rounded-full bg-[#1C1C1F] hover:bg-[#26262B] border border-white/[0.08] text-[11px] text-white whitespace-nowrap transition"
                  >
                    {c.name} ({c.phone.slice(0, 4)}...)
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preset Amounts Pills (1-Tap UX) */}
          <div>
            <label className="block text-xs text-[#8E8E93] mb-1.5 font-medium">اختر المبلغ (دج)</label>
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
                  {amt} دج
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
              placeholder="أو أدخل مبلغاً آخر (مثال: 1500 دج)"
              className="w-full bg-[#1C1C1F] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white font-mono placeholder:text-[#666] focus:outline-none focus:border-white/30 text-left"
              dir="ltr"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 text-xs text-center flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Confirm Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              {loading ? (
                <span>جاري إرسال الطلب لبريد الجزائر...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-black fill-current" />
                  <span>تأكيد شحن {customAmount ? customAmount : amount} دج</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
