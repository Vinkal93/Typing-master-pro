'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Play,
  Gauge,
  CheckCircle2,
  Clock,
  FileCheck,
  TrendingUp,
  Target,
  Flame,
  Award,
  Layers,
  Keyboard,
  ArrowRight,
  BookOpen,
  Calendar,
  Zap,
  Check,
  RotateCcw,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AvatarBadge } from '@/components/ui/AvatarBadge';
import { useProfile } from '@/context/ProfileContext';
import { ProfileStatistics } from '@/services/statistics/statisticsService';
import { storageService } from '@/services/storage/storageService';
import { ProgressionService } from '@/services/lms/progressionService';
import { CurriculumService, COURSE_LEVEL_DEFINITIONS } from '@/services/curriculum/curriculumService';
import { LmsLesson, LmsStudentSummary } from '@/types/lms';
import { ExamAttemptRecord } from '@/types/exam';
import { CourseRoadmapPreview } from './CourseRoadmapPreview';

interface DashboardOverviewProps {
  stats: ProfileStatistics;
  onStartPractice: () => void;
  onContinueCourse: (lessonId?: string) => void;
  onTakeExam: () => void;
  onOpenKeyboardMap: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  onStartPractice,
  onContinueCourse,
  onTakeExam,
  onOpenKeyboardMap,
}) => {
  const { activeProfile } = useProfile();

  // LMS progress state
  const [lmsSummary, setLmsSummary] = useState<LmsStudentSummary | null>(null);
  const [currentLmsLesson, setCurrentLmsLesson] = useState<LmsLesson | null>(null);
  const [recentExams, setRecentExams] = useState<ExamAttemptRecord[]>([]);
  const [isLoadingLms, setIsLoadingLms] = useState(true);

  const loadLmsAndExams = useCallback(async () => {
    if (!activeProfile) return;
    try {
      setIsLoadingLms(true);
      const adapter = await storageService.getAdapter();
      const [progress, mistakes, examRecords] = await Promise.all([
        adapter.getLessonProgress(activeProfile.id),
        adapter.getMistakeStats(activeProfile.id),
        adapter.getExamResults(activeProfile.id),
      ]);

      const sum = ProgressionService.computeSummary(activeProfile.id, progress, mistakes);
      setLmsSummary(sum);

      const lesson = CurriculumService.getLessonById(sum.currentLessonId) || CurriculumService.getAllLessons()[0];
      setCurrentLmsLesson(lesson);

      // Sort exams by completedAt desc and take latest 3
      const sortedExams = [...examRecords].sort((a, b) => b.completedAt - a.completedAt).slice(0, 3);
      setRecentExams(sortedExams);
    } catch (err) {
      console.error('Failed to load dashboard LMS data:', err);
    } finally {
      setIsLoadingLms(false);
    }
  }, [activeProfile]);

  useEffect(() => {
    loadLmsAndExams();
  }, [loadLmsAndExams]);

  if (!activeProfile) return null;

  const currentLevelDef = lmsSummary
    ? CurriculumService.getLevelDef(lmsSummary.currentLevelId) || COURSE_LEVEL_DEFINITIONS[0]
    : COURSE_LEVEL_DEFINITIONS[0];

  const totalLessons = 160;
  const completedLessons = lmsSummary?.totalCompleted || 0;
  const remainingLessons = totalLessons - completedLessons;
  const completionPercentage = Math.round((completedLessons / totalLessons) * 100);

  const dailyGoalMinutes = activeProfile.preferences.dailyPracticeGoal || 15;
  const todayMinutes = stats.todayMinutes && !isNaN(stats.todayMinutes) ? Math.round(stats.todayMinutes) : 0;
  const dailyGoalPct = dailyGoalMinutes > 0 ? Math.min(100, Math.max(0, Math.round((todayMinutes / dailyGoalMinutes) * 100))) : 0;

  const layoutDisplayName =
    activeProfile.preferences.keyboardLayout === 'hindi_inscript'
      ? 'Hindi InScript (IS 16350)'
      : activeProfile.preferences.keyboardLayout === 'remington_gail'
      ? 'Hindi Remington GAIL'
      : 'English QWERTY';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      {/* ================= SECTION A: COMPACT WELCOME ================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <AvatarBadge
              avatarId={activeProfile.avatar}
              name={activeProfile.name}
              size="md"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Welcome back, {activeProfile.name}!
                </h2>
                {activeProfile.instituteRollNo && (
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    ID: {activeProfile.instituteRollNo}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <Keyboard className="w-3.5 h-3.5 text-blue-600" />
                  {layoutDisplayName}
                </span>
                <span>•</span>
                <span>Level {currentLevelDef.id}: {currentLevelDef.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <Badge variant="blue" size="sm">
              <Target className="w-3 h-3 mr-1" />
              {todayMinutes}/{dailyGoalMinutes}m Today ({dailyGoalPct}%)
            </Badge>
            <Badge variant="green" size="sm">
              <Award className="w-3 h-3 mr-1" />
              {completedLessons}/160 Lessons Done
            </Badge>
          </div>
        </div>
      </div>

      {/* ================= SECTION B: CONTINUE LEARNING (PRIMARY RECOMMENDATION) ================= */}
      <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="blue" size="sm">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Recommended Next Step
              </Badge>
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                Level {currentLevelDef.id} • {currentLevelDef.name}
              </span>
              {currentLmsLesson && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> ~{currentLmsLesson.expectedDurationMinutes} mins
                </span>
              )}
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {currentLmsLesson ? currentLmsLesson.title : 'Lesson 1: Index Finger Basics'}
              </h3>
              {currentLmsLesson?.titleHindi && (
                <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 font-devanagari mt-0.5">
                  {currentLmsLesson.titleHindi}
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {currentLmsLesson
                  ? currentLmsLesson.description
                  : 'Start your typing journey by mastering proper home-row finger placement and physical key strike posture.'}
              </p>
            </div>

            {/* Target Keys / Skills Covered */}
            {currentLmsLesson && currentLmsLesson.targetCharacters.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Target Keys:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {currentLmsLesson.targetCharacters.map((char, idx) => (
                    <kbd
                      key={idx}
                      className="px-2 py-0.5 text-xs font-bold rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-2xs text-slate-800 dark:text-slate-200 font-devanagari"
                    >
                      {char}
                    </kbd>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="shrink-0 flex items-center gap-3">
            <Button
              size="lg"
              onClick={() => onContinueCourse(currentLmsLesson?.id)}
              icon={<Play className="w-4 h-4 fill-current" />}
              className="w-full sm:w-auto shadow-sm bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {completedLessons === 0 ? 'Start First Lesson' : 'Continue Lesson'}
            </Button>
          </div>
        </div>
      </div>

      {/* ================= SECTION C: PERFORMANCE OVERVIEW (4 CONSISTENT METRIC CARDS) ================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Performance Overview
          </h3>
          {!stats.hasData && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Complete a test to activate benchmarks
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Metric 1: Net Speed */}
          <Card className="p-4 border-slate-200 dark:border-slate-800 space-y-2 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold">Net Speed</span>
              <Gauge className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {stats.hasData && !isNaN(stats.averageNetWpm) ? Math.round(stats.averageNetWpm * 10) / 10 : '0'}
                </span>
                <span className="text-xs font-semibold text-slate-400">WPM</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {stats.hasData && !isNaN(stats.peakNetWpm) ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Peak: {Math.round(stats.peakNetWpm * 10) / 10} WPM
                  </span>
                ) : (
                  'No speed records logged'
                )}
              </p>
            </div>
          </Card>

          {/* Metric 2: Accuracy */}
          <Card className="p-4 border-slate-200 dark:border-slate-800 space-y-2 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold">Accuracy Rate</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {stats.hasData && !isNaN(stats.averageAccuracy) ? `${Math.round(stats.averageAccuracy * 10) / 10}%` : '0%'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {stats.hasData ? (
                  <span>Benchmark: 85% required</span>
                ) : (
                  'Awaiting first keystroke'
                )}
              </p>
            </div>
          </Card>

          {/* Metric 3: Total Practice Time */}
          <Card className="p-4 border-slate-200 dark:border-slate-800 space-y-2 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold">Total Practice Time</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {stats.totalPracticeMinutes && !isNaN(stats.totalPracticeMinutes) ? Math.round(stats.totalPracticeMinutes) : 0}
                </span>
                <span className="text-xs font-semibold text-slate-400">mins</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {todayMinutes > 0 ? `${todayMinutes} mins logged today` : 'Session active offline'}
              </p>
            </div>
          </Card>

          {/* Metric 4: Tests Completed */}
          <Card className="p-4 border-slate-200 dark:border-slate-800 space-y-2 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold">Tests Completed</span>
              <FileCheck className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {stats.totalTests && !isNaN(stats.totalTests) ? stats.totalTests : 0}
                </span>
                <span className="text-xs font-semibold text-slate-400">sessions</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {(stats.totalTests || 0) > 0 ? `${recentExams.length} official exams` : 'Take your debut test'}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* ================= SECTION D & E: 2-COLUMN GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2-COLS: Learning Progress + Recent Sessions */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION D: Learning Progress (160 Lessons Curriculum) */}
          <Card className="p-5 border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Curriculum Progress (160 Lessons)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Level {currentLevelDef.id}: {currentLevelDef.name}
                </p>
              </div>

              <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                {completionPercentage}%
              </span>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(2, completionPercentage)}%` }}
              />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-center border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[11px] text-slate-400">Completed</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {completedLessons}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Remaining</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {remainingLessons}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Total Course</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  160 Lessons
                </p>
              </div>
            </div>

            {/* Level milestones indicator */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Level Milestones:
              </p>
              <div className="grid grid-cols-6 gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((lvl) => {
                  const isCurrent = lmsSummary?.currentLevelId === lvl;
                  const isDone = (lmsSummary?.currentLevelId || 1) > lvl;
                  return (
                    <div
                      key={lvl}
                      className={`p-2 rounded-lg text-center text-xs border transition-all ${
                        isDone
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : isCurrent
                          ? 'border-blue-500 bg-blue-50 text-blue-800 font-bold dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300 ring-1 ring-blue-400'
                          : 'border-slate-200 bg-slate-50/60 text-slate-400 dark:border-slate-800 dark:bg-slate-900'
                      }`}
                    >
                      <p className="text-[10px] uppercase font-bold">L{lvl}</p>
                      <p className="text-[9px] truncate">
                        {isDone ? 'Done' : isCurrent ? 'Active' : 'Locked'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Course Roadmap Preview */}
          <CourseRoadmapPreview
            layout={activeProfile.preferences.keyboardLayout}
            onSelectLesson={(lesson) => onContinueCourse(lesson.id)}
          />

          {/* SECTION E: Recent Typing Sessions */}
          <Card className="p-5 border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Recent Practice Sessions
              </h3>
              <button
                type="button"
                onClick={onStartPractice}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
              >
                Start Practice <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {stats.recentResults.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400 space-y-2">
                <Keyboard className="w-8 h-8 mx-auto text-slate-400 shrink-0" />
                <p className="text-xs">No recent typing sessions logged yet.</p>
                <Button size="sm" variant="outline" onClick={onStartPractice}>
                  Begin First Typing Drill
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.recentResults.slice(0, 4).map((res) => (
                  <div
                    key={res.id}
                    className="py-2.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {res.lessonTitle}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(res.completedAt).toLocaleDateString()} • {res.layout}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600 dark:text-blue-400">
                        {res.netWpm} WPM
                      </p>
                      <p className="text-[10px] text-emerald-600 font-medium">
                        {res.accuracy}% Acc
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT 1-COL: Daily Goal & Streak + Latest Exams */}
        <div className="space-y-6">
          {/* Daily Goal & Streak Card */}
          <Card className="p-5 border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Daily Practice Goal
              </h3>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                <Flame className="w-4 h-4 fill-current" />
                {stats.currentStreakDays} Day Streak
              </span>
            </div>

            {/* Target progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                <span>Today: {todayMinutes} mins</span>
                <span>Target: {dailyGoalMinutes} mins</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${dailyGoalPct}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                {dailyGoalPct >= 100
                  ? '🎉 Daily practice target reached! Fantastic job.'
                  : `${dailyGoalMinutes - todayMinutes} minutes remaining to reach today's target.`}
              </p>
            </div>
          </Card>

          {/* Latest Examination Scorecards */}
          <Card className="p-5 border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Latest Examination Results
              </h3>
              <button
                type="button"
                onClick={onTakeExam}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
              >
                Take Exam <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentExams.length === 0 ? (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400 space-y-2">
                <FileCheck className="w-7 h-7 mx-auto text-slate-400 shrink-0" />
                <p className="text-xs">No formal exam attempts on record.</p>
                <Button size="sm" variant="outline" onClick={onTakeExam}>
                  Take Test
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                        {exam.passageTitle}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(exam.completedAt).toLocaleDateString()} • {exam.layout}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {exam.scoring.netWpm} WPM
                        </span>
                        <Badge variant={exam.passed ? 'green' : 'red'} size="sm">
                          {exam.passed ? 'Pass' : 'Fail'}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {exam.scoring.accuracy}% Accuracy
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ================= SECTION F: QUICK ACTIONS ================= */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={onStartPractice}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 hover:shadow-xs transition-all text-left flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-2">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Typing Practice
              </p>
              <p className="text-[10px] text-slate-400">Custom drills & arena</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onContinueCourse()}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 hover:shadow-xs transition-all text-left flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-2">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                160-Lesson Course
              </p>
              <p className="text-[10px] text-slate-400">Curriculum progression</p>
            </div>
          </button>

          <button
            type="button"
            onClick={onTakeExam}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-400 hover:shadow-xs transition-all text-left flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-2">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Examination
              </p>
              <p className="text-[10px] text-slate-400">Timed speed testing</p>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenKeyboardMap}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-400 hover:shadow-xs transition-all text-left flex flex-col justify-between"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-2">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Keyboard Layout
              </p>
              <p className="text-[10px] text-slate-400">Visual key positions</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
