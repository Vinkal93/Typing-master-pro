import { describe, it, expect } from 'vitest';
import { deriveKeystrokeSequence, WORD_BUILDER_CATALOG } from '@/services/engine/keySequencer';

describe('Module 4: Unicode Keystroke Sequencer & Word Builder', () => {
  it('correctly decomposes conjunct "प्र" into प + ् + र', () => {
    const sequence = deriveKeystrokeSequence('प्र');
    expect(sequence.length).toBe(3);

    expect(sequence[0].char).toBe('प');
    expect(sequence[0].code).toBe('KeyH');
    expect(sequence[0].requiresShift).toBe(false);

    expect(sequence[1].char).toBe('्');
    expect(sequence[1].code).toBe('KeyD');
    expect(sequence[1].requiresShift).toBe(false);

    expect(sequence[2].char).toBe('र');
    expect(sequence[2].code).toBe('KeyJ');
    expect(sequence[2].requiresShift).toBe(false);
  });

  it('correctly decomposes conjunct "त्र" into त + ् + र', () => {
    const sequence = deriveKeystrokeSequence('त्र');
    expect(sequence.length).toBe(3);

    expect(sequence[0].char).toBe('त');
    expect(sequence[0].code).toBe('KeyL');

    expect(sequence[1].char).toBe('्');
    expect(sequence[1].code).toBe('KeyD');

    expect(sequence[2].char).toBe('र');
    expect(sequence[2].code).toBe('KeyJ');
  });

  it('correctly decomposes conjunct "क्ष" into क + ् + ष', () => {
    const sequence = deriveKeystrokeSequence('क्ष');
    expect(sequence.length).toBe(3);

    expect(sequence[0].char).toBe('क');
    expect(sequence[0].code).toBe('KeyK');

    expect(sequence[1].char).toBe('्');
    expect(sequence[1].code).toBe('KeyD');

    expect(sequence[2].char).toBe('ष');
    expect(sequence[2].code).toBe('Comma');
    expect(sequence[2].requiresShift).toBe(true);
  });

  it('correctly decomposes conjunct "ज्ञ" into ज + ् + ञ', () => {
    const sequence = deriveKeystrokeSequence('ज्ञ');
    expect(sequence.length).toBe(3);

    expect(sequence[0].char).toBe('ज');
    expect(sequence[0].code).toBe('KeyP');

    expect(sequence[1].char).toBe('्');
    expect(sequence[1].code).toBe('KeyD');

    expect(sequence[2].char).toBe('ञ');
    expect(sequence[2].code).toBe('BracketRight');
    expect(sequence[2].requiresShift).toBe(true);
  });

  it('correctly decomposes conjunct "श्र" into श + ् + र', () => {
    const sequence = deriveKeystrokeSequence('श्र');
    expect(sequence.length).toBe(3);

    expect(sequence[0].char).toBe('श');
    expect(sequence[0].code).toBe('KeyM');
    expect(sequence[0].requiresShift).toBe(true);

    expect(sequence[1].char).toBe('्');
    expect(sequence[1].code).toBe('KeyD');

    expect(sequence[2].char).toBe('र');
    expect(sequence[2].code).toBe('KeyJ');
  });

  it('correctly decomposes word "विद्यालय" (वि + द्य + ा + ल + य)', () => {
    const sequence = deriveKeystrokeSequence('विद्यालय');
    const codes = sequence.map((s) => s.code);
    const chars = sequence.map((s) => s.char);

    expect(chars).toEqual(['व', 'ि', 'द', '्', 'य', 'ा', 'ल', 'य']);
    expect(codes).toEqual(['KeyB', 'KeyF', 'KeyO', 'KeyD', 'Slash', 'KeyE', 'KeyN', 'Slash']);
  });

  it('correctly decomposes word "परीक्षा" (प + र + ी + क + ् + ष + ा)', () => {
    const sequence = deriveKeystrokeSequence('परीक्षा');
    const chars = sequence.map((s) => s.char);
    const codes = sequence.map((s) => s.code);

    expect(chars).toEqual(['प', 'र', 'ी', 'क', '्', 'ष', 'ा']);
    expect(codes).toEqual(['KeyH', 'KeyJ', 'KeyR', 'KeyK', 'KeyD', 'Comma', 'KeyE']);
    expect(sequence[5].requiresShift).toBe(true); // ष requires Shift
  });

  it('correctly decomposes word "कम्प्यूटर" (क + म + ् + प + ् + य + ू + ट + र)', () => {
    const sequence = deriveKeystrokeSequence('कम्प्यूटर');
    const chars = sequence.map((s) => s.char);
    const codes = sequence.map((s) => s.code);

    expect(chars).toEqual(['क', 'म', '्', 'प', '्', 'य', 'ू', 'ट', 'र']);
    expect(codes).toEqual(['KeyK', 'KeyC', 'KeyD', 'KeyH', 'KeyD', 'Slash', 'KeyT', 'Quote', 'KeyJ']);
  });

  it('ensures all entries in WORD_BUILDER_CATALOG have valid non-empty steps', () => {
    expect(WORD_BUILDER_CATALOG.length).toBeGreaterThanOrEqual(10);
    WORD_BUILDER_CATALOG.forEach((item) => {
      expect(item.steps.length).toBeGreaterThan(0);
      item.steps.forEach((step) => {
        expect(step.code).toBeDefined();
        expect(step.char).toBeDefined();
        expect(step.enKeyLabel).toBeDefined();
      });
    });
  });
});
