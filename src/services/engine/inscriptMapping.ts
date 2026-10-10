/**
 * Authoritative Bureau of Indian Standards (BIS) Hindi Unicode InScript Keyboard Layout Definition.
 * Standard: IS 16350 / National Standard for Indian Script Keyboards.
 * Maps physical keyboard event.code to Unicode Devanagari characters.
 */

export type Finger =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky'
  | 'thumb';

export type Hand = 'left' | 'right' | 'either';

export type KeyCategory =
  | 'vowel'
  | 'matra'
  | 'consonant'
  | 'halant'
  | 'anusvara'
  | 'digit'
  | 'symbol'
  | 'control';

export interface InScriptKeyDef {
  code: string;               // Physical keyboard event.code (e.g. 'KeyD', 'KeyK')
  enNormal: string;           // Physical label unshifted (e.g. 'd')
  enShift: string;            // Physical label shifted (e.g. 'D')
  hiNormal: string;           // Hindi Devanagari output unshifted (e.g. '्')
  hiShift: string;            // Hindi Devanagari output shifted (e.g. 'अ')
  hiAltGr?: string;           // AltGr/Option layer output if any
  finger: Finger;
  hand: Hand;
  normalCategory: KeyCategory;
  shiftCategory: KeyCategory;
  row: 'number' | 'top' | 'home' | 'bottom' | 'space';
  isHomeKey?: boolean;
}

export const INSCRIPT_LAYOUT_VERSION = '2.0.0';

export const INSCRIPT_KEYS: InScriptKeyDef[] = [
  // ================= NUMBER ROW =================
  {
    code: 'Backquote',
    enNormal: '`',
    enShift: '~',
    hiNormal: 'ॊ', // U+090A Short O sign / or unmapped
    hiShift: 'ऒ',  // U+0912 Short O vowel
    finger: 'left-pinky',
    hand: 'left',
    normalCategory: 'matra',
    shiftCategory: 'vowel',
    row: 'number',
  },
  {
    code: 'Digit1',
    enNormal: '1',
    enShift: '!',
    hiNormal: '१', // U+0967 Devanagari 1
    hiShift: '!',
    hiAltGr: 'ऍ',  // U+090D Candra E
    finger: 'left-pinky',
    hand: 'left',
    normalCategory: 'digit',
    shiftCategory: 'symbol',
    row: 'number',
  },
  {
    code: 'Digit2',
    enNormal: '2',
    enShift: '@',
    hiNormal: '२', // U+0968 Devanagari 2
    hiShift: '@',
    hiAltGr: 'ॅ',  // U+0945 Vowel Sign Candra E
    finger: 'left-ring',
    hand: 'left',
    normalCategory: 'digit',
    shiftCategory: 'symbol',
    row: 'number',
  },
  {
    code: 'Digit3',
    enNormal: '3',
    enShift: '#',
    hiNormal: '३', // U+0969 Devanagari 3
    hiShift: '#',
    hiAltGr: '्र',
    finger: 'left-middle',
    hand: 'left',
    normalCategory: 'digit',
    shiftCategory: 'symbol',
    row: 'number',
  },
  {
    code: 'Digit4',
    enNormal: '4',
    enShift: '$',
    hiNormal: '४', // U+096A Devanagari 4
    hiShift: '$',
    hiAltGr: 'र्',
    finger: 'left-index',
    hand: 'left',
    normalCategory: 'digit',
    shiftCategory: 'symbol',
    row: 'number',
  },
  {
    code: 'Digit5',
    enNormal: '5',
    enShift: '%',
    hiNormal: '५', // U+096B Devanagari 5
    hiShift: '%',
    hiAltGr: 'ज्ञ',
    finger: 'left-index',
    hand: 'left',
    normalCategory: 'digit',
    shiftCategory: 'symbol',
    row: 'number',
  },
  {
    code: 'Digit6',
    enNormal: '6',
    enShift: '^',
    hiNormal: '६', // U+096C Devanagari 6
    hiShift: '^',
    hiAltGr: 'त्र',
    finger: 'right-index',
    hand: 'right',
    normalCategory: 'digit',
    shiftCategory: 'symbol',
    row: 'number',
  },
  {
    code: 'Digit7',
    enNormal: '7',
    enShift: '&',
    hiNormal: '७', // U+096D Devanagari 7
    hiShift: '&',
    hiAltGr: 'क्ष',
    finger: 'right-index',
    hand: 'right',
    normalCategory: 'digit',
    shiftCategory: 'symbol',
    row: 'number',
  },
  {
    code: 'Digit8',
    enNormal: '8',
    enShift: '*',
    hiNormal: '८', // U+096E Devanagari 8
    hiShift: '*',
    hiAltGr: 'श्र',
    finger: 'right-middle',
    hand: 'right',
    normalCategory: 'digit',
    shiftCategory: 'symbol',
    row: 'number',
  },
  {
    code: 'Digit9',
    enNormal: '9',
    enShift: '(',
    hiNormal: '९', // U+096F Devanagari 9
    hiShift: '(',
    finger: 'right-ring',
    hand: 'right',
    normalCategory: 'digit',
    shiftCategory: 'symbol',
    row: 'number',
  },
  {
    code: 'Digit0',
    enNormal: '0',
    enShift: ')',
    hiNormal: '०', // U+0966 Devanagari 0
    hiShift: ')',
    finger: 'right-pinky',
    hand: 'right',
    normalCategory: 'digit',
    shiftCategory: 'symbol',
    row: 'number',
  },
  {
    code: 'Minus',
    enNormal: '-',
    enShift: '_',
    hiNormal: '-',
    hiShift: 'ः', // U+0903 Visarga
    finger: 'right-pinky',
    hand: 'right',
    normalCategory: 'symbol',
    shiftCategory: 'anusvara',
    row: 'number',
  },
  {
    code: 'Equal',
    enNormal: '=',
    enShift: '+',
    hiNormal: 'ृ', // U+0943 Vowel Sign Vocalic R
    hiShift: 'ऋ',  // U+090B Vocalic R Vowel
    finger: 'right-pinky',
    hand: 'right',
    normalCategory: 'matra',
    shiftCategory: 'vowel',
    row: 'number',
  },

  // ================= TOP ROW =================
  {
    code: 'KeyQ',
    enNormal: 'q',
    enShift: 'Q',
    hiNormal: 'ौ', // U+094C Vowel Sign AU
    hiShift: 'औ',  // U+0914 Vowel AU
    finger: 'left-pinky',
    hand: 'left',
    normalCategory: 'matra',
    shiftCategory: 'vowel',
    row: 'top',
  },
  {
    code: 'KeyW',
    enNormal: 'w',
    enShift: 'W',
    hiNormal: 'ै', // U+0948 Vowel Sign AI
    hiShift: 'ऐ',  // U+0910 Vowel AI
    finger: 'left-ring',
    hand: 'left',
    normalCategory: 'matra',
    shiftCategory: 'vowel',
    row: 'top',
  },
  {
    code: 'KeyE',
    enNormal: 'e',
    enShift: 'E',
    hiNormal: 'ा', // U+093E Vowel Sign AA
    hiShift: 'आ',  // U+0906 Vowel AA
    finger: 'left-middle',
    hand: 'left',
    normalCategory: 'matra',
    shiftCategory: 'vowel',
    row: 'top',
  },
  {
    code: 'KeyR',
    enNormal: 'r',
    enShift: 'R',
    hiNormal: 'ी', // U+0940 Vowel Sign II
    hiShift: 'ई',  // U+0908 Vowel II
    finger: 'left-index',
    hand: 'left',
    normalCategory: 'matra',
    shiftCategory: 'vowel',
    row: 'top',
  },
  {
    code: 'KeyT',
    enNormal: 't',
    enShift: 'T',
    hiNormal: 'ू', // U+0942 Vowel Sign UU
    hiShift: 'ऊ',  // U+090A Vowel UU
    finger: 'left-index',
    hand: 'left',
    normalCategory: 'matra',
    shiftCategory: 'vowel',
    row: 'top',
  },
  {
    code: 'KeyY',
    enNormal: 'y',
    enShift: 'Y',
    hiNormal: 'ब', // U+092C Ba
    hiShift: 'भ',  // U+092D Bha
    finger: 'right-index',
    hand: 'right',
    normalCategory: 'consonant',
    shiftCategory: 'consonant',
    row: 'top',
  },
  {
    code: 'KeyU',
    enNormal: 'u',
    enShift: 'U',
    hiNormal: 'ह', // U+0939 Ha
    hiShift: 'ङ',  // U+0919 Nga
    finger: 'right-index',
    hand: 'right',
    normalCategory: 'consonant',
    shiftCategory: 'consonant',
    row: 'top',
  },
  {
    code: 'KeyI',
    enNormal: 'i',
    enShift: 'I',
    hiNormal: 'ग', // U+0917 Ga
    hiShift: 'घ',  // U+0918 Gha
    finger: 'right-middle',
    hand: 'right',
    normalCategory: 'consonant',
    shiftCategory: 'consonant',
    row: 'top',
  },
  {
    code: 'KeyO',
    enNormal: 'o',
    enShift: 'O',
    hiNormal: 'द', // U+0926 Da
    hiShift: 'ध',  // U+0927 Dha
    finger: 'right-ring',
    hand: 'right',
    normalCategory: 'consonant',
    shiftCategory: 'consonant',
    row: 'top',
  },
  {
    code: 'KeyP',
    enNormal: 'p',
    enShift: 'P',
    hiNormal: 'ज', // U+091C Ja
    hiShift: 'झ',  // U+091D Jha
    finger: 'right-pinky',
    hand: 'right',
    normalCategory: 'consonant',
    shiftCategory: 'consonant',
    row: 'top',
  },
  {
    code: 'BracketLeft',
    enNormal: '[',
    enShift: '{',
    hiNormal: 'ड', // U+0921 Dda
    hiShift: 'ढ',  // U+0922 Ddha
    finger: 'right-pinky',
    hand: 'right',
    normalCategory: 'consonant',
    shiftCategory: 'consonant',
    row: 'top',
  },
  {
    code: 'BracketRight',
    enNormal: ']',
    enShift: '}',
    hiNormal: '़', // U+093C Nukta
    hiShift: 'ञ',  // U+091E Nya
    finger: 'right-pinky',
    hand: 'right',
    normalCategory: 'symbol',
    shiftCategory: 'consonant',
    row: 'top',
  },
  {
    code: 'Backslash',
    enNormal: '\\',
    enShift: '|',
    hiNormal: 'ॉ', // U+0949 Vowel Sign Candra O
    hiShift: 'ऑ',  // U+0911 Vowel Candra O
    hiAltGr: 'ॐ',  // U+0950 Om
    finger: 'right-pinky',
    hand: 'right',
    normalCategory: 'matra',
    shiftCategory: 'vowel',
    row: 'top',
  },

  // ================= HOME ROW =================
  {
    code: 'KeyA',
    enNormal: 'a',
    enShift: 'A',
    hiNormal: 'ो', // U+094B Vowel Sign O
    hiShift: 'ओ',  // U+0913 Vowel O
    finger: 'left-pinky',
    hand: 'left',
    normalCategory: 'matra',
    shiftCategory: 'vowel',
    row: 'home',
    isHomeKey: true,
  },
  {
    code: 'KeyS',
    enNormal: 's',
    enShift: 'S',
    hiNormal: 'े', // U+0947 Vowel Sign E
    hiShift: 'ए',  // U+090F Vowel E
    finger: 'left-ring',
    hand: 'left',
    normalCategory: 'matra',
    shiftCategory: 'vowel',
    row: 'home',
    isHomeKey: true,
  },
  {
    code: 'KeyD',
    enNormal: 'd',
    enShift: 'D',
    hiNormal: '्', // U+094D Halant / Virama
    hiShift: 'अ',  // U+0905 Vowel A
    finger: 'left-middle',
    hand: 'left',
    normalCategory: 'halant',
    shiftCategory: 'vowel',
    row: 'home',
    isHomeKey: true,
  },
  {
    code: 'KeyF',
    enNormal: 'f',
    enShift: 'F',
    hiNormal: 'ि', // U+093F Vowel Sign I
    hiShift: 'इ',  // U+0907 Vowel I
    finger: 'left-index',
    hand: 'left',
    normalCategory: 'matra',
    shiftCategory: 'vowel',
    row: 'home',
    isHomeKey: true,
  },
  {
    code: 'KeyG',
    enNormal: 'g',
    enShift: 'G',
    hiNormal: 'ु', // U+0941 Vowel Sign U
    hiShift: 'उ',  // U+0909 Vowel U
    finger: 'left-index',
    hand: 'left',
    normalCategory: 'matra',
    shiftCategory: 'vowel',
    row: 'home',
  },
  {
    code: 'KeyH',
    enNormal: 'h',
    enShift: 'H',
    hiNormal: 'प', // U+092A Pa
    hiShift: 'फ',  // U+092B Pha
    finger: 'right-index',
    hand: 'right',
    normalCategory: 'consonant',
    shiftCategory: 'consonant',
    row: 'home',
  },
  {
    code: 'KeyJ',
    enNormal: 'j',
    enShift: 'J',
    hiNormal: 'र', // U+0930 Ra
    hiShift: 'ऱ',  // U+0931 Rra
    finger: 'right-index',
    hand: 'right',
    normalCategory: 'consonant',
    shiftCategory: 'consonant',
    row: 'home',
    isHomeKey: true,
  },
  {
    code: 'KeyK',
    enNormal: 'k',
    enShift: 'K',
    hiNormal: 'क', // U+0915 Ka
    hiShift: 'ख',  // U+0916 Kha
    finger: 'right-middle',
    hand: 'right',
    normalCategory: 'consonant',
    shiftCategory: 'consonant',
    row: 'home',
    isHomeKey: true,
  },
  {
    code: 'KeyL',
    enNormal: 'l',
    enShift: 'L',
    hiNormal: 'त', // U+0924 Ta
    hiShift: 'थ',  // U+0925 Tha
    finger: 'right-ring',
    hand: 'right',
    normalCategory: 'consonant',
    shiftCategory: 'consonant',
    row: 'home',
    isHomeKey: true,
  },
  {
    code: 'Semicolon',
    enNormal: ';',
    enShift: ':',
    hiNormal: 'च', // U+091A Ca
    hiShift: 'छ',  // U+091B Cha
    finger: 'right-pinky',
    hand: 'right',
    normalCategory: 'consonant',
    shiftCategory: 'consonant',
    row: 'home',
    isHomeKey: true,
  },
  {
    code: 'Quote',
    enNormal: "'",
    enShift: '"',
    hiNormal: 'ट', // U+091F Tta
    hiShift: 'ठ',  // U+0920 Ttha
    finger: 'right-pinky',
    hand: 'right',
    normalCategory: 'consonant',
    shiftCategory: 'consonant',
    row: 'home',
  },

  // ================= BOTTOM ROW =================
  {
    code: 'KeyZ',
    enNormal: 'z',
    enShift: 'Z',
    hiNormal: 'ॆ', // U+0946 Short E sign
    hiShift: 'ऎ',  // U+090E Short E vowel
    finger: 'left-pinky',
    hand: 'left',
    normalCategory: 'matra',
    shiftCategory: 'vowel',
    row: 'bottom',
  },
  {
    code: 'KeyX',
    enNormal: 'x',
    enShift: 'X',
    hiNormal: 'ं', // U+0902 Anusvara
    hiShift: 'ँ',  // U+0901 Candrabindu
    finger: 'left-ring',
    hand: 'left',
    normalCategory: 'anusvara',
    shiftCategory: 'anusvara',
    row: 'bottom',
  },
  {
    code: 'KeyC',
    enNormal: 'c',
    enShift: 'C',
    hiNormal: 'म', // U+092E Ma
    hiShift: 'ण',  // U+0923 Nna
    finger: 'left-middle',
    hand: 'left',
    normalCategory: 'consonant',
    shiftCategory: 'consonant',
    row: 'bottom',
  },
  {
    code: 'KeyV',
    enNormal: 'v',
    enShift: 'V',
    hiNormal: 'न', // U+0928 Na
    hiShift: 'ऩ',  // U+0929 Nnna
    finger: 'left-index',
    hand: 'left',
    normalCategory: 'consonant',
    shiftCategory: 'consonant',
    row: 'bottom',
  },
  {
    code: 'KeyB',
    enNormal: 'b',
    enShift: 'B',
    hiNormal: 'व', // U+0935 Va
    hiShift: 'ऴ',  // U+0934 Llla
    finger: 'left-index',
    hand: 'left',
    normalCategory: 'consonant',
    shiftCategory: 'consonant',
    row: 'bottom',
  },
  {
    code: 'KeyN',
    enNormal: 'n',
    enShift: 'N',
    hiNormal: 'ल', // U+0932 La
    hiShift: 'ळ',  // U+0933 Lla
    finger: 'right-index',
    hand: 'right',
    normalCategory: 'consonant',
    shiftCategory: 'consonant',
    row: 'bottom',
  },
  {
    code: 'KeyM',
    enNormal: 'm',
    enShift: 'M',
    hiNormal: 'स', // U+0938 Sa
    hiShift: 'श',  // U+0936 Sha
    finger: 'right-index',
    hand: 'right',
    normalCategory: 'consonant',
    shiftCategory: 'consonant',
    row: 'bottom',
  },
  {
    code: 'Comma',
    enNormal: ',',
    enShift: '<',
    hiNormal: ',',
    hiShift: 'ष', // U+0937 Ssa
    finger: 'right-middle',
    hand: 'right',
    normalCategory: 'symbol',
    shiftCategory: 'consonant',
    row: 'bottom',
  },
  {
    code: 'Period',
    enNormal: '.',
    enShift: '>',
    hiNormal: '.',
    hiShift: '।', // U+0964 Devanagari Danda (Purna Viram)
    finger: 'right-ring',
    hand: 'right',
    normalCategory: 'symbol',
    shiftCategory: 'symbol',
    row: 'bottom',
  },
  {
    code: 'Slash',
    enNormal: '/',
    enShift: '?',
    hiNormal: 'य', // U+092F Ya
    hiShift: '?',
    finger: 'right-pinky',
    hand: 'right',
    normalCategory: 'consonant',
    shiftCategory: 'symbol',
    row: 'bottom',
  },

  // ================= SPACE ROW =================
  {
    code: 'Space',
    enNormal: 'Space',
    enShift: 'Space',
    hiNormal: ' ',
    hiShift: ' ',
    finger: 'thumb',
    hand: 'either',
    normalCategory: 'control',
    shiftCategory: 'control',
    row: 'space',
  },
];

// Direct indexed lookup by physical event.code
export const INSCRIPT_CODE_MAP = new Map<string, InScriptKeyDef>();
INSCRIPT_KEYS.forEach((k) => INSCRIPT_CODE_MAP.set(k.code, k));

// Reverse mapping: Devanagari character to keystroke definition
export interface KeyStrokeInstruction {
  code: string;
  requiresShift: boolean;
  requiresAltGr?: boolean;
  char: string;
  keyDef: InScriptKeyDef;
  finger: Finger;
  hand: Hand;
  enKeyLabel: string;
}

export const CHAR_TO_KEYSTROKE_MAP = new Map<string, KeyStrokeInstruction>();

INSCRIPT_KEYS.forEach((key) => {
  if (key.hiNormal) {
    CHAR_TO_KEYSTROKE_MAP.set(key.hiNormal, {
      code: key.code,
      requiresShift: false,
      char: key.hiNormal,
      keyDef: key,
      finger: key.finger,
      hand: key.hand,
      enKeyLabel: key.enNormal.toUpperCase(),
    });
  }
  if (key.hiShift && key.hiShift !== key.hiNormal) {
    CHAR_TO_KEYSTROKE_MAP.set(key.hiShift, {
      code: key.code,
      requiresShift: true,
      char: key.hiShift,
      keyDef: key,
      finger: key.finger,
      hand: key.hand,
      enKeyLabel: `Shift + ${key.enNormal.toUpperCase()}`,
    });
  }
  if (key.hiAltGr) {
    CHAR_TO_KEYSTROKE_MAP.set(key.hiAltGr, {
      code: key.code,
      requiresShift: false,
      requiresAltGr: true,
      char: key.hiAltGr,
      keyDef: key,
      finger: key.finger,
      hand: key.hand,
      enKeyLabel: `AltGr + ${key.enNormal.toUpperCase()}`,
    });
  }
});

/**
 * Maps a physical key event (code + modifiers) to a Hindi Unicode character.
 * Layout-independent: ignores event.key and OS IME state.
 */
export function mapPhysicalKeyToHindi(
  code: string,
  shiftKey: boolean,
  altKey: boolean = false
): string | null {
  const keyDef = INSCRIPT_CODE_MAP.get(code);
  if (!keyDef) return null;

  if (altKey && keyDef.hiAltGr) {
    return keyDef.hiAltGr;
  }

  return shiftKey ? keyDef.hiShift : keyDef.hiNormal;
}

/**
 * Returns keystroke instruction needed to type a single Devanagari character.
 */
export function getKeystrokeForChar(char: string): KeyStrokeInstruction | null {
  return CHAR_TO_KEYSTROKE_MAP.get(char) || null;
}
