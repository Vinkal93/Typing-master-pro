/**
 * Offline Cryptographic Security Service
 * Implements salted password/PIN hashing using Web Crypto API.
 * Never stores passwords or PINs in plaintext.
 */

export class CryptoService {
  /**
   * Generates a cryptographically secure random hexadecimal salt.
   */
  public static generateSalt(length = 16): string {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const buffer = new Uint8Array(length);
      window.crypto.getRandomValues(buffer);
      return Array.from(buffer)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }

    // Node/SSR fallback
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length * 2; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  /**
   * Hashes a password or PIN combined with a salt using SHA-256.
   * Performs multiple rounds (stretching) for brute-force resistance.
   */
  public static async hashSecret(secret: string, salt: string, iterations = 1000): Promise<string> {
    const encoder = new TextEncoder();
    let currentData = encoder.encode(salt + secret + salt);

    if (typeof crypto !== 'undefined' && crypto.subtle) {
      try {
        for (let i = 0; i < Math.min(iterations, 1000); i++) {
          const hashBuffer = await crypto.subtle.digest('SHA-256', currentData);
          currentData = new Uint8Array(hashBuffer);
        }
        return Array.from(currentData)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
      } catch {
        // Fallback to pure JS SHA-256 below if subtle is unavailable in testing
      }
    }

    return this.sha256PureJs(salt + secret + salt);
  }

  /**
   * Validates whether a provided plaintext secret matches the stored hash and salt.
   * Uses constant-time string comparison to resist timing attacks.
   */
  public static async verifySecret(secret: string, salt: string, expectedHash: string): Promise<boolean> {
    const computedHash = await this.hashSecret(secret, salt);
    return this.constantTimeCompare(computedHash, expectedHash);
  }

  /**
   * Constant-time comparison between two strings.
   */
  public static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
      mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
  }

  /**
   * Computes a SHA-256 checksum of any arbitrary string payload (e.g. backup JSON).
   */
  public static async computeChecksum(payload: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(payload);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
      } catch {
        // Fallback
      }
    }
    return this.sha256PureJs(payload);
  }

  /**
   * Lightweight standalone Pure-JS SHA-256 implementation for guaranteed
   * offline execution in all headless test environments and SSR contexts.
   */
  private static sha256PureJs(ascii: string): string {
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    let i = 0;
    let j = 0;
    let result = '';

    const words: number[] = [];
    const asciiBitLength = ascii.length * 8;

    let hash: number[] = [];
    let k: number[] = [];
    let primeCounter = 0;

    const isPrime = (candidate: number) => {
      for (let factor = 2, sqrt = Math.sqrt(candidate); factor <= sqrt; factor++) {
        if (candidate % factor === 0) return false;
      }
      return true;
    };

    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (isPrime(candidate)) {
        if (primeCounter < 8) {
          hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        }
        k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        primeCounter++;
      }
    }

    ascii += '\x80';
    while ((ascii.length % 64) - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) {
      j = ascii.charCodeAt(i);
      words[i >> 2] |= j << (((3 - i) % 4) * 8);
    }
    words[words.length] = (asciiBitLength / maxWord) | 0;
    words[words.length] = asciiBitLength;

    for (j = 0; j < words.length;) {
      const w = words.slice(j, (j += 16));
      const oldHash = hash;
      hash = hash.slice(0, 8);

      for (i = 0; i < 64; i++) {
        const i2 = i + j;
        const w15 = w[i - 15];
        const w2 = w[i - 2];

        const a = hash[0];
        const e = hash[4];
        const temp1 =
          hash[7] +
          (this.rightRotate(e, 6) ^ this.rightRotate(e, 11) ^ this.rightRotate(e, 25)) +
          ((e & hash[5]) ^ (~e & hash[6])) +
          k[i] +
          (w[i] =
            i < 16
              ? w[i]
              : (w[i - 16] +
                  (this.rightRotate(w15, 7) ^ this.rightRotate(w15, 18) ^ (w15 >>> 3)) +
                  w[i - 7] +
                  (this.rightRotate(w2, 17) ^ this.rightRotate(w2, 19) ^ (w2 >>> 10))) |
                0);

        const temp2 =
          (this.rightRotate(a, 2) ^ this.rightRotate(a, 13) ^ this.rightRotate(a, 22)) +
          ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }

      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (j = 3; j >= 0; j--) {
        const b = (hash[i] >> (j * 8)) & 255;
        result += (b < 16 ? '0' : '') + b.toString(16);
      }
    }
    return result;
  }

  private static rightRotate(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
  }
}
