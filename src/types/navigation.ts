import { LucideIcon } from 'lucide-react';

export type NavigationSectionId = 'main' | 'tools' | 'institute' | 'system';

export type NavigationItemId =
  | 'dashboard'
  | 'lms'
  | 'practice'
  | 'exam'
  | 'analytics'
  | 'heatmap'
  | 'recommendations'
  | 'achievements'
  | 'certificates'
  | 'leaderboard'
  | 'character_learning'
  | 'word_builder'
  | 'virtual_keyboard'
  | 'hindi_inscript'
  | 'remington_gail'
  | 'remington'
  | 'english_qwerty'
  | 'institute'
  | 'settings'
  | 'help_guide'
  | 'profile_manager';

export interface NavigationItemDef {
  id: NavigationItemId;
  label: string;
  labelHindi?: string;
  icon: LucideIcon;
  section: NavigationSectionId;
  badge?: string;
  badgeColor?: 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'gray';
  shortcut?: string;
  isExternalOrModal?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  id?: NavigationItemId;
  active?: boolean;
}
