import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Sparkles,
  Info
} from 'lucide-react';
import { RealTransaction, api } from '../services/baridimobClient';
import { IdoomLogo, MobilisLogo, DjezzyLogo, OoredooLogo, SonelgazLogo, EdahabiaCircles } from './BrandLogos';

interface Screen2InspectorProps {
  transaction: RealTransaction | null;
  allTransactions: RealTransaction[];
  onClose: () => void;
  onToggleExclude: (tx: RealTransaction) => void;
}

export const Screen2Inspector: React.FC<Screen2InspectorProps> = ({
  transaction,
  allTransactions,
  onClose,
  onToggleExclude,
}) => {
  const [hoveredMonth, setHoveredMonth] = useState<{ label: string; amount: number } | null>(null);

  // Compute 6-Month dynamic spending bars from real transactions
  const { monthlyData, totalSixMonthSpending, maxMonthAmount } = useMemo(() => {
    // Generate the last 6 months labels
    const months: { key: string; label: string; amount: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthShort = d.toLocaleString('en-US', { month: 'short' });
      months.push({ key: monthKey, label: monthShort, amount: 0 });
    }

    // Aggregate amounts from real outgoing transactions
    for (const tx of allTransactions) {
      if (tx.excludedFromAnalytics) continue;
      // Only count spending (outgoing)
      if (tx.amount >= 0) continue;

      const spent = Math.abs(tx.amount);
      const txDate = tx.date ? new Date(tx.date) : new Date();
      const txKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;

      const found = months.find((m) => m.key === txKey);
      if (found) {
        found.amount += spent;
      } else {
        // If outside the range or current, default to current month
        months[months.length - 1].amount += spent;
      }
    }

    const total = months.reduce((sum, m) => sum + m.amount, 0);
    const maxVal = Math.max(...months.map((m) => m.amount), 20000);

    return {
      monthlyData: months,
      totalSixMonthSpending: total,
      maxMonthAmount: maxVal,
    };
  }, [allTransactions]);

  if (!transaction) {
    return (
      <div className="relative w-full max-w-[380px] h-[800px] bg-[#000000] rounded-[48px] border-[10px] border-[#1A1A1D] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col items-center justify-center p-6 text-center select-none ring-1 ring-white/10 mx-auto">
        <div className="w-16 h-16 rounded-full bg-[#141416] border border-white/10 flex items-center justify-center text-[#8E8E93] mb-4">
          <Info className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-white">اختر عملية لفحص تفاصيلها</h3>
        <p className="text-xs text-[#8E8E93] mt-2 max-w-[240px] leading-relaxed">
          انقر على أي عملية في الشاشة الرئيسية (اليمين) لمعاينة تفاصيلها هنا، وتنزيل الإيصال الرسمي، والتحكم في إحصائيات الإنفاق.
        </p>
      </div>
    );
  }

  const isIncoming = transaction.amount > 0;
  const absAmount = Math.abs(transaction.amount);
  const txRef = transaction.refNum || transaction.tid || 'FPE202509180832';
  const desc = transaction.description || transaction.type || 'عملية بريدية';

  // Helper for brand badge
  const renderInspectorBadge = () => {
    const d = desc.toLowerCase();
    if (d.includes('idoom') || d.includes('telecom')) {
      return <IdoomLogo size={64} />;
    }
    if (d.includes('mobilis')) {
      return <MobilisLogo size={64} />;
    }
    if (d.includes('djezzy')) {
      return <DjezzyLogo size={64} />;
    }
    if (d.includes('ooredoo')) {
      return <OoredooLogo size={64} />;
    }
    if (d.includes('sonelgaz')) {
      return <SonelgazLogo size={64} />;
    }
    return (
      <div className="w-16 h-16 rounded-full bg-[#1C1C1F] border border-white/10 text-white flex items-center justify-center font-bold text-xl">
        {desc ? desc.slice(0, 2).toUpperCase() : 'BM'}
      </div>
    );
  };

  const handleDownloadPdf = () => {
    const pdfUrl = api.getReceiptPdfUrl(transaction.tid || txRef);
    window.open(pdfUrl, '_blank');
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
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-8 space-y-3.5">
        {/* Top Bar: Close button 'X' on right (in RTL), Reference ID on left */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1C1C1F] hover:bg-[#28282C] text-[#8E8E93] hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-[#8E8E93] tracking-wide" dir="ltr">
            {txRef}
          </span>
        </div>

        {/* Hero Section: Centered circular 64px badge, title, timestamp, massive amount */}
        <div className="flex flex-col items-center justify-center text-center pt-1 pb-1">
          <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white/10 shadow-lg mb-2.5">
            {renderInspectorBadge()}
          </div>

          <h2 className="text-base font-bold text-white tracking-tight">
            {desc}
          </h2>

          <span className="text-[#8E8E93] text-xs mt-0.5 font-mono">
            {transaction.timestamp || transaction.date || 'مؤكدة'}
          </span>

          {/* Massive Amount */}
          <div className="mt-2 text-[34px] font-extrabold text-white num-font tracking-tight" dir="ltr">
            {isIncoming ? '+' : '-'}
            {absAmount.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            <span className="text-xl font-bold text-white/90">DZD</span>
          </div>
        </div>

        {/* Card 1: Status & Receipt */}
        <div className="bg-[#141416] rounded-[24px] p-4 border border-white/[0.06] specular-border space-y-3.5">
          {/* Row 1: الحالة (Status) */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8E8E93]">الحالة</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/20">
              مكتملة
            </span>
          </div>

          {/* Row 2: وصل العملية (Receipt) */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8E8E93]">وصل العملية</span>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-2.5 py-1 rounded-full text-xs font-medium text-white hover:text-[#25D366] bg-[#1C1C1F] hover:bg-[#252529] border border-white/[0.08] transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل PDF</span>
            </button>
          </div>

          {/* Row 3: البطاقة الذهبية (Card) */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8E8E93]">البطاقة الذهبية</span>
            <div className="flex items-center gap-2">
              <EdahabiaCircles size={18} />
              <span className="font-mono text-xs text-white" dir="ltr">
                •• 6241
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Analytics Controls */}
        <div className="bg-[#141416] rounded-[24px] p-4 border border-white/[0.06] specular-border space-y-3.5 relative">
          {/* Row 1: استبعاد من الإحصائيات (Working iOS-style white toggle switch) */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8E8E93]">استبعاد من الإحصائيات</span>
            <button
              type="button"
              onClick={() => onToggleExclude(transaction)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 relative focus:outline-none ${
                transaction.excludedFromAnalytics ? 'bg-white' : 'bg-[#2C2C2E]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full shadow-md transition-transform duration-300 ${
                  transaction.excludedFromAnalytics
                    ? 'translate-x-[-20px] bg-black'
                    : 'translate-x-0 bg-white'
                }`}
              />
            </button>
          </div>

          {/* Row 2: التصنيف (Category) */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8E8E93]">التصنيف</span>
            <div className="text-xs text-white font-medium flex items-center gap-1.5 underline decoration-white/40">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{transaction.type || 'معاملة مالية'}</span>
            </div>
          </div>

          {/* Row 3: المبلغ في التحليلات */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8E8E93]">المبلغ في التحليلات</span>
            <div className="text-xs font-bold text-white num-font" dir="ltr">
              {absAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              DZD
            </div>
          </div>
        </div>

        {/* Card 3: Half-Year Spending Bar Chart Computed from Real Transactions */}
        <div className="bg-[#141416] rounded-[24px] p-4 border border-white/[0.06] specular-border space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8E8E93]">الإنفاق خلال 6 أشهر</span>
            <div className="text-left font-mono" dir="ltr">
              <span className="text-sm font-bold text-white num-font">
                {totalSixMonthSpending.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                <span className="text-xs font-normal">DZD</span>
              </span>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="relative pt-4 pb-1">
            {/* Dashed Horizontal Threshold Line */}
            <div className="absolute top-7 left-0 right-0 flex items-center pointer-events-none z-10">
              <span className="text-[10px] text-[#8E8E93] font-mono shrink-0 pl-1">
                20k DZD
              </span>
              <div className="flex-1 border-t border-dashed border-white/20 mx-1.5" />
            </div>

            {/* 6 Vertical Capsule Bars */}
            <div className="flex items-end justify-between px-1.5 h-28 pt-2">
              {monthlyData.map((m, idx) => {
                const percent = Math.min(100, Math.max(10, (m.amount / maxMonthAmount) * 100));
                const isHovered = hoveredMonth?.label === m.label;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredMonth(m)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className="flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    <div className="h-4 flex items-center justify-center">
                      {isHovered && (
                        <span className="text-[9px] font-mono font-bold text-white bg-black/80 px-1 rounded animate-in fade-in">
                          {(m.amount / 1000).toFixed(1)}k
                        </span>
                      )}
                    </div>

                    <div className="w-[18px] h-20 bg-[#232328] rounded-full p-[2px] flex flex-col justify-end overflow-hidden group-hover:bg-[#2C2C32] transition">
                      <div
                        style={{ height: `${percent}%` }}
                        className="w-full bg-white rounded-full transition-all duration-500 shadow-sm"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Month Labels */}
            <div className="flex items-center justify-between px-1 text-[10px] text-[#8E8E93] mt-2 font-mono">
              {monthlyData.map((m, idx) => (
                <span
                  key={idx}
                  className={`w-[18px] text-center ${
                    idx === monthlyData.length - 1 ? 'text-white font-bold' : ''
                  }`}
                >
                  {m.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
