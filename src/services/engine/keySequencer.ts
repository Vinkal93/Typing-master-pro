/**
 * Unicode Devanagari Decomposition and Keystroke Sequencer Engine.
 * Derives exact physical key sequences from verified InScript layout mapping.
 * Does NOT hardcode guessed sequences.
 */

import { getKeystrokeForChar, KeyStrokeInstruction, InScriptKeyDef } from './inscriptMapping';

export interface KeystrokeStep {
  stepIndex: number;
  char: string;
  code: string;
  requiresShift: boolean;
  requiresAltGr?: boolean;
  enKeyLabel: string;
  finger: string;
  hand: string;
  explanation: string;
  keyDef: InScriptKeyDef;
}

export interface WordCompositionDef {
  id: string;
  word: string;
  meaningHindi?: string;
  category: 'conjunct' | 'common_word' | 'exam_word';
  description: string;
  steps: KeystrokeStep[];
}

/**
 * Decomposes any Hindi text into its constituent Unicode character tokens
 * and derives the required physical InScript keystroke sequence.
 */
export function deriveKeystrokeSequence(text: string): KeystrokeStep[] {
  const steps: KeystrokeStep[] = [];
  // Split into unicode characters (preserving combining marks)
  const chars = Array.from(text);

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const instr = getKeystrokeForChar(char);

    if (!instr) {
      console.warn(`Unmapped Hindi Unicode character: ${char} (U+${char.charCodeAt(0).toString(16)})`);
      continue;
    }

    let explanation = '';
    const category = instr.requiresShift ? instr.keyDef.shiftCategory : instr.keyDef.normalCategory;

    switch (category) {
      case 'vowel':
        explanation = `Type independent vowel '${char}' using ${instr.enKeyLabel}`;
        break;
      case 'consonant':
        explanation = `Type consonant '${char}' using ${instr.enKeyLabel}`;
        break;
      case 'matra':
        explanation = `Apply dependent vowel sign (matra) '${char}' using ${instr.enKeyLabel}`;
        break;
      case 'halant':
        explanation = `Apply Halant '${char}' to suppress vowel sound and form conjunct`;
        break;
      case 'anusvara':
        explanation = `Type nasal sound '${char}' using ${instr.enKeyLabel}`;
        break;
      case 'digit':
        explanation = `Type numeral '${char}' using ${instr.enKeyLabel}`;
        break;
      default:
        explanation = `Type '${char}' using ${instr.enKeyLabel}`;
    }

    steps.push({
      stepIndex: steps.length + 1,
      char,
      code: instr.code,
      requiresShift: instr.requiresShift,
      requiresAltGr: instr.requiresAltGr,
      enKeyLabel: instr.enKeyLabel,
      finger: instr.finger,
      hand: instr.hand,
      explanation,
      keyDef: instr.keyDef,
    });
  }

  return steps;
}

/**
 * Standard Word Composition Catalog for Module 4 (Word Builder)
 * Automatically derived from the authoritative InScript mapping.
 */
export const WORD_BUILDER_CATALOG: WordCompositionDef[] = [
  {
    id: 'conjunct_pra',
    word: 'प्र',
    meaningHindi: 'प + ् + र',
    category: 'conjunct',
    description: 'संयुक्त वर्ण "प्र" (प के पैर में र) का निर्माण हलन्त (्) के माध्यम से होता है।',
    steps: deriveKeystrokeSequence('प्र'),
  },
  {
    id: 'conjunct_tra',
    word: 'त्र',
    meaningHindi: 'त + ् + र',
    category: 'conjunct',
    description: 'संयुक्त वर्ण "त्र" (त और र का संयोजन)।',
    steps: deriveKeystrokeSequence('त्र'),
  },
  {
    id: 'conjunct_ksha',
    word: 'क्ष',
    meaningHindi: 'क + ् + ष',
    category: 'conjunct',
    description: 'संयुक्त वर्ण "क्ष" (क, हलन्त और मूर्धन्य ष का मेल)।',
    steps: deriveKeystrokeSequence('क्ष'),
  },
  {
    id: 'conjunct_gya',
    word: 'ज्ञ',
    meaningHindi: 'ज + ् + ञ',
    category: 'conjunct',
    description: 'संयुक्त वर्ण "ज्ञ" (ज, हलन्त और ञ का संयोजन)।',
    steps: deriveKeystrokeSequence('ज्ञ'),
  },
  {
    id: 'conjunct_shra',
    word: 'श्र',
    meaningHindi: 'श + ् + र',
    category: 'conjunct',
    description: 'संयुक्त वर्ण "श्र" (तालव्य श, हलन्त और र का मेल)।',
    steps: deriveKeystrokeSequence('श्र'),
  },
  {
    id: 'word_prashna',
    word: 'प्रश्न',
    meaningHindi: 'प्र + श + ् + न',
    category: 'common_word',
    description: 'शब्द "प्रश्न" — इसमें दो संयुक्त अक्षर (प्र और श्न) शामिल हैं।',
    steps: deriveKeystrokeSequence('प्रश्न'),
  },
  {
    id: 'word_prashnapatra',
    word: 'प्रश्नपत्र',
    meaningHindi: 'प्रश्न + पत्र (प्र + श्न + प + त्र)',
    category: 'exam_word',
    description: 'परीक्षाओं में सर्वाधिक प्रयुक्त शब्द "प्रश्नपत्र" का संयोजन।',
    steps: deriveKeystrokeSequence('प्रश्नपत्र'),
  },
  {
    id: 'word_vidyalaya',
    word: 'विद्यालय',
    meaningHindi: 'वि + द्य + ा + ल + य',
    category: 'common_word',
    description: 'शब्द "विद्यालय" — इसमें द और य का संयुक्त वर्ण "द्य" (द + ् + य) प्रयुक्त होता है।',
    steps: deriveKeystrokeSequence('विद्यालय'),
  },
  {
    id: 'word_pariksha',
    word: 'परीक्षा',
    meaningHindi: 'प + र + ी + क्ष + ा',
    category: 'exam_word',
    description: 'शब्द "परीक्षा" — प, र पर बड़ी ई की मात्रा, और संयुक्त वर्ण क्ष पर आ की मात्रा।',
    steps: deriveKeystrokeSequence('परीक्षा'),
  },
  {
    id: 'word_computer',
    word: 'कम्प्यूटर',
    meaningHindi: 'क + म + ् + प + य + ू + ट + र',
    category: 'exam_word',
    description: 'शब्द "कम्प्यूटर" — आधा म (म + ्) और प्य (प + य + ू) का शुद्ध यूनिकोड संयोजन।',
    steps: deriveKeystrokeSequence('कम्प्यूटर'),
  },
  {
    id: 'word_swatantrata',
    word: 'स्वतंत्रता',
    meaningHindi: 'स् + व + त + ं + त्र + त + ा',
    category: 'exam_word',
    description: 'आधा स, व, त, अनुस्वार और संयुक्त वर्ण त्र का सटीक अभ्यास।',
    steps: deriveKeystrokeSequence('स्वतंत्रता'),
  },
  {
    id: 'word_bharat',
    word: 'भारत',
    meaningHindi: 'भ + ा + र + त',
    category: 'common_word',
    description: 'मूल शब्द "भारत" का सरल संयोजन।',
    steps: deriveKeystrokeSequence('भारत'),
  },
];
