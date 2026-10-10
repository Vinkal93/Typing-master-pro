import { describe, it, expect } from 'vitest';
import { storageService } from '@/services/storage/storageService';
import {
  KeyHeatmapStat,
  StudentAchievement,
  CertificateRecord,
  PracticeRecommendation,
} from '@/types/analytics';

describe('Phase 6: Persistence & Storage Schema Upgrade (IndexedDB v5)', () => {
  const profileId = 'p6_persistence_student';

  it('should persist and retrieve key heatmap stats without data loss', async () => {
    const adapter = await storageService.getAdapter();

    const stat: KeyHeatmapStat = {
      id: `${profileId}_hindi_inscript_KeyK`,
      profileId,
      layout: 'hindi_inscript',
      code: 'KeyK',
      char: 'क',
      totalAttempts: 25,
      correctAttempts: 22,
      incorrectAttempts: 3,
      accuracyPct: 88,
      avgResponseTimeMs: 240,
      repeatedMistakes: { 'म': 2, 'न': 1 },
      lastTrainedAt: Date.now(),
    };

    await adapter.saveKeyHeatmapStat(stat);

    const retrieved = await adapter.getKeyHeatmapStats(profileId, 'hindi_inscript');
    expect(retrieved.length).toBeGreaterThanOrEqual(1);

    const found = retrieved.find((s) => s.code === 'KeyK');
    expect(found).toBeDefined();
    expect(found?.accuracyPct).toBe(88);
    expect(found?.totalAttempts).toBe(25);
    expect(found?.repeatedMistakes['म']).toBe(2);
  });

  it('should persist and retrieve student achievements and custom milestone settings', async () => {
    const adapter = await storageService.getAdapter();

    const achievement: StudentAchievement = {
      id: `${profileId}_SPEED_40`,
      profileId,
      achievementCode: 'SPEED_40',
      achievementTitle: 'Speed Specialist',
      achievementTitleHindi: 'गति प्रवीण',
      category: 'speed',
      tier: 'gold',
      unlockedAt: Date.now(),
      metricValueAtUnlock: 42,
      viewed: false,
    };

    await adapter.saveStudentAchievement(achievement);

    const list = await adapter.getStudentAchievements(profileId);
    expect(list.length).toBeGreaterThanOrEqual(1);

    const found = list.find((a) => a.achievementCode === 'SPEED_40');
    expect(found).toBeDefined();
    expect(found?.metricValueAtUnlock).toBe(42);

    // Test milestone settings
    const settings = await adapter.getAchievementSettings();
    expect(settings).toBeDefined();
    expect(settings.minSpeedBronze).toBe(20);

    // Save customized setting
    await adapter.saveAchievementSettings({
      ...settings,
      minSpeedBronze: 22,
      updatedAt: Date.now(),
    });

    const updated = await adapter.getAchievementSettings();
    expect(updated.minSpeedBronze).toBe(22);
  });

  it('should persist, retrieve, and revoke certificates in persistent storage', async () => {
    const adapter = await storageService.getAdapter();

    const cert: CertificateRecord = {
      id: 'TMP-CERT-2026-PERSIST1',
      profileId,
      studentName: 'Vikram Rajput',
      studentRollNo: 'TMP-VR-09',
      instituteName: 'Central Polytechnic Institute',
      courseName: 'Hindi InScript Diploma',
      language: 'Hindi',
      keyboardLayout: 'Hindi InScript',
      grossWpm: 48,
      netWpm: 45,
      accuracy: 96,
      grade: 'A',
      examAttemptId: 'exam_p6_01',
      examTitle: 'Final Diploma Test',
      issuedAt: Date.now(),
      issuedByTeacherName: 'Admin',
      issuedByTeacherId: 'user_admin_root',
      authorizedSignatureTitle: 'Principal',
      status: 'valid',
      template: 'classic_gold',
      digitalSignatureSha256: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
      qrVerificationPayload: '{}',
    };

    await adapter.saveCertificate(cert);

    const retrievedCert = await adapter.getCertificateById('TMP-CERT-2026-PERSIST1');
    expect(retrievedCert).toBeDefined();
    expect(retrievedCert?.studentName).toBe('Vikram Rajput');
    expect(retrievedCert?.status).toBe('valid');

    // Revoke
    await adapter.saveCertificateRevocation({
      certificateId: 'TMP-CERT-2026-PERSIST1',
      revokedAt: Date.now(),
      revokedByUserId: 'user_admin_root',
      revokedByUserName: 'Admin',
      reason: 'Administrative verification audit',
    });

    const postRevocation = await adapter.getCertificateById('TMP-CERT-2026-PERSIST1');
    expect(postRevocation?.status).toBe('revoked');

    const revRecord = await adapter.getCertificateRevocation('TMP-CERT-2026-PERSIST1');
    expect(revRecord?.reason).toBe('Administrative verification audit');
  });

  it('should export and import Phase 6 datasets with version 5 schema', async () => {
    const adapter = await storageService.getAdapter();
    const exportedJson = await adapter.exportAllData();
    expect(exportedJson).toBeDefined();

    const parsed = JSON.parse(exportedJson);
    expect(parsed.version).toBe(5);
    expect(parsed.certificates).toBeDefined();
    expect(parsed.keyHeatmapStats).toBeDefined();
    expect(parsed.studentAchievements).toBeDefined();
  });
});
