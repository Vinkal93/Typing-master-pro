import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MonotonicExamTimer } from '@/services/exam/monotonicTimer';

describe('Phase 4: Monotonic Examination Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.clear();
    }
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize and calculate elapsed and remaining time accurately', () => {
    let tickCount = 0;
    let lastRemaining = 0;

    const timer = new MonotonicExamTimer(
      'sess_test_1',
      'stud_test_1',
      60, // 60 seconds
      (rem, elap) => {
        tickCount++;
        lastRemaining = rem;
      }
    );

    expect(timer.getRemainingSeconds()).toBe(60);
    expect(timer.getElapsedSeconds()).toBe(0);
    expect(timer.isExpired()).toBe(false);

    timer.start();

    // Advance by 15 seconds
    vi.advanceTimersByTime(15000);

    expect(timer.getElapsedSeconds()).toBeCloseTo(15, 0);
    expect(timer.getRemainingSeconds()).toBeCloseTo(45, 0);
    expect(tickCount).toBeGreaterThan(0);

    timer.clearStorage();
  });

  it('should handle pause and resume without counting paused time towards elapsed time', () => {
    const timer = new MonotonicExamTimer(
      'sess_test_2',
      'stud_test_2',
      120 // 2 minutes
    );

    timer.start();
    vi.advanceTimersByTime(10000); // 10s running

    timer.pause();
    vi.advanceTimersByTime(30000); // 30s paused - should not count!

    expect(timer.getElapsedSeconds()).toBeCloseTo(10, 0);

    timer.resume();
    vi.advanceTimersByTime(10000); // Another 10s running => total 20s

    expect(timer.getElapsedSeconds()).toBeCloseTo(20, 0);
    expect(timer.getRemainingSeconds()).toBeCloseTo(100, 0);

    timer.clearStorage();
  });

  it('should fire onExpire callback and mark expired when time runs out', () => {
    let expiredFired = false;

    const timer = new MonotonicExamTimer(
      'sess_test_3',
      'stud_test_3',
      10, // 10 seconds
      undefined,
      () => {
        expiredFired = true;
      }
    );

    timer.start();
    expect(timer.isExpired()).toBe(false);

    vi.advanceTimersByTime(10500);

    expect(timer.isExpired()).toBe(true);
    expect(expiredFired).toBe(true);

    timer.clearStorage();
  });

  it('should prevent duplicate submissions with atomic markSubmitted guard', () => {
    const timer = new MonotonicExamTimer(
      'sess_test_4',
      'stud_test_4',
      60
    );

    timer.start();

    // First submission attempt
    const firstSubmit = timer.markSubmitted();
    expect(firstSubmit).toBe(true);
    expect(timer.isAlreadySubmitted()).toBe(true);

    // Second submission attempt (should be rejected)
    const secondSubmit = timer.markSubmitted();
    expect(secondSubmit).toBe(false);

    timer.clearStorage();
  });
});
