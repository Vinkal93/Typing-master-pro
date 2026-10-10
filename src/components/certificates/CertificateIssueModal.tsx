'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  User,
  ShieldCheck,
} from 'lucide-react';
import { storageService } from '@/services/storage/storageService';
import { CertificateService } from '@/services/certificates/certificateService';
import { ExamAttemptRecord } from '@/types/exam';
import { StudentProfile } from '@/types';
import { AuthSession } from '@/types/institute';
import { CertificateRecord, CertificateTemplateType } from '@/types/analytics';

interface CertificateIssueModalProps {
  authSession: AuthSession;
  isOpen: boolean;
  onClose: () => void;
  onCertificateIssued: (cert: CertificateRecord) => void;
}

export const CertificateIssueModal: React.FC<CertificateIssueModalProps> = ({
  authSession,
  isOpen,
  onClose,
  onCertificateIssued,
}) => {
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [studentExams, setStudentExams] = useState<ExamAttemptRecord[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [courseName, setCourseName] = useState('Hindi InScript Professional Typing Course');
  const [template, setTemplate] = useState<CertificateTemplateType>('classic_gold');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchProfiles = async () => {
      const adapter = await storageService.getAdapter();
      const list = await adapter.getProfiles();
      setProfiles(list);
      if (list.length > 0) {
        setSelectedProfileId(list[0].id);
      }
    };
    fetchProfiles();
  }, [isOpen]);

  useEffect(() => {
    if (!selectedProfileId) return;
    const fetchExams = async () => {
      const adapter = await storageService.getAdapter();
      const exams = await adapter.getExamResults(selectedProfileId);
      // Filter passed exams
      const passed = exams.filter((e) => e.passed);
      setStudentExams(passed);
      if (passed.length > 0) {
        setSelectedExamId(passed[0].id);
      } else {
        setSelectedExamId('');
      }
    };
    fetchExams();
  }, [selectedProfileId]);

  if (!isOpen) return null;

  const selectedExam = studentExams.find((e) => e.id === selectedExamId);
  const qualification = selectedExam ? CertificateService.isExamQualifying(selectedExam) : null;

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) {
      setError('कृपया पहले एक उत्तीर्ण परीक्षा चुनें।');
      return;
    }
    if (!qualification?.qualifies) {
      setError(qualification?.reason || 'चयनित परीक्षा प्रमाणन के न्यूनतम मानकों को पूरा नहीं करती।');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const cert = await CertificateService.issueCertificate({
        examAttempt: selectedExam,
        courseName,
        issuedByTeacherName: authSession.user.name,
        issuedByTeacherId: authSession.user.id,
        template,
      });

      onCertificateIssued(cert);
      onClose();
    } catch (err: any) {
      setError(err.message || 'प्रमाणपत्र जारी करने में त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              प्रमाणपत्र जारी करें (Issue Certificate)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleIssue} className="mt-4 space-y-4">
          {/* Student Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              विद्यार्थी का चयन करें (Select Student):
            </label>
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.instituteRollNo ? `(Roll: ${p.instituteRollNo})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Attempt Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              प्रमाणित परीक्षा चयन (Qualifying Exam Attempt):
            </label>
            {studentExams.length > 0 ? (
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {studentExams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.presetTitle || ex.passageTitle} — {ex.scoring.netWpm} WPM ({ex.scoring.accuracy}% Acc) —{' '}
                    {new Date(ex.completedAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">
                इस छात्र के पास अभी कोई उत्तीर्ण परीक्षा रिकॉर्ड उपलब्ध नहीं है।
              </div>
            )}
          </div>

          {/* Qualification Status Callout */}
          {selectedExam && qualification && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                qualification.qualifies
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {qualification.qualifies ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                )}
                <span>
                  {qualification.qualifies
                    ? `पात्रता सत्यापित! श्रेणी (Grade): ${qualification.grade}`
                    : `अपात्र: ${qualification.reason}`}
                </span>
              </div>
              <span className="font-mono font-bold">{selectedExam.scoring.netWpm} WPM</span>
            </div>
          )}

          {/* Course Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              पाठ्यक्रम का नाम (Course Title on Certificate):
            </label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Template Style */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              प्रमाणपत्र टेम्पलेट (Design Template):
            </label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as CertificateTemplateType)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="classic_gold">क्लासिक गोल्ड बॉर्डर (Classic Gold Border)</option>
              <option value="modern_academic">मॉडर्न एकेडमिक (Modern Academic)</option>
              <option value="executive">एग्जीक्यूटिव सील (Executive Corporate)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedExam || !qualification?.qualifies}
            className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>डिजिटल हस्ताक्षर के साथ प्रमाणपत्र जारी करें</span>
          </button>
        </form>
      </div>
    </div>
  );
};
