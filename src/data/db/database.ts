import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync('gamevault_database');
  await initializeDatabase(dbInstance);
  return dbInstance;
}

async function initializeDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      profilePictureUri TEXT,
      level INTEGER DEFAULT 1,
      tier TEXT DEFAULT 'ROOKIE',
      createdAt INTEGER DEFAULT (strftime('%s','now') * 1000)
    );

    CREATE TABLE IF NOT EXISTS games (
      rawgId INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      coverImageUrl TEXT,
      backgroundImageUrl TEXT,
      description TEXT,
      developer TEXT,
      releaseDate TEXT,
      platforms TEXT,
      genres TEXT,
      storageSize TEXT,
      rating REAL DEFAULT 0,
      userRating REAL DEFAULT 0,
      userNotes TEXT,
      isInCollection INTEGER DEFAULT 0,
      isInWishlist INTEGER DEFAULT 0,
      isPlayed INTEGER DEFAULT 0,
      playStatus TEXT DEFAULT 'NOT_PLAYED',
      addedAt INTEGER DEFAULT (strftime('%s','now') * 1000)
    );

    CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL,
      searchedAt INTEGER DEFAULT (strftime('%s','now') * 1000)
    );
  `);
}

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
}