import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  KioskLockdownService,
  DEFAULT_KIOSK_POLICY,
} from '@/services/kiosk/kioskLockdownService';
import { KioskViolationRecord } from '@/types/remington';

describe('Phase 7: Kiosk Lockdown Service', () => {
  let kiosk: KioskLockdownService;

  beforeEach(() => {
    kiosk = new KioskLockdownService({
      enforceFullscreen: false,
      maxViolationsAllowed: 3,
      blockAltTab: true,
      blockWindowsKey: true,
      blockContextMenu: true,
      blockClipboard: true,
    });
  });

  afterEach(() => {
    kiosk.deactivateLockdown();
  });

  it('initializes with zero violations', () => {
    expect(kiosk.getViolationCount()).toBe(0);
    expect(kiosk.getViolations()).toEqual([]);
    expect(kiosk.isBreached()).toBe(false);
  });

  it('notifies callbacks when violations occur', () => {
    let recordedViolation: KioskViolationRecord | null = null;
    let countReported = 0;

    kiosk.activateLockdown(
      (v, count) => {
        recordedViolation = v;
        countReported = count;
      },
      () => {}
    );

    // Simulate window blur
    window.dispatchEvent(new Event('blur'));

    expect(countReported).toBe(1);
    expect(recordedViolation).not.toBeNull();
    expect((recordedViolation as KioskViolationRecord | null)?.type).toBe('window_blur');
    expect(kiosk.getViolationCount()).toBe(1);
    expect(kiosk.isBreached()).toBe(false);
  });

  it('triggers breach callback when violation limit is reached', () => {
    let breachTriggered = false;

    kiosk.activateLockdown(
      () => {},
      () => {
        breachTriggered = true;
      }
    );

    // Trigger 3 blur events to hit limit of 3
    window.dispatchEvent(new Event('blur'));
    window.dispatchEvent(new Event('blur'));
    window.dispatchEvent(new Event('blur'));

    expect(kiosk.getViolationCount()).toBe(3);
    expect(kiosk.isBreached()).toBe(true);
    expect(breachTriggered).toBe(true);
  });

  it('intercepts prohibited key combinations (Windows Key)', () => {
    let violationType = '';

    kiosk.activateLockdown(
      (v) => {
        violationType = v.type;
      },
      () => {}
    );

    const metaKeyDown = new KeyboardEvent('keydown', {
      code: 'MetaLeft',
      key: 'Meta',
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(metaKeyDown);

    expect(violationType).toBe('prohibited_key_attempt');
    expect(kiosk.getViolationCount()).toBe(1);
  });

  it('cleans up properly on deactivation', () => {
    kiosk.activateLockdown();
    kiosk.deactivateLockdown();

    // After deactivation, events should not increase violation count
    window.dispatchEvent(new Event('blur'));
    expect(kiosk.getViolationCount()).toBe(0);
  });
});
