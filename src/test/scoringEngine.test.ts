import { describe, it, expect } from 'vitest';
import { ScoringEngine, ScoringInput } from '@/services/exam/scoringEngine';

describe('Phase 4: Examination Scoring Engine', () => {
  describe('Tokenization and Sequence Alignment', () => {
    it('should correctly tokenize English and Hindi text by whitespace', () => {
      const en = 'The quick brown fox jumps';
      expect(ScoringEngine.tokenize(en)).toEqual(['The', 'quick', 'brown', 'fox', 'jumps']);

      const hi = 'भारत एक महान देश है';
      expect(ScoringEngine.tokenize(hi)).toEqual(['भारत', 'एक', 'महान', 'देश', 'है']);

      expect(ScoringEngine.tokenize('   ')).toEqual([]);
      expect(ScoringEngine.tokenize('')).toEqual([]);
    });

    it('should align identical sequences with all correct items', () => {
      const expected = ['भारत', 'एक', 'विशाल', 'देश', 'है'];
      const typed = ['भारत', 'एक', 'विशाल', 'देश', 'है'];
      const diff = ScoringEngine.alignSequences(expected, typed);

      expect(diff).toHaveLength(5);
      expect(diff.every((d) => d.type === 'correct')).toBe(true);
    });

    it('should detect substitutions without shifting subsequent words', () => {
      const expected = ['भारत', 'एक', 'विशाल', 'देश', 'है'];
      const typed = ['भारत', 'एक', 'सुंदर', 'देश', 'है'];
      const diff = ScoringEngine.alignSequences(expected, typed);

      expect(diff).toHaveLength(5);
      expect(diff[0].type).toBe('correct');
      expect(diff[1].type).toBe('correct');
      expect(diff[2].type).toBe('substitution');
      expect(diff[2].expected).toBe('विशाल');
      expect(diff[2].typed).toBe('सुंदर');
      expect(diff[3].type).toBe('correct');
      expect(diff[4].type).toBe('correct');
    });

    it('should detect omissions without throwing off subsequent alignment', () => {
      // User missed the word 'विशाल'
      const expected = ['भारत', 'एक', 'विशाल', 'देश', 'है'];
      const typed = ['भारत', 'एक', 'देश', 'है'];
      const diff = ScoringEngine.alignSequences(expected, typed);

      const omission = diff.find((d) => d.type === 'omission');
      expect(omission).toBeDefined();
      expect(omission?.expected).toBe('विशाल');

      // Subsequent words should still be recognized as correct
      const correctWords = diff.filter((d) => d.type === 'correct').map((d) => d.expected);
      expect(correctWords).toEqual(['भारत', 'एक', 'देश', 'है']);
    });

    it('should detect inserted extra words gracefully', () => {
      // User typed an extra word 'बहुत'
      const expected = ['भारत', 'एक', 'देश', 'है'];
      const typed = ['भारत', 'एक', 'बहुत', 'देश', 'है'];
      const diff = ScoringEngine.alignSequences(expected, typed);

      const insertion = diff.find((d) => d.type === 'insertion');
      expect(insertion).toBeDefined();
      expect(insertion?.typed).toBe('बहुत');

      const correctWords = diff.filter((d) => d.type === 'correct').map((d) => d.expected);
      expect(correctWords).toEqual(['भारत', 'एक', 'देश', 'है']);
    });
  });

  describe('Character Counts and Accuracy', () => {
    it('should calculate correct and incorrect character counts', () => {
      const expected = 'typing';
      const typed = 'typong';
      const counts = ScoringEngine.computeCharacterCounts(expected, typed);

      expect(counts.correctChars).toBe(5);
      expect(counts.incorrectChars).toBe(1);
    });

    it('should count extra characters as incorrect', () => {
      const expected = 'abc';
      const typed = 'abcdef';
      const counts = ScoringEngine.computeCharacterCounts(expected, typed);

      expect(counts.correctChars).toBe(3);
      expect(counts.incorrectChars).toBe(3);
    });
  });

  describe('Government Exam Scoring Policies', () => {
    it('should evaluate Standard typing tutor formula correctly', () => {
      // 50 words = 250 chars typed in 60 seconds (1 minute)
      // 2 substitution mistakes
      const text = 'word '.repeat(50).trim();
      const typed = 'word '.repeat(48).trim() + ' wrong wrong';

      const input: ScoringInput = {
        expectedText: text,
        typedText: typed,
        targetDurationSeconds: 60,
        actualDurationSeconds: 60,
        backspaceCount: 5,
        scoringPolicy: 'standard',
        language: 'english',
        minNetWpm: 40,
        minAccuracy: 90,
      };

      const result = ScoringEngine.evaluate(input);

      expect(result.scoringPolicy).toBe('standard');
      expect(result.grossWpm).toBeGreaterThan(45);
      // Net WPM = Gross WPM - (Total Errors / 1 min)
      expect(result.netWpm).toBeLessThan(result.grossWpm);
      expect(result.substitutions).toBe(2);
      expect(result.passed).toBe(true);
    });

    it('should evaluate MP CPCT Hindi examination formula', () => {
      // 300 characters in 1 minute = 60 gross words
      // 3 errors => Net words = 60 - 3 = 57 words => 57 Net WPM
      const expected = 'नमस्ते '.repeat(50).trim();
      const typed = 'नमस्ते '.repeat(47).trim() + ' गलत गलत गलत';

      const input: ScoringInput = {
        expectedText: expected,
        typedText: typed,
        targetDurationSeconds: 60,
        actualDurationSeconds: 60,
        backspaceCount: 2,
        scoringPolicy: 'cpct_hindi',
        language: 'hindi',
        minNetWpm: 30,
        minAccuracy: 85,
      };

      const result = ScoringEngine.evaluate(input);

      expect(result.scoringPolicy).toBe('cpct_hindi');
      expect(result.formulaExplanation).toContain('MP CPCT Formula');
      expect(result.passed).toBe(true);
      expect(result.netWpm).toBeGreaterThan(25);
    });

    it('should evaluate High Court Strict exam penalty (1.5x penalty per error)', () => {
      const text = 'quick brown fox jumps over lazy dog and run fast';
      const typed = 'quick brown bad bad over lazy dog and run fast'; // 2 substitutions

      const input: ScoringInput = {
        expectedText: text,
        typedText: typed,
        targetDurationSeconds: 60,
        actualDurationSeconds: 60,
        backspaceCount: 0,
        scoringPolicy: 'court_exam',
        language: 'english',
      };

      const result = ScoringEngine.evaluate(input);
      expect(result.formulaExplanation).toContain('High Court Strict Scheme');
      expect(result.substitutions).toBe(2);
      // Deduction is 1.5 * 2 = 3 WPM deduction
      expect(result.grossWpm - result.netWpm).toBeCloseTo(3.0, 1);
    });

    it('should evaluate SSC CGL/CHSL error percentage formula and handle disqualification', () => {
      const expected = 'one two three four five six seven eight nine ten';
      const typed = 'one two bad bad bad bad bad bad bad bad'; // 8 errors out of 10 words (80% error rate)

      const input: ScoringInput = {
        expectedText: expected,
        typedText: typed,
        targetDurationSeconds: 60,
        actualDurationSeconds: 60,
        backspaceCount: 1,
        scoringPolicy: 'ssc_cgl',
        language: 'english',
        minNetWpm: 25,
        minAccuracy: 90,
        maxErrorPercentage: 10, // Max 10% mistakes allowed in SSC
      };

      const result = ScoringEngine.evaluate(input);
      expect(result.passed).toBe(false); // Disqualified because of high error rate
      expect(result.formulaExplanation).toContain('SSC Evaluation');
    });
  });
});
