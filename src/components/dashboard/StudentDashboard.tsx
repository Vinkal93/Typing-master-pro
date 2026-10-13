'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardOverview } from './DashboardOverview';
import { SettingsModal } from './SettingsModal';

import { KeyboardReferenceModal } from './KeyboardReferenceModal';
import { ProfileManagerModal } from './ProfileManagerModal';
import { AddStudentModal } from './AddStudentModal';
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
import { RbacService } from '@/services/security/rbacService';
import { StatisticsService, ProfileStatistics } from '@/services/statistics/statisticsService';
import { LessonMetadata } from '@/types';
import { NavigationItemId } from '@/types/navigation';
import { StudentAnalyticsView } from '@/components/analytics/StudentAnalyticsView';
import { KeyboardHeatmapView } from '@/components/analytics/KeyboardHeatmapView';
import { SmartRecommendationsView } from '@/components/analytics/SmartRecommendationsView';
import { AchievementsView } from '@/components/achievements/AchievementsView';
import { CertificateGalleryView } from '@/components/certificates/CertificateGalleryView';
import { LeaderboardView } from '@/components/leaderboard/LeaderboardView';
import { ArrowLeft } from 'lucide-react';

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
  const [isKeyboardRefOpen, setIsKeyboardRefOpen] = useState(false);
  const [isProfileManagerOpen, setIsProfileManagerOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  // Active remedial practice drill (from Smart Recommendations)
  const [activeDrill, setActiveDrill] = useState<{ text: string; title: string } | null>(null);

  // Institute Staff Authentication Session State
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Restore staff session if active
  useEffect(() => {
    const existing = RbacService.getCurrentSession();
    if (existing && !existing.isLocked) {
      setAuthSession(existing);
    }
  }, []);

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

  const handleNavigate = (viewId: NavigationItemId) => {
    if (viewId === 'institute') {
      if (authSession) {
        setActiveView('institute');
      } else {
        setIsAuthModalOpen(true);
      }
      return;
    }

    if (
      [
        'dashboard',
        'lms',
        'exam',
        'remington',
        'analytics',
        'heatmap',
        'recommendations',
        'achievements',
        'certificates',
        'leaderboard',
        'practice',
        'character_learning',
        'word_builder',
        'virtual_keyboard',
      ].includes(viewId)
    ) {
      setActiveView(viewId as ActiveModuleView);
    }
  };

  const handleSignOutTeacher = () => {
    RbacService.logout();
    setAuthSession(null);
    if (activeView === 'institute') {
      setActiveView('dashboard');
    }
  };

  if (!activeProfile) {
    return null;
  }

  return (
    <AppShell
      activeView={activeView}
      onNavigate={handleNavigate}
      authSession={authSession}
      onOpenSettings={() => setIsSettingsOpen(true)}
      onOpenKeyboardRef={() => setIsKeyboardRefOpen(true)}
      onOpenProfileManager={() => setIsProfileManagerOpen(true)}
      onAddNewStudent={() => setIsAddStudentOpen(true)}
      onOpenTeacherMode={() => {
        if (authSession) setActiveView('institute');
        else setIsAuthModalOpen(true);
      }}
      onSignOutTeacher={handleSignOutTeacher}
    >
      {/* View Router */}
      <div className="w-full">
        {/* VIEW 1: Dashboard Overview */}
        {activeView === 'dashboard' && (
          <DashboardOverview
            stats={stats}
            onStartPractice={() => setActiveView('practice')}
            onContinueCourse={() => setActiveView('lms')}
            onTakeExam={() => setActiveView('exam')}
            onOpenKeyboardMap={() => setActiveView('virtual_keyboard')}
          />
        )}

        {/* VIEW 2: My Learning (160-Lesson Progressive LMS) */}
        {activeView === 'lms' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
            <LmsDashboard />
          </div>
        )}

        {/* VIEW 3: Typing Practice Arena */}
        {activeView === 'practice' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
            <button
              onClick={() => {
                setActiveDrill(null);
                setActiveView('dashboard');
              }}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
            <PracticeEngine
              customDrillText={activeDrill?.text}
              customDrillTitle={activeDrill?.title}
            />
          </div>
        )}

        {/* VIEW 4: Official Typing Examination System */}
        {activeView === 'exam' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
            <ExamContainer />
          </div>
        )}

        {/* VIEW 5: Remington GAIL Practice */}
        {activeView === 'remington' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
            <RemingtonPractice />
          </div>
        )}

        {/* VIEW 6: Institute Management Portal */}
        {activeView === 'institute' && authSession && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
            <InstitutePortal
              initialSession={authSession}
              onExitToStudentDashboard={() => setActiveView('dashboard')}
            />
          </div>
        )}

        {/* VIEW 7: Speed & Accuracy Analytics */}
        {activeView === 'analytics' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
            <StudentAnalyticsView />
          </div>
        )}

        {/* VIEW 8: Keyboard Accuracy Heatmap */}
        {activeView === 'heatmap' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
            <KeyboardHeatmapView />
          </div>
        )}

        {/* VIEW 9: Smart Recommendations */}
        {activeView === 'recommendations' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
            <SmartRecommendationsView
              onStartDrill={(drillText, title) => {
                setActiveDrill({ text: drillText, title });
                setActiveView('practice');
              }}
            />
          </div>
        )}

        {/* VIEW 10: Milestone Achievements */}
        {activeView === 'achievements' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
            <AchievementsView />
          </div>
        )}

        {/* VIEW 11: Certificates Gallery */}
        {activeView === 'certificates' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
            <CertificateGalleryView />
          </div>
        )}

        {/* VIEW 12: Institute Leaderboard */}
        {activeView === 'leaderboard' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
            <LeaderboardView />
          </div>
        )}

        {/* VIEW 13: Character Learning Drills */}
        {activeView === 'character_learning' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
            <CharacterLearning />
          </div>
        )}

        {/* VIEW 14: Hindi Word Builder */}
        {activeView === 'word_builder' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
            <WordBuilder />
          </div>
        )}

        {/* VIEW 15: Virtual Keyboard Full View */}
        {activeView === 'virtual_keyboard' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
            <VirtualKeyboard showHandsGuide={true} />
          </div>
        )}
      </div>

      {/* Persistent Modals */}
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
    </AppShell>
  );
};
