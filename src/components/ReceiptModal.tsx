import React from 'react';
import { X, Download, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Transaction } from '../types';
import { EdahabiaCircles } from './BrandLogos';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptContent = `
========================================
       بريد الجزائر - ALGERIE POSTE
      إيصال عملية تطبيق بريدي موب
========================================
المرجع: ${transaction.refNum}
العملية: ${transaction.title}
التاريخ: ${transaction.fullDate}
المبلغ: ${transaction.amount.toLocaleString()} DZD
الحالة: ${transaction.status}
البطاقة المستخدمة: •• ${transaction.cardDigits}
التصنيف: ${transaction.category}
========================================
تمت المصادقة الإلكترونية بنجاح.
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Recu_BaridiMob_${transaction.refNum}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-neutral-900 border border-white/20 rounded-[32px] p-6 shadow-2xl relative max-h-[95vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200 text-black">
        {/* Modal Controls Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#25D366]" />
            <span className="font-bold text-sm">إيصال الدفع الإلكتروني الرسمي</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1C1C1F] hover:bg-[#2A2A2E] text-[#8E8E93] hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Official Paper Receipt (White / Ivory style) */}
        <div className="mt-4 bg-[#FBFBFB] p-6 rounded-2xl border border-neutral-300 shadow-inner relative overflow-hidden select-text text-neutral-900 font-sans print:p-0 print:border-none print:shadow-none">
          {/* Top Bar with Algerian Poste Header */}
          <div className="flex items-start justify-between border-b-2 border-neutral-800 pb-4">
            <div className="text-right">
              <div className="text-xs font-black tracking-wider text-[#00843D]">الجمهورية الجزائرية الديمقراطية الشعبية</div>
              <div className="text-sm font-black text-neutral-900">مؤسسة بريد الجزائر · Algérie Poste</div>
              <div className="text-[11px] text-neutral-600">خدمة الدفع عبر الهاتف النقال BaridiMob</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#00843D] text-white flex flex-col items-center justify-center font-bold text-xs shadow">
              <span>بريد</span>
              <span className="text-[9px] font-normal">الجزائر</span>
            </div>
          </div>

          {/* Receipt Title */}
          <div className="my-4 text-center">
            <span className="inline-block px-3 py-1 bg-neutral-200 rounded-full text-xs font-bold text-neutral-800">
              وصل تسديد إلكتروني مؤكد
            </span>
            <div className="text-2xl font-black num-font mt-2 text-neutral-950">
              {transaction.amount.toLocaleString()} DZD
            </div>
            <div className="text-xs text-neutral-600 font-mono mt-0.5">
              مرجع المعاملة: {transaction.refNum}
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-2.5 text-xs border-y border-neutral-200 py-3.5 my-3">
            <div className="flex justify-between">
              <span className="text-neutral-500 font-medium">نوع العملية:</span>
              <span className="font-bold text-neutral-900">{transaction.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 font-medium">تاريخ وساعة الإنجاز:</span>
              <span className="font-medium text-neutral-800 font-mono" dir="ltr">{transaction.fullDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 font-medium">الجهة المنفذة / المستفيدة:</span>
              <span className="font-medium text-neutral-800">{transaction.senderOrMerchant}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 font-medium">حالة الدفع:</span>
              <span className="inline-flex items-center gap-1 font-bold text-[#00843D]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {transaction.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 font-medium">البطاقة الذهبية المستخدمة:</span>
              <span className="font-mono text-neutral-800 font-medium">•••• •••• •••• {transaction.cardDigits}</span>
            </div>
            {transaction.billerDetails?.contractNumber && (
              <div className="flex justify-between">
                <span className="text-neutral-500 font-medium">رقم العقد / الفاتورة:</span>
                <span className="font-mono text-neutral-800">{transaction.billerDetails.contractNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-500 font-medium">الرسوم والضرائب المطبقة:</span>
              <span className="font-mono text-neutral-800">12.00 DZD</span>
            </div>
          </div>

          {/* Official Stamp & Security Seal */}
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-1">
              <div className="text-[10px] text-neutral-500">تمت المصادقة برقم أمان مشفر:</div>
              <div className="font-mono text-[10px] text-neutral-700 tracking-wider">
                SHA256: {transaction.refNum}89b14f
              </div>
            </div>

            {/* Stamp circle */}
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#00843D] text-[#00843D] flex flex-col items-center justify-center p-1 text-[8px] font-bold text-center rotate-[-12deg] select-none opacity-85">
              <span>بريد الجزائر</span>
              <span className="font-black text-[9px]">مقبوض</span>
              <span>ALGERIE POSTE</span>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 py-3 bg-[#1C1C1F] hover:bg-[#2A2A2E] border border-white/10 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 text-xs"
          >
            <Download className="w-4 h-4 text-[#25D366]" />
            <span>تحميل الوصل (Receipt File)</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3 bg-white hover:bg-neutral-200 text-black font-bold rounded-2xl transition flex items-center justify-center gap-2 text-xs shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الوصل</span>
          </button>
        </div>
      </div>
    </div>
  );
};
