import React, { useState, useEffect } from 'react';
import { ShowcaseHeader } from './components/ShowcaseHeader';
import { Screen1Home } from './components/Screen1Home';
import { Screen2Inspector } from './components/Screen2Inspector';
import { LoginScreen } from './components/LoginScreen';
import { FlexyModal } from './components/FlexyModal';
import { TransferModal } from './components/TransferModal';
import { BillsModal } from './components/BillsModal';
import { CardlessAtmModal } from './components/CardlessAtmModal';
import { MerchantVerifierModal } from './components/MerchantVerifierModal';
import { CardsManagerModal } from './components/CardsManagerModal';
import { api, RealTransaction } from './services/baridimobClient';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [rip, setRip] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [transactions, setTransactions] = useState<RealTransaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<RealTransaction | null>(null);

  // Mobile screen view switcher
  const [activeMobileScreen, setActiveMobileScreen] = useState<'home' | 'inspector'>('home');

  // Modals state
  const [isFlexyOpen, setIsFlexyOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isBillsOpen, setIsBillsOpen] = useState(false);
  const [isCardlessOpen, setIsCardlessOpen] = useState(false);
  const [isVerifierOpen, setIsVerifierOpen] = useState(false);
  const [isCardsOpen, setIsCardsOpen] = useState(false);

  // Check initial session validity
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const status = await api.checkAuthStatus();
      if (status.authenticated) {
        setIsAuthenticated(true);
        if (status.balance !== undefined) setBalance(status.balance);
        if (status.primaryAccount) {
          setAccountNumber(status.primaryAccount.number);
          setRip(status.primaryAccount.number);
        }
        if (status.profile?.clientName) {
          setClientName(status.profile.clientName);
        }
        await refreshLiveDashboard();
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.warn('Session check error', e);
      setIsAuthenticated(false);
    }
  };

  const refreshLiveDashboard = async () => {
    try {
      const [balData, txs] = await Promise.all([
        api.getBalance().catch(() => null),
        api.getTransactions().catch(() => []),
      ]);

      if (balData) {
        setBalance(balData.balance);
        if (balData.primaryAccount?.number) {
          setAccountNumber(balData.primaryAccount.number);
          setRip(balData.primaryAccount.number);
        }
      }

      setTransactions(txs);
      if (txs.length > 0 && !selectedTx) {
        setSelectedTx(txs[0]);
      }
    } catch (e) {
      console.warn('Dashboard refresh error', e);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setIsAuthenticated(false);
    setTransactions([]);
    setSelectedTx(null);
  };

  const handleSelectTransaction = (tx: RealTransaction) => {
    setSelectedTx(tx);
    if (window.innerWidth < 1024) {
      setActiveMobileScreen('inspector');
    }
  };

  const handleToggleExclude = (tx: RealTransaction) => {
    const updated = { ...tx, excludedFromAnalytics: !tx.excludedFromAnalytics };
    setSelectedTx(updated);
    setTransactions((prev) =>
      prev.map((t) => ((t.tid && t.tid === tx.tid) || (t.refNum && t.refNum === tx.refNum) ? updated : t))
    );
  };

  // Loading Splash Screen while verifying session
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center text-white" dir="rtl">
        <div className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-[#00843D] to-[#25D366] flex items-center justify-center shadow-xl shadow-[#00843D]/30 mb-4 animate-pulse">
          <span className="font-extrabold text-black text-2xl tracking-tighter">BM</span>
        </div>
        <p className="text-sm font-medium text-[#8E8E93]">جاري التحقق من جلسة بريد الجزائر...</p>
      </div>
    );
  }

  // Real Login Screen if unauthenticated
  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          refreshLiveDashboard();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#232326] text-white flex flex-col font-arabic select-none antialiased" dir="rtl">
      {/* Top Header / Live Connection Bar */}
      <ShowcaseHeader
        accountHolder={clientName || (accountNumber ? `CCP: ${accountNumber}` : undefined)}
        onLogout={handleLogout}
        onOpenVerifierModal={() => setIsVerifierOpen(true)}
        onOpenCardsModal={() => setIsCardsOpen(true)}
        activeMobileScreen={activeMobileScreen}
        onChangeMobileScreen={setActiveMobileScreen}
      />

      {/* Main Dual-Screen Showcase Viewport */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-6 lg:p-8 overflow-x-hidden">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10">
          
          {/* SCREEN 1 (ON RIGHT IN RTL): Main Home Screen */}
          <div
            className={`w-full lg:w-auto flex justify-center transition-all duration-300 ${
              activeMobileScreen === 'home' ? 'block' : 'hidden lg:flex'
            }`}
          >
            <div className="relative group">
              <Screen1Home
                balance={balance}
                accountNumber={accountNumber}
                rip={rip || '00799999002345678901'}
                transactions={transactions}
                selectedTransactionId={selectedTx?.tid || selectedTx?.refNum || null}
                onSelectTransaction={handleSelectTransaction}
                onOpenFlexy={() => setIsFlexyOpen(true)}
                onOpenTransfer={() => setIsTransferOpen(true)}
                onOpenBills={() => setIsBillsOpen(true)}
                onOpenCardless={() => setIsCardlessOpen(true)}
                onOpenCards={() => setIsCardsOpen(true)}
                onOpenVerifier={() => setIsVerifierOpen(true)}
              />
            </div>
          </div>

          {/* SCREEN 2 (ON LEFT IN RTL): Live Transaction Inspector & Analytics */}
          <div
            className={`w-full lg:w-auto flex justify-center transition-all duration-300 ${
              activeMobileScreen === 'inspector' ? 'block' : 'hidden lg:flex'
            }`}
          >
            <div className="relative group">
              <Screen2Inspector
                transaction={selectedTx}
                allTransactions={transactions}
                onClose={() => {
                  setSelectedTx(null);
                  setActiveMobileScreen('home');
                }}
                onToggleExclude={handleToggleExclude}
              />
            </div>
          </div>

        </div>
      </main>

      {/* Footer Info */}
      <footer className="w-full border-t border-white/[0.06] bg-[#18181B]/80 backdrop-blur-md py-3 px-6 text-center text-xs text-[#8E8E93]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#25D366]" />
            <span>نظام BaridiMob Pro متصل مباشرة بالحساب البريدي الجاري عبر حزمة baridimobsdk.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>التصميم: Readex Pro + Plus Jakarta Sans</span>
            <span>·</span>
            <span className="text-white/80 font-mono">256-bit TLS End-to-End</span>
          </div>
        </div>
      </footer>

      {/* Real Functional Modals */}
      <FlexyModal
        isOpen={isFlexyOpen}
        onClose={() => setIsFlexyOpen(false)}
        onSuccess={refreshLiveDashboard}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onSuccess={refreshLiveDashboard}
      />

      <BillsModal
        isOpen={isBillsOpen}
        onClose={() => setIsBillsOpen(false)}
        onSuccess={refreshLiveDashboard}
      />

      <CardlessAtmModal
        isOpen={isCardlessOpen}
        onClose={() => setIsCardlessOpen(false)}
        onSuccess={refreshLiveDashboard}
      />

      <MerchantVerifierModal
        isOpen={isVerifierOpen}
        onClose={() => setIsVerifierOpen(false)}
      />

      <CardsManagerModal
        isOpen={isCardsOpen}
        onClose={() => setIsCardsOpen(false)}
        onUpdate={refreshLiveDashboard}
      />
    </div>
  );
}

export default App;
