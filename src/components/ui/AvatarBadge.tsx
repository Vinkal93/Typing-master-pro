'use client';

import React from 'react';
import { GraduationCap, Zap, Keyboard, Star, BookOpen, Award } from 'lucide-react';

export const AVATAR_OPTIONS = [
  { id: 'avatar-scholar', label: 'Scholar', icon: GraduationCap, bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
  { id: 'avatar-speedster', label: 'Speedster', icon: Zap, bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
  { id: 'avatar-keyboard', label: 'Typist', icon: Keyboard, bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
  { id: 'avatar-star', label: 'Champion', icon: Star, bg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' },
  { id: 'avatar-book', label: 'Reader', icon: BookOpen, bg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' },
  { id: 'avatar-award', label: 'Certified', icon: Award, bg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' },
];

interface AvatarBadgeProps {
  avatarId?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({
  avatarId = 'avatar-scholar',
  name = '',
  size = 'md',
  className = '',
}) => {
  const selected = AVATAR_OPTIONS.find((a) => a.id === avatarId) || AVATAR_OPTIONS[0];
  const IconComponent = selected.icon;

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  return (
    <div
      title={name || selected.label}
      className={`inline-flex items-center justify-center rounded-full font-bold transition-transform ${sizeClasses[size]} ${selected.bg} ${className}`}
    >
      <IconComponent className={iconSizes[size]} />
    </div>
  );
};
