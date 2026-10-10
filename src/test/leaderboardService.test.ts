import { describe, it, expect, beforeEach } from 'vitest';
import { LeaderboardService } from '@/services/leaderboard/leaderboardService';
import { storageService } from '@/services/storage/storageService';
import { StudentProfile } from '@/types';
import { ExamAttemptRecord } from '@/types/exam';

describe('Phase 6: Leaderboard Fairness & Privacy Protections', () => {
  const student1Id = 'lead_student_01';
  const student2Id = 'lead_student_02';
  const studentPrivateId = 'lead_student_private_03';

  beforeEach(async () => {
    const adapter = await storageService.getAdapter();

    // Create 3 student profiles
    const p1: StudentProfile = {
      id: student1Id,
      name: 'Rohan Joshi',
      avatar: 'avatar-scholar',
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
        showOnLeaderboard: true,
      },
    };

    const p2: StudentProfile = {
      id: student2Id,
      name: 'Aditi Rao',
      avatar: 'avatar-scholar',
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      preferences: {
        language: 'hindi',
        keyboardLayout: 'hindi_inscript',
        fontPreference: 'noto_sans_devanagari',
        dailyPracticeGoal: 20,
        theme: 'light',
        soundEffects: true,
        fontSize: 'normal',
        showOnLeaderboard: true,
      },
    };

    const pPrivate: StudentProfile = {
      id: studentPrivateId,
      name: 'Secret Typer',
      avatar: 'avatar-scholar',
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
        showOnLeaderboard: false, // Opted out of public identity
      },
    };

    await adapter.saveProfile(p1);
    await adapter.saveProfile(p2);
    await adapter.saveProfile(pPrivate);

    // Save compatible 5-minute standard exams
    const makeExam = (id: string, profId: string, name: string, netWpm: number, acc: number, durationSec = 300): ExamAttemptRecord => ({
      id,
      profileId: profId,
      studentName: name,
      presetTitle: 'Benchmark 5m',
      passageId: 'pass_01',
      passageTitle: 'Standard Passage',
      language: 'Hindi',
      layout: 'Hindi InScript',
      mode: 'strict_exam',
      backspacePolicy: 'allowed',
      scoringPolicy: 'standard',
      targetDurationSeconds: durationSec,
      actualDurationSeconds: durationSec,
      scoring: {
        grossWpm: netWpm + 2,
        netWpm,
        cpm: netWpm * 5,
        accuracy: acc,
        totalWordsTyped: netWpm * 5,
        totalExpectedWords: 250,
        totalCharsTyped: netWpm * 25,
        totalExpectedChars: 1250,
        correctChars: netWpm * 24,
        incorrectChars: 5,
        omissions: 0,
        insertions: 0,
        substitutions: 5,
        backspaceCount: 2,
        targetDurationSeconds: durationSec,
        actualDurationSeconds: durationSec,
        completionPercentage: 90,
        passed: true,
        scoringPolicy: 'standard',
        formulaExplanation: '',
        diffSequence: [],
      },
      passed: true,
      completedAt: Date.now(),
      schemaVersion: 1,
    });

    await adapter.saveExamResult(makeExam('exam_1', student1Id, 'Rohan Joshi', 35, 94));
    await adapter.saveExamResult(makeExam('exam_2', student2Id, 'Aditi Rao', 48, 97));
    await adapter.saveExamResult(makeExam('exam_3', studentPrivateId, 'Secret Typer', 42, 95));
  });

  it('should rank students by Net WPM under fair identical test configurations', async () => {
    const list = await LeaderboardService.getStudentLeaderboard({
      language: 'Hindi',
      keyboardLayout: 'Hindi InScript',
      durationMinutes: 5,
      scoringPolicy: 'standard',
      timeframe: 'all_time',
      metric: 'speed',
    }, student1Id);

    expect(list.length).toBeGreaterThanOrEqual(3);

    // Rank 1 should be Aditi Rao with 48 WPM
    expect(list[0].studentName).toBe('Aditi Rao');
    expect(list[0].netWpm).toBe(48);
    expect(list[0].rank).toBe(1);

    // Current user should be highlighted
    const currentUserEntry = list.find((e) => e.studentId === student1Id);
    expect(currentUserEntry?.isCurrentUser).toBe(true);
  });

  it('should respect privacy settings and anonymize opted-out students for other viewers', async () => {
    // Viewed by student1Id
    const list = await LeaderboardService.getStudentLeaderboard({
      language: 'Hindi',
      keyboardLayout: 'Hindi InScript',
      durationMinutes: 5,
      scoringPolicy: 'standard',
      timeframe: 'all_time',
      metric: 'speed',
    }, student1Id);

    const privateEntry = list.find((e) => e.studentId === studentPrivateId);
    expect(privateEntry).toBeDefined();
    expect(privateEntry?.studentName).toContain('Anonymous');
    expect(privateEntry?.rollNo).toBeUndefined();
  });

  it('should isolate incompatible test durations or languages from rankings', async () => {
    // Querying for 1-minute test should NOT include the 5-minute tests
    const list1Min = await LeaderboardService.getStudentLeaderboard({
      language: 'Hindi',
      keyboardLayout: 'Hindi InScript',
      durationMinutes: 1,
      scoringPolicy: 'standard',
      timeframe: 'all_time',
      metric: 'speed',
    });

    expect(list1Min).toHaveLength(0);
  });
});
