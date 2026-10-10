import { StorageAdapter } from './storageAdapter';
import { StudentProfile, PracticeResult, DailyProgress } from '@/types';
import {
  StudentLessonProgress,
  CharacterMistakeStat,
  LmsTeacherSettings,
} from '@/types/lms';

const DB_NAME = 'typing_master_pro_db';
const DB_VERSION = 2; // Upgraded for Phase 3 LMS & Mistake tracking

export class IndexedDBStorageAdapter implements StorageAdapter {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  public async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        // SSR environment or headless without indexedDB
        resolve();
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Profiles Store
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'id' });
        }

        // Practice Results Store
        if (!db.objectStoreNames.contains('results')) {
          const resultsStore = db.createObjectStore('results', { keyPath: 'id' });
          resultsStore.createIndex('profileId', 'profileId', { unique: false });
          resultsStore.createIndex('completedAt', 'completedAt', { unique: false });
        }

        // Daily Progress Store
        if (!db.objectStoreNames.contains('daily_progress')) {
          db.createObjectStore('daily_progress', { keyPath: 'key' });
        }

        // App Metadata Store (e.g., active_profile_id)
        if (!db.objectStoreNames.contains('app_meta')) {
          db.createObjectStore('app_meta', { keyPath: 'key' });
        }

        // Phase 3: LMS Progress Store
        if (!db.objectStoreNames.contains('lms_progress')) {
          const lmsStore = db.createObjectStore('lms_progress', { keyPath: 'id' });
          lmsStore.createIndex('profileId', 'profileId', { unique: false });
        }

        // Phase 3: Mistake Stats Store
        if (!db.objectStoreNames.contains('mistake_stats')) {
          const mistakeStore = db.createObjectStore('mistake_stats', { keyPath: 'id' });
          mistakeStore.createIndex('profileId', 'profileId', { unique: false });
        }

        // Phase 3: Teacher Settings Store
        if (!db.objectStoreNames.contains('teacher_settings')) {
          db.createObjectStore('teacher_settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
      };
    });

    return this.initPromise;
  }

  private async getStore(storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    await this.init();
    if (!this.db) {
      throw new Error('IndexedDB is not available in current environment');
    }
    const tx = this.db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  public async getProfiles(): Promise<StudentProfile[]> {
    try {
      const store = await this.getStore('profiles', 'readonly');
      return new Promise<StudentProfile[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  public async getProfileById(id: string): Promise<StudentProfile | null> {
    try {
      const store = await this.getStore('profiles', 'readonly');
      return new Promise<StudentProfile | null>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }

  public async saveProfile(profile: StudentProfile): Promise<void> {
    const store = await this.getStore('profiles', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.put(profile);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteProfile(id: string): Promise<void> {
    const store = await this.getStore('profiles', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getActiveProfileId(): Promise<string | null> {
    try {
      const store = await this.getStore('app_meta', 'readonly');
      return new Promise<string | null>((resolve, reject) => {
        const request = store.get('active_profile_id');
        request.onsuccess = () => {
          const res = request.result;
          resolve(res ? res.value : null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }

  public async setActiveProfileId(id: string | null): Promise<void> {
    const store = await this.getStore('app_meta', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.put({ key: 'active_profile_id', value: id });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getResults(profileId: string): Promise<PracticeResult[]> {
    try {
      const store = await this.getStore('results', 'readonly');
      const index = store.index('profileId');
      return new Promise<PracticeResult[]>((resolve, reject) => {
        const request = index.getAll(profileId);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  public async saveResult(result: PracticeResult): Promise<void> {
    const store = await this.getStore('results', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.put(result);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getDailyProgress(profileId: string, date: string): Promise<DailyProgress | null> {
    const key = `${profileId}_${date}`;
    try {
      const store = await this.getStore('daily_progress', 'readonly');
      return new Promise<DailyProgress | null>((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => {
          const res = request.result;
          resolve(res ? res.progress : null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }

  public async saveDailyProgress(progress: DailyProgress): Promise<void> {
    const key = `${progress.profileId}_${progress.date}`;
    const store = await this.getStore('daily_progress', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.put({ key, progress });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Phase 3 LMS Methods ---

  public async getLessonProgress(profileId: string): Promise<StudentLessonProgress[]> {
    try {
      const store = await this.getStore('lms_progress', 'readonly');
      const index = store.index('profileId');
      return new Promise<StudentLessonProgress[]>((resolve, reject) => {
        const request = index.getAll(profileId);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  public async getLessonProgressById(profileId: string, lessonId: string): Promise<StudentLessonProgress | null> {
    const key = `${profileId}_${lessonId}`;
    try {
      const store = await this.getStore('lms_progress', 'readonly');
      return new Promise<StudentLessonProgress | null>((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }

  public async saveLessonProgress(progress: StudentLessonProgress): Promise<void> {
    const key = `${progress.profileId}_${progress.lessonId}`;
    const record = { ...progress, id: key };
    const store = await this.getStore('lms_progress', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getMistakeStats(profileId: string): Promise<CharacterMistakeStat[]> {
    try {
      const store = await this.getStore('mistake_stats', 'readonly');
      const index = store.index('profileId');
      return new Promise<CharacterMistakeStat[]>((resolve, reject) => {
        const request = index.getAll(profileId);
        request.onsuccess = () => {
          const raw = request.result || [];
          resolve(raw.map((r: any) => ({
            profileId: r.profileId,
            char: r.char,
            keyCode: r.keyCode,
            errorCount: r.errorCount,
            totalAttempts: r.totalAttempts,
            lastErrorAt: r.lastErrorAt,
          })));
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  public async saveMistakeStats(stats: CharacterMistakeStat[]): Promise<void> {
    if (!stats || stats.length === 0) return;
    const store = await this.getStore('mistake_stats', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      let completed = 0;
      let hasError = false;
      stats.forEach((stat) => {
        const id = `${stat.profileId}_${stat.char}`;
        const req = store.put({ ...stat, id });
        req.onsuccess = () => {
          completed++;
          if (completed === stats.length && !hasError) resolve();
        };
        req.onerror = () => {
          if (!hasError) {
            hasError = true;
            reject(req.error);
          }
        };
      });
    });
  }

  public async getTeacherSettings(): Promise<LmsTeacherSettings> {
    const defaultSettings: LmsTeacherSettings = {
      unlockAllLessons: false,
      customLevelThresholds: {
        1: { minAccuracy: 85, minWpm: 0 },
        2: { minAccuracy: 90, minWpm: 0 },
        3: { minAccuracy: 92, minWpm: 15 },
        4: { minAccuracy: 94, minWpm: 20 },
        5: { minAccuracy: 95, minWpm: 25 },
        6: { minAccuracy: 97, minWpm: 30 },
      },
    };

    try {
      const store = await this.getStore('teacher_settings', 'readonly');
      return new Promise<LmsTeacherSettings>((resolve) => {
        const request = store.get('global_lms_teacher_settings');
        request.onsuccess = () => {
          if (request.result && request.result.settings) {
            resolve(request.result.settings);
          } else {
            resolve(defaultSettings);
          }
        };
        request.onerror = () => resolve(defaultSettings);
      });
    } catch {
      return defaultSettings;
    }
  }

  public async saveTeacherSettings(settings: LmsTeacherSettings): Promise<void> {
    const store = await this.getStore('teacher_settings', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.put({ key: 'global_lms_teacher_settings', settings });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Backup & Migration ---

  public async exportAllData(): Promise<string> {
    const profiles = await this.getProfiles();
    const activeProfileId = await this.getActiveProfileId();

    const resultsMap: Record<string, PracticeResult[]> = {};
    const lmsMap: Record<string, StudentLessonProgress[]> = {};
    const mistakeMap: Record<string, CharacterMistakeStat[]> = {};

    for (const profile of profiles) {
      resultsMap[profile.id] = await this.getResults(profile.id);
      lmsMap[profile.id] = await this.getLessonProgress(profile.id);
      mistakeMap[profile.id] = await this.getMistakeStats(profile.id);
    }

    const teacherSettings = await this.getTeacherSettings();

    const payload = {
      version: 2,
      appName: 'Typing Master Pro',
      exportedAt: Date.now(),
      activeProfileId,
      profiles,
      results: resultsMap,
      lmsProgress: lmsMap,
      mistakeStats: mistakeMap,
      teacherSettings,
    };

    return JSON.stringify(payload, null, 2);
  }

  public async importData(jsonData: string): Promise<{ success: boolean; message: string; count: number }> {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed.profiles || !Array.isArray(parsed.profiles)) {
        return { success: false, message: 'Invalid backup file structure: missing profiles array', count: 0 };
      }

      let count = 0;
      for (const profile of parsed.profiles) {
        if (profile.id && profile.name) {
          await this.saveProfile(profile);
          count++;
        }
      }

      if (parsed.results && typeof parsed.results === 'object') {
        for (const profileId of Object.keys(parsed.results)) {
          const list = parsed.results[profileId];
          if (Array.isArray(list)) {
            for (const item of list) {
              if (item.id && item.profileId) {
                await this.saveResult(item);
              }
            }
          }
        }
      }

      if (parsed.lmsProgress && typeof parsed.lmsProgress === 'object') {
        for (const profileId of Object.keys(parsed.lmsProgress)) {
          const list = parsed.lmsProgress[profileId];
          if (Array.isArray(list)) {
            for (const item of list) {
              if (item.lessonId && item.profileId) {
                await this.saveLessonProgress(item);
              }
            }
          }
        }
      }

      if (parsed.mistakeStats && typeof parsed.mistakeStats === 'object') {
        for (const profileId of Object.keys(parsed.mistakeStats)) {
          const list = parsed.mistakeStats[profileId];
          if (Array.isArray(list) && list.length > 0) {
            await this.saveMistakeStats(list);
          }
        }
      }

      if (parsed.teacherSettings) {
        await this.saveTeacherSettings(parsed.teacherSettings);
      }

      if (parsed.activeProfileId) {
        await this.setActiveProfileId(parsed.activeProfileId);
      }

      return { success: true, message: `Successfully imported ${count} student profile(s) and LMS progress`, count };
    } catch (err: any) {
      return { success: false, message: `Import error: ${err.message || 'Corrupt JSON'}`, count: 0 };
    }
  }
}
