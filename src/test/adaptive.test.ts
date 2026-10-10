import { describe, it, expect } from 'vitest';
import { AdaptivePracticeService } from '@/services/lms/adaptivePracticeService';
import { CharacterMistakeStat } from '@/types/lms';

describe('Phase 3: AdaptivePracticeService Drill Generation', () => {
  it('should generate an adaptive drill prioritizing the highest mistake characters', () => {
    const mockStats: CharacterMistakeStat[] = [
      {
        profileId: 'p1',
        char: 'ध',
        keyCode: 'Shift+KeyE',
        errorCount: 14,
        totalAttempts: 20,
        lastErrorAt: Date.now(),
      },
      {
        profileId: 'p1',
        char: 'ष',
        keyCode: 'Shift+KeyComma',
        errorCount: 9,
        totalAttempts: 15,
        lastErrorAt: Date.now(),
      },
      {
        profileId: 'p1',
        char: 'ऋ',
        keyCode: 'Shift+Equal',
        errorCount: 5,
        totalAttempts: 10,
        lastErrorAt: Date.now(),
      },
    ];

    const drill = AdaptivePracticeService.generateAdaptiveLesson(mockStats);
    expect(drill).toBeDefined();
    expect(drill.targetCharacters).toEqual(['ध', 'ष', 'ऋ']);
    expect(drill.stageB_Guided.targetText).toContain('ध');
    expect(drill.stageB_Guided.targetText).toContain('ष');
    expect(drill.stageC_Independent.targetText).toContain('ध');
    expect(drill.stageD_Test.targetText).toContain('ध');
  });

  it('should fallback to defaults when no mistake stats are present', () => {
    const drill = AdaptivePracticeService.generateAdaptiveLesson([]);
    expect(drill.targetCharacters.length).toBeGreaterThan(0);
    expect(drill.stageB_Guided.targetText.length).toBeGreaterThan(0);
  });
});
