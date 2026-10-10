'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  Keyboard,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VirtualKeyboard } from '@/components/keyboard/VirtualKeyboard';
import { audioService } from '@/services/engine/audioService';
import { mapPhysicalKeyToHindi } from '@/services/engine/inscriptMapping';

export type CharacterCategory =
  | 'vowels'
  | 'consonants'
  | 'matras'
  | 'halant'
  | 'compound'
  | 'numbers'
  | 'punctuation';

export interface CharacterItem {
  id: string;
  hindiChar: string;
  enPhysicalKey: string;
  code: string;
  requiresShift: boolean;
  finger: string;
  hand: 'left' | 'right';
  type: string;
  exampleWord: string;
  wordMeaning: string;
}

export const CHARACTER_LESSONS: Record<CharacterCategory, { title: string; subtitle: string; items: CharacterItem[] }> = {
  vowels: {
    title: 'स्वतंत्र स्वर (Independent Vowels)',
    subtitle: 'जब स्वर किसी शब्द के आरंभ में या स्वतंत्र रूप से आते हैं',
    items: [
      { id: 'v_a', hindiChar: 'अ', enPhysicalKey: 'D', code: 'KeyD', requiresShift: true, finger: 'Left Middle', hand: 'left', type: 'ह्रस्व स्वर', exampleWord: 'अमर', wordMeaning: 'अ + म + र' },
      { id: 'v_aa', hindiChar: 'आ', enPhysicalKey: 'E', code: 'KeyE', requiresShift: true, finger: 'Left Middle', hand: 'left', type: 'दीर्घ स्वर', exampleWord: 'आम', wordMeaning: 'आ + म' },
      { id: 'v_i', hindiChar: 'इ', enPhysicalKey: 'F', code: 'KeyF', requiresShift: true, finger: 'Left Index', hand: 'left', type: 'ह्रस्व स्वर', exampleWord: 'इधर', wordMeaning: 'इ + ध + र' },
      { id: 'v_ii', hindiChar: 'ई', enPhysicalKey: 'R', code: 'KeyR', requiresShift: true, finger: 'Left Index', hand: 'left', type: 'दीर्घ स्वर', exampleWord: 'ईख', wordMeaning: 'ई + ख' },
      { id: 'v_u', hindiChar: 'उ', enPhysicalKey: 'G', code: 'KeyG', requiresShift: true, finger: 'Left Index', hand: 'left', type: 'ह्रस्व स्वर', exampleWord: 'उदय', wordMeaning: 'उ + द + य' },
      { id: 'v_uu', hindiChar: 'ऊ', enPhysicalKey: 'T', code: 'KeyT', requiresShift: true, finger: 'Left Index', hand: 'left', type: 'दीर्घ स्वर', exampleWord: 'ऊपर', wordMeaning: 'ऊ + प + र' },
      { id: 'v_ri', hindiChar: 'ऋ', enPhysicalKey: '=', code: 'Equal', requiresShift: true, finger: 'Right Pinky', hand: 'right', type: 'ऋषि स्वर', exampleWord: 'ऋषि', wordMeaning: 'ऋ + ष + ि' },
      { id: 'v_e', hindiChar: 'ए', enPhysicalKey: 'S', code: 'KeyS', requiresShift: true, finger: 'Left Ring', hand: 'left', type: 'संयुक्त स्वर', exampleWord: 'एक', wordMeaning: 'ए + क' },
      { id: 'v_ai', hindiChar: 'ऐ', enPhysicalKey: 'W', code: 'KeyW', requiresShift: true, finger: 'Left Ring', hand: 'left', type: 'दीर्घ स्वर', exampleWord: 'ऐनक', wordMeaning: 'ऐ + न + क' },
      { id: 'v_o', hindiChar: 'ओ', enPhysicalKey: 'A', code: 'KeyA', requiresShift: true, finger: 'Left Pinky', hand: 'left', type: 'संयुक्त स्वर', exampleWord: 'ओस', wordMeaning: 'ओ + स' },
      { id: 'v_au', hindiChar: 'औ', enPhysicalKey: 'Q', code: 'KeyQ', requiresShift: true, finger: 'Left Pinky', hand: 'left', type: 'दीर्घ स्वर', exampleWord: 'और', wordMeaning: 'औ + र' },
    ],
  },
  consonants: {
    title: 'व्यंजन वर्ण (Consonants)',
    subtitle: 'कवर्ग, चवर्ग, टवर्ग, तवर्ग, पवर्ग एवं अंतःस्थ/ऊष्म वर्ण',
    items: [
      { id: 'c_ka', hindiChar: 'क', enPhysicalKey: 'K', code: 'KeyK', requiresShift: false, finger: 'Right Middle', hand: 'right', type: 'कवर्ग अल्पप्राण', exampleWord: 'कमल', wordMeaning: 'क + म + ल' },
      { id: 'c_kha', hindiChar: 'ख', enPhysicalKey: 'K', code: 'KeyK', requiresShift: true, finger: 'Right Middle', hand: 'right', type: 'कवर्ग महाप्राण', exampleWord: 'खरगोश', wordMeaning: 'ख + र + ग + ो + श' },
      { id: 'c_ga', hindiChar: 'ग', enPhysicalKey: 'I', code: 'KeyI', requiresShift: false, finger: 'Right Middle', hand: 'right', type: 'कवर्ग सघोष', exampleWord: 'गगन', wordMeaning: 'ग + ग + न' },
      { id: 'c_gha', hindiChar: 'घ', enPhysicalKey: 'I', code: 'KeyI', requiresShift: true, finger: 'Right Middle', hand: 'right', type: 'कवर्ग महाप्राण', exampleWord: 'घर', wordMeaning: 'घ + र' },
      { id: 'c_ca', hindiChar: 'च', enPhysicalKey: ';', code: 'Semicolon', requiresShift: false, finger: 'Right Pinky', hand: 'right', type: 'चवर्ग', exampleWord: 'चमक', wordMeaning: 'च + म + क' },
      { id: 'c_cha', hindiChar: 'छ', enPhysicalKey: ';', code: 'Semicolon', requiresShift: true, finger: 'Right Pinky', hand: 'right', type: 'चवर्ग महाप्राण', exampleWord: 'छाता', wordMeaning: 'छ + ा + त + ा' },
      { id: 'c_ja', hindiChar: 'ज', enPhysicalKey: 'P', code: 'KeyP', requiresShift: false, finger: 'Right Pinky', hand: 'right', type: 'चवर्ग सघोष', exampleWord: 'जल', wordMeaning: 'ज + ल' },
      { id: 'c_ta', hindiChar: 'त', enPhysicalKey: 'L', code: 'KeyL', requiresShift: false, finger: 'Right Ring', hand: 'right', type: 'तवर्ग', exampleWord: 'तरंग', wordMeaning: 'त + र + ं + ग' },
      { id: 'c_tha', hindiChar: 'थ', enPhysicalKey: 'L', code: 'KeyL', requiresShift: true, finger: 'Right Ring', hand: 'right', type: 'तवर्ग महाप्राण', exampleWord: 'थल', wordMeaning: 'थ + ल' },
      { id: 'c_da', hindiChar: 'द', enPhysicalKey: 'O', code: 'KeyO', requiresShift: false, finger: 'Right Ring', hand: 'right', type: 'तवर्ग', exampleWord: 'देश', wordMeaning: 'द + े + श' },
      { id: 'c_dha', hindiChar: 'ध', enPhysicalKey: 'O', code: 'KeyO', requiresShift: true, finger: 'Right Ring', hand: 'right', type: 'तवर्ग महाप्राण', exampleWord: 'धन', wordMeaning: 'ध + न' },
      { id: 'c_na', hindiChar: 'न', enPhysicalKey: 'V', code: 'KeyV', requiresShift: false, finger: 'Left Index', hand: 'left', type: 'नासिक्य', exampleWord: 'नगर', wordMeaning: 'न + ग + र' },
      { id: 'c_pa', hindiChar: 'प', enPhysicalKey: 'H', code: 'KeyH', requiresShift: false, finger: 'Right Index', hand: 'right', type: 'पवर्ग', exampleWord: 'पवन', wordMeaning: 'प + व + न' },
      { id: 'c_pha', hindiChar: 'फ', enPhysicalKey: 'H', code: 'KeyH', requiresShift: true, finger: 'Right Index', hand: 'right', type: 'पवर्ग महाप्राण', exampleWord: 'फल', wordMeaning: 'फ + ल' },
      { id: 'c_ba', hindiChar: 'ब', enPhysicalKey: 'Y', code: 'KeyY', requiresShift: false, finger: 'Right Index', hand: 'right', type: 'पवर्ग', exampleWord: 'बल', wordMeaning: 'ब + ल' },
      { id: 'c_bha', hindiChar: 'भ', enPhysicalKey: 'Y', code: 'KeyY', requiresShift: true, finger: 'Right Index', hand: 'right', type: 'पवर्ग महाप्राण', exampleWord: 'भवन', wordMeaning: 'भ + व + न' },
      { id: 'c_ma', hindiChar: 'म', enPhysicalKey: 'C', code: 'KeyC', requiresShift: false, finger: 'Left Middle', hand: 'left', type: 'नासिक्य', exampleWord: 'मन', wordMeaning: 'म + न' },
      { id: 'c_ya', hindiChar: 'य', enPhysicalKey: '/', code: 'Slash', requiresShift: false, finger: 'Right Pinky', hand: 'right', type: 'अंतःस्थ', exampleWord: 'यश', wordMeaning: 'य + श' },
      { id: 'c_ra', hindiChar: 'र', enPhysicalKey: 'J', code: 'KeyJ', requiresShift: false, finger: 'Right Index', hand: 'right', type: 'लुंठित', exampleWord: 'रत्न', wordMeaning: 'र + त + ् + न' },
      { id: 'c_la', hindiChar: 'ल', enPhysicalKey: 'N', code: 'KeyN', requiresShift: false, finger: 'Right Index', hand: 'right', type: 'पाश्विक', exampleWord: 'लहर', wordMeaning: 'ल + ह + र' },
      { id: 'c_va', hindiChar: 'व', enPhysicalKey: 'B', code: 'KeyB', requiresShift: false, finger: 'Left Index', hand: 'left', type: 'दंतोष्ठ्य', exampleWord: 'वन', wordMeaning: 'व + न' },
      { id: 'c_sa', hindiChar: 'स', enPhysicalKey: 'M', code: 'KeyM', requiresShift: false, finger: 'Right Index', hand: 'right', type: 'दंत्य स', exampleWord: 'सत्य', wordMeaning: 'स + त + ् + य' },
      { id: 'c_ha', hindiChar: 'ह', enPhysicalKey: 'U', code: 'KeyU', requiresShift: false, finger: 'Right Index', hand: 'right', type: 'ऊष्म', exampleWord: 'हंस', wordMeaning: 'ह + ं + स' },
    ],
  },
  matras: {
    title: 'मात्राएँ (Vowel Signs)',
    subtitle: 'व्यंजनों पर लगने वाले स्वर चिह्न (बाएँ हाथ की कुंजियाँ)',
    items: [
      { id: 'm_aa', hindiChar: 'ा', enPhysicalKey: 'E', code: 'KeyE', requiresShift: false, finger: 'Left Middle', hand: 'left', type: 'आ की मात्रा', exampleWord: 'काम', wordMeaning: 'क + ा + म' },
      { id: 'm_i', hindiChar: 'ि', enPhysicalKey: 'F', code: 'KeyF', requiresShift: false, finger: 'Left Index', hand: 'left', type: 'इ की मात्रा', exampleWord: 'दिन', wordMeaning: 'द + ि + न' },
      { id: 'm_ii', hindiChar: 'ी', enPhysicalKey: 'R', code: 'KeyR', requiresShift: false, finger: 'Left Index', hand: 'left', type: 'ई की मात्रा', exampleWord: 'गीत', wordMeaning: 'ग + ी + त' },
      { id: 'm_u', hindiChar: 'ु', enPhysicalKey: 'G', code: 'KeyG', requiresShift: false, finger: 'Left Index', hand: 'left', type: 'उ की मात्रा', exampleWord: 'सुख', wordMeaning: 'स + ु + ख' },
      { id: 'm_uu', hindiChar: 'ू', enPhysicalKey: 'T', code: 'KeyT', requiresShift: false, finger: 'Left Index', hand: 'left', type: 'ऊ की मात्रा', exampleWord: 'दूध', wordMeaning: 'द + ू + ध' },
      { id: 'm_ri', hindiChar: 'ृ', enPhysicalKey: '=', code: 'Equal', requiresShift: false, finger: 'Right Pinky', hand: 'right', type: 'ऋ की मात्रा', exampleWord: 'कृपा', wordMeaning: 'क + ृ + प + ा' },
      { id: 'm_e', hindiChar: 'े', enPhysicalKey: 'S', code: 'KeyS', requiresShift: false, finger: 'Left Ring', hand: 'left', type: 'ए की मात्रा', exampleWord: 'रेल', wordMeaning: 'र + े + ल' },
      { id: 'm_ai', hindiChar: 'ै', enPhysicalKey: 'W', code: 'KeyW', requiresShift: false, finger: 'Left Ring', hand: 'left', type: 'ऐ की मात्रा', exampleWord: 'पैर', wordMeaning: 'प + ै + र' },
      { id: 'm_o', hindiChar: 'ो', enPhysicalKey: 'A', code: 'KeyA', requiresShift: false, finger: 'Left Pinky', hand: 'left', type: 'ओ की मात्रा', exampleWord: 'मोर', wordMeaning: 'म + ो + र' },
      { id: 'm_au', hindiChar: 'ौ', enPhysicalKey: 'Q', code: 'KeyQ', requiresShift: false, finger: 'Left Pinky', hand: 'left', type: 'औ की मात्रा', exampleWord: 'पौधा', wordMeaning: 'प + ौ + ध + ा' },
    ],
  },
  halant: {
    title: 'हलन्त एवं आधा अक्षर (Virama / Halant)',
    subtitle: 'किसी भी वर्ण को आधा करने एवं संयुक्त अक्षर बनाने हेतु',
    items: [
      { id: 'h_halant', hindiChar: '्', enPhysicalKey: 'D', code: 'KeyD', requiresShift: false, finger: 'Left Middle', hand: 'left', type: 'हलन्त (Virama)', exampleWord: 'क्या', wordMeaning: 'क + ् + य + ा' },
      { id: 'h_anusvara', hindiChar: 'ं', enPhysicalKey: 'X', code: 'KeyX', requiresShift: false, finger: 'Left Ring', hand: 'left', type: 'अनुस्वार', exampleWord: 'गंगा', wordMeaning: 'ग + ं + ग + ा' },
      { id: 'h_chandra', hindiChar: 'ँ', enPhysicalKey: 'X', code: 'KeyX', requiresShift: true, finger: 'Left Ring', hand: 'left', type: 'चन्द्रबिन्दु', exampleWord: 'चाँद', wordMeaning: 'च + ा + ँ + द' },
      { id: 'h_visarga', hindiChar: 'ः', enPhysicalKey: '-', code: 'Minus', requiresShift: true, finger: 'Right Pinky', hand: 'right', type: 'विसर्ग', exampleWord: 'दुःख', wordMeaning: 'द + ु + ः + ख' },
      { id: 'h_nukta', hindiChar: '़', enPhysicalKey: ']', code: 'BracketRight', requiresShift: false, finger: 'Right Pinky', hand: 'right', type: 'नुक्ता', exampleWord: 'ज़मीन', wordMeaning: 'ज + ़ + म + ी + न' },
    ],
  },
  compound: {
    title: 'संयुक्त वर्ण (Compound Letters)',
    subtitle: 'दो वर्णों के मेल से बने विशेष संयुक्त अक्षर',
    items: [
      { id: 'cp_ksha', hindiChar: 'क्ष', enPhysicalKey: 'K + D + Shift+,', code: 'KeyK', requiresShift: false, finger: 'क + ् + ष', hand: 'right', type: 'संयुक्त वर्ण', exampleWord: 'रक्षा', wordMeaning: 'र + क्ष + ा' },
      { id: 'cp_tra', hindiChar: 'त्र', enPhysicalKey: 'L + D + J', code: 'KeyL', requiresShift: false, finger: 'त + ् + र', hand: 'right', type: 'संयुक्त वर्ण', exampleWord: 'मित्र', wordMeaning: 'म + ि + त्र' },
      { id: 'cp_gya', hindiChar: 'ज्ञ', enPhysicalKey: 'P + D + Shift+]', code: 'KeyP', requiresShift: false, finger: 'ज + ् + ञ', hand: 'right', type: 'संयुक्त वर्ण', exampleWord: 'ज्ञान', wordMeaning: 'ज्ञ + ा + न' },
      { id: 'cp_shra', hindiChar: 'श्र', enPhysicalKey: 'Shift+M + D + J', code: 'KeyM', requiresShift: true, finger: 'श + ् + र', hand: 'right', type: 'संयुक्त वर्ण', exampleWord: 'श्रम', wordMeaning: 'श्र + म' },
    ],
  },
  numbers: {
    title: 'देवनागरी अंक (Devanagari Digits)',
    subtitle: 'भारतीय राजकीय मानकों के अनुसार देवनागरी संख्याएँ (0-9)',
    items: [
      { id: 'n_0', hindiChar: '०', enPhysicalKey: '0', code: 'Digit0', requiresShift: false, finger: 'Right Pinky', hand: 'right', type: 'शून्य (0)', exampleWord: '१०', wordMeaning: '१ + ०' },
      { id: 'n_1', hindiChar: '१', enPhysicalKey: '1', code: 'Digit1', requiresShift: false, finger: 'Left Pinky', hand: 'left', type: 'एक (1)', exampleWord: '१००', wordMeaning: '१ + ० + ०' },
      { id: 'n_2', hindiChar: '२', enPhysicalKey: '2', code: 'Digit2', requiresShift: false, finger: 'Left Ring', hand: 'left', type: 'दो (2)', exampleWord: '२५', wordMeaning: '२ + ५' },
      { id: 'n_3', hindiChar: '३', enPhysicalKey: '3', code: 'Digit3', requiresShift: false, finger: 'Left Middle', hand: 'left', type: 'तीन (3)', exampleWord: '३०', wordMeaning: '३ + ०' },
      { id: 'n_4', hindiChar: '४', enPhysicalKey: '4', code: 'Digit4', requiresShift: false, finger: 'Left Index', hand: 'left', type: 'चार (4)', exampleWord: '४०', wordMeaning: '४ + ०' },
      { id: 'n_5', hindiChar: '५', enPhysicalKey: '5', code: 'Digit5', requiresShift: false, finger: 'Left Index', hand: 'left', type: 'पाँच (5)', exampleWord: '५०', wordMeaning: '५ + ०' },
    ],
  },
  punctuation: {
    title: 'विराम चिन्ह (Punctuation & Signs)',
    subtitle: 'पूर्ण विराम, अल्प विराम एवं मानक वाक्य चिन्ह',
    items: [
      { id: 'p_purna', hindiChar: '।', enPhysicalKey: '.', code: 'Period', requiresShift: true, finger: 'Right Ring', hand: 'right', type: 'पूर्ण विराम (दण्ड)', exampleWord: 'राम गया।', wordMeaning: 'वाक्य समाप्ति' },
      { id: 'p_comma', hindiChar: ',', enPhysicalKey: ',', code: 'Comma', requiresShift: false, finger: 'Right Middle', hand: 'right', type: 'अल्प विराम (Comma)', exampleWord: 'हाँ, ठीक है।', wordMeaning: 'अल्प विश्राम' },
      { id: 'p_hyphen', hindiChar: '-', enPhysicalKey: '-', code: 'Minus', requiresShift: false, finger: 'Right Pinky', hand: 'right', type: 'योजक चिन्ह (Hyphen)', exampleWord: 'दिन-रात', wordMeaning: 'शब्द जोड़' },
    ],
  },
};

export const CharacterLearning: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CharacterCategory>('vowels');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [incorrectCount, setIncorrectCount] = useState<number>(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const currentLesson = CHARACTER_LESSONS[activeCategory];
  const item = currentLesson.items[currentIndex] || currentLesson.items[0];

  const handleNext = () => {
    setFeedback(null);
    setCurrentIndex((prev) => (prev + 1) % currentLesson.items.length);
  };

  const handlePrev = () => {
    setFeedback(null);
    setCurrentIndex((prev) => (prev - 1 + currentLesson.items.length) % currentLesson.items.length);
  };

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!item) return;

    // Check physical key mapping
    const typedHindi = mapPhysicalKeyToHindi(e.code, e.shiftKey, e.altKey);

    if (typedHindi === item.hindiChar || e.code === item.code) {
      e.preventDefault();
      audioService.playKeyClick();
      setFeedback('correct');
      setCorrectCount((c) => c + 1);
      setTimeout(() => {
        handleNext();
      }, 500);
    } else if (e.code.startsWith('Key') || e.code.startsWith('Digit') || ['Semicolon', 'Quote', 'Comma', 'Period', 'Slash', 'Equal', 'Minus'].includes(e.code)) {
      e.preventDefault();
      audioService.playErrorBeep();
      setFeedback('incorrect');
      setIncorrectCount((c) => c + 1);
    }
  }, [item, currentLesson]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Hindi Character Learning Module
            </h2>
            <Badge variant="blue" size="sm">Module 3</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive drill: Learn individual Devanagari vowels, consonants, matras, and fingers.
          </p>
        </div>

        {/* Score Counters */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 className="w-3.5 h-3.5" /> Correct: {correctCount}
          </span>
          <span className="flex items-center gap-1 text-red-600 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-900">
            <XCircle className="w-3.5 h-3.5" /> Mistakes: {incorrectCount}
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(Object.keys(CHARACTER_LESSONS) as CharacterCategory[]).map((catKey) => {
          const isSelected = activeCategory === catKey;
          const cat = CHARACTER_LESSONS[catKey];
          return (
            <button
              key={catKey}
              onClick={() => {
                setActiveCategory(catKey);
                setCurrentIndex(0);
                setFeedback(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.title.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Main Interactive Character Display Card */}
      <Card className="p-6 space-y-6 border-2 border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Giant Character Preview */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 w-full sm:w-48 h-48 shadow-inner">
            <span
              className={`text-6xl sm:text-7xl font-extrabold font-devanagari transition-all ${
                feedback === 'correct'
                  ? 'text-emerald-600 scale-110'
                  : feedback === 'incorrect'
                  ? 'text-red-600 animate-shake'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {item.hindiChar}
            </span>
            <span className="text-[11px] text-slate-400 mt-2 font-medium">
              {item.type}
            </span>
          </div>

          {/* Key Details & Finger Assignment */}
          <div className="flex-1 space-y-4 w-full">
            <div className="flex items-center justify-between">
              <Badge variant="blue" size="md">
                Item {currentIndex + 1} of {currentLesson.items.length}
              </Badge>
              <div className="text-xs text-slate-400 font-mono">
                Press the physical key on your keyboard to test
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-slate-400 block text-[10px]">Physical Key</span>
                <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                  {item.requiresShift ? `Shift + ${item.enPhysicalKey}` : item.enPhysicalKey}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-slate-400 block text-[10px]">Shift Required?</span>
                <span className={`font-bold ${item.requiresShift ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}`}>
                  {item.requiresShift ? 'Yes (⇧ Shift Key)' : 'No (Direct Press)'}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-slate-400 block text-[10px]">Finger Assignment</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {item.finger}
                </span>
              </div>
            </div>

            {/* Example Word */}
            <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 font-medium">Example Usage: </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-devanagari text-sm">
                  {item.exampleWord}
                </span>
              </div>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-mono">
                Decomposition: {item.wordMeaning}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1.5">
            {feedback === 'correct' && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> शाबाश! सही कुंजी।
              </span>
            )}
            {feedback === 'incorrect' && (
              <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> गलत कुंजी! पुनः प्रयास करें।
              </span>
            )}
          </div>

          <Button
            size="sm"
            onClick={handleNext}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Next Character
          </Button>
        </div>
      </Card>

      {/* Target Key Highlight on Virtual Keyboard */}
      <VirtualKeyboard
        targetKeyCode={item.code}
        requiresShift={item.requiresShift}
        errorKeyCode={feedback === 'incorrect' ? 'Error' : undefined}
      />
    </div>
  );
};
