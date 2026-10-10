'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Keyboard as KeyboardIcon,
  BookOpen,
  Sparkles,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { DashboardHeader } from './DashboardHeader';
import { WelcomeSection } from './WelcomeSection';
import { ContinueLearningCard } from './ContinueLearningCard';
import { StatsOverview } from './StatsOverview';
import { DailyGoalCard } from './DailyGoalCard';
import { CourseRoadmapPreview } from './CourseRoadmapPreview';
import { RecentActivity } from './RecentActivity';
import { SettingsModal } from './SettingsModal';
import { TeacherModeModal } from './TeacherModeModal';
import { KeyboardReferenceModal } from './KeyboardReferenceModal';
import { ProfileManagerModal } from './ProfileManagerModal';
import { AddStudentModal } from './AddStudentModal';
import { LessonPreviewModal } from './LessonPreviewModal';
import { VirtualKeyboard } from '@/components/keyboard/VirtualKeyboard';
import { CharacterLearning } from '@/components/character-learning/CharacterLearning';
import { WordBuilder } from '@/components/word-builder/WordBuilder';
import { PracticeEngine } from '@/components/practice/PracticeEngine';
import { LessonCatalogService } from '@/services/lessons/lessonCatalog';
import { StatisticsService, ProfileStatistics } from '@/services/statistics/statisticsService';
import { LessonMetadata } from '@/types';

export type ActiveModuleView =
  | 'dashboard'
  | 'practice'
  | 'character_learning'
  | 'word_builder'
  | 'virtual_keyboard';

export const StudentDashboard: React.FC = () => {
  const { activeProfile } = useProfile();

  const [activeView, setActiveView] = useState<ActiveModuleView>('dashboard');

  // Statistics state
  const [stats, setStats] = useState<ProfileStatistics>({
    hasData: false,
    totalTests: 0,
    averageNetWpm: 0,
    peakNetWpm: 0,
    averageAccuracy: 0,
    totalPracticeMinutes: 0,
    todayMinutes: 0,
    currentStreakDays: 0,
    recentResults: [],
  });

  // Modal visibility states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTeacherModeOpen, setIsTeacherModeOpen] = useState(false);
  const [isKeyboardRefOpen, setIsKeyboardRefOpen] = useState(false);
  const [isProfileManagerOpen, setIsProfileManagerOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<LessonMetadata | null>(null);

  const fetchStats = useCallback(async () => {
    if (!activeProfile) return;
    try {
      const data = await StatisticsService.getProfileStatistics(activeProfile.id);
      setStats(data);
    } catch (err) {
      console.error('Failed to load profile statistics:', err);
    }
  }, [activeProfile]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (!activeProfile) {
    return null;
  }

  const lessons = LessonCatalogService.getLessonsByLayout(activeProfile.preferences.keyboardLayout);
  const recommendedLesson = lessons[0] || LessonCatalogService.getLessonsByLayout('english_qwerty')[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navigation & Profile Switcher */}
      <DashboardHeader
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTeacherMode={() => setIsTeacherModeOpen(true)}
        onOpenKeyboardRef={() => setActiveView('virtual_keyboard')}
        onOpenProfileManager={() => setIsProfileManagerOpen(true)}
        onAddNewStudent={() => setIsAddStudentOpen(true)}
      />

      {/* Module Navigation Tabs */}
      <nav className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeView === 'dashboard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveView('practice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeView === 'practice'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <KeyboardIcon className="w-3.5 h-3.5" />
            <span>Typing Practice</span>
          </button>

          <button
            onClick={() => setActiveView('character_learning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeView === 'character_learning'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Character Learning</span>
          </button>

          <button
            onClick={() => setActiveView('word_builder')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeView === 'word_builder'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Word Builder (शब्द रचना)</span>
          </button>

          <button
            onClick={() => setActiveView('virtual_keyboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeView === 'virtual_keyboard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Virtual Keyboard</span>
          </button>
        </div>
      </nav>

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <WelcomeSection profile={activeProfile} />

            {/* Continue Learning CTA Card */}
            <ContinueLearningCard
              currentLesson={recommendedLesson}
              onStartLesson={() => setActiveView('practice')}
            />

            {/* Metrics & Daily Target Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Speed & Accuracy Analytics (Explicit No-Data States) */}
                <StatsOverview stats={stats} />

                {/* Course Roadmap Preview */}
                <CourseRoadmapPreview
                  layout={activeProfile.preferences.keyboardLayout}
                  onSelectLesson={(lesson) => setSelectedLesson(lesson)}
                />
              </div>

              {/* Right Column: Daily Goal & Recent Activity */}
              <div className="space-y-6">
                <DailyGoalCard
                  todayMinutes={stats.todayMinutes}
                  goalMinutes={activeProfile.preferences.dailyPracticeGoal}
                  streakDays={stats.currentStreakDays}
                />

                <RecentActivity
                  recentResults={stats.recentResults}
                  onStartPractice={() => setActiveView('practice')}
                />
              </div>
            </div>
          </div>
        )}

        {/* Module 5: Practice Engine */}
        {activeView === 'practice' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Dashboard
            </button>
            <PracticeEngine />
          </div>
        )}

        {/* Module 3: Character Learning */}
        {activeView === 'character_learning' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Dashboard
            </button>
            <CharacterLearning />
          </div>
        )}

        {/* Module 4: Word Builder */}
        {activeView === 'word_builder' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Dashboard
            </button>
            <WordBuilder />
          </div>
        )}

        {/* Module 2: Virtual Keyboard Fullscreen View */}
        {activeView === 'virtual_keyboard' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Dashboard
            </button>
            <VirtualKeyboard showHandsGuide={true} />
          </div>
        )}
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <TeacherModeModal
        isOpen={isTeacherModeOpen}
        onClose={() => setIsTeacherModeOpen(false)}
      />

      <KeyboardReferenceModal
        isOpen={isKeyboardRefOpen}
        onClose={() => setIsKeyboardRefOpen(false)}
        layout={activeProfile.preferences.keyboardLayout}
      />

      <ProfileManagerModal
        isOpen={isProfileManagerOpen}
        onClose={() => setIsProfileManagerOpen(false)}
        onAddNewStudent={() => setIsAddStudentOpen(true)}
      />

      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
      />

      <LessonPreviewModal
        isOpen={selectedLesson !== null}
        onClose={() => setSelectedLesson(null)}
        lesson={selectedLesson}
        profile={activeProfile}
        onRefreshStats={fetchStats}
      />
    </div>
  );
};
