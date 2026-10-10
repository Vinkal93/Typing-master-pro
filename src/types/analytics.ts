import { ExamLanguage, ExamLayout, ScoringPolicyType, ExamDurationMinutes } from './exam';
import { KeyboardLayout, Language } from './index';

// ================= MODULE 1: STUDENT ANALYTICS TYPES =================

export type AnalyticsDateRange = 'all' | '7days' | '30days' | '90days';

export interface StudentAnalyticsFilter {
  dateRange: AnalyticsDateRange;
  language?: ExamLanguage | 'all';
  layout?: ExamLayout | 'all';
  scoringPolicy?: ScoringPolicyType | 'all';
  durationMinutes?: ExamDurationMinutes | 'all';
}

export interface ProgressTrendPoint {
  date: string; // YYYY-MM-DD
  timestamp: number;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  durationMinutes: number;
  label: string;
}

export interface PersonalRecord {
  title: string;
  metric: string;
  value: number;
  unit: string;
  dateAchieved: string;
  testTitle: string;
}

export interface AggregateAnalyticsResult {
  hasData: boolean;
  totalAttempts: number;
  totalDurationSeconds: number;
  totalPracticeMinutes: number;
  bestGrossWpm: number;
  averageGrossWpm: number;
  bestNetWpm: number;
  averageNetWpm: number;
  bestAccuracy: number;
  averageAccuracy: number;
  completedLessonsCount: number;
  completedExamsCount: number;
  weeklyWpmChangePct: number;
  monthlyWpmChangePct: number;
  personalRecords: PersonalRecord[];
  trends: ProgressTrendPoint[];
}

// ================= MODULE 2: KEYBOARD HEATMAP TYPES =================

export interface KeyHeatmapStat {
  id: string; // `${profileId}_${layout}_${code}`
  profileId: string;
  layout: KeyboardLayout;
  code: string; // Physical event.code (e.g. 'KeyF')
  char: string; // Representative Unicode char (e.g. 'ि' or 'f')
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  accuracyPct: number;
  avgResponseTimeMs: number;
  repeatedMistakes: Record<string, number>; // typedChar -> count
  lastTrainedAt: number;
}

export interface WeakKeyAnalysis {
  code: string;
  char: string;
  layout: KeyboardLayout;
  accuracyPct: number;
  errorRatePct: number;
  totalAttempts: number;
  avgResponseTimeMs: number;
  topConfusions: { expected: string; typed: string; count: number }[];
  severity: 'critical' | 'moderate' | 'mild';
}

// ================= MODULE 3: RECOMMENDATIONS =================

export type RecommendationFocus = 'weak_keys' | 'speed_boost' | 'accuracy_refinement' | 'revision';

export interface PracticeRecommendation {
  id: string;
  profileId: string;
  focus: RecommendationFocus;
  title: string;
  description: string;
  targetKeys: string[];
  targetChars: string[];
  drillText: string;
  recommendedDurationMinutes: number;
  targetAccuracy: number;
  targetWpm: number;
  createdAt: number;
  isCompleted?: boolean;
}

// ================= MODULE 4: ACHIEVEMENTS =================

export type AchievementCategory = 'speed' | 'accuracy' | 'consistency' | 'curriculum' | 'exam' | 'mastery';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface AchievementDefinition {
  id: string;
  code: string;
  title: string;
  titleHindi: string;
  description: string;
  descriptionHindi: string;
  category: AchievementCategory;
  tier: AchievementTier;
  iconName: string; // Lucide icon identifier
  requiredMetric: string;
  threshold: number;
  customizable: boolean;
}

export interface StudentAchievement {
  id: string; // `${profileId}_${achievementCode}`
  profileId: string;
  achievementCode: string;
  achievementTitle: string;
  achievementTitleHindi: string;
  category: AchievementCategory;
  tier: AchievementTier;
  unlockedAt: number;
  metricValueAtUnlock: number;
  viewed: boolean;
}

export interface AchievementMilestoneSettings {
  minSpeedBronze: number;
  minSpeedSilver: number;
  minSpeedGold: number;
  minSpeedPlatinum: number;
  minAccuracySilver: number;
  minAccuracyGold: number;
  streakDaysSilver: number;
  streakDaysGold: number;
  streakDaysPlatinum: number;
  updatedAt: number;
  updatedBy?: string;
}

// ================= MODULE 5 & 6: CERTIFICATE & VERIFICATION =================

export type CertificateGrade = 'A+' | 'A' | 'B' | 'C' | 'Pass';

export type CertificateStatus = 'valid' | 'revoked' | 'suspended';

export type CertificateTemplateType = 'classic_gold' | 'modern_academic' | 'executive';

export interface CertificateRecord {
  id: string; // e.g. "TMP-CERT-2026-XXXXX"
  profileId: string;
  studentName: string;
  studentRollNo?: string;
  batchName?: string;
  instituteName: string;
  instituteAddress?: string;
  courseName: string;
  language: ExamLanguage;
  keyboardLayout: ExamLayout;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  grade: CertificateGrade;
  examAttemptId: string;
  examTitle: string;
  issuedAt: number;
  issuedByTeacherName: string;
  issuedByTeacherId: string;
  authorizedSignatureTitle: string;
  status: CertificateStatus;
  template: CertificateTemplateType;
  digitalSignatureSha256: string; // Cryptographic hash of core credentials
  qrVerificationPayload: string;
  notes?: string;
}

export interface CertificateRevocation {
  certificateId: string;
  revokedAt: number;
  revokedByUserId: string;
  revokedByUserName: string;
  reason: string;
}

export interface CertificateVerificationResult {
  isValid: boolean;
  certificateId: string;
  certificate?: CertificateRecord;
  revocation?: CertificateRevocation;
  isTampered: boolean;
  message: string;
}

// ================= MODULE 7: LEADERBOARD =================

export type LeaderboardMetric = 'speed' | 'accuracy' | 'improved';

export type LeaderboardTimeframe = 'all_time' | 'monthly' | 'weekly';

export interface LeaderboardFilter {
  language: ExamLanguage;
  keyboardLayout: ExamLayout;
  scoringPolicy: ScoringPolicyType;
  durationMinutes: ExamDurationMinutes;
  timeframe: LeaderboardTimeframe;
  metric: LeaderboardMetric;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  rollNo?: string;
  batchName?: string;
  netWpm: number;
  grossWpm: number;
  accuracy: number;
  durationMinutes: number;
  completedAt: number;
  isCurrentUser?: boolean;
}

export interface BatchLeaderboardEntry {
  rank: number;
  batchId: string;
  batchName: string;
  shift: string;
  studentCount: number;
  avgNetWpm: number;
  avgAccuracy: number;
  topWpm: number;
}

// ================= MODULE 8: TEACHER ANALYTICS =================

export interface AtRiskStudent {
  studentId: string;
  studentName: string;
  rollNo: string;
  batchName: string;
  lastActiveDaysAgo: number;
  avgAccuracy: number;
  avgNetWpm: number;
  primaryRiskFactor: 'low_accuracy' | 'low_speed' | 'irregular_attendance' | 'inactivity';
  riskSeverity: 'high' | 'medium';
}

export interface BatchPerformanceAggregate {
  batchId: string;
  batchName: string;
  studentCount: number;
  avgNetWpm: number;
  avgAccuracy: number;
  totalTestsCompleted: number;
  completionRatePct: number;
  topWeakKeys: { char: string; code: string; errorRatePct: number }[];
}

export interface TeacherAnalyticsSummary {
  teacherId: string;
  teacherName: string;
  totalStudents: number;
  totalBatches: number;
  batchAggregates: BatchPerformanceAggregate[];
  atRiskStudents: AtRiskStudent[];
  weakKeysAcrossBatches: { char: string; code: string; failCount: number }[];
  achievementDistribution: Record<string, number>;
}
