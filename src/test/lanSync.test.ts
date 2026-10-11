import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { lanSyncService } from '@/services/network/lanSyncService';
import { TerminalNode } from '@/types/remington';

describe('Phase 7: LAN Multi-PC Sync Service', () => {
  beforeEach(() => {
    lanSyncService.init();
  });

  afterEach(() => {
    lanSyncService.destroy();
  });

  it('manages terminal role and node identification', () => {
    lanSyncService.setRole('master');
    expect(lanSyncService.getRole()).toBe('master');

    lanSyncService.setRole('node');
    expect(lanSyncService.getRole()).toBe('node');

    const id = lanSyncService.getCurrentTerminalId();
    expect(id).toMatch(/^TERM-/);

    lanSyncService.setTerminalId('TERM-LAB-99');
    expect(lanSyncService.getCurrentTerminalId()).toBe('TERM-LAB-99');
  });

  it('tracks student context and updates live exam progress', () => {
    lanSyncService.setStudentContext({
      id: 'stud_123',
      name: 'Rohan Sharma',
      rollNo: 'ROLL-101',
      batchId: 'batch_morning',
    });

    lanSyncService.updateExamProgress('MP CPCT Test #1', 35, 96, 120, 'in_exam');

    const terminals = lanSyncService.getActiveTerminals();
    const selfNode = terminals.find((t) => t.id === lanSyncService.getCurrentTerminalId());

    expect(selfNode).toBeDefined();
    expect(selfNode?.currentStudentName).toBe('Rohan Sharma');
    expect(selfNode?.currentWpm).toBe(35);
    expect(selfNode?.currentAccuracy).toBe(96);
    expect(selfNode?.status).toBe('in_exam');
  });

  it('subscribes to instructor commands and terminal updates', () => {
    let receivedTerminalsCount = 0;
    const unsub = lanSyncService.subscribeTerminals((terms) => {
      receivedTerminalsCount = terms.length;
    });

    expect(receivedTerminalsCount).toBeGreaterThanOrEqual(1);
    unsub();
  });

  it('reports kiosk violations properly', () => {
    const violation = {
      id: 'viol_1',
      timestamp: Date.now(),
      type: 'tab_switch' as const,
      details: 'Alt+Tab attempted',
    };

    // Should not throw
    expect(() => {
      lanSyncService.reportKioskViolation(violation, 1);
    }).not.toThrow();
  });
});
