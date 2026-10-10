import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { AttendanceService } from '@/services/institute/attendanceService';
import { AssignmentService } from '@/services/institute/assignmentService';
import { storageService } from '@/services/storage/storageService';
import { InstituteStudent } from '@/types/institute';

describe('Phase 5: Attendance Registers & Test Assignments', () => {
  const actorTeacher = { id: 'teacher_10', name: 'Instructor Patel', role: 'teacher' as const };

  beforeEach(async () => {
    const adapter = await storageService.getAdapter();
    await adapter.init();
  });

  describe('Attendance Service', () => {
    it('should mark attendance records individually and calculate monthly summary', async () => {
      const studentId = 'stud_att_test_1';

      // Mark 3 days in current month: 2 present, 1 late
      await AttendanceService.markAttendanceRecord(
        {
          date: '2026-10-01',
          batchId: 'batch_test',
          studentId,
          studentName: 'Ananya Sen',
          studentRollNo: 'TMP-ATT-1',
          status: 'present',
        },
        actorTeacher
      );

      await AttendanceService.markAttendanceRecord(
        {
          date: '2026-10-02',
          batchId: 'batch_test',
          studentId,
          studentName: 'Ananya Sen',
          studentRollNo: 'TMP-ATT-1',
          status: 'late',
        },
        actorTeacher
      );

      await AttendanceService.markAttendanceRecord(
        {
          date: '2026-10-03',
          batchId: 'batch_test',
          studentId,
          studentName: 'Ananya Sen',
          studentRollNo: 'TMP-ATT-1',
          status: 'present',
        },
        actorTeacher
      );

      const summary = await AttendanceService.getStudentMonthlyAttendanceSummary(studentId, '2026-10');
      expect(summary.total).toBe(3);
      expect(summary.present).toBe(2);
      expect(summary.late).toBe(1);
      expect(summary.absent).toBe(0);
      expect(summary.percentage).toBeGreaterThan(70);
    });

    it('should mark entire batch present at once', async () => {
      const batchStudents: InstituteStudent[] = [
        {
          id: 's_bulk_1',
          rollNo: 'TMP-B1',
          name: 'Student One',
          batchId: 'batch_bulk',
          courseId: 'c1',
          status: 'active',
          joinDate: '2026-10-10',
          createdAt: 1,
          updatedAt: 1,
        },
        {
          id: 's_bulk_2',
          rollNo: 'TMP-B2',
          name: 'Student Two',
          batchId: 'batch_bulk',
          courseId: 'c1',
          status: 'active',
          joinDate: '2026-10-10',
          createdAt: 1,
          updatedAt: 1,
        },
      ];

      await AttendanceService.markAllBatchPresent('batch_bulk', '2026-10-10', batchStudents, actorTeacher);

      const records = await AttendanceService.getBatchAttendanceForDate('batch_bulk', '2026-10-10');
      expect(records).toHaveLength(2);
      expect(records.every((r) => r.status === 'present')).toBe(true);
    });
  });

  describe('Test Assignment Service', () => {
    it('should create test assignment and manage active status', async () => {
      const assignment = await AssignmentService.createAssignment(
        {
          title: 'CPCT Official Mock Assessment',
          passageId: 'hi_cpct_official_mock',
          passageTitle: 'डिजिटल भारत और ई-गवर्नेंस',
          passageContent: 'डिजिटल भारत एक महत्वाकांक्षी कार्यक्रम है...',
          language: 'Hindi',
          layout: 'Hindi InScript',
          durationMinutes: 15,
          scoringPolicy: 'cpct_hindi',
          backspacePolicy: 'allowed',
          assignedByTeacherId: actorTeacher.id,
          assignedByTeacherName: actorTeacher.name,
          targetType: 'batch',
          targetBatchId: 'batch_bulk',
          dueDate: '2026-10-25',
          minAccuracy: 85,
          minNetWpm: 25,
        },
        actorTeacher
      );

      expect(assignment.id).toBeDefined();
      expect(assignment.status).toBe('active');

      const retrieved = await AssignmentService.getAssignmentById(assignment.id);
      expect(retrieved?.title).toBe('CPCT Official Mock Assessment');

      // Close assignment
      const closed = await AssignmentService.closeAssignment(assignment.id, actorTeacher);
      expect(closed).toBe(true);

      const updated = await AssignmentService.getAssignmentById(assignment.id);
      expect(updated?.status).toBe('closed');
    });
  });
});
