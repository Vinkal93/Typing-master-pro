import { describe, it, expect } from 'vitest';
import {
  INSCRIPT_KEYS,
  mapPhysicalKeyToHindi,
  getKeystrokeForChar,
  INSCRIPT_CODE_MAP,
} from '@/services/engine/inscriptMapping';

describe('Module 1: Hindi InScript Authoritative Mapping Engine', () => {
  it('contains complete physical key definitions for standard 101/104-key keyboards', () => {
    expect(INSCRIPT_KEYS.length).toBeGreaterThanOrEqual(47);
    expect(INSCRIPT_CODE_MAP.has('KeyA')).toBe(true);
    expect(INSCRIPT_CODE_MAP.has('KeyK')).toBe(true);
    expect(INSCRIPT_CODE_MAP.has('Digit1')).toBe(true);
    expect(INSCRIPT_CODE_MAP.has('Space')).toBe(true);
  });

  describe('Home Row Mapping (Normal & Shift)', () => {
    it('maps Left Hand Home Row keys (Matras & Independent Vowels)', () => {
      // KeyA: ो (normal) / ओ (shift)
      expect(mapPhysicalKeyToHindi('KeyA', false)).toBe('ो');
      expect(mapPhysicalKeyToHindi('KeyA', true)).toBe('ओ');

      // KeyS: े (normal) / ए (shift)
      expect(mapPhysicalKeyToHindi('KeyS', false)).toBe('े');
      expect(mapPhysicalKeyToHindi('KeyS', true)).toBe('ए');

      // KeyD: ् (Halant) / अ (shift)
      expect(mapPhysicalKeyToHindi('KeyD', false)).toBe('्');
      expect(mapPhysicalKeyToHindi('KeyD', true)).toBe('अ');

      // KeyF: ि (normal) / इ (shift)
      expect(mapPhysicalKeyToHindi('KeyF', false)).toBe('ि');
      expect(mapPhysicalKeyToHindi('KeyF', true)).toBe('इ');

      // KeyG: ु (normal) / उ (shift)
      expect(mapPhysicalKeyToHindi('KeyG', false)).toBe('ु');
      expect(mapPhysicalKeyToHindi('KeyG', true)).toBe('उ');
    });

    it('maps Right Hand Home Row keys (Consonants)', () => {
      // KeyH: प (normal) / फ (shift)
      expect(mapPhysicalKeyToHindi('KeyH', false)).toBe('प');
      expect(mapPhysicalKeyToHindi('KeyH', true)).toBe('फ');

      // KeyJ: र (normal) / ऱ (shift)
      expect(mapPhysicalKeyToHindi('KeyJ', false)).toBe('र');
      expect(mapPhysicalKeyToHindi('KeyJ', true)).toBe('ऱ');

      // KeyK: क (normal) / ख (shift)
      expect(mapPhysicalKeyToHindi('KeyK', false)).toBe('क');
      expect(mapPhysicalKeyToHindi('KeyK', true)).toBe('ख');

      // KeyL: त (normal) / थ (shift)
      expect(mapPhysicalKeyToHindi('KeyL', false)).toBe('त');
      expect(mapPhysicalKeyToHindi('KeyL', true)).toBe('थ');

      // Semicolon: च (normal) / छ (shift)
      expect(mapPhysicalKeyToHindi('Semicolon', false)).toBe('च');
      expect(mapPhysicalKeyToHindi('Semicolon', true)).toBe('छ');

      // Quote: ट (normal) / ठ (shift)
      expect(mapPhysicalKeyToHindi('Quote', false)).toBe('ट');
      expect(mapPhysicalKeyToHindi('Quote', true)).toBe('ठ');
    });
  });

  describe('Top Row Mapping (Normal & Shift)', () => {
    it('maps Top Row Vowels and Consonants correctly', () => {
      // KeyQ: ौ / औ
      expect(mapPhysicalKeyToHindi('KeyQ', false)).toBe('ौ');
      expect(mapPhysicalKeyToHindi('KeyQ', true)).toBe('औ');

      // KeyW: ै / ऐ
      expect(mapPhysicalKeyToHindi('KeyW', false)).toBe('ै');
      expect(mapPhysicalKeyToHindi('KeyW', true)).toBe('ऐ');

      // KeyE: ा / आ
      expect(mapPhysicalKeyToHindi('KeyE', false)).toBe('ा');
      expect(mapPhysicalKeyToHindi('KeyE', true)).toBe('आ');

      // KeyR: ी / ई
      expect(mapPhysicalKeyToHindi('KeyR', false)).toBe('ी');
      expect(mapPhysicalKeyToHindi('KeyR', true)).toBe('ई');

      // KeyT: ू / ऊ
      expect(mapPhysicalKeyToHindi('KeyT', false)).toBe('ू');
      expect(mapPhysicalKeyToHindi('KeyT', true)).toBe('ऊ');

      // KeyY: ब / भ
      expect(mapPhysicalKeyToHindi('KeyY', false)).toBe('ब');
      expect(mapPhysicalKeyToHindi('KeyY', true)).toBe('भ');

      // KeyU: ह / ङ
      expect(mapPhysicalKeyToHindi('KeyU', false)).toBe('ह');
      expect(mapPhysicalKeyToHindi('KeyU', true)).toBe('ङ');

      // KeyI: ग / घ
      expect(mapPhysicalKeyToHindi('KeyI', false)).toBe('ग');
      expect(mapPhysicalKeyToHindi('KeyI', true)).toBe('घ');

      // KeyO: द / ध
      expect(mapPhysicalKeyToHindi('KeyO', false)).toBe('द');
      expect(mapPhysicalKeyToHindi('KeyO', true)).toBe('ध');

      // KeyP: ज / झ
      expect(mapPhysicalKeyToHindi('KeyP', false)).toBe('ज');
      expect(mapPhysicalKeyToHindi('KeyP', true)).toBe('झ');

      // BracketLeft: ड / ढ
      expect(mapPhysicalKeyToHindi('BracketLeft', false)).toBe('ड');
      expect(mapPhysicalKeyToHindi('BracketLeft', true)).toBe('ढ');

      // BracketRight: ़ (Nukta) / ञ
      expect(mapPhysicalKeyToHindi('BracketRight', false)).toBe('़');
      expect(mapPhysicalKeyToHindi('BracketRight', true)).toBe('ञ');
    });
  });

  describe('Bottom Row Mapping (Normal & Shift)', () => {
    it('maps Bottom Row keys correctly including Purna Viram', () => {
      // KeyX: ं (Anusvara) / ँ (Chandrabindu)
      expect(mapPhysicalKeyToHindi('KeyX', false)).toBe('ं');
      expect(mapPhysicalKeyToHindi('KeyX', true)).toBe('ँ');

      // KeyC: म / ण
      expect(mapPhysicalKeyToHindi('KeyC', false)).toBe('म');
      expect(mapPhysicalKeyToHindi('KeyC', true)).toBe('ण');

      // KeyV: न / ऩ
      expect(mapPhysicalKeyToHindi('KeyV', false)).toBe('न');
      expect(mapPhysicalKeyToHindi('KeyV', true)).toBe('ऩ');

      // KeyB: व / ऴ
      expect(mapPhysicalKeyToHindi('KeyB', false)).toBe('व');
      expect(mapPhysicalKeyToHindi('KeyB', true)).toBe('ऴ');

      // KeyN: ल / ळ
      expect(mapPhysicalKeyToHindi('KeyN', false)).toBe('ल');
      expect(mapPhysicalKeyToHindi('KeyN', true)).toBe('ळ');

      // KeyM: स / श
      expect(mapPhysicalKeyToHindi('KeyM', false)).toBe('स');
      expect(mapPhysicalKeyToHindi('KeyM', true)).toBe('श');

      // Comma: , / ष
      expect(mapPhysicalKeyToHindi('Comma', false)).toBe(',');
      expect(mapPhysicalKeyToHindi('Comma', true)).toBe('ष');

      // Period: . / । (Devanagari Danda / Purna Viram)
      expect(mapPhysicalKeyToHindi('Period', false)).toBe('.');
      expect(mapPhysicalKeyToHindi('Period', true)).toBe('।');

      // Slash: य / ?
      expect(mapPhysicalKeyToHindi('Slash', false)).toBe('य');
      expect(mapPhysicalKeyToHindi('Slash', true)).toBe('?');
    });
  });

  describe('Number Row & Devanagari Digits', () => {
    it('maps digits 0-9 to Devanagari numerals ०-९', () => {
      expect(mapPhysicalKeyToHindi('Digit0', false)).toBe('०');
      expect(mapPhysicalKeyToHindi('Digit1', false)).toBe('१');
      expect(mapPhysicalKeyToHindi('Digit2', false)).toBe('२');
      expect(mapPhysicalKeyToHindi('Digit3', false)).toBe('३');
      expect(mapPhysicalKeyToHindi('Digit4', false)).toBe('४');
      expect(mapPhysicalKeyToHindi('Digit5', false)).toBe('५');
      expect(mapPhysicalKeyToHindi('Digit6', false)).toBe('६');
      expect(mapPhysicalKeyToHindi('Digit7', false)).toBe('७');
      expect(mapPhysicalKeyToHindi('Digit8', false)).toBe('८');
      expect(mapPhysicalKeyToHindi('Digit9', false)).toBe('९');

      // Equal: ृ / ऋ
      expect(mapPhysicalKeyToHindi('Equal', false)).toBe('ृ');
      expect(mapPhysicalKeyToHindi('Equal', true)).toBe('ऋ');

      // Minus: - / ः (Visarga)
      expect(mapPhysicalKeyToHindi('Minus', false)).toBe('-');
      expect(mapPhysicalKeyToHindi('Minus', true)).toBe('ः');
    });

    it('maps AltGr layer combinations', () => {
      expect(mapPhysicalKeyToHindi('Digit1', false, true)).toBe('ऍ');
      expect(mapPhysicalKeyToHindi('Digit2', false, true)).toBe('ॅ');
      expect(mapPhysicalKeyToHindi('Digit5', false, true)).toBe('ज्ञ');
      expect(mapPhysicalKeyToHindi('Digit6', false, true)).toBe('त्र');
      expect(mapPhysicalKeyToHindi('Digit7', false, true)).toBe('क्ष');
      expect(mapPhysicalKeyToHindi('Digit8', false, true)).toBe('श्र');
    });
  });

  describe('Reverse Keystroke Lookup (getKeystrokeForChar)', () => {
    it('accurately resolves physical key and shift requirements for any Hindi character', () => {
      const ka = getKeystrokeForChar('क');
      expect(ka?.code).toBe('KeyK');
      expect(ka?.requiresShift).toBe(false);

      const kha = getKeystrokeForChar('ख');
      expect(kha?.code).toBe('KeyK');
      expect(kha?.requiresShift).toBe(true);

      const halant = getKeystrokeForChar('्');
      expect(halant?.code).toBe('KeyD');
      expect(halant?.requiresShift).toBe(false);

      const independentA = getKeystrokeForChar('अ');
      expect(independentA?.code).toBe('KeyD');
      expect(independentA?.requiresShift).toBe(true);

      const purnaViram = getKeystrokeForChar('।');
      expect(purnaViram?.code).toBe('Period');
      expect(purnaViram?.requiresShift).toBe(true);
    });
  });
});
