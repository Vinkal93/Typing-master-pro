import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { InstituteService } from '@/services/institute/instituteService';
import { storageService } from '@/services/storage/storageService';

describe('Phase 5: Institute Management Service (Students & Batches)', () => {
  const actorAdmin = { id: 'admin_1', name: 'Institute Admin', role: 'admin' as const };

  beforeEach(async () => {
    const adapter = await storageService.getAdapter();
    await adapter.init();
  });

  describe('Student CRUD & Duplicate Protection', () => {
    it('should add student and prevent duplicate roll numbers', async () => {
      const res1 = await InstituteService.addStudent(
        {
          rollNo: 'TMP-BATCH1-001',
          name: 'Meera Sharma',
          batchId: 'batch_morn_1',
          courseId: 'course_level_1',
          phone: '9876543210',
        },
        actorAdmin
      );

      expect(res1.success).toBe(true);
      expect(res1.student?.name).toBe('Meera Sharma');

      // Attempt adding same roll number
      const resDup = await InstituteService.addStudent(
        {
          rollNo: 'TMP-BATCH1-001',
          name: 'Another Student',
          batchId: 'batch_morn_1',
          courseId: 'course_level_1',
        },
        actorAdmin
      );

      expect(resDup.success).toBe(false);
      expect(resDup.message).toContain('already exists');
    });

    it('should archive and restore student records cleanly', async () => {
      const res = await InstituteService.addStudent(
        {
          rollNo: 'TMP-BATCH1-002',
          name: 'Suresh Raina',
          batchId: 'batch_morn_1',
          courseId: 'course_level_1',
        },
        actorAdmin
      );

      const studentId = res.student!.id;

      // Archive student
      const archived = await InstituteService.archiveStudent(studentId, actorAdmin);
      expect(archived).toBe(true);

      const activeList = await InstituteService.getStudents({ status: 'active' });
      expect(activeList.some((s) => s.id === studentId)).toBe(false);

      const archivedList = await InstituteService.getStudents({ status: 'archived' });
      expect(archivedList.some((s) => s.id === studentId)).toBe(true);

      // Restore student
      const restored = await InstituteService.restoreStudent(studentId, actorAdmin);
      expect(restored).toBe(true);

      const activeAgain = await InstituteService.getStudents({ status: 'active' });
      expect(activeAgain.some((s) => s.id === studentId)).toBe(true);
    });

    it('should parse and export students CSV with UTF-8 BOM', () => {
      const csvData = `RollNo,Name,Phone,Guardian\nTMP-901,Rohit Sharma,9998887770,G. Sharma\nTMP-902,Kavita Devi,9998887771,B. Devi`;
      const parsed = InstituteService.parseStudentsCsv(csvData);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].rollNo).toBe('TMP-901');
      expect(parsed[0].name).toBe('Rohit Sharma');
      expect(parsed[1].name).toBe('Kavita Devi');

      const exported = InstituteService.exportStudentsToCsv(
        [
          {
            id: 's1',
            rollNo: 'TMP-901',
            name: 'Rohit Sharma',
            batchId: 'b1',
            courseId: 'c1',
            status: 'active',
            joinDate: '2026-10-10',
            createdAt: 100,
            updatedAt: 100,
          },
        ],
        []
      );

      expect(exported.startsWith('\uFEFF')).toBe(true);
      expect(exported).toContain('Rohit Sharma');
    });
  });

  describe('Batch & Teacher Management', () => {
    it('should create and update batches with schedules and capacities', async () => {
      const res = await InstituteService.addBatch(
        {
          name: 'CPCT Speed Squad Morning',
          code: 'CPCT-M1',
          shift: 'morning',
          startTime: '08:00 AM',
          endTime: '09:30 AM',
          teacherId: 'teacher_01',
          assignedCourse: 'CPCT Fast Track',
          maxCapacity: 25,
        },
        actorAdmin
      );

      expect(res.success).toBe(true);
      expect(res.batch?.name).toBe('CPCT Speed Squad Morning');
      expect(res.batch?.maxCapacity).toBe(25);

      // Update capacity
      const updateRes = await InstituteService.updateBatch(
        res.batch!.id,
        { maxCapacity: 35 },
        actorAdmin
      );
      expect(updateRes.success).toBe(true);
      expect(updateRes.batch?.maxCapacity).toBe(35);
    });

    it('should compute live institute dashboard statistics', async () => {
      const stats = await InstituteService.getDashboardStats();

      expect(stats).toBeDefined();
      expect(typeof stats.totalStudents).toBe('number');
      expect(typeof stats.activeBatches).toBe('number');
      expect(Array.isArray(stats.recentActivities)).toBe(true);
    });
  });
});
