import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { RbacService } from '@/services/security/rbacService';
import { storageService } from '@/services/storage/storageService';
import { CryptoService } from '@/services/security/cryptoService';
import { InstituteUser } from '@/types/institute';

describe('Phase 5: Role-Based Access Control & Sessions', () => {
  beforeEach(async () => {
    RbacService.logout();
    const adapter = await storageService.getAdapter();
    await adapter.init();
  });

  it('should verify role permissions matrix correctly', () => {
    // Admin has full permissions
    expect(RbacService.hasPermission('admin', 'manage_institute_settings')).toBe(true);
    expect(RbacService.hasPermission('admin', 'manage_teachers')).toBe(true);
    expect(RbacService.hasPermission('admin', 'export_backup')).toBe(true);
    expect(RbacService.hasPermission('admin', 'view_audit_logs')).toBe(true);

    // Teacher has scoped permissions
    expect(RbacService.hasPermission('teacher', 'manage_students')).toBe(true);
    expect(RbacService.hasPermission('teacher', 'take_attendance')).toBe(true);
    expect(RbacService.hasPermission('teacher', 'assign_tests')).toBe(true);

    // Teacher cannot access institute settings or backups
    expect(RbacService.hasPermission('teacher', 'manage_institute_settings')).toBe(false);
    expect(RbacService.hasPermission('teacher', 'manage_teachers')).toBe(false);
    expect(RbacService.hasPermission('teacher', 'export_backup')).toBe(false);
    expect(RbacService.hasPermission('teacher', 'restore_backup')).toBe(false);
  });

  it('should authenticate user with salted hash and manage session locking', async () => {
    const adapter = await storageService.getAdapter();
    const salt = CryptoService.generateSalt();
    const passwordHash = await CryptoService.hashSecret('teacherPass99', salt);

    const testTeacher: InstituteUser = {
      id: 'teacher_test_01',
      username: 'verma_sir',
      name: 'R. K. Verma',
      role: 'teacher',
      passwordHash,
      salt,
      assignedBatchIds: ['batch_01'],
      isActive: true,
      createdAt: Date.now(),
    };

    await adapter.saveInstituteUser(testTeacher);

    // Successful authentication
    const authSuccess = await RbacService.authenticate('verma_sir', 'teacherPass99');
    expect(authSuccess.success).toBe(true);
    expect(authSuccess.session).toBeDefined();
    expect(authSuccess.session?.user.username).toBe('verma_sir');
    expect(authSuccess.session?.isLocked).toBe(false);

    // Failed authentication
    const authFail = await RbacService.authenticate('verma_sir', 'wrongPassword');
    expect(authFail.success).toBe(false);

    // Session Locking
    RbacService.lockSession();
    expect(RbacService.getCurrentSession()?.isLocked).toBe(true);

    // Unlock Session
    const unlockFail = await RbacService.unlockSession('wrongUnlock');
    expect(unlockFail).toBe(false);
    expect(RbacService.getCurrentSession()?.isLocked).toBe(true);

    const unlockOk = await RbacService.unlockSession('teacherPass99');
    expect(unlockOk).toBe(true);
    expect(RbacService.getCurrentSession()?.isLocked).toBe(false);

    // Logout
    RbacService.logout();
    expect(RbacService.getCurrentSession()).toBeNull();
  });
});
