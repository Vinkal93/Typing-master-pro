'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Keyboard as KeyboardIcon,
  BookOpen,
  Sparkles,
  Layers,
  ArrowLeft,
  GraduationCap,
  FileCheck,
  Building2,
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
import { RemingtonPractice } from '@/components/remington/RemingtonPractice';
import { LmsDashboard } from '@/components/lms/LmsDashboard';
import { ExamContainer } from '@/components/exam/ExamContainer';
import { InstitutePortal } from '@/components/institute/InstitutePortal';
import { AuthModal } from '@/components/institute/AuthModal';
import { AuthSession } from '@/types/institute';
import { LessonCatalogService } from '@/services/lessons/lessonCatalog';
import { StatisticsService, ProfileStatistics } from '@/services/statistics/statisticsService';
import { LessonMetadata } from '@/types';
import { StudentAnalyticsView } from '@/components/analytics/StudentAnalyticsView';
import { KeyboardHeatmapView } from '@/components/analytics/KeyboardHeatmapView';
import { SmartRecommendationsView } from '@/components/analytics/SmartRecommendationsView';
import { AchievementsView } from '@/components/achievements/AchievementsView';
import { CertificateGalleryView } from '@/components/certificates/CertificateGalleryView';
import { LeaderboardView } from '@/components/leaderboard/LeaderboardView';
import {
  TrendingUp,
  Award,
  Trophy,
} from 'lucide-react';

export type ActiveModuleView =
  | 'dashboard'
  | 'lms'
  | 'exam'
  | 'remington'
  | 'institute'
  | 'analytics'
  | 'heatmap'
  | 'recommendations'
  | 'achievements'
  | 'certificates'
  | 'leaderboard'
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

  // Phase 5: Institute Authentication Session State
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
        onOpenTeacherMode={() => {
          if (authSession) setActiveView('institute');
          else setIsAuthModalOpen(true);
        }}
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
            onClick={() => setActiveView('lms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeView === 'lms'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>LMS Course (160 पाठ)</span>
          </button>

          <button
            onClick={() => setActiveView('exam')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeView === 'exam'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Examination (परीक्षा)</span>
          </button>

          <button
            onClick={() => setActiveView('remington')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeView === 'remington'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <KeyboardIcon className="w-3.5 h-3.5 text-indigo-300" />
            <span>Remington GAIL (टाइपराइटर)</span>
          </button>

          <button
            onClick={() => {
              if (authSession) setActiveView('institute');
              else setIsAuthModalOpen(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeView === 'institute'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Institute (प्रबंधन)</span>
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
            onClick={() => setActiveView('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeView === 'analytics'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Analytics (विश्लेषण)</span>
          </button>

          <button
            onClick={() => setActiveView('heatmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeView === 'heatmap'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <KeyboardIcon className="w-3.5 h-3.5" />
            <span>Heatmap (हीटमैप)</span>
          </button>

          <button
            onClick={() => setActiveView('recommendations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeView === 'recommendations'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Drills (सिफारिशें)</span>
          </button>

          <button
            onClick={() => setActiveView('achievements')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeView === 'achievements'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Achievements (पदक)</span>
          </button>

          <button
            onClick={() => setActiveView('certificates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeView === 'certificates'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Certificates (प्रमाणपत्र)</span>
          </button>

          <button
            onClick={() => setActiveView('leaderboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeView === 'leaderboard'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Leaderboard (लीडरबोर्ड)</span>
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

        {/* Phase 3: Smart LMS Master Course */}
        {activeView === 'lms' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Dashboard
            </button>
            <LmsDashboard />
          </div>
        )}

        {/* Phase 4: Professional Typing Examination System */}
        {activeView === 'exam' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Dashboard
            </button>
            <ExamContainer />
          </div>
        )}

        {/* Phase 5: Teacher Admin & Institute Management */}
        {activeView === 'institute' && authSession && (
          <div className="space-y-4">
            <InstitutePortal
              initialSession={authSession}
              onExitToStudentDashboard={() => setActiveView('dashboard')}
            />
          </div>
        )}

        {/* Phase 6: Performance Analytics */}
        {activeView === 'analytics' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Dashboard
            </button>
            <StudentAnalyticsView />
          </div>
        )}

        {/* Phase 6: Keyboard Heatmap */}
        {activeView === 'heatmap' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Dashboard
            </button>
            <KeyboardHeatmapView />
          </div>
        )}

        {/* Phase 6: Smart Recommendations */}
        {activeView === 'recommendations' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-amber-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Dashboard
            </button>
            <SmartRecommendationsView
              onStartDrill={(text) => {
                setActiveView('practice');
              }}
            />
          </div>
        )}

        {/* Phase 6: Achievements */}
        {activeView === 'achievements' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-amber-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Dashboard
            </button>
            <AchievementsView />
          </div>
        )}

        {/* Phase 6: Certificates */}
        {activeView === 'certificates' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-purple-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Dashboard
            </button>
            <CertificateGalleryView />
          </div>
        )}

        {/* Phase 6: Leaderboard */}
        {activeView === 'leaderboard' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-amber-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Dashboard
            </button>
            <LeaderboardView />
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

        {/* Phase 7: Remington GAIL Practice */}
        {activeView === 'remington' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Dashboard
            </button>
            <RemingtonPractice />
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticated={(session) => {
          setAuthSession(session);
          setActiveView('institute');
        }}
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
