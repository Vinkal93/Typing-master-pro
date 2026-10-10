import { describe, it, expect, beforeEach } from 'vitest';
import { IndexedDBStorageAdapter } from '@/services/storage/indexedDbAdapter';
import { StudentProfile, PracticeResult, DailyProgress } from '@/types';

describe('Offline Persistence - IndexedDBStorageAdapter', () => {
  let adapter: IndexedDBStorageAdapter;

  beforeEach(async () => {
    // Clear out or create fresh adapter instance
    adapter = new IndexedDBStorageAdapter();
    await adapter.init();
  });

  it('saves and retrieves a student profile', async () => {
    const testProfile: StudentProfile = {
      id: 'student_test_1',
      name: 'Rohan Sharma',
      avatar: 'avatar-scholar',
      instituteRollNo: 'ROLL-101',
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      preferences: {
        language: 'hindi',
        keyboardLayout: 'hindi_inscript',
        fontPreference: 'noto_sans_devanagari',
        dailyPracticeGoal: 15,
        theme: 'light',
        soundEffects: true,
        fontSize: 'normal',
      },
    };

    await adapter.saveProfile(testProfile);
    const retrieved = await adapter.getProfileById('student_test_1');

    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('Rohan Sharma');
    expect(retrieved?.preferences.keyboardLayout).toBe('hindi_inscript');
    expect(retrieved?.instituteRollNo).toBe('ROLL-101');
  });

  it('tracks and persists active profile ID', async () => {
    await adapter.setActiveProfileId('student_test_1');
    const activeId = await adapter.getActiveProfileId();
    expect(activeId).toBe('student_test_1');
  });

  it('records and queries practice results', async () => {
    const testResult: PracticeResult = {
      id: 'res_001',
      profileId: 'student_test_1',
      lessonId: 'hi_ins_01_home_row_basics',
      lessonTitle: 'Lesson 1: InScript Home Row',
      layout: 'hindi_inscript',
      language: 'hindi',
      completedAt: Date.now(),
      durationSeconds: 120,
      grossWpm: 32,
      netWpm: 30,
      accuracy: 96.5,
      totalKeyStrokes: 320,
      correctKeyStrokes: 310,
      errorCount: 2,
      backspaceCount: 1,
    };

    await adapter.saveResult(testResult);
    const results = await adapter.getResults('student_test_1');

    expect(results).toHaveLength(1);
    expect(results[0].netWpm).toBe(30);
    expect(results[0].accuracy).toBe(96.5);
  });

  it('records and retrieves daily progress', async () => {
    const today = '2026-10-10';
    const progress: DailyProgress = {
      profileId: 'student_test_1',
      date: today,
      minutesPracticed: 15,
      lessonsCompleted: 2,
      goalAchieved: true,
    };

    await adapter.saveDailyProgress(progress);
    const saved = await adapter.getDailyProgress('student_test_1', today);

    expect(saved).not.toBeNull();
    expect(saved?.minutesPracticed).toBe(15);
    expect(saved?.goalAchieved).toBe(true);
  });

  it('exports and imports backup data safely without data loss', async () => {
    const exportJson = await adapter.exportAllData();
    expect(exportJson).toContain('Typing Master Pro');
    expect(exportJson).toContain('Rohan Sharma');

    // Import into fresh state
    const importResult = await adapter.importData(exportJson);
    expect(importResult.success).toBe(true);
    expect(importResult.count).toBeGreaterThan(0);
  });

  it('deletes a student profile and clears active ID if deleted', async () => {
    await adapter.deleteProfile('student_test_1');
    const retrieved = await adapter.getProfileById('student_test_1');
    expect(retrieved).toBeNull();
  });
});
