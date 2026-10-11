import { describe, it, expect } from 'vitest';
import {
  mapPhysicalKeyToRemington,
  convertTypewriterOrderToUnicode,
  REMINGTON_ALT_CODES,
  REMINGTON_GAIL_KEYMAP,
} from '@/services/engine/remingtonMapping';

describe('Phase 7: Remington GAIL Mapping Engine', () => {
  it('maps standard physical keys to Remington unshifted Devanagari characters', () => {
    // KeyD -> क् (half ka)
    expect(mapPhysicalKeyToRemington('KeyD', false)).toBe('क्');
    // KeyK -> ा (aa matra)
    expect(mapPhysicalKeyToRemington('KeyK', false)).toBe('ा');
    // KeyJ -> र (ra)
    expect(mapPhysicalKeyToRemington('KeyJ', false)).toBe('र');
    // KeyS -> े (e matra)
    expect(mapPhysicalKeyToRemington('KeyS', false)).toBe('े');
    // KeyA -> ं (anusvara)
    expect(mapPhysicalKeyToRemington('KeyA', false)).toBe('ं');
  });

  it('maps shifted physical keys to Remington Devanagari characters', () => {
    // Shift + KeyD -> क (full ka)
    expect(mapPhysicalKeyToRemington('KeyD', true)).toBe('क');
    // Shift + KeyK -> ज्ञ (gya)
    expect(mapPhysicalKeyToRemington('KeyK', true)).toBe('ज्ञ');
    // Shift + KeyJ -> श्र (shra)
    expect(mapPhysicalKeyToRemington('KeyJ', true)).toBe('श्र');
    // Shift + KeyS -> ै (ai matra)
    expect(mapPhysicalKeyToRemington('KeyS', true)).toBe('ै');
  });

  it('maps number row keys for digits and special characters', () => {
    expect(mapPhysicalKeyToRemington('Digit1', false)).toBe('1');
    expect(mapPhysicalKeyToRemington('Digit2', false)).toBe('2');
    expect(mapPhysicalKeyToRemington('Digit3', false)).toBe('3');
    expect(mapPhysicalKeyToRemington('Digit0', false)).toBe('0');
    expect(mapPhysicalKeyToRemington('Digit1', true)).toBe('!');
    expect(mapPhysicalKeyToRemington('Digit3', true)).toBe('रू');
  });

  it('verifies standard official Alt codes for government typing exams', () => {
    expect(REMINGTON_ALT_CODES.length).toBeGreaterThanOrEqual(15);

    const rishiAlt = REMINGTON_ALT_CODES.find((a) => a.code === '0161');
    expect(rishiAlt).toBeDefined();
    expect(rishiAlt?.character).toBe('ऋ');

    const dgaAlt = REMINGTON_ALT_CODES.find((a) => a.code === '0179');
    expect(dgaAlt).toBeDefined();
    expect(dgaAlt?.character).toBe('द्ग');

    const ktaAlt = REMINGTON_ALT_CODES.find((a) => a.code === '0216');
    expect(ktaAlt).toBeDefined();
    expect(ktaAlt?.character).toBe('क्त');
  });

  it('converts typewriter chhoti ee matra order to valid Unicode', () => {
    // In typewriter typing: 'ि' + 'क' is typed, which logically must convert to 'कि' (क + ि)
    const rawTypewriter = 'िक';
    const normalized = convertTypewriterOrderToUnicode(rawTypewriter);
    expect(normalized).toBe('कि');

    // Test a word: 'िकताब' -> 'किताब'
    const rawWord = 'िकताब';
    const normalizedWord = convertTypewriterOrderToUnicode(rawWord);
    expect(normalizedWord).toBe('किताब');

    // Test multiple words: 'िदन िमल' -> 'दिन मिल'
    const sentence = 'िदन िमल';
    const normalizedSentence = convertTypewriterOrderToUnicode(sentence);
    expect(normalizedSentence).toBe('दिन मिल');
  });

  it('handles unknown codes gracefully', () => {
    expect(mapPhysicalKeyToRemington('F24', false)).toBeNull();
    expect(mapPhysicalKeyToRemington('UnknownKey', true)).toBeNull();
  });
});
