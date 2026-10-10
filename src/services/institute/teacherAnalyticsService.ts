import { storageService } from '../storage/storageService';
import {
  TeacherAnalyticsSummary,
  BatchPerformanceAggregate,
  AtRiskStudent,
} from '@/types/analytics';
import { InstituteUser } from '@/types/institute';

export class TeacherAnalyticsService {
  /**
   * Computes scoped teacher analytics for authorized batches.
   */
  public static async getTeacherAnalytics(
    user: InstituteUser
  ): Promise<TeacherAnalyticsSummary> {
    const adapter = await storageService.getAdapter();
    const allBatches = await adapter.getBatches();
    const allStudents = await adapter.getInstituteStudents();

    // Scope batches to teacher authorization
    const authorizedBatches =
      user.role === 'admin'
        ? allBatches
        : allBatches.filter((b) => user.assignedBatchIds.includes(b.id));

    const authorizedBatchIds = new Set(authorizedBatches.map((b) => b.id));
    const authorizedStudents = allStudents.filter(
      (s) => authorizedBatchIds.has(s.batchId) && s.status === 'active'
    );

    const batchAggregates: BatchPerformanceAggregate[] = [];
    const atRiskStudents: AtRiskStudent[] = [];
    const weakKeyCountMap = new Map<string, { code: string; count: number }>();
    const achievementDistribution: Record<string, number> = {};

    const now = Date.now();

    for (const batch of authorizedBatches) {
      const batchStudents = authorizedStudents.filter((s) => s.batchId === batch.id);

      let totalNetWpm = 0;
      let totalAccuracy = 0;
      let evaluatedCount = 0;
      let totalExamsCompleted = 0;

      for (const st of batchStudents) {
        const exams = await adapter.getExamResults(st.id);
        const lmsProgress = await adapter.getLessonProgress(st.id);
        const achievements = await adapter.getStudentAchievements(st.id);
        const heatStats = await adapter.getKeyHeatmapStats(st.id);

        totalExamsCompleted += exams.length;

        // Tally achievements
        achievements.forEach((ach) => {
          achievementDistribution[ach.achievementTitle] =
            (achievementDistribution[ach.achievementTitle] || 0) + 1;
        });

        // Tally weak keys for this student
        heatStats.forEach((stat) => {
          if (stat.accuracyPct < 80 && stat.totalAttempts >= 5) {
            const existing = weakKeyCountMap.get(stat.char) || { code: stat.code, count: 0 };
            weakKeyCountMap.set(stat.char, { code: stat.code, count: existing.count + 1 });
          }
        });

        // Performance evaluation
        if (exams.length > 0) {
          const avgAcc = exams.reduce((p, c) => p + c.scoring.accuracy, 0) / exams.length;
          const avgNet = exams.reduce((p, c) => p + c.scoring.netWpm, 0) / exams.length;

          totalNetWpm += avgNet;
          totalAccuracy += avgAcc;
          evaluatedCount++;

          const lastExamDate = Math.max(...exams.map((e) => e.completedAt));
          const daysAgo = Math.floor((now - lastExamDate) / 86400000);

          // Identify At-Risk Students
          if (avgAcc < 85) {
            atRiskStudents.push({
              studentId: st.id,
              studentName: st.name,
              rollNo: st.rollNo,
              batchName: batch.name,
              lastActiveDaysAgo: daysAgo,
              avgAccuracy: Math.round(avgAcc * 10) / 10,
              avgNetWpm: Math.round(avgNet),
              primaryRiskFactor: 'low_accuracy',
              riskSeverity: avgAcc < 75 ? 'high' : 'medium',
            });
          } else if (avgNet < 20) {
            atRiskStudents.push({
              studentId: st.id,
              studentName: st.name,
              rollNo: st.rollNo,
              batchName: batch.name,
              lastActiveDaysAgo: daysAgo,
              avgAccuracy: Math.round(avgAcc * 10) / 10,
              avgNetWpm: Math.round(avgNet),
              primaryRiskFactor: 'low_speed',
              riskSeverity: avgNet < 15 ? 'high' : 'medium',
            });
          } else if (daysAgo > 7) {
            atRiskStudents.push({
              studentId: st.id,
              studentName: st.name,
              rollNo: st.rollNo,
              batchName: batch.name,
              lastActiveDaysAgo: daysAgo,
              avgAccuracy: Math.round(avgAcc * 10) / 10,
              avgNetWpm: Math.round(avgNet),
              primaryRiskFactor: 'inactivity',
              riskSeverity: daysAgo > 14 ? 'high' : 'medium',
            });
          }
        } else {
          // No exams taken yet
          atRiskStudents.push({
            studentId: st.id,
            studentName: st.name,
            rollNo: st.rollNo,
            batchName: batch.name,
            lastActiveDaysAgo: 99,
            avgAccuracy: 0,
            avgNetWpm: 0,
            primaryRiskFactor: 'inactivity',
            riskSeverity: 'medium',
          });
        }
      }

      const avgNetWpm = evaluatedCount > 0 ? Math.round((totalNetWpm / evaluatedCount) * 10) / 10 : 0;
      const avgAccuracy = evaluatedCount > 0 ? Math.round((totalAccuracy / evaluatedCount) * 10) / 10 : 0;
      const completionRatePct = batchStudents.length > 0 ? Math.round((evaluatedCount / batchStudents.length) * 100) : 0;

      batchAggregates.push({
        batchId: batch.id,
        batchName: batch.name,
        studentCount: batchStudents.length,
        avgNetWpm,
        avgAccuracy,
        totalTestsCompleted: totalExamsCompleted,
        completionRatePct,
        topWeakKeys: [],
      });
    }

    const weakKeysAcrossBatches = Array.from(weakKeyCountMap.entries())
      .map(([char, data]) => ({ char, code: data.code, failCount: data.count }))
      .sort((a, b) => b.failCount - a.failCount)
      .slice(0, 10);

    return {
      teacherId: user.id,
      teacherName: user.name,
      totalStudents: authorizedStudents.length,
      totalBatches: authorizedBatches.length,
      batchAggregates,
      atRiskStudents,
      weakKeysAcrossBatches,
      achievementDistribution,
    };
  }
}
