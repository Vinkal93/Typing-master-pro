import { CharacterMistakeStat, LmsLesson } from '@/types/lms';
import { storageService } from '../storage/storageService';

export interface RecordedMistake {
  char: string;
  keyCode: string;
}

export class AdaptivePracticeService {
  /**
   * Record real-time character mistakes during typing exercises.
   */
  public static async recordMistakes(
    profileId: string,
    mistakes: RecordedMistake[]
  ): Promise<void> {
    if (!profileId || mistakes.length === 0) return;

    const adapter = await storageService.getAdapter();
    const existingStats = await adapter.getMistakeStats(profileId);
    const statMap = new Map<string, CharacterMistakeStat>(
      existingStats.map((s) => [s.char, s])
    );

    const now = Date.now();

    for (const m of mistakes) {
      const existing = statMap.get(m.char);
      if (existing) {
        existing.errorCount += 1;
        existing.totalAttempts += 1;
        existing.lastErrorAt = now;
        if (!existing.keyCode && m.keyCode) {
          existing.keyCode = m.keyCode;
        }
      } else {
        const newStat: CharacterMistakeStat = {
          profileId,
          char: m.char,
          keyCode: m.keyCode,
          errorCount: 1,
          totalAttempts: 1,
          lastErrorAt: now,
        };
        statMap.set(m.char, newStat);
      }
    }

    await adapter.saveMistakeStats(Array.from(statMap.values()));
  }

  /**
   * Reset mistake statistics for a specific character (e.g. after successful remediation).
   */
  public static async resetWeakCharacter(profileId: string, char: string): Promise<void> {
    const adapter = await storageService.getAdapter();
    const stats = await adapter.getMistakeStats(profileId);
    const target = stats.find((s) => s.char === char);
    if (target) {
      target.errorCount = 0;
      await adapter.saveMistakeStats([target]);
    }
  }

  /**
   * Generate an adaptive revision lesson targeting the student's weakest keys.
   * Completely offline, local heuristic generation without cloud/AI dependencies.
   */
  public static generateAdaptiveLesson(
    weakStats: CharacterMistakeStat[],
    drillId = 'adaptive_revision_custom'
  ): LmsLesson {
    const sorted = [...weakStats]
      .filter((s) => s.errorCount > 0)
      .sort((a, b) => b.errorCount - a.errorCount);

    const topWeakChars = sorted.slice(0, 5).map((s) => s.char);
    const targetChars = topWeakChars.length > 0 ? topWeakChars : ['क', 'र', 'म', 'न', 'स'];
    const targetKeys = sorted.slice(0, 5).map((s) => s.keyCode).filter(Boolean);

    // Heuristic Drill Construction:
    // 1. Repetitive character sets
    const repetitionSet = targetChars.map((c) => `${c}${c} ${c}${c}${c} ${c} `).join('');

    // 2. Pairwise permutations
    const pairs: string[] = [];
    for (let i = 0; i < targetChars.length; i++) {
      for (let j = 0; j < targetChars.length; j++) {
        if (i !== j) {
          pairs.push(`${targetChars[i]}${targetChars[j]}`);
        }
      }
    }
    const pairPractice = pairs.slice(0, 8).join(' ');

    // 3. Guided text
    const guidedText = `${repetitionSet} ${pairPractice} ${pairPractice}`;

    // 4. Independent text
    const independentText = `${pairPractice} ${repetitionSet} ${pairPractice}`;

    // 5. Test passage integrating common vowels
    const testWords = targetChars.map((c) => `${c}ा${c} ${c}े${c} म${c} स${c} न${c}`).join(' ');
    const testText = `${testWords}। ${pairPractice}। ${targetChars.join(' ')} का निरंतर अभ्यास त्रुटिहीन टंकण सुनिश्चित करता है।`;

    return {
      id: drillId,
      levelId: 1,
      order: 999,
      globalIndex: 999,
      title: `Adaptive Remediation Drill (${targetChars.join(', ')})`,
      titleHindi: `अनुकूली सुधारात्मक अभ्यास (${targetChars.join(', ')})`,
      description: `Targeted heuristic drill generated specifically to remediate typing mistakes on: ${targetChars.join(', ')}.`,
      difficulty: 'basic',
      prerequisites: [],
      targetCharacters: targetChars,
      targetKeys: targetKeys.length > 0 ? targetKeys : ['KeyK', 'KeyJ', 'KeyC', 'KeyB', 'KeyM'],
      stageA_Learn: {
        title: 'त्रुटि निवारण एवं उंगली नियंत्रण',
        explanation: `आपके पिछले अभ्यासों में ${targetChars.join(', ')} वर्णों में अधिक गलतियां दर्ज की गई हैं। अपनी उंगलियों को इन विशिष्ट कुंजियों पर स्थिर करें।`,
        demoKeys: targetKeys,
        fingerInstructions: 'Focus entirely on finger placement without rushing',
        tips: 'गलत वर्णों को टाइप करते समय गति धीमी करें और शुद्धता को प्राथमिकता दें।',
      },
      stageB_Guided: {
        targetText: guidedText.trim(),
        guideNotes: 'लक्षित वर्णों का निरंतर आवृत्तिमूलक अभ्यास।',
      },
      stageC_Independent: {
        targetText: independentText.trim(),
      },
      stageD_Test: {
        targetText: testText.trim(),
        timeLimitSeconds: 60,
      },
      expectedDurationMinutes: 4,
      passingCriteria: { minAccuracy: 92, minWpm: 0 },
      revisionTags: ['adaptive', 'remediation', ...targetChars],
    };
  }
}
