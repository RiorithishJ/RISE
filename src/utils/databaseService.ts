type AppMode = "jarvis" | "rise";

export type DbRecord = Record<string, unknown> & { id?: string | number; createdAt?: string; updatedAt?: string };
export type DatabaseExport = Record<string, DbRecord[]>;

export const DATABASE_STORES = [
  "fitness_data",
  "github_activities",
  "coding_skills",
  "daily_stats",
  "checklists",
  "notes_journal",
  "ai_news_feed",
  "pomodoro_sessions",
  "linkedin_reminders",
  "user_profile",
  "ai_model_preferences",
  "ui_preferences",
] as const;

const DB_NAME = "RISE_MainDB";
const DB_VERSION = 1;

class DatabaseService {
  private readyPromise: Promise<void>;
  private listeners = new Set<(event: { store: string; type: string }) => void>();

  constructor() {
    this.readyPromise = this.ensureDatabase();
  }

  private isIndexedDBAvailable() {
    return typeof window !== "undefined" && !!window.indexedDB;
  }

  private async ensureDatabase(): Promise<void> {
    if (!this.isIndexedDBAvailable()) return;

    await new Promise<void>((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        DATABASE_STORES.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: "id" });
          }
        });
      };

      request.onsuccess = () => {
        request.result.close();
        resolve();
      };

      request.onerror = () => reject(request.error ?? new Error("Failed to initialize database"));
    });
  }

  private getStorageKey(store: string) {
    return `rise_db_${store}`;
  }

  private emitChange(store: string, type: string) {
    const payload = { store, type };
    this.listeners.forEach((listener) => listener(payload));
    window.dispatchEvent(new CustomEvent("rise-db-change", { detail: payload }));
  }

  subscribe(listener: (event: { store: string; type: string }) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private async withDatabase<T>(callback: (db: IDBDatabase) => Promise<T>): Promise<T> {
    await this.readyPromise;

    if (!this.isIndexedDBAvailable()) {
      throw new Error("IndexedDB is not available in this browser");
    }

    return new Promise<T>((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onsuccess = () => {
        const db = request.result;
        callback(db)
          .then((value) => {
            db.close();
            resolve(value);
          })
          .catch((error) => {
            db.close();
            reject(error);
          });
      };
      request.onerror = () => reject(request.error ?? new Error("Failed to open database"));
    });
  }

  private async fallbackGetAllRecords(store: string): Promise<DbRecord[]> {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(this.getStorageKey(store));
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as DbRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private async fallbackSaveRecord(store: string, data: DbRecord): Promise<DbRecord> {
    const normalized = { ...data, updatedAt: new Date().toISOString() } as DbRecord;
    if (!normalized.id) normalized.id = `auto-${Date.now()}`;
    if (!normalized.createdAt) normalized.createdAt = normalized.updatedAt;

    const records = await this.fallbackGetAllRecords(store);
    const existingIndex = records.findIndex((record) => String(record.id) === String(normalized.id));

    if (existingIndex >= 0) {
      records[existingIndex] = normalized;
    } else {
      records.push(normalized);
    }

    window.localStorage.setItem(this.getStorageKey(store), JSON.stringify(records));
    this.emitChange(store, "save");
    return normalized;
  }

  async getRecord(store: string, id: string | number): Promise<DbRecord | null> {
    if (!this.isIndexedDBAvailable()) {
      const records = await this.fallbackGetAllRecords(store);
      return records.find((record) => String(record.id) === String(id)) ?? null;
    }

    return this.withDatabase(async (db) => {
      return new Promise<DbRecord | null>((resolve, reject) => {
        const transaction = db.transaction(store, "readonly");
        const request = transaction.objectStore(store).get(id);
        request.onsuccess = () => resolve(request.result ?? null);
        request.onerror = () => reject(request.error ?? new Error("Failed to read record"));
      });
    });
  }

  async getAllRecords(store: string): Promise<DbRecord[]> {
    if (!this.isIndexedDBAvailable()) {
      return this.fallbackGetAllRecords(store);
    }

    return this.withDatabase(async (db) => {
      return new Promise<DbRecord[]>((resolve, reject) => {
        const transaction = db.transaction(store, "readonly");
        const request = transaction.objectStore(store).getAll();
        request.onsuccess = () => resolve(request.result ?? []);
        request.onerror = () => reject(request.error ?? new Error("Failed to read records"));
      });
    });
  }

  async saveRecord(store: string, data: DbRecord): Promise<DbRecord> {
    if (!this.isIndexedDBAvailable()) {
      return this.fallbackSaveRecord(store, data);
    }

    const normalized = { ...data, updatedAt: new Date().toISOString() } as DbRecord;
    if (!normalized.id) normalized.id = `auto-${Date.now()}`;
    if (!normalized.createdAt) normalized.createdAt = normalized.updatedAt;

    return this.withDatabase(async (db) => {
      return new Promise<DbRecord>((resolve, reject) => {
        const transaction = db.transaction(store, "readwrite");
        const request = transaction.objectStore(store).put(normalized);
        request.onsuccess = () => {
          this.emitChange(store, "save");
          resolve(normalized);
        };
        request.onerror = () => reject(request.error ?? new Error("Failed to save record"));
      });
    });
  }

  async deleteRecord(store: string, id: string | number): Promise<void> {
    if (!this.isIndexedDBAvailable()) {
      const records = await this.fallbackGetAllRecords(store);
      const next = records.filter((record) => String(record.id) !== String(id));
      window.localStorage.setItem(this.getStorageKey(store), JSON.stringify(next));
      this.emitChange(store, "delete");
      return;
    }

    await this.withDatabase(async (db) => {
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(store, "readwrite");
        const request = transaction.objectStore(store).delete(id);
        request.onsuccess = () => {
          this.emitChange(store, "delete");
          resolve();
        };
        request.onerror = () => reject(request.error ?? new Error("Failed to delete record"));
      });
    });
  }

  async clearStore(store: string): Promise<void> {
    if (!this.isIndexedDBAvailable()) {
      window.localStorage.removeItem(this.getStorageKey(store));
      this.emitChange(store, "clear");
      return;
    }

    await this.withDatabase(async (db) => {
      return new Promise<void>((resolve, reject) => {
        const request = db.transaction(store, "readwrite").objectStore(store).clear();
        request.onsuccess = () => {
          this.emitChange(store, "clear");
          resolve();
        };
        request.onerror = () => reject(request.error ?? new Error("Failed to clear store"));
      });
    });
  }

  async exportDatabase(): Promise<DatabaseExport> {
    const exportPayload: DatabaseExport = {};
    for (const store of DATABASE_STORES) {
      exportPayload[store] = await this.getAllRecords(store);
    }
    return exportPayload;
  }

  async importDatabase(payload: DatabaseExport): Promise<void> {
    if (!payload) return;

    for (const store of DATABASE_STORES) {
      const records = Array.isArray(payload[store]) ? payload[store] : [];
      if (!this.isIndexedDBAvailable()) {
        window.localStorage.setItem(this.getStorageKey(store), JSON.stringify(records));
        continue;
      }

      await this.withDatabase(async (db) => {
        const transaction = db.transaction(store, "readwrite");
        const objectStore = transaction.objectStore(store);
        objectStore.clear();
        records.forEach((record) => objectStore.put(record));
        return true;
      });
    }

    this.emitChange("database", "import");
  }

  async wipeDatabase(): Promise<void> {
    if (this.isIndexedDBAvailable()) {
      await new Promise<void>((resolve, reject) => {
        const request = window.indexedDB.deleteDatabase(DB_NAME);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error ?? new Error("Failed to delete database"));
        request.onblocked = () => resolve();
      });
    }

    Object.keys(window.localStorage).forEach((key) => {
      if (key.startsWith("rise_db_")) window.localStorage.removeItem(key);
    });

    this.emitChange("database", "wipe");
    await this.ensureDatabase();
  }

  async getStats(storeName: string, range: "daily" | "monthly" | "yearly" = "daily") {
    const records = await this.getAllRecords(storeName);
    const now = new Date();
    let filtered = records;

    if (range === "daily") {
      filtered = records.filter((record) => {
        const createdAt = record.createdAt ?? record.updatedAt;
        if (!createdAt) return false;
        return new Date(createdAt).toDateString() === now.toDateString();
      });
    }

    if (range === "monthly") {
      filtered = records.filter((record) => {
        const createdAt = record.createdAt ?? record.updatedAt;
        if (!createdAt) return false;
        return new Date(createdAt).getMonth() === now.getMonth() && new Date(createdAt).getFullYear() === now.getFullYear();
      });
    }

    if (range === "yearly") {
      filtered = records.filter((record) => {
        const createdAt = record.createdAt ?? record.updatedAt;
        if (!createdAt) return false;
        return new Date(createdAt).getFullYear() === now.getFullYear();
      });
    }

    return {
      storeName,
      range,
      count: filtered.length,
      records: filtered,
    };
  }

  async getAppMode(): Promise<AppMode | null> {
    const storedMode = window.localStorage.getItem("appMode");
    return storedMode === "jarvis" || storedMode === "rise" ? storedMode : null;
  }
}

export const databaseService = new DatabaseService();
