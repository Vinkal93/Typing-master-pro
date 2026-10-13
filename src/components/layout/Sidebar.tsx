'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Keyboard,
  FileCheck,
  TrendingUp,
  BarChart3,
  Activity,
  Sparkles,
  Trophy,
  Award,
  Medal,
  BookOpen,
  Layers,
  Building2,
  ShieldCheck,
  Monitor,
  Settings,
  HelpCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  User,
  LogOut,
} from 'lucide-react';
import { NavigationItemId } from '@/types/navigation';
import { useProfile } from '@/context/ProfileContext';
import { AuthSession } from '@/types/institute';
import { AvatarBadge } from '@/components/ui/AvatarBadge';
import { Badge } from '@/components/ui/Badge';

interface SidebarProps {
  activeView: string;
  onNavigate: (viewId: NavigationItemId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  authSession: AuthSession | null;
  onOpenSettings: () => void;
  onOpenKeyboardRef: () => void;
  onOpenProfileManager: () => void;
  onOpenTeacherMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  authSession,
  onOpenSettings,
  onOpenKeyboardRef,
  onOpenProfileManager,
  onOpenTeacherMode,
}) => {
  const { activeProfile, updateProfile } = useProfile();

  // Accordion state for submenus
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(
    ['analytics', 'heatmap', 'recommendations', 'achievements', 'certificates', 'leaderboard'].includes(activeView)
  );

  const handleItemClick = (id: NavigationItemId, isModal = false) => {
    if (isModal) {
      if (id === 'settings') onOpenSettings();
      else if (id === 'help_guide') onOpenKeyboardRef();
      else if (id === 'profile_manager') onOpenProfileManager();
      else if (id === 'institute' && !authSession) onOpenTeacherMode();
    } else {
      // Special handler for quick layout shortcuts
      if (id === 'hindi_inscript') {
        if (activeProfile && activeProfile.preferences.keyboardLayout !== 'hindi_inscript') {
          updateProfile({
            ...activeProfile,
            preferences: {
              ...activeProfile.preferences,
              language: 'hindi',
              keyboardLayout: 'hindi_inscript',
            },
          }).catch(() => {});
        }
        onNavigate('practice');
      } else if (id === 'remington_gail') {
        if (activeProfile && activeProfile.preferences.keyboardLayout !== 'remington_gail') {
          updateProfile({
            ...activeProfile,
            preferences: {
              ...activeProfile.preferences,
              language: 'hindi',
              keyboardLayout: 'remington_gail',
            },
          }).catch(() => {});
        }
        onNavigate('remington');
      } else if (id === 'english_qwerty') {
        if (activeProfile && activeProfile.preferences.keyboardLayout !== 'english_qwerty') {
          updateProfile({
            ...activeProfile,
            preferences: {
              ...activeProfile.preferences,
              language: 'english',
              keyboardLayout: 'english_qwerty',
            },
          }).catch(() => {});
        }
        onNavigate('practice');
      } else {
        onNavigate(id);
      }
    }

    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const isPerformanceActive = [
    'analytics',
    'heatmap',
    'recommendations',
    'achievements',
    'certificates',
    'leaderboard',
  ].includes(activeView);

  // Common Nav Button component
  const NavButton = ({
    id,
    label,
    icon: Icon,
    isActive,
    badge,
    badgeColor = 'blue',
    isModal = false,
    tooltip,
    isSubItem = false,
  }: {
    id: NavigationItemId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: boolean;
    badge?: string;
    badgeColor?: 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'gray';
    isModal?: boolean;
    tooltip?: string;
    isSubItem?: boolean;
  }) => {
    return (
      <div className="relative group w-full">
        <button
          type="button"
          onClick={() => handleItemClick(id, isModal)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all select-none ${
            isSubItem ? 'pl-8' : ''
          } ${
            isActive
              ? 'bg-blue-600 text-white shadow-sm font-bold dark:bg-blue-600 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/70'
          }`}
          title={isCollapsed ? tooltip || label : undefined}
        >
          <Icon
            className={`w-4 h-4 shrink-0 transition-transform ${
              isActive ? 'text-white scale-110' : 'text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200'
            }`}
          />
          {!isCollapsed && (
            <span className="truncate flex-1 text-left">{label}</span>
          )}
          {!isCollapsed && badge && (
            <span
              className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                isActive
                  ? 'bg-blue-500/50 text-white'
                  : badgeColor === 'green'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : badgeColor === 'amber'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  : badgeColor === 'purple'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
              }`}
            >
              {badge}
            </span>
          )}
        </button>

        {/* Collapsed Tooltip */}
        {isCollapsed && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-md shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap dark:bg-slate-800 dark:border dark:border-slate-700">
            {tooltip || label}
            {badge && ` (${badge})`}
          </div>
        )}
      </div>
    );
  };

  const SectionTitle = ({ label }: { label: string }) => {
    if (isCollapsed) {
      return <div className="h-px bg-slate-200 dark:bg-slate-800 my-2 mx-2" />;
    }
    return (
      <div className="px-3 pt-3 pb-1">
        <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
          {label}
        </span>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        } ${
          isMobileOpen
            ? 'translate-x-0 shadow-2xl'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & Collapse Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Keyboard className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100">
                    Typing Master
                  </span>
                  <span className="text-[9px] font-bold px-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  Institute Offline Edition
                </p>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-8 h-8 mx-auto rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Keyboard className="w-4 h-4" />
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (Independently Scrollable) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-1 scrollbar-none">
          {/* SECTION: MAIN */}
          <SectionTitle label="Main" />

          <NavButton
            id="dashboard"
            label="Dashboard"
            icon={LayoutDashboard}
            isActive={activeView === 'dashboard'}
            tooltip="Student Dashboard"
          />

          <NavButton
            id="lms"
            label="My Learning"
            icon={GraduationCap}
            isActive={activeView === 'lms'}
            badge="160 Lessons"
            badgeColor="green"
            tooltip="Structured 160-Lesson Curriculum"
          />

          <NavButton
            id="practice"
            label="Typing Practice"
            icon={Keyboard}
            isActive={activeView === 'practice'}
            tooltip="Real-Time Typing Practice Arena"
          />

          <NavButton
            id="exam"
            label="Examinations"
            icon={FileCheck}
            isActive={activeView === 'exam'}
            badge="Strict"
            badgeColor="amber"
            tooltip="Official Speed Examinations"
          />

          {/* Performance & Reports with Accordion */}
          <div className="w-full">
            <button
              type="button"
              onClick={() => {
                if (isCollapsed) {
                  onNavigate('analytics');
                } else {
                  setIsPerformanceOpen(!isPerformanceOpen);
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all select-none ${
                isPerformanceActive && !isPerformanceOpen
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/70'
              }`}
              title={isCollapsed ? 'Performance & Reports' : undefined}
            >
              <TrendingUp className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" />
              {!isCollapsed && (
                <>
                  <span className="truncate flex-1 text-left">Performance & Reports</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-400 ${
                      isPerformanceOpen ? 'rotate-180' : ''
                    }`}
                  />
                </>
              )}
            </button>

            {/* Performance Submenu */}
            {!isCollapsed && isPerformanceOpen && (
              <div className="mt-1 space-y-0.5 border-l-2 border-slate-100 dark:border-slate-800 ml-4 pl-1">
                <NavButton
                  id="analytics"
                  label="Speed & Accuracy"
                  icon={BarChart3}
                  isActive={activeView === 'analytics'}
                  isSubItem={false}
                />
                <NavButton
                  id="heatmap"
                  label="Keyboard Heatmap"
                  icon={Activity}
                  isActive={activeView === 'heatmap'}
                  isSubItem={false}
                />
                <NavButton
                  id="recommendations"
                  label="Smart Drills"
                  icon={Sparkles}
                  isActive={activeView === 'recommendations'}
                  isSubItem={false}
                />
                <NavButton
                  id="achievements"
                  label="Achievements"
                  icon={Trophy}
                  isActive={activeView === 'achievements'}
                  isSubItem={false}
                />
                <NavButton
                  id="certificates"
                  label="Certificates"
                  icon={Award}
                  isActive={activeView === 'certificates'}
                  isSubItem={false}
                />
                <NavButton
                  id="leaderboard"
                  label="Leaderboard"
                  icon={Medal}
                  isActive={activeView === 'leaderboard'}
                  isSubItem={false}
                />
              </div>
            )}
          </div>

          {/* SECTION: LEARNING TOOLS */}
          <SectionTitle label="Learning Tools" />

          <NavButton
            id="character_learning"
            label="Character Learning"
            icon={BookOpen}
            isActive={activeView === 'character_learning'}
            tooltip="Master Hindi & English Characters"
          />

          <NavButton
            id="word_builder"
            label="Word Builder"
            icon={Sparkles}
            isActive={activeView === 'word_builder'}
            tooltip="Syllable & Conjunct Word Formation"
          />

          <NavButton
            id="virtual_keyboard"
            label="Keyboard Layout Map"
            icon={Layers}
            isActive={activeView === 'virtual_keyboard'}
            tooltip="Interactive Visual Layout Keyboard"
          />

          <NavButton
            id="hindi_inscript"
            label="Hindi InScript"
            icon={Keyboard}
            isActive={activeProfile?.preferences.keyboardLayout === 'hindi_inscript' && activeView === 'practice'}
            badge="IS 16350"
            badgeColor="blue"
            tooltip="Hindi InScript (Govt & SSC Standard)"
          />

          <NavButton
            id="remington_gail"
            label="Remington GAIL"
            icon={Keyboard}
            isActive={activeView === 'remington'}
            badge="Typewriter"
            badgeColor="purple"
            tooltip="Remington GAIL Typewriter (CPCT & High Court)"
          />

          <NavButton
            id="english_qwerty"
            label="English Typing"
            icon={Keyboard}
            isActive={activeProfile?.preferences.keyboardLayout === 'english_qwerty' && activeView === 'practice'}
            badge="QWERTY"
            badgeColor="gray"
            tooltip="English Standard QWERTY"
          />

          {/* SECTION: INSTITUTE */}
          <SectionTitle label="Institute" />

          {authSession ? (
            <>
              <NavButton
                id="institute"
                label="Institute Console"
                icon={Building2}
                isActive={activeView === 'institute'}
                badge={authSession.user.role}
                badgeColor="purple"
                tooltip="Teacher & Administrator Portal"
              />
            </>
          ) : (
            <NavButton
              id="institute"
              label="Teacher Mode"
              icon={ShieldCheck}
              isActive={false}
              badge="Staff"
              badgeColor="gray"
              isModal={true}
              tooltip="Faculty & Administrator Sign-In"
            />
          )}

          {/* SECTION: SYSTEM */}
          <SectionTitle label="System" />

          <NavButton
            id="settings"
            label="Preferences & Settings"
            icon={Settings}
            isActive={false}
            isModal={true}
            tooltip="Application Settings & Offline Data"
          />

          <NavButton
            id="help_guide"
            label="Keyboard Reference"
            icon={HelpCircle}
            isActive={false}
            isModal={true}
            tooltip="Keys, Alt Codes & Finger Guides"
          />

          <NavButton
            id="profile_manager"
            label="Manage Students"
            icon={Users}
            isActive={false}
            isModal={true}
            tooltip="Student Profiles & Switcher"
          />
        </div>

        {/* Compact User Profile Section at Bottom */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2">
              <div
                onClick={onOpenProfileManager}
                className="flex items-center gap-2.5 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                title="Click to Switch Student Profile"
              >
                <AvatarBadge
                  avatarId={activeProfile?.avatar}
                  name={activeProfile?.name}
                  size="sm"
                />
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {activeProfile?.name || 'Guest Student'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {activeProfile?.preferences.keyboardLayout === 'hindi_inscript'
                      ? 'Hindi InScript'
                      : activeProfile?.preferences.keyboardLayout === 'remington_gail'
                      ? 'Remington GAIL'
                      : 'English QWERTY'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenSettings}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={onOpenProfileManager}
              className="flex justify-center cursor-pointer hover:opacity-80 transition-opacity"
              title={`Active: ${activeProfile?.name || 'Student'}`}
            >
              <AvatarBadge
                avatarId={activeProfile?.avatar}
                name={activeProfile?.name}
                size="sm"
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
