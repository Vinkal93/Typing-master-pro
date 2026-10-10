'use client';

import React from 'react';
import { Sparkles, Calendar, Keyboard, Type, Target } from 'lucide-react';
import { StudentProfile } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { AvatarBadge } from '@/components/ui/AvatarBadge';
import { KEYBOARD_LAYOUTS } from '@/services/keyboard/keyboardLayouts';

interface WelcomeSectionProps {
  profile: StudentProfile | null;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ profile }) => {
  if (!profile) return null;

  const layoutDef = KEYBOARD_LAYOUTS[profile.preferences.keyboardLayout];
  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Greeting & Student Info */}
        <div className="flex items-start sm:items-center gap-4">
          <AvatarBadge avatarId={profile.avatar} name={profile.name} size="lg" />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Welcome back, {profile.name}!
              </h2>
              {profile.instituteRollNo && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  ID: {profile.instituteRollNo}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{todayFormatted}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Lab Session Active</span>
            </p>
          </div>
        </div>

        {/* Right: Active Settings Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="blue" size="md">
            <Keyboard className="w-3.5 h-3.5" />
            <span>{layoutDef.name}</span>
          </Badge>

          <Badge variant="purple" size="md">
            <Type className="w-3.5 h-3.5" />
            <span>{profile.preferences.fontPreference === 'mangal' ? 'Mangal' : 'Noto Sans'}</span>
          </Badge>

          <Badge variant="gray" size="md">
            <Target className="w-3.5 h-3.5" />
            <span>{profile.preferences.dailyPracticeGoal}m Daily Goal</span>
          </Badge>
        </div>
      </div>
    </div>
  );
};
