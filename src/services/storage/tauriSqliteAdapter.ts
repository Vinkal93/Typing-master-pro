import { StorageAdapter } from './storageAdapter';
import { IndexedDBStorageAdapter } from './indexedDbAdapter';
import { StudentProfile, PracticeResult, DailyProgress } from '@/types';

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
        completedAt INTEGER NOT NULL,
        durationSeconds REAL NOT NULL,
        grossWpm REAL NOT NULL,
        netWpm REAL NOT NULL,
        accuracy REAL NOT NULL,
        totalKeyStrokes INTEGER NOT NULL,
        correctKeyStrokes INTEGER NOT NULL,
        errorCount INTEGER NOT NULL,
        backspaceCount INTEGER NOT NULL
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
      } catch (err) {
        console.warn('SQLite save error, fallback to IndexedDB:', err);
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
        const activeId = await this.getActiveProfileId();
        if (activeId === id) {
          await this.setActiveProfileId(null);
        }
        return;
      } catch (err) {
        console.warn('SQLite delete error, fallback to IndexedDB:', err);
      }
    }
    return this.fallbackAdapter.deleteProfile(id);
  }

  public async getActiveProfileId(): Promise<string | null> {
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        const rows: any[] = await this.sqliteDb.select("SELECT value FROM app_meta WHERE key = 'active_profile_id'");
        return rows.length > 0 ? rows[0].value : null;
      } catch {
        return this.fallbackAdapter.getActiveProfileId();
      }
    }
    return this.fallbackAdapter.getActiveProfileId();
  }

  public async setActiveProfileId(id: string | null): Promise<void> {
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        await this.sqliteDb.execute(
          "INSERT OR REPLACE INTO app_meta (key, value) VALUES ('active_profile_id', $1)",
          [id]
        );
      } catch (err) {
        console.warn('SQLite setActiveProfileId error:', err);
      }
    }
    return this.fallbackAdapter.setActiveProfileId(id);
  }

  public async getResults(profileId: string): Promise<PracticeResult[]> {
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        const rows: any[] = await this.sqliteDb.select(
          'SELECT * FROM results WHERE profileId = $1 ORDER BY completedAt DESC',
          [profileId]
        );
        return rows as PracticeResult[];
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
          `INSERT OR REPLACE INTO results (id, profileId, lessonId, lessonTitle, layout, language, completedAt, durationSeconds, grossWpm, netWpm, accuracy, totalKeyStrokes, correctKeyStrokes, errorCount, backspaceCount)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            result.id,
            result.profileId,
            result.lessonId,
            result.lessonTitle,
            result.layout,
            result.language,
            result.completedAt,
            result.durationSeconds,
            result.grossWpm,
            result.netWpm,
            result.accuracy,
            result.totalKeyStrokes,
            result.correctKeyStrokes,
            result.errorCount,
            result.backspaceCount,
          ]
        );
        return;
      } catch (err) {
        console.warn('SQLite saveResult error:', err);
      }
    }
    return this.fallbackAdapter.saveResult(result);
  }

  public async getDailyProgress(profileId: string, date: string): Promise<DailyProgress | null> {
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        const key = `${profileId}_${date}`;
        const rows: any[] = await this.sqliteDb.select(
          'SELECT * FROM daily_progress WHERE key = $1',
          [key]
        );
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
    if (this.isTauriAvailable && this.sqliteDb) {
      try {
        const key = `${progress.profileId}_${progress.date}`;
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
      } catch (err) {
        console.warn('SQLite saveDailyProgress error:', err);
      }
    }
    return this.fallbackAdapter.saveDailyProgress(progress);
  }

  public async exportAllData(): Promise<string> {
    return this.fallbackAdapter.exportAllData();
  }

  public async importData(jsonData: string): Promise<{ success: boolean; message: string; count: number }> {
    return this.fallbackAdapter.importData(jsonData);
  }
}
