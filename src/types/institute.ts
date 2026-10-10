import { ExamLanguage, ExamLayout, BackspacePolicy, ScoringPolicyType, ExamAttemptRecord } from './exam';

export type UserRole = 'admin' | 'teacher';

export type ShiftType = 'morning' | 'afternoon' | 'evening' | 'custom';

export type AttendanceStatus = 'present' | 'absent' | 'late';

export type StudentStatus = 'active' | 'archived';

export type BatchStatus = 'active' | 'archived';

export type AssignmentStatus = 'active' | 'closed';

export interface InstituteUser {
  id: string;
  username: string; // unique
  name: string;
  role: UserRole;
  passwordHash: string; // Salted PBKDF2/SHA-256 hash (never plaintext)
  salt: string;
  assignedBatchIds: string[]; // Batches assigned to teacher (admin has access to all)
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: number;
  lastLoginAt?: number;
}

export interface AuthSession {
  user: InstituteUser;
  token: string;
  expiresAt: number;
  isLocked: boolean;
}

export interface Batch {
  id: string;
  name: string; // e.g. "Morning CPCT Batch A"
  code: string; // e.g. "M-CPCT-01"
  shift: ShiftType;
  startTime: string; // e.g. "09:00 AM"
  endTime: string; // e.g. "10:30 AM"
  teacherId: string;
  assignedCourse: string; // e.g. "Level 1-6 Master Course" or "CPCT Preparation"
  maxCapacity: number;
  status: BatchStatus;
  createdAt: number;
  notes?: string;
}

export interface InstituteStudent {
  id: string; // Matches StudentProfile.id
  rollNo: string; // Unique Institute Roll Number
  name: string;
  batchId: string;
  courseId: string;
  status: StudentStatus;
  phone?: string;
  guardian?: string;
  joinDate: string; // YYYY-MM-DD
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TestAssignment {
  id: string;
  title: string;
  passageId: string;
  passageTitle: string;
  passageContent: string;
  language: ExamLanguage;
  layout: ExamLayout;
  durationMinutes: number;
  scoringPolicy: ScoringPolicyType;
  backspacePolicy: BackspacePolicy;
  assignedByTeacherId: string;
  assignedByTeacherName: string;
  targetType: 'batch' | 'selected_students';
  targetBatchId?: string;
  targetStudentIds?: string[];
  dueDate: string; // YYYY-MM-DD
  minAccuracy: number;
  minNetWpm: number;
  status: AssignmentStatus;
  createdAt: number;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  batchId: string;
  studentId: string;
  studentName: string;
  studentRollNo: string;
  status: AttendanceStatus;
  markedByTeacherId: string;
  markedAt: number;
  remarks?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  targetId?: string;
}

export interface InstituteSettings {
  instituteName: string;
  instituteCode: string;
  address: string;
  phone: string;
  email: string;
  adminPinHash: string;
  adminPinSalt: string;
  lockTimeoutMinutes: number;
  allowTeacherStudentCreation: boolean;
  enableAuditLogging: boolean;
}

export interface InstituteDashboardStats {
  totalStudents: number;
  activeStudents: number;
  archivedStudents: number;
  totalBatches: number;
  activeBatches: number;
  totalTeachers: number;
  completedLessons: number;
  testsConducted: number;
  averageSpeedWpm: number;
  averageAccuracy: number;
  studentsNeedingAttention: Array<{
    student: InstituteStudent;
    reason: string;
    currentSpeed: number;
    currentAccuracy: number;
  }>;
  recentActivities: AuditLogEntry[];
}

export interface InstituteBackupPayload {
  version: 4;
  exportedAt: number;
  instituteSettings: InstituteSettings;
  users: InstituteUser[];
  batches: Batch[];
  students: InstituteStudent[];
  testAssignments: TestAssignment[];
  attendance: AttendanceRecord[];
  auditLogs: AuditLogEntry[];
  examResults: ExamAttemptRecord[];
  checksum: string;
}
