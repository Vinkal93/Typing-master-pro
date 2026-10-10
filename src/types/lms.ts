/**
 * Phase 3: Smart Learning Management System (LMS) Domain Types.
 */

export type CourseLevelId = 1 | 2 | 3 | 4 | 5 | 6;

export type LessonDifficulty =
  | 'beginner'
  | 'basic'
  | 'intermediate'
  | 'advanced'
  | 'professional'
  | 'expert'
  | 'ultra_advanced';

export type LessonStageId = 'learn' | 'guided' | 'independent' | 'test';

export interface StageALearn {
  title: string;
  explanation: string;
  demoKeys: string[];
  fingerInstructions: string;
  tips: string;
}

export interface StageBGuided {
  targetText: string;
  guideNotes: string;
}

export interface StageCIndependent {
  targetText: string;
}

export interface StageDTest {
  targetText: string;
  timeLimitSeconds?: number;
}

export interface PassingCriteria {
  minAccuracy: number; // e.g. 85, 90, 92, 94, 95, 97
  minWpm?: number;      // e.g. 0, 15, 20, 25, 30
}

export interface LmsLesson {
  id: string;                         // e.g. 'l1_01_home_anchor'
  levelId: CourseLevelId;             // 1 to 6
  order: number;                      // 1 to N within level
  globalIndex: number;                // 1 to 160
  title: string;
  titleHindi: string;
  description: string;
  difficulty: LessonDifficulty;
  prerequisites: string[];            // IDs of prior lessons
  targetCharacters: string[];         // e.g. ['क', 'र', 'प']
  targetKeys: string[];               // e.g. ['KeyK', 'KeyJ', 'KeyH']
  stageA_Learn: StageALearn;
  stageB_Guided: StageBGuided;
  stageC_Independent: StageCIndependent;
  stageD_Test: StageDTest;
  expectedDurationMinutes: number;
  passingCriteria: PassingCriteria;
  revisionTags: string[];
}

export interface CourseLevelDef {
  id: CourseLevelId;
  name: string;
  nameHindi: string;
  shortTitle: string;
  description: string;
  lessonCount: number;
  defaultMinAccuracy: number;
  defaultMinWpm: number;
  badgeColor: string;
}

export interface StudentLessonProgress {
  id: string; // `${profileId}_${lessonId}`
  profileId: string;
  lessonId: string;
  levelId: CourseLevelId;
  isUnlocked: boolean;
  isCompleted: boolean;
  stageReached: 'learn' | 'guided' | 'independent' | 'test' | 'completed';
  bestAccuracy: number;
  bestNetWpm: number;
  attemptsCount: number;
  lastAttemptAt: number;
  completedAt?: number;
}

export interface CharacterMistakeStat {
  profileId: string;
  char: string;
  keyCode: string;
  errorCount: number;
  totalAttempts: number;
  lastErrorAt: number;
}

export interface LmsTeacherSettings {
  unlockAllLessons: boolean;
  customLevelThresholds: Record<CourseLevelId, PassingCriteria>;
}

export interface LmsStudentSummary {
  currentLevelId: CourseLevelId;
  currentLessonId: string;
  totalCompleted: number;
  totalRemaining: number;
  averageAccuracy: number;
  averageWpm: number;
  streakDays: number;
  weakCharacters: { char: string; errorCount: number; keyCode: string }[];
}
