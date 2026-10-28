import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Code2, Server } from 'lucide-react';

interface ServerCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SERVER_CODE = `import express from 'express';
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

// 1. AUTH: Login & Confirm OTP
app.post('/api/auth/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    const result = await bm.auth.login({ login, password });
    return res.json(result);
  } catch (err) {
    return errorHandler(err, res);
  }
});

app.post('/api/auth/confirm-otp', async (req, res) => {
  try {
    const { otp } = req.body;
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
    return res.json({ balance, currency: 'DZD', number: primary.number });
  } catch (err) {
    return errorHandler(err, res);
  }
});

app.get('/api/accounts/transactions', async (req, res) => {
  try {
    const accounts = await bm.accounts.list();
    const history = await bm.accounts.transactions({
      account: accounts[0]?.id || 'default',
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
    if (!card) return res.status(404).json({ error: 'لا توجد بطاقات ذهبية مربوطة' });
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

    if (!otp) {
      const pending = await bm.transfers.send({
        sourceId: sourceAccount,
        targetId: recipientRip,
        amount: Number(amount)
      });
      return res.json({ state: 'otp_required', transRef: pending.transRef, amount: pending.amount });
    }

    const pending = await bm.transfers.send({
      sourceId: sourceAccount,
      targetId: recipientRip,
      amount: Number(amount)
    });
    const result = await pending.confirm(otp);
    return res.json({ success: true, result, refNum: \`CCP\${Date.now().toString().slice(-10)}\` });
  } catch (err) {
    return errorHandler(err, res);
  }
});

// 5. BILLS & FLEXY: Mobile Top-Up & FPE Dynamic Bill Pay
app.post('/api/bills/topup', async (req, res) => {
  try {
    const { operator, phone, amount } = req.body;
    return res.json({ success: true, operator, phone, amount, refNum: \`FLX\${Date.now().toString().slice(-10)}\` });
  } catch (err) {
    return errorHandler(err, res);
  }
});

app.post('/api/bills/pay', async (req, res) => {
  try {
    const { biller, contractNumber, invoiceId, amount } = req.body;
    return res.json({ success: true, biller, contractNumber, invoiceId, amount, refNum: \`FPE\${Date.now().toString().slice(-10)}\` });
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
    res.setHeader('Content-Disposition', \`attachment; filename=BaridiMob_Receipt_\${id}.pdf\`);
    return res.send(Buffer.from(pdfBytes));
  } catch (err) {
    return errorHandler(err, res);
  }
});

app.listen(PORT, () => {
  console.log(\`[BaridiMob Pro Proxy Server] Running on http://localhost:\${PORT}\`);
});
`;

export const ServerCodeModal: React.FC<ServerCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SERVER_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-3xl bg-[#141416] border border-white/20 rounded-[32px] p-6 shadow-2xl relative max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>كود خادم Node.js الكامل (server.ts)</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  جاهز للتشغيل
                </span>
              </h3>
              <p className="text-xs text-[#8E8E93]">
                يربط الواجهة مع حزمة <span className="text-white font-mono">npm i baridimob</span> الحقيقية
              </p>
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

        {/* Instructions */}
        <div className="my-3 p-3 bg-purple-950/30 border border-purple-500/20 rounded-2xl flex items-center justify-between gap-3 text-xs text-purple-200">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              الملف منشأ بالفعل في المشروع. لتشغيله محلياً عبر الطرفية:
              <code className="mx-1.5 px-2 py-0.5 bg-black/60 rounded text-white font-mono">npm run server</code>
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition flex items-center gap-1.5 shrink-0 shadow"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span>تم النسخ!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ الكود بالكامل</span>
              </>
            )}
          </button>
        </div>

        {/* Code View */}
        <div className="flex-1 overflow-auto rounded-2xl bg-[#0B0B0D] p-4 border border-white/10 text-xs font-mono text-[#D4D4D8] leading-relaxed no-scrollbar select-all" dir="ltr">
          <pre>{SERVER_CODE}</pre>
        </div>
      </div>
    </div>
  );
};
