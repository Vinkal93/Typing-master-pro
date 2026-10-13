'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  Award,
  Sparkles,
  Sliders,
  ChevronRight,
  TrendingUp,
  Target,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useProfile } from '@/context/ProfileContext';
import { storageService } from '@/services/storage/storageService';
import {
  CurriculumService,
  COURSE_LEVEL_DEFINITIONS,
} from '@/services/curriculum/curriculumService';
import { ProgressionService } from '@/services/lms/progressionService';
import {
  CourseLevelId,
  LmsLesson,
  LmsStudentSummary,
  LmsTeacherSettings,
  StudentLessonProgress,
} from '@/types/lms';
import { LessonPlayer } from './LessonPlayer';
import { AdaptiveRevisionCenter } from './AdaptiveRevisionCenter';
import { TeacherLmsModal } from './TeacherLmsModal';

export const LmsDashboard: React.FC = () => {
  const { activeProfile } = useProfile();

  // Navigation states
  const [selectedLevelId, setSelectedLevelId] = useState<CourseLevelId>(1);
  const [activeLesson, setActiveLesson] = useState<LmsLesson | null>(null);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  // Student progress state
  const [progressList, setProgressList] = useState<StudentLessonProgress[]>([]);
  const [teacherSettings, setTeacherSettings] = useState<LmsTeacherSettings | undefined>(undefined);
  const [summary, setSummary] = useState<LmsStudentSummary>({
    currentLevelId: 1,
    currentLessonId: 'l1_01_right_index_ra',
    totalCompleted: 0,
    totalRemaining: 160,
    averageAccuracy: 0,
    averageWpm: 0,
    streakDays: 0,
    weakCharacters: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!activeProfile) return;
    setIsLoading(true);
    const adapter = await storageService.getAdapter();
    const [progress, tSettings, mistakes] = await Promise.all([
      adapter.getLessonProgress(activeProfile.id),
      adapter.getTeacherSettings(),
      adapter.getMistakeStats(activeProfile.id),
    ]);

    setProgressList(progress);
    setTeacherSettings(tSettings);

    const sum = ProgressionService.computeSummary(activeProfile.id, progress, mistakes);
    setSummary(sum);
    setSelectedLevelId(sum.currentLevelId);
    setIsLoading(false);
  }, [activeProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle lesson launch
  const handleLaunchLesson = (lesson: LmsLesson) => {
    setActiveLesson(lesson);
  };

  const handleLessonCompleted = (nextLessonId?: string) => {
    loadData();
    if (nextLessonId) {
      const next = CurriculumService.getLessonById(nextLessonId);
      if (next) {
        setActiveLesson(next);
        return;
      }
    }
    setActiveLesson(null);
  };

  if (activeLesson) {
    return (
      <LessonPlayer
        lesson={activeLesson}
        onBack={() => {
          setActiveLesson(null);
          loadData();
        }}
        onLessonCompleted={handleLessonCompleted}
      />
    );
  }

  if (isRevisionOpen) {
    return <AdaptiveRevisionCenter onBack={() => setIsRevisionOpen(false)} />;
  }

  const currentLevelDef = COURSE_LEVEL_DEFINITIONS.find((d) => d.id === selectedLevelId)!;
  const currentLevelLessons = CurriculumService.getLessonsByLevel(selectedLevelId);
  const nextLessonToPractice = CurriculumService.getLessonById(summary.currentLessonId);

  const levelCompletedCount = currentLevelLessons.filter((l) =>
    progressList.some((p) => p.lessonId === l.id && p.isCompleted)
  ).length;
  const levelProgressPct = (levelCompletedCount / currentLevelLessons.length) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              प्रगतिशील टंकण पाठ्यक्रम (160 Lessons)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            स्मार्ट अधिगम प्रबंधन प्रणाली (Smart LMS)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            शुरुआती वर्णमाला से लेकर सीपीसीटी एवं कोर्ट स्टेनोग्राफर स्तर तक की संपूर्ण हिंदी इनस्क्रिप्ट टंकण यात्रा।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsRevisionOpen(true)}
            className="gap-2 text-xs border-violet-200 hover:border-violet-300 text-violet-700 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-950/30"
          >
            <Sparkles className="w-4 h-4 text-violet-500" />
            अनुकूली संशोधन केंद्र
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsTeacherModalOpen(true)}
            className="gap-2 text-xs"
          >
            <Sliders className="w-4 h-4" />
            प्रशिक्षक नियंत्रण
          </Button>
        </div>
      </div>

      {/* Progress Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 block uppercase">पूर्ण किए गए पाठ</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {summary.totalCompleted}
            </span>
            <span className="text-xs text-slate-400">/ 160</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${(summary.totalCompleted / 160) * 100}%` }}
            />
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 block uppercase">औसत शुद्धता</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {summary.averageAccuracy > 0 ? `${Math.round(summary.averageAccuracy * 10) / 10}%` : '—'}
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-3 block">
            {summary.averageAccuracy >= 95 ? 'उत्कृष्ट' : 'सक्रिय अभ्यास'}
          </span>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 block uppercase">औसत गति (WPM)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {summary.averageWpm > 0 ? `${Math.round(summary.averageWpm * 10) / 10} WPM` : '—'}
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-3 block">नेट शब्द प्रति मिनट</span>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 block uppercase">वर्तमान स्तर</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              Level {summary.currentLevelId}
            </span>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 block font-devanagari font-medium">
            {COURSE_LEVEL_DEFINITIONS.find((d) => d.id === summary.currentLevelId)?.nameHindi}
          </span>
        </Card>
      </div>

      {/* Continue Learning CTA Card */}
      {nextLessonToPractice && summary.totalCompleted < 160 && (
        <Card className="p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Play className="w-5 h-5 ml-0.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase">
                अध्ययन जारी रखें (Continue Learning) • Lesson #{nextLessonToPractice.globalIndex}
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {nextLessonToPractice.titleHindi} ({nextLessonToPractice.title})
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">
                {nextLessonToPractice.description}
              </p>
            </div>
          </div>

          <Button
            onClick={() => handleLaunchLesson(nextLessonToPractice)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shrink-0 shadow-sm"
          >
            पाठ शुरू करें
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>
      )}

      {/* Level Selector Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {COURSE_LEVEL_DEFINITIONS.map((def) => {
            const isSelected = def.id === selectedLevelId;
            const completedInThisLevel = currentLevelLessons.length; // Just count

            return (
              <button
                key={def.id}
                onClick={() => setSelectedLevelId(def.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-slate-400'
                  }`}
                />
                <div>
                  <span className="text-xs font-bold block">
                    Level {def.id}: {def.name}
                  </span>
                  <span className="text-[10px] opacity-75 block font-devanagari">
                    {def.lessonCount} पाठ
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Level Summary Header */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  Level {currentLevelDef.id} of 6
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {currentLevelDef.lessonCount} Educational Lessons
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {currentLevelDef.nameHindi} — {currentLevelDef.name}
              </h2>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-500">उत्तीर्ण मानक:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {currentLevelDef.defaultMinAccuracy}% Accuracy
                {currentLevelDef.defaultMinWpm > 0 ? ` • ${currentLevelDef.defaultMinWpm} WPM` : ''}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {currentLevelDef.description}
          </p>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${levelProgressPct}%` }}
              />
            </div>
            <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400">
              {levelCompletedCount} / {currentLevelLessons.length} ({Math.round(levelProgressPct)}%)
            </span>
          </div>
        </div>

        {/* Lessons Grid for Selected Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {currentLevelLessons.map((lesson) => {
            const isUnlocked = ProgressionService.isLessonUnlocked(
              lesson,
              progressList,
              teacherSettings
            );
            const userProg = progressList.find((p) => p.lessonId === lesson.id);
            const isCompleted = Boolean(userProg?.isCompleted);

            return (
              <Card
                key={lesson.id}
                onClick={() => {
                  if (isUnlocked) handleLaunchLesson(lesson);
                }}
                className={`p-4 transition-all duration-150 border ${
                  isUnlocked
                    ? 'cursor-pointer hover:border-emerald-300 hover:shadow-sm bg-white dark:bg-slate-900'
                    : 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      #{lesson.globalIndex}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {lesson.titleHindi}
                    </h3>
                  </div>

                  <div>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : isUnlocked ? (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                  {lesson.description}
                </p>

                {/* Target characters badge */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {lesson.targetCharacters.slice(0, 6).map((c, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-devanagari text-slate-700 dark:text-slate-300"
                    >
                      {c === ' ' ? '␣' : c}
                    </span>
                  ))}
                  {lesson.targetCharacters.length > 6 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{lesson.targetCharacters.length - 6}
                    </span>
                  )}
                </div>

                {/* Performance or Status Footer */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  {isCompleted && userProg ? (
                    <div className="flex items-center gap-2 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>{userProg.bestAccuracy.toFixed(1)}%</span>
                      {userProg.bestNetWpm > 0 && <span>• {Math.round(userProg.bestNetWpm)} WPM</span>}
                    </div>
                  ) : isUnlocked ? (
                    <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                      प्रारंभ करें <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> पूर्व पाठ आवश्यक
                    </span>
                  )}

                  <span className="text-[10px] text-slate-400">
                    {lesson.expectedDurationMinutes} min
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Teacher Modal */}
      <TeacherLmsModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onSettingsChanged={loadData}
      />
    </div>
  );
};
