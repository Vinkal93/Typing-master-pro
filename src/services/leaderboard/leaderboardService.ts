import { storageService } from '../storage/storageService';
import {
  LeaderboardEntry,
  BatchLeaderboardEntry,
  LeaderboardFilter,
} from '@/types/analytics';
import { ExamAttemptRecord } from '@/types/exam';

export class LeaderboardService {
  /**
   * Retrieves individual student rankings with strict fairness comparison.
   * Compares only results with compatible language, layout, duration, and scoring policy.
   * Respects student privacy settings.
   */
  public static async getStudentLeaderboard(
    filter: LeaderboardFilter,
    currentProfileId?: string
  ): Promise<LeaderboardEntry[]> {
    const adapter = await storageService.getAdapter();
    const profiles = await adapter.getProfiles();
    const batches = await adapter.getBatches();
    const instituteStudents = await adapter.getInstituteStudents();

    // Map batch lookup
    const batchMap = new Map<string, string>();
    batches.forEach((b) => batchMap.set(b.id, b.name));

    // Map student batch & roll
    const studentBatchMap = new Map<string, { batchName?: string; rollNo?: string }>();
    instituteStudents.forEach((s) => {
      studentBatchMap.set(s.id, {
        batchName: batchMap.get(s.batchId),
        rollNo: s.rollNo,
      });
    });

    const entries: LeaderboardEntry[] = [];

    // Time cutoff
    const now = Date.now();
    let cutoff = 0;
    if (filter.timeframe === 'weekly') {
      cutoff = now - 7 * 86400000;
    } else if (filter.timeframe === 'monthly') {
      cutoff = now - 30 * 86400000;
    }

    for (const profile of profiles) {
      const results = await adapter.getExamResults(profile.id);

      // Apply fairness filters: language, layout, scoring policy, duration, timeframe
      const eligibleResults = results.filter((r: ExamAttemptRecord) => {
        if (cutoff > 0 && r.completedAt < cutoff) return false;
        if (r.language !== filter.language) return false;
        if (r.layout !== filter.keyboardLayout) return false;
        if (r.scoringPolicy !== filter.scoringPolicy) return false;

        const minutes = Math.round(r.targetDurationSeconds / 60);
        if (minutes !== filter.durationMinutes) return false;
        if (!r.passed) return false;

        return true;
      });

      if (eligibleResults.length === 0) continue;

      // Pick best attempt for this student according to metric
      let bestAttempt = eligibleResults[0];
      if (filter.metric === 'accuracy') {
        bestAttempt = eligibleResults.reduce((prev, curr) =>
          curr.scoring.accuracy > prev.scoring.accuracy ? curr : prev
        );
      } else if (filter.metric === 'improved') {
        // Chronological improvement (latest Net WPM minus first Net WPM)
        const sorted = [...eligibleResults].sort((a, b) => a.completedAt - b.completedAt);
        const diff = sorted[sorted.length - 1].scoring.netWpm - sorted[0].scoring.netWpm;
        bestAttempt = {
          ...sorted[sorted.length - 1],
          scoring: {
            ...sorted[sorted.length - 1].scoring,
            netWpm: Math.max(0, diff), // Represent improvement
          },
        };
      } else {
        // Default: Speed (Net WPM)
        bestAttempt = eligibleResults.reduce((prev, curr) =>
          curr.scoring.netWpm > prev.scoring.netWpm ? curr : prev
        );
      }

      const meta = studentBatchMap.get(profile.id);
      const isCurrentUser = profile.id === currentProfileId;

      // Privacy check: If student opted out and is not current user, display anonymized alias
      const isOptedOut = profile.preferences?.showOnLeaderboard === false;
      const studentName = isOptedOut && !isCurrentUser
        ? 'Anonymous Typist (गोपनीय विद्यार्थी)'
        : profile.name;

      entries.push({
        rank: 0,
        studentId: profile.id,
        studentName,
        rollNo: isOptedOut && !isCurrentUser ? undefined : meta?.rollNo || profile.instituteRollNo,
        batchName: meta?.batchName,
        netWpm: Math.round(bestAttempt.scoring.netWpm),
        grossWpm: Math.round(bestAttempt.scoring.grossWpm),
        accuracy: Math.round(bestAttempt.scoring.accuracy * 10) / 10,
        durationMinutes: filter.durationMinutes,
        completedAt: bestAttempt.completedAt,
        isCurrentUser,
      });
    }

    // Sort entries according to metric
    if (filter.metric === 'accuracy') {
      entries.sort((a, b) => b.accuracy - a.accuracy || b.netWpm - a.netWpm);
    } else {
      entries.sort((a, b) => b.netWpm - a.netWpm || b.accuracy - a.accuracy);
    }

    // Assign rank
    return entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  /**
   * Retrieves batch leaderboard rankings aggregated across active batches.
   */
  public static async getBatchLeaderboard(): Promise<BatchLeaderboardEntry[]> {
    const adapter = await storageService.getAdapter();
    const batches = await adapter.getBatches();
    const students = await adapter.getInstituteStudents();

    const result: BatchLeaderboardEntry[] = [];

    for (const batch of batches) {
      const batchStudents = students.filter(
        (s) => s.batchId === batch.id && s.status === 'active'
      );
      if (batchStudents.length === 0) continue;

      let totalNetWpm = 0;
      let totalAccuracy = 0;
      let evaluatedCount = 0;
      let topWpm = 0;

      for (const st of batchStudents) {
        const exams = await adapter.getExamResults(st.id);
        if (exams.length > 0) {
          const best = exams.reduce((p, c) =>
            c.scoring.netWpm > p.scoring.netWpm ? c : p
          );
          totalNetWpm += best.scoring.netWpm;
          totalAccuracy += best.scoring.accuracy;
          evaluatedCount++;
          if (best.scoring.netWpm > topWpm) topWpm = Math.round(best.scoring.netWpm);
        }
      }

      if (evaluatedCount > 0) {
        result.push({
          rank: 0,
          batchId: batch.id,
          batchName: batch.name,
          shift: batch.shift,
          studentCount: batchStudents.length,
          avgNetWpm: Math.round((totalNetWpm / evaluatedCount) * 10) / 10,
          avgAccuracy: Math.round((totalAccuracy / evaluatedCount) * 10) / 10,
          topWpm,
        });
      }
    }

    result.sort((a, b) => b.avgNetWpm - a.avgNetWpm || b.avgAccuracy - a.avgAccuracy);

    return result.map((b, index) => ({
      ...b,
      rank: index + 1,
    }));
  }
}
