'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Keyboard as KeyboardIcon,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Award,
  Zap,
  Target,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import {
  mapPhysicalKeyToRemington,
  convertTypewriterOrderToUnicode,
} from '@/services/engine/remingtonMapping';
import { audioService } from '@/services/engine/audioService';
import { RemingtonVirtualKeyboard } from '@/components/keyboard/RemingtonVirtualKeyboard';
import { HeatmapService } from '@/services/analytics/heatmapService';
import { AchievementService } from '@/services/achievements/achievementService';

const REMINGTON_LESSONS = [
  {
    id: 'rem_01_home',
    title: 'होम रो अभ्यास — क, ह, र, स, य, श',
    description: 'मध्य पंक्ति की मुख्य कुंजियों का आधारभूत अभ्यास',
    text: 'क ह र स य श क ह र स य श कर सर कह यह सह रह शक',
  },
  {
    id: 'rem_02_matras',
    title: 'मात्रा अभ्यास — ा, ि, ी, े, ौ',
    description: 'रेमिंगटन मात्राएं और छोटी इ की पूर्ववर्ती मात्रा का प्रयोग',
    text: 'किताब सिर दिन कवि रवि किरण किसान शिक्षा विचार विकास',
  },
  {
    id: 'rem_03_top',
    title: 'शीर्ष पंक्ति — म, त, ज, ल, न, प, व, च',
    description: 'ऊपरी पंक्ति के व्यंजनों एवं उ/ऊ मात्राओं का अभ्यास',
    text: 'मन तन जन पल वन चल कमल पवन नगर चमक तपन वचन',
  },
  {
    id: 'rem_04_bottom',
    title: 'निचली पंक्ति — ग, ब, द, अ, इ, उ, ए, ण, ध',
    description: 'निचली पंक्ति के स्वर एवं व्यंजनों का सधा हुआ अभ्यास',
    text: 'गति बल दल अगर इधर उधर एक धन गण समय सफल भारत',
  },
  {
    id: 'rem_05_court',
    title: 'हाई कोर्ट एवं CPCT विधिक शब्दावली',
    description: 'मध्य प्रदेश CPCT एवं उच्च न्यायालय परीक्षा के विधिक शब्द',
    text: 'उच्च न्यायालय निर्णय आदेश याचिकाकर्ता शपथपत्र साक्ष्य गवाह अधिवक्ता अभिलेख',
  },
];

export const RemingtonPractice: React.FC = () => {
  const { activeProfile } = useProfile();
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [activeCode, setActiveCode] = useState<string | undefined>(undefined);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const lesson = REMINGTON_LESSONS[selectedLessonIndex];
  const targetText = lesson.text;

  // Timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && !isFinished) {
      interval = setInterval(() => {
        if (startTime) {
          setElapsedSeconds(Math.max(1, Math.floor((Date.now() - startTime) / 1000)));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, isFinished, startTime]);

  const handleReset = () => {
    setTypedText('');
    setIsStarted(false);
    setIsFinished(false);
    setStartTime(null);
    setElapsedSeconds(0);
    setErrorCount(0);
    setActiveCode(undefined);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isFinished) return;

      if (e.code === 'Backspace') {
        e.preventDefault();
        if (typedText.length > 0) {
          if (!isMuted) audioService.playKeyClick();
          setTypedText((prev) => prev.slice(0, -1));
        }
        return;
      }

      if (['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight', 'Tab', 'CapsLock', 'Escape'].includes(e.code)) {
        return;
      }

      const mapped = mapPhysicalKeyToRemington(e.code, e.shiftKey);
      if (!mapped) return;

      e.preventDefault();

      setActiveCode(e.code);
      setTimeout(() => setActiveCode(undefined), 150);

      if (!isStarted) {
        setIsStarted(true);
        setStartTime(Date.now());
      }

      const nextRaw = typedText + mapped;
      // Convert typewriter 'ि' + consonant logic to Unicode
      const nextNormalized = convertTypewriterOrderToUnicode(nextRaw);

      const expectedChar = targetText[typedText.length];
      const isCorrect = mapped === expectedChar;

      if (!isCorrect) {
        setErrorCount((c) => c + 1);
        if (!isMuted) audioService.playErrorBeep();
      } else {
        if (!isMuted) audioService.playKeyStroke();
      }

      // Record to Heatmap
      if (activeProfile) {
        HeatmapService.recordKeyAttempt(
          activeProfile.id,
          'remington_gail',
          e.code,
          expectedChar || '',
          mapped,
          isCorrect
        ).catch(() => {});
      }

      setTypedText(nextNormalized);

      // Check completion
      if (nextNormalized.length >= targetText.length) {
        setIsFinished(true);
        if (activeProfile) {
          AchievementService.evaluateAndAwardAchievements(activeProfile.id).catch(() => {});
        }
      }
    },
    [isFinished, isStarted, typedText, targetText, isMuted, activeProfile]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Metric calculations
  const wordsTyped = typedText.length / 5;
  const minutes = Math.max(0.01, elapsedSeconds / 60);
  const grossWpm = Math.round(wordsTyped / minutes);
  const netWpm = Math.max(0, Math.round((typedText.length - errorCount) / 5 / minutes));
  const accuracy =
    typedText.length > 0
      ? Math.max(0, Math.round(((typedText.length - errorCount) / typedText.length) * 100))
      : 100;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header and Lesson Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <KeyboardIcon className="w-5 h-5 text-purple-600" />
              <span>रेमिंगटन गेल टंकण प्रशिक्षण (Remington GAIL Practice)</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
              CPCT & High Court
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            पारंपरिक हिंदी टाइपराइटर लेआउट — मध्य प्रदेश CPCT, राजस्थान एवं इलाहाबाद उच्च न्यायालय परीक्षा हेतु अधिकृत
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="ध्वनि टॉगल करें"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              showVirtualKeyboard
                ? 'bg-purple-600 text-white border-purple-700'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
            }`}
          >
            कीबोर्ड
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>रीसेट</span>
          </button>
        </div>
      </div>

      {/* Lesson Selector Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {REMINGTON_LESSONS.map((l, i) => (
          <button
            key={l.id}
            onClick={() => {
              setSelectedLessonIndex(i);
              handleReset();
            }}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition-all ${
              selectedLessonIndex === i
                ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {l.title}
          </button>
        ))}
      </div>

      {/* Live Stats Scoreboard */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-center shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">शुद्ध गति (Net WPM)</span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5">
            {netWpm}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-center shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">सटीकता (Accuracy)</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            {accuracy}%
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-center shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">समय (Elapsed)</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
            {elapsedSeconds}s
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-center shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">त्रुटियाँ (Errors)</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
            {errorCount}
          </div>
        </div>
      </div>

      {/* Interactive Typing Practice Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-purple-200 dark:border-purple-900/60 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
          <span>{lesson.description}</span>
          <span>प्रगति: {typedText.length} / {targetText.length}</span>
        </div>

        {/* Character Display */}
        <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-devanagari text-2xl leading-relaxed tracking-wider min-h-[140px] select-none">
          {targetText.split('').map((char, index) => {
            const isTyped = index < typedText.length;
            const isCurrent = index === typedText.length;
            const isMatch = isTyped && typedText[index] === char;

            let colorClass = 'text-slate-400';
            if (isTyped) {
              colorClass = isMatch ? 'text-emerald-600 font-bold' : 'text-rose-600 line-through bg-rose-50';
            } else if (isCurrent) {
              colorClass = 'bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded-xs px-0.5 animate-pulse';
            }

            return (
              <span key={index} className={colorClass}>
                {char}
              </span>
            );
          })}
        </div>

        {!isStarted && !isFinished && (
          <div className="mt-4 text-center text-xs font-semibold text-purple-600 dark:text-purple-400 animate-pulse">
            टंकण शुरू करने हेतु किसी भी भौतिक कुंजी को दबाएं...
          </div>
        )}

        {isFinished && (
          <div className="mt-5 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div>
                <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                  अभ्यास सफलतापूर्वक संपन्न! (Lesson Complete)
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  शुद्ध गति: {netWpm} WPM • सटीकता: {accuracy}% • समय: {elapsedSeconds} सेकंड
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (selectedLessonIndex < REMINGTON_LESSONS.length - 1) {
                  setSelectedLessonIndex((prev) => prev + 1);
                }
                handleReset();
              }}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>अगला पाठ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Virtual Remington Keyboard Guide */}
      {showVirtualKeyboard && (
        <RemingtonVirtualKeyboard activeCode={activeCode} />
      )}
    </div>
  );
};
