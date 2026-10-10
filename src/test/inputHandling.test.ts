import { describe, it, expect } from 'vitest';
import { mapPhysicalKeyToHindi } from '@/services/engine/inscriptMapping';

describe('Module 1 & 5: Physical Keyboard Input Handling & Accuracy Rules', () => {
  it('maps physical event.code independently of layout or event.key', () => {
    // When a student types on an English physical keyboard:
    // event.code is 'KeyK', event.key might be 'k'
    const char = mapPhysicalKeyToHindi('KeyK', false);
    expect(char).toBe('क');

    // When student holds Shift:
    // event.code is 'KeyK', shiftKey is true, event.key might be 'K'
    const shiftedChar = mapPhysicalKeyToHindi('KeyK', true);
    expect(shiftedChar).toBe('ख');
  });

  it('handles space key correctly', () => {
    expect(mapPhysicalKeyToHindi('Space', false)).toBe(' ');
    expect(mapPhysicalKeyToHindi('Space', true)).toBe(' ');
  });

  it('correctly handles Unicode character deletion with backspace logic', () => {
    let typed = 'नमस्ते'; // Devanagari string
    // Convert to Unicode array
    let chars = Array.from(typed);
    expect(chars).toEqual(['न', 'म', 'स', '्', 'त', 'े']);

    // Backspace removes last Unicode codepoint
    chars.pop();
    expect(chars.join('')).toBe('नमस्त');

    chars.pop();
    expect(chars.join('')).toBe('नमस्');

    chars.pop();
    expect(chars.join('')).toBe('नमस');
  });

  it('correctly calculates accuracy percentage and handles zero division', () => {
    const calculateAccuracy = (totalTyped: number, errorCount: number) => {
      const total = totalTyped + errorCount;
      if (total === 0) return 100;
      return Math.max(0, Math.round(((total - errorCount) / total) * 100));
    };

    expect(calculateAccuracy(0, 0)).toBe(100);
    expect(calculateAccuracy(100, 0)).toBe(100);
    expect(calculateAccuracy(95, 5)).toBe(95);
    expect(calculateAccuracy(50, 50)).toBe(50);
  });
});
