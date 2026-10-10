import { describe, it, expect } from 'vitest';
import { HeatmapService } from '@/services/analytics/heatmapService';

describe('Phase 6: Keyboard Heatmap & Weak Key Diagnostics', () => {
  const profileId = 'heatmap_test_student_01';

  it('should record key attempts and calculate accuracy and latency', async () => {
    // Record 8 correct presses on KeyK ('क')
    for (let i = 0; i < 8; i++) {
      await HeatmapService.recordKeyAttempt(
        profileId,
        'hindi_inscript',
        'KeyK',
        'क',
        'क',
        true,
        200
      );
    }

    // Record 2 incorrect presses on KeyK (typing 'म' instead)
    await HeatmapService.recordKeyAttempt(
      profileId,
      'hindi_inscript',
      'KeyK',
      'क',
      'म',
      false,
      350
    );
    await HeatmapService.recordKeyAttempt(
      profileId,
      'hindi_inscript',
      'KeyK',
      'क',
      'म',
      false,
      320
    );

    const stats = await HeatmapService.getKeyStats(profileId, 'hindi_inscript');
    const keyK = stats.find((s) => s.code === 'KeyK');

    expect(keyK).toBeDefined();
    expect(keyK?.totalAttempts).toBe(10);
    expect(keyK?.correctAttempts).toBe(8);
    expect(keyK?.incorrectAttempts).toBe(2);
    expect(keyK?.accuracyPct).toBe(80); // 8/10 = 80%
    expect(keyK?.repeatedMistakes['म']).toBe(2);
  });

  it('should identify weak keys with high error rate and assign severity', async () => {
    // Record 5 attempts on KeyM ('म') with 4 errors (20% accuracy)
    for (let i = 0; i < 4; i++) {
      await HeatmapService.recordKeyAttempt(
        profileId,
        'hindi_inscript',
        'KeyM',
        'म',
        'न',
        false,
        400
      );
    }
    await HeatmapService.recordKeyAttempt(
      profileId,
      'hindi_inscript',
      'KeyM',
      'म',
      'म',
      true,
      300
    );

    const weakKeys = await HeatmapService.getWeakKeys(profileId, 'hindi_inscript', 5, 85);
    expect(weakKeys.length).toBeGreaterThan(0);

    const keyM = weakKeys.find((w) => w.code === 'KeyM');
    expect(keyM).toBeDefined();
    expect(keyM?.accuracyPct).toBe(20);
    expect(keyM?.severity).toBe('critical'); // < 70% is critical
    expect(keyM?.topConfusions[0].typed).toBe('न');
  });

  it('should produce appropriate color tokens for heatmap states', () => {
    const perfectStat = {
      id: '1',
      profileId: 'p1',
      layout: 'hindi_inscript' as const,
      code: 'KeyA',
      char: 'ो',
      totalAttempts: 20,
      correctAttempts: 20,
      incorrectAttempts: 0,
      accuracyPct: 100,
      avgResponseTimeMs: 180,
      repeatedMistakes: {},
      lastTrainedAt: Date.now(),
    };

    const color = HeatmapService.getHeatmapColorClass(perfectStat);
    expect(color.bg).toContain('emerald-500');

    const emptyColor = HeatmapService.getHeatmapColorClass(undefined);
    expect(emptyColor.label).toContain('Untrained');
  });
});
