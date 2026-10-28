import React from 'react';
import { ShieldCheck, CreditCard, Smartphone, Layers, LogOut } from 'lucide-react';

interface ShowcaseHeaderProps {
  onLogout: () => void;
  onOpenVerifierModal: () => void;
  onOpenCardsModal: () => void;
  activeMobileScreen: 'home' | 'inspector';
  onChangeMobileScreen: (screen: 'home' | 'inspector') => void;
  accountHolder?: string;
}

export const ShowcaseHeader: React.FC<ShowcaseHeaderProps> = ({
  onLogout,
  onOpenVerifierModal,
  onOpenCardsModal,
  activeMobileScreen,
  onChangeMobileScreen,
  accountHolder,
}) => {
  return (
    <header className="w-full bg-[#18181B]/90 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Live Connection Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00843D] to-[#25D366] flex items-center justify-center shadow-lg shadow-[#00843D]/25 ring-1 ring-white/20">
            <span className="font-bold text-black text-sm tracking-tighter">BM</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">BaridiMob Pro</h1>
              <span className="flex items-center gap-1 text-[10px] font-semibold bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                حساب نشط (Live SDK)
              </span>
            </div>
            <p className="text-xs text-[#8E8E93]">
              {accountHolder ? `الحساب: ${accountHolder}` : 'متصل بخوادم بريد الجزائر عبر حزمة baridimobsdk'}
            </p>
          </div>
        </div>

        {/* Mobile View Toggle Switcher */}
        <div className="flex md:hidden w-full bg-[#141416] p-1 rounded-2xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => onChangeMobileScreen('home')}
            className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeMobileScreen === 'home'
                ? 'bg-white text-black font-semibold shadow-md'
                : 'text-[#8E8E93] hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            الشاشة الرئيسية
          </button>
          <button
            type="button"
            onClick={() => onChangeMobileScreen('inspector')}
            className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeMobileScreen === 'inspector'
                ? 'bg-white text-black font-semibold shadow-md'
                : 'text-[#8E8E93] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            الفاحص والإحصائيات
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2 justify-center">
          {/* Verification modal trigger */}
          <button
            type="button"
            onClick={onOpenVerifierModal}
            className="flex items-center gap-1.5 bg-[#1C1C1F] hover:bg-[#2A2A2E] border border-white/10 text-white text-xs px-3.5 py-1.5 rounded-full transition"
            title="فحص صحة وصل أو عملية تاجر"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#25D366]" />
            <span>تحقق من عملية تاجر</span>
          </button>

          {/* Cards Manager trigger */}
          <button
            type="button"
            onClick={onOpenCardsModal}
            className="flex items-center gap-1.5 bg-[#1C1C1F] hover:bg-[#2A2A2E] border border-white/10 text-white text-xs px-3.5 py-1.5 rounded-full transition"
            title="إدارة البطاقة الذهبية"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#F5A3FF]" />
            <span>البطاقة الذهبية</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-300 text-xs px-3.5 py-1.5 rounded-full transition"
            title="تسجيل الخروج ومسح ملف الجلسة"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </header>
  );
};
