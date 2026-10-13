import {
  ExamLanguage,
  ScoringDetails,
  ScoringPolicyType,
  SequenceDiffItem,
} from '@/types/exam';

export interface ScoringInput {
  expectedText: string;
  typedText: string;
  targetDurationSeconds: number;
  actualDurationSeconds: number;
  backspaceCount: number;
  scoringPolicy: ScoringPolicyType;
  language: ExamLanguage;
  minNetWpm?: number;
  minAccuracy?: number;
  maxErrorPercentage?: number;
}

export class ScoringEngine {
  /**
   * Tokenize text into words preserving whitespace boundaries.
   */
  public static tokenize(text: string): string[] {
    if (!text || text.trim().length === 0) return [];
    return text.trim().split(/\s+/);
  }

  /**
   * Sequence alignment algorithm (Needleman-Wunsch / Levenshtein word-level alignment).
   * Prevents a single missed or inserted word from throwing off subsequent alignment.
   */
  public static alignSequences(expectedWords: string[], typedWords: string[]): SequenceDiffItem[] {
    const n = expectedWords.length;
    const m = typedWords.length;

    // dp[i][j] stores minimum edit operations
    const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

    for (let i = 0; i <= n; i++) dp[i][0] = i;
    for (let j = 0; j <= m; j++) dp[0][j] = j;

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (expectedWords[i - 1] === typedWords[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(
            dp[i - 1][j - 1], // Substitution
            dp[i - 1][j],     // Omission (deletion from expected)
            dp[i][j - 1]      // Insertion (extra typed)
          );
        }
      }
    }

    // Backtrack to build the aligned diff sequence
    const diffSequence: SequenceDiffItem[] = [];
    let i = n;
    let j = m;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && expectedWords[i - 1] === typedWords[j - 1]) {
        diffSequence.push({
          type: 'correct',
          expected: expectedWords[i - 1],
          typed: typedWords[j - 1],
          index: i - 1,
        });
        i--;
        j--;
      } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
        diffSequence.push({
          type: 'substitution',
          expected: expectedWords[i - 1],
          typed: typedWords[j - 1],
          index: i - 1,
        });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j] === dp[i][j - 1] + 1)) {
        diffSequence.push({
          type: 'insertion',
          typed: typedWords[j - 1],
          index: i,
        });
        j--;
      } else {
        diffSequence.push({
          type: (i > 0 && j === 0) ? 'unattempted' : 'omission',
          expected: expectedWords[i - 1],
          index: i - 1,
        });
        i--;
      }
    }

    diffSequence.reverse();

    // Trailing unmatched expected words at the end of the passage are unattempted,
    // not omission errors. Only omissions within the typed range count as errors.
    for (let k = diffSequence.length - 1; k >= 0; k--) {
      const item = diffSequence[k];
      if (item.type === 'omission') {
        item.type = 'unattempted';
      } else {
        break;
      }
    }

    return diffSequence;
  }

  /**
   * Character-level alignment comparison based on word-level diff sequence.
   * Alignment-aware to prevent single char insertions/omissions from throwing off subsequent alignment.
   */
  public static computeCharacterCounts(
    diffSequence: SequenceDiffItem[]
  ): {
    correctChars: number;
    incorrectChars: number;
  };
  public static computeCharacterCounts(
    expectedText: string,
    typedText: string
  ): {
    correctChars: number;
    incorrectChars: number;
  };
  public static computeCharacterCounts(
    diffOrExpected: SequenceDiffItem[] | string,
    typedText?: string
  ): {
    correctChars: number;
    incorrectChars: number;
  } {
    if (typeof diffOrExpected === 'string') {
      const expectedWords = this.tokenize(diffOrExpected);
      const typedWords = this.tokenize(typedText || '');
      const diff = this.alignSequences(expectedWords, typedWords);
      return this.computeCharacterCounts(diff);
    }

    const diffSequence = diffOrExpected;
    let correctChars = 0;
    let incorrectChars = 0;

    for (const item of diffSequence) {
      if (item.type === 'correct' || (item.type as string) === 'match') {
        const word = item.expected || item.typed || '';
        correctChars += word.length;
      } else if (item.type === 'substitution') {
        const expected = item.expected || '';
        const typed = item.typed || '';
        const minLen = Math.min(expected.length, typed.length);
        for (let k = 0; k < minLen; k++) {
          if (expected[k] === typed[k]) {
            correctChars++;
          } else {
            incorrectChars++;
          }
        }
        // Account for character length differences in word substitutions
        incorrectChars += Math.abs(expected.length - typed.length);
      } else if (item.type === 'insertion') {
        incorrectChars += (item.typed?.length || 0);
      } else if (item.type === 'omission') {
        incorrectChars += (item.expected?.length || 0);
      }
      // 'unattempted' items represent trailing unattempted words and are not errors
    }

    return { correctChars, incorrectChars };
  }

  /**
   * Primary evaluation entrypoint.
   */
  public static evaluate(input: ScoringInput): ScoringDetails {
    const {
      expectedText,
      typedText,
      targetDurationSeconds,
      actualDurationSeconds,
      backspaceCount,
      scoringPolicy,
      language,
      minNetWpm = 0,
      minAccuracy = 0,
      maxErrorPercentage,
    } = input;

    const elapsedMinutes = Math.max(0.01, actualDurationSeconds / 60);

    const expectedWords = this.tokenize(expectedText);
    const typedWords = this.tokenize(typedText);

    const diffSequence = this.alignSequences(expectedWords, typedWords);

    let substitutions = 0;
    let insertions = 0;
    let omissions = 0;
    let unattempted = 0;
    let correctWordsCount = 0;

    diffSequence.forEach((item) => {
      if (item.type === 'correct') correctWordsCount++;
      else if (item.type === 'substitution') substitutions++;
      else if (item.type === 'insertion') insertions++;
      else if (item.type === 'omission') omissions++;
      else if (item.type === 'unattempted') unattempted++;
    });

    const totalErrors = substitutions + insertions + omissions;
    const totalCharsTyped = typedText.length;
    const totalExpectedChars = expectedText.length;

    // Word counts
    const totalWordsTyped = typedWords.length;
    const totalExpectedWords = expectedWords.length;

    // Standard 5-characters per word convention (BIS and international standard)
    const grossWordsStandard = totalCharsTyped / 5;
    const grossWpm = Math.round((grossWordsStandard / elapsedMinutes) * 10) / 10;
    const cpm = Math.round(totalCharsTyped / elapsedMinutes);

    // Compute character accuracy using alignment-aware character counts
    const { correctChars, incorrectChars } = this.computeCharacterCounts(diffSequence);
    const totalEvaluatedChars = correctChars + incorrectChars;
    const accuracy = totalEvaluatedChars > 0
      ? Math.max(0, Math.min(100, Math.round(((correctChars / totalEvaluatedChars) * 100) * 10) / 10))
      : (totalCharsTyped > 0 ? 0 : 100);

    let netWpm = 0;
    let formulaExplanation = '';

    // Apply specific examination scoring formula
    switch (scoringPolicy) {
      case 'cpct_hindi': {
        // MP CPCT Standard: 5 characters = 1 word. Full mistake = 1 word penalty.
        const penaltyWords = totalErrors;
        const netWords = Math.max(0, grossWordsStandard - penaltyWords);
        netWpm = Math.max(0, Math.round((netWords / elapsedMinutes) * 10) / 10);
        formulaExplanation = 'MP CPCT Formula: Net WPM = [(Total Typed Characters / 5) - Total Errors] / Time in Minutes';
        break;
      }

      case 'ssc_cgl': {
        // SSC Scheme: Gross WPM adjusted by error percentage penalty
        const errorPct = totalExpectedWords > 0
          ? (totalErrors / totalExpectedWords) * 100
          : 0;
        const penaltyFactor = Math.max(0, 1 - (errorPct / 100));
        netWpm = Math.max(0, Math.round((grossWpm * penaltyFactor) * 10) / 10);
        formulaExplanation = 'SSC Evaluation: Net WPM = Gross WPM × (1 - (Error Words / Total Expected Words))';
        break;
      }

      case 'court_exam': {
        // High Court Strict Formula: 1.5x penalty per spelling/word error
        const penaltyRate = 1.5;
        const penalty = (totalErrors * penaltyRate) / elapsedMinutes;
        netWpm = Math.max(0, Math.round((grossWpm - penalty) * 10) / 10);
        formulaExplanation = 'High Court Strict Scheme: Net WPM = Gross WPM - (1.5 × Total Mistakes / Time in Minutes)';
        break;
      }

      case 'standard':
      case 'custom':
      default: {
        // Standard Formula: Net WPM = Gross WPM - (Errors / Minutes)
        const errorDeduction = totalErrors / elapsedMinutes;
        netWpm = Math.max(0, Math.round((grossWpm - errorDeduction) * 10) / 10);
        formulaExplanation = 'Standard Typing Tutor Formula: Net WPM = Gross WPM - (Total Errors / Time in Minutes)';
        break;
      }
    }

    // Completion percentage
    const completionPercentage = totalExpectedChars > 0
      ? Math.min(100, Math.round((totalCharsTyped / totalExpectedChars) * 100))
      : 0;

    // Determine pass/fail
    const errorPct = totalExpectedWords > 0 ? (totalErrors / totalExpectedWords) * 100 : 0;
    const speedPassed = netWpm >= minNetWpm;
    const accuracyPassed = accuracy >= minAccuracy;
    const errorLimitPassed = maxErrorPercentage !== undefined ? errorPct <= maxErrorPercentage : true;

    const passed = speedPassed && accuracyPassed && errorLimitPassed;

    return {
      grossWpm,
      netWpm,
      cpm,
      accuracy,
      totalWordsTyped,
      totalExpectedWords,
      totalCharsTyped,
      totalExpectedChars,
      correctChars,
      incorrectChars,
      omissions,
      insertions,
      substitutions,
      unattempted,
      backspaceCount,
      targetDurationSeconds,
      actualDurationSeconds,
      completionPercentage,
      passed,
      scoringPolicy,
      formulaExplanation,
      diffSequence,
    };
  }
}
