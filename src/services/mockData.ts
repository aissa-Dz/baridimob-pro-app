import { AccountInfo, Beneficiary, CardInfo, CardlessCode, Transaction } from '../types';

export const INITIAL_ACCOUNT: AccountInfo = {
  accountNumber: '0023456789',
  rip: '00799999002345678901',
  cleRip: '01',
  balance: 142850.00,
  currency: 'DZD',
  holderName: 'ياسين بن علي',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

export const INITIAL_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'ben-1',
    name: 'ياسين بن علي',
    rip: '00799999002345678901',
    initials: 'يب',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'ben-2',
    name: 'سارة مرابط',
    rip: '00799999001122334455',
    initials: 'سم',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'ben-3',
    name: 'أحمد دراجي',
    rip: '00799999005566778899',
    initials: 'أد',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'ben-4',
    name: 'أمينة بلقاسم',
    rip: '00799999009988776655',
    initials: 'أب',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'ben-5',
    name: 'كريم زروقي',
    rip: '00799999004433221100',
    initials: 'كز',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    refNum: 'CCP202510282327',
    title: 'ياسين بن علي',
    senderOrMerchant: 'ياسين بن علي (تحويل وارد)',
    category: 'تحويل مالي',
    timestamp: 'اليوم، 23:27',
    fullDate: '28 أكتوبر 2026 - 23:27',
    amount: 15000.00,
    isIncoming: true,
    cardDigits: '6241',
    status: 'مكتملة',
    excludedFromAnalytics: false,
    analyticsAmount: 15000.00,
    receiptAvailable: true,
    logoType: 'avatar',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    notes: 'تحويل CCP فوري عبر تطبيق بريدي موب'
  },
  {
    id: 'tx-2',
    refNum: 'FPE202509180832',
    title: 'اتصالات الجزائر Idoom',
    senderOrMerchant: 'اتصالات الجزائر Idoom',
    category: 'فواتير واتصالات',
    timestamp: 'اليوم، 08:32',
    fullDate: '28 أكتوبر 2026 - 08:32',
    amount: 2600.00,
    isIncoming: false,
    cardDigits: '6241',
    status: 'مكتملة',
    excludedFromAnalytics: false,
    analyticsAmount: 2600.00,
    receiptAvailable: true,
    logoType: 'idoom',
    billerDetails: {
      billerName: 'Algérie Télécom - Idoom Fibre 50 Mbps',
      contractNumber: '21323891456',
      invoiceNumber: 'INV-2026-0918'
    },
    notes: 'تجديد اشتراك انترنت الألياف البصرية FTTH'
  },
  {
    id: 'tx-3',
    refNum: 'FLX202510271914',
    title: 'تعبئة موبيليس PixX',
    senderOrMerchant: 'موبيليس - Mobilis PixX 1000',
    category: 'شحن رصيد وتعبئة',
    timestamp: 'أمس، 19:14',
    fullDate: '27 أكتوبر 2026 - 19:14',
    amount: 1000.00,
    isIncoming: false,
    cardDigits: '6241',
    status: 'مكتملة',
    excludedFromAnalytics: false,
    analyticsAmount: 1000.00,
    receiptAvailable: true,
    logoType: 'mobilis',
    notes: 'تعبئة رصيد الهاتف 0661234567'
  },
  {
    id: 'tx-4',
    refNum: 'ATM202510251410',
    title: 'سحب نقدي بدون بطاقة',
    senderOrMerchant: 'موزع آلي بريد الجزائر (ATM حيدرة)',
    category: 'سحب نقدي',
    timestamp: '25 أكتوبر، 14:10',
    fullDate: '25 أكتوبر 2026 - 14:10',
    amount: 5000.00,
    isIncoming: false,
    cardDigits: '6241',
    status: 'مكتملة',
    excludedFromAnalytics: false,
    analyticsAmount: 5000.00,
    receiptAvailable: true,
    logoType: 'atm',
    notes: 'كود سحب بدون بطاقة من الشباك الآلي'
  },
  {
    id: 'tx-5',
    refNum: 'SNG202510201145',
    title: 'فاتورة سونلغاز كهرباء وغاز',
    senderOrMerchant: 'شركة سونلغاز - Sonelgaz',
    category: 'فواتير ومرافق',
    timestamp: '20 أكتوبر، 11:45',
    fullDate: '20 أكتوبر 2026 - 11:45',
    amount: 4200.00,
    isIncoming: false,
    cardDigits: '6241',
    status: 'مكتملة',
    excludedFromAnalytics: false,
    analyticsAmount: 4200.00,
    receiptAvailable: true,
    logoType: 'sonelgaz',
    billerDetails: {
      billerName: 'Sonelgaz Distribution',
      contractNumber: '984512034',
      invoiceNumber: 'SN-784519'
    }
  },
  {
    id: 'tx-6',
    refNum: 'DJZ202510151620',
    title: 'تعبئة جيزي هدرة Djezzy',
    senderOrMerchant: 'جيزي الجزائر - Djezzy',
    category: 'شحن رصيد وتعبئة',
    timestamp: '15 أكتوبر، 16:20',
    fullDate: '15 أكتوبر 2026 - 16:20',
    amount: 500.00,
    isIncoming: false,
    cardDigits: '6241',
    status: 'مكتملة',
    excludedFromAnalytics: false,
    analyticsAmount: 500.00,
    receiptAvailable: true,
    logoType: 'djezzy'
  }
];

export const INITIAL_CARD: CardInfo = {
  id: 'card-edahabia-primary',
  number: '6280 4300 8712 6241',
  maskedNumber: '6280 •••• •••• 6241',
  holderName: 'YACINE BEN ALI',
  expDate: '09/29',
  brand: 'Edahabia',
  active: true,
  isDebitAllowed: true,
  isWebPaymentAllowed: true,
  limits: {
    dailyAtm: 50000.00,
    usedAtm: 5000.00,
    dailyPos: 100000.00,
    usedPos: 3600.00,
    dailyWeb: 50000.00,
    usedWeb: 2600.00,
  }
};

export const INITIAL_CARDLESS_CODES: CardlessCode[] = [
  {
    id: 'atm-code-1',
    code: '849201',
    amount: 5000,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    status: 'active'
  }
];

export const MONTHLY_SPENDING_DATA = [
  { month: 'يناير', monthLabel: 'Jan', amount: 9800, targetMax: 25000 },
  { month: 'فبراير', monthLabel: 'Feb', amount: 14200, targetMax: 25000 },
  { month: 'مارس', monthLabel: 'Mar', amount: 18500, targetMax: 25000 },
  { month: 'أفريل', monthLabel: 'Apr', amount: 19800, targetMax: 25000 },
  { month: 'ماي', monthLabel: 'May', amount: 12400, targetMax: 25000 },
  { month: 'جوان', monthLabel: 'Jun', amount: 15600, targetMax: 25000 },
];
