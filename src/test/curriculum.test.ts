import { describe, it, expect } from 'vitest';
import { CurriculumService, COURSE_LEVEL_DEFINITIONS } from '@/services/curriculum/curriculumService';
import { CurriculumValidator } from '@/services/curriculum/curriculumValidator';

describe('Phase 3: Curriculum Integrity (160 Lessons)', () => {
  it('should have exactly 6 levels defined with correct lesson targets', () => {
    expect(COURSE_LEVEL_DEFINITIONS).toHaveLength(6);
    expect(COURSE_LEVEL_DEFINITIONS.map((l) => l.lessonCount)).toEqual([25, 30, 30, 25, 25, 25]);
    const totalExpected = COURSE_LEVEL_DEFINITIONS.reduce((acc, c) => acc + c.lessonCount, 0);
    expect(totalExpected).toBe(160);
  });

  it('should load exactly 160 genuine educational lessons without duplicates', () => {
    const allLessons = CurriculumService.getAllLessons();
    expect(allLessons).toHaveLength(160);
    expect(CurriculumService.getTotalLessonCount()).toBe(160);

    // Level breakdown
    expect(CurriculumService.getLessonsByLevel(1)).toHaveLength(25);
    expect(CurriculumService.getLessonsByLevel(2)).toHaveLength(30);
    expect(CurriculumService.getLessonsByLevel(3)).toHaveLength(30);
    expect(CurriculumService.getLessonsByLevel(4)).toHaveLength(25);
    expect(CurriculumService.getLessonsByLevel(5)).toHaveLength(25);
    expect(CurriculumService.getLessonsByLevel(6)).toHaveLength(25);
  });

  it('should pass CurriculumValidator with 0 issues', () => {
    const validation = CurriculumValidator.validateAll();
    if (!validation.isValid) {
      console.error('Validation issues:', validation.issues);
    }
    expect(validation.isValid).toBe(true);
    expect(validation.issues).toHaveLength(0);
    expect(validation.totalLessons).toBe(160);
    expect(validation.levelCounts).toEqual({
      1: 25,
      2: 30,
      3: 30,
      4: 25,
      5: 25,
      6: 25,
    });
  });

  it('should verify sequential navigation helpers', () => {
    const firstLesson = CurriculumService.getFirstLessonOfLevel(1);
    expect(firstLesson).toBeDefined();
    expect(firstLesson?.globalIndex).toBe(1);

    const secondLesson = CurriculumService.getNextLesson(firstLesson!.id);
    expect(secondLesson).toBeDefined();
    expect(secondLesson?.globalIndex).toBe(2);

    const prevOfSecond = CurriculumService.getPreviousLesson(secondLesson!.id);
    expect(prevOfSecond?.id).toBe(firstLesson!.id);

    // Prev of first should be undefined
    expect(CurriculumService.getPreviousLesson(firstLesson!.id)).toBeUndefined();

    // Next of 160th should be undefined
    const lastLesson = CurriculumService.getLessonByGlobalIndex(160);
    expect(lastLesson).toBeDefined();
    expect(CurriculumService.getNextLesson(lastLesson!.id)).toBeUndefined();
  });
});
