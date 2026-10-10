import { StudentProfile, PracticeResult, DailyProgress } from '@/types';
import {
  StudentLessonProgress,
  CharacterMistakeStat,
  LmsTeacherSettings,
} from '@/types/lms';
import { ExamAttemptRecord, ExamPassage } from '@/types/exam';
import {
  InstituteUser,
  Batch,
  InstituteStudent,
  TestAssignment,
  AttendanceRecord,
  AuditLogEntry,
  InstituteSettings,
} from '@/types/institute';

export interface StorageAdapter {
  init(): Promise<void>;

  // Profile Management
  getProfiles(): Promise<StudentProfile[]>;
  getProfileById(id: string): Promise<StudentProfile | null>;
  saveProfile(profile: StudentProfile): Promise<void>;
  deleteProfile(id: string): Promise<void>;

  // Active Profile Tracking
  getActiveProfileId(): Promise<string | null>;
  setActiveProfileId(id: string | null): Promise<void>;

  // Practice Results
  getResults(profileId: string): Promise<PracticeResult[]>;
  saveResult(result: PracticeResult): Promise<void>;

  // Daily Progress
  getDailyProgress(profileId: string, date: string): Promise<DailyProgress | null>;
  saveDailyProgress(progress: DailyProgress): Promise<void>;

  // Phase 3: LMS Progress & Mistake Tracking
  getLessonProgress(profileId: string): Promise<StudentLessonProgress[]>;
  getLessonProgressById(profileId: string, lessonId: string): Promise<StudentLessonProgress | null>;
  saveLessonProgress(progress: StudentLessonProgress): Promise<void>;
  getMistakeStats(profileId: string): Promise<CharacterMistakeStat[]>;
  saveMistakeStats(stats: CharacterMistakeStat[]): Promise<void>;
  getTeacherSettings(): Promise<LmsTeacherSettings>;
  saveTeacherSettings(settings: LmsTeacherSettings): Promise<void>;

  // Phase 4: Examination System
  getExamResults(profileId?: string): Promise<ExamAttemptRecord[]>;
  getExamResultById(id: string): Promise<ExamAttemptRecord | null>;
  saveExamResult(record: ExamAttemptRecord): Promise<void>;
  getCustomPassages(): Promise<ExamPassage[]>;
  saveCustomPassage(passage: ExamPassage): Promise<void>;
  deleteCustomPassage(id: string): Promise<void>;

  // Phase 5: Institute Management & RBAC
  getInstituteUsers(): Promise<InstituteUser[]>;
  getInstituteUserById(id: string): Promise<InstituteUser | null>;
  getInstituteUserByUsername(username: string): Promise<InstituteUser | null>;
  saveInstituteUser(user: InstituteUser): Promise<void>;
  deleteInstituteUser(id: string): Promise<void>;

  getBatches(): Promise<Batch[]>;
  getBatchById(id: string): Promise<Batch | null>;
  saveBatch(batch: Batch): Promise<void>;
  deleteBatch(id: string): Promise<void>;

  getInstituteStudents(): Promise<InstituteStudent[]>;
  getInstituteStudentById(id: string): Promise<InstituteStudent | null>;
  getInstituteStudentByRollNo(rollNo: string): Promise<InstituteStudent | null>;
  saveInstituteStudent(student: InstituteStudent): Promise<void>;
  deleteInstituteStudent(id: string): Promise<void>;

  getTestAssignments(): Promise<TestAssignment[]>;
  getTestAssignmentById(id: string): Promise<TestAssignment | null>;
  saveTestAssignment(assignment: TestAssignment): Promise<void>;
  deleteTestAssignment(id: string): Promise<void>;

  getAttendanceRecords(batchId?: string, date?: string): Promise<AttendanceRecord[]>;
  saveAttendanceRecord(record: AttendanceRecord): Promise<void>;
  saveAttendanceBatch(records: AttendanceRecord[]): Promise<void>;

  getAuditLogs(limit?: number): Promise<AuditLogEntry[]>;
  saveAuditLog(entry: AuditLogEntry): Promise<void>;

  getInstituteSettings(): Promise<InstituteSettings>;
  saveInstituteSettings(settings: InstituteSettings): Promise<void>;

  // Backup & Migration
  exportAllData(): Promise<string>;
  importData(jsonData: string): Promise<{ success: boolean; message: string; count: number }>;
}
