import { AuditLogEntry, UserRole } from '@/types/institute';
import { storageService } from '../storage/storageService';

export class AuditService {
  public static async log(
    userId: string,
    userName: string,
    userRole: UserRole,
    action: string,
    details: string,
    targetId?: string
  ): Promise<void> {
    try {
      const adapter = await storageService.getAdapter();
      const settings = await adapter.getInstituteSettings();
      if (!settings.enableAuditLogging) return;

      const entry: AuditLogEntry = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        userId,
        userName,
        userRole,
        action,
        details,
        targetId,
      };

      await adapter.saveAuditLog(entry);
    } catch {
      // Guard against logging failures breaking business operations
    }
  }

  public static async getRecentLogs(limit = 100): Promise<AuditLogEntry[]> {
    const adapter = await storageService.getAdapter();
    return adapter.getAuditLogs(limit);
  }
}
