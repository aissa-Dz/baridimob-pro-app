import React, { useState } from 'react';
import {
  Search,
  CreditCard,
  BarChart3,
  Check,
  Plus,
  ArrowUpRight,
  FileText,
  MoreHorizontal,
  Home,
  Zap,
  ArrowLeftRight,
  ChevronLeft
} from 'lucide-react';
import { RealTransaction } from '../services/baridimobClient';
import { IdoomLogo, MobilisLogo, DjezzyLogo, OoredooLogo, SonelgazLogo } from './BrandLogos';

interface Screen1HomeProps {
  balance: number;
  accountNumber: string;
  rip: string;
  transactions: RealTransaction[];
  selectedTransactionId: string | null;
  onSelectTransaction: (tx: RealTransaction) => void;
  onOpenFlexy: () => void;
  onOpenTransfer: () => void;
  onOpenBills: () => void;
  onOpenCardless: () => void;
  onOpenCards: () => void;
  onOpenVerifier: () => void;
}

export const Screen1Home: React.FC<Screen1HomeProps> = ({
  balance,
  rip,
  transactions,
  selectedTransactionId,
  onSelectTransaction,
  onOpenFlexy,
  onOpenTransfer,
  onOpenBills,
  onOpenCardless,
  onOpenCards,
  onOpenVerifier,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCentimes, setShowCentimes] = useState(false);
  const [ripCopied, setRipCopied] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'incoming' | 'outgoing'>('all');

  // 1-Click RIP Copy
  const handleCopyRip = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(rip);
    setRipCopied(true);
    setTimeout(() => setRipCopied(false), 2000);
  };

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    const isIncoming = tx.amount > 0;
    if (filterType === 'incoming' && !isIncoming) return false;
    if (filterType === 'outgoing' && isIncoming) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (tx.description && tx.description.toLowerCase().includes(q)) ||
      (tx.refNum && tx.refNum.toLowerCase().includes(q)) ||
      (tx.type && tx.type.toLowerCase().includes(q)) ||
      Math.abs(tx.amount).toString().includes(q)
    );
  });

  // Centimes conversion: 1 DZD = 100 Centimes
  const formatBalance = () => {
    if (showCentimes) {
      const centimes = balance * 100;
      const millions = (balance / 10000).toFixed(1);
      return (
        <span className="flex flex-col items-center">
          <span className="num-font tracking-tight text-[30px] font-extrabold text-white">
            {centimes.toLocaleString()} سنتيم
          </span>
          <span className="text-xs text-[#25D366] font-medium mt-0.5">
            ({millions} مليون سنتيم)
          </span>
        </span>
      );
    }
    return (
      <div className="flex items-baseline justify-center gap-1.5" dir="ltr">
        <span className="num-font tracking-tight text-[38px] font-extrabold text-white">
          {balance.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
        <span className="text-2xl font-bold text-white/90">DZD</span>
      </div>
    );
  };

  // Helper for brand logos based on real transaction description
  const renderTxBadge = (tx: RealTransaction) => {
    const desc = (tx.description || tx.type || '').toLowerCase();
    if (desc.includes('idoom') || desc.includes('algerie telecom') || desc.includes('telecom')) {
      return <IdoomLogo size={40} />;
    }
    if (desc.includes('mobilis')) {
      return <MobilisLogo size={40} />;
    }
    if (desc.includes('djezzy')) {
      return <DjezzyLogo size={40} />;
    }
    if (desc.includes('ooredoo')) {
      return <OoredooLogo size={40} />;
    }
    if (desc.includes('sonelgaz')) {
      return <SonelgazLogo size={40} />;
    }
    return (
      <div className="w-10 h-10 rounded-full bg-[#1C1C1F] border border-white/10 text-white flex items-center justify-center font-bold text-xs">
        {desc ? desc.slice(0, 2).toUpperCase() : 'BM'}
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-[380px] h-[800px] bg-[#000000] rounded-[48px] border-[10px] border-[#1A1A1D] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col select-none ring-1 ring-white/10 mx-auto">
      {/* iPhone Dynamic Island & Status Bar */}
      <div className="w-full pt-3 px-7 flex items-center justify-between text-white text-[11px] font-semibold shrink-0 z-30 select-none">
        <span className="font-mono">23:42</span>
        <div className="w-24 h-4 bg-black rounded-full mx-auto ring-1 ring-white/10 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 ring-1 ring-neutral-800" />
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span>5G</span>
          <div className="w-4 h-2 rounded-[2px] border border-white/60 p-[1px] flex items-center">
            <div className="h-full w-full bg-white rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-24 space-y-5">
        {/* Top Bar: (Right to left in RTL): Avatar, Search input, Verification button, Card button */}
        <div className="flex items-center gap-2 pt-1">
          {/* User Avatar with Green Live Dot (Rightmost in RTL) */}
          <div className="relative shrink-0">
            <div className="w-[38px] h-[38px] rounded-full overflow-hidden ring-1 ring-white/20 bg-neutral-800 flex items-center justify-center font-bold text-xs text-white">
              CCP
            </div>
            <span className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full bg-[#25D366] ring-2 ring-black" />
          </div>

          {/* Pill Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث"
              className="w-full bg-[#161618] border border-white/[0.06] rounded-full py-2 pr-9 pl-4 text-xs text-white placeholder:text-[#8E8E93] focus:outline-none focus:border-white/20 transition"
            />
            <Search className="w-3.5 h-3.5 text-[#8E8E93] absolute right-3.5 top-2.5" />
          </div>

          {/* Verification icon button */}
          <button
            type="button"
            onClick={onOpenVerifier}
            className="w-10 h-10 rounded-full bg-[#161618] hover:bg-[#202023] border border-white/[0.06] flex items-center justify-center text-white/90 transition shrink-0"
            title="فحص عملية تاجر"
          >
            <BarChart3 className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Card Manager Button (Leftmost in RTL) */}
          <button
            type="button"
            onClick={onOpenCards}
            className="w-10 h-10 rounded-full bg-[#161618] hover:bg-[#202023] border border-white/[0.06] flex items-center justify-center text-white/90 transition shrink-0"
            title="البطاقة الذهبية"
          >
            <CreditCard className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Hero Balance Section */}
        <div className="flex flex-col items-center justify-center text-center pt-2">
          <span className="text-[#8E8E93] text-xs font-medium tracking-wide">
            الحساب البريدي الجاري • CCP
          </span>

          {/* Massive Balance with Toggle (DZD / Centimes) */}
          <div
            onClick={() => setShowCentimes(!showCentimes)}
            className="my-1 cursor-pointer transition hover:opacity-90 active:scale-98"
            title="انقر للتبديل بين الدينار والسنتيم الجزائري"
          >
            {formatBalance()}
          </div>

          {/* Interactive RIP Copy Pill with Dots */}
          <button
            type="button"
            onClick={handleCopyRip}
            className="mt-1 px-3 py-1 bg-[#161618] hover:bg-[#202024] border border-white/[0.06] rounded-full flex items-center gap-1.5 transition text-xs text-[#8E8E93] hover:text-white group"
          >
            {ripCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#25D366]" />
                <span className="text-[#25D366] font-medium">تم نسخ RIP</span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1 pl-1">
                  <span className="w-1 h-1 rounded-full bg-white/70" />
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                </span>
                <span className="font-medium text-white/90 font-mono">
                  نسخ RIP {rip.slice(0, 10)}...
                </span>
                <ChevronLeft className="w-3 h-3 text-[#8E8E93] group-hover:text-white transition" />
              </>
            )}
          </button>
        </div>

        {/* 4 Primary Circular White Action Buttons (2-Click Architecture) */}
        <div className="grid grid-cols-4 gap-2 px-1 pt-1">
          {/* 1. Flexy Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onOpenFlexy}
              className="w-[60px] h-[60px] rounded-full bg-white hover:bg-neutral-200 active:scale-95 transition shadow-lg flex items-center justify-center text-black group"
            >
              <Plus className="w-7 h-7 stroke-[2.2] text-black" />
            </button>
            <span className="text-xs font-medium text-white/90">فليكسي</span>
          </div>

          {/* 2. Transfer Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onOpenTransfer}
              className="w-[60px] h-[60px] rounded-full bg-white hover:bg-neutral-200 active:scale-95 transition shadow-lg flex items-center justify-center text-black group"
            >
              <ArrowUpRight className="w-7 h-7 stroke-[2.2] text-black" />
            </button>
            <span className="text-xs font-medium text-white/90">تحويل</span>
          </div>

          {/* 3. Bills Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onOpenBills}
              className="w-[60px] h-[60px] rounded-full bg-white hover:bg-neutral-200 active:scale-95 transition shadow-lg flex items-center justify-center text-black group"
            >
              <FileText className="w-6 h-6 stroke-[2.2] text-black" />
            </button>
            <span className="text-xs font-medium text-white/90">الفواتير</span>
          </div>

          {/* 4. Cardless ATM Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onOpenCardless}
              className="w-[60px] h-[60px] rounded-full bg-white hover:bg-neutral-200 active:scale-95 transition shadow-lg flex items-center justify-center text-black group"
            >
              <MoreHorizontal className="w-7 h-7 stroke-[2.2] text-black" />
            </button>
            <span className="text-xs font-medium text-white/90">سحب ATM</span>
          </div>
        </div>

        {/* Operations Card */}
        <div className="bg-[#141416] rounded-[26px] p-4 border border-white/[0.06] specular-border">
          {/* Operations Header */}
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-base font-bold text-white">العمليات</h2>
            <button
              type="button"
              onClick={() => {
                setFilterType(
                  filterType === 'all'
                    ? 'incoming'
                    : filterType === 'incoming'
                    ? 'outgoing'
                    : 'all'
                );
              }}
              className="px-2.5 py-0.5 rounded-full bg-[#1C1C1F] hover:bg-[#252529] border border-white/[0.08] text-[11px] text-[#8E8E93] hover:text-white flex items-center gap-1 transition"
            >
              <span>{filterType === 'all' ? 'الكل' : filterType === 'incoming' ? 'الواردة' : 'الصادرة'}</span>
              <ChevronLeft className="w-3 h-3" />
            </button>
          </div>

          {/* Transaction List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#8E8E93]">
                لا توجد عمليات مسجلة في هذا الحساب حالياً
              </div>
            ) : (
              filtered.map((tx, idx) => {
                const txKey = tx.tid || tx.refNum || `tx-${idx}`;
                const isSelected = selectedTransactionId === txKey;
                const isIncoming = tx.amount > 0;

                return (
                  <div
                    key={txKey}
                    onClick={() => onSelectTransaction(tx)}
                    className={`flex items-center justify-between p-2 rounded-2xl cursor-pointer transition ${
                      isSelected
                        ? 'bg-[#1C1C20] ring-1 ring-white/30'
                        : 'hover:bg-[#1A1A1D]'
                    }`}
                  >
                    {/* Amount */}
                    <div className="text-left font-mono" dir="ltr">
                      <div
                        className={`text-sm font-bold num-font ${
                          isIncoming ? 'text-[#25D366]' : 'text-white'
                        }`}
                      >
                        {isIncoming ? '+' : '-'}
                        {Math.abs(tx.amount).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        <span className="text-xs">DZD</span>
                      </div>
                    </div>

                    {/* Badge, Title, Timestamp */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-bold text-white truncate max-w-[140px]">
                          {tx.description || tx.type || 'عملية بريدية'}
                        </div>
                        <div className="text-[11px] text-[#8E8E93] mt-0.5 font-mono">
                          {tx.timestamp || tx.date || 'مؤكدة'}
                        </div>
                      </div>

                      {/* Brand Badge */}
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                        {renderTxBadge(tx)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Gradient Promo Banner Card */}
        <div
          style={{
            background:
              'linear-gradient(135deg, #F5A3FF 0%, #D972FF 55%, #B84BFF 100%)',
          }}
          className="rounded-[24px] p-4 text-black shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <h3 className="text-sm font-extrabold text-[#0A0A0C]">
            سحب نقدي بدون بطاقة ذهبية
          </h3>
          <p className="text-[11px] text-[#0A0A0C]/85 mt-1 leading-relaxed">
            ولّد كود سحب فوري من أي موزع بريد الجزائر في أقل من دقيقة.
          </p>

          <button
            type="button"
            onClick={onOpenCardless}
            className="mt-3 px-3.5 py-1.5 bg-[#0F0F12] text-white rounded-full text-xs font-semibold hover:bg-black transition shadow-md flex items-center gap-1.5"
          >
            <span>توليد كود ATM</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Liquid Glass Bottom Dock */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center z-30 pointer-events-none">
        <nav aria-label="شريط التنقل السريع" className="w-[250px] h-[56px] rounded-full liquid-glass shadow-2xl flex items-center justify-around px-2 pointer-events-auto ring-1 ring-white/10">
          <button
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-white/10 transition"
            title="الرئيسية"
          >
            <Home className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenVerifier}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white transition"
            title="الإحصائيات"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenTransfer}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white transition"
            title="التحويل السريع"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenCards}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white transition"
            title="البطاقات"
          >
            <CreditCard className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenFlexy}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white transition"
            title="فليكسي"
          >
            <Zap className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </div>
  );
};
