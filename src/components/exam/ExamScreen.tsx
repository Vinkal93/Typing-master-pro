'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Clock,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  ArrowLeft,
  Send,
  Lock,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { VirtualKeyboard } from '@/components/keyboard/VirtualKeyboard';
import { mapPhysicalKeyToHindi, getKeystrokeForChar } from '@/services/engine/inscriptMapping';
import { audioService } from '@/services/engine/audioService';
import { MonotonicExamTimer } from '@/services/exam/monotonicTimer';
import { ScoringEngine } from '@/services/exam/scoringEngine';
import { storageService } from '@/services/storage/storageService';
import { HeatmapService } from '@/services/analytics/heatmapService';
import { AchievementService } from '@/services/achievements/achievementService';
import { useProfile } from '@/context/ProfileContext';
import {
  ExamAttemptRecord,
  ExamConfig,
  ExamPassage,
  ScoringDetails,
} from '@/types/exam';

interface ExamScreenProps {
  config: ExamConfig;
  passage: ExamPassage;
  onFinished: (record: ExamAttemptRecord) => void;
  onCancel: () => void;
}

export const ExamScreen: React.FC<ExamScreenProps> = ({
  config,
  passage,
  onFinished,
  onCancel,
}) => {
  const { activeProfile } = useProfile();

  const isStrictMode = config.mode === 'strict_exam';
  const targetDurationSeconds = config.durationMinutes * 60;

  // Typing state
  const [typedText, setTypedText] = useState('');
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Timer states
  const [remainingSeconds, setRemainingSeconds] = useState(targetDurationSeconds);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Audio mute
  const [isMuted, setIsMuted] = useState(!config.playSound);

  // Virtual keyboard visualization states
  const [activeKeyCodes, setActiveKeyCodes] = useState<string[]>([]);
  const [errorKeyCode, setErrorKeyCode] = useState<string | undefined>(undefined);

  // Early submit confirmation modal
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<MonotonicExamTimer | null>(null);
  const sessionIdRef = useRef<string>(`session_${Date.now()}`);

  // Prevent duplicate submit calls
  const isSubmittingRef = useRef<boolean>(false);

  // Completion calculation
  const handleFinalSubmit = useCallback(async () => {
    if (isSubmittingRef.current || isFinished) return;
    isSubmittingRef.current = true;
    setIsFinished(true);

    if (timerRef.current) {
      timerRef.current.markSubmitted();
    }

    const actualDuration = timerRef.current
      ? timerRef.current.getElapsedSeconds()
      : elapsedSeconds;

    const scoring: ScoringDetails = ScoringEngine.evaluate({
      expectedText: passage.text,
      typedText: typedText.trim(),
      targetDurationSeconds,
      actualDurationSeconds: Math.max(1, actualDuration),
      backspaceCount,
      scoringPolicy: config.scoringPolicy,
      language: config.language,
      minNetWpm: config.minNetWpm,
      minAccuracy: config.minAccuracy,
    });

    const studentName = activeProfile?.name || 'Student';
    const studentRollNo = activeProfile?.instituteRollNo;

    const record: ExamAttemptRecord = {
      id: `${activeProfile?.id || 'guest'}_exam_${Date.now()}`,
      profileId: activeProfile?.id || 'guest',
      studentName,
      studentRollNo,
      presetId: config.presetId,
      presetTitle: config.presetId ? config.presetId.replace(/_/g, ' ').toUpperCase() : passage.title,
      passageId: passage.id,
      passageTitle: passage.title,
      language: config.language,
      layout: config.layout,
      mode: config.mode,
      backspacePolicy: config.backspacePolicy,
      scoringPolicy: config.scoringPolicy,
      targetDurationSeconds,
      actualDurationSeconds: actualDuration,
      scoring,
      passed: scoring.passed,
      completedAt: Date.now(),
      schemaVersion: 1,
    };

    // Save record to persistent storage
    try {
      const adapter = await storageService.getAdapter();
      await adapter.saveExamResult(record);
      if (activeProfile) {
        AchievementService.evaluateAndAwardAchievements(activeProfile.id).catch(() => {});
      }
    } catch {
      // Storage guard
    }

    if (timerRef.current) {
      timerRef.current.clearStorage();
    }

    onFinished(record);
  }, [
    isFinished,
    passage,
    typedText,
    targetDurationSeconds,
    elapsedSeconds,
    backspaceCount,
    config,
    activeProfile,
    onFinished,
  ]);

  // Initialize Monotonic Timer
  useEffect(() => {
    const profileId = activeProfile?.id || 'guest';
    const timer = new MonotonicExamTimer(
      sessionIdRef.current,
      profileId,
      targetDurationSeconds,
      (rem, elap) => {
        setRemainingSeconds(rem);
        setElapsedSeconds(elap);
      },
      () => {
        // Expired! Auto submit
        handleFinalSubmit();
      }
    );

    timerRef.current = timer;

    // Handle background tab returns
    const handleVisibility = () => {
      timer.handleVisibilityChange();
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility);
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility);
      }
      timer.clearStorage();
    };
  }, [targetDurationSeconds, activeProfile, handleFinalSubmit]);

  // Window unload guard for strict exam mode
  useEffect(() => {
    if (!isStarted || isFinished) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'परीक्षा प्रगति पर है। क्या आप पृष्ठ छोड़ना चाहते हैं?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isStarted, isFinished]);

  // Auto-focus container
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Handle student physical keystrokes
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isFinished || isPaused) return;

      // Ignore standard modifier keys
      if (['Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape'].includes(e.key)) {
        return;
      }

      // Start timer on first keystroke
      if (!isStarted) {
        setIsStarted(true);
        if (timerRef.current) {
          timerRef.current.start();
        }
      }

      // Backspace Handling with Policy Enforcement
      if (e.code === 'Backspace') {
        e.preventDefault();

        if (config.backspacePolicy === 'disabled') {
          // Strictly locked backspace
          if (!isMuted) audioService.playError();
          return;
        }

        if (config.backspacePolicy === 'restricted_current_word') {
          // Can only backspace if last character is not space
          if (typedText.length > 0 && typedText[typedText.length - 1] === ' ') {
            if (!isMuted) audioService.playError();
            return;
          }
        }

        if (typedText.length > 0) {
          setTypedText((prev) => prev.slice(0, -1));
          setBackspaceCount((prev) => prev + 1);
        }
        return;
      }

      e.preventDefault();

      setActiveKeyCodes([e.code]);
      setTimeout(() => setActiveKeyCodes([]), 150);

      // Character mapping
      let charToAdd = '';

      if (config.layout === 'Hindi InScript') {
        const hindi = mapPhysicalKeyToHindi(e.code, e.shiftKey);
        if (!hindi) return;
        charToAdd = hindi;
      } else {
        // English QWERTY
        if (e.key.length === 1) {
          charToAdd = e.key;
        } else if (e.code === 'Space') {
          charToAdd = ' ';
        } else {
          return;
        }
      }

      if (!charToAdd) return;

      // Audio feedback
      if (!isMuted) {
        audioService.playKeyStroke();
      }

      // Record to Heatmap Service
      if (activeProfile) {
        const expectedChar = passage.text[typedText.length] || '';
        const isCorrect = charToAdd === expectedChar;
        const layoutKey = config.layout === 'Hindi InScript' ? 'hindi_inscript' : 'english_qwerty';
        HeatmapService.recordKeyAttempt(
          activeProfile.id,
          layoutKey,
          e.code,
          expectedChar,
          charToAdd,
          isCorrect
        ).catch(() => {});
      }

      setTypedText((prev) => prev + charToAdd);

      // Check if candidate typed entire passage
      if (typedText.length + charToAdd.length >= passage.text.length) {
        // Finished typing entire passage
        setTimeout(() => handleFinalSubmit(), 200);
      }
    },
    [
      isFinished,
      isPaused,
      isStarted,
      config,
      isMuted,
      typedText,
      passage,
      handleFinalSubmit,
    ]
  );

  // Practice mode pause/resume
  const handleTogglePause = () => {
    if (isStrictMode) return; // Strict mode prohibits pauses
    if (isPaused) {
      setIsPaused(false);
      timerRef.current?.resume();
    } else {
      setIsPaused(true);
      timerRef.current?.pause();
    }
  };

  // Restart practice test
  const handleRestart = () => {
    if (isStrictMode) return;
    setTypedText('');
    setBackspaceCount(0);
    setIsStarted(false);
    setIsPaused(false);
    timerRef.current?.clearStorage();
    setRemainingSeconds(targetDurationSeconds);
    setElapsedSeconds(0);
  };

  // Format timer MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Live metrics for Practice Mode
  const currentTotalChars = typedText.length;
  const currentMinutes = Math.max(0.05, elapsedSeconds / 60);
  const liveGrossWpm = Math.round((currentTotalChars / 5) / currentMinutes);

  // Derive target keystroke for Practice Mode virtual keyboard
  const expectedChar = passage.text[typedText.length] || '';
  const expectedKeystroke = config.layout === 'Hindi InScript' ? getKeystrokeForChar(expectedChar) : null;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="outline-none max-w-5xl mx-auto space-y-4 select-none min-h-[85vh] flex flex-col justify-between"
    >
      {/* Top Distraction-Free Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (isStarted && !isFinished) {
                if (window.confirm('क्या आप परीक्षा रद्द कर बाहर जाना चाहते हैं? वर्तमान प्रगति सुरक्षित नहीं होगी।')) {
                  onCancel();
                }
              } else {
                onCancel();
              }
            }}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {passage.title}
              </span>
              <Badge variant={isStrictMode ? 'red' : 'green'} size="sm">
                {isStrictMode ? 'कठोर परीक्षा मोड (Strict Exam)' : 'अभ्यास मोड (Practice)'}
              </Badge>
            </div>
            <span className="text-xs text-slate-500 font-mono block mt-0.5">
              {config.language} • {config.layout} • नीति: {config.scoringPolicy.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-3">
          {/* Monotonic Countdown Clock */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-xl font-black ${
              remainingSeconds < 60
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-600 animate-pulse'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
            }`}
          >
            <Clock className="w-5 h-5 text-slate-400" />
            <span>{formatTime(remainingSeconds)}</span>
          </div>

          {!isStrictMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTogglePause}
                disabled={!isStarted}
                className="p-2.5"
              >
                {isPaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4" />}
              </Button>

              <Button variant="outline" size="sm" onClick={handleRestart} className="p-2.5">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>

          <Button
            size="sm"
            onClick={() => {
              if (isStrictMode) {
                setShowConfirmSubmit(true);
              } else {
                handleFinalSubmit();
              }
            }}
            disabled={!isStarted}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 px-4"
          >
            <Send className="w-3.5 h-3.5" /> जमा करें (Submit)
          </Button>
        </div>
      </div>

      {/* Live metrics bar only visible in Practice Mode */}
      {!isStrictMode && (
        <Card className="p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-6 font-mono">
            <span>गति: <b>{liveGrossWpm} WPM</b></span>
            <span>टंकित वर्ण: <b>{typedText.length} / {passage.text.length}</b></span>
            <span>बैकस्पेस: <b>{backspaceCount}</b></span>
          </div>
          <span className="text-blue-700 dark:text-blue-300 font-medium">
            💡 अभ्यास मोड: लाइव मार्गदर्शन सक्रिय
          </span>
        </Card>
      )}

      {/* Target Passage Reference Box */}
      <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-h-[220px] overflow-y-auto leading-loose font-devanagari text-xl text-slate-700 dark:text-slate-300 select-none shadow-inner">
        {passage.text}
      </Card>

      {/* Student Typing Input Display */}
      <Card
        onClick={() => containerRef.current?.focus()}
        className="p-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl min-h-[200px] max-h-[260px] overflow-y-auto cursor-text font-devanagari text-2xl leading-relaxed tracking-wide relative"
      >
        {!isStarted && typedText.length === 0 && (
          <div className="absolute inset-0 bg-slate-900/5 dark:bg-slate-900/30 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
            <span className="bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-sans font-semibold text-slate-700 dark:text-slate-200 shadow-sm flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-500" />
              टाइप करना आरंभ करने के लिए कोई भी कुंजी दबाएं (टाइमर स्वतः शुरू होगा)
            </span>
          </div>
        )}

        <div className="whitespace-pre-wrap">
          {/* In practice mode: character-by-character color-coding */}
          {!isStrictMode ? (
            typedText.split('').map((char, index) => {
              const expectedCharAtIndex = passage.text[index];
              const isMatch = char === expectedCharAtIndex;
              return (
                <span
                  key={index}
                  className={isMatch ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400 underline decoration-rose-500'}
                >
                  {char}
                </span>
              );
            })
          ) : (
            // In strict exam mode: clean, neutral text without correction hints!
            <span className="text-slate-900 dark:text-white">{typedText}</span>
          )}

          {/* Blinking typing caret */}
          <span className="inline-block w-0.5 h-6 bg-blue-600 animate-pulse align-middle ml-0.5" />
        </div>
      </Card>

      {/* Virtual Keyboard (Only if enabled and NOT strict exam) */}
      {!isStrictMode && config.showVirtualKeyboard && config.layout === 'Hindi InScript' && (
        <div className="pt-2">
          <VirtualKeyboard
            activeKeyCodes={activeKeyCodes}
            targetKeyCode={expectedKeystroke?.code}
            requiresShift={expectedKeystroke?.requiresShift}
            errorKeyCode={errorKeyCode}
            showHandsGuide={true}
          />
        </div>
      )}

      {/* Confirmation Modal for Early Submission in Strict Mode */}
      <Modal
        isOpen={showConfirmSubmit}
        onClose={() => setShowConfirmSubmit(false)}
        title="परीक्षा समाप्ति की पुष्टि (Confirm Early Submission)"
      >
        <div className="space-y-4 py-2 text-sm text-slate-700 dark:text-slate-300">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3 text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
            <p>
              आपके पास अभी <b>{formatTime(remainingSeconds)}</b> का समय शेष है। यदि आप अभी जमा करते हैं, तो शेष समय समाप्त मान लिया जाएगा।
            </p>
          </div>

          <p>क्या आप निश्चित रूप से अपनी परीक्षा समाप्त कर परिणाम देखना चाहते हैं?</p>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setShowConfirmSubmit(false)}>
              परीक्षा जारी रखें
            </Button>
            <Button
              onClick={() => {
                setShowConfirmSubmit(false);
                handleFinalSubmit();
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              हाँ, परीक्षा जमा करें
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
