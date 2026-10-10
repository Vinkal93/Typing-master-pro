import { StudentProfile, StudentPreferences } from '@/types';
import { storageService } from '../storage/storageService';

export const DEFAULT_PREFERENCES: StudentPreferences = {
  language: 'hindi',
  keyboardLayout: 'hindi_inscript',
  fontPreference: 'noto_sans_devanagari',
  dailyPracticeGoal: 15,
  theme: 'light',
  soundEffects: true,
  fontSize: 'normal',
};

export class ProfileService {
  public static validateName(name: string): { isValid: boolean; error?: string } {
    const trimmed = name.trim();
    if (!trimmed) {
      return { isValid: false, error: 'Student name is required' };
    }
    if (trimmed.length < 2) {
      return { isValid: false, error: 'Student name must be at least 2 characters' };
    }
    if (trimmed.length > 50) {
      return { isValid: false, error: 'Student name cannot exceed 50 characters' };
    }
    return { isValid: true };
  }

  public static async getAllProfiles(): Promise<StudentProfile[]> {
    const storage = await storageService.getAdapter();
    const profiles = await storage.getProfiles();
    return profiles.sort((a, b) => b.lastActiveAt - a.lastActiveAt);
  }

  public static async getActiveProfile(): Promise<StudentProfile | null> {
    const storage = await storageService.getAdapter();
    const activeId = await storage.getActiveProfileId();
    if (!activeId) {
      // Fallback: check if any profile exists and pick the most recent one
      const profiles = await storage.getProfiles();
      if (profiles.length > 0) {
        const first = profiles.sort((a, b) => b.lastActiveAt - a.lastActiveAt)[0];
        await storage.setActiveProfileId(first.id);
        return first;
      }
      return null;
    }
    const profile = await storage.getProfileById(activeId);
    if (!profile) {
      const profiles = await storage.getProfiles();
      if (profiles.length > 0) {
        const first = profiles[0];
        await storage.setActiveProfileId(first.id);
        return first;
      }
      return null;
    }
    return profile;
  }

  public static async createProfile(params: {
    name: string;
    avatar?: string;
    instituteRollNo?: string;
    preferences?: Partial<StudentPreferences>;
  }): Promise<StudentProfile> {
    const validation = this.validateName(params.name);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid student name');
    }

    const storage = await storageService.getAdapter();
    const now = Date.now();
    const id = `student_${now}_${Math.random().toString(36).substring(2, 7)}`;

    const profile: StudentProfile = {
      id,
      name: params.name.trim(),
      avatar: params.avatar || 'avatar-scholar',
      instituteRollNo: params.instituteRollNo?.trim() || undefined,
      createdAt: now,
      lastActiveAt: now,
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...(params.preferences || {}),
      },
    };

    await storage.saveProfile(profile);
    await storage.setActiveProfileId(profile.id);
    return profile;
  }

  public static async updateProfile(profile: StudentProfile): Promise<StudentProfile> {
    const validation = this.validateName(profile.name);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid student name');
    }

    const storage = await storageService.getAdapter();
    const updated: StudentProfile = {
      ...profile,
      lastActiveAt: Date.now(),
    };

    await storage.saveProfile(updated);
    return updated;
  }

  public static async switchActiveProfile(profileId: string): Promise<StudentProfile | null> {
    const storage = await storageService.getAdapter();
    const profile = await storage.getProfileById(profileId);
    if (!profile) {
      throw new Error(`Profile not found for ID: ${profileId}`);
    }

    profile.lastActiveAt = Date.now();
    await storage.saveProfile(profile);
    await storage.setActiveProfileId(profile.id);
    return profile;
  }

  public static async deleteProfile(profileId: string): Promise<void> {
    const storage = await storageService.getAdapter();
    await storage.deleteProfile(profileId);
  }

  public static async hasExistingProfiles(): Promise<boolean> {
    const storage = await storageService.getAdapter();
    const profiles = await storage.getProfiles();
    return profiles.length > 0;
  }
}
