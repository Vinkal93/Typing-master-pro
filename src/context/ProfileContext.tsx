'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { StudentProfile, StudentPreferences } from '@/types';
import { ProfileService } from '@/services/profile/profileService';

interface ProfileContextType {
  activeProfile: StudentProfile | null;
  profiles: StudentProfile[];
  isLoading: boolean;
  isOnboardingRequired: boolean;
  createProfile: (params: {
    name: string;
    avatar?: string;
    instituteRollNo?: string;
    preferences?: Partial<StudentPreferences>;
  }) => Promise<StudentProfile>;
  updateProfile: (profile: StudentProfile) => Promise<StudentProfile>;
  switchProfile: (profileId: string) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  refreshProfiles: () => Promise<void>;
  setIsOnboardingRequired: (required: boolean) => void;
}

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [activeProfile, setActiveProfile] = useState<StudentProfile | null>(null);
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnboardingRequired, setIsOnboardingRequired] = useState<boolean>(false);

  const loadProfileData = useCallback(async () => {
    try {
      setIsLoading(true);
      const allProfiles = await ProfileService.getAllProfiles();
      setProfiles(allProfiles);

      if (allProfiles.length === 0) {
        setIsOnboardingRequired(true);
        setActiveProfile(null);
      } else {
        const active = await ProfileService.getActiveProfile();
        if (active) {
          setActiveProfile(active);
          setIsOnboardingRequired(false);
        } else {
          // If profiles exist but none active, activate the first one
          const first = allProfiles[0];
          await ProfileService.switchActiveProfile(first.id);
          setActiveProfile(first);
          setIsOnboardingRequired(false);
        }
      }
    } catch (err) {
      console.error('Failed to load profile data:', err);
      // In case of error, if no profiles, set onboarding
      setIsOnboardingRequired(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const createProfile = async (params: {
    name: string;
    avatar?: string;
    instituteRollNo?: string;
    preferences?: Partial<StudentPreferences>;
  }): Promise<StudentProfile> => {
    const newProfile = await ProfileService.createProfile(params);
    setActiveProfile(newProfile);
    setIsOnboardingRequired(false);
    const updated = await ProfileService.getAllProfiles();
    setProfiles(updated);
    return newProfile;
  };

  const updateProfile = async (profile: StudentProfile): Promise<StudentProfile> => {
    const updated = await ProfileService.updateProfile(profile);
    if (activeProfile && activeProfile.id === updated.id) {
      setActiveProfile(updated);
    }
    const all = await ProfileService.getAllProfiles();
    setProfiles(all);
    return updated;
  };

  const switchProfile = async (profileId: string): Promise<void> => {
    const activated = await ProfileService.switchActiveProfile(profileId);
    if (activated) {
      setActiveProfile(activated);
    }
    const all = await ProfileService.getAllProfiles();
    setProfiles(all);
  };

  const deleteProfile = async (profileId: string): Promise<void> => {
    await ProfileService.deleteProfile(profileId);
    const all = await ProfileService.getAllProfiles();
    setProfiles(all);
    if (all.length === 0) {
      setActiveProfile(null);
      setIsOnboardingRequired(true);
    } else {
      if (activeProfile?.id === profileId) {
        const nextActive = all[0];
        await ProfileService.switchActiveProfile(nextActive.id);
        setActiveProfile(nextActive);
      }
    }
  };

  const refreshProfiles = async (): Promise<void> => {
    await loadProfileData();
  };

  return (
    <ProfileContext.Provider
      value={{
        activeProfile,
        profiles,
        isLoading,
        isOnboardingRequired,
        createProfile,
        updateProfile,
        switchProfile,
        deleteProfile,
        refreshProfiles,
        setIsOnboardingRequired,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
