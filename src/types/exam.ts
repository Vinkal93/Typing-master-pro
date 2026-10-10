/**
 * Phase 4: Professional Typing Examination System Domain Types.
 */

export type ExamLanguage = 'Hindi' | 'English';

export type ExamLayout = 'Hindi InScript' | 'English QWERTY';

export type ExamMode = 'practice' | 'strict_exam';

export type BackspacePolicy =
  | 'allowed'                  // Full editing allowed
  | 'restricted_current_word' // Backspace allowed only within current active word
  | 'disabled';               // Backspace strictly locked

export type ScoringPolicyType =
  | 'standard'    // Net WPM = Gross WPM - (Errors / Minutes)
  | 'cpct_hindi'  // MP CPCT: 5 chars = 1 word, half/full error deduction
  | 'ssc_cgl'     // SSC: Word-based accuracy deduction with percentage error cap
  | 'court_exam'  // High Court: Strict mistake penalties (1 wpm deducted per mistake)
  | 'custom';

export type ExamDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'ultra_advanced';

export type ExamDurationMinutes = 1 | 2 | 5 | 10 | 15 | 30 | 60;

export type DiffType = 'correct' | 'substitution' | 'insertion' | 'omission';

export interface SequenceDiffItem {
  type: DiffType;
  expected?: string;
  typed?: string;
  index: number;
}

export interface ScoringDetails {
  grossWpm: number;
  netWpm: number;
  cpm: number;                   // Characters per minute
  accuracy: number;              // 0 to 100 percentage
  totalWordsTyped: number;
  totalExpectedWords: number;
  totalCharsTyped: number;
  totalExpectedChars: number;
  correctChars: number;
  incorrectChars: number;
  omissions: number;             // Skipped words/characters
  insertions: number;            // Extra words/characters typed
  substitutions: number;         // Wrongly replaced words/characters
  backspaceCount: number;
  targetDurationSeconds: number;
  actualDurationSeconds: number;
  completionPercentage: number;  // 0 to 100 percentage
  passed: boolean;
  scoringPolicy: ScoringPolicyType;
  formulaExplanation: string;
  diffSequence: SequenceDiffItem[];
}

export interface ExamPassage {
  id: string;
  title: string;
  titleHindi?: string;
  language: ExamLanguage;
  difficulty: ExamDifficulty;
  text: string;
  wordCount: number;
  characterCount: number;
  isCustomTeacherPassage?: boolean;
  createdBy?: string;
  createdAt?: number;
}

export interface ExamProfilePreset {
  id: string;
  title: string;
  titleHindi: string;
  organization: string;           // e.g. "MP CPCT", "SSC", "High Court", "Institute Standard"
  language: ExamLanguage;
  layout: ExamLayout;
  durationMinutes: ExamDurationMinutes;
  mode: ExamMode;
  backspacePolicy: BackspacePolicy;
  scoringPolicy: ScoringPolicyType;
  minNetWpm: number;
  minAccuracy: number;
  maxErrorPercentage?: number;
  allowVirtualKeyboard: boolean;
  allowSound: boolean;
  description: string;
  officialNotes?: string;
}

export interface ExamAttemptRecord {
  id: string;                    // `${profileId}_exam_${timestamp}`
  profileId: string;
  studentName: string;
  studentRollNo?: string;
  presetId?: string;
  presetTitle: string;
  passageId: string;
  passageTitle: string;
  language: ExamLanguage;
  layout: ExamLayout;
  mode: ExamMode;
  backspacePolicy: BackspacePolicy;
  scoringPolicy: ScoringPolicyType;
  targetDurationSeconds: number;
  actualDurationSeconds: number;
  scoring: ScoringDetails;
  passed: boolean;
  completedAt: number;
  schemaVersion: number;
}

export interface ExamConfig {
  language: ExamLanguage;
  layout: ExamLayout;
  durationMinutes: ExamDurationMinutes;
  mode: ExamMode;
  difficulty: ExamDifficulty;
  passageId?: string;
  customPassageText?: string;
  backspacePolicy: BackspacePolicy;
  scoringPolicy: ScoringPolicyType;
  presetId?: string;
  showVirtualKeyboard: boolean;
  playSound: boolean;
  minNetWpm?: number;
  minAccuracy?: number;
}
