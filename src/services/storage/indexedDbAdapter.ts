import { StorageAdapter } from './storageAdapter';
import { StudentProfile, PracticeResult, DailyProgress } from '@/types';

const DB_NAME = 'typing_master_pro_db';
const DB_VERSION = 1;

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
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Check if active profile was this one
    const activeId = await this.getActiveProfileId();
    if (activeId === id) {
      await this.setActiveProfileId(null);
    }
  }

  public async getActiveProfileId(): Promise<string | null> {
    try {
      const store = await this.getStore('app_meta', 'readonly');
      return new Promise<string | null>((resolve) => {
        const request = store.get('active_profile_id');
        request.onsuccess = () => {
          if (request.result && request.result.value) {
            resolve(request.result.value);
          } else {
            // Check fallback to localStorage if needed
            if (typeof window !== 'undefined' && window.localStorage) {
              const localVal = window.localStorage.getItem('tmp_active_profile_id');
              resolve(localVal);
            } else {
              resolve(null);
            }
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  public async setActiveProfileId(id: string | null): Promise<void> {
    try {
      const store = await this.getStore('app_meta', 'readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.put({ key: 'active_profile_id', value: id });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      if (typeof window !== 'undefined' && window.localStorage) {
        if (id) {
          window.localStorage.setItem('tmp_active_profile_id', id);
        } else {
          window.localStorage.removeItem('tmp_active_profile_id');
        }
      }
    } catch {
      // Graceful fallback
      if (typeof window !== 'undefined' && window.localStorage) {
        if (id) {
          window.localStorage.setItem('tmp_active_profile_id', id);
        } else {
          window.localStorage.removeItem('tmp_active_profile_id');
        }
      }
    }
  }

  public async getResults(profileId: string): Promise<PracticeResult[]> {
    try {
      const store = await this.getStore('results', 'readonly');
      const index = store.index('profileId');
      return new Promise<PracticeResult[]>((resolve, reject) => {
        const request = index.getAll(profileId);
        request.onsuccess = () => {
          const results = request.result || [];
          results.sort((a, b) => b.completedAt - a.completedAt);
          resolve(results);
        };
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
    try {
      const store = await this.getStore('daily_progress', 'readonly');
      const key = `${profileId}_${date}`;
      return new Promise<DailyProgress | null>((resolve) => {
        const request = store.get(key);
        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result.data);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  public async saveDailyProgress(progress: DailyProgress): Promise<void> {
    const store = await this.getStore('daily_progress', 'readwrite');
    const key = `${progress.profileId}_${progress.date}`;
    return new Promise<void>((resolve, reject) => {
      const request = store.put({ key, data: progress });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async exportAllData(): Promise<string> {
    const profiles = await this.getProfiles();
    const activeProfileId = await this.getActiveProfileId();
    
    const resultsMap: Record<string, PracticeResult[]> = {};
    for (const p of profiles) {
      resultsMap[p.id] = await this.getResults(p.id);
    }

    const payload = {
      version: 1,
      appName: 'Typing Master Pro',
      exportedAt: Date.now(),
      activeProfileId,
      profiles,
      results: resultsMap,
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

      if (parsed.activeProfileId) {
        await this.setActiveProfileId(parsed.activeProfileId);
      }

      return { success: true, message: `Successfully imported ${count} student profile(s)`, count };
    } catch (err: any) {
      return { success: false, message: `Import error: ${err.message || 'Corrupt JSON'}`, count: 0 };
    }
  }
}
