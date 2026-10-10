export type Language = 'hindi' | 'english';

export type KeyboardLayout = 'hindi_inscript' | 'remington_gail' | 'english_qwerty';

export type FontPreference = 'mangal' | 'noto_sans_devanagari';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface StudentPreferences {
  language: Language;
  keyboardLayout: KeyboardLayout;
  fontPreference: FontPreference;
  dailyPracticeGoal: number; // in minutes (e.g. 10, 15, 20, 30)
  theme: ThemePreference;
  soundEffects: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  showOnLeaderboard?: boolean;
}

export interface StudentProfile {
  id: string;
  name: string;
  avatar: string; // avatar identifier, e.g. 'avatar-scholar', 'avatar-cap', etc.
  instituteRollNo?: string;
  createdAt: number;
  lastActiveAt: number;
  preferences: StudentPreferences;
}

export interface PracticeResult {
  id: string;
  profileId: string;
  lessonId: string;
  lessonTitle: string;
  layout: KeyboardLayout;
  language: Language;
  completedAt: number;
  durationSeconds: number;
  grossWpm: number;
  netWpm: number;
  accuracy: number; // 0 to 100 percentage
  totalKeyStrokes: number;
  correctKeyStrokes: number;
  errorCount: number;
  backspaceCount: number;
}

export interface DailyProgress {
  profileId: string;
  date: string; // YYYY-MM-DD
  minutesPracticed: number;
  lessonsCompleted: number;
  goalAchieved: boolean;
}

export type LessonCategory =
  | 'home_row'
  | 'top_row'
  | 'bottom_row'
  | 'number_row'
  | 'shift_keys'
  | 'words_sentences'
  | 'speed_drills';

export interface LessonMetadata {
  id: string;
  title: string;
  titleHindi?: string;
  description: string;
  language: Language;
  layout: KeyboardLayout;
  category: LessonCategory;
  order: number;
  keysIntroduced: string[];
  sampleText: string;
  estimatedMinutes: number;
  isComingSoon: boolean;
}

export interface KeyboardKeyDef {
  code: string;
  label: string;
  shiftLabel?: string;
  finger: 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index' | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky' | 'thumb';
  isHomeKey?: boolean;
}
