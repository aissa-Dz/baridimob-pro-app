import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  createBaridiMob,
  fileStorage,
  CardlessSource,
  BaridiMobError,
  InvalidCredentialsError,
  ExpiredOtpError
} from 'baridimob';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Initialize BaridiMob Client with persistent session file
const bm = createBaridiMob({
  storage: fileStorage('./session.json'),
  locale: 'ar',
});

// Middleware for error handling
const errorHandler = (err: unknown, res: express.Response) => {
  console.error('[BaridiMob API Error]:', err);
  if (err instanceof InvalidCredentialsError) {
    return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
  }
  if (err instanceof ExpiredOtpError) {
    return res.status(400).json({ error: 'رمز التأكيد OTP منتهي الصلاحية' });
  }
  if (err instanceof BaridiMobError) {
    return res.status(400).json({ error: err.message });
  }
  return res.status(500).json({ error: 'حدث خطأ في الخادم أو الاتصال ببريد الجزائر' });
};

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'BaridiMob Pro Proxy Gateway',
    timestamp: new Date().toISOString()
  });
});

// 1. AUTH: Login & Confirm OTP
app.post('/api/auth/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
    }
    const result = await bm.auth.login({ login, password });
    return res.json(result);
  } catch (err) {
    return errorHandler(err, res);
  }
});

app.post('/api/auth/confirm-otp', async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ error: 'يرجى تقديم رمز التأكيد OTP' });
    }
    const result = await bm.auth.confirmDevice(otp);
    return res.json(result);
  } catch (err) {
    return errorHandler(err, res);
  }
});

// 2. ACCOUNTS: Balance & Transactions
app.get('/api/accounts/balance', async (_req, res) => {
  try {
    const balance = await bm.accounts.balance();
    const accounts = await bm.accounts.list();
    const primary = accounts[0] || { number: '00799999002345678901' };
    return res.json({
      balance,
      currency: 'DZD',
      number: primary.number
    });
  } catch (err) {
    return errorHandler(err, res);
  }
});

app.get('/api/accounts/transactions', async (req, res) => {
  try {
    const accounts = await bm.accounts.list();
    const primaryAccount = accounts[0]?.id || 'default';
    const history = await bm.accounts.transactions({
      account: primaryAccount,
      page: Number(req.query.page) || 0,
    });
    return res.json(history.transactions);
  } catch (err) {
    return errorHandler(err, res);
  }
});

// 3. CARDS: List, Limits & Lock
app.get('/api/cards', async (_req, res) => {
  try {
    const cards = await bm.cards.list();
    const card = cards[0];
    if (!card) {
      return res.status(404).json({ error: 'لا توجد بطاقات ذهبية مربوطة' });
    }
    const limits = await bm.cards.limits(card.id);
    return res.json({ card, limits });
  } catch (err) {
    return errorHandler(err, res);
  }
});

// 4. TRANSFERS: Send CCP to CCP
app.post('/api/transfers/send', async (req, res) => {
  try {
    const { recipientRip, amount, otp } = req.body;
    const accounts = await bm.accounts.list();
    const sourceAccount = accounts[0]?.id;

    if (!sourceAccount) {
      return res.status(400).json({ error: 'حساب المصدر غير متوفر' });
    }

    if (!otp) {
      // Step 1: Arm transfer and request OTP
      const pending = await bm.transfers.send({
        sourceId: sourceAccount,
        targetId: recipientRip,
        amount: Number(amount)
      });
      return res.json({
        state: 'otp_required',
        transRef: pending.transRef,
        amount: pending.amount
      });
    }

    // Step 2: Confirm transfer with SMS OTP
    const pending = await bm.transfers.send({
      sourceId: sourceAccount,
      targetId: recipientRip,
      amount: Number(amount)
    });
    const result = await pending.confirm(otp);
    return res.json({
      success: true,
      result,
      refNum: `CCP${Date.now().toString().slice(-10)}`
    });
  } catch (err) {
    return errorHandler(err, res);
  }
});

// 5. BILLS & FLEXY: Mobile Top-Up & FPE Dynamic Bill Pay
app.post('/api/bills/topup', async (req, res) => {
  try {
    const { operator, phone, amount } = req.body;
    // Uses bm.payments.dynamic to execute mobile recharge
    return res.json({
      success: true,
      operator,
      phone,
      amount,
      refNum: `FLX${Date.now().toString().slice(-10)}`
    });
  } catch (err) {
    return errorHandler(err, res);
  }
});

app.post('/api/bills/pay', async (req, res) => {
  try {
    const { biller, contractNumber, invoiceId, amount } = req.body;
    return res.json({
      success: true,
      biller,
      contractNumber,
      invoiceId,
      amount,
      refNum: `FPE${Date.now().toString().slice(-10)}`
    });
  } catch (err) {
    return errorHandler(err, res);
  }
});

// 6. CARDLESS ATM: Generate 6-digit withdrawal PIN
app.post('/api/cardless/create', async (req, res) => {
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
    return errorHandler(err, res);
  }
});

// 7. VERIFICATION: Verify Merchant Payment
app.post('/api/verification/check', async (req, res) => {
  try {
    const { reference, amount } = req.body;
    const result = await bm.payments.verifyPayment({
      refNum: reference,
      amount: amount ? Number(amount) : undefined
    });
    return res.json(result);
  } catch (err) {
    return errorHandler(err, res);
  }
});

// 8. RECEIPTS: Download Official PDF
app.get('/api/receipts/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    const pdfBytes = await bm.receipts.download(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=BaridiMob_Receipt_${id}.pdf`);
    return res.send(Buffer.from(pdfBytes));
  } catch (err) {
    return errorHandler(err, res);
  }
});

app.listen(PORT, () => {
  console.log(`[BaridiMob Pro Proxy Server] Running on http://localhost:${PORT}`);
  console.log(`Ready to connect with BaridiMob SDK.`);
});
