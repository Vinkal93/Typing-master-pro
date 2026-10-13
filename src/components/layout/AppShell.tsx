'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { NavigationItemId } from '@/types/navigation';
import { AuthSession } from '@/types/institute';

interface AppShellProps {
  activeView: string;
  onNavigate: (viewId: NavigationItemId) => void;
  children: React.ReactNode;
  authSession: AuthSession | null;
  onOpenSettings: () => void;
  onOpenKeyboardRef: () => void;
  onOpenProfileManager: () => void;
  onAddNewStudent: () => void;
  onOpenTeacherMode: () => void;
  onSignOutTeacher?: () => void;
  isFocusMode?: boolean;
}

const STORAGE_COLLAPSED_KEY = 'tmp_sidebar_collapsed';

export const AppShell: React.FC<AppShellProps> = ({
  activeView,
  onNavigate,
  children,
  authSession,
  onOpenSettings,
  onOpenKeyboardRef,
  onOpenProfileManager,
  onAddNewStudent,
  onOpenTeacherMode,
  onSignOutTeacher,
  isFocusMode = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Restore sidebar collapsed preference from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_COLLAPSED_KEY);
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    }
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_COLLAPSED_KEY, String(next));
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {/* Collapsible Left Sidebar */}
      {!isFocusMode && (
        <Sidebar
          activeView={activeView}
          onNavigate={onNavigate}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
          authSession={authSession}
          onOpenSettings={onOpenSettings}
          onOpenKeyboardRef={onOpenKeyboardRef}
          onOpenProfileManager={onOpenProfileManager}
          onOpenTeacherMode={onOpenTeacherMode}
        />
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isFocusMode ? 'pl-0' : isCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        }`}
      >
        {/* Sticky Top Header */}
        {!isFocusMode && (
          <TopHeader
            activeView={activeView}
            onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)}
            onOpenSettings={onOpenSettings}
            onOpenProfileManager={onOpenProfileManager}
            onAddNewStudent={onAddNewStudent}
            onOpenTeacherMode={onOpenTeacherMode}
            onNavigateHome={() => onNavigate('dashboard')}
            authSession={authSession}
            onSignOutTeacher={onSignOutTeacher}
          />
        )}

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
