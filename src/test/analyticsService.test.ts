import { describe, it, expect, beforeEach } from 'vitest';
import { AnalyticsService } from '@/services/analytics/analyticsService';
import { storageService } from '@/services/storage/storageService';
import { ExamAttemptRecord } from '@/types/exam';

describe('Phase 6: Advanced Student Analytics Service', () => {
  const profileId = 'student_test_analytics_01';

  beforeEach(async () => {
    const adapter = await storageService.getAdapter();
    // Clear exam results for test profile
    const existing = await adapter.getExamResults(profileId);
    for (const ex of existing) {
      // Clean up if needed
    }
  });

  it('should return empty state when student has no attempts', async () => {
    const res = await AnalyticsService.getStudentAnalytics('non_existent_student');
    expect(res.hasData).toBe(false);
    expect(res.totalAttempts).toBe(0);
    expect(res.bestNetWpm).toBe(0);
    expect(res.averageNetWpm).toBe(0);
    expect(res.personalRecords).toHaveLength(0);
  });

  it('should accurately aggregate WPM, accuracy, duration and personal records', async () => {
    const adapter = await storageService.getAdapter();

    const record1: ExamAttemptRecord = {
      id: `${profileId}_exam_1`,
      profileId,
      studentName: 'Aarav Sharma',
      presetTitle: 'MP CPCT Test 1',
      passageId: 'passage_01',
      passageTitle: 'डिजिटल साक्षरता',
      language: 'Hindi',
      layout: 'Hindi InScript',
      mode: 'strict_exam',
      backspacePolicy: 'allowed',
      scoringPolicy: 'standard',
      targetDurationSeconds: 300,
      actualDurationSeconds: 300,
      scoring: {
        grossWpm: 35,
        netWpm: 32,
        cpm: 175,
        accuracy: 94.2,
        totalWordsTyped: 175,
        totalExpectedWords: 200,
        totalCharsTyped: 875,
        totalExpectedChars: 1000,
        correctChars: 830,
        incorrectChars: 45,
        omissions: 0,
        insertions: 0,
        substitutions: 45,
        backspaceCount: 12,
        targetDurationSeconds: 300,
        actualDurationSeconds: 300,
        completionPercentage: 87.5,
        passed: true,
        scoringPolicy: 'standard',
        formulaExplanation: '',
        diffSequence: [],
      },
      passed: true,
      completedAt: Date.now() - 86400000 * 2, // 2 days ago
      schemaVersion: 1,
    };

    const record2: ExamAttemptRecord = {
      id: `${profileId}_exam_2`,
      profileId,
      studentName: 'Aarav Sharma',
      presetTitle: 'Court Test 2',
      passageId: 'passage_02',
      passageTitle: 'न्यायालय आदेश',
      language: 'Hindi',
      layout: 'Hindi InScript',
      mode: 'strict_exam',
      backspacePolicy: 'allowed',
      scoringPolicy: 'standard',
      targetDurationSeconds: 300,
      actualDurationSeconds: 300,
      scoring: {
        grossWpm: 45,
        netWpm: 42,
        cpm: 225,
        accuracy: 97.5,
        totalWordsTyped: 225,
        totalExpectedWords: 250,
        totalCharsTyped: 1125,
        totalExpectedChars: 1250,
        correctChars: 1100,
        incorrectChars: 25,
        omissions: 0,
        insertions: 0,
        substitutions: 25,
        backspaceCount: 5,
        targetDurationSeconds: 300,
        actualDurationSeconds: 300,
        completionPercentage: 90,
        passed: true,
        scoringPolicy: 'standard',
        formulaExplanation: '',
        diffSequence: [],
      },
      passed: true,
      completedAt: Date.now(), // Today
      schemaVersion: 1,
    };

    await adapter.saveExamResult(record1);
    await adapter.saveExamResult(record2);

    const stats = await AnalyticsService.getStudentAnalytics(profileId);

    expect(stats.hasData).toBe(true);
    expect(stats.totalAttempts).toBe(2);
    expect(stats.bestNetWpm).toBe(42);
    expect(stats.bestGrossWpm).toBe(45);
    expect(stats.bestAccuracy).toBe(97.5);
    expect(stats.averageNetWpm).toBe(37); // (32 + 42) / 2
    expect(stats.averageGrossWpm).toBe(40); // (35 + 45) / 2

    // Check personal records
    expect(stats.personalRecords.length).toBeGreaterThan(0);
    const speedRecord = stats.personalRecords.find((r) => r.metric === 'Net WPM');
    expect(speedRecord?.value).toBe(42);

    // Check trend points
    expect(stats.trends).toHaveLength(2);
    expect(stats.trends[1].netWpm).toBe(42);
  });

  it('should filter analytics by language and duration', async () => {
    const statsHindi = await AnalyticsService.getStudentAnalytics(profileId, {
      dateRange: 'all',
      language: 'Hindi',
      durationMinutes: 5,
    });
    expect(statsHindi.hasData).toBe(true);

    const statsEnglish = await AnalyticsService.getStudentAnalytics(profileId, {
      dateRange: 'all',
      language: 'English',
    });
    expect(statsEnglish.hasData).toBe(false);
  });
});
