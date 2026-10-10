import { StorageAdapter } from './storageAdapter';
import { StudentProfile, PracticeResult, DailyProgress } from '@/types';
import {
  StudentLessonProgress,
  CharacterMistakeStat,
  LmsTeacherSettings,
} from '@/types/lms';
import { ExamAttemptRecord, ExamPassage } from '@/types/exam';
import {
  InstituteUser,
  Batch,
  InstituteStudent,
  TestAssignment,
  AttendanceRecord,
  AuditLogEntry,
  InstituteSettings,
} from '@/types/institute';
import { CryptoService } from '../security/cryptoService';

const DB_NAME = 'typing_master_pro_db';
const DB_VERSION = 4; // Upgraded for Phase 5 Teacher Admin & Institute Management

export class IndexedDBStorageAdapter implements StorageAdapter {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  public async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        resolve();
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Phase 1 Stores
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('results')) {
          const resultsStore = db.createObjectStore('results', { keyPath: 'id' });
          resultsStore.createIndex('profileId', 'profileId', { unique: false });
          resultsStore.createIndex('completedAt', 'completedAt', { unique: false });
        }
        if (!db.objectStoreNames.contains('daily_progress')) {
          db.createObjectStore('daily_progress', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('app_meta')) {
          db.createObjectStore('app_meta', { keyPath: 'key' });
        }

        // Phase 3 LMS Stores
        if (!db.objectStoreNames.contains('lms_progress')) {
          const lmsStore = db.createObjectStore('lms_progress', { keyPath: 'id' });
          lmsStore.createIndex('profileId', 'profileId', { unique: false });
        }
        if (!db.objectStoreNames.contains('mistake_stats')) {
          const mistakeStore = db.createObjectStore('mistake_stats', { keyPath: 'id' });
          mistakeStore.createIndex('profileId', 'profileId', { unique: false });
        }
        if (!db.objectStoreNames.contains('teacher_settings')) {
          db.createObjectStore('teacher_settings', { keyPath: 'key' });
        }

        // Phase 4 Examination Stores
        if (!db.objectStoreNames.contains('exam_results')) {
          const examStore = db.createObjectStore('exam_results', { keyPath: 'id' });
          examStore.createIndex('profileId', 'profileId', { unique: false });
          examStore.createIndex('completedAt', 'completedAt', { unique: false });
        }
        if (!db.objectStoreNames.contains('custom_passages')) {
          db.createObjectStore('custom_passages', { keyPath: 'id' });
        }

        // Phase 5 Institute Stores
        if (!db.objectStoreNames.contains('institute_users')) {
          const userStore = db.createObjectStore('institute_users', { keyPath: 'id' });
          userStore.createIndex('username', 'username', { unique: true });
        }
        if (!db.objectStoreNames.contains('batches')) {
          const batchStore = db.createObjectStore('batches', { keyPath: 'id' });
          batchStore.createIndex('status', 'status', { unique: false });
        }
        if (!db.objectStoreNames.contains('institute_students')) {
          const studentStore = db.createObjectStore('institute_students', { keyPath: 'id' });
          studentStore.createIndex('rollNo', 'rollNo', { unique: true });
          studentStore.createIndex('batchId', 'batchId', { unique: false });
          studentStore.createIndex('status', 'status', { unique: false });
        }
        if (!db.objectStoreNames.contains('test_assignments')) {
          const assignStore = db.createObjectStore('test_assignments', { keyPath: 'id' });
          assignStore.createIndex('status', 'status', { unique: false });
        }
        if (!db.objectStoreNames.contains('attendance')) {
          const attStore = db.createObjectStore('attendance', { keyPath: 'id' });
          attStore.createIndex('batchId', 'batchId', { unique: false });
          attStore.createIndex('date', 'date', { unique: false });
          attStore.createIndex('studentId', 'studentId', { unique: false });
        }
        if (!db.objectStoreNames.contains('audit_logs')) {
          const auditStore = db.createObjectStore('audit_logs', { keyPath: 'id' });
          auditStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains('institute_settings')) {
          db.createObjectStore('institute_settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = async () => {
        this.db = request.result;
        try {
          await this.seedDefaultsIfNeeded();
        } catch {
          // Guard
        }
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.initPromise;
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    await this.init();
    if (!this.db) {
      throw new Error('IndexedDB is not available or initialized');
    }
    const tx = this.db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  /**
   * Initializes default administrator and institute settings if database is freshly created.
   */
  private async seedDefaultsIfNeeded(): Promise<void> {
    const users = await this.getInstituteUsers();
    if (users.length === 0) {
      const salt = CryptoService.generateSalt();
      const passwordHash = await CryptoService.hashSecret('admin123', salt);
      const defaultAdmin: InstituteUser = {
        id: 'user_admin_root',
        username: 'admin',
        name: 'Institute Administrator',
        role: 'admin',
        passwordHash,
        salt,
        assignedBatchIds: [],
        isActive: true,
        createdAt: Date.now(),
      };
      await this.saveInstituteUser(defaultAdmin);
    }

    const settings = await this.getInstituteSettings();
    if (!settings.instituteName) {
      const pinSalt = CryptoService.generateSalt();
      const pinHash = await CryptoService.hashSecret('123456', pinSalt);
      const defaultSettings: InstituteSettings = {
        instituteName: 'Typing Master Pro — Central Computer Institute',
        instituteCode: 'TMP-INST-001',
        address: 'Computer Education Complex, Main Campus',
        phone: '+91 98765 43210',
        email: 'admin@typingmasterpro.local',
        adminPinHash: pinHash,
        adminPinSalt: pinSalt,
        lockTimeoutMinutes: 15,
        allowTeacherStudentCreation: true,
        enableAuditLogging: true,
      };
      await this.saveInstituteSettings(defaultSettings);
    }
  }

  // --- Profile Methods ---

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

  // --- Active Profile ID ---

  public async getActiveProfileId(): Promise<string | null> {
    try {
      const store = await this.getStore('app_meta', 'readonly');
      return new Promise<string | null>((resolve) => {
        const request = store.get('active_profile_id');
        request.onsuccess = () => resolve(request.result ? request.result.value : null);
        request.onerror = () => resolve(null);
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

  // --- Practice Results ---

  public async getResults(profileId: string): Promise<PracticeResult[]> {
    try {
      const store = await this.getStore('results', 'readonly');
      const index = store.index('profileId');
      return new Promise<PracticeResult[]>((resolve, reject) => {
        const request = index.getAll(profileId);
        request.onsuccess = () => {
          const list: PracticeResult[] = request.result || [];
          list.sort((a, b) => b.completedAt - a.completedAt);
          resolve(list);
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

  // --- Daily Progress ---

  public async getDailyProgress(profileId: string, date: string): Promise<DailyProgress | null> {
    try {
      const store = await this.getStore('daily_progress', 'readonly');
      const key = `${profileId}_${date}`;
      return new Promise<DailyProgress | null>((resolve) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result ? request.result.data : null);
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

  // --- Phase 3: LMS Methods ---

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
    try {
      const store = await this.getStore('lms_progress', 'readonly');
      const id = `${profileId}_${lessonId}`;
      return new Promise<StudentLessonProgress | null>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }

  public async saveLessonProgress(progress: StudentLessonProgress): Promise<void> {
    const store = await this.getStore('lms_progress', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.put(progress);
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
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  public async saveMistakeStats(stats: CharacterMistakeStat[]): Promise<void> {
    const store = await this.getStore('mistake_stats', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const tx = store.transaction;
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      for (const item of stats) {
        const record = {
          ...item,
          id: `${item.profileId}_${item.keyCode}_${item.char}`,
        };
        store.put(record);
      }
    });
  }

  public async getTeacherSettings(): Promise<LmsTeacherSettings> {
    const defaultSettings: LmsTeacherSettings = {
      unlockAllLessons: false,
      customLevelThresholds: {
        1: { minAccuracy: 85, minWpm: 0 },
        2: { minAccuracy: 90, minWpm: 10 },
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

  // --- Phase 4: Examination Methods ---

  public async getExamResults(profileId?: string): Promise<ExamAttemptRecord[]> {
    try {
      const store = await this.getStore('exam_results', 'readonly');
      if (profileId) {
        const index = store.index('profileId');
        return new Promise<ExamAttemptRecord[]>((resolve, reject) => {
          const request = index.getAll(profileId);
          request.onsuccess = () => {
            const list: ExamAttemptRecord[] = request.result || [];
            list.sort((a, b) => b.completedAt - a.completedAt);
            resolve(list);
          };
          request.onerror = () => reject(request.error);
        });
      } else {
        return new Promise<ExamAttemptRecord[]>((resolve, reject) => {
          const request = store.getAll();
          request.onsuccess = () => {
            const list: ExamAttemptRecord[] = request.result || [];
            list.sort((a, b) => b.completedAt - a.completedAt);
            resolve(list);
          };
          request.onerror = () => reject(request.error);
        });
      }
    } catch {
      return [];
    }
  }

  public async getExamResultById(id: string): Promise<ExamAttemptRecord | null> {
    try {
      const store = await this.getStore('exam_results', 'readonly');
      return new Promise<ExamAttemptRecord | null>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }

  public async saveExamResult(record: ExamAttemptRecord): Promise<void> {
    const store = await this.getStore('exam_results', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getCustomPassages(): Promise<ExamPassage[]> {
    try {
      const store = await this.getStore('custom_passages', 'readonly');
      return new Promise<ExamPassage[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  public async saveCustomPassage(passage: ExamPassage): Promise<void> {
    const store = await this.getStore('custom_passages', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.put(passage);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteCustomPassage(id: string): Promise<void> {
    const store = await this.getStore('custom_passages', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Phase 5: Institute & RBAC Methods ---

  public async getInstituteUsers(): Promise<InstituteUser[]> {
    try {
      const store = await this.getStore('institute_users', 'readonly');
      return new Promise<InstituteUser[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  public async getInstituteUserById(id: string): Promise<InstituteUser | null> {
    try {
      const store = await this.getStore('institute_users', 'readonly');
      return new Promise<InstituteUser | null>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }

  public async getInstituteUserByUsername(username: string): Promise<InstituteUser | null> {
    try {
      const store = await this.getStore('institute_users', 'readonly');
      const index = store.index('username');
      return new Promise<InstituteUser | null>((resolve, reject) => {
        const request = index.get(username);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }

  public async saveInstituteUser(user: InstituteUser): Promise<void> {
    const store = await this.getStore('institute_users', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.put(user);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteInstituteUser(id: string): Promise<void> {
    const store = await this.getStore('institute_users', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getBatches(): Promise<Batch[]> {
    try {
      const store = await this.getStore('batches', 'readonly');
      return new Promise<Batch[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const list: Batch[] = request.result || [];
          list.sort((a, b) => b.createdAt - a.createdAt);
          resolve(list);
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  public async getBatchById(id: string): Promise<Batch | null> {
    try {
      const store = await this.getStore('batches', 'readonly');
      return new Promise<Batch | null>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }

  public async saveBatch(batch: Batch): Promise<void> {
    const store = await this.getStore('batches', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.put(batch);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteBatch(id: string): Promise<void> {
    const store = await this.getStore('batches', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getInstituteStudents(): Promise<InstituteStudent[]> {
    try {
      const store = await this.getStore('institute_students', 'readonly');
      return new Promise<InstituteStudent[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const list: InstituteStudent[] = request.result || [];
          list.sort((a, b) => a.rollNo.localeCompare(b.rollNo));
          resolve(list);
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  public async getInstituteStudentById(id: string): Promise<InstituteStudent | null> {
    try {
      const store = await this.getStore('institute_students', 'readonly');
      return new Promise<InstituteStudent | null>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }

  public async getInstituteStudentByRollNo(rollNo: string): Promise<InstituteStudent | null> {
    try {
      const store = await this.getStore('institute_students', 'readonly');
      const index = store.index('rollNo');
      return new Promise<InstituteStudent | null>((resolve, reject) => {
        const request = index.get(rollNo);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }

  public async saveInstituteStudent(student: InstituteStudent): Promise<void> {
    const store = await this.getStore('institute_students', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.put(student);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteInstituteStudent(id: string): Promise<void> {
    const store = await this.getStore('institute_students', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getTestAssignments(): Promise<TestAssignment[]> {
    try {
      const store = await this.getStore('test_assignments', 'readonly');
      return new Promise<TestAssignment[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const list: TestAssignment[] = request.result || [];
          list.sort((a, b) => b.createdAt - a.createdAt);
          resolve(list);
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  public async getTestAssignmentById(id: string): Promise<TestAssignment | null> {
    try {
      const store = await this.getStore('test_assignments', 'readonly');
      return new Promise<TestAssignment | null>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }

  public async saveTestAssignment(assignment: TestAssignment): Promise<void> {
    const store = await this.getStore('test_assignments', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.put(assignment);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteTestAssignment(id: string): Promise<void> {
    const store = await this.getStore('test_assignments', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getAttendanceRecords(batchId?: string, date?: string): Promise<AttendanceRecord[]> {
    try {
      const store = await this.getStore('attendance', 'readonly');
      return new Promise<AttendanceRecord[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          let list: AttendanceRecord[] = request.result || [];
          if (batchId) {
            list = list.filter((r) => r.batchId === batchId);
          }
          if (date) {
            list = list.filter((r) => r.date === date);
          }
          resolve(list);
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  public async saveAttendanceRecord(record: AttendanceRecord): Promise<void> {
    const store = await this.getStore('attendance', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async saveAttendanceBatch(records: AttendanceRecord[]): Promise<void> {
    const store = await this.getStore('attendance', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const tx = store.transaction;
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      for (const rec of records) {
        store.put(rec);
      }
    });
  }

  public async getAuditLogs(limit = 100): Promise<AuditLogEntry[]> {
    try {
      const store = await this.getStore('audit_logs', 'readonly');
      return new Promise<AuditLogEntry[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const list: AuditLogEntry[] = request.result || [];
          list.sort((a, b) => b.timestamp - a.timestamp);
          resolve(list.slice(0, limit));
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  public async saveAuditLog(entry: AuditLogEntry): Promise<void> {
    const store = await this.getStore('audit_logs', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getInstituteSettings(): Promise<InstituteSettings> {
    const defaultSettings: InstituteSettings = {
      instituteName: 'Typing Master Pro — Central Computer Institute',
      instituteCode: 'TMP-INST-001',
      address: 'Computer Education Complex, Main Campus',
      phone: '+91 98765 43210',
      email: 'admin@typingmasterpro.local',
      adminPinHash: '',
      adminPinSalt: '',
      lockTimeoutMinutes: 15,
      allowTeacherStudentCreation: true,
      enableAuditLogging: true,
    };

    try {
      const store = await this.getStore('institute_settings', 'readonly');
      return new Promise<InstituteSettings>((resolve) => {
        const request = store.get('global_institute_settings');
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

  public async saveInstituteSettings(settings: InstituteSettings): Promise<void> {
    const store = await this.getStore('institute_settings', 'readwrite');
    return new Promise<void>((resolve, reject) => {
      const request = store.put({ key: 'global_institute_settings', settings });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Backup & Migration ---

  public async exportAllData(): Promise<string> {
    const profiles = await this.getProfiles();
    const activeProfileId = await this.getActiveProfileId();
    const teacherSettings = await this.getTeacherSettings();
    const instituteSettings = await this.getInstituteSettings();
    const customPassages = await this.getCustomPassages();
    const users = await this.getInstituteUsers();
    const batches = await this.getBatches();
    const students = await this.getInstituteStudents();
    const testAssignments = await this.getTestAssignments();
    const attendance = await this.getAttendanceRecords();
    const auditLogs = await this.getAuditLogs(500);

    const results: Record<string, PracticeResult[]> = {};
    const lmsProgress: Record<string, StudentLessonProgress[]> = {};
    const mistakeStats: Record<string, CharacterMistakeStat[]> = {};
    const examResults: Record<string, ExamAttemptRecord[]> = {};

    for (const p of profiles) {
      results[p.id] = await this.getResults(p.id);
      lmsProgress[p.id] = await this.getLessonProgress(p.id);
      mistakeStats[p.id] = await this.getMistakeStats(p.id);
      examResults[p.id] = await this.getExamResults(p.id);
    }

    const payload = {
      version: 4,
      exportedAt: Date.now(),
      profiles,
      activeProfileId,
      results,
      lmsProgress,
      mistakeStats,
      examResults,
      customPassages,
      teacherSettings,
      instituteSettings,
      users,
      batches,
      students,
      testAssignments,
      attendance,
      auditLogs,
    };

    return JSON.stringify(payload, null, 2);
  }

  public async importData(jsonData: string): Promise<{ success: boolean; message: string; count: number }> {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed || !parsed.profiles || !Array.isArray(parsed.profiles)) {
        return { success: false, message: 'Invalid backup format: missing profiles array', count: 0 };
      }

      let count = 0;
      for (const p of parsed.profiles) {
        if (p.id && p.name && p.preferences) {
          await this.saveProfile(p);
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
              if (item.id && item.profileId && item.lessonId) {
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

      if (parsed.examResults && typeof parsed.examResults === 'object') {
        for (const profileId of Object.keys(parsed.examResults)) {
          const list = parsed.examResults[profileId];
          if (Array.isArray(list)) {
            for (const item of list) {
              if (item.id && item.profileId) {
                await this.saveExamResult(item);
              }
            }
          }
        }
      }

      if (parsed.customPassages && Array.isArray(parsed.customPassages)) {
        for (const passage of parsed.customPassages) {
          if (passage.id) {
            await this.saveCustomPassage(passage);
          }
        }
      }

      if (parsed.teacherSettings) {
        await this.saveTeacherSettings(parsed.teacherSettings);
      }

      if (parsed.instituteSettings) {
        await this.saveInstituteSettings(parsed.instituteSettings);
      }

      if (parsed.users && Array.isArray(parsed.users)) {
        for (const u of parsed.users) {
          if (u.id && u.username) {
            await this.saveInstituteUser(u);
          }
        }
      }

      if (parsed.batches && Array.isArray(parsed.batches)) {
        for (const b of parsed.batches) {
          if (b.id && b.name) {
            await this.saveBatch(b);
          }
        }
      }

      if (parsed.students && Array.isArray(parsed.students)) {
        for (const s of parsed.students) {
          if (s.id && s.rollNo) {
            await this.saveInstituteStudent(s);
          }
        }
      }

      if (parsed.testAssignments && Array.isArray(parsed.testAssignments)) {
        for (const t of parsed.testAssignments) {
          if (t.id && t.title) {
            await this.saveTestAssignment(t);
          }
        }
      }

      if (parsed.attendance && Array.isArray(parsed.attendance)) {
        for (const a of parsed.attendance) {
          if (a.id && a.date) {
            await this.saveAttendanceRecord(a);
          }
        }
      }

      if (parsed.activeProfileId) {
        await this.setActiveProfileId(parsed.activeProfileId);
      }

      return {
        success: true,
        message: `Successfully restored ${count} profile(s) and institute datasets`,
        count,
      };
    } catch (err: any) {
      return { success: false, message: `Import error: ${err.message || 'Corrupt JSON'}`, count: 0 };
    }
  }
}
