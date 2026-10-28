export type Operator = 'mobilis' | 'djezzy' | 'ooredoo';

export interface Beneficiary {
  id: string;
  name: string;
  rip: string;
  avatarUrl?: string;
  initials: string;
}

export type TransactionStatus = 'مكتملة' | 'معلقة' | 'ملغاة';

export interface Transaction {
  id: string;
  refNum: string;
  title: string;
  senderOrMerchant: string;
  category: string;
  timestamp: string;
  fullDate: string;
  amount: number;
  isIncoming: boolean;
  cardDigits: string;
  status: TransactionStatus;
  excludedFromAnalytics: boolean;
  analyticsAmount: number;
  receiptAvailable: boolean;
  logoType: 'avatar' | 'idoom' | 'mobilis' | 'djezzy' | 'ooredoo' | 'sonelgaz' | 'ade' | 'seal' | 'atm' | 'transfer';
  avatarUrl?: string;
  notes?: string;
  billerDetails?: {
    contractNumber?: string;
    invoiceNumber?: string;
    billerName?: string;
  };
}

export interface CardLimit {
  dailyAtm: number;
  usedAtm: number;
  dailyPos: number;
  usedPos: number;
  dailyWeb: number;
  usedWeb: number;
}

export interface CardInfo {
  id: string;
  number: string;
  maskedNumber: string;
  holderName: string;
  expDate: string;
  brand: string;
  active: boolean;
  isDebitAllowed: boolean;
  isWebPaymentAllowed: boolean;
  limits: CardLimit;
}

export interface CardlessCode {
  id: string;
  code: string;
  amount: number;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'used' | 'expired';
}

export interface MonthlySpending {
  month: string;
  monthLabel: string;
  amount: number;
  targetMax: number;
}

export interface AccountInfo {
  accountNumber: string;
  rip: string;
  cleRip: string;
  balance: number;
  currency: string;
  holderName: string;
  avatarUrl: string;
}
