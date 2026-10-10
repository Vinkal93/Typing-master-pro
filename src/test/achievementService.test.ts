import { describe, it, expect, beforeEach } from 'vitest';
import { AchievementService } from '@/services/achievements/achievementService';
import { storageService } from '@/services/storage/storageService';
import { ExamAttemptRecord } from '@/types/exam';

describe('Phase 6: Achievement System & Duplicate Prevention', () => {
  const profileId = 'ach_test_student_01';

  beforeEach(async () => {
    const adapter = await storageService.getAdapter();
    // Seed an exam with 35 WPM and 96% accuracy
    const exam: ExamAttemptRecord = {
      id: `${profileId}_exam_ach`,
      profileId,
      studentName: 'Pooja Verma',
      presetTitle: 'SSC CHSL Drill',
      passageId: 'pass_01',
      passageTitle: 'General Passage',
      language: 'Hindi',
      layout: 'Hindi InScript',
      mode: 'strict_exam',
      backspacePolicy: 'allowed',
      scoringPolicy: 'standard',
      targetDurationSeconds: 300,
      actualDurationSeconds: 300,
      scoring: {
        grossWpm: 38,
        netWpm: 35,
        cpm: 190,
        accuracy: 96,
        totalWordsTyped: 190,
        totalExpectedWords: 200,
        totalCharsTyped: 950,
        totalExpectedChars: 1000,
        correctChars: 912,
        incorrectChars: 38,
        omissions: 0,
        insertions: 0,
        substitutions: 38,
        backspaceCount: 5,
        targetDurationSeconds: 300,
        actualDurationSeconds: 300,
        completionPercentage: 95,
        passed: true,
        scoringPolicy: 'standard',
        formulaExplanation: '',
        diffSequence: [],
      },
      passed: true,
      completedAt: Date.now(),
      schemaVersion: 1,
    };
    await adapter.saveExamResult(exam);
  });

  it('should evaluate student metrics and award qualifying achievements', async () => {
    const newlyAwarded = await AchievementService.evaluateAndAwardAchievements(profileId);

    expect(newlyAwarded.length).toBeGreaterThan(0);
    const codes = newlyAwarded.map((a) => a.achievementCode);

    // Should unlock FIRST_EXAM
    expect(codes).toContain('FIRST_EXAM');
    // Should unlock SPEED_20 and SPEED_30 (since netWpm = 35)
    expect(codes).toContain('SPEED_20');
    expect(codes).toContain('SPEED_30');
    // Should unlock ACCURACY_90 and ACCURACY_95 (since accuracy = 96%)
    expect(codes).toContain('ACCURACY_90');
    expect(codes).toContain('ACCURACY_95');
    // Should NOT unlock SPEED_40 (since netWpm < 40)
    expect(codes).not.toContain('SPEED_40');
  });

  it('should strictly prevent duplicate achievement awards upon multiple evaluations', async () => {
    // Calling evaluate a second time must return 0 newly awarded achievements
    const secondCallAwarded = await AchievementService.evaluateAndAwardAchievements(profileId);
    expect(secondCallAwarded).toHaveLength(0);

    const adapter = await storageService.getAdapter();
    const stored = await adapter.getStudentAchievements(profileId);

    // Assert that each achievementCode appears exactly once
    const codeCounts = new Map<string, number>();
    stored.forEach((a) => {
      codeCounts.set(a.achievementCode, (codeCounts.get(a.achievementCode) || 0) + 1);
    });

    for (const [code, count] of codeCounts.entries()) {
      expect(count).toBe(1);
    }
  });

  it('should return completion percentage and total unlocked status', async () => {
    const status = await AchievementService.getStudentAchievementStatus(profileId);
    expect(status.totalUnlocked).toBeGreaterThan(0);
    expect(status.completionPct).toBeGreaterThan(0);
    expect(status.allDefinitions.length).toBeGreaterThanOrEqual(14);
  });
});
