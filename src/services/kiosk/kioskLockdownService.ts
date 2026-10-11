import { KioskPolicy, KioskViolationRecord, KioskViolationType } from '@/types/remington';
import { storageService } from '../storage/storageService';

export const DEFAULT_KIOSK_POLICY: KioskPolicy = {
  enforceFullscreen: true,
  maxViolationsAllowed: 3,
  autoSubmitOnViolationLimit: true,
  blockAltTab: true,
  blockWindowsKey: true,
  blockContextMenu: true,
  blockClipboard: true,
  requireInstructorUnlockOnBreach: true,
};

export class KioskLockdownService {
  private policy: KioskPolicy;
  private violations: KioskViolationRecord[] = [];
  private onViolationCallback?: (violation: KioskViolationRecord, totalCount: number) => void;
  private onLockdownBreachCallback?: () => void;
  private isActive = false;

  constructor(policy: Partial<KioskPolicy> = {}) {
    this.policy = { ...DEFAULT_KIOSK_POLICY, ...policy };
  }

  /**
   * Activates strict exam kiosk lockdown.
   */
  public activateLockdown(
    onViolation?: (violation: KioskViolationRecord, totalCount: number) => void,
    onLockdownBreach?: () => void
  ): void {
    if (this.isActive) return;
    this.isActive = true;
    this.violations = [];
    this.onViolationCallback = onViolation;
    this.onLockdownBreachCallback = onLockdownBreach;

    // 1. Enter Fullscreen
    if (this.policy.enforceFullscreen && typeof document !== 'undefined') {
      try {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch {
        // Fullscreen API guard
      }
    }

    // 2. Attach security listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('blur', this.handleWindowBlur);
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('keydown', this.handleProhibitedKeyDown, true);
      document.addEventListener('contextmenu', this.handleContextMenu, true);
      document.addEventListener('copy', this.handleClipboardEvent, true);
      document.addEventListener('cut', this.handleClipboardEvent, true);
      document.addEventListener('paste', this.handleClipboardEvent, true);
      document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    }
  }

  /**
   * Deactivates lockdown and cleans up listeners.
   */
  public deactivateLockdown(): void {
    this.isActive = false;

    if (typeof window !== 'undefined') {
      window.removeEventListener('blur', this.handleWindowBlur);
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('keydown', this.handleProhibitedKeyDown, true);
      document.removeEventListener('contextmenu', this.handleContextMenu, true);
      document.removeEventListener('copy', this.handleClipboardEvent, true);
      document.removeEventListener('cut', this.handleClipboardEvent, true);
      document.removeEventListener('paste', this.handleClipboardEvent, true);
      document.removeEventListener('fullscreenchange', this.handleFullscreenChange);

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  public getViolations(): KioskViolationRecord[] {
    return [...this.violations];
  }

  public getViolationCount(): number {
    return this.violations.length;
  }

  public isBreached(): boolean {
    return this.violations.length >= this.policy.maxViolationsAllowed;
  }

  private registerViolation(type: KioskViolationType, details: string): void {
    if (!this.isActive) return;

    const violation: KioskViolationRecord = {
      id: `violation_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      type,
      details,
    };

    this.violations.push(violation);

    if (this.onViolationCallback) {
      this.onViolationCallback(violation, this.violations.length);
    }

    if (this.violations.length >= this.policy.maxViolationsAllowed) {
      if (this.onLockdownBreachCallback) {
        this.onLockdownBreachCallback();
      }
    }
  }

  // --- Handlers ---

  private handleWindowBlur = (): void => {
    this.registerViolation('window_blur', 'Window lost focus / candidate switched applications');
  };

  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.registerViolation('tab_switch', 'Browser tab was switched or minimized');
    }
  };

  private handleFullscreenChange = (): void => {
    if (this.policy.enforceFullscreen && !document.fullscreenElement) {
      this.registerViolation('fullscreen_exit', 'Candidate attempted to exit fullscreen mode');
      // Re-enter fullscreen automatically
      setTimeout(() => {
        if (this.isActive) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      }, 500);
    }
  };

  private handleContextMenu = (e: MouseEvent): void => {
    if (this.policy.blockContextMenu) {
      e.preventDefault();
      this.registerViolation('context_menu_attempt', 'Right click context menu attempt blocked');
    }
  };

  private handleClipboardEvent = (e: ClipboardEvent): void => {
    if (this.policy.blockClipboard) {
      e.preventDefault();
      this.registerViolation('prohibited_key_attempt', 'Clipboard copy/cut/paste attempt blocked');
    }
  };

  private handleProhibitedKeyDown = (e: KeyboardEvent): void => {
    // Intercept Windows Key
    if (e.code === 'MetaLeft' || e.code === 'MetaRight' || e.key === 'Meta') {
      e.preventDefault();
      e.stopPropagation();
      this.registerViolation('prohibited_key_attempt', 'Windows key attempt intercepted');
      return;
    }

    // Intercept Alt+Tab / Alt+F4 / Ctrl+W / Ctrl+T / Ctrl+N / DevTools
    if (
      (e.altKey && (e.code === 'Tab' || e.code === 'F4')) ||
      (e.ctrlKey && ['KeyW', 'KeyN', 'KeyT', 'KeyP', 'KeyS'].includes(e.code)) ||
      (e.ctrlKey && e.shiftKey && ['KeyI', 'KeyJ', 'KeyC'].includes(e.code)) ||
      ['F11', 'F12'].includes(e.code)
    ) {
      e.preventDefault();
      e.stopPropagation();
      this.registerViolation('prohibited_key_attempt', `Prohibited key combo blocked (${e.code})`);
      return;
    }
  };
}
