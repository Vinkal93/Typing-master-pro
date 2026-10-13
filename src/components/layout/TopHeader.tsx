'use client';

import React, { useState } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Settings,
  ChevronDown,
  Keyboard,
  Globe,
  UserCheck,
  UserPlus,
  Users,
  Building2,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Home,
  Check,
} from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { useTheme } from '@/context/ThemeContext';
import { AvatarBadge } from '@/components/ui/AvatarBadge';
import { Button } from '@/components/ui/Button';
import { AuthSession } from '@/types/institute';
import { KeyboardLayout, Language } from '@/types';

interface TopHeaderProps {
  activeView: string;
  onToggleMobileSidebar: () => void;
  onOpenSettings: () => void;
  onOpenProfileManager: () => void;
  onAddNewStudent: () => void;
  onOpenTeacherMode: () => void;
  onNavigateHome: () => void;
  authSession: AuthSession | null;
  onSignOutTeacher?: () => void;
}

const VIEW_METADATA: Record<string, { section: string; title: string }> = {
  dashboard: { section: 'Main', title: 'Dashboard' },
  lms: { section: 'Main', title: 'My Learning (160 Lessons)' },
  practice: { section: 'Main', title: 'Typing Practice' },
  exam: { section: 'Main', title: 'Official Examinations' },
  analytics: { section: 'Performance & Reports', title: 'Speed & Accuracy Analytics' },
  heatmap: { section: 'Performance & Reports', title: 'Keyboard Accuracy Heatmap' },
  recommendations: { section: 'Performance & Reports', title: 'Smart Practice Drills' },
  achievements: { section: 'Performance & Reports', title: 'Milestone Achievements' },
  certificates: { section: 'Performance & Reports', title: 'Verified Certificates' },
  leaderboard: { section: 'Performance & Reports', title: 'Institute Leaderboard' },
  character_learning: { section: 'Learning Tools', title: 'Character Learning Drills' },
  word_builder: { section: 'Learning Tools', title: 'Word & Syllable Builder' },
  virtual_keyboard: { section: 'Learning Tools', title: 'Interactive Layout Map' },
  remington: { section: 'Learning Tools', title: 'Remington GAIL Typewriter Practice' },
  institute: { section: 'Institute', title: 'Management Console' },
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeView,
  onToggleMobileSidebar,
  onOpenSettings,
  onOpenProfileManager,
  onAddNewStudent,
  onOpenTeacherMode,
  onNavigateHome,
  authSession,
  onSignOutTeacher,
}) => {
  const { activeProfile, updateProfile, profiles, switchProfile } = useProfile();
  const { resolvedTheme, setTheme } = useTheme();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);

  const meta = VIEW_METADATA[activeView] || { section: 'Main', title: 'Workspace' };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleSelectLayout = async (layout: KeyboardLayout) => {
    if (!activeProfile) return;
    const lang: Language = layout === 'english_qwerty' ? 'english' : 'hindi';
    try {
      await updateProfile({
        ...activeProfile,
        preferences: {
          ...activeProfile.preferences,
          language: lang,
          keyboardLayout: layout,
        },
      });
      setIsLayoutMenuOpen(false);
    } catch (e) {
      console.error('Failed to update keyboard layout:', e);
    }
  };

  const currentLayout = activeProfile?.preferences.keyboardLayout || 'hindi_inscript';
  const currentLanguage = activeProfile?.preferences.language || 'hindi';

  return (
    <header className="sticky top-0 z-30 w-full h-14 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm px-4 flex items-center justify-between gap-3 shrink-0">
      {/* LEFT: Mobile Toggle + Breadcrumbs + Title */}
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Mobile Sidebar Toggle Button */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Navigation Drawer"
          className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            title="Go to Dashboard"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">Home</span>
          </button>

          <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />

          {meta.section !== 'Main' && (
            <>
              <span className="hidden md:inline text-slate-400 font-medium truncate max-w-[120px]">
                {meta.section}
              </span>
              <ChevronRight className="hidden md:inline w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
            </>
          )}

          <h1 className="font-bold text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm">
            {meta.title}
          </h1>
        </nav>
      </div>

      {/* RIGHT: Controls & Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Keyboard Layout Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLayoutMenuOpen(!isLayoutMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            title="Active Typing Layout"
          >
            <Keyboard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">
              {currentLayout === 'hindi_inscript'
                ? 'InScript'
                : currentLayout === 'remington_gail'
                ? 'Remington'
                : 'QWERTY'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isLayoutMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsLayoutMenuOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-60 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 py-1.5 text-xs animate-in fade-in">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Keyboard Layout
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectLayout('hindi_inscript')}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200"
                >
                  <div>
                    <p className="font-semibold">Hindi InScript</p>
                    <p className="text-[10px] text-slate-400">IS 16350 Govt & SSC Standard</p>
                  </div>
                  {currentLayout === 'hindi_inscript' && (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectLayout('remington_gail')}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200"
                >
                  <div>
                    <p className="font-semibold">Hindi Remington GAIL</p>
                    <p className="text-[10px] text-slate-400">CPCT & High Court Typewriter</p>
                  </div>
                  {currentLayout === 'remington_gail' && (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectLayout('english_qwerty')}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200"
                >
                  <div>
                    <p className="font-semibold">English QWERTY</p>
                    <p className="text-[10px] text-slate-400">Standard English Keyboard</p>
                  </div>
                  {currentLayout === 'english_qwerty' && (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle dark/light theme"
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Settings Shortcut Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Open Application Settings"
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          title="Settings & Data Management"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors"
            title="User Profile Menu"
          >
            <AvatarBadge
              avatarId={activeProfile?.avatar}
              name={activeProfile?.name}
              size="sm"
            />
            <span className="hidden md:inline font-bold text-xs text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
              {activeProfile?.name || 'Student'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {isProfileMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileMenuOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 py-1.5 text-xs animate-in fade-in">
                {/* Active Student Header */}
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Current Student
                  </p>
                  <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                    {activeProfile?.name}
                  </p>
                  {activeProfile?.instituteRollNo && (
                    <p className="text-[11px] text-slate-500 font-mono">
                      Roll No: {activeProfile.instituteRollNo}
                    </p>
                  )}
                </div>

                {/* Profiles List for 1-Click Switch */}
                {profiles.length > 1 && (
                  <div className="py-1 border-b border-slate-100 dark:border-slate-800 max-h-36 overflow-y-auto">
                    <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase">
                      Switch Student Profile
                    </p>
                    {profiles.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          switchProfile(p.id);
                          setIsProfileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                          p.id === activeProfile?.id
                            ? 'bg-blue-50/50 dark:bg-blue-950/20 font-bold text-blue-700 dark:text-blue-300'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <AvatarBadge avatarId={p.avatar} name={p.name} size="sm" className="w-6 h-6 text-[10px]" />
                          <span className="truncate">{p.name}</span>
                        </div>
                        {p.id === activeProfile?.id && (
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Profile Actions */}
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenProfileManager();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Manage All Profiles</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onAddNewStudent();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <UserPlus className="w-4 h-4 text-slate-400" />
                    <span>Add New Student Profile</span>
                  </button>
                </div>

                {/* Staff / Teacher Section */}
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  {authSession ? (
                    <div className="px-3 py-1.5 flex items-center justify-between bg-purple-50/50 dark:bg-purple-950/20">
                      <div>
                        <p className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
                          Staff: {authSession.user.name}
                        </p>
                        <p className="text-[10px] text-slate-500 capitalize">
                          Role: {authSession.user.role}
                        </p>
                      </div>
                      {onSignOutTeacher && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onSignOutTeacher();
                          }}
                          className="p-1 rounded text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950"
                          title="Sign Out Staff"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenTeacherMode();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 font-semibold"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Teacher Mode Sign-In</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
