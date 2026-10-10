'use client';

import React, { useState } from 'react';
import {
  Keyboard,
  Sun,
  Moon,
  Settings,
  GraduationCap,
  ChevronDown,
  UserPlus,
  Users,
  Eye,
} from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { useTheme } from '@/context/ThemeContext';
import { AvatarBadge } from '@/components/ui/AvatarBadge';
import { Button } from '@/components/ui/Button';

interface DashboardHeaderProps {
  onOpenSettings: () => void;
  onOpenTeacherMode: () => void;
  onOpenKeyboardRef: () => void;
  onOpenProfileManager: () => void;
  onAddNewStudent: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onOpenSettings,
  onOpenTeacherMode,
  onOpenKeyboardRef,
  onOpenProfileManager,
  onAddNewStudent,
}) => {
  const { activeProfile, profiles, switchProfile } = useProfile();
  const { resolvedTheme, setTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Mode */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100">
                Typing Master Pro
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                Institute Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Offline Hindi & English Typing Tutor
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Virtual Keyboard Quick Viewer */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenKeyboardRef}
            icon={<Eye className="w-4 h-4 text-slate-500" />}
            title="View Layout Keyboard Map"
            className="hidden md:inline-flex"
          >
            Layout Map
          </Button>

          {/* Teacher Mode Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenTeacherMode}
            icon={<GraduationCap className="w-4 h-4 text-purple-600" />}
            className="text-xs"
          >
            Teacher Mode
          </Button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            aria-label="Open settings"
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Profile Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-slate-700 transition-colors"
            >
              <AvatarBadge
                avatarId={activeProfile?.avatar}
                name={activeProfile?.name}
                size="sm"
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                  {activeProfile?.name || 'Student'}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[100px]">
                  {activeProfile?.preferences.language === 'hindi' ? 'Hindi' : 'English'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900 z-50 py-1.5 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Student Profile
                    </p>
                  </div>

                  <div className="max-h-48 overflow-y-auto py-1">
                    {profiles.map((p) => {
                      const isActive = p.id === activeProfile?.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            switchProfile(p.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 font-bold dark:bg-blue-950/40 dark:text-blue-300'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <AvatarBadge avatarId={p.avatar} size="sm" />
                            <span className="truncate">{p.name}</span>
                          </div>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onAddNewStudent();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add New Student
                    </button>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenProfileManager();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                    >
                      <Users className="w-4 h-4" />
                      Manage All Profiles
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
