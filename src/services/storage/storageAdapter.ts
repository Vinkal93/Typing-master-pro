import { StudentProfile, PracticeResult, DailyProgress } from '@/types';

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
  
  // Backup & Migration
  exportAllData(): Promise<string>;
  importData(jsonData: string): Promise<{ success: boolean; message: string; count: number }>;
}
