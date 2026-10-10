import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '@/app/page';
import { ProfileProvider } from '@/context/ProfileContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { storageService } from '@/services/storage/storageService';
import { ProfileService } from '@/services/profile/profileService';

describe('Application First-Run & Routing Flow', () => {
  beforeEach(async () => {
    // Clear storage before each test
    const storage = await storageService.getAdapter();
    const profiles = await storage.getProfiles();
    for (const p of profiles) {
      await storage.deleteProfile(p.id);
    }
    await storage.setActiveProfileId(null);
  });

  it('renders onboarding wizard when no profiles exist (first run)', async () => {
    render(
      <ThemeProvider>
        <ProfileProvider>
          <Home />
        </ProfileProvider>
      </ThemeProvider>
    );

    // Should display the onboarding wizard welcome
    await waitFor(() => {
      expect(screen.getByText('Master Hindi & English Touch Typing')).toBeInTheDocument();
      expect(screen.getByText('Step 1 of 7')).toBeInTheDocument();
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });
  });

  it('renders student dashboard directly when an existing profile is found', async () => {
    // Pre-populate profile
    await ProfileService.createProfile({
      name: 'Sunil Mehra',
      preferences: {
        language: 'hindi',
        keyboardLayout: 'hindi_inscript',
      },
    });

    render(
      <ThemeProvider>
        <ProfileProvider>
          <Home />
        </ProfileProvider>
      </ThemeProvider>
    );

    // Should bypass onboarding and load dashboard
    await waitFor(() => {
      expect(screen.getByText('Welcome back, Sunil Mehra!')).toBeInTheDocument();
      expect(screen.getByText('Course Roadmap Preview')).toBeInTheDocument();
      expect(screen.getByText('Daily Practice Goal')).toBeInTheDocument();
      expect(screen.queryByText('Step 1 of 7')).not.toBeInTheDocument();
    });
  });
});
