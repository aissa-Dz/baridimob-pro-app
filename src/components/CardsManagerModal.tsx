import React, { useState, useEffect } from 'react';
import { X, Lock, Unlock, Globe, Sliders, Eye, EyeOff, Wifi, AlertCircle } from 'lucide-react';
import { api, RealCard, RealCardLimit } from '../services/baridimobClient';
import { EdahabiaCircles } from './BrandLogos';

interface CardsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const CardsManagerModal: React.FC<CardsManagerModalProps> = ({ isOpen, onClose }) => {
  const [cards, setCards] = useState<RealCard[]>([]);
  const [limits, setLimits] = useState<RealCardLimit[]>([]);
  const [primaryCard, setPrimaryCard] = useState<RealCard | null>(null);
  const [showFullNumber, setShowFullNumber] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCardData();
    }
  }, [isOpen]);

  const loadCardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCards();
      setCards(data.cards || []);
      setLimits(data.limits || []);
      setPrimaryCard(data.primaryCard || (data.cards && data.cards[0]) || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'تعذر تحميل بيانات البطاقات');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full sm:max-w-md bg-[#141416] rounded-t-[32px] sm:rounded-[32px] border border-white/10 p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-black flex items-center justify-center font-bold">
              <EdahabiaCircles size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">البطاقة الذهبية (Edahabia)</h3>
              <p className="text-xs text-[#8E8E93]">البطاقات الذهبية الرسمية المربوطة بحسابك</p>
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

        {loading ? (
          <div className="py-16 text-center text-xs text-[#8E8E93] flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>جاري استعلام البطاقات من خوادم بريد الجزائر...</span>
          </div>
        ) : error ? (
          <div className="mt-5 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : primaryCard ? (
          <div className="mt-5 space-y-4">
            {/* 3D Realistic Gold Edahabia Card */}
            <div className="relative w-full h-52 rounded-[24px] p-5 overflow-hidden shadow-2xl flex flex-col justify-between select-none bg-gradient-to-br from-[#E2B755] via-[#C99738] to-[#8C6218] border border-[#F3D78A]/40 text-black">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />

              {/* Card Top Row */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-black text-[#E2B755] flex items-center justify-center font-black text-xs">
                    AP
                  </div>
                  <span className="font-extrabold text-xs tracking-wider text-black">بريد الجزائر · Algérie Poste</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-black/70 rotate-90" />
                  <EdahabiaCircles size={24} />
                </div>
              </div>

              {/* EMV Chip */}
              <div className="relative z-10 w-11 h-8 rounded-md bg-gradient-to-br from-[#FFE89E] to-[#CCA041] border border-[#9A7320] flex flex-col justify-around p-1 shadow-inner">
                <div className="w-full h-0.5 bg-black/30" />
                <div className="w-full h-0.5 bg-black/30" />
              </div>

              {/* Card Number */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="font-mono text-lg font-black tracking-[3px] text-black drop-shadow-sm" dir="ltr">
                  {showFullNumber ? primaryCard.number : `•••• •••• •••• ${primaryCard.number.slice(-4)}`}
                </span>
                <button
                  type="button"
                  onClick={() => setShowFullNumber(!showFullNumber)}
                  className="p-1 rounded-lg bg-black/10 hover:bg-black/20 text-black transition"
                >
                  {showFullNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Cardholder Name & Expiry */}
              <div className="relative z-10 flex items-center justify-between text-xs font-bold text-black/90">
                <div>
                  <span className="text-[9px] uppercase tracking-wider block opacity-70">CARDHOLDER</span>
                  <span className="font-mono tracking-wider">{primaryCard.name || 'CLIENT ALGERIE POSTE'}</span>
                </div>
                <div className="text-left font-mono" dir="ltr">
                  <span className="text-[9px] uppercase tracking-wider block opacity-70">EXPIRES</span>
                  <span>{primaryCard.expDate || '••/••'}</span>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="space-y-3">
              <div className="p-3.5 bg-[#1C1C1F] rounded-2xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${primaryCard.active ? 'bg-[#25D366]/15 text-[#25D366]' : 'bg-red-500/15 text-red-400'}`}>
                    {primaryCard.active ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {primaryCard.active ? 'البطاقة نشطة وجاهزة للاستعمال' : 'البطاقة مقفلة'}
                    </div>
                    <div className="text-[10px] text-[#8E8E93]">حالة البطاقة المسجلة في النظام المصرفي لبريد الجزائر</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#25D366]">مؤكدة</span>
              </div>

              {/* Real Limits Display if returned */}
              {limits.length > 0 && (
                <div className="p-4 bg-[#1C1C1F] rounded-2xl border border-white/10 space-y-3">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#E2B755]" />
                    <span>الأسقف والحدود اليومية المعتمدة (Limits):</span>
                  </div>
                  {limits.map((l, idx) => (
                    <div key={idx} className="flex justify-between text-xs border-b border-white/[0.05] pb-2 last:border-b-0 last:pb-0">
                      <span className="text-[#8E8E93]">{l.name}</span>
                      <span className="text-white font-mono font-bold">
                        {l.amount ? `${l.amount.toLocaleString()} DZD` : 'غير محدد'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-[#8E8E93]">
            لا توجد بطاقة ذهبية مسجلة لهذا الحساب
          </div>
        )}
      </div>
    </div>
  );
};
