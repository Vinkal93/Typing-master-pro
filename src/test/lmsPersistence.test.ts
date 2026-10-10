import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { IndexedDBStorageAdapter } from '@/services/storage/indexedDbAdapter';
import { StudentLessonProgress, CharacterMistakeStat, LmsTeacherSettings } from '@/types/lms';

describe('Phase 3: LMS Storage Persistence (IndexedDB)', () => {
  let adapter: IndexedDBStorageAdapter;

  beforeEach(async () => {
    adapter = new IndexedDBStorageAdapter();
    await adapter.init();
  });

  it('should persist and retrieve student lesson progress without data loss', async () => {
    const progress: StudentLessonProgress = {
      id: 'student_123_l1_01_right_index_ra',
      profileId: 'student_123',
      lessonId: 'l1_01_right_index_ra',
      levelId: 1,
      isUnlocked: true,
      isCompleted: true,
      stageReached: 'completed',
      bestAccuracy: 98.5,
      bestNetWpm: 24,
      attemptsCount: 3,
      lastAttemptAt: Date.now(),
      completedAt: Date.now(),
    };

    await adapter.saveLessonProgress(progress);
    const retrieved = await adapter.getLessonProgressById('student_123', 'l1_01_right_index_ra');

    expect(retrieved).not.toBeNull();
    expect(retrieved?.bestAccuracy).toBe(98.5);
    expect(retrieved?.isCompleted).toBe(true);
    expect(retrieved?.attemptsCount).toBe(3);

    const list = await adapter.getLessonProgress('student_123');
    expect(list).toHaveLength(1);
    expect(list[0].lessonId).toBe('l1_01_right_index_ra');
  });

  it('should persist and retrieve character mistake statistics', async () => {
    const stats: CharacterMistakeStat[] = [
      {
        profileId: 'student_123',
        char: 'क',
        keyCode: 'KeyK',
        errorCount: 7,
        totalAttempts: 25,
        lastErrorAt: Date.now(),
      },
      {
        profileId: 'student_123',
        char: 'ष',
        keyCode: 'Shift+KeyComma',
        errorCount: 12,
        totalAttempts: 15,
        lastErrorAt: Date.now(),
      },
    ];

    await adapter.saveMistakeStats(stats);
    const retrieved = await adapter.getMistakeStats('student_123');

    expect(retrieved).toHaveLength(2);
    const sorted = retrieved.sort((a, b) => b.errorCount - a.errorCount);
    expect(sorted[0].char).toBe('ष');
    expect(sorted[0].errorCount).toBe(12);
  });

  it('should persist and retrieve teacher settings', async () => {
    const customSettings: LmsTeacherSettings = {
      unlockAllLessons: true,
      customLevelThresholds: {
        1: { minAccuracy: 90, minWpm: 10 },
        2: { minAccuracy: 92, minWpm: 15 },
        3: { minAccuracy: 94, minWpm: 20 },
        4: { minAccuracy: 96, minWpm: 25 },
        5: { minAccuracy: 97, minWpm: 30 },
        6: { minAccuracy: 98, minWpm: 35 },
      },
    };

    await adapter.saveTeacherSettings(customSettings);
    const retrieved = await adapter.getTeacherSettings();

    expect(retrieved.unlockAllLessons).toBe(true);
    expect(retrieved.customLevelThresholds[1].minAccuracy).toBe(90);
  });
});
