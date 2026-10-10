'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Clock,
  Gauge,
  Sparkles,
  BookOpen,
  ChevronRight,
  Award,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { VirtualKeyboard } from '@/components/keyboard/VirtualKeyboard';
import { mapPhysicalKeyToHindi, getKeystrokeForChar } from '@/services/engine/inscriptMapping';
import { audioService } from '@/services/engine/audioService';
import { ProgressionService } from '@/services/lms/progressionService';
import { AdaptivePracticeService } from '@/services/lms/adaptivePracticeService';
import { useProfile } from '@/context/ProfileContext';
import { LmsLesson, LessonStageId } from '@/types/lms';

interface LessonPlayerProps {
  lesson: LmsLesson;
  onBack: () => void;
  onLessonCompleted?: (nextLessonId?: string) => void;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  lesson,
  onBack,
  onLessonCompleted,
}) => {
  const { activeProfile } = useProfile();

  // Current stage: 'learn' | 'guided' | 'independent' | 'test'
  const [currentStage, setCurrentStage] = useState<LessonStageId>('learn');

  // Audio mute
  const [isMuted, setIsMuted] = useState(false);

  // Active typing state for stages B, C, D
  const [targetText, setTargetText] = useState('');
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorsCount, setErrorsCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTestActive, setIsTestActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Keyboard visualization states
  const [activeKeyCodes, setActiveKeyCodes] = useState<string[]>([]);
  const [errorKeyCode, setErrorKeyCode] = useState<string | undefined>(undefined);

  // Evaluation result modal
  const [showResultModal, setShowResultModal] = useState(false);
  const [testResult, setTestResult] = useState<{
    passed: boolean;
    accuracy: number;
    netWpm: number;
    message: string;
    nextLessonId?: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Setup target text when stage changes
  useEffect(() => {
    if (currentStage === 'guided') {
      setTargetText(lesson.stageB_Guided.targetText);
    } else if (currentStage === 'independent') {
      setTargetText(lesson.stageC_Independent.targetText);
    } else if (currentStage === 'test') {
      setTargetText(lesson.stageD_Test.targetText);
    }
    resetStageTyping();
  }, [currentStage, lesson]);

  const resetStageTyping = useCallback(() => {
    setTypedChars([]);
    setCurrentIndex(0);
    setErrorsCount(0);
    setStartTime(null);
    setElapsedSeconds(0);
    setIsTestActive(false);
    setIsFinished(false);
    setActiveKeyCodes([]);
    setErrorKeyCode(undefined);
  }, []);

  // Timer loop during active typing
  useEffect(() => {
    let interval: any = null;
    if (isTestActive && !isFinished) {
      interval = setInterval(() => {
        if (startTime) {
          const sec = (Date.now() - startTime) / 1000;
          setElapsedSeconds(sec);

          // Check if stage D has time limit countdown
          if (currentStage === 'test' && lesson.stageD_Test.timeLimitSeconds) {
            if (sec >= lesson.stageD_Test.timeLimitSeconds) {
              handleFinishStage();
            }
          }
        }
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isTestActive, isFinished, startTime, currentStage, lesson]);

  // Derive target keystroke for current expected character
  const expectedChar = targetText[currentIndex] || '';
  const expectedKeystroke = getKeystrokeForChar(expectedChar);

  // Finish evaluation
  const handleFinishStage = useCallback(async () => {
    setIsFinished(true);
    setIsTestActive(false);

    const totalChars = targetText.length;
    const correctChars = Math.max(0, totalChars - errorsCount);
    const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 100;
    const minutes = Math.max(0.1, elapsedSeconds / 60);
    const grossWpm = (totalChars / 5) / minutes;
    const netWpm = Math.max(0, grossWpm - (errorsCount / minutes));

    if (activeProfile) {
      const { isPassed, nextUnlockedLessonId } = await ProgressionService.recordStageAttempt(
        activeProfile.id,
        lesson,
        currentStage,
        {
          accuracy,
          netWpm,
          durationSeconds: elapsedSeconds,
        }
      );

      const evalRes = ProgressionService.evaluateStage(
        lesson,
        currentStage,
        { accuracy, netWpm }
      );

      setTestResult({
        passed: isPassed,
        accuracy,
        netWpm,
        message: evalRes.message,
        nextLessonId: nextUnlockedLessonId,
      });
      setShowResultModal(true);
    }
  }, [targetText, errorsCount, elapsedSeconds, activeProfile, lesson, currentStage]);

  // Handle student physical keystroke
  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (currentStage === 'learn' || isFinished) return;

      // Ignore standard modifier keys alone
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
        return;
      }

      // Handle Backspace
      if (e.code === 'Backspace') {
        e.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
          setTypedChars((prev) => prev.slice(0, -1));
        }
        return;
      }

      e.preventDefault();

      // Start timer on first keystroke
      if (!isTestActive) {
        setIsTestActive(true);
        setStartTime(Date.now());
      }

      setActiveKeyCodes([e.code]);
      setTimeout(() => setActiveKeyCodes([]), 150);

      const typedHindiChar = mapPhysicalKeyToHindi(e.code, e.shiftKey);

      if (!typedHindiChar) {
        return;
      }

      const expected = targetText[currentIndex];

      if (typedHindiChar === expected) {
        // Correct keypress
        if (!isMuted) audioService.playKeyStroke();
        setErrorKeyCode(undefined);
        setTypedChars((prev) => [...prev, typedHindiChar]);

        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);

        if (nextIdx >= targetText.length) {
          // Completed stage text!
          setTimeout(() => handleFinishStage(), 100);
        }
      } else {
        // Incorrect keypress
        if (!isMuted) audioService.playError();
        setErrorsCount((prev) => prev + 1);
        setErrorKeyCode(e.code);

        // Record error in adaptive tracking
        if (activeProfile && expected) {
          const expKey = expectedKeystroke?.code || e.code;
          await AdaptivePracticeService.recordMistakes(activeProfile.id, [
            { char: expected, keyCode: expKey },
          ]);
        }
      }
    },
    [
      currentStage,
      isFinished,
      isTestActive,
      currentIndex,
      targetText,
      isMuted,
      activeProfile,
      expectedKeystroke,
      handleFinishStage,
    ]
  );

  // Live Stats calculations
  const totalTyped = currentIndex;
  const currentAcc = totalTyped > 0
    ? Math.max(0, ((totalTyped - errorsCount) / totalTyped) * 100)
    : 100;
  const minutes = Math.max(0.05, elapsedSeconds / 60);
  const liveNetWpm = Math.max(0, (totalTyped / 5) / minutes - (errorsCount / minutes));

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="outline-none max-w-5xl mx-auto space-y-6 select-none"
    >
      {/* Top Header & Stage Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Level {lesson.levelId} • Lesson {lesson.order}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                #{lesson.globalIndex} of 160
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              {lesson.titleHindi} ({lesson.title})
            </h1>
          </div>
        </div>

        {/* 4-Stage Stepper Pills */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setCurrentStage('learn')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentStage === 'learn'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            A. परिचय (Learn)
          </button>
          <button
            onClick={() => setCurrentStage('guided')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentStage === 'guided'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            B. मार्गदर्शित (Guided)
          </button>
          <button
            onClick={() => setCurrentStage('independent')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentStage === 'independent'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            C. स्वतंत्र (Practice)
          </button>
          <button
            onClick={() => setCurrentStage('test')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentStage === 'test'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            D. परीक्षा (Test)
          </button>
        </div>
      </div>

      {/* STAGE A: LEARN */}
      {currentStage === 'learn' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs uppercase font-semibold text-emerald-600 tracking-wider">
                चरण १: सैद्धांतिक परिचय एवं उंगली स्थिति
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {lesson.stageA_Learn.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">उत्तीर्ण मानक:</span>
              <Badge variant="outline" className="font-mono">
                {lesson.passingCriteria.minAccuracy}% Accuracy
                {lesson.passingCriteria.minWpm ? ` • ${lesson.passingCriteria.minWpm} WPM` : ''}
              </Badge>
            </div>
          </div>

          <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed text-base">
            <p className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200">
              {lesson.stageA_Learn.explanation}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                  उंगली निर्देश (Finger Instructions)
                </span>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {lesson.stageA_Learn.fingerInstructions}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase block mb-1">
                  विशेष सुझाव (Tips)
                </span>
                <p className="text-amber-900 dark:text-amber-200 text-sm">
                  {lesson.stageA_Learn.tips}
                </p>
              </div>
            </div>

            {/* Target Characters preview */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-500 uppercase block mb-2">
                लक्षित वर्ण (Target Characters)
              </span>
              <div className="flex flex-wrap gap-2">
                {lesson.targetCharacters.map((char, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 font-devanagari text-xl font-bold text-slate-900 dark:text-white shadow-sm"
                  >
                    {char === ' ' ? '␣' : char}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Virtual Keyboard preview for demo keys */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <VirtualKeyboard
              targetKeyCode={lesson.targetKeys[0]}
              showHandsGuide={true}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              size="lg"
              onClick={() => setCurrentStage('guided')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold px-8"
            >
              मार्गदर्शित अभ्यास प्रारंभ करें (Stage B)
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      )}

      {/* STAGES B, C, D: INTERACTIVE TYPING RUNNER */}
      {currentStage !== 'learn' && (
        <div className="space-y-6">
          {/* Live Metrics Header */}
          <Card className="p-4 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
                    {Math.floor(elapsedSeconds)}s
                    {currentStage === 'test' && lesson.stageD_Test.timeLimitSeconds
                      ? ` / ${lesson.stageD_Test.timeLimitSeconds}s`
                      : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                    {Math.round(liveNetWpm)} WPM
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                    {currentAcc.toFixed(1)}% शुद्धता
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span className="text-sm font-mono text-rose-600 dark:text-rose-400">
                    {errorsCount} त्रुटियां
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetStageTyping}
                  className="gap-1 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  पुनः आरंभ
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-150"
                style={{
                  width: `${targetText.length > 0 ? (currentIndex / targetText.length) * 100 : 0}%`,
                }}
              />
            </div>
          </Card>

          {/* Guide notes banner in Stage B */}
          {currentStage === 'guided' && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-lg text-sm text-blue-800 dark:text-blue-300 flex items-center justify-between">
              <span>💡 {lesson.stageB_Guided.guideNotes}</span>
              <span className="text-xs font-mono font-semibold">
                आगामी कुंजी: {expectedKeystroke?.code || 'None'}
              </span>
            </div>
          )}

          {/* Target Text Typing Box */}
          <Card
            onClick={() => containerRef.current?.focus()}
            className="p-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 rounded-xl cursor-text min-h-[140px] relative font-devanagari text-2xl leading-relaxed tracking-wide"
          >
            <div className="flex flex-wrap items-center">
              {targetText.split('').map((char, index) => {
                let charStyle = 'text-slate-400 dark:text-slate-600';
                if (index < currentIndex) {
                  charStyle = 'text-emerald-700 dark:text-emerald-400 font-bold';
                } else if (index === currentIndex) {
                  charStyle =
                    'text-slate-900 dark:text-white bg-blue-200 dark:bg-blue-900/60 underline decoration-blue-500 decoration-4 rounded px-0.5 animate-pulse';
                }

                return (
                  <span key={index} className={charStyle}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                );
              })}
            </div>

            {!isTestActive && currentIndex === 0 && (
              <div className="absolute inset-0 bg-slate-900/5 dark:bg-slate-900/40 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                <span className="bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-sm font-sans font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-500" />
                  टाइप करना आरंभ करने के लिए कोई भी कुंजी दबाएं
                </span>
              </div>
            )}
          </Card>

          {/* Virtual Keyboard (Highlighted in Stage B Guided, unguided in Stage C & D) */}
          {currentStage === 'guided' && (
            <div className="pt-2">
              <VirtualKeyboard
                activeKeyCodes={activeKeyCodes}
                targetKeyCode={expectedKeystroke?.code}
                requiresShift={expectedKeystroke?.shift}
                errorKeyCode={errorKeyCode}
                showHandsGuide={true}
              />
            </div>
          )}
        </div>
      )}

      {/* Result Evaluation Modal */}
      {showResultModal && testResult && (
        <Modal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          title={testResult.passed ? 'अभिनंदन! चरण पूर्ण हुआ' : 'प्रयास पूर्ण हुआ'}
        >
          <div className="space-y-4 py-2">
            <div
              className={`p-4 rounded-xl flex items-center gap-4 ${
                testResult.passed
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              }`}
            >
              {testResult.passed ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-10 h-10 text-amber-600 shrink-0" />
              )}
              <div>
                <h3 className="font-bold text-lg">
                  {testResult.passed ? 'सफलतापूर्वक उत्तीर्ण!' : 'उत्तीर्णता मानक अपूर्ण'}
                </h3>
                <p className="text-sm mt-0.5">{testResult.message}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-xs text-slate-500 uppercase block">शुद्धता (Accuracy)</span>
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {testResult.accuracy.toFixed(1)}%
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-xs text-slate-500 uppercase block">शुद्ध गति (Net Speed)</span>
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {Math.round(testResult.netWpm)} WPM
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => {
                  setShowResultModal(false);
                  resetStageTyping();
                }}
              >
                पुनः प्रयास करें
              </Button>

              {currentStage !== 'test' ? (
                <Button
                  onClick={() => {
                    setShowResultModal(false);
                    if (currentStage === 'guided') setCurrentStage('independent');
                    else if (currentStage === 'independent') setCurrentStage('test');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium"
                >
                  अगला चरण प्रारंभ करें
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : testResult.passed ? (
                <Button
                  onClick={() => {
                    setShowResultModal(false);
                    if (onLessonCompleted) {
                      onLessonCompleted(testResult.nextLessonId);
                    } else {
                      onBack();
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold"
                >
                  अगला पाठ प्रारंभ करें
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button variant="ghost" onClick={onBack}>
                  पाठ सूची पर वापस
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
