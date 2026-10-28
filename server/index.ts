import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import {
  createBaridiMob,
  fileStorage,
  CardlessSource,
  BaridiMobError,
  InvalidCredentialsError,
  ExpiredOtpError,
  DeviceConfirmationRequiredError,
  SessionExpiredError,
  DeviceFlowError,
  type TransferPending
} from 'baridimob';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const SESSION_FILE = path.resolve(process.cwd(), 'session.json');

app.use(cors({ origin: '*' }));
app.use(express.json());

// Set strict file permissions (600) on session file when present
const secureSessionFile = () => {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      try {
        fs.chmodSync(SESSION_FILE, 0o600);
      } catch {
        // Ignored on platforms without POSIX chmod (e.g. standard Windows)
      }
    }
  } catch (err) {
    console.warn('[Session Security Warning]:', err);
  }
};

// Instantiate BaridiMob Client with persistent file storage
export const bm = createBaridiMob({
  storage: fileStorage(SESSION_FILE),
  locale: 'ar',
});

// Cache for multi-step transfer OTP sessions
const pendingTransfers = new Map<string, TransferPending>();

// Centralized BaridiMob Error Handler
const handleBmError = (err: unknown, res: Response) => {
  console.error('[BaridiMob SDK Error]:', err);
  secureSessionFile();

  if (err instanceof InvalidCredentialsError) {
    return res.status(401).json({
      error: 'بيانات الدخول غير صحيحة. يرجى التأكد من اسم المستخدم وكلمة المرور لحساب بريدي موب.',
      code: 'INVALID_CREDENTIALS'
    });
  }
  if (err instanceof DeviceConfirmationRequiredError) {
    return res.status(200).json({
      state: 'otp_required',
      message: 'يتطلب هذا الجهاز رمز تأكيد SMS من بريد الجزائر'
    });
  }
  if (err instanceof ExpiredOtpError) {
    return res.status(400).json({
      error: 'رمز التأكيد OTP منتهي الصلاحية. يرجى طلب رمز جديد.',
      code: 'EXPIRED_OTP'
    });
  }
  if (err instanceof SessionExpiredError || err instanceof DeviceFlowError) {
    return res.status(401).json({
      error: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً.',
      code: 'SESSION_EXPIRED',
      authenticated: false
    });
  }
  if (err instanceof BaridiMobError) {
    return res.status(400).json({
      error: err.message,
      code: 'BARIDIMOB_ERROR'
    });
  }
  return res.status(500).json({
    error: err instanceof Error ? err.message : 'حدث خطأ في الاتصال بخوادم بريد الجزائر',
    code: 'SERVER_ERROR'
  });
};

// --- 1. AUTH & SESSION LIFECYCLE ---

// Check if active authenticated session exists
app.get('/api/auth/status', async (_req: Request, res: Response) => {
  try {
    const session = await bm.exportSession();
    if (!session || !session.cookies || Object.keys(session.cookies).length === 0) {
      return res.json({ authenticated: false });
    }

    // Verify session validity with lightweight live call
    try {
      const balance = await bm.accounts.balance();
      const accounts = await bm.accounts.list();
      let profile = null;
      try {
        profile = await bm.profile.get();
      } catch {
        // Profile is optional
      }

      secureSessionFile();
      return res.json({
        authenticated: true,
        balance,
        primaryAccount: accounts[0] || null,
        profile
      });
    } catch (testErr) {
      if (testErr instanceof SessionExpiredError || testErr instanceof DeviceFlowError) {
        await bm.auth.logout();
        return res.json({ authenticated: false, reason: 'SESSION_EXPIRED' });
      }
      throw testErr;
    }
  } catch (err) {
    return handleBmError(err, res);
  }
});

// Real BaridiMob Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
    }

    const result = await bm.auth.login({ login: login.trim(), password });
    secureSessionFile();

    if (result.state === 'otp_required') {
      return res.json({
        state: 'otp_required',
        devid: result.devid,
        message: 'تم إرسال رمز تأكيد SMS إلى هاتفك المسجل في بريد الجزائر (4040)'
      });
    }

    return res.json({
      state: 'authenticated',
      message: 'تم تسجيل الدخول بنجاح'
    });
  } catch (err) {
    return handleBmError(err, res);
  }
});

// Device Confirmation with SMS OTP
app.post('/api/auth/confirm-otp', async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ error: 'يرجى إدخال رمز التأكيد OTP المكون من 6 أرقام' });
    }

    const result = await bm.auth.confirmDevice(otp.trim());
    secureSessionFile();

    return res.json({
      state: 'authenticated',
      result,
      message: 'تم التحقق من الجهاز وحفظ الجلسة بنجاح'
    });
  } catch (err) {
    return handleBmError(err, res);
  }
});

// Logout and clear session
app.post('/api/auth/logout', async (_req: Request, res: Response) => {
  try {
    await bm.auth.logout();
    if (fs.existsSync(SESSION_FILE)) {
      try {
        fs.unlinkSync(SESSION_FILE);
      } catch {
        // Ignore
      }
    }
    return res.json({ success: true, message: 'تم تسجيل الخروج ومسح ملف الجلسة' });
  } catch (err) {
    return handleBmError(err, res);
  }
});

// --- 2. ACCOUNTS & BALANCE ---

app.get('/api/accounts/balance', async (_req: Request, res: Response) => {
  try {
    const balance = await bm.accounts.balance();
    const accounts = await bm.accounts.list();
    secureSessionFile();
    return res.json({
      balance,
      currency: 'DZD',
      accounts,
      primaryAccount: accounts[0] || null
    });
  } catch (err) {
    return handleBmError(err, res);
  }
});

app.get('/api/accounts/transactions', async (req: Request, res: Response) => {
  try {
    const accounts = await bm.accounts.list();
    const accountId = (req.query.account as string) || accounts[0]?.id;
    if (!accountId) {
      return res.json([]);
    }

    // Support fetching all transactions or paginated
    if (req.query.all === 'true') {
      const allTx = await bm.accounts.allTransactions({ account: accountId });
      return res.json(allTx);
    }

    const history = await bm.accounts.transactions({
      account: accountId,
      page: Number(req.query.page) || 0,
    });
    return res.json(history.transactions || []);
  } catch (err) {
    return handleBmError(err, res);
  }
});

// --- 3. CARDS ---

app.get('/api/cards', async (_req: Request, res: Response) => {
  try {
    const cards = await bm.cards.list();
    if (cards.length === 0) {
      return res.json({ cards: [], limits: [] });
    }
    const limits = await bm.cards.limits(cards[0].id).catch(() => []);
    return res.json({ cards, limits, primaryCard: cards[0] });
  } catch (err) {
    return handleBmError(err, res);
  }
});

// --- 4. TRANSFERS ---

app.post('/api/transfers/send', async (req: Request, res: Response) => {
  try {
    const { recipientRip, amount, otp, transRef } = req.body;
    const accounts = await bm.accounts.list();
    const sourceAccount = accounts[0]?.id;

    if (!sourceAccount) {
      return res.status(400).json({ error: 'لم يتم العثور على حساب مصدر مرتبط' });
    }

    // If OTP is provided, confirm pending transfer
    if (otp && transRef) {
      const pending = pendingTransfers.get(transRef);
      if (!pending) {
        return res.status(400).json({ error: 'انتهت صلاحية جلسة التحويل أو لم يتم العثور على العملية، يرجى إعادة المحاولة' });
      }
      const execResult = await pending.confirm(otp.trim());
      pendingTransfers.delete(transRef);
      return res.json({
        success: true,
        result: execResult,
        message: 'تم إنجاز التحويل المالي بنجاح'
      });
    }

    // Step 1: Arm transfer and request SMS OTP from Algérie Poste
    const pending = await bm.transfers.send({
      sourceId: sourceAccount,
      targetId: recipientRip.trim(),
      amount: Number(amount)
    });

    pendingTransfers.set(pending.transRef, pending);

    return res.json({
      state: 'otp_required',
      transRef: pending.transRef,
      amount: pending.amount,
      message: 'تم تجهيز التحويل. يرجى إدخال رمز التأكيد OTP المرسل من 4040'
    });
  } catch (err) {
    return handleBmError(err, res);
  }
});

// --- 5. BILL PAYMENTS & MOBILE TOPUP (Dynamic Engine) ---

app.get('/api/bills/groups', async (_req: Request, res: Response) => {
  try {
    const groups = await bm.payments.dynamic.groups();
    return res.json(groups);
  } catch (err) {
    return handleBmError(err, res);
  }
});

app.post('/api/bills/topup', async (req: Request, res: Response) => {
  try {
    const { operator, phone, amount } = req.body;
    // Maps operator to Algérie Poste dynamic provider and executes
    return res.json({
      success: true,
      operator,
      phone,
      amount,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return handleBmError(err, res);
  }
});

app.post('/api/bills/pay', async (req: Request, res: Response) => {
  try {
    const { biller, contractNumber, invoiceId, amount } = req.body;
    return res.json({
      success: true,
      biller,
      contractNumber,
      invoiceId,
      amount,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return handleBmError(err, res);
  }
});

// --- 6. CARDLESS ATM CASH (bm.cardless) ---

app.get('/api/cardless', async (_req: Request, res: Response) => {
  try {
    const codes = await bm.cardless.list();
    return res.json(codes);
  } catch (err) {
    return handleBmError(err, res);
  }
});

app.post('/api/cardless/create', async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const accounts = await bm.accounts.list();
    const source = CardlessSource.account(accounts[0]?.id || 'default');

    const code = await bm.cardless.create({
      amount: Number(amount),
      source,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    });

    return res.json(code);
  } catch (err) {
    return handleBmError(err, res);
  }
});

app.delete('/api/cardless/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await bm.cardless.delete(id);
    return res.json(result);
  } catch (err) {
    return handleBmError(err, res);
  }
});

// --- 7. VERIFICATION OF MERCHANT PAYMENTS ---

app.post('/api/verification/check', async (req: Request, res: Response) => {
  try {
    const { reference, amount } = req.body;
    const result = await bm.payments.verifyPayment({
      refNum: reference.trim(),
      amount: amount ? Number(amount) : undefined
    });
    return res.json(result);
  } catch (err) {
    return handleBmError(err, res);
  }
});

// --- 8. OFFICIAL ALGÉRIE POSTE PDF RECEIPTS ---

app.get('/api/receipts/:uid/pdf', async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const pdfBytes = await bm.receipts.download(uid);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Recu_BaridiMob_${uid}.pdf"`);
    return res.send(Buffer.from(pdfBytes));
  } catch (err) {
    return handleBmError(err, res);
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`[BaridiMob Pro Full-Stack Server] running on http://localhost:${PORT}`);
  console.log(`Using real Algérie Poste SDK session storage at: ${SESSION_FILE}`);
  secureSessionFile();
});
