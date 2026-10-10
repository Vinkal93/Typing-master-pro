import { describe, it, expect, beforeEach } from 'vitest';
import { ProfileService } from '@/services/profile/profileService';
import { storageService } from '@/services/storage/storageService';

describe('ProfileService - Local Profile Management', () => {
  beforeEach(async () => {
    // Reset test database records
    const storage = await storageService.getAdapter();
    const profiles = await storage.getProfiles();
    for (const p of profiles) {
      await storage.deleteProfile(p.id);
    }
    await storage.setActiveProfileId(null);
  });

  it('validates student names properly', () => {
    expect(ProfileService.validateName('').isValid).toBe(false);
    expect(ProfileService.validateName('   ').isValid).toBe(false);
    expect(ProfileService.validateName('A').isValid).toBe(false);
    expect(ProfileService.validateName('Amit Kumar').isValid).toBe(true);
    expect(ProfileService.validateName('राहुल वर्मा').isValid).toBe(true);
  });

  it('creates student profile and sets as active automatically', async () => {
    const profile = await ProfileService.createProfile({
      name: 'Pooja Singh',
      avatar: 'avatar-scholar',
      instituteRollNo: 'CS-09',
      preferences: {
        language: 'hindi',
        keyboardLayout: 'hindi_inscript',
      },
    });

    expect(profile.id).toBeDefined();
    expect(profile.name).toBe('Pooja Singh');
    expect(profile.preferences.keyboardLayout).toBe('hindi_inscript');

    const active = await ProfileService.getActiveProfile();
    expect(active?.id).toBe(profile.id);
    expect(active?.name).toBe('Pooja Singh');
  });

  it('supports multi-profile switching and CRUD', async () => {
    const p1 = await ProfileService.createProfile({ name: 'Student One' });
    const p2 = await ProfileService.createProfile({ name: 'Student Two' });

    const all = await ProfileService.getAllProfiles();
    expect(all.length).toBe(2);

    // Switch active profile to p1
    await ProfileService.switchActiveProfile(p1.id);
    const active = await ProfileService.getActiveProfile();
    expect(active?.id).toBe(p1.id);

    // Delete p2
    await ProfileService.deleteProfile(p2.id);
    const remaining = await ProfileService.getAllProfiles();
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe(p1.id);
  });
});
