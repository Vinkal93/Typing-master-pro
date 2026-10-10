import { describe, it, expect } from 'vitest';
import { ExamReportService } from '@/services/exam/examReportService';
import { ExamAttemptRecord } from '@/types/exam';

describe('Phase 4: Examination Report and Export Service', () => {
  const mockRecord: ExamAttemptRecord = {
    id: 'rec_test_888',
    profileId: 'prof_888',
    studentName: 'Priya Patel',
    studentRollNo: 'TMP-888',
    presetId: 'preset_cpct_15m',
    presetTitle: 'MP CPCT Hindi Speed Test (15 Mins)',
    passageId: 'psg_cpct',
    passageTitle: 'डिजिटल भारत',
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
      grossWpm: 36.5,
      netWpm: 33.0,
      cpm: 182,
      accuracy: 96.0,
      totalWordsTyped: 300,
      totalExpectedWords: 350,
      totalCharsTyped: 1500,
      totalExpectedChars: 1750,
      correctChars: 1440,
      incorrectChars: 60,
      omissions: 1,
      insertions: 0,
      substitutions: 3,
      backspaceCount: 18,
      targetDurationSeconds: 900,
      actualDurationSeconds: 900,
      completionPercentage: 86,
      passed: true,
      scoringPolicy: 'cpct_hindi',
      formulaExplanation: 'MP CPCT Formula',
      diffSequence: [],
    },
  };

  it('should export results as RFC 4180 CSV with UTF-8 BOM', () => {
    const csv = ExamReportService.exportResultsToCsv([mockRecord]);

    // Starts with UTF-8 BOM (\uFEFF) for Excel compatibility with Devanagari
    expect(csv.startsWith('\uFEFF')).toBe(true);

    // Contains essential headers
    expect(csv).toContain('Record ID');
    expect(csv).toContain('Student Name');
    expect(csv).toContain('Net WPM');
    expect(csv).toContain('Scoring Policy');
    expect(csv).toContain('Result Status');

    // Contains student data and result
    expect(csv).toContain('"Priya Patel"');
    expect(csv).toContain('"MP CPCT Hindi Speed Test (15 Mins)"');
    expect(csv).toContain('"33"');
    expect(csv).toContain('"PASSED / QUALIFIED"');
  });

  it('should generate printable HTML scorecard with student and exam details', () => {
    const html = ExamReportService.generatePrintableHtml(mockRecord, 'TEST COMPUTER ACADEMY');

    expect(html).toContain('TEST COMPUTER ACADEMY');
    expect(html).toContain('Priya Patel');
    expect(html).toContain('TMP-888');
    expect(html).toContain('QUALIFIED / उत्तीर्ण');
    expect(html).toContain('33');
    expect(html).toContain('36.5');
    expect(html).toContain('96%');
    expect(html).toContain('rec_test_888');
  });
});
