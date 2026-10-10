import { UserRole, InstituteUser, AuthSession } from '@/types/institute';
import { storageService } from '../storage/storageService';
import { CryptoService } from './cryptoService';

export type RbacPermission =
  | 'manage_institute_settings'
  | 'manage_teachers'
  | 'manage_batches'
  | 'manage_students'
  | 'take_attendance'
  | 'assign_tests'
  | 'view_reports'
  | 'export_backup'
  | 'restore_backup'
  | 'view_audit_logs';

const ROLE_PERMISSIONS: Record<UserRole, RbacPermission[]> = {
  admin: [
    'manage_institute_settings',
    'manage_teachers',
    'manage_batches',
    'manage_students',
    'take_attendance',
    'assign_tests',
    'view_reports',
    'export_backup',
    'restore_backup',
    'view_audit_logs',
  ],
  teacher: [
    'manage_students',
    'take_attendance',
    'assign_tests',
    'view_reports',
  ],
};

const SESSION_STORAGE_KEY = 'typing_master_pro_auth_session';

export class RbacService {
  private static currentSession: AuthSession | null = null;

  /**
   * Checks whether a role possesses a specific permission.
   */
  public static hasPermission(role: UserRole, permission: RbacPermission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  /**
   * Authenticates a user using username and password/PIN against salted hashes.
   */
  public static async authenticate(
    username: string,
    secret: string
  ): Promise<{ success: boolean; session?: AuthSession; message?: string }> {
    const adapter = await storageService.getAdapter();
    const user = await adapter.getInstituteUserByUsername(username.trim().toLowerCase());

    if (!user) {
      return { success: false, message: 'Invalid username or credentials.' };
    }

    if (!user.isActive) {
      return { success: false, message: 'This staff account has been deactivated.' };
    }

    const isValid = await CryptoService.verifySecret(secret, user.salt, user.passwordHash);
    if (!isValid) {
      return { success: false, message: 'Invalid password or PIN.' };
    }

    const session: AuthSession = {
      user,
      token: `sess_${Date.now()}_${CryptoService.generateSalt(8)}`,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hour session
      isLocked: false,
    };

    this.currentSession = session;
    this.saveSessionToStorage(session);

    // Update last login
    user.lastLoginAt = Date.now();
    await adapter.saveInstituteUser(user);

    // Audit log
    await adapter.saveAuditLog({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      details: `Successful login as ${user.role}`,
    });

    return { success: true, session };
  }

  /**
   * Quick PIN authentication (for lock screens or quick instructor access).
   */
  public static async authenticateWithPin(
    pin: string
  ): Promise<{ success: boolean; user?: InstituteUser; message?: string }> {
    const adapter = await storageService.getAdapter();
    const settings = await adapter.getInstituteSettings();

    // Check against Institute Master Admin PIN
    if (settings.adminPinHash && settings.adminPinSalt) {
      const isMasterAdmin = await CryptoService.verifySecret(pin, settings.adminPinSalt, settings.adminPinHash);
      if (isMasterAdmin) {
        const adminUser = await adapter.getInstituteUserByUsername('admin');
        if (adminUser) {
          return { success: true, user: adminUser };
        }
      }
    }

    // Check against individual teachers
    const users = await adapter.getInstituteUsers();
    for (const u of users) {
      if (u.isActive) {
        const matches = await CryptoService.verifySecret(pin, u.salt, u.passwordHash);
        if (matches) {
          return { success: true, user: u };
        }
      }
    }

    return { success: false, message: 'Invalid PIN.' };
  }

  public static getCurrentSession(): AuthSession | null {
    if (this.currentSession) {
      if (Date.now() > this.currentSession.expiresAt) {
        this.logout();
        return null;
      }
      return this.currentSession;
    }

    // Attempt recovery from sessionStorage
    this.currentSession = this.loadSessionFromStorage();
    if (this.currentSession && Date.now() > this.currentSession.expiresAt) {
      this.logout();
      return null;
    }
    return this.currentSession;
  }

  public static lockSession(): void {
    if (this.currentSession) {
      this.currentSession.isLocked = true;
      this.saveSessionToStorage(this.currentSession);
    }
  }

  public static async unlockSession(secret: string): Promise<boolean> {
    if (!this.currentSession) return false;
    const isValid = await CryptoService.verifySecret(
      secret,
      this.currentSession.user.salt,
      this.currentSession.user.passwordHash
    );

    if (isValid) {
      this.currentSession.isLocked = false;
      this.saveSessionToStorage(this.currentSession);
      return true;
    }
    return false;
  }

  public static logout(): void {
    this.currentSession = null;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  private static saveSessionToStorage(session: AuthSession): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } catch {
        // Guard
      }
    }
  }

  private static loadSessionFromStorage(): AuthSession | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch {
        // Guard
      }
    }
    return null;
  }
}
