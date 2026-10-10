'use client';

import React from 'react';
import {
  X,
  Printer,
  Award,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { CertificateRecord } from '@/types/analytics';
import { CertificateService } from '@/services/certificates/certificateService';

interface CertificatePreviewModalProps {
  certificate: CertificateRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
  certificate,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    const printHtml = CertificateService.generatePrintableCertificateHtml(certificate);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printHtml);
      printWindow.document.close();
    }
  };

  const issueDateStr = new Date(certificate.issuedAt).toLocaleDateString('hi-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col my-8">
        {/* Modal Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              प्रमाणपत्र पूर्वावलोकन (Certificate Preview) — {certificate.id}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट करें (Print / PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas Container */}
        <div className="p-6 overflow-x-auto bg-slate-100 dark:bg-slate-950 flex justify-center">
          <div className="w-[800px] min-h-[560px] bg-white text-slate-900 p-8 border-12 border-double border-amber-700 rounded-lg shadow-xl flex flex-col justify-between text-center relative select-none">
            {/* Watermark Seal */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
              <Award className="w-96 h-96 text-amber-900" />
            </div>

            {/* Revoked Banner */}
            {certificate.status === 'revoked' && (
              <div className="absolute inset-x-0 top-12 py-2 bg-rose-600/90 text-white font-black text-sm uppercase tracking-widest rotate-[-12deg] shadow-lg">
                निरस्त / REVOKED CERTIFICATE
              </div>
            )}

            {/* Header */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-amber-800">
                Government Recognized Offline Typing Tutor
              </div>
              <h1 className="text-2xl font-black text-amber-900 uppercase tracking-wide mt-1">
                {certificate.instituteName}
              </h1>
              <p className="text-xs text-slate-500">{certificate.instituteAddress || 'Central Campus'}</p>

              <div className="inline-block mt-3 px-6 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs uppercase tracking-wider">
                प्रमाणपत्र / CERTIFICATE OF PROFICIENCY
              </div>
            </div>

            {/* Body */}
            <div className="my-4">
              <p className="text-xs text-slate-500">प्रमाणित किया जाता है कि छात्र/छात्रा / This is to certify that</p>
              <h2 className="text-3xl font-black text-slate-900 underline underline-offset-8 my-2 font-devanagari">
                {certificate.studentName}
              </h2>
              <p className="text-xs text-slate-600">
                अनुक्रमांक / Roll No: <strong className="font-mono">{certificate.studentRollNo || 'N/A'}</strong>
              </p>
              <p className="text-xs text-slate-600 mt-2">
                ने सफलता पूर्वक टंकण परीक्षा उत्तीर्ण की है:
              </p>
              <h3 className="text-lg font-bold text-amber-800 font-devanagari mt-0.5">
                {certificate.courseName} ({certificate.language} — {certificate.keyboardLayout})
              </h3>

              {/* Stats Scorecard Grid */}
              <div className="flex justify-center gap-6 mt-4">
                <div className="px-5 py-2 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="text-xl font-black text-slate-900">{certificate.netWpm} WPM</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">शुद्ध गति (Net Speed)</div>
                </div>
                <div className="px-5 py-2 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="text-xl font-black text-slate-900">{certificate.accuracy}%</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">सटीकता (Accuracy)</div>
                </div>
                <div className="px-5 py-2 rounded-lg border border-amber-300 bg-amber-50">
                  <div className="text-xl font-black text-amber-800">{certificate.grade}</div>
                  <div className="text-[10px] uppercase font-bold text-amber-700">श्रेणी (Grade)</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-left">
              {/* Meta & QR Placeholder */}
              <div className="text-[10px] text-slate-500 space-y-0.5">
                <div><strong>प्रमाणपत्र संख्या / Cert ID:</strong> <span className="font-mono">{certificate.id}</span></div>
                <div><strong>जारी तिथि / Issue Date:</strong> {issueDateStr}</div>
                <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>SHA-256: {certificate.digitalSignatureSha256.substring(0, 24)}...</span>
                </div>
              </div>

              {/* Offline SVG QR Code Representation */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 p-1 border border-slate-300 rounded-md bg-white flex items-center justify-center">
                  <QrCode className="w-14 h-14 text-slate-800" />
                </div>
                <span className="text-[8px] text-slate-400 font-bold uppercase mt-1">
                  Offline Verify
                </span>
              </div>

              {/* Authorized Signature */}
              <div className="text-center w-48">
                <div className="border-t border-slate-600 pt-1">
                  <div className="text-xs font-bold text-slate-800">{certificate.issuedByTeacherName}</div>
                  <div className="text-[10px] text-slate-500">{certificate.authorizedSignatureTitle}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
