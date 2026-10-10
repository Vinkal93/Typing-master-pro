import {
  CourseLevelId,
  LmsLesson,
  LmsStudentSummary,
  LmsTeacherSettings,
  PassingCriteria,
  StudentLessonProgress,
  CharacterMistakeStat,
} from '@/types/lms';
import { CurriculumService } from '../curriculum/curriculumService';
import { storageService } from '../storage/storageService';

export interface StageEvaluationResult {
  passed: boolean;
  accuracy: number;
  netWpm: number;
  requiredAccuracy: number;
  requiredWpm: number;
  message: string;
}

export class ProgressionService {
  /**
   * Determine whether a lesson is unlocked for the student.
   */
  public static isLessonUnlocked(
    lesson: LmsLesson,
    studentProgress: StudentLessonProgress[],
    teacherSettings?: LmsTeacherSettings
  ): boolean {
    // 1. Teacher override
    if (teacherSettings?.unlockAllLessons) {
      return true;
    }

    // 2. Lesson 1 is always unlocked
    if (lesson.globalIndex === 1) {
      return true;
    }

    // 3. Explicit progress record already unlocked
    const record = studentProgress.find((p) => p.lessonId === lesson.id);
    if (record?.isUnlocked) {
      return true;
    }

    // 4. Prerequisite evaluation: every prerequisite must be completed
    if (!lesson.prerequisites || lesson.prerequisites.length === 0) {
      return true;
    }

    return lesson.prerequisites.every((prereqId) => {
      const prereqRecord = studentProgress.find((p) => p.lessonId === prereqId);
      return Boolean(prereqRecord?.isCompleted);
    });
  }

  /**
   * Get applicable passing criteria for a lesson, considering teacher overrides.
   */
  public static getEffectiveCriteria(
    lesson: LmsLesson,
    teacherSettings?: LmsTeacherSettings
  ): PassingCriteria {
    const override = teacherSettings?.customLevelThresholds?.[lesson.levelId];
    if (override) {
      return {
        minAccuracy: override.minAccuracy ?? lesson.passingCriteria.minAccuracy,
        minWpm: override.minWpm ?? lesson.passingCriteria.minWpm ?? 0,
      };
    }
    return {
      minAccuracy: lesson.passingCriteria.minAccuracy,
      minWpm: lesson.passingCriteria.minWpm ?? 0,
    };
  }

  /**
   * Evaluate whether a student passed a stage test.
   */
  public static evaluateStage(
    lesson: LmsLesson,
    stage: 'learn' | 'guided' | 'independent' | 'test',
    stats: { accuracy: number; netWpm: number },
    teacherSettings?: LmsTeacherSettings
  ): StageEvaluationResult {
    const criteria = this.getEffectiveCriteria(lesson, teacherSettings);
    const requiredAccuracy = stage === 'test' ? criteria.minAccuracy : 80;
    const requiredWpm = stage === 'test' ? (criteria.minWpm || 0) : 0;

    const accPassed = stats.accuracy >= requiredAccuracy;
    const wpmPassed = requiredWpm === 0 || stats.netWpm >= requiredWpm;
    const passed = accPassed && wpmPassed;

    let message = '';
    if (passed) {
      message = stage === 'test'
        ? `बधाई! आपने ${stats.accuracy.toFixed(1)}% शुद्धता और ${Math.round(stats.netWpm)} WPM के साथ पाठ सफलतापूर्वक उत्तीर्ण किया!`
        : 'चरण सफलतापूर्वक पूर्ण हुआ!';
    } else {
      if (!accPassed && !wpmPassed) {
        message = `पुनः प्रयास करें: न्यूनतम शुद्धता ${requiredAccuracy}% (आपकी: ${stats.accuracy.toFixed(1)}%) और गति ${requiredWpm} WPM (आपकी: ${Math.round(stats.netWpm)} WPM) आवश्यक है।`;
      } else if (!accPassed) {
        message = `पुनः प्रयास करें: न्यूनतम शुद्धता ${requiredAccuracy}% आवश्यक है (आपकी: ${stats.accuracy.toFixed(1)}%)।`;
      } else {
        message = `पुनः प्रयास करें: न्यूनतम गति ${requiredWpm} WPM आवश्यक है (आपकी: ${Math.round(stats.netWpm)} WPM)।`;
      }
    }

    return {
      passed,
      accuracy: stats.accuracy,
      netWpm: stats.netWpm,
      requiredAccuracy,
      requiredWpm,
      message,
    };
  }

  /**
   * Record attempt and update lesson progress.
   */
  public static async recordStageAttempt(
    profileId: string,
    lesson: LmsLesson,
    stage: 'learn' | 'guided' | 'independent' | 'test',
    stats: { accuracy: number; netWpm: number; durationSeconds: number },
    teacherSettings?: LmsTeacherSettings
  ): Promise<{ progress: StudentLessonProgress; nextUnlockedLessonId?: string; isPassed: boolean }> {
    const adapter = await storageService.getAdapter();
    const existing = await adapter.getLessonProgressById(profileId, lesson.id);

    const evaluation = this.evaluateStage(lesson, stage, stats, teacherSettings);
    const now = Date.now();

    const isTestStage = stage === 'test';
    const isCompleted = Boolean(existing?.isCompleted || (isTestStage && evaluation.passed));

    const stageHierarchy: Record<string, number> = {
      learn: 1,
      guided: 2,
      independent: 3,
      test: 4,
      completed: 5,
    };

    let nextStageReached = existing?.stageReached || 'learn';
    if (isCompleted) {
      nextStageReached = 'completed';
    } else if (stageHierarchy[stage] > (stageHierarchy[existing?.stageReached || 'learn'] || 1)) {
      nextStageReached = stage;
    }

    const updatedProgress: StudentLessonProgress = {
      id: `${profileId}_${lesson.id}`,
      profileId,
      lessonId: lesson.id,
      levelId: lesson.levelId,
      isUnlocked: true,
      isCompleted,
      stageReached: nextStageReached as any,
      bestAccuracy: Math.max(existing?.bestAccuracy || 0, stats.accuracy),
      bestNetWpm: Math.max(existing?.bestNetWpm || 0, stats.netWpm),
      attemptsCount: (existing?.attemptsCount || 0) + 1,
      lastAttemptAt: now,
      completedAt: isCompleted ? (existing?.completedAt || now) : undefined,
    };

    await adapter.saveLessonProgress(updatedProgress);

    let nextUnlockedLessonId: string | undefined = undefined;

    // If test stage passed, unlock next lesson in sequence
    if (isTestStage && evaluation.passed) {
      const nextLesson = CurriculumService.getNextLesson(lesson.id);
      if (nextLesson) {
        nextUnlockedLessonId = nextLesson.id;
        const nextExisting = await adapter.getLessonProgressById(profileId, nextLesson.id);
        const nextProgressRecord: StudentLessonProgress = {
          id: `${profileId}_${nextLesson.id}`,
          profileId,
          lessonId: nextLesson.id,
          levelId: nextLesson.levelId,
          isUnlocked: true,
          isCompleted: Boolean(nextExisting?.isCompleted),
          stageReached: nextExisting?.stageReached || 'learn',
          bestAccuracy: nextExisting?.bestAccuracy || 0,
          bestNetWpm: nextExisting?.bestNetWpm || 0,
          attemptsCount: nextExisting?.attemptsCount || 0,
          lastAttemptAt: nextExisting?.lastAttemptAt || now,
          completedAt: nextExisting?.completedAt,
        };
        await adapter.saveLessonProgress(nextProgressRecord);
      }
    }

    return {
      progress: updatedProgress,
      nextUnlockedLessonId,
      isPassed: evaluation.passed,
    };
  }

  /**
   * Compute comprehensive LMS summary statistics for a student profile.
   */
  public static computeSummary(
    profileId: string,
    progressList: StudentLessonProgress[],
    mistakes: CharacterMistakeStat[] = []
  ): LmsStudentSummary {
    const allLessons = CurriculumService.getAllLessons();
    const completedSet = new Set(
      progressList.filter((p) => p.isCompleted).map((p) => p.lessonId)
    );

    const totalCompleted = completedSet.size;
    const totalRemaining = Math.max(0, allLessons.length - totalCompleted);

    // Determine current lesson: first lesson that is not completed
    const currentLesson = allLessons.find((l) => !completedSet.has(l.id)) || allLessons[allLessons.length - 1];
    const currentLevelId = currentLesson.levelId;
    const currentLessonId = currentLesson.id;

    // Average metrics over completed lessons
    const completedProgress = progressList.filter((p) => p.isCompleted && p.bestAccuracy > 0);
    const averageAccuracy = completedProgress.length > 0
      ? completedProgress.reduce((sum, p) => sum + p.bestAccuracy, 0) / completedProgress.length
      : 0;

    const completedWithWpm = completedProgress.filter((p) => p.bestNetWpm > 0);
    const averageWpm = completedWithWpm.length > 0
      ? completedWithWpm.reduce((sum, p) => sum + p.bestNetWpm, 0) / completedWithWpm.length
      : 0;

    // Top weak characters
    const weakCharacters = [...mistakes]
      .filter((m) => m.errorCount > 0)
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, 8)
      .map((m) => ({
        char: m.char,
        keyCode: m.keyCode,
        errorCount: m.errorCount,
      }));

    return {
      currentLevelId,
      currentLessonId,
      totalCompleted,
      totalRemaining,
      averageAccuracy: Math.round(averageAccuracy * 10) / 10,
      averageWpm: Math.round(averageWpm),
      streakDays: totalCompleted > 0 ? 1 : 0,
      weakCharacters,
    };
  }
}
