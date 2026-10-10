import { storageService } from '../storage/storageService';
import {
  AchievementDefinition,
  StudentAchievement,
  AchievementMilestoneSettings,
} from '@/types/analytics';

export const SYSTEM_ACHIEVEMENTS: AchievementDefinition[] = [
  // --- CURRICULUM & LESSONS ---
  {
    id: 'ach_first_lesson',
    code: 'FIRST_LESSON',
    title: 'First Step',
    titleHindi: 'पहला कदम',
    description: 'Complete your first typing lesson in the curriculum',
    descriptionHindi: 'पाठ्यक्रम का अपना पहला पाठ सफलतापूर्वक पूरा करें',
    category: 'curriculum',
    tier: 'bronze',
    iconName: 'Footprints',
    requiredMetric: 'completedLessons',
    threshold: 1,
    customizable: false,
  },
  {
    id: 'ach_level1_complete',
    code: 'LEVEL1_COMPLETE',
    title: 'Beginner Graduate',
    titleHindi: 'आरंभिक स्नातक',
    description: 'Complete all 25 lessons of Level 1 Absolute Beginner',
    descriptionHindi: 'स्तर 1 के सभी 25 पाठ सफलतापूर्वक उत्तीर्ण करें',
    category: 'curriculum',
    tier: 'silver',
    iconName: 'Award',
    requiredMetric: 'level1Completed',
    threshold: 25,
    customizable: false,
  },
  {
    id: 'ach_all_levels',
    code: 'ALL_LEVELS_MASTER',
    title: 'Grand Typist',
    titleHindi: 'टंकण शिरोमणि',
    description: 'Master all 160 lessons across all 6 levels',
    descriptionHindi: 'सभी 6 स्तरों के 160 पाठों में दक्षता प्राप्त करें',
    category: 'curriculum',
    tier: 'platinum',
    iconName: 'Crown',
    requiredMetric: 'completedLessons',
    threshold: 160,
    customizable: false,
  },

  // --- EXAMINATION ---
  {
    id: 'ach_first_exam',
    code: 'FIRST_EXAM',
    title: 'Exam Debut',
    titleHindi: 'परीक्षा का आगाज़',
    description: 'Complete your first official typing speed examination',
    descriptionHindi: 'अपनी पहली आधिकारिक टंकण परीक्षा पूरी करें',
    category: 'exam',
    tier: 'bronze',
    iconName: 'FileCheck',
    requiredMetric: 'completedExams',
    threshold: 1,
    customizable: false,
  },
  {
    id: 'ach_exam_veteran',
    code: 'EXAM_VETERAN',
    title: 'Test Veteran',
    titleHindi: 'परीक्षा विशेषज्ञ',
    description: 'Complete 10 or more typing examinations',
    descriptionHindi: '10 या अधिक आधिकारिक परीक्षाएं सफलतापूर्वक संपन्न करें',
    category: 'exam',
    tier: 'gold',
    iconName: 'Medal',
    requiredMetric: 'completedExams',
    threshold: 10,
    customizable: false,
  },

  // --- SPEED MILESTONES ---
  {
    id: 'ach_speed_20',
    code: 'SPEED_20',
    title: 'Steady Hands',
    titleHindi: 'सधी उँगलियाँ',
    description: 'Achieve 20+ Net WPM in an examination',
    descriptionHindi: 'परीक्षा में 20+ शुद्ध WPM की गति प्राप्त करें',
    category: 'speed',
    tier: 'bronze',
    iconName: 'Gauge',
    requiredMetric: 'netWpm',
    threshold: 20,
    customizable: true,
  },
  {
    id: 'ach_speed_30',
    code: 'SPEED_30',
    title: 'Pace Setter',
    titleHindi: 'गति की उड़ान',
    description: 'Achieve 30+ Net WPM in an examination',
    descriptionHindi: 'परीक्षा में 30+ शुद्ध WPM की गति प्राप्त करें',
    category: 'speed',
    tier: 'silver',
    iconName: 'Zap',
    requiredMetric: 'netWpm',
    threshold: 30,
    customizable: true,
  },
  {
    id: 'ach_speed_40',
    code: 'SPEED_40',
    title: 'Speed Specialist',
    titleHindi: 'गति प्रवीण',
    description: 'Achieve 40+ Net WPM in an examination',
    descriptionHindi: 'परीक्षा में 40+ शुद्ध WPM की गति प्राप्त करें',
    category: 'speed',
    tier: 'gold',
    iconName: 'Flame',
    requiredMetric: 'netWpm',
    threshold: 40,
    customizable: true,
  },
  {
    id: 'ach_speed_50',
    code: 'SPEED_50',
    title: 'Lightning Typist',
    titleHindi: 'विद्युत गति',
    description: 'Achieve 50+ Net WPM in an examination',
    descriptionHindi: 'परीक्षा में 50+ शुद्ध WPM की सुपर गति प्राप्त करें',
    category: 'speed',
    tier: 'platinum',
    iconName: 'Sparkles',
    requiredMetric: 'netWpm',
    threshold: 50,
    customizable: true,
  },

  // --- ACCURACY MILESTONES ---
  {
    id: 'ach_acc_90',
    code: 'ACCURACY_90',
    title: 'Precision Marksman',
    titleHindi: 'सटीक निशानेबाज',
    description: 'Score 90%+ accuracy in an official examination',
    descriptionHindi: 'आधिकारिक परीक्षा में 90%+ सटीकता प्राप्त करें',
    category: 'accuracy',
    tier: 'bronze',
    iconName: 'Target',
    requiredMetric: 'accuracy',
    threshold: 90,
    customizable: false,
  },
  {
    id: 'ach_acc_95',
    code: 'ACCURACY_95',
    title: 'Sharp Typist',
    titleHindi: 'अचूक टंकक',
    description: 'Score 95%+ accuracy in an official examination',
    descriptionHindi: 'आधिकारिक परीक्षा में 95%+ सटीकता प्राप्त करें',
    category: 'accuracy',
    tier: 'silver',
    iconName: 'Crosshair',
    requiredMetric: 'accuracy',
    threshold: 95,
    customizable: true,
  },
  {
    id: 'ach_acc_98',
    code: 'ACCURACY_98',
    title: 'Flawless Precision',
    titleHindi: 'त्रुटिहीन शुद्धता',
    description: 'Score 98%+ accuracy in an official examination',
    descriptionHindi: 'आधिकारिक परीक्षा में 98%+ शुद्धता प्राप्त करें',
    category: 'accuracy',
    tier: 'gold',
    iconName: 'CheckCircle2',
    requiredMetric: 'accuracy',
    threshold: 98,
    customizable: false,
  },
  {
    id: 'ach_acc_100',
    code: 'ACCURACY_100',
    title: 'Absolute Perfection',
    titleHindi: 'शत-प्रतिशत सटीकता',
    description: 'Score 100% accuracy on a complete typing test',
    descriptionHindi: 'बिना एक भी गलती के शत-प्रतिशत 100% सटीकता प्राप्त करें',
    category: 'accuracy',
    tier: 'platinum',
    iconName: 'Gem',
    requiredMetric: 'accuracy',
    threshold: 100,
    customizable: false,
  },

  // --- CONSISTENCY & STREAKS ---
  {
    id: 'ach_streak_3',
    code: 'STREAK_3',
    title: 'Daily Dedication',
    titleHindi: 'नियमित अभ्यासी',
    description: 'Maintain a 3-day typing streak',
    descriptionHindi: 'लगातार 3 दिनों तक टंकण अभ्यास जारी रखें',
    category: 'consistency',
    tier: 'bronze',
    iconName: 'Calendar',
    requiredMetric: 'streakDays',
    threshold: 3,
    customizable: true,
  },
  {
    id: 'ach_streak_7',
    code: 'STREAK_7',
    title: 'Weekly Champion',
    titleHindi: 'सप्ताहिक योद्धा',
    description: 'Maintain a 7-day typing streak',
    descriptionHindi: 'लगातार 7 दिनों तक टंकण अभ्यास जारी रखें',
    category: 'consistency',
    tier: 'silver',
    iconName: 'Flame',
    requiredMetric: 'streakDays',
    threshold: 7,
    customizable: true,
  },
  {
    id: 'ach_streak_30',
    code: 'STREAK_30',
    title: 'Unstoppable Habit',
    titleHindi: 'अडिग निष्ठा',
    description: 'Maintain a 30-day typing streak',
    descriptionHindi: 'लगातार 30 दिनों का अटूट अभ्यास रिकॉर्ड बनाएं',
    category: 'consistency',
    tier: 'platinum',
    iconName: 'Trophy',
    requiredMetric: 'streakDays',
    threshold: 30,
    customizable: true,
  },
];

export class AchievementService {
  /**
   * Evaluates student eligibility and awards newly earned achievements.
   * Completely offline, prevents duplicate awards.
   */
  public static async evaluateAndAwardAchievements(
    profileId: string
  ): Promise<StudentAchievement[]> {
    const adapter = await storageService.getAdapter();
    const existingAchievements = await adapter.getStudentAchievements(profileId);
    const existingCodes = new Set(existingAchievements.map((a) => a.achievementCode));

    const examResults = await adapter.getExamResults(profileId);
    const lmsProgress = await adapter.getLessonProgress(profileId);
    const customSettings = await adapter.getAchievementSettings();

    // Derived student metrics
    const completedLessons = lmsProgress.filter((p) => p.isCompleted).length;
    const completedExams = examResults.length;
    const level1Completed = lmsProgress.filter(
      (p) => p.levelId === 1 && p.isCompleted
    ).length;

    let peakNetWpm = 0;
    let peakAccuracy = 0;

    examResults.forEach((ex) => {
      if (ex.scoring.netWpm > peakNetWpm) peakNetWpm = ex.scoring.netWpm;
      if (ex.scoring.accuracy > peakAccuracy) peakAccuracy = ex.scoring.accuracy;
    });

    // Approximate streak based on daily practice or active exams
    const activeDates = new Set(
      examResults.map((e) => new Date(e.completedAt).toISOString().split('T')[0])
    );
    const streakDays = activeDates.size;

    const newlyAwarded: StudentAchievement[] = [];

    for (const def of SYSTEM_ACHIEVEMENTS) {
      if (existingCodes.has(def.code)) continue; // Prevent duplicates

      let isEligible = false;
      let metricValue = 0;

      // Check customizable threshold overrides if any
      let targetThreshold = def.threshold;
      if (def.code === 'SPEED_20' && customSettings.minSpeedBronze) targetThreshold = customSettings.minSpeedBronze;
      if (def.code === 'SPEED_30' && customSettings.minSpeedSilver) targetThreshold = customSettings.minSpeedSilver;
      if (def.code === 'SPEED_40' && customSettings.minSpeedGold) targetThreshold = customSettings.minSpeedGold;
      if (def.code === 'SPEED_50' && customSettings.minSpeedPlatinum) targetThreshold = customSettings.minSpeedPlatinum;
      if (def.code === 'ACCURACY_95' && customSettings.minAccuracySilver) targetThreshold = customSettings.minAccuracySilver;
      if (def.code === 'STREAK_3' && customSettings.streakDaysSilver) targetThreshold = customSettings.streakDaysSilver;
      if (def.code === 'STREAK_7' && customSettings.streakDaysGold) targetThreshold = customSettings.streakDaysGold;
      if (def.code === 'STREAK_30' && customSettings.streakDaysPlatinum) targetThreshold = customSettings.streakDaysPlatinum;

      switch (def.requiredMetric) {
        case 'completedLessons':
          metricValue = completedLessons;
          isEligible = completedLessons >= targetThreshold;
          break;
        case 'level1Completed':
          metricValue = level1Completed;
          isEligible = level1Completed >= targetThreshold;
          break;
        case 'completedExams':
          metricValue = completedExams;
          isEligible = completedExams >= targetThreshold;
          break;
        case 'netWpm':
          metricValue = Math.round(peakNetWpm);
          isEligible = peakNetWpm >= targetThreshold;
          break;
        case 'accuracy':
          metricValue = Math.round(peakAccuracy * 10) / 10;
          isEligible = peakAccuracy >= targetThreshold;
          break;
        case 'streakDays':
          metricValue = streakDays;
          isEligible = streakDays >= targetThreshold;
          break;
      }

      if (isEligible) {
        const achievement: StudentAchievement = {
          id: `${profileId}_${def.code}`,
          profileId,
          achievementCode: def.code,
          achievementTitle: def.title,
          achievementTitleHindi: def.titleHindi,
          category: def.category,
          tier: def.tier,
          unlockedAt: Date.now(),
          metricValueAtUnlock: metricValue,
          viewed: false,
        };

        await adapter.saveStudentAchievement(achievement);
        newlyAwarded.push(achievement);
        existingCodes.add(def.code);
      }
    }

    return newlyAwarded;
  }

  /**
   * Retrieves all achievements for a profile, combining unlocked and locked ones.
   */
  public static async getStudentAchievementStatus(profileId: string): Promise<{
    unlocked: StudentAchievement[];
    allDefinitions: AchievementDefinition[];
    totalUnlocked: number;
    completionPct: number;
  }> {
    const adapter = await storageService.getAdapter();
    const unlocked = await adapter.getStudentAchievements(profileId);
    const totalUnlocked = unlocked.length;
    const completionPct = Math.round((totalUnlocked / SYSTEM_ACHIEVEMENTS.length) * 100);

    return {
      unlocked,
      allDefinitions: SYSTEM_ACHIEVEMENTS,
      totalUnlocked,
      completionPct,
    };
  }
}
