'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LessonMetadata, StudentProfile } from '@/types';
import { StatisticsService } from '@/services/statistics/statisticsService';

interface LessonPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: LessonMetadata | null;
  profile: StudentProfile | null;
  onRefreshStats: () => void;
}

export const LessonPreviewModal: React.FC<LessonPreviewModalProps> = ({
  isOpen,
  onClose,
  lesson,
  profile,
  onRefreshStats,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSuccess, setSimulationSuccess] = useState(false);

  if (!lesson || !profile) return null;

  const fontClass =
    profile.preferences.fontPreference === 'mangal'
      ? 'font-mangal-stack'
      : 'font-noto-stack';

  const handleSimulatePracticeSession = async () => {
    try {
      setIsSimulating(true);
      const simulatedDuration = 180; // 3 minutes
      const randomNetWpm = Math.floor(Math.random() * 12) + 26; // 26 - 38 WPM
      const randomGrossWpm = randomNetWpm + 3;
      const randomAccuracy = Math.floor(Math.random() * 6) + 93; // 93 - 99%

      await StatisticsService.recordPracticeResult({
        id: `result_${Date.now()}`,
        profileId: profile.id,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        layout: profile.preferences.keyboardLayout,
        language: profile.preferences.language,
        completedAt: Date.now(),
        durationSeconds: simulatedDuration,
        grossWpm: randomGrossWpm,
        netWpm: randomNetWpm,
        accuracy: randomAccuracy,
        totalKeyStrokes: randomGrossWpm * 5 * 3,
        correctKeyStrokes: Math.round((randomGrossWpm * 5 * 3 * randomAccuracy) / 100),
        errorCount: 4,
        backspaceCount: 2,
      });

      setSimulationSuccess(true);
      onRefreshStats();
      setTimeout(() => {
        setSimulationSuccess(false);
        setIsSimulating(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setIsSimulating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lesson.title}
      subtitle={lesson.titleHindi ? `${lesson.titleHindi}` : `Targeted Lesson Drill`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Status banner */}
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-blue-900 dark:text-blue-200">
              Phase 1 Curriculum & Roadmap Inspection
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              Interactive live typing engine with real-time keypress capture will activate in Phase 2.
            </p>
          </div>
        </div>

        {/* Lesson Overview */}
        <div className="space-y-2 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            {lesson.description}
          </p>

          <div className="flex items-center gap-3 py-1">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Duration: {lesson.estimatedMinutes} Mins
            </span>
            <Badge variant="blue" size="sm">
              {lesson.category.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Keys Introduced */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Keys Targeted in this Drill:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {lesson.keysIntroduced.map((k, idx) => (
              <kbd
                key={idx}
                className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-devanagari"
              >
                {k}
              </kbd>
            ))}
          </div>
        </div>

        {/* Practice Passage Sample */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Drill Passage Preview:
          </span>
          <div
            className={`p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm leading-relaxed text-slate-800 dark:text-slate-200 ${fontClass}`}
          >
            {lesson.sampleText}
          </div>
          <p className="text-[11px] text-slate-400 italic">
            Rendered using {profile.preferences.fontPreference === 'mangal' ? 'Mangal' : 'Bundled Noto Sans Devanagari'} offline font stack.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
          {simulationSuccess ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
              <CheckCircle2 className="w-4 h-4" /> Practice session recorded offline!
            </div>
          ) : (
            <div className="text-[11px] text-slate-400">
              Test persistence & analytics logging:
            </div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={handleSimulatePracticeSession}
              disabled={isSimulating}
              icon={<Play className="w-4 h-4 fill-current" />}
            >
              {isSimulating ? 'Logging...' : 'Log Practice Sample'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
