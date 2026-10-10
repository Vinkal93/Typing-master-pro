import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { IndexedDBStorageAdapter } from '@/services/storage/indexedDbAdapter';
import { BackupRestoreService } from '@/services/institute/backupRestoreService';

describe('Phase 5: Institute Storage Persistence (IndexedDB v4)', () => {
  let adapter: IndexedDBStorageAdapter;

  beforeEach(async () => {
    adapter = new IndexedDBStorageAdapter();
    await adapter.init();
  });

  it('should seed default administrator and institute settings on fresh DB', async () => {
    const users = await adapter.getInstituteUsers();
    expect(users.length).toBeGreaterThan(0);

    const admin = users.find((u) => u.username === 'admin');
    expect(admin).toBeDefined();
    expect(admin?.role).toBe('admin');
    expect(admin?.passwordHash).toBeDefined();

    const settings = await adapter.getInstituteSettings();
    expect(settings.instituteName).toContain('Typing Master Pro');
    expect(settings.adminPinHash).toBeDefined();
  });

  it('should persist and retrieve institute students, batches, and audit logs', async () => {
    const testStudent = {
      id: 'stud_persist_1',
      rollNo: 'TMP-PERSIST-1',
      name: 'Simran Kaur',
      batchId: 'batch_persist_1',
      courseId: 'course_level_1',
      status: 'active' as const,
      phone: '9876543210',
      guardian: 'H. Kaur',
      joinDate: '2026-10-10',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await adapter.saveInstituteStudent(testStudent);
    const retrievedStudent = await adapter.getInstituteStudentById('stud_persist_1');
    expect(retrievedStudent).not.toBeNull();
    expect(retrievedStudent?.name).toBe('Simran Kaur');

    const testBatch = {
      id: 'batch_persist_1',
      name: 'Evening High Court Special',
      code: 'HC-EV-01',
      shift: 'evening' as const,
      startTime: '05:00 PM',
      endTime: '06:30 PM',
      teacherId: 'teacher_root',
      assignedCourse: 'High Court',
      maxCapacity: 30,
      status: 'active' as const,
      createdAt: Date.now(),
    };

    await adapter.saveBatch(testBatch);
    const retrievedBatch = await adapter.getBatchById('batch_persist_1');
    expect(retrievedBatch?.name).toBe('Evening High Court Special');

    // Audit Log Persistence
    await adapter.saveAuditLog({
      id: 'audit_persist_1',
      timestamp: Date.now(),
      userId: 'user_root',
      userName: 'Admin',
      userRole: 'admin',
      action: 'SYSTEM_CHECK',
      details: 'Persistence verification',
    });

    const logs = await adapter.getAuditLogs(5);
    expect(logs.some((l) => l.action === 'SYSTEM_CHECK')).toBe(true);
  });

  it('should generate verified institute backup with checksum and inspect preview', async () => {
    const actor = { id: 'admin_test', name: 'Tester Admin', role: 'admin' as const };
    const backupJson = await BackupRestoreService.generateInstituteBackup(actor);

    expect(backupJson).toBeDefined();
    const parsed = JSON.parse(backupJson);
    expect(parsed.version).toBe(4);
    expect(parsed.checksum).toBeDefined();

    // Inspect preview
    const preview = await BackupRestoreService.inspectBackupFile(backupJson);
    expect(preview.isValid).toBe(true);
    expect(preview.version).toBe(4);
    expect(preview.checksumMatched).toBe(true);
    expect(preview.errors).toHaveLength(0);
  });
});
