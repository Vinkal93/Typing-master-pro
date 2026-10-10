import { describe, it, expect, beforeEach } from 'vitest';
import { ProgressionService } from '@/services/lms/progressionService';
import { CurriculumService } from '@/services/curriculum/curriculumService';
import { StudentLessonProgress, LmsTeacherSettings } from '@/types/lms';

describe('Phase 3: ProgressionService Unlocks and Evaluations', () => {
  const lesson1 = CurriculumService.getLessonByGlobalIndex(1)!;
  const lesson2 = CurriculumService.getLessonByGlobalIndex(2)!;
  const lesson3 = CurriculumService.getLessonByGlobalIndex(3)!;

  it('should always unlock Lesson 1 for any student', () => {
    const isUnlocked = ProgressionService.isLessonUnlocked(lesson1, []);
    expect(isUnlocked).toBe(true);
  });

  it('should lock Lesson 2 if Lesson 1 is not completed', () => {
    const isUnlocked = ProgressionService.isLessonUnlocked(lesson2, []);
    expect(isUnlocked).toBe(false);
  });

  it('should unlock Lesson 2 once Lesson 1 is completed', () => {
    const progress: StudentLessonProgress[] = [
      {
        id: `p1_${lesson1.id}`,
        profileId: 'p1',
        lessonId: lesson1.id,
        levelId: 1,
        isUnlocked: true,
        isCompleted: true,
        stageReached: 'completed',
        bestAccuracy: 95,
        bestNetWpm: 12,
        attemptsCount: 1,
        lastAttemptAt: Date.now(),
      },
    ];

    const isUnlocked = ProgressionService.isLessonUnlocked(lesson2, progress);
    expect(isUnlocked).toBe(true);
  });

  it('should unlock all lessons if teacher override is enabled', () => {
    const teacherSettings: LmsTeacherSettings = {
      unlockAllLessons: true,
      customLevelThresholds: {} as any,
    };

    const isUnlocked = ProgressionService.isLessonUnlocked(lesson3, [], teacherSettings);
    expect(isUnlocked).toBe(true);
  });

  it('should correctly evaluate passing criteria based on thresholds', () => {
    // Lesson 1 requires 85% accuracy
    const resultFail = ProgressionService.evaluateStage(lesson1, 'test', { accuracy: 82, netWpm: 10 });
    expect(resultFail.passed).toBe(false);

    const resultPass = ProgressionService.evaluateStage(lesson1, 'test', { accuracy: 88, netWpm: 10 });
    expect(resultPass.passed).toBe(true);
  });

  it('should support teacher custom thresholds', () => {
    const teacherSettings: LmsTeacherSettings = {
      unlockAllLessons: false,
      customLevelThresholds: {
        1: { minAccuracy: 95, minWpm: 10 },
      } as any,
    };

    // 88% would pass default (85%), but fails teacher's 95%
    const res = ProgressionService.evaluateStage(lesson1, 'test', { accuracy: 88, netWpm: 15 }, teacherSettings);
    expect(res.passed).toBe(false);
    expect(res.requiredAccuracy).toBe(95);
  });

  it('should compute summary metrics correctly', () => {
    const progress: StudentLessonProgress[] = [
      {
        id: `p1_${lesson1.id}`,
        profileId: 'p1',
        lessonId: lesson1.id,
        levelId: 1,
        isUnlocked: true,
        isCompleted: true,
        stageReached: 'completed',
        bestAccuracy: 96,
        bestNetWpm: 18,
        attemptsCount: 1,
        lastAttemptAt: Date.now(),
      },
    ];

    const summary = ProgressionService.computeSummary('p1', progress);
    expect(summary.totalCompleted).toBe(1);
    expect(summary.totalRemaining).toBe(159);
    expect(summary.currentLessonId).toBe(lesson2.id);
    expect(summary.averageAccuracy).toBe(96);
    expect(summary.averageWpm).toBe(18);
  });
});
