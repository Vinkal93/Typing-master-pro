import { StorageAdapter } from './storageAdapter';
import { TauriSQLiteStorageAdapter } from './tauriSqliteAdapter';

class StorageService {
  private adapter: StorageAdapter | null = null;
  private isInitialized = false;

  public async getAdapter(): Promise<StorageAdapter> {
    if (!this.adapter) {
      this.adapter = new TauriSQLiteStorageAdapter();
    }
    if (!this.isInitialized) {
      await this.adapter.init();
      this.isInitialized = true;
    }
    return this.adapter;
  }
}

export const storageService = new StorageService();
