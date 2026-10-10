import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { IndexedDBStorageAdapter } from '@/services/storage/indexedDbAdapter';
import { ExamAttemptRecord, ExamPassage } from '@/types/exam';

describe('Phase 4: Examination Storage Persistence (IndexedDB v3)', () => {
  let adapter: IndexedDBStorageAdapter;

  beforeEach(async () => {
    adapter = new IndexedDBStorageAdapter();
    await adapter.init();
  });

  it('should persist and retrieve exam attempt records by profile and ID', async () => {
    const record: ExamAttemptRecord = {
      id: 'exam_attempt_101',
      profileId: 'stud_123',
      studentName: 'Aarav Sharma',
      studentRollNo: 'TMP-101',
      passageId: 'hi_cpct_official_mock',
      passageTitle: 'डिजिटल भारत और ई-गवर्नेंस',
      language: 'hindi',
      layout: 'hindi_inscript',
      mode: 'strict_exam',
      scoringPolicy: 'cpct_hindi',
      backspacePolicy: 'allowed',
      targetDurationSeconds: 900,
      actualDurationSeconds: 900,
      completedAt: Date.now(),
      passed: true,
      scoring: {
        grossWpm: 42.5,
        netWpm: 38.2,
        cpm: 212,
        accuracy: 97.4,
        totalWordsTyped: 320,
        totalExpectedWords: 340,
        totalCharsTyped: 1600,
        totalExpectedChars: 1700,
        correctChars: 1560,
        incorrectChars: 40,
        omissions: 2,
        insertions: 0,
        substitutions: 3,
        backspaceCount: 14,
        targetDurationSeconds: 900,
        actualDurationSeconds: 900,
        completionPercentage: 94,
        passed: true,
        scoringPolicy: 'cpct_hindi',
        formulaExplanation: 'MP CPCT Formula',
        diffSequence: [],
      },
    };

    await adapter.saveExamResult(record);

    // Retrieve by ID
    const single = await adapter.getExamResultById('exam_attempt_101');
    expect(single).not.toBeNull();
    expect(single?.studentName).toBe('Aarav Sharma');
    expect(single?.scoring.netWpm).toBe(38.2);
    expect(single?.scoring.accuracy).toBe(97.4);
    expect(single?.passed).toBe(true);

    // Retrieve by Profile
    const profileResults = await adapter.getExamResults('stud_123');
    expect(profileResults).toHaveLength(1);
    expect(profileResults[0].id).toBe('exam_attempt_101');
  });

  it('should persist, retrieve, and delete custom teacher passages', async () => {
    const customPassage: ExamPassage = {
      id: 'custom_teacher_psg_01',
      title: 'मध्य प्रदेश उच्च न्यायालय डिक्टेशन गद्यांश',
      language: 'hindi',
      difficulty: 'advanced',
      content: 'न्यायालयीन प्रक्रियाओं में निष्पक्षता और सत्यनिष्ठा अत्यंत आवश्यक स्तंभ हैं।',
      wordCount: 10,
      characterCount: 75,
      isCustom: true,
      createdAt: Date.now(),
      author: 'Teacher Verma',
    };

    await adapter.saveCustomPassage(customPassage);

    const passages = await adapter.getCustomPassages();
    expect(passages).toHaveLength(1);
    expect(passages[0].id).toBe('custom_teacher_psg_01');
    expect(passages[0].title).toBe('मध्य प्रदेश उच्च न्यायालय डिक्टेशन गद्यांश');
    expect(passages[0].author).toBe('Teacher Verma');

    // Delete custom passage
    await adapter.deleteCustomPassage('custom_teacher_psg_01');
    const remainingPassages = await adapter.getCustomPassages();
    expect(remainingPassages).toHaveLength(0);
  });
});
