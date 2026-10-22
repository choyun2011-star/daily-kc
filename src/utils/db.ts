import { DiaryEntry, WaterLog, UserProfile, FoodItem } from '../types/nutrition';

const DB_NAME = 'DailyKcalDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Diary entries store
      if (!db.objectStoreNames.contains('diary')) {
        const diaryStore = db.createObjectStore('diary', { keyPath: 'id' });
        diaryStore.createIndex('date', 'date', { unique: false });
      }

      // Water logs store
      if (!db.objectStoreNames.contains('water')) {
        const waterStore = db.createObjectStore('water', { keyPath: 'id' });
        waterStore.createIndex('date', 'date', { unique: false });
      }

      // User profile store
      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile', { keyPath: 'id' });
      }

      // Custom foods store
      if (!db.objectStoreNames.contains('customFoods')) {
        db.createObjectStore('customFoods', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

// ---------------- DIARY ENTRIES ----------------

export async function getDiaryEntriesByDate(dateStr: string): Promise<DiaryEntry[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('diary', 'readonly');
      const store = transaction.objectStore('diary');
      const index = store.index('date');
      const request = index.getAll(dateStr);

      request.onsuccess = () => {
        const results = (request.result as DiaryEntry[]) || [];
        // Sort by creation time
        results.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        resolve(results);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to get diary entries from IndexedDB:', error);
    // Fallback to localStorage
    const local = localStorage.getItem(`daily_kcal_diary_${dateStr}`);
    return local ? JSON.parse(local) : [];
  }
}

export async function saveDiaryEntry(entry: DiaryEntry): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('diary', 'readwrite');
      const store = transaction.objectStore('diary');
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to save diary entry to IndexedDB:', error);
  }
}

export async function deleteDiaryEntry(id: string): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('diary', 'readwrite');
      const store = transaction.objectStore('diary');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to delete diary entry:', error);
  }
}

// ---------------- WATER TRACKER ----------------

export async function getWaterLogsByDate(dateStr: string): Promise<WaterLog[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('water', 'readonly');
      const store = transaction.objectStore('water');
      const index = store.index('date');
      const request = index.getAll(dateStr);

      request.onsuccess = () => {
        const results = (request.result as WaterLog[]) || [];
        results.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        resolve(results);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to get water logs:', error);
    return [];
  }
}

export async function saveWaterLog(log: WaterLog): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('water', 'readwrite');
      const store = transaction.objectStore('water');
      const request = store.put(log);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to save water log:', error);
  }
}

export async function deleteWaterLog(id: string): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('water', 'readwrite');
      const store = transaction.objectStore('water');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to delete water log:', error);
  }
}

// ---------------- USER PROFILE ----------------

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('profile', 'readonly');
      const store = transaction.objectStore('profile');
      const request = store.get('user_profile');

      request.onsuccess = () => {
        const result = request.result as UserProfile | undefined;
        if (result) {
          resolve(result);
        } else {
          // Check localStorage fallback
          const local = localStorage.getItem('daily_kcal_profile');
          resolve(local ? JSON.parse(local) : null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to get user profile:', error);
    const local = localStorage.getItem('daily_kcal_profile');
    return local ? JSON.parse(local) : null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('profile', 'readwrite');
      const store = transaction.objectStore('profile');
      const request = store.put(profile);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    // Also mirror to localStorage for quick bootstrap
    localStorage.setItem('daily_kcal_profile', JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save user profile:', error);
    localStorage.setItem('daily_kcal_profile', JSON.stringify(profile));
  }
}

export async function deleteUserProfile(): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('profile', 'readwrite');
      const store = transaction.objectStore('profile');
      const request = store.delete('user_profile');

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    localStorage.removeItem('daily_kcal_profile');
  } catch (error) {
    console.error('Failed to delete profile:', error);
    localStorage.removeItem('daily_kcal_profile');
  }
}

// ---------------- CUSTOM FOODS ----------------

export async function getCustomFoods(): Promise<FoodItem[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('customFoods', 'readonly');
      const store = transaction.objectStore('customFoods');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to get custom foods:', error);
    return [];
  }
}

export async function saveCustomFood(food: FoodItem): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('customFoods', 'readwrite');
      const store = transaction.objectStore('customFoods');
      const request = store.put(food);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to save custom food:', error);
  }
}

export async function deleteCustomFood(id: string): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('customFoods', 'readwrite');
      const store = transaction.objectStore('customFoods');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to delete custom food:', error);
  }
}

// ---------------- BACKUP & DATA PRIVACY ----------------

export async function clearAllUserData(): Promise<void> {
  try {
    const db = await getDB();
    const stores = ['diary', 'water', 'profile', 'customFoods'];
    await Promise.all(
      stores.map(
        (storeName) =>
          new Promise<void>((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const req = store.clear();
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
          })
      )
    );
    localStorage.removeItem('daily_kcal_profile');
  } catch (error) {
    console.error('Failed to clear user data:', error);
  }
}

export async function exportAllData(): Promise<string> {
  try {
    const db = await getDB();
    const getAllFromStore = (name: string): Promise<any[]> =>
      new Promise((res, rej) => {
        const tx = db.transaction(name, 'readonly');
        const st = tx.objectStore(name);
        const rq = st.getAll();
        rq.onsuccess = () => res(rq.result || []);
        rq.onerror = () => rej(rq.error);
      });

    const [diary, water, profile, customFoods] = await Promise.all([
      getAllFromStore('diary'),
      getAllFromStore('water'),
      getAllFromStore('profile'),
      getAllFromStore('customFoods'),
    ]);

    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      appName: 'Daily Kcal',
      data: {
        diary,
        water,
        profile: profile[0] || null,
        customFoods,
      },
    };

    return JSON.stringify(backup, null, 2);
  } catch (error) {
    console.error('Failed to export data:', error);
    throw error;
  }
}

export async function importAllData(jsonString: string): Promise<void> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !parsed.data) {
      throw new Error('Буруу өгөгдлийн формат байна.');
    }

    const { diary = [], water = [], profile = null, customFoods = [] } = parsed.data;

    const db = await getDB();

    // Helper to put array into store
    const putAll = (storeName: string, items: any[]) =>
      new Promise<void>((res, rej) => {
        const tx = db.transaction(storeName, 'readwrite');
        const st = tx.objectStore(storeName);
        items.forEach((item) => st.put(item));
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });

    await putAll('diary', diary);
    await putAll('water', water);
    await putAll('customFoods', customFoods);

    if (profile) {
      await saveUserProfile(profile);
    }
  } catch (error) {
    console.error('Failed to import data:', error);
    throw error;
  }
}
