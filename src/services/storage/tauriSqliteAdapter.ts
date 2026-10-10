import { StorageAdapter } from './storageAdapter';
import { IndexedDBStorageAdapter } from './indexedDbAdapter';
import { StudentProfile, PracticeResult, DailyProgress } from '@/types';
import {
  StudentLessonProgress,
  CharacterMistakeStat,
  LmsTeacherSettings,
} from '@/types/lms';

/**
 * Tauri SQLite Storage Adapter.
 * When running in desktop environment with Tauri SQLite plugin, persists to local SQLite database.
 * Gracefully delegates to IndexedDBStorageAdapter in web/browser or development environments.
 */
export class TauriSQLiteStorageAdapter implements StorageAdapter {
  private fallbackAdapter: IndexedDBStorageAdapter;
  private isTauriAvailable = false;
  private sqliteDb: any = null;

  constructor() {
    this.fallbackAdapter = new IndexedDBStorageAdapter();
  }

  public async init(): Promise<void> {
    // Check if running inside Tauri desktop runtime
    if (typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window)) {
      try {
        // Attempt dynamic import of Tauri SQL plugin
        const Database = (await import('@tauri-apps/plugin-sql')).default;
        if (Database && typeof Database.load === 'function') {
          this.sqliteDb = await Database.load('sqlite:typing_master_pro.db');
          await this.initTables();
          this.isTauriAvailable = true;
          return;
        }
      } catch (err) {
        console.warn('Tauri SQL plugin not loaded; defaulting to IndexedDB:', err);
      }
    }

    // Default to IndexedDB
    await this.fallbackAdapter.init();
  }

  private async initTables(): Promise<void> {
    if (!this.sqliteDb) return;
    await this.sqliteDb.execute(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        avatar TEXT NOT NULL,
        instituteRollNo TEXT,
        createdAt INTEGER NOT NULL,
        lastActiveAt INTEGER NOT NULL,
        preferences TEXT NOT NULL
      );
    `);
    await this.sqliteDb.execute(`
      CREATE TABLE IF NOT EXISTS results (
        id TEXT PRIMARY KEY,
        profileId TEXT NOT NULL,
        lessonId TEXT NOT NULL,
        lessonTitle TEXT NOT NULL,
        layout TEXT NOT NULL,
        language TEXT NOT NULL,
        grossWpm REAL NOT NULL,
        netWpm REAL NOT NULL,
        accuracy REAL NOT NULL,
        errorCount INTEGER NOT NULL,
        durationSeconds REAL NOT NULL,
        completedAt INTEGER NOT NULL
      );
    `);
    await this.sqliteDb.execute(`
      CREATE TABLE IF NOT EXISTS daily_progress (
        key TEXT PRIMARY KEY,
        profileId TEXT NOT NULL,
        date TEXT NOT NULL,
        minutesPracticed REAL NOT NULL,
        lessonsCompleted INTEGER NOT NULL,
        goalAchieved INTEGER NOT NULL
      );
    `);
    await this.sqliteDb.execute(`
      CREATE TABLE IF NOT EXISTS app_meta (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
    // Phase 3 tables
    await this.sqliteDb.execute(`
      CREATE TABLE IF NOT EXISTS lms_progress (
        id TEXT PRIMARY KEY,
        profileId TEXT NOT NULL,
        lessonId TEXT NOT NULL,
        levelId INTEGER NOT NULL,
        isUnlocked INTEGER NOT NULL,
        isCompleted INTEGER NOT NULL,
        stageReached TEXT NOT NULL,
        bestAccuracy REAL NOT NULL,
        bestNetWpm REAL NOT NULL,
        attemptsCount INTEGER NOT NULL,
        lastAttemptAt INTEGER NOT NULL,
        completedAt INTEGER
      );
    `);
    await this.sqliteDb.execute(`
      CREATE TABLE IF NOT EXISTS mistake_stats (
        id TEXT PRIMARY KEY,
        profileId TEXT NOT NULL,
        char TEXT NOT NULL,
        keyCode TEXT NOT NULL,
        errorCount INTEGER NOT NULL,
        totalAttempts INTEGER NOT NULL,
        lastErrorAt INTEGER NOT NULL
      );
    `);
    await this.sqliteDb.execute(`
      CREATE TABLE IF NOT EXISTS teacher_settings (
        key TEXT PRIMARY KEY,
        settingsJson TEXT NOT NULL
      );
    `);
  }

  public async getProfiles(): Promise<StudentProfile[]> {
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        const rows: any[] = await this.sqliteDb.select('SELECT * FROM profiles ORDER BY lastActiveAt DESC');
        return rows.map((r) => ({
          id: r.id,
          name: r.name,
          avatar: r.avatar,
          instituteRollNo: r.instituteRollNo || undefined,
          createdAt: r.createdAt,
          lastActiveAt: r.lastActiveAt,
          preferences: JSON.parse(r.preferences),
        }));
      } catch {
        return this.fallbackAdapter.getProfiles();
      }
    }
    return this.fallbackAdapter.getProfiles();
  }

  public async getProfileById(id: string): Promise<StudentProfile | null> {
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        const rows: any[] = await this.sqliteDb.select('SELECT * FROM profiles WHERE id = $1 LIMIT 1', [id]);
        if (rows.length === 0) return null;
        const r = rows[0];
        return {
          id: r.id,
          name: r.name,
          avatar: r.avatar,
          instituteRollNo: r.instituteRollNo || undefined,
          createdAt: r.createdAt,
          lastActiveAt: r.lastActiveAt,
          preferences: JSON.parse(r.preferences),
        };
      } catch {
        return this.fallbackAdapter.getProfileById(id);
      }
    }
    return this.fallbackAdapter.getProfileById(id);
  }

  public async saveProfile(profile: StudentProfile): Promise<void> {
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        await this.sqliteDb.execute(
          `INSERT OR REPLACE INTO profiles (id, name, avatar, instituteRollNo, createdAt, lastActiveAt, preferences)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            profile.id,
            profile.name,
            profile.avatar,
            profile.instituteRollNo || null,
            profile.createdAt,
            profile.lastActiveAt,
            JSON.stringify(profile.preferences),
          ]
        );
        return;
      } catch {
        // Fall back to IDB
      }
    }
    return this.fallbackAdapter.saveProfile(profile);
  }

  public async deleteProfile(id: string): Promise<void> {
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        await this.sqliteDb.execute('DELETE FROM profiles WHERE id = $1', [id]);
        await this.sqliteDb.execute('DELETE FROM results WHERE profileId = $1', [id]);
        await this.sqliteDb.execute('DELETE FROM daily_progress WHERE profileId = $1', [id]);
        await this.sqliteDb.execute('DELETE FROM lms_progress WHERE profileId = $1', [id]);
        await this.sqliteDb.execute('DELETE FROM mistake_stats WHERE profileId = $1', [id]);
        return;
      } catch {
        // Fall back
      }
    }
    return this.fallbackAdapter.deleteProfile(id);
  }

  public async getActiveProfileId(): Promise<string | null> {
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        const rows: any[] = await this.sqliteDb.select('SELECT value FROM app_meta WHERE key = $1', ['active_profile_id']);
        if (rows.length > 0 && rows[0].value) {
          return rows[0].value;
        }
        return null;
      } catch {
        return this.fallbackAdapter.getActiveProfileId();
      }
    }
    return this.fallbackAdapter.getActiveProfileId();
  }

  public async setActiveProfileId(id: string | null): Promise<void> {
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        await this.sqliteDb.execute('INSERT OR REPLACE INTO app_meta (key, value) VALUES ($1, $2)', ['active_profile_id', id]);
        return;
      } catch {
        // Fall back
      }
    }
    return this.fallbackAdapter.setActiveProfileId(id);
  }

  public async getResults(profileId: string): Promise<PracticeResult[]> {
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        const rows: any[] = await this.sqliteDb.select('SELECT * FROM results WHERE profileId = $1 ORDER BY completedAt DESC', [profileId]);
        return rows.map((r) => ({
          id: r.id,
          profileId: r.profileId,
          lessonId: r.lessonId,
          lessonTitle: r.lessonTitle,
          layout: r.layout,
          language: r.language,
          grossWpm: r.grossWpm,
          netWpm: r.netWpm,
          accuracy: r.accuracy,
          errorCount: r.errorCount,
          durationSeconds: r.durationSeconds,
          completedAt: r.completedAt,
        }));
      } catch {
        return this.fallbackAdapter.getResults(profileId);
      }
    }
    return this.fallbackAdapter.getResults(profileId);
  }

  public async saveResult(result: PracticeResult): Promise<void> {
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        await this.sqliteDb.execute(
          `INSERT OR REPLACE INTO results (id, profileId, lessonId, lessonTitle, layout, language, grossWpm, netWpm, accuracy, errorCount, durationSeconds, completedAt)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            result.id,
            result.profileId,
            result.lessonId,
            result.lessonTitle,
            result.layout,
            result.language,
            result.grossWpm,
            result.netWpm,
            result.accuracy,
            result.errorCount,
            result.durationSeconds,
            result.completedAt,
          ]
        );
        return;
      } catch {
        // Fall back
      }
    }
    return this.fallbackAdapter.saveResult(result);
  }

  public async getDailyProgress(profileId: string, date: string): Promise<DailyProgress | null> {
    const key = `${profileId}_${date}`;
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        const rows: any[] = await this.sqliteDb.select('SELECT * FROM daily_progress WHERE key = $1', [key]);
        if (rows.length === 0) return null;
        const r = rows[0];
        return {
          profileId: r.profileId,
          date: r.date,
          minutesPracticed: r.minutesPracticed,
          lessonsCompleted: r.lessonsCompleted,
          goalAchieved: Boolean(r.goalAchieved),
        };
      } catch {
        return this.fallbackAdapter.getDailyProgress(profileId, date);
      }
    }
    return this.fallbackAdapter.getDailyProgress(profileId, date);
  }

  public async saveDailyProgress(progress: DailyProgress): Promise<void> {
    const key = `${progress.profileId}_${progress.date}`;
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        await this.sqliteDb.execute(
          `INSERT OR REPLACE INTO daily_progress (key, profileId, date, minutesPracticed, lessonsCompleted, goalAchieved)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            key,
            progress.profileId,
            progress.date,
            progress.minutesPracticed,
            progress.lessonsCompleted,
            progress.goalAchieved ? 1 : 0,
          ]
        );
        return;
      } catch {
        // Fall back
      }
    }
    return this.fallbackAdapter.saveDailyProgress(progress);
  }

  // --- Phase 3 LMS Methods ---

  public async getLessonProgress(profileId: string): Promise<StudentLessonProgress[]> {
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        const rows: any[] = await this.sqliteDb.select('SELECT * FROM lms_progress WHERE profileId = $1', [profileId]);
        return rows.map((r) => ({
          id: r.id,
          profileId: r.profileId,
          lessonId: r.lessonId,
          levelId: r.levelId,
          isUnlocked: Boolean(r.isUnlocked),
          isCompleted: Boolean(r.isCompleted),
          stageReached: r.stageReached,
          bestAccuracy: r.bestAccuracy,
          bestNetWpm: r.bestNetWpm,
          attemptsCount: r.attemptsCount,
          lastAttemptAt: r.lastAttemptAt,
          completedAt: r.completedAt || undefined,
        }));
      } catch {
        return this.fallbackAdapter.getLessonProgress(profileId);
      }
    }
    return this.fallbackAdapter.getLessonProgress(profileId);
  }

  public async getLessonProgressById(profileId: string, lessonId: string): Promise<StudentLessonProgress | null> {
    const id = `${profileId}_${lessonId}`;
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        const rows: any[] = await this.sqliteDb.select('SELECT * FROM lms_progress WHERE id = $1 LIMIT 1', [id]);
        if (rows.length === 0) return null;
        const r = rows[0];
        return {
          id: r.id,
          profileId: r.profileId,
          lessonId: r.lessonId,
          levelId: r.levelId,
          isUnlocked: Boolean(r.isUnlocked),
          isCompleted: Boolean(r.isCompleted),
          stageReached: r.stageReached,
          bestAccuracy: r.bestAccuracy,
          bestNetWpm: r.bestNetWpm,
          attemptsCount: r.attemptsCount,
          lastAttemptAt: r.lastAttemptAt,
          completedAt: r.completedAt || undefined,
        };
      } catch {
        return this.fallbackAdapter.getLessonProgressById(profileId, lessonId);
      }
    }
    return this.fallbackAdapter.getLessonProgressById(profileId, lessonId);
  }

  public async saveLessonProgress(progress: StudentLessonProgress): Promise<void> {
    const id = progress.id || `${progress.profileId}_${progress.lessonId}`;
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        await this.sqliteDb.execute(
          `INSERT OR REPLACE INTO lms_progress (id, profileId, lessonId, levelId, isUnlocked, isCompleted, stageReached, bestAccuracy, bestNetWpm, attemptsCount, lastAttemptAt, completedAt)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            id,
            progress.profileId,
            progress.lessonId,
            progress.levelId,
            progress.isUnlocked ? 1 : 0,
            progress.isCompleted ? 1 : 0,
            progress.stageReached,
            progress.bestAccuracy,
            progress.bestNetWpm,
            progress.attemptsCount,
            progress.lastAttemptAt,
            progress.completedAt || null,
          ]
        );
        return;
      } catch {
        // Fall back
      }
    }
    return this.fallbackAdapter.saveLessonProgress(progress);
  }

  public async getMistakeStats(profileId: string): Promise<CharacterMistakeStat[]> {
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        const rows: any[] = await this.sqliteDb.select('SELECT * FROM mistake_stats WHERE profileId = $1', [profileId]);
        return rows.map((r) => ({
          profileId: r.profileId,
          char: r.char,
          keyCode: r.keyCode,
          errorCount: r.errorCount,
          totalAttempts: r.totalAttempts,
          lastErrorAt: r.lastErrorAt,
        }));
      } catch {
        return this.fallbackAdapter.getMistakeStats(profileId);
      }
    }
    return this.fallbackAdapter.getMistakeStats(profileId);
  }

  public async saveMistakeStats(stats: CharacterMistakeStat[]): Promise<void> {
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        for (const s of stats) {
          const id = `${s.profileId}_${s.char}`;
          await this.sqliteDb.execute(
            `INSERT OR REPLACE INTO mistake_stats (id, profileId, char, keyCode, errorCount, totalAttempts, lastErrorAt)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [id, s.profileId, s.char, s.keyCode, s.errorCount, s.totalAttempts, s.lastErrorAt]
          );
        }
        return;
      } catch {
        // Fall back
      }
    }
    return this.fallbackAdapter.saveMistakeStats(stats);
  }

  public async getTeacherSettings(): Promise<LmsTeacherSettings> {
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        const rows: any[] = await this.sqliteDb.select('SELECT settingsJson FROM teacher_settings WHERE key = $1', ['global_lms_teacher_settings']);
        if (rows.length > 0 && rows[0].settingsJson) {
          return JSON.parse(rows[0].settingsJson);
        }
      } catch {
        return this.fallbackAdapter.getTeacherSettings();
      }
    }
    return this.fallbackAdapter.getTeacherSettings();
  }

  public async saveTeacherSettings(settings: LmsTeacherSettings): Promise<void> {
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        await this.sqliteDb.execute(
          'INSERT OR REPLACE INTO teacher_settings (key, settingsJson) VALUES ($1, $2)',
          ['global_lms_teacher_settings', JSON.stringify(settings)]
        );
        return;
      } catch {
        // Fall back
      }
    }
    return this.fallbackAdapter.saveTeacherSettings(settings);
  }

  public async exportAllData(): Promise<string> {
    return this.fallbackAdapter.exportAllData();
  }

  public async importData(jsonData: string): Promise<{ success: boolean; message: string; count: number }> {
    return this.fallbackAdapter.importData(jsonData);
  }
}
