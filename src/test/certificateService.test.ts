import { describe, it, expect } from 'vitest';
import { CertificateService } from '@/services/certificates/certificateService';
import { CertificateVerificationService } from '@/services/certificates/certificateVerificationService';
import { ExamAttemptRecord } from '@/types/exam';

describe('Phase 6: Certificate Management, Digital Signatures & Offline Verification', () => {
  const qualifyingExam: ExamAttemptRecord = {
    id: 'exam_cert_qualify_01',
    profileId: 'student_cert_01',
    studentName: 'Sneha Patel',
    studentRollNo: 'TMP-2026-088',
    presetTitle: 'MP High Court Grade Exam',
    passageId: 'pass_legal_01',
    passageTitle: 'विधि एवं न्याय विधान',
    language: 'Hindi',
    layout: 'Hindi InScript',
    mode: 'strict_exam',
    backspacePolicy: 'allowed',
    scoringPolicy: 'court_exam',
    targetDurationSeconds: 300,
    actualDurationSeconds: 300,
    scoring: {
      grossWpm: 46,
      netWpm: 44,
      cpm: 230,
      accuracy: 96.5,
      totalWordsTyped: 230,
      totalExpectedWords: 240,
      totalCharsTyped: 1150,
      totalExpectedChars: 1200,
      correctChars: 1110,
      incorrectChars: 40,
      omissions: 0,
      insertions: 0,
      substitutions: 40,
      backspaceCount: 4,
      targetDurationSeconds: 300,
      actualDurationSeconds: 300,
      completionPercentage: 95.8,
      passed: true,
      scoringPolicy: 'court_exam',
      formulaExplanation: '',
      diffSequence: [],
    },
    passed: true,
    completedAt: Date.now(),
    schemaVersion: 1,
  };

  const failingExam: ExamAttemptRecord = {
    ...qualifyingExam,
    id: 'exam_cert_fail_02',
    passed: false,
    scoring: {
      ...qualifyingExam.scoring,
      netWpm: 18,
      accuracy: 72,
      passed: false,
    },
  };

  it('should qualify tests with >= 25 WPM and >= 85% accuracy, and reject failing tests', () => {
    const qualCheck = CertificateService.isExamQualifying(qualifyingExam);
    expect(qualCheck.qualifies).toBe(true);
    expect(qualCheck.grade).toBe('A'); // 44 WPM & 96.5% Acc => Grade A

    const failCheck = CertificateService.isExamQualifying(failingExam);
    expect(failCheck.qualifies).toBe(false);
    expect(failCheck.reason).toBeDefined();
  });

  it('should accurately calculate grade categories', () => {
    expect(CertificateService.calculateGrade(55, 99)).toBe('A+');
    expect(CertificateService.calculateGrade(42, 96)).toBe('A');
    expect(CertificateService.calculateGrade(33, 91)).toBe('B');
    expect(CertificateService.calculateGrade(26, 86)).toBe('C');
    expect(CertificateService.calculateGrade(20, 80)).toBe('Pass');
  });

  it('should issue a tamper-evident certificate with unique ID and SHA-256 digital signature', async () => {
    const cert = await CertificateService.issueCertificate({
      examAttempt: qualifyingExam,
      courseName: 'Hindi InScript Professional Typist Diploma',
      issuedByTeacherName: 'Dr. R. K. Gupta',
      issuedByTeacherId: 'teacher_01',
    });

    expect(cert.id).toMatch(/^TMP-CERT-\d{4}-[A-Z0-9]+$/);
    expect(cert.studentName).toBe('Sneha Patel');
    expect(cert.studentRollNo).toBe('TMP-2026-088');
    expect(cert.netWpm).toBe(44);
    expect(cert.accuracy).toBe(96.5);
    expect(cert.grade).toBe('A');
    expect(cert.status).toBe('valid');
    expect(cert.digitalSignatureSha256).toBeDefined();
    expect(cert.digitalSignatureSha256.length).toBeGreaterThan(20);
    expect(cert.qrVerificationPayload).toContain(cert.id);

    // Verify certificate using CertificateVerificationService
    const verification = await CertificateVerificationService.verifyCertificate(cert.id);
    expect(verification.isValid).toBe(true);
    expect(verification.isTampered).toBe(false);
  });

  it('should detect revocation and report proper revocation reason', async () => {
    const cert = await CertificateService.issueCertificate({
      examAttempt: qualifyingExam,
      courseName: 'Hindi InScript Speed Course',
      issuedByTeacherName: 'Instructor Singh',
      issuedByTeacherId: 'teacher_02',
    });

    // Revoke the certificate
    await CertificateService.revokeCertificate({
      certificateId: cert.id,
      revokedByUserId: 'admin_root',
      revokedByUserName: 'Super Admin',
      reason: 'Re-test required under CCTV guidelines',
    });

    // Verify revoked certificate
    const result = await CertificateVerificationService.verifyCertificate(cert.id);
    expect(result.isValid).toBe(false);
    expect(result.revocation).toBeDefined();
    expect(result.revocation?.reason).toContain('CCTV guidelines');
  });

  it('should generate printable A4 HTML with embedded styles', () => {
    const cert = {
      id: 'TMP-CERT-2026-SAMPLE',
      profileId: 'p1',
      studentName: 'Manish Kumar',
      studentRollNo: 'TMP-001',
      instituteName: 'Central Typing Institute',
      courseName: 'Hindi InScript Professional Course',
      language: 'Hindi' as const,
      keyboardLayout: 'Hindi InScript' as const,
      grossWpm: 45,
      netWpm: 42,
      accuracy: 95.5,
      grade: 'A' as const,
      examAttemptId: 'exam_1',
      examTitle: 'Final Exam',
      issuedAt: Date.now(),
      issuedByTeacherName: 'Principal Sharma',
      issuedByTeacherId: 'teacher_01',
      authorizedSignatureTitle: 'Examination Controller',
      status: 'valid' as const,
      template: 'classic_gold' as const,
      digitalSignatureSha256: 'mock_signature_hash',
      qrVerificationPayload: '{}',
    };

    const html = CertificateService.generatePrintableCertificateHtml(cert);
    expect(html).toContain('Manish Kumar');
    expect(html).toContain('TMP-CERT-2026-SAMPLE');
    expect(html).toContain('42 WPM');
    expect(html).toContain('window.print()');
  });
});
