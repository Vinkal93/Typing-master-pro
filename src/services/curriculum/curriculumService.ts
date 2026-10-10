import { CourseLevelDef, CourseLevelId, LmsLesson } from '@/types/lms';
import { LEVEL_1_LESSONS } from './level1';
import { LEVEL_2_LESSONS } from './level2';
import { LEVEL_3_LESSONS } from './level3';
import { LEVEL_4_LESSONS } from './level4';
import { LEVEL_5_LESSONS } from './level5';
import { LEVEL_6_LESSONS } from './level6';

export const COURSE_LEVEL_DEFINITIONS: CourseLevelDef[] = [
  {
    id: 1,
    name: 'Absolute Beginner',
    nameHindi: 'प्रारंभिक अभ्यास (होम रो एवं वर्णमाला)',
    shortTitle: 'Level 1: Beginner',
    description: 'Establish foundational tactile memory on the InScript home row, top row anchors, and core consonants without looking at the keyboard.',
    lessonCount: 25,
    defaultMinAccuracy: 85,
    defaultMinWpm: 0,
    badgeColor: 'bg-emerald-500',
  },
  {
    id: 2,
    name: 'Basic Typing',
    nameHindi: 'मूल टंकण (मात्राएं, शिफ्ट कुंजी एवं अनुस्वार)',
    shortTitle: 'Level 2: Basic',
    description: 'Master all primary and secondary vowel matras, shift-key aspirated consonants, anusvara, and simple words.',
    lessonCount: 30,
    defaultMinAccuracy: 90,
    defaultMinWpm: 0,
    badgeColor: 'bg-blue-500',
  },
  {
    id: 3,
    name: 'Word Master',
    nameHindi: 'शब्द प्रवीण (हलंत, संयुक्ताक्षर एवं शब्दावली)',
    shortTitle: 'Level 3: Word Master',
    description: 'Learn the precise halant-based conjunct mechanics (प्र, त्र, क्ष, ज्ञ, श्र, द्ध), compound words, and vocabulary pacing.',
    lessonCount: 30,
    defaultMinAccuracy: 92,
    defaultMinWpm: 15,
    badgeColor: 'bg-indigo-500',
  },
  {
    id: 4,
    name: 'Sentence Expert',
    nameHindi: 'वाक्य विशेषज्ञ (विराम चिन्ह, पैराग्राफ एवं गति)',
    shortTitle: 'Level 4: Sentence Expert',
    description: 'Type structured Hindi sentences, commas, purna viram, conversational dialogues, and multi-line paragraphs.',
    lessonCount: 25,
    defaultMinAccuracy: 94,
    defaultMinWpm: 20,
    badgeColor: 'bg-violet-500',
  },
  {
    id: 5,
    name: 'Professional Typist',
    nameHindi: 'व्यावसायिक टंकक (शासकीय पत्र, कार्यालय ज्ञापन एवं विधि)',
    shortTitle: 'Level 5: Professional',
    description: 'Master formal government memorandums, circulars, legal affidavits, audit reports, and administrative drafting at 25+ WPM.',
    lessonCount: 25,
    defaultMinAccuracy: 95,
    defaultMinWpm: 25,
    badgeColor: 'bg-amber-500',
  },
  {
    id: 6,
    name: 'Ultra Advanced',
    nameHindi: 'महाप्रवीण (सीपीसीटी, कोर्ट स्टेनो एवं शास्त्रीय गद्य)',
    shortTitle: 'Level 6: Ultra Advanced',
    description: 'Conquer rare Sanskrit conjuncts, CPCT exam marathons, judicial depositions, and parliamentary Hansard at 30+ to 40 WPM.',
    lessonCount: 25,
    defaultMinAccuracy: 97,
    defaultMinWpm: 30,
    badgeColor: 'bg-rose-500',
  },
];

const ALL_LESSONS: LmsLesson[] = [
  ...LEVEL_1_LESSONS,
  ...LEVEL_2_LESSONS,
  ...LEVEL_3_LESSONS,
  ...LEVEL_4_LESSONS,
  ...LEVEL_5_LESSONS,
  ...LEVEL_6_LESSONS,
];

const LESSON_MAP = new Map<string, LmsLesson>(ALL_LESSONS.map((l) => [l.id, l]));

export class CurriculumService {
  /**
   * Get all 160 curriculum lessons in strict sequential order.
   */
  public static getAllLessons(): LmsLesson[] {
    return ALL_LESSONS;
  }

  /**
   * Total number of lessons in the curriculum.
   */
  public static getTotalLessonCount(): number {
    return ALL_LESSONS.length;
  }

  /**
   * Get all lessons for a specific level (1-6).
   */
  public static getLessonsByLevel(levelId: CourseLevelId): LmsLesson[] {
    return ALL_LESSONS.filter((l) => l.levelId === levelId);
  }

  /**
   * Get lesson definition by unique ID.
   */
  public static getLessonById(id: string): LmsLesson | undefined {
    return LESSON_MAP.get(id);
  }

  /**
   * Get lesson by 1-based globalIndex (1 to 160).
   */
  public static getLessonByGlobalIndex(index: number): LmsLesson | undefined {
    return ALL_LESSONS.find((l) => l.globalIndex === index);
  }

  /**
   * Get level metadata definition.
   */
  public static getLevelDef(levelId: CourseLevelId): CourseLevelDef | undefined {
    return COURSE_LEVEL_DEFINITIONS.find((def) => def.id === levelId);
  }

  /**
   * Get all level definitions.
   */
  public static getAllLevelDefs(): CourseLevelDef[] {
    return COURSE_LEVEL_DEFINITIONS;
  }

  /**
   * Get next lesson in sequence, or undefined if at the very end.
   */
  public static getNextLesson(currentLessonId: string): LmsLesson | undefined {
    const current = LESSON_MAP.get(currentLessonId);
    if (!current) return undefined;
    return this.getLessonByGlobalIndex(current.globalIndex + 1);
  }

  /**
   * Get previous lesson in sequence, or undefined if at the first lesson.
   */
  public static getPreviousLesson(currentLessonId: string): LmsLesson | undefined {
    const current = LESSON_MAP.get(currentLessonId);
    if (!current) return undefined;
    return this.getLessonByGlobalIndex(current.globalIndex - 1);
  }

  /**
   * Get the first lesson of a level.
   */
  public static getFirstLessonOfLevel(levelId: CourseLevelId): LmsLesson | undefined {
    return ALL_LESSONS.find((l) => l.levelId === levelId && l.order === 1);
  }
}
