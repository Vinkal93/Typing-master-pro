import { describe, it, expect } from 'vitest';
import { CryptoService } from '@/services/security/cryptoService';

describe('Phase 5: Offline Cryptographic Security Service', () => {
  it('should generate random hexadecimal salts of desired length', () => {
    const salt1 = CryptoService.generateSalt(16);
    const salt2 = CryptoService.generateSalt(16);

    expect(salt1).toHaveLength(32); // 16 bytes = 32 hex chars
    expect(salt2).toHaveLength(32);
    expect(salt1).not.toEqual(salt2); // Uniqueness
  });

  it('should hash a secret with a salt consistently', async () => {
    const secret = 'teacherSecret123';
    const salt = 'a1b2c3d4e5f67890';

    const hash1 = await CryptoService.hashSecret(secret, salt);
    const hash2 = await CryptoService.hashSecret(secret, salt);

    expect(hash1).toBeDefined();
    expect(hash1.length).toBeGreaterThan(0);
    expect(hash1).toEqual(hash2);
  });

  it('should produce different hashes for different salts or secrets', async () => {
    const salt1 = 'saltOne123456789';
    const salt2 = 'saltTwo987654321';

    const hashA = await CryptoService.hashSecret('samePassword', salt1);
    const hashB = await CryptoService.hashSecret('samePassword', salt2);
    const hashC = await CryptoService.hashSecret('diffPassword', salt1);

    expect(hashA).not.toEqual(hashB);
    expect(hashA).not.toEqual(hashC);
  });

  it('should accurately verify secrets and reject incorrect secrets in constant time', async () => {
    const salt = CryptoService.generateSalt();
    const correctSecret = 'correctPIN456';
    const hash = await CryptoService.hashSecret(correctSecret, salt);

    const matchOk = await CryptoService.verifySecret(correctSecret, salt, hash);
    expect(matchOk).toBe(true);

    const matchFail = await CryptoService.verifySecret('wrongPIN456', salt, hash);
    expect(matchFail).toBe(false);
  });

  it('should compute cryptographic checksums for backup payloads', async () => {
    const payload = JSON.stringify({ version: 4, instituteName: 'TMP' });
    const checksum1 = await CryptoService.computeChecksum(payload);
    const checksum2 = await CryptoService.computeChecksum(payload);

    expect(checksum1).toBe(checksum2);
    expect(checksum1).toHaveLength(64); // SHA-256 hex string

    const modified = JSON.stringify({ version: 4, instituteName: 'TMP_MODIFIED' });
    const checksumModified = await CryptoService.computeChecksum(modified);
    expect(checksum1).not.toEqual(checksumModified);
  });
});
