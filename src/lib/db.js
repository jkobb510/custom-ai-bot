import { openDB } from 'idb';

const DB_NAME = 'chatAppDB';
const STORE_NAME = 'appData';

function isIndexedDBAvailable() {
  return typeof indexedDB !== 'undefined';
}

async function initDB() {
  if (!isIndexedDBAvailable()) {
    return null;
  }

  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function getFromDB(key) {
  const db = await initDB();
  if (!db) return null;
  return db.get(STORE_NAME, key);
}

export async function saveToDB(key, value) {
  const db = await initDB();
  if (!db) return undefined;
  return db.put(STORE_NAME, value, key);
}

export async function deleteFromDB(key) {
  const db = await initDB();
  if (!db) return undefined;
  return db.delete(STORE_NAME, key);
}
