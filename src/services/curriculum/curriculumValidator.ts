import { CurriculumService } from './curriculumService';
import { LmsLesson } from '@/types/lms';

export interface ValidationIssue {
  lessonId: string;
  field: string;
  message: string;
}

export interface CurriculumValidationResult {
  isValid: boolean;
  totalLessons: number;
  levelCounts: Record<number, number>;
  issues: ValidationIssue[];
}

export class CurriculumValidator {
  public static validateAll(): CurriculumValidationResult {
    const lessons = CurriculumService.getAllLessons();
    const issues: ValidationIssue[] = [];
    const seenIds = new Set<string>();
    const seenIndices = new Set<number>();
    const levelCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    lessons.forEach((lesson, i) => {
      // 1. ID check
      if (!lesson.id || typeof lesson.id !== 'string') {
        issues.push({ lessonId: `idx_${i}`, field: 'id', message: 'Lesson id is missing or not a string' });
      } else if (seenIds.has(lesson.id)) {
        issues.push({ lessonId: lesson.id, field: 'id', message: `Duplicate lesson id: ${lesson.id}` });
      } else {
        seenIds.add(lesson.id);
      }

      // 2. Global index check
      if (seenIndices.has(lesson.globalIndex)) {
        issues.push({ lessonId: lesson.id, field: 'globalIndex', message: `Duplicate global index: ${lesson.globalIndex}` });
      } else {
        seenIndices.add(lesson.globalIndex);
      }

      if (lesson.globalIndex !== i + 1) {
        issues.push({
          lessonId: lesson.id,
          field: 'globalIndex',
          message: `Expected globalIndex ${i + 1}, found ${lesson.globalIndex}`,
        });
      }

      // 3. Level ID
      if (lesson.levelId >= 1 && lesson.levelId <= 6) {
        levelCounts[lesson.levelId] = (levelCounts[lesson.levelId] || 0) + 1;
      } else {
        issues.push({ lessonId: lesson.id, field: 'levelId', message: `Invalid levelId: ${lesson.levelId}` });
      }

      // 4. Texts
      if (!lesson.title?.trim()) {
        issues.push({ lessonId: lesson.id, field: 'title', message: 'Title is empty' });
      }
      if (!lesson.titleHindi?.trim()) {
        issues.push({ lessonId: lesson.id, field: 'titleHindi', message: 'Title Hindi is empty' });
      }
      if (!lesson.description?.trim()) {
        issues.push({ lessonId: lesson.id, field: 'description', message: 'Description is empty' });
      }

      // 5. Stage A Learn
      if (!lesson.stageA_Learn?.title?.trim() || !lesson.stageA_Learn?.explanation?.trim()) {
        issues.push({ lessonId: lesson.id, field: 'stageA_Learn', message: 'Stage A Learn is missing title or explanation' });
      }

      // 6. Stage B Guided
      if (!lesson.stageB_Guided?.targetText?.trim()) {
        issues.push({ lessonId: lesson.id, field: 'stageB_Guided', message: 'Stage B targetText is empty' });
      }

      // 7. Stage C Independent
      if (!lesson.stageC_Independent?.targetText?.trim()) {
        issues.push({ lessonId: lesson.id, field: 'stageC_Independent', message: 'Stage C targetText is empty' });
      }

      // 8. Stage D Test
      if (!lesson.stageD_Test?.targetText?.trim()) {
        issues.push({ lessonId: lesson.id, field: 'stageD_Test', message: 'Stage D targetText is empty' });
      }

      // 9. Passing criteria
      if (!lesson.passingCriteria || lesson.passingCriteria.minAccuracy <= 0) {
        issues.push({ lessonId: lesson.id, field: 'passingCriteria', message: 'Invalid minAccuracy in passing criteria' });
      }

      // 10. Prerequisites check (lesson 1 may have empty prerequisites, others should point to known lessons)
      if (i > 0) {
        if (!lesson.prerequisites || lesson.prerequisites.length === 0) {
          issues.push({ lessonId: lesson.id, field: 'prerequisites', message: 'Missing prerequisites for non-first lesson' });
        } else {
          lesson.prerequisites.forEach((prereqId) => {
            if (!seenIds.has(prereqId) && !lessons.some((l) => l.id === prereqId)) {
              issues.push({
                lessonId: lesson.id,
                field: 'prerequisites',
                message: `Prerequisite "${prereqId}" does not exist in curriculum`,
              });
            }
          });
        }
      }
    });

    return {
      isValid: issues.length === 0,
      totalLessons: lessons.length,
      levelCounts,
      issues,
    };
  }
}
