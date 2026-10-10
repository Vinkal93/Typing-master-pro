'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Award,
  Plus,
  Printer,
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { AuthSession } from '@/types/institute';
import { CertificateRecord } from '@/types/analytics';
import { CertificateService } from '@/services/certificates/certificateService';
import { CertificateIssueModal } from '../certificates/CertificateIssueModal';
import { CertificatePreviewModal } from '../certificates/CertificatePreviewModal';
import { CertificateVerificationModal } from '../certificates/CertificateVerificationModal';

interface InstituteCertificateManagerViewProps {
  authSession: AuthSession;
}

export const InstituteCertificateManagerView: React.FC<InstituteCertificateManagerViewProps> = ({
  authSession,
}) => {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<CertificateRecord | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);

  // Revocation state
  const [revokingCertId, setRevokingCertId] = useState<string | null>(null);
  const [revocationReason, setRevocationReason] = useState('');

  const loadCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const list = await CertificateService.getCertificates();
      setCertificates(list);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  const handleRevoke = async () => {
    if (!revokingCertId || !revocationReason.trim()) return;
    try {
      await CertificateService.revokeCertificate({
        certificateId: revokingCertId,
        revokedByUserId: authSession.user.id,
        revokedByUserName: authSession.user.name,
        reason: revocationReason,
      });
      setRevokingCertId(null);
      setRevocationReason('');
      loadCertificates();
    } catch (err) {
      console.error('Failed to revoke certificate:', err);
    }
  };

  const filtered = certificates.filter(
    (c) =>
      c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.studentRollNo && c.studentRollNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>संस्थान प्रमाणपत्र प्रबंधन (Certificate Management & Issuance)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            प्रमाणित परीक्षाओं से डिजिटल रूप से हस्ताक्षरित प्रमाणपत्र जारी करें, प्रिंट करें एवं निरस्त करें
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsVerifyOpen(true)}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>सत्यापन जाँच</span>
          </button>
          <button
            onClick={() => setIsIssueOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>नया प्रमाणपत्र जारी करें</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="विद्यार्थी का नाम, अनुक्रमांक या प्रमाणपत्र ID से खोजें..."
          className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-xs text-slate-400 hover:text-slate-600">
            साफ़ करें
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">प्रमाणपत्र ID</th>
                  <th className="py-3 px-4">विद्यार्थी</th>
                  <th className="py-3 px-4">पाठ्यक्रम</th>
                  <th className="py-3 px-4 text-center">गति एवं सटीकता</th>
                  <th className="py-3 px-4 text-center">श्रेणी</th>
                  <th className="py-3 px-4 text-center">स्थिति</th>
                  <th className="py-3 px-4 text-right">कार्य (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {cert.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 font-devanagari">
                        {cert.studentName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Roll: {cert.studentRollNo || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <div>{cert.courseName}</div>
                      <div className="text-[10px] text-slate-400">{cert.language} • {cert.keyboardLayout}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-black text-slate-900 dark:text-slate-100">
                        {cert.netWpm} WPM
                      </span>
                      <span className="text-slate-400 text-[10px] block">
                        ({cert.accuracy}% Acc)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full font-black text-amber-800 bg-amber-100 border border-amber-300 text-[11px]">
                        {cert.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          cert.status === 'valid'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {cert.status === 'valid' ? 'वैध (Valid)' : 'निरस्त (Revoked)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedCert(cert);
                            setIsPreviewOpen(true);
                          }}
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600"
                          title="पूर्वावलोकन एवं प्रिंट"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {cert.status === 'valid' && (
                          <button
                            onClick={() => {
                              setRevokingCertId(cert.id);
                              setRevocationReason('');
                            }}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600"
                            title="प्रमाणपत्र निरस्त करें"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-400">
            कोई प्रमाणपत्र रिकॉर्ड नहीं मिला। &apos;नया प्रमाणपत्र जारी करें&apos; बटन पर क्लिक करके जारी करें।
          </div>
        )}
      </div>

      {/* Revocation Prompt Modal */}
      {revokingCertId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-rose-600 flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5" />
              <span>प्रमाणपत्र निरस्त करें (Revoke Certificate)</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              प्रमाणपत्र संख्या <strong>{revokingCertId}</strong> को निरस्त करने का कारण दर्ज करें:
            </p>
            <textarea
              value={revocationReason}
              onChange={(e) => setRevocationReason(e.target.value)}
              placeholder="उदा. पुनः परीक्षा में विफल, अनधिकृत रिकॉर्ड..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs mb-4 focus:outline-hidden"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRevokingCertId(null)}
                className="px-3 py-1.5 rounded-lg border text-xs font-semibold text-slate-600"
              >
                रद्द करें
              </button>
              <button
                onClick={handleRevoke}
                disabled={!revocationReason.trim()}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50"
              >
                निरस्त की पुष्टि करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Modal */}
      <CertificateIssueModal
        authSession={authSession}
        isOpen={isIssueOpen}
        onClose={() => setIsIssueOpen(false)}
        onCertificateIssued={(newCert) => {
          loadCertificates();
          setSelectedCert(newCert);
          setIsPreviewOpen(true);
        }}
      />

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
