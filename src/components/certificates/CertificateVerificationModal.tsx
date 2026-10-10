'use client';

import React, { useState } from 'react';
import {
  X,
  Search,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  Award,
  User,
} from 'lucide-react';
import { CertificateVerificationService } from '@/services/certificates/certificateVerificationService';
import { CertificateVerificationResult } from '@/types/analytics';

interface CertificateVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateVerificationModal: React.FC<CertificateVerificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [certId, setCertId] = useState('');
  const [result, setResult] = useState<CertificateVerificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;

    setLoading(true);
    try {
      const res = await CertificateVerificationService.verifyCertificate(certId);
      setResult(res);
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              प्रमाणपत्र ऑफलाइन सत्यापन (Offline Verification)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              प्रमाणपत्र संख्या दर्ज करें (Enter Certificate ID):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                placeholder="उदा. TMP-CERT-2026-AB123"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono uppercase focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading || !certId.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>सत्यापित करें</span>
              </button>
            </div>
          </div>
        </form>

        {/* Results Display */}
        {result && (
          <div className="mt-5 space-y-3">
            {result.isValid && result.certificate ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>वैध एवं प्रामाणिक प्रमाणपत्र (Verified Authentic)</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-slate-500 text-[10px] block">विद्यार्थी:</span>
                    <strong className="font-devanagari">{result.certificate.studentName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">अनुक्रमांक:</span>
                    <strong className="font-mono">{result.certificate.studentRollNo || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">पाठ्यक्रम:</span>
                    <span>{result.certificate.courseName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">गति एवं श्रेणी:</span>
                    <strong>{result.certificate.netWpm} WPM (Grade {result.certificate.grade})</strong>
                  </div>
                </div>

                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono pt-2 border-t border-emerald-200 dark:border-emerald-900">
                  SHA-256 Signature Verified ✓
                </div>
              </div>
            ) : result.revocation ? (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span>प्रमाणपत्र निरस्त (Revoked)</span>
                </div>
                <p className="text-xs text-rose-700 dark:text-rose-400">
                  यह प्रमाणपत्र संस्थान द्वारा निरस्त किया जा चुका है।
                </p>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-md border border-rose-200 dark:border-rose-900">
                  <strong>कारण:</strong> {result.revocation.reason}
                </div>
              </div>
            ) : result.isTampered ? (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
                  <AlertOctagon className="w-5 h-5 text-rose-600" />
                  <span>संदिग्ध अभिलेख (Tampered Record)</span>
                </div>
                <p className="text-xs text-rose-700 dark:text-rose-400 mt-1">
                  {result.message}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-center text-xs text-slate-600 dark:text-slate-400">
                {result.message}
              </div>
            )}
          </div>
        )}

        {/* Security Notice */}
        <p className="text-[10px] text-slate-400 mt-5 text-center leading-normal">
          * यह सत्यापन 100% ऑफलाइन कार्य करता है और क्रिप्टोग्राफिक SHA-256 हैश की सहायता से डेटाबेस में रिकॉर्ड की प्रामाणिकता की पुष्टि करता है।
        </p>
      </div>
    </div>
  );
};
