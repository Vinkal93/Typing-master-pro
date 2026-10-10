import { storageService } from '../storage/storageService';
import { KeyHeatmapStat, WeakKeyAnalysis } from '@/types/analytics';
import { KeyboardLayout } from '@/types';
import { INSCRIPT_KEYS } from '../engine/inscriptMapping';

export class HeatmapService {
  /**
   * Records a keystroke attempt for physical key and character.
   */
  public static async recordKeyAttempt(
    profileId: string,
    layout: KeyboardLayout,
    code: string,
    expectedChar: string,
    typedChar: string,
    isCorrect: boolean,
    responseTimeMs = 250
  ): Promise<void> {
    const adapter = await storageService.getAdapter();
    const id = `${profileId}_${layout}_${code}`;

    const existingStats = await adapter.getKeyHeatmapStats(profileId, layout);
    const existing = existingStats.find((s) => s.code === code);

    const totalAttempts = (existing ? existing.totalAttempts : 0) + 1;
    const correctAttempts = (existing ? existing.correctAttempts : 0) + (isCorrect ? 1 : 0);
    const incorrectAttempts = (existing ? existing.incorrectAttempts : 0) + (isCorrect ? 0 : 1);
    const accuracyPct = Math.round((correctAttempts / totalAttempts) * 1000) / 10;

    // Moving average for response time
    const prevAvg = existing?.avgResponseTimeMs || responseTimeMs;
    const avgResponseTimeMs = Math.round((prevAvg * 0.8) + (responseTimeMs * 0.2));

    const repeatedMistakes = { ...(existing?.repeatedMistakes || {}) };
    if (!isCorrect && typedChar) {
      repeatedMistakes[typedChar] = (repeatedMistakes[typedChar] || 0) + 1;
    }

    // Determine representative char from inscript or physical
    let char = expectedChar;
    if (!char) {
      const def = INSCRIPT_KEYS.find((k) => k.code === code);
      char = layout === 'hindi_inscript' ? (def?.hiNormal || code) : (def?.enNormal || code);
    }

    const updatedStat: KeyHeatmapStat = {
      id,
      profileId,
      layout,
      code,
      char,
      totalAttempts,
      correctAttempts,
      incorrectAttempts,
      accuracyPct,
      avgResponseTimeMs,
      repeatedMistakes,
      lastTrainedAt: Date.now(),
    };

    await adapter.saveKeyHeatmapStat(updatedStat);
  }

  /**
   * Retrieves all key statistics for a student profile and layout.
   */
  public static async getKeyStats(
    profileId: string,
    layout: KeyboardLayout
  ): Promise<KeyHeatmapStat[]> {
    const adapter = await storageService.getAdapter();
    return adapter.getKeyHeatmapStats(profileId, layout);
  }

  /**
   * Identifies weak keys (accuracy < threshold% with minimum attempts, or high response times).
   */
  public static async getWeakKeys(
    profileId: string,
    layout: KeyboardLayout,
    minAttempts = 5,
    thresholdAccuracy = 85
  ): Promise<WeakKeyAnalysis[]> {
    const stats = await this.getKeyStats(profileId, layout);
    const eligible = stats.filter((s) => s.totalAttempts >= minAttempts && s.accuracyPct < thresholdAccuracy);

    return eligible
      .map((s) => {
        const errorRatePct = Math.round((s.incorrectAttempts / s.totalAttempts) * 1000) / 10;
        const topConfusions = Object.entries(s.repeatedMistakes)
          .map(([typed, count]) => ({ expected: s.char, typed, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        let severity: 'critical' | 'moderate' | 'mild' = 'mild';
        if (s.accuracyPct < 70) severity = 'critical';
        else if (s.accuracyPct < 80) severity = 'moderate';

        return {
          code: s.code,
          char: s.char,
          layout: s.layout,
          accuracyPct: s.accuracyPct,
          errorRatePct,
          totalAttempts: s.totalAttempts,
          avgResponseTimeMs: s.avgResponseTimeMs,
          topConfusions,
          severity,
        };
      })
      .sort((a, b) => a.accuracyPct - b.accuracyPct);
  }

  /**
   * Returns a heatmap hex/tailwind color based on accuracy percentage and sample size.
   */
  public static getHeatmapColorClass(
    stat?: KeyHeatmapStat
  ): { bg: string; text: string; border: string; label: string } {
    if (!stat || stat.totalAttempts === 0) {
      return {
        bg: 'bg-slate-100 dark:bg-slate-800/60',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-300 dark:border-slate-700',
        label: 'Untrained (अप्रशिक्षित)',
      };
    }

    if (stat.accuracyPct >= 95) {
      return {
        bg: 'bg-emerald-500 text-white',
        text: 'text-white',
        border: 'border-emerald-600',
        label: `Mastered (${stat.accuracyPct}%)`,
      };
    }
    if (stat.accuracyPct >= 85) {
      return {
        bg: 'bg-emerald-400 text-slate-900',
        text: 'text-slate-900',
        border: 'border-emerald-500',
        label: `Good (${stat.accuracyPct}%)`,
      };
    }
    if (stat.accuracyPct >= 75) {
      return {
        bg: 'bg-amber-400 text-slate-950',
        text: 'text-slate-950',
        border: 'border-amber-500',
        label: `Fair (${stat.accuracyPct}%)`,
      };
    }
    if (stat.accuracyPct >= 60) {
      return {
        bg: 'bg-orange-500 text-white',
        text: 'text-white',
        border: 'border-orange-600',
        label: `Weak (${stat.accuracyPct}%)`,
      };
    }
    return {
      bg: 'bg-rose-600 text-white',
      text: 'text-white',
      border: 'border-rose-700',
      label: `Critical (${stat.accuracyPct}%)`,
    };
  }
}
