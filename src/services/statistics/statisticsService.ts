import { PracticeResult, DailyProgress } from '@/types';
import { storageService } from '../storage/storageService';

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
    const results = await storage.getResults(profileId);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayProgress = await storage.getDailyProgress(profileId, todayStr);

    if (results.length === 0) {
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

    const totalTests = results.length;
    const totalNetWpm = results.reduce((acc, r) => acc + r.netWpm, 0);
    const averageNetWpm = Math.round(totalNetWpm / totalTests);
    const peakNetWpm = Math.round(Math.max(...results.map((r) => r.netWpm)));
    const totalAccuracy = results.reduce((acc, r) => acc + r.accuracy, 0);
    const averageAccuracy = Math.round((totalAccuracy / totalTests) * 10) / 10;
    const totalSeconds = results.reduce((acc, r) => acc + r.durationSeconds, 0);
    const totalPracticeMinutes = Math.round((totalSeconds / 60) * 10) / 10;

    // Calculate streak days
    const uniqueDays = Array.from(
      new Set(
        results.map((r) => {
          const d = new Date(r.completedAt);
          return d.toISOString().split('T')[0];
        })
      )
    ).sort().reverse();

    let streak = 0;
    const checkDate = new Date();
    // Allow today or yesterday as starting point for streak
    for (let i = 0; i < 365; i++) {
      const dayStr = checkDate.toISOString().split('T')[0];
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

    const todayStr = new Date(result.completedAt).toISOString().split('T')[0];
    const existingProgress = await storage.getDailyProgress(result.profileId, todayStr);
    
    const minutesAdded = result.durationSeconds / 60;
    const currentMinutes = existingProgress ? existingProgress.minutesPracticed + minutesAdded : minutesAdded;
    const currentCompleted = existingProgress ? existingProgress.lessonsCompleted + 1 : 1;

    // Fetch profile daily practice goal
    const profile = await storage.getProfileById(result.profileId);
    const goalMinutes = profile?.preferences.dailyPracticeGoal || 15;

    const updatedProgress: DailyProgress = {
      profileId: result.profileId,
      date: todayStr,
      minutesPracticed: currentMinutes,
      lessonsCompleted: currentCompleted,
      goalAchieved: currentMinutes >= goalMinutes,
    };

    await storage.saveDailyProgress(updatedProgress);
  }
}
