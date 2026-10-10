import { storageService } from '../storage/storageService';
import {
  CertificateRecord,
  CertificateGrade,
  CertificateRevocation,
  CertificateTemplateType,
} from '@/types/analytics';
import { ExamAttemptRecord } from '@/types/exam';
import { CryptoService } from '../security/cryptoService';

export class CertificateService {
  /**
   * Verifies if an exam attempt record qualifies for an official typing certificate.
   * Rejects unverified, incomplete, or failing test results.
   */
  public static isExamQualifying(exam: ExamAttemptRecord): {
    qualifies: boolean;
    reason?: string;
    grade?: CertificateGrade;
  } {
    if (!exam.passed) {
      return { qualifies: false, reason: 'Examination was not marked as passed.' };
    }

    const netWpm = exam.scoring?.netWpm || 0;
    const accuracy = exam.scoring?.accuracy || 0;

    // Minimum institutional standard for certification: 25 Net WPM and 85% Accuracy
    if (netWpm < 25) {
      return { qualifies: false, reason: `Net speed (${netWpm} WPM) is below minimum certified threshold of 25 WPM.` };
    }

    if (accuracy < 85) {
      return { qualifies: false, reason: `Accuracy (${accuracy}%) is below minimum certified threshold of 85%.` };
    }

    const grade = this.calculateGrade(netWpm, accuracy);
    return { qualifies: true, grade };
  }

  /**
   * Calculates grade based on Net WPM and Accuracy standards.
   */
  public static calculateGrade(netWpm: number, accuracy: number): CertificateGrade {
    if (netWpm >= 50 && accuracy >= 98) return 'A+';
    if (netWpm >= 40 && accuracy >= 95) return 'A';
    if (netWpm >= 30 && accuracy >= 90) return 'B';
    if (netWpm >= 25 && accuracy >= 85) return 'C';
    return 'Pass';
  }

  /**
   * Issues a new tamper-evident certificate from a qualifying exam attempt.
   */
  public static async issueCertificate(params: {
    examAttempt: ExamAttemptRecord;
    courseName: string;
    instituteName?: string;
    instituteAddress?: string;
    issuedByTeacherName: string;
    issuedByTeacherId: string;
    authorizedSignatureTitle?: string;
    template?: CertificateTemplateType;
  }): Promise<CertificateRecord> {
    const { examAttempt, courseName } = params;

    const qualification = this.isExamQualifying(examAttempt);
    if (!qualification.qualifies) {
      throw new Error(`Cannot issue certificate: ${qualification.reason}`);
    }

    const adapter = await storageService.getAdapter();
    const instSettings = await adapter.getInstituteSettings();

    const year = new Date().getFullYear();
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const certId = `TMP-CERT-${year}-${randomSuffix}`;
    const issuedAt = Date.now();
    const grade = qualification.grade || 'Pass';
    const instituteName = params.instituteName || instSettings.instituteName || 'Typing Master Pro Central Institute';
    const instituteAddress = params.instituteAddress || instSettings.address || 'Computer Education Complex';
    const authorizedSignatureTitle = params.authorizedSignatureTitle || 'Authorized Examination Controller';

    // Compute cryptographic SHA-256 integrity signature
    const signaturePayload = `${certId}|${examAttempt.studentName}|${examAttempt.studentRollNo || ''}|${courseName}|${examAttempt.scoring.netWpm}|${examAttempt.scoring.accuracy}|${issuedAt}|${grade}`;
    const digitalSignatureSha256 = await CryptoService.hashSecret(signaturePayload, 'CERT_INTEGRITY_SALT');

    const qrVerificationPayload = JSON.stringify({
      id: certId,
      name: examAttempt.studentName,
      wpm: Math.round(examAttempt.scoring.netWpm),
      acc: Math.round(examAttempt.scoring.accuracy),
      grade,
      sig: digitalSignatureSha256.substring(0, 16),
    });

    const certificate: CertificateRecord = {
      id: certId,
      profileId: examAttempt.profileId,
      studentName: examAttempt.studentName,
      studentRollNo: examAttempt.studentRollNo,
      instituteName,
      instituteAddress,
      courseName,
      language: examAttempt.language,
      keyboardLayout: examAttempt.layout,
      grossWpm: Math.round(examAttempt.scoring.grossWpm),
      netWpm: Math.round(examAttempt.scoring.netWpm),
      accuracy: Math.round(examAttempt.scoring.accuracy * 10) / 10,
      grade,
      examAttemptId: examAttempt.id,
      examTitle: examAttempt.presetTitle || examAttempt.passageTitle,
      issuedAt,
      issuedByTeacherName: params.issuedByTeacherName,
      issuedByTeacherId: params.issuedByTeacherId,
      authorizedSignatureTitle,
      status: 'valid',
      template: params.template || 'classic_gold',
      digitalSignatureSha256,
      qrVerificationPayload,
    };

    await adapter.saveCertificate(certificate);

    // Save audit log
    await adapter.saveAuditLog({
      id: `audit_cert_issue_${Date.now()}`,
      timestamp: Date.now(),
      userId: params.issuedByTeacherId,
      userName: params.issuedByTeacherName,
      userRole: 'teacher',
      action: 'CERTIFICATE_ISSUED',
      details: `Issued certificate ${certId} to student ${examAttempt.studentName} (Grade: ${grade}, Net WPM: ${certificate.netWpm})`,
    });

    return certificate;
  }

  /**
   * Revokes an existing certificate with reason.
   */
  public static async revokeCertificate(params: {
    certificateId: string;
    revokedByUserId: string;
    revokedByUserName: string;
    userRole?: 'admin' | 'teacher';
    reason: string;
  }): Promise<void> {
    const adapter = await storageService.getAdapter();
    const cert = await adapter.getCertificateById(params.certificateId);
    if (!cert) {
      throw new Error(`Certificate with ID ${params.certificateId} not found.`);
    }

    const revocation: CertificateRevocation = {
      certificateId: params.certificateId,
      revokedAt: Date.now(),
      revokedByUserId: params.revokedByUserId,
      revokedByUserName: params.revokedByUserName,
      reason: params.reason,
    };

    await adapter.saveCertificateRevocation(revocation);

    // Save audit log
    await adapter.saveAuditLog({
      id: `audit_cert_revoke_${Date.now()}`,
      timestamp: Date.now(),
      userId: params.revokedByUserId,
      userName: params.revokedByUserName,
      userRole: params.userRole || 'admin',
      action: 'CERTIFICATE_REVOKED',
      details: `Revoked certificate ${params.certificateId}. Reason: ${params.reason}`,
    });
  }

  /**
   * Retrieves all certificates or certificates for a specific student profile.
   */
  public static async getCertificates(profileId?: string): Promise<CertificateRecord[]> {
    const adapter = await storageService.getAdapter();
    return adapter.getCertificates(profileId);
  }

  /**
   * Retrieves a single certificate by its unique identifier.
   */
  public static async getCertificateById(id: string): Promise<CertificateRecord | null> {
    const adapter = await storageService.getAdapter();
    return adapter.getCertificateById(id);
  }

  /**
   * Generates printable A4 HTML for the certificate.
   */
  public static generatePrintableCertificateHtml(cert: CertificateRecord): string {
    const issueDateStr = new Date(cert.issuedAt).toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
      <!DOCTYPE html>
      <html lang="hi">
      <head>
        <meta charset="utf-8"/>
        <title>प्रमाणपत्र — ${cert.studentName} (${cert.id})</title>
        <style>
          @page { size: A4 landscape; margin: 0; }
          body {
            margin: 0;
            padding: 24px;
            font-family: 'Mangal', 'Noto Sans Devanagari', 'Segoe UI', sans-serif;
            background-color: #f8fafc;
            color: #0f172a;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .cert-container {
            width: 100%;
            height: calc(100vh - 48px);
            box-sizing: border-box;
            border: 12px double #b45309;
            background: #ffffff;
            padding: 32px 48px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            text-align: center;
            position: relative;
          }
          .cert-header {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 16px;
          }
          .inst-title {
            font-size: 26px;
            font-weight: 800;
            color: #92400e;
            letter-spacing: 1px;
            margin: 0;
          }
          .inst-sub {
            font-size: 13px;
            color: #64748b;
            margin-top: 4px;
          }
          .cert-badge {
            display: inline-block;
            margin-top: 14px;
            padding: 6px 20px;
            background: #fef3c7;
            color: #92400e;
            font-size: 18px;
            font-weight: bold;
            border-radius: 9999px;
            border: 1px solid #fde68a;
          }
          .cert-body {
            margin: 20px 0;
          }
          .cert-text {
            font-size: 16px;
            color: #475569;
            margin-bottom: 8px;
          }
          .student-name {
            font-size: 32px;
            font-weight: 900;
            color: #1e293b;
            text-decoration: underline;
            text-underline-offset: 8px;
            margin: 12px 0;
          }
          .course-name {
            font-size: 20px;
            font-weight: 700;
            color: #b45309;
          }
          .stats-grid {
            display: flex;
            justify-content: center;
            gap: 32px;
            margin: 20px 0;
          }
          .stat-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 24px;
          }
          .stat-val {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
          }
          .stat-lbl {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
          }
          .cert-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-top: 2px solid #e2e8f0;
            padding-top: 16px;
          }
          .sig-box {
            text-align: center;
            width: 220px;
          }
          .sig-line {
            border-top: 1px solid #334155;
            margin-top: 36px;
            padding-top: 4px;
            font-size: 13px;
            font-weight: 600;
            color: #334155;
          }
          .cert-meta {
            text-align: left;
            font-size: 11px;
            color: #64748b;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="cert-container">
          <div class="cert-header">
            <h1 class="inst-title">${cert.instituteName}</h1>
            <div class="inst-sub">${cert.instituteAddress || ''}</div>
            <div class="cert-badge">प्रमाणपत्र / CERTIFICATE OF PROFICIENCY</div>
          </div>

          <div class="cert-body">
            <div class="cert-text">प्रमाणित किया जाता है कि छात्र/छात्रा / This is to certify that</div>
            <div class="student-name">${cert.studentName}</div>
            <div class="cert-text">अनुक्रमांक / Roll No: <strong>${cert.studentRollNo || 'N/A'}</strong></div>
            <div class="cert-text" style="margin-top: 14px;">ने सफलता पूर्वक टंकण पाठ्यक्रम उत्तीर्ण किया है:</div>
            <div class="course-name">${cert.courseName} (${cert.language} — ${cert.keyboardLayout})</div>

            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-val">${cert.netWpm} WPM</div>
                <div class="stat-lbl">शुद्ध गति (Net Speed)</div>
              </div>
              <div class="stat-box">
                <div class="stat-val">${cert.accuracy}%</div>
                <div class="stat-lbl">सटीकता (Accuracy)</div>
              </div>
              <div class="stat-box">
                <div class="stat-val" style="color: #b45309;">${cert.grade}</div>
                <div class="stat-lbl">श्रेणी (Grade)</div>
              </div>
            </div>
          </div>

          <div class="cert-footer">
            <div class="cert-meta">
              <div><strong>प्रमाणपत्र संख्या / Cert ID:</strong> ${cert.id}</div>
              <div><strong>जारी तिथि / Issue Date:</strong> ${issueDateStr}</div>
              <div><strong>डिजिटल सत्यापन / SHA-256:</strong> ${cert.digitalSignatureSha256.substring(0, 24)}...</div>
            </div>

            <div class="sig-box">
              <div class="sig-line">
                <div>${cert.issuedByTeacherName}</div>
                <div style="font-size: 11px; color: #64748b;">${cert.authorizedSignatureTitle}</div>
              </div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;
  }
}
