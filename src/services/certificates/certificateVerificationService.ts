import { storageService } from '../storage/storageService';
import { CertificateVerificationResult } from '@/types/analytics';
import { CryptoService } from '../security/cryptoService';

export class CertificateVerificationService {
  /**
   * Verifies authenticity, integrity, and revocation status of a certificate completely offline.
   * Note: QR codes or printed copies alone do NOT guarantee authenticity without validating
   * the cryptographic digital signature against the institutional ledger.
   */
  public static async verifyCertificate(
    certificateId: string
  ): Promise<CertificateVerificationResult> {
    const trimmedId = certificateId.trim().toUpperCase();
    const adapter = await storageService.getAdapter();

    const cert = await adapter.getCertificateById(trimmedId);
    if (!cert) {
      return {
        isValid: false,
        certificateId: trimmedId,
        isTampered: false,
        message: `प्रमाणपत्र संख्या "${trimmedId}" संस्थान के ऑफलाइन डेटाबेस में नहीं मिली। (Certificate not found in registry)`,
      };
    }

    // Check revocation status
    const revocation = await adapter.getCertificateRevocation(trimmedId);
    if (revocation || cert.status === 'revoked') {
      return {
        isValid: false,
        certificateId: trimmedId,
        certificate: cert,
        revocation: revocation || {
          certificateId: trimmedId,
          revokedAt: cert.issuedAt,
          revokedByUserId: 'admin',
          revokedByUserName: 'Administrator',
          reason: 'Administrative revocation.',
        },
        isTampered: false,
        message: `यह प्रमाणपत्र निरस्त (Revoked) कर दिया गया है। कारण: ${revocation?.reason || 'प्रशासनिक आदेश'}`,
      };
    }

    // Verify cryptographic SHA-256 signature to guarantee zero tampering
    const expectedPayload = `${cert.id}|${cert.studentName}|${cert.studentRollNo || ''}|${cert.courseName}|${cert.netWpm}|${cert.accuracy}|${cert.issuedAt}|${cert.grade}`;
    const calculatedSignature = await CryptoService.hashSecret(expectedPayload, 'CERT_INTEGRITY_SALT');

    const isMatch = CryptoService.constantTimeCompare(
      cert.digitalSignatureSha256,
      calculatedSignature
    );

    if (!isMatch) {
      return {
        isValid: false,
        certificateId: trimmedId,
        certificate: cert,
        isTampered: true,
        message: 'डिजिटल हस्ताक्षर विसंगति पाई गई! प्रमाणपत्र डेटा में अनधिकृत फेरबदल हुआ है। (Cryptographic signature mismatch — Record is tampered)',
      };
    }

    return {
      isValid: true,
      certificateId: trimmedId,
      certificate: cert,
      isTampered: false,
      message: 'प्रमाणपत्र पूर्णतः प्रामाणिक एवं वैध है। (Certificate verified & authentic)',
    };
  }
}
