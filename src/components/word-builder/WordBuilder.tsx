'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VirtualKeyboard } from '@/components/keyboard/VirtualKeyboard';
import { WORD_BUILDER_CATALOG, WordCompositionDef, KeystrokeStep } from '@/services/engine/keySequencer';
import { mapPhysicalKeyToHindi } from '@/services/engine/inscriptMapping';
import { audioService } from '@/services/engine/audioService';

export const WordBuilder: React.FC = () => {
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const currentWordDef: WordCompositionDef = WORD_BUILDER_CATALOG[selectedWordIndex] || WORD_BUILDER_CATALOG[0];
  const steps: KeystrokeStep[] = currentWordDef.steps;
  const currentStep: KeystrokeStep | undefined = steps[currentStepIndex];

  const resetCurrentWord = () => {
    setCurrentStepIndex(0);
    setTypedChars([]);
    setIsCompleted(false);
    setFeedback(null);
  };

  const handleSelectWord = (index: number) => {
    setSelectedWordIndex(index);
    setCurrentStepIndex(0);
    setTypedChars([]);
    setIsCompleted(false);
    setFeedback(null);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isCompleted || !currentStep) return;

      // Map physical key
      const mappedHindi = mapPhysicalKeyToHindi(e.code, e.shiftKey, e.altKey);

      // Verify against current step's physical code and shift requirement
      const isCodeMatch = e.code === currentStep.code;
      const isShiftMatch = Boolean(e.shiftKey) === Boolean(currentStep.requiresShift);

      if (isCodeMatch && isShiftMatch) {
        e.preventDefault();
        audioService.playKeyClick();
        setFeedback('correct');

        const nextTyped = [...typedChars, currentStep.char];
        setTypedChars(nextTyped);

        if (currentStepIndex + 1 >= steps.length) {
          setIsCompleted(true);
          audioService.playSuccessChime();
        } else {
          setCurrentStepIndex((prev) => prev + 1);
        }
      } else if (
        e.code.startsWith('Key') ||
        e.code.startsWith('Digit') ||
        ['Semicolon', 'Quote', 'Comma', 'Period', 'Slash', 'Equal', 'Minus', 'BracketLeft', 'BracketRight'].includes(e.code)
      ) {
        e.preventDefault();
        audioService.playErrorBeep();
        setFeedback('incorrect');
      }
    },
    [currentStep, currentStepIndex, steps, isCompleted, typedChars]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Hindi Word Builder & Conjunct Composition Trainer
            </h2>
            <Badge variant="blue" size="sm">Module 4</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Learn step-by-step Unicode composition: Type physical keys to form complex Hindi conjuncts and exam words.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={resetCurrentWord}
          icon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset Word
        </Button>
      </div>

      {/* Word Selector Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {WORD_BUILDER_CATALOG.map((item, idx) => {
          const isSelected = selectedWordIndex === idx;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectWord(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all font-devanagari ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {item.word}
            </button>
          );
        })}
      </div>

      {/* Main Composition Workshop Card */}
      <Card className="p-6 space-y-6 border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Giant Result Word Display */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 w-full lg:w-72 shadow-inner">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Target Conjunct / Word
            </span>
            <span className="text-5xl sm:text-6xl font-extrabold text-slate-900 dark:text-slate-100 font-devanagari tracking-tight">
              {currentWordDef.word}
            </span>
            <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold mt-3">
              {currentWordDef.meaningHindi}
            </span>
          </div>

          {/* Right: Live Interactive Typing Progress & Steps */}
          <div className="flex-1 space-y-4 w-full">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {currentWordDef.description}
                </h3>
                <p className="text-xs text-slate-500">
                  Total Keystroke Steps: {steps.length} | Completed: {currentStepIndex} of {steps.length}
                </p>
              </div>

              {isCompleted ? (
                <Badge variant="green" size="md">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed!
                </Badge>
              ) : (
                <Badge variant="blue" size="md">
                  Step {currentStepIndex + 1} Active
                </Badge>
              )}
            </div>

            {/* Live Rendered Canvas */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                  Live Composed Output:
                </span>
                <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-devanagari tracking-wider min-h-[40px] inline-block">
                  {typedChars.join('') || '—'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                  Remaining Steps:
                </span>
                <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">
                  {steps.length - currentStepIndex} keys left
                </span>
              </div>
            </div>

            {/* Step Keystroke Roadmap */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Derived Physical Keystroke Roadmap:</span>
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                {steps.map((st, sIdx) => {
                  const isDone = sIdx < currentStepIndex;
                  const isCurrent = sIdx === currentStepIndex && !isCompleted;

                  return (
                    <div
                      key={sIdx}
                      className={`px-3 py-2 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                        isDone
                          ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                          : isCurrent
                          ? 'border-blue-500 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/60 ring-2 ring-blue-600 text-blue-800 dark:text-blue-200 scale-105 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-400'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] flex items-center justify-center font-mono">
                        {st.stepIndex}
                      </span>
                      <span className="text-sm font-bold font-devanagari">
                        {st.char}
                      </span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border text-[10px] font-mono">
                        {st.enKeyLabel}
                      </kbd>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Step Explanation Box */}
            {!isCompleted && currentStep && (
              <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-900 dark:text-blue-200">
                    Next Step {currentStep.stepIndex}: {currentStep.explanation}
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 text-[11px] mt-0.5">
                    Physical Key: <span className="font-mono font-bold">{currentStep.enKeyLabel}</span> • Finger: <span className="font-semibold">{currentStep.finger}</span>
                  </p>
                </div>
              </div>
            )}

            {isCompleted && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>बधाई! आपने &quot;{currentWordDef.word}&quot; का शुद्ध संयोजन पूरा कर लिया।</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSelectWord((selectedWordIndex + 1) % WORD_BUILDER_CATALOG.length)}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Next Word
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Target Key Highlight on Virtual Keyboard */}
      <VirtualKeyboard
        targetKeyCode={!isCompleted && currentStep ? currentStep.code : undefined}
        requiresShift={!isCompleted && currentStep ? currentStep.requiresShift : false}
      />
    </div>
  );
};
