'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Award,
  Printer,
  ShieldCheck,
  Eye,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { CertificateService } from '@/services/certificates/certificateService';
import { CertificateRecord } from '@/types/analytics';
import { CertificatePreviewModal } from './CertificatePreviewModal';
import { CertificateVerificationModal } from './CertificateVerificationModal';

export const CertificateGalleryView: React.FC = () => {
  const { activeProfile } = useProfile();
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<CertificateRecord | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);

  const loadCertificates = useCallback(async () => {
    if (!activeProfile) return;
    setLoading(true);
    try {
      const list = await CertificateService.getCertificates(activeProfile.id);
      setCertificates(list);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  }, [activeProfile]);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  if (!activeProfile) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>टंकण दक्षता प्रमाणपत्र (Typing Certificates)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            सत्यापित परीक्षाओं में उत्तीर्ण होने पर जारी किए गए आधिकारिक टंकण प्रमाणपत्र
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVerifyOpen(true)}
            className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>सत्यापन पोर्टल (Verify Cert)</span>
          </button>
          <button
            onClick={loadCertificates}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="रीफ्रेश करें"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Certificate Grid */}
      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-300/80 dark:border-amber-900/60 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {cert.status === 'revoked' && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300">
                  निरस्त (Revoked)
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-2">
                  <Award className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Certificate of Proficiency
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-slate-100 font-devanagari">
                  {cert.courseName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {cert.language} • {cert.keyboardLayout}
                </p>

                {/* Score Pill Matrix */}
                <div className="flex items-center gap-3 my-4">
                  <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase block">शुद्ध गति</span>
                    <strong className="text-sm font-black text-slate-900 dark:text-slate-100">
                      {cert.netWpm} WPM
                    </strong>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase block">सटीकता</span>
                    <strong className="text-sm font-black text-slate-900 dark:text-slate-100">
                      {cert.accuracy}%
                    </strong>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900">
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase block">श्रेणी</span>
                    <strong className="text-sm font-black text-amber-800 dark:text-amber-300">
                      {cert.grade}
                    </strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-0.5 mb-4 font-mono">
                  <div>ID: {cert.id}</div>
                  <div>जारी: {new Date(cert.issuedAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={() => {
                  setSelectedCert(cert);
                  setIsPreviewOpen(true);
                }}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>पूर्वावलोकन एवं प्रिंट (Preview & Print)</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xs">
          <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            कोई प्रमाणपत्र अभी जारी नहीं हुआ है (No Certificates Issued Yet)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4 leading-relaxed">
            प्रमाणपत्र केवल सत्यापित आधिकारिक परीक्षाओं में कम से कम 25 शुद्ध WPM और 85% सटीकता प्राप्त करने पर संस्थान द्वारा जारी किए जाते हैं।
          </p>
          <button
            onClick={() => setIsVerifyOpen(true)}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            प्रमाणपत्र आईडी से सत्यापन करें
          </button>
        </div>
      )}

      {/* Preview Modal */}
      <CertificatePreviewModal
        certificate={selectedCert}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedCert(null);
        }}
      />

      {/* Verification Modal */}
      <CertificateVerificationModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
      />
    </div>
  );
};
