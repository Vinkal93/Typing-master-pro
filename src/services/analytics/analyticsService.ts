import { storageService } from '../storage/storageService';
import {
  StudentAnalyticsFilter,
  AggregateAnalyticsResult,
  ProgressTrendPoint,
  PersonalRecord,
} from '@/types/analytics';
import { ExamAttemptRecord } from '@/types/exam';

export class AnalyticsService {
  /**
   * Retrieves aggregated student analytics with full filtering support.
   */
  public static async getStudentAnalytics(
    profileId: string,
    filter: StudentAnalyticsFilter = { dateRange: 'all' }
  ): Promise<AggregateAnalyticsResult> {
    const adapter = await storageService.getAdapter();
    const examResults = await adapter.getExamResults(profileId);
    const practiceResults = await adapter.getResults(profileId);
    const lmsProgress = await adapter.getLessonProgress(profileId);

    // Completed lessons count
    const completedLessonsCount = lmsProgress.filter((p) => p.isCompleted).length;

    // Filter exam results
    const filteredExams = this.filterExamRecords(examResults, filter);

    if (filteredExams.length === 0 && practiceResults.length === 0) {
      return {
        hasData: false,
        totalAttempts: 0,
        totalDurationSeconds: 0,
        totalPracticeMinutes: 0,
        bestGrossWpm: 0,
        averageGrossWpm: 0,
        bestNetWpm: 0,
        averageNetWpm: 0,
        bestAccuracy: 0,
        averageAccuracy: 0,
        completedLessonsCount,
        completedExamsCount: 0,
        weeklyWpmChangePct: 0,
        monthlyWpmChangePct: 0,
        personalRecords: [],
        trends: [],
      };
    }

    // Sort ascending by completedAt for chronological trend calculations
    const sortedExams = [...filteredExams].sort((a, b) => a.completedAt - b.completedAt);

    let totalDurationSeconds = 0;
    let totalGrossWpm = 0;
    let totalNetWpm = 0;
    let totalAccuracy = 0;
    let bestGrossWpm = 0;
    let bestNetWpm = 0;
    let bestAccuracy = 0;

    const trends: ProgressTrendPoint[] = [];

    sortedExams.forEach((record) => {
      const gross = record.scoring.grossWpm || 0;
      const net = record.scoring.netWpm || 0;
      const acc = record.scoring.accuracy || 0;
      const duration = record.actualDurationSeconds || record.targetDurationSeconds || 0;

      totalDurationSeconds += duration;
      totalGrossWpm += gross;
      totalNetWpm += net;
      totalAccuracy += acc;

      if (gross > bestGrossWpm) bestGrossWpm = gross;
      if (net > bestNetWpm) bestNetWpm = net;
      if (acc > bestAccuracy) bestAccuracy = acc;

      const d = new Date(record.completedAt);
      const dateStr = d.toISOString().split('T')[0];

      trends.push({
        date: dateStr,
        timestamp: record.completedAt,
        grossWpm: Math.round(gross),
        netWpm: Math.round(net),
        accuracy: Math.round(acc * 10) / 10,
        durationMinutes: Math.round((duration / 60) * 10) / 10,
        label: record.presetTitle || record.passageTitle || 'Typing Test',
      });
    });

    // Add practice durations
    let practiceDurationSeconds = 0;
    practiceResults.forEach((pr) => {
      practiceDurationSeconds += pr.durationSeconds || 0;
    });

    const totalAttempts = sortedExams.length;
    const averageGrossWpm = totalAttempts > 0 ? Math.round((totalGrossWpm / totalAttempts) * 10) / 10 : 0;
    const averageNetWpm = totalAttempts > 0 ? Math.round((totalNetWpm / totalAttempts) * 10) / 10 : 0;
    const averageAccuracy = totalAttempts > 0 ? Math.round((totalAccuracy / totalAttempts) * 10) / 10 : 0;
    const totalPracticeMinutes = Math.round((totalDurationSeconds + practiceDurationSeconds) / 60);

    // Calculate weekly & monthly change
    const now = Date.now();
    const oneWeekAgo = now - 7 * 86400000;
    const twoWeeksAgo = now - 14 * 86400000;
    const oneMonthAgo = now - 30 * 86400000;
    const twoMonthsAgo = now - 60 * 86400000;

    const recentWeekExams = sortedExams.filter((e) => e.completedAt >= oneWeekAgo);
    const priorWeekExams = sortedExams.filter((e) => e.completedAt >= twoWeeksAgo && e.completedAt < oneWeekAgo);

    const recentMonthExams = sortedExams.filter((e) => e.completedAt >= oneMonthAgo);
    const priorMonthExams = sortedExams.filter((e) => e.completedAt >= twoMonthsAgo && e.completedAt < oneMonthAgo);

    const avgNet = (arr: ExamAttemptRecord[]) =>
      arr.length > 0 ? arr.reduce((acc, c) => acc + c.scoring.netWpm, 0) / arr.length : 0;

    const recentWeekAvg = avgNet(recentWeekExams);
    const priorWeekAvg = avgNet(priorWeekExams);
    const weeklyWpmChangePct =
      priorWeekAvg > 0 ? Math.round(((recentWeekAvg - priorWeekAvg) / priorWeekAvg) * 100) : 0;

    const recentMonthAvg = avgNet(recentMonthExams);
    const priorMonthAvg = avgNet(priorMonthExams);
    const monthlyWpmChangePct =
      priorMonthAvg > 0 ? Math.round(((recentMonthAvg - priorMonthAvg) / priorMonthAvg) * 100) : 0;

    // Personal records
    const personalRecords = this.computePersonalRecords(sortedExams);

    return {
      hasData: totalAttempts > 0 || practiceResults.length > 0,
      totalAttempts,
      totalDurationSeconds,
      totalPracticeMinutes,
      bestGrossWpm: Math.round(bestGrossWpm),
      averageGrossWpm,
      bestNetWpm: Math.round(bestNetWpm),
      averageNetWpm,
      bestAccuracy: Math.round(bestAccuracy * 10) / 10,
      averageAccuracy,
      completedLessonsCount,
      completedExamsCount: totalAttempts,
      weeklyWpmChangePct,
      monthlyWpmChangePct,
      personalRecords,
      trends,
    };
  }

  /**
   * Filters examination records by configured filters.
   */
  private static filterExamRecords(
    records: ExamAttemptRecord[],
    filter: StudentAnalyticsFilter
  ): ExamAttemptRecord[] {
    const now = Date.now();
    let cutoff = 0;

    if (filter.dateRange === '7days') {
      cutoff = now - 7 * 86400000;
    } else if (filter.dateRange === '30days') {
      cutoff = now - 30 * 86400000;
    } else if (filter.dateRange === '90days') {
      cutoff = now - 90 * 86400000;
    }

    return records.filter((r) => {
      if (cutoff > 0 && r.completedAt < cutoff) return false;
      if (filter.language && filter.language !== 'all' && r.language !== filter.language) return false;
      if (filter.layout && filter.layout !== 'all' && r.layout !== filter.layout) return false;
      if (filter.scoringPolicy && filter.scoringPolicy !== 'all' && r.scoringPolicy !== filter.scoringPolicy) {
        return false;
      }
      if (filter.durationMinutes && filter.durationMinutes !== 'all') {
        const testMinutes = Math.round(r.targetDurationSeconds / 60);
        if (testMinutes !== filter.durationMinutes) return false;
      }
      return true;
    });
  }

  /**
   * Computes personal records (Best Net WPM, Best Accuracy, Longest Exam).
   */
  private static computePersonalRecords(sortedExams: ExamAttemptRecord[]): PersonalRecord[] {
    if (sortedExams.length === 0) return [];

    const records: PersonalRecord[] = [];

    // 1. Highest Net Speed
    const bestSpeedRecord = [...sortedExams].sort((a, b) => b.scoring.netWpm - a.scoring.netWpm)[0];
    if (bestSpeedRecord) {
      records.push({
        title: 'Peak Net Speed (सर्वोच्च शुद्ध गति)',
        metric: 'Net WPM',
        value: Math.round(bestSpeedRecord.scoring.netWpm),
        unit: 'WPM',
        dateAchieved: new Date(bestSpeedRecord.completedAt).toLocaleDateString(),
        testTitle: bestSpeedRecord.presetTitle || bestSpeedRecord.passageTitle,
      });
    }

    // 2. Highest Accuracy
    const bestAccRecord = [...sortedExams].sort((a, b) => b.scoring.accuracy - a.scoring.accuracy)[0];
    if (bestAccRecord) {
      records.push({
        title: 'Highest Accuracy (सर्वोच्च सटीकता)',
        metric: 'Accuracy',
        value: Math.round(bestAccRecord.scoring.accuracy * 10) / 10,
        unit: '%',
        dateAchieved: new Date(bestAccRecord.completedAt).toLocaleDateString(),
        testTitle: bestAccRecord.presetTitle || bestAccRecord.passageTitle,
      });
    }

    // 3. Peak Gross Speed
    const bestGrossRecord = [...sortedExams].sort((a, b) => b.scoring.grossWpm - a.scoring.grossWpm)[0];
    if (bestGrossRecord) {
      records.push({
        title: 'Peak Gross Speed (सकल गति)',
        metric: 'Gross WPM',
        value: Math.round(bestGrossRecord.scoring.grossWpm),
        unit: 'WPM',
        dateAchieved: new Date(bestGrossRecord.completedAt).toLocaleDateString(),
        testTitle: bestGrossRecord.presetTitle || bestGrossRecord.passageTitle,
      });
    }

    return records;
  }
}
