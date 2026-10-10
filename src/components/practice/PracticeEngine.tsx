'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  CheckCircle2,
  AlertCircle,
  Clock,
  Gauge,
  Flame,
  Award,
  BookOpen,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { VirtualKeyboard } from '@/components/keyboard/VirtualKeyboard';
import { mapPhysicalKeyToHindi, getKeystrokeForChar } from '@/services/engine/inscriptMapping';
import { audioService } from '@/services/engine/audioService';
import { useProfile } from '@/context/ProfileContext';
import { StatisticsService } from '@/services/statistics/statisticsService';

export interface PracticePassage {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Exam';
  text: string;
  estimatedMinutes: number;
}

export const PRACTICE_PASSAGES: PracticePassage[] = [
  {
    id: 'pass_home_row',
    title: 'अभ्यास 1: होम रो वर्ण एवं मात्राएँ (Home Row Drills)',
    difficulty: 'Beginner',
    text: 'पर कर तक रच पक चर पट कप तक तर पत कर पर तक चर रप सर हर का सा हा',
    estimatedMinutes: 2,
  },
  {
    id: 'pass_conjuncts',
    title: 'अभ्यास 2: हलन्त एवं संयुक्त वर्ण (Halant & Conjuncts)',
    difficulty: 'Intermediate',
    text: 'क्या त्याग पत्र क्षेत्र ज्ञान प्रकाश क्रम प्रश्न शक्ति राष्ट्र न्याय ध्यान',
    estimatedMinutes: 3,
  },
  {
    id: 'pass_court_exam',
    title: 'अभ्यास 3: सीपीसीटी एवं उच्च न्यायालय परीक्षा गद्यांश (Exam Passage)',
    difficulty: 'Exam',
    text: 'भारत एक विशाल एवं समृद्ध देश है जहाँ विभिन्न संस्कृतियों का संगम देखने को मिलता है। निरंतर अभ्यास ही परीक्षा में सफलता की कुंजी है।',
    estimatedMinutes: 5,
  },
  {
    id: 'pass_speed_drill',
    title: 'अभ्यास 4: कंप्यूटर एवं विज्ञान (Computer & Technology)',
    difficulty: 'Exam',
    text: 'कंप्यूटर आधुनिक युग का एक महत्वपूर्ण साधन बन गया है। कार्यालयीन कार्यों में हिंदी टाइपिंग का उपयोग तीव्र गति से बढ़ रहा है।',
    estimatedMinutes: 5,
  },
];

export const PracticeEngine: React.FC = () => {
  const { activeProfile } = useProfile();

  const [selectedPassageIndex, setSelectedPassageIndex] = useState<number>(0);
  const activePassage = PRACTICE_PASSAGES[selectedPassageIndex];

  // Typing engine states
  const [typedText, setTypedText] = useState<string>('');
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [backspaceCount, setBackspaceCount] = useState<number>(0);
  const [lastErrorCode, setLastErrorCode] = useState<string | undefined>();
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Result summary modal
  const [isResultModalOpen, setIsResultModalOpen] = useState<boolean>(false);
  const [resultSaved, setResultSaved] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const targetChars = Array.from(activePassage.text);
  const typedChars = Array.from(typedText);
  const currentIndex = typedChars.length;
  const currentTargetChar = targetChars[currentIndex] || '';

  // Keystroke for current target char
  const currentKeystroke = currentTargetChar ? getKeystrokeForChar(currentTargetChar) : null;

  // Sound sync
  useEffect(() => {
    audioService.setMuted(!soundEnabled);
  }, [soundEnabled]);

  // Elapsed timer
  useEffect(() => {
    if (isStarted && !isPaused && !isFinished) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((sec) => sec + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, isPaused, isFinished]);

  // Reset practice
  const handleReset = () => {
    setIsStarted(false);
    setIsPaused(false);
    setIsFinished(false);
    setTypedText('');
    setElapsedSeconds(0);
    setErrorCount(0);
    setBackspaceCount(0);
    setLastErrorCode(undefined);
    setIsResultModalOpen(false);
    setResultSaved(false);
  };

  const handleSelectPassage = (index: number) => {
    setSelectedPassageIndex(index);
    handleReset();
  };

  // Keyboard capture engine
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isFinished || isPaused) return;

      // Handle Backspace
      if (e.code === 'Backspace') {
        e.preventDefault();
        if (typedText.length > 0) {
          audioService.playKeyClick();
          setTypedText((prev) => prev.slice(0, -1));
          setBackspaceCount((b) => b + 1);
          setLastErrorCode(undefined);
        }
        return;
      }

      // Ignore modifiers and functional keys alone
      if (['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight', 'Tab', 'CapsLock', 'Escape'].includes(e.code)) {
        return;
      }

      // Map physical key to InScript Hindi
      const mappedChar = mapPhysicalKeyToHindi(e.code, e.shiftKey, e.altKey);
      if (!mappedChar) return;

      e.preventDefault(); // Prevent default OS input and IME duplication!

      // Start timer on first keystroke
      if (!isStarted) {
        setIsStarted(true);
      }

      const expectedChar = targetChars[typedChars.length];

      if (mappedChar === expectedChar) {
        audioService.playKeyClick();
        const nextTyped = typedText + mappedChar;
        setTypedText(nextTyped);
        setLastErrorCode(undefined);

        // Check if finished
        if (nextTyped.length >= activePassage.text.length) {
          setIsFinished(true);
          audioService.playSuccessChime();
          setIsResultModalOpen(true);
        }
      } else {
        audioService.playErrorBeep();
        setErrorCount((err) => err + 1);
        setLastErrorCode(e.code);
      }
    },
    [isFinished, isPaused, isStarted, typedText, targetChars, typedChars, activePassage]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Accuracy calculation
  const totalKeystrokes = typedText.length + errorCount;
  const accuracy = totalKeystrokes > 0 ? Math.max(0, Math.round(((totalKeystrokes - errorCount) / totalKeystrokes) * 100)) : 100;
  const minutes = Math.max(0.01, elapsedSeconds / 60);
  const wordsTyped = typedText.length / 5;
  const grossWpm = Math.round(wordsTyped / minutes);
  const netWpm = Math.max(0, Math.round((typedText.length / 5 - errorCount) / minutes));

  // Save session result
  const handleSaveResult = async () => {
    if (!activeProfile || resultSaved) return;
    try {
      await StatisticsService.recordPracticeResult({
        id: `result_${Date.now()}`,
        profileId: activeProfile.id,
        lessonId: activePassage.id,
        lessonTitle: activePassage.title,
        layout: activeProfile.preferences.keyboardLayout,
        language: 'hindi',
        completedAt: Date.now(),
        durationSeconds: Math.max(1, elapsedSeconds),
        grossWpm,
        netWpm,
        accuracy,
        totalKeyStrokes: totalKeystrokes,
        correctKeyStrokes: typedText.length,
        errorCount,
        backspaceCount,
      });
      setResultSaved(true);
    } catch (err) {
      console.error('Error saving practice result:', err);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 bg-slate-50 dark:bg-slate-950 p-2 sm:p-4 rounded-2xl">
      {/* Engine Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Hindi InScript Typing Practice Engine
            </h2>
            <Badge variant="blue" size="sm">Module 5</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time physical keypress capture • Layout-independent Unicode Hindi touch typing
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute audio' : 'Enable audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </Button>

          {isStarted && !isFinished && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              icon={isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Restart
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Passage Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PRACTICE_PASSAGES.map((pass, pIdx) => {
          const isSelected = selectedPassageIndex === pIdx;
          return (
            <button
              key={pass.id}
              onClick={() => handleSelectPassage(pIdx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{pass.title.split(':')[0]}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                pass.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                pass.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
              }`}>
                {pass.difficulty}
              </span>
            </button>
          );
        })}
      </div>

      {/* Real-Time Live Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Net Speed</span>
            <Gauge className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{netWpm}</span>
            <span className="text-xs text-slate-400">WPM</span>
          </div>
        </Card>

        <Card className="p-3 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{accuracy}%</span>
          </div>
        </Card>

        <Card className="p-3 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Mistakes</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-red-600">{errorCount}</span>
            <span className="text-xs text-slate-400">errors</span>
          </div>
        </Card>

        <Card className="p-3 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Elapsed Time</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{elapsedSeconds}</span>
            <span className="text-xs text-slate-400">sec</span>
          </div>
        </Card>
      </div>

      {/* Main Interactive Typing Canvas */}
      <Card className="p-6 border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {activePassage.title}
          </span>
          <span className="font-mono">
            Progress: {typedChars.length} / {targetChars.length} characters
          </span>
        </div>

        {/* Character-by-Character Highlight Container */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xl sm:text-2xl leading-relaxed tracking-wide font-devanagari select-none min-h-[120px]">
          {targetChars.map((char, index) => {
            const isTyped = index < typedChars.length;
            const isCurrent = index === typedChars.length;
            const typedChar = typedChars[index];
            const isMatch = isTyped && typedChar === char;

            let charClass = 'text-slate-400 dark:text-slate-600';
            if (isTyped) {
              charClass = isMatch ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-red-500 bg-red-100 dark:bg-red-950/60 rounded px-0.5 line-through';
            } else if (isCurrent) {
              charClass = 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/80 rounded px-1 font-extrabold ring-2 ring-blue-500 shadow-sm animate-pulse';
            }

            return (
              <span key={index} className={charClass}>
                {char}
              </span>
            );
          })}
        </div>

        {/* Current Key Instruction Prompt */}
        {!isFinished && currentKeystroke && (
          <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Next Target Key:</span>
              <span className="text-lg font-extrabold text-blue-600 font-devanagari">
                {currentTargetChar === ' ' ? 'Space (रिक्त स्थान)' : currentTargetChar}
              </span>
              <kbd className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold text-xs">
                {currentKeystroke.enKeyLabel}
              </kbd>
            </div>
            <span className="text-slate-500 font-medium">
              Finger: <span className="font-bold text-slate-800 dark:text-slate-200">{currentKeystroke.finger}</span>
            </span>
          </div>
        )}

        {isFinished && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>अभ्यास समाप्त! आपने गद्यांश पूर्ण कर लिया है।</span>
            </div>
            <Button size="sm" onClick={() => setIsResultModalOpen(true)}>
              View Session Summary
            </Button>
          </div>
        )}
      </Card>

      {/* Embedded Virtual Keyboard with Target Key Highlight */}
      <VirtualKeyboard
        targetKeyCode={!isFinished && currentKeystroke ? currentKeystroke.code : undefined}
        requiresShift={!isFinished && currentKeystroke ? currentKeystroke.requiresShift : false}
        errorKeyCode={lastErrorCode}
      />

      {/* Session Result Summary Modal */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title="Typing Session Complete!"
        subtitle="Performance Evaluation & Result Summary"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="text-center py-2 space-y-1">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {netWpm} Net WPM
            </h3>
            <p className="text-xs text-slate-500">
              Passage: {activePassage.title}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">Gross Speed</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">{grossWpm} WPM</span>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">Accuracy</span>
              <span className="font-extrabold text-emerald-600">{accuracy}%</span>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">Errors</span>
              <span className="font-extrabold text-red-600">{errorCount}</span>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">Time</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">{elapsedSeconds} sec</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Practice Again
            </Button>

            {resultSaved ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Result Saved to Profile!
              </span>
            ) : (
              <Button size="sm" onClick={handleSaveResult}>
                Save Result to Profile
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
