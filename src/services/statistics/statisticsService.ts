import { PracticeResult, DailyProgress } from '@/types';
import { storageService } from '../storage/storageService';
import { CurriculumService } from '../curriculum/curriculumService';

export interface ProfileStatistics {
  hasData: boolean;
  totalTests: number;
  averageNetWpm: number;
  peakNetWpm: number;
  averageAccuracy: number;
  totalPracticeMinutes: number;
  todayMinutes: number;
  currentStreakDays: number;
  recentResults: PracticeResult[];
}

export class StatisticsService {
  public static async getProfileStatistics(profileId: string): Promise<ProfileStatistics> {
    const storage = await storageService.getAdapter();
    const [results, examResults, lessonProgress] = await Promise.all([
      storage.getResults(profileId),
      storage.getExamResults(profileId),
      storage.getLessonProgress(profileId),
    ]);

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayProgress = await storage.getDailyProgress(profileId, todayStr);

    const totalTests = results.length + examResults.length;

    if (totalTests === 0 && lessonProgress.length === 0) {
      return {
        hasData: false,
        totalTests: 0,
        averageNetWpm: 0,
        peakNetWpm: 0,
        averageAccuracy: 0,
        totalPracticeMinutes: todayProgress ? Math.round(todayProgress.minutesPracticed) : 0,
        todayMinutes: todayProgress ? Math.round(todayProgress.minutesPracticed) : 0,
        currentStreakDays: 0,
        recentResults: [],
      };
    }

    const allNetWpms = [
      ...results.map((r) => r.netWpm),
      ...examResults.map((e) => e.scoring?.netWpm ?? 0),
    ];
    const totalNetWpm = allNetWpms.reduce((acc, r) => acc + r, 0);
    const averageNetWpm = totalTests > 0 ? Math.round(totalNetWpm / totalTests) : 0;
    const peakNetWpm = allNetWpms.length > 0 ? Math.round(Math.max(...allNetWpms)) : 0;

    const allAccuracies = [
      ...results.map((r) => r.accuracy),
      ...examResults.map((e) => e.scoring?.accuracy ?? 0),
    ];
    const totalAccuracy = allAccuracies.reduce((acc, r) => acc + r, 0);
    const averageAccuracy = totalTests > 0 ? Math.round((totalAccuracy / totalTests) * 10) / 10 : 0;

    const practiceSeconds = results.reduce((acc, r) => acc + r.durationSeconds, 0);
    const examSeconds = examResults.reduce((acc, e) => acc + (e.actualDurationSeconds || e.targetDurationSeconds || 0), 0);

    let lmsMinutes = 0;
    for (const p of lessonProgress) {
      const lesson = CurriculumService.getLessonById(p.lessonId);
      const minutesPerAttempt = lesson?.expectedDurationMinutes || 3;
      const attempts = p.attemptsCount > 0 ? p.attemptsCount : (p.isCompleted ? 1 : 0);
      lmsMinutes += attempts * minutesPerAttempt;
    }
    const lmsSeconds = lmsMinutes * 60;

    const totalSeconds = practiceSeconds + examSeconds + lmsSeconds;
    const totalPracticeMinutes = Math.round((totalSeconds / 60) * 10) / 10;

    // Calculate streak days using local date strings across all activities
    const allTimestamps: number[] = [
      ...results.map((r) => r.completedAt),
      ...examResults.map((e) => e.completedAt),
      ...lessonProgress
        .map((p) => p.completedAt || p.lastAttemptAt)
        .filter((ts): ts is number => typeof ts === 'number' && ts > 0),
    ];

    const uniqueDays = Array.from(
      new Set(
        allTimestamps.map((ts) => {
          const d = new Date(ts);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })
      )
    ).sort().reverse();

    let streak = 0;
    const checkDate = new Date();
    // Allow today or yesterday as starting point for streak
    for (let i = 0; i < 365; i++) {
      const dayStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (uniqueDays.includes(dayStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // Today has no test yet, check if yesterday did
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      hasData: true,
      totalTests,
      averageNetWpm,
      peakNetWpm,
      averageAccuracy,
      totalPracticeMinutes,
      todayMinutes: todayProgress ? Math.round(todayProgress.minutesPracticed) : 0,
      currentStreakDays: streak,
      recentResults: results.slice(0, 5),
    };
  }

  public static async recordPracticeResult(result: PracticeResult): Promise<void> {
    const storage = await storageService.getAdapter();
    await storage.saveResult(result);
    await this.recordDailyProgress(result.profileId, result.durationSeconds, true, result.completedAt);
  }

  public static async recordDailyProgress(
    profileId: string,
    durationSeconds: number,
    incrementCompletedLesson: boolean = false,
    timestamp: number = Date.now()
  ): Promise<void> {
    const storage = await storageService.getAdapter();
    const dateObj = new Date(timestamp);
    const todayStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    const existingProgress = await storage.getDailyProgress(profileId, todayStr);

    const minutesAdded = durationSeconds / 60;
    const currentMinutes = existingProgress ? existingProgress.minutesPracticed + minutesAdded : minutesAdded;
    const currentCompleted = existingProgress
      ? existingProgress.lessonsCompleted + (incrementCompletedLesson ? 1 : 0)
      : (incrementCompletedLesson ? 1 : 0);

    // Fetch profile daily practice goal
    const profile = await storage.getProfileById(profileId);
    const goalMinutes = profile?.preferences.dailyPracticeGoal || 15;

    const updatedProgress: DailyProgress = {
      profileId,
      date: todayStr,
      minutesPracticed: currentMinutes,
      lessonsCompleted: currentCompleted,
      goalAchieved: currentMinutes >= goalMinutes,
    };

    await storage.saveDailyProgress(updatedProgress);
  }
}
