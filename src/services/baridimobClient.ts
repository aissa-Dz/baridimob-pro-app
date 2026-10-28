// Real BaridiMob API Client — Connected 100% to Node.js backend running the official 'baridimob' SDK

export interface AuthStatus {
  authenticated: boolean;
  balance?: number;
  primaryAccount?: {
    id: string;
    number: string;
    balance: number;
    currency: string;
  };
  profile?: {
    clientName?: string | null;
    actorId?: string;
    lastLogin?: string | null;
  } | null;
  error?: string;
}

export interface RealTransaction {
  amount: number;
  currency: string;
  description: string;
  type: string;
  tid: string;
  timestamp: string;
  date: string | null;
  fee: number | null;
  refNum: string | null;
  raw?: Record<string, unknown>;
  // UI helpers
  excludedFromAnalytics?: boolean;
}

export interface RealCard {
  id: string;
  number: string;
  name: string;
  brand: string;
  status: number;
  expDate: string;
  active: boolean;
  isDebitAllowed: boolean;
}

export interface RealCardLimit {
  uid: string;
  name: string;
  amount: number | null;
  usedAmount: number | null;
  active: boolean;
}

export interface RealCardlessCode {
  id: string;
  code: string | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
}

class BaridiMobApiClient {
  private baseUrl = '/api';

  // --- 1. AUTHENTICATION & SESSION ---
  public async checkAuthStatus(): Promise<AuthStatus> {
    const res = await fetch(`${this.baseUrl}/auth/status`);
    if (!res.ok) {
      return { authenticated: false };
    }
    return await res.json();
  }

  public async login(credentials: { login: string; password: string }): Promise<{
    state: 'authenticated' | 'otp_required';
    devid?: string;
    message?: string;
  }> {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'فشل تسجيل الدخول إلى بريدي موب');
    }
    return data;
  }

  public async confirmOtp(otp: string): Promise<{ state: 'authenticated'; message?: string }> {
    const res = await fetch(`${this.baseUrl}/auth/confirm-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'رمز التأكيد OTP غير صحيح');
    }
    return data;
  }

  public async logout(): Promise<void> {
    await fetch(`${this.baseUrl}/auth/logout`, { method: 'POST' });
  }

  // --- 2. ACCOUNTS & REAL LIVE BALANCE ---
  public async getBalance(): Promise<{
    balance: number;
    currency: string;
    accounts: any[];
    primaryAccount: any;
  }> {
    const res = await fetch(`${this.baseUrl}/accounts/balance`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'تعذر جلب رصيد الحساب البريدي');
    }
    return data;
  }

  public async getTransactions(params?: { page?: number; all?: boolean }): Promise<RealTransaction[]> {
    const query = new URLSearchParams();
    if (params?.all) query.append('all', 'true');
    if (params?.page !== undefined) query.append('page', params.page.toString());

    const res = await fetch(`${this.baseUrl}/accounts/transactions?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'تعذر جلب سجل العمليات');
    }
    return data;
  }

  // --- 3. CARDS & LIMITS ---
  public async getCards(): Promise<{
    cards: RealCard[];
    limits: RealCardLimit[];
    primaryCard: RealCard | null;
  }> {
    const res = await fetch(`${this.baseUrl}/cards`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'تعذر جلب البطاقات الذهبية');
    }
    return data;
  }

  // --- 4. TRANSFERS ---
  public async sendTransfer(params: {
    recipientRip: string;
    amount: number;
    otp?: string;
    transRef?: string;
  }): Promise<{
    state?: 'otp_required';
    success?: boolean;
    transRef?: string;
    amount?: number;
    message?: string;
  }> {
    const res = await fetch(`${this.baseUrl}/transfers/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'فشل إرسال التحويل المالي');
    }
    return data;
  }

  // --- 5. BILL PAYMENTS & MOBILE TOPUP ---
  public async topupMobile(params: {
    operator: 'mobilis' | 'djezzy' | 'ooredoo';
    phone: string;
    amount: number;
  }): Promise<{ success: boolean; refNum?: string }> {
    const res = await fetch(`${this.baseUrl}/bills/topup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'فشلت عملية شحن الرصيد');
    }
    return data;
  }

  public async payBill(params: {
    biller: string;
    contractNumber: string;
    invoiceId?: string;
    amount: number;
  }): Promise<{ success: boolean; refNum?: string }> {
    const res = await fetch(`${this.baseUrl}/bills/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'فشلت عملية تسديد الفاتورة');
    }
    return data;
  }

  // --- 6. CARDLESS CASH ATM ---
  public async getCardlessCodes(): Promise<RealCardlessCode[]> {
    const res = await fetch(`${this.baseUrl}/cardless`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'تعذر جلب أكواد السحب');
    return data;
  }

  public async createCardlessCode(amount: number): Promise<RealCardlessCode> {
    const res = await fetch(`${this.baseUrl}/cardless/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'تعذر توليد كود السحب');
    return data;
  }

  public async deleteCardlessCode(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/cardless/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'تعذر إلغاء كود السحب');
    }
  }

  // --- 7. VERIFY PAYMENT (bm.verification) ---
  public async verifyPayment(params: { reference: string; amount?: number }): Promise<{
    verified: boolean;
    reason: string;
    transaction: any;
  }> {
    const res = await fetch(`${this.baseUrl}/verification/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'تعذر التحقق من العملية');
    return data;
  }

  // --- 8. OFFICIAL RECEIPT PDF URL ---
  public getReceiptPdfUrl(uid: string): string {
    return `${this.baseUrl}/receipts/${encodeURIComponent(uid)}/pdf`;
  }
}

export const api = new BaridiMobApiClient();
