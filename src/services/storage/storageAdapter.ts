import { StudentProfile, PracticeResult, DailyProgress } from '@/types';
import {
  StudentLessonProgress,
  CharacterMistakeStat,
  LmsTeacherSettings,
} from '@/types/lms';

export interface StorageAdapter {
  init(): Promise<void>;

  // Profile Management
  getProfiles(): Promise<StudentProfile[]>;
  getProfileById(id: string): Promise<StudentProfile | null>;
  saveProfile(profile: StudentProfile): Promise<void>;
  deleteProfile(id: string): Promise<void>;

  // Active Profile Tracking
  getActiveProfileId(): Promise<string | null>;
  setActiveProfileId(id: string | null): Promise<void>;

  // Practice Results
  getResults(profileId: string): Promise<PracticeResult[]>;
  saveResult(result: PracticeResult): Promise<void>;

  // Daily Progress
  getDailyProgress(profileId: string, date: string): Promise<DailyProgress | null>;
  saveDailyProgress(progress: DailyProgress): Promise<void>;

  // Phase 3: LMS Progress & Mistake Tracking
  getLessonProgress(profileId: string): Promise<StudentLessonProgress[]>;
  getLessonProgressById(profileId: string, lessonId: string): Promise<StudentLessonProgress | null>;
  saveLessonProgress(progress: StudentLessonProgress): Promise<void>;
  getMistakeStats(profileId: string): Promise<CharacterMistakeStat[]>;
  saveMistakeStats(stats: CharacterMistakeStat[]): Promise<void>;
  getTeacherSettings(): Promise<LmsTeacherSettings>;
  saveTeacherSettings(settings: LmsTeacherSettings): Promise<void>;

  // Backup & Migration
  exportAllData(): Promise<string>;
  importData(jsonData: string): Promise<{ success: boolean; message: string; count: number }>;
}
