export interface StoredTimerSession {
  sessionId: string;
  profileId: string;
  startTimestamp: number;
  targetDurationSeconds: number;
  pausedAccumulatedMs: number;
  isPaused: boolean;
  pauseTimestamp: number | null;
  isSubmitted: boolean;
}

export class MonotonicExamTimer {
  private sessionId: string;
  private profileId: string;
  private targetDurationSeconds: number;
  private startTimestamp: number | null = null;
  private pausedAccumulatedMs: number = 0;
  private isPaused: boolean = false;
  private pauseTimestamp: number | null = null;
  private isSubmitted: boolean = false;
  private intervalId: any = null;
  private onTickCallback?: (remainingSeconds: number, elapsedSeconds: number) => void;
  private onExpireCallback?: () => void;

  constructor(
    sessionId: string,
    profileId: string,
    targetDurationSeconds: number,
    onTick?: (remainingSeconds: number, elapsedSeconds: number) => void,
    onExpire?: () => void
  ) {
    this.sessionId = sessionId;
    this.profileId = profileId;
    this.targetDurationSeconds = targetDurationSeconds;
    this.onTickCallback = onTick;
    this.onExpireCallback = onExpire;

    this.restoreFromStorage();
  }

  private getStorageKey(): string {
    return `typing_exam_session_${this.profileId}_${this.sessionId}`;
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    if (!this.startTimestamp) return;

    const data: StoredTimerSession = {
      sessionId: this.sessionId,
      profileId: this.profileId,
      startTimestamp: this.startTimestamp,
      targetDurationSeconds: this.targetDurationSeconds,
      pausedAccumulatedMs: this.pausedAccumulatedMs,
      isPaused: this.isPaused,
      pauseTimestamp: this.pauseTimestamp,
      isSubmitted: this.isSubmitted,
    };

    try {
      window.sessionStorage.setItem(this.getStorageKey(), JSON.stringify(data));
    } catch {
      // Storage quota or privacy mode guard
    }
  }

  private restoreFromStorage(): boolean {
    if (typeof window === 'undefined' || !window.sessionStorage) return false;

    try {
      const raw = window.sessionStorage.getItem(this.getStorageKey());
      if (!raw) return false;

      const data: StoredTimerSession = JSON.parse(raw);
      if (data.sessionId === this.sessionId && data.profileId === this.profileId) {
        this.startTimestamp = data.startTimestamp;
        this.targetDurationSeconds = data.targetDurationSeconds;
        this.pausedAccumulatedMs = data.pausedAccumulatedMs;
        this.isPaused = data.isPaused;
        this.pauseTimestamp = data.pauseTimestamp;
        this.isSubmitted = data.isSubmitted;
        return true;
      }
    } catch {
      // Corrupt storage guard
    }
    return false;
  }

  public start(): void {
    if (this.isSubmitted) return;

    if (!this.startTimestamp) {
      this.startTimestamp = Date.now();
      this.pausedAccumulatedMs = 0;
      this.isPaused = false;
      this.pauseTimestamp = null;
      this.saveToStorage();
    }

    this.startTicker();
  }

  public pause(): void {
    if (this.isPaused || !this.startTimestamp || this.isSubmitted) return;

    this.isPaused = true;
    this.pauseTimestamp = Date.now();
    this.stopTicker();
    this.saveToStorage();
  }

  public resume(): void {
    if (!this.isPaused || !this.pauseTimestamp || this.isSubmitted) return;

    const pauseDuration = Date.now() - this.pauseTimestamp;
    this.pausedAccumulatedMs += Math.max(0, pauseDuration);
    this.isPaused = false;
    this.pauseTimestamp = null;
    this.saveToStorage();
    this.startTicker();
  }

  public getElapsedSeconds(): number {
    if (!this.startTimestamp) return 0;

    let elapsedMs = 0;
    if (this.isPaused && this.pauseTimestamp) {
      elapsedMs = (this.pauseTimestamp - this.startTimestamp) - this.pausedAccumulatedMs;
    } else {
      elapsedMs = (Date.now() - this.startTimestamp) - this.pausedAccumulatedMs;
    }

    return Math.max(0, elapsedMs / 1000);
  }

  public getRemainingSeconds(): number {
    const elapsed = this.getElapsedSeconds();
    return Math.max(0, this.targetDurationSeconds - elapsed);
  }

  public isExpired(): boolean {
    return this.getRemainingSeconds() <= 0;
  }

  /**
   * Atomic check-and-set submission guard to prevent duplicate submissions.
   * Returns true on first submission, false on subsequent attempts.
   */
  public markSubmitted(): boolean {
    if (this.isSubmitted) return false;
    this.isSubmitted = true;
    this.stopTicker();
    this.saveToStorage();
    return true;
  }

  public isAlreadySubmitted(): boolean {
    return this.isSubmitted;
  }

  private startTicker(): void {
    this.stopTicker();

    this.intervalId = setInterval(() => {
      this.tick();
    }, 250);

    // Initial tick
    this.tick();
  }

  private stopTicker(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick(): void {
    if (!this.startTimestamp || this.isPaused || this.isSubmitted) return;

    const remaining = this.getRemainingSeconds();
    const elapsed = this.getElapsedSeconds();

    if (this.onTickCallback) {
      this.onTickCallback(remaining, elapsed);
    }

    if (remaining <= 0) {
      this.stopTicker();
      if (!this.isSubmitted && this.onExpireCallback) {
        this.onExpireCallback();
      }
    }
  }

  /**
   * Called on window focus or visibility change to immediately catch up after tab suspension.
   */
  public handleVisibilityChange(): void {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      this.tick();
    }
  }

  public clearStorage(): void {
    this.stopTicker();
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.removeItem(this.getStorageKey());
      } catch {
        // Guard
      }
    }
  }
}
