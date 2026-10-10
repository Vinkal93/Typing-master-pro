import { InstituteBackupPayload } from '@/types/institute';
import { storageService } from '../storage/storageService';
import { CryptoService } from '../security/cryptoService';
import { AuditService } from './auditService';

export interface RestorePreview {
  isValid: boolean;
  version: number;
  exportedAt: number;
  studentCount: number;
  batchCount: number;
  userCount: number;
  testAssignmentCount: number;
  attendanceCount: number;
  examResultCount: number;
  checksumMatched: boolean;
  errors: string[];
}

export class BackupRestoreService {
  /**
   * Generates a verified institute backup JSON payload with SHA-256 integrity checksum.
   */
  public static async generateInstituteBackup(
    actor: { id: string; name: string; role: any }
  ): Promise<string> {
    const adapter = await storageService.getAdapter();

    const instituteSettings = await adapter.getInstituteSettings();
    const users = await adapter.getInstituteUsers();
    const batches = await adapter.getBatches();
    const students = await adapter.getInstituteStudents();
    const testAssignments = await adapter.getTestAssignments();
    const attendance = await adapter.getAttendanceRecords();
    const auditLogs = await adapter.getAuditLogs(1000);
    const examResults = await adapter.getExamResults();

    const partialPayload = {
      version: 4 as const,
      exportedAt: Date.now(),
      instituteSettings,
      users,
      batches,
      students,
      testAssignments,
      attendance,
      auditLogs,
      examResults,
    };

    const rawData = JSON.stringify(partialPayload);
    const checksum = await CryptoService.computeChecksum(rawData);

    const fullPayload: InstituteBackupPayload = {
      ...partialPayload,
      checksum,
    };

    await AuditService.log(
      actor.id,
      actor.name,
      actor.role,
      'EXPORT_BACKUP',
      `Exported full institute database backup (${students.length} students, ${batches.length} batches)`
    );

    return JSON.stringify(fullPayload, null, 2);
  }

  /**
   * Validates a backup file and inspects its contents to generate a preview before restoration.
   */
  public static async inspectBackupFile(jsonText: string): Promise<RestorePreview> {
    const errors: string[] = [];
    try {
      const parsed: InstituteBackupPayload = JSON.parse(jsonText);

      if (!parsed || typeof parsed !== 'object') {
        return {
          isValid: false,
          version: 0,
          exportedAt: 0,
          studentCount: 0,
          batchCount: 0,
          userCount: 0,
          testAssignmentCount: 0,
          attendanceCount: 0,
          examResultCount: 0,
          checksumMatched: false,
          errors: ['Invalid backup file: not valid JSON format.'],
        };
      }

      if (parsed.version !== 4) {
        errors.push(`Version mismatch: file is version ${parsed.version || 'unknown'}; expected version 4.`);
      }

      // Check integrity checksum
      const { checksum, ...rest } = parsed;
      const computed = await CryptoService.computeChecksum(JSON.stringify(rest));
      const checksumMatched = checksum ? CryptoService.constantTimeCompare(checksum, computed) : false;

      if (!checksumMatched && checksum) {
        errors.push('Integrity warning: Checksum mismatch. File may have been altered or corrupted.');
      }

      return {
        isValid: errors.length === 0 || (errors.length === 1 && !checksumMatched),
        version: parsed.version || 0,
        exportedAt: parsed.exportedAt || 0,
        studentCount: parsed.students ? parsed.students.length : 0,
        batchCount: parsed.batches ? parsed.batches.length : 0,
        userCount: parsed.users ? parsed.users.length : 0,
        testAssignmentCount: parsed.testAssignments ? parsed.testAssignments.length : 0,
        attendanceCount: parsed.attendance ? parsed.attendance.length : 0,
        examResultCount: parsed.examResults ? parsed.examResults.length : 0,
        checksumMatched,
        errors,
      };
    } catch (e: any) {
      return {
        isValid: false,
        version: 0,
        exportedAt: 0,
        studentCount: 0,
        batchCount: 0,
        userCount: 0,
        testAssignmentCount: 0,
        attendanceCount: 0,
        examResultCount: 0,
        checksumMatched: false,
        errors: [`JSON parse failure: ${e.message}`],
      };
    }
  }

  /**
   * Restores institute data with safety safeguards.
   */
  public static async executeRestore(
    jsonText: string,
    actor: { id: string; name: string; role: any }
  ): Promise<{ success: boolean; message: string; count: number }> {
    const preview = await this.inspectBackupFile(jsonText);
    if (!preview.isValid) {
      return {
        success: false,
        message: `Restore aborted: ${preview.errors.join(' ')}`,
        count: 0,
      };
    }

    const adapter = await storageService.getAdapter();
    const res = await adapter.importData(jsonText);

    if (res.success) {
      await AuditService.log(
        actor.id,
        actor.name,
        actor.role,
        'RESTORE_BACKUP',
        `Successfully restored institute backup from date ${new Date(preview.exportedAt).toLocaleDateString()}`
      );
    }

    return res;
  }
}
