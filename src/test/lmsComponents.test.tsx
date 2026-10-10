import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { ProfileContext } from '@/context/ProfileContext';
import { LmsDashboard } from '@/components/lms/LmsDashboard';
import { LessonPlayer } from '@/components/lms/LessonPlayer';
import { CurriculumService } from '@/services/curriculum/curriculumService';
import { StudentProfile } from '@/types';

const mockProfile: StudentProfile = {
  id: 'test_student_lms',
  name: 'Aarav Sharma',
  avatar: 'avatar-1',
  createdAt: Date.now(),
  lastActiveAt: Date.now(),
  preferences: {
    language: 'Hindi',
    keyboardLayout: 'Hindi InScript',
    fontPreference: 'Mangal',
    dailyGoalMinutes: 15,
    theme: 'light',
  },
};

const mockContextValue = {
  profiles: [mockProfile],
  activeProfile: mockProfile,
  isLoading: false,
  isOnboardingRequired: false,
  switchProfile: async () => {},
  createProfile: async () => mockProfile,
  updateProfile: async () => mockProfile,
  deleteProfile: async () => {},
  refreshProfiles: async () => {},
  setIsOnboardingRequired: () => {},
};

describe('Phase 3: LMS UI Components Integration', () => {
  it('should render LmsDashboard with curriculum overview and levels', async () => {
    render(
      <ProfileContext.Provider value={mockContextValue}>
        <LmsDashboard />
      </ProfileContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/स्मार्ट अधिगम प्रबंधन प्रणाली/)).toBeDefined();
      expect(screen.getByText(/Level 1: Absolute Beginner/)).toBeDefined();
    });
  });

  it('should render LessonPlayer in Stage A Learn and transition to Stage B Guided', async () => {
    const lesson = CurriculumService.getLessonByGlobalIndex(1)!;
    let completed = false;

    render(
      <ProfileContext.Provider value={mockContextValue}>
        <LessonPlayer
          lesson={lesson}
          onBack={() => {}}
          onLessonCompleted={() => { completed = true; }}
        />
      </ProfileContext.Provider>
    );

    // Stage A Learn header
    expect(screen.getByText(/चरण १: सैद्धांतिक परिचय एवं उंगली स्थिति/)).toBeDefined();

    // Click to start Guided practice (Stage B)
    const startGuidedBtn = screen.getByText(/मार्गदर्शित अभ्यास प्रारंभ करें/);
    fireEvent.click(startGuidedBtn);

    // Verify stage B elements appear
    await waitFor(() => {
      expect(screen.getByText(/B. मार्गदर्शित/)).toBeDefined();
    });
  });
});
