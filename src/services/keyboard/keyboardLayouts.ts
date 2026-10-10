import { KeyboardLayout, KeyboardKeyDef } from '@/types';

export interface LayoutMetadata {
  id: KeyboardLayout;
  name: string;
  hindiName: string;
  description: string;
  examUsage: string;
  homeRowPreview: string;
  fingerPlacements: {
    leftPinky: string;
    leftRing: string;
    leftMiddle: string;
    leftIndex: string;
    rightIndex: string;
    rightMiddle: string;
    rightRing: string;
    rightPinky: string;
  };
  rows: KeyboardKeyDef[][];
}

// English QWERTY Layout Matrix
const ENGLISH_QWERTY_ROWS: KeyboardKeyDef[][] = [
  // Number row
  [
    { code: 'Backquote', label: '`', shiftLabel: '~', finger: 'left-pinky' },
    { code: 'Digit1', label: '1', shiftLabel: '!', finger: 'left-pinky' },
    { code: 'Digit2', label: '2', shiftLabel: '@', finger: 'left-ring' },
    { code: 'Digit3', label: '3', shiftLabel: '#', finger: 'left-middle' },
    { code: 'Digit4', label: '4', shiftLabel: '$', finger: 'left-index' },
    { code: 'Digit5', label: '5', shiftLabel: '%', finger: 'left-index' },
    { code: 'Digit6', label: '6', shiftLabel: '^', finger: 'right-index' },
    { code: 'Digit7', label: '7', shiftLabel: '&', finger: 'right-index' },
    { code: 'Digit8', label: '8', shiftLabel: '*', finger: 'right-middle' },
    { code: 'Digit9', label: '9', shiftLabel: '(', finger: 'right-ring' },
    { code: 'Digit0', label: '0', shiftLabel: ')', finger: 'right-pinky' },
    { code: 'Minus', label: '-', shiftLabel: '_', finger: 'right-pinky' },
    { code: 'Equal', label: '=', shiftLabel: '+', finger: 'right-pinky' },
  ],
  // Top row
  [
    { code: 'KeyQ', label: 'q', shiftLabel: 'Q', finger: 'left-pinky' },
    { code: 'KeyW', label: 'w', shiftLabel: 'W', finger: 'left-ring' },
    { code: 'KeyE', label: 'e', shiftLabel: 'E', finger: 'left-middle' },
    { code: 'KeyR', label: 'r', shiftLabel: 'R', finger: 'left-index' },
    { code: 'KeyT', label: 't', shiftLabel: 'T', finger: 'left-index' },
    { code: 'KeyY', label: 'y', shiftLabel: 'Y', finger: 'right-index' },
    { code: 'KeyU', label: 'u', shiftLabel: 'U', finger: 'right-index' },
    { code: 'KeyI', label: 'i', shiftLabel: 'I', finger: 'right-middle' },
    { code: 'KeyO', label: 'o', shiftLabel: 'O', finger: 'right-ring' },
    { code: 'KeyP', label: 'p', shiftLabel: 'P', finger: 'right-pinky' },
    { code: 'BracketLeft', label: '[', shiftLabel: '{', finger: 'right-pinky' },
    { code: 'BracketRight', label: ']', shiftLabel: '}', finger: 'right-pinky' },
  ],
  // Home row
  [
    { code: 'KeyA', label: 'a', shiftLabel: 'A', finger: 'left-pinky', isHomeKey: true },
    { code: 'KeyS', label: 's', shiftLabel: 'S', finger: 'left-ring', isHomeKey: true },
    { code: 'KeyD', label: 'd', shiftLabel: 'D', finger: 'left-middle', isHomeKey: true },
    { code: 'KeyF', label: 'f', shiftLabel: 'F', finger: 'left-index', isHomeKey: true },
    { code: 'KeyG', label: 'g', shiftLabel: 'G', finger: 'left-index' },
    { code: 'KeyH', label: 'h', shiftLabel: 'H', finger: 'right-index' },
    { code: 'KeyJ', label: 'j', shiftLabel: 'J', finger: 'right-index', isHomeKey: true },
    { code: 'KeyK', label: 'k', shiftLabel: 'K', finger: 'right-middle', isHomeKey: true },
    { code: 'KeyL', label: 'l', shiftLabel: 'L', finger: 'right-ring', isHomeKey: true },
    { code: 'Semicolon', label: ';', shiftLabel: ':', finger: 'right-pinky', isHomeKey: true },
    { code: 'Quote', label: "'", shiftLabel: '"', finger: 'right-pinky' },
  ],
  // Bottom row
  [
    { code: 'KeyZ', label: 'z', shiftLabel: 'Z', finger: 'left-pinky' },
    { code: 'KeyX', label: 'x', shiftLabel: 'X', finger: 'left-ring' },
    { code: 'KeyC', label: 'c', shiftLabel: 'C', finger: 'left-middle' },
    { code: 'KeyV', label: 'v', shiftLabel: 'V', finger: 'left-index' },
    { code: 'KeyB', label: 'b', shiftLabel: 'B', finger: 'left-index' },
    { code: 'KeyN', label: 'n', shiftLabel: 'N', finger: 'right-index' },
    { code: 'KeyM', label: 'm', shiftLabel: 'M', finger: 'right-index' },
    { code: 'Comma', label: ',', shiftLabel: '<', finger: 'right-middle' },
    { code: 'Period', label: '.', shiftLabel: '>', finger: 'right-ring' },
    { code: 'Slash', label: '/', shiftLabel: '?', finger: 'right-pinky' },
  ],
];

// Hindi InScript Layout Matrix (Standard Government Exam layout)
const HINDI_INSCRIPT_ROWS: KeyboardKeyDef[][] = [
  // Number row
  [
    { code: 'Backquote', label: 'ौ', shiftLabel: 'औ', finger: 'left-pinky' },
    { code: 'Digit1', label: '१', shiftLabel: '!', finger: 'left-pinky' },
    { code: 'Digit2', label: '२', shiftLabel: '@', finger: 'left-ring' },
    { code: 'Digit3', label: '३', shiftLabel: '#', finger: 'left-middle' },
    { code: 'Digit4', label: '४', shiftLabel: '$', finger: 'left-index' },
    { code: 'Digit5', label: '५', shiftLabel: '%', finger: 'left-index' },
    { code: 'Digit6', label: '६', shiftLabel: '^', finger: 'right-index' },
    { code: 'Digit7', label: '७', shiftLabel: '&', finger: 'right-index' },
    { code: 'Digit8', label: '८', shiftLabel: '*', finger: 'right-middle' },
    { code: 'Digit9', label: '९', shiftLabel: '(', finger: 'right-ring' },
    { code: 'Digit0', label: '०', shiftLabel: ')', finger: 'right-pinky' },
    { code: 'Minus', label: '-', shiftLabel: 'ः', finger: 'right-pinky' },
    { code: 'Equal', label: 'ृ', shiftLabel: 'ऋ', finger: 'right-pinky' },
  ],
  // Top row
  [
    { code: 'KeyQ', label: 'ौ', shiftLabel: 'औ', finger: 'left-pinky' },
    { code: 'KeyW', label: 'ै', shiftLabel: 'ऐ', finger: 'left-ring' },
    { code: 'KeyE', label: 'ा', shiftLabel: 'आ', finger: 'left-middle' },
    { code: 'KeyR', label: 'ी', shiftLabel: 'ई', finger: 'left-index' },
    { code: 'KeyT', label: 'ू', shiftLabel: 'ऊ', finger: 'left-index' },
    { code: 'KeyY', label: 'ब', shiftLabel: 'भ', finger: 'right-index' },
    { code: 'KeyU', label: 'ह', shiftLabel: 'ङ', finger: 'right-index' },
    { code: 'KeyI', label: 'ग', shiftLabel: 'घ', finger: 'right-middle' },
    { code: 'KeyO', label: 'द', shiftLabel: 'ध', finger: 'right-ring' },
    { code: 'KeyP', label: 'ज', shiftLabel: 'झ', finger: 'right-pinky' },
    { code: 'BracketLeft', label: 'ड', shiftLabel: 'ढ', finger: 'right-pinky' },
    { code: 'BracketRight', label: '़', shiftLabel: 'ञ', finger: 'right-pinky' },
  ],
  // Home row (Left hand: Vowels/Matras, Right hand: Consonants)
  [
    { code: 'KeyA', label: 'ो', shiftLabel: 'ओ', finger: 'left-pinky', isHomeKey: true },
    { code: 'KeyS', label: 'े', shiftLabel: 'ए', finger: 'left-ring', isHomeKey: true },
    { code: 'KeyD', label: '्', shiftLabel: 'अ', finger: 'left-middle', isHomeKey: true },
    { code: 'KeyF', label: 'ि', shiftLabel: 'इ', finger: 'left-index', isHomeKey: true },
    { code: 'KeyG', label: 'ु', shiftLabel: 'उ', finger: 'left-index' },
    { code: 'KeyH', label: 'प', shiftLabel: 'फ', finger: 'right-index' },
    { code: 'KeyJ', label: 'र', shiftLabel: 'ऱ', finger: 'right-index', isHomeKey: true },
    { code: 'KeyK', label: 'क', shiftLabel: 'ख', finger: 'right-middle', isHomeKey: true },
    { code: 'KeyL', label: 'त', shiftLabel: 'थ', finger: 'right-ring', isHomeKey: true },
    { code: 'Semicolon', label: 'च', shiftLabel: 'छ', finger: 'right-pinky', isHomeKey: true },
    { code: 'Quote', label: 'ट', shiftLabel: 'ठ', finger: 'right-pinky' },
  ],
  // Bottom row
  [
    { code: 'KeyZ', label: 'ॆ', shiftLabel: 'ऒ', finger: 'left-pinky' },
    { code: 'KeyX', label: 'ं', shiftLabel: 'ँ', finger: 'left-ring' },
    { code: 'KeyC', label: 'म', shiftLabel: 'ण', finger: 'left-middle' },
    { code: 'KeyV', label: 'न', shiftLabel: 'ऩ', finger: 'left-index' },
    { code: 'KeyB', label: 'व', shiftLabel: 'ऴ', finger: 'left-index' },
    { code: 'KeyN', label: 'ल', shiftLabel: 'ळ', finger: 'right-index' },
    { code: 'KeyM', label: 'स', shiftLabel: 'श', finger: 'right-index' },
    { code: 'Comma', label: ',', shiftLabel: 'ष', finger: 'right-middle' },
    { code: 'Period', label: '.', shiftLabel: '।', finger: 'right-ring' },
    { code: 'Slash', label: 'य', shiftLabel: '?', finger: 'right-pinky' },
  ],
];

// Hindi Remington GAIL Layout Matrix (Typewriter Standard used in state courts and clerk exams)
const HINDI_REMINGTON_GAIL_ROWS: KeyboardKeyDef[][] = [
  // Number row
  [
    { code: 'Backquote', label: '़', shiftLabel: 'ञ', finger: 'left-pinky' },
    { code: 'Digit1', label: '1', shiftLabel: '!', finger: 'left-pinky' },
    { code: 'Digit2', label: '2', shiftLabel: '@', finger: 'left-ring' },
    { code: 'Digit3', label: '3', shiftLabel: '#', finger: 'left-middle' },
    { code: 'Digit4', label: '4', shiftLabel: '$', finger: 'left-index' },
    { code: 'Digit5', label: '5', shiftLabel: '%', finger: 'left-index' },
    { code: 'Digit6', label: '6', shiftLabel: '^', finger: 'right-index' },
    { code: 'Digit7', label: '7', shiftLabel: '&', finger: 'right-index' },
    { code: 'Digit8', label: '8', shiftLabel: '*', finger: 'right-middle' },
    { code: 'Digit9', label: '9', shiftLabel: '(', finger: 'right-ring' },
    { code: 'Digit0', label: '0', shiftLabel: ')', finger: 'right-pinky' },
    { code: 'Minus', label: '-', shiftLabel: '_', finger: 'right-pinky' },
    { code: 'Equal', label: '=', shiftLabel: '+', finger: 'right-pinky' },
  ],
  // Top row
  [
    { code: 'KeyQ', label: 'ु', shiftLabel: 'फ', finger: 'left-pinky' },
    { code: 'KeyW', label: 'ू', shiftLabel: 'ॅ', finger: 'left-ring' },
    { code: 'KeyE', label: 'म', shiftLabel: 'म्', finger: 'left-middle' },
    { code: 'KeyR', label: 'त', shiftLabel: 'त्', finger: 'left-index' },
    { code: 'KeyT', label: 'ज', shiftLabel: 'ज्', finger: 'left-index' },
    { code: 'KeyY', label: 'ल', shiftLabel: 'ल्', finger: 'right-index' },
    { code: 'KeyU', label: 'न', shiftLabel: 'न्', finger: 'right-index' },
    { code: 'KeyI', label: 'प', shiftLabel: 'प्', finger: 'right-middle' },
    { code: 'KeyO', label: 'व', shiftLabel: 'व्', finger: 'right-ring' },
    { code: 'KeyP', label: 'च', shiftLabel: 'च्', finger: 'right-pinky' },
    { code: 'BracketLeft', label: 'ख', shiftLabel: 'ख्', finger: 'right-pinky' },
    { code: 'BracketRight', label: ',', shiftLabel: '?', finger: 'right-pinky' },
  ],
  // Home row
  [
    { code: 'KeyA', label: 'ं', shiftLabel: 'ँ', finger: 'left-pinky', isHomeKey: true },
    { code: 'KeyS', label: 'े', shiftLabel: 'ै', finger: 'left-ring', isHomeKey: true },
    { code: 'KeyD', label: 'क', shiftLabel: 'क्', finger: 'left-middle', isHomeKey: true },
    { code: 'KeyF', label: 'ि', shiftLabel: 'थ', finger: 'left-index', isHomeKey: true },
    { code: 'KeyG', label: 'ह', shiftLabel: 'भ', finger: 'left-index' },
    { code: 'KeyH', label: 'ी', shiftLabel: 'भ्', finger: 'right-index' },
    { code: 'KeyJ', label: 'र', shiftLabel: 'श्र', finger: 'right-index', isHomeKey: true },
    { code: 'KeyK', label: 'ा', shiftLabel: 'ज्ञ', finger: 'right-middle', isHomeKey: true },
    { code: 'KeyL', label: 'स', shiftLabel: 'स्', finger: 'right-ring', isHomeKey: true },
    { code: 'Semicolon', label: 'य', shiftLabel: 'ष्', finger: 'right-pinky', isHomeKey: true },
    { code: 'Quote', label: 'श', shiftLabel: 'श्', finger: 'right-pinky' },
  ],
  // Bottom row
  [
    { code: 'KeyZ', label: '्र', shiftLabel: 'र्', finger: 'left-pinky' },
    { code: 'KeyX', label: 'ग', shiftLabel: 'ग्', finger: 'left-ring' },
    { code: 'KeyC', label: 'ब', shiftLabel: 'ब्', finger: 'left-middle' },
    { code: 'KeyV', label: 'अ', shiftLabel: 'ट', finger: 'left-index' },
    { code: 'KeyB', label: 'इ', shiftLabel: 'ठ', finger: 'left-index' },
    { code: 'KeyN', label: 'द', shiftLabel: 'छ', finger: 'right-index' },
    { code: 'KeyM', label: 'उ', shiftLabel: 'ड', finger: 'right-index' },
    { code: 'Comma', label: 'ए', shiftLabel: 'ढ', finger: 'right-middle' },
    { code: 'Period', label: 'ण्', shiftLabel: 'झ', finger: 'right-ring' },
    { code: 'Slash', label: 'ध', shiftLabel: 'ध्', finger: 'right-pinky' },
  ],
];

export const KEYBOARD_LAYOUTS: Record<KeyboardLayout, LayoutMetadata> = {
  hindi_inscript: {
    id: 'hindi_inscript',
    name: 'Hindi InScript',
    hindiName: 'हिन्दी इनस्क्रिप्ट',
    description: 'Government standard layout approved by Bureau of Indian Standards (BIS). Left hand for vowels/matras, right hand for consonants.',
    examUsage: 'Mandatory for CPCT, SSC, MP High Court, Delhi High Court, and Central Govt typing exams.',
    homeRowPreview: 'ो  े  ्  ि  ु | प  र  क  त  च',
    fingerPlacements: {
      leftPinky: 'A (ो / ओ)',
      leftRing: 'S (े / ए)',
      leftMiddle: 'D (् / अ)',
      leftIndex: 'F (ि / इ), G (ु / उ)',
      rightIndex: 'H (प / फ), J (र / ऱ)',
      rightMiddle: 'K (क / ख)',
      rightRing: 'L (त / थ)',
      rightPinky: '; (च / छ), \' (ट / ठ)',
    },
    rows: HINDI_INSCRIPT_ROWS,
  },
  remington_gail: {
    id: 'remington_gail',
    name: 'Remington GAIL',
    hindiName: 'रेमिंगटन गेल',
    description: 'Typewriter layout widely used in Hindi typing institutes and state government offices across India.',
    examUsage: 'Popular in State Secretariat, District Courts, State PSC clerk exams, and traditional typing schools.',
    homeRowPreview: 'ं  े  क  ि  ह | ी  र  ा  स  य',
    fingerPlacements: {
      leftPinky: 'A (ं / ँ)',
      leftRing: 'S (े / ै)',
      leftMiddle: 'D (क / क्)',
      leftIndex: 'F (ि / थ), G (ह / भ)',
      rightIndex: 'H (ी / भ्), J (र / श्र)',
      rightMiddle: 'K (ा / ज्ञ)',
      rightRing: 'L (स / स्)',
      rightPinky: '; (य / ष्), \' (श / श्)',
    },
    rows: HINDI_REMINGTON_GAIL_ROWS,
  },
  english_qwerty: {
    id: 'english_qwerty',
    name: 'English QWERTY',
    hindiName: 'अंग्रेजी क्वर्टी',
    description: 'Standard international touch typing layout used globally for computer literacy and professional office work.',
    examUsage: 'Required for all standard clerical, bank PO, SSC CGL/CHSL, and private sector computer certifications.',
    homeRowPreview: 'A  S  D  F  G | H  J  K  L  ;',
    fingerPlacements: {
      leftPinky: 'A',
      leftRing: 'S',
      leftMiddle: 'D',
      leftIndex: 'F, G',
      rightIndex: 'H, J',
      rightMiddle: 'K',
      rightRing: 'L',
      rightPinky: ';, \'',
    },
    rows: ENGLISH_QWERTY_ROWS,
  },
};
