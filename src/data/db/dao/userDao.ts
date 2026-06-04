import { SQLiteDatabase } from 'expo-sqlite';
import { UserEntity } from '../entities';
import { getDatabase } from '../database';

export class UserDao {
  private async db(): Promise<SQLiteDatabase> {
    return getDatabase();
  }

  async insertUser(user: Omit<UserEntity, 'id' | 'createdAt'>): Promise<number> {
    const db = await this.db();
    const result = await db.runAsync(
      `INSERT INTO users (username, email, passwordHash, profilePictureUri, level, tier)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user.username,
        user.email,
        user.passwordHash,
        user.profilePictureUri ?? null,
        user.level ?? 1,
        user.tier ?? 'ROOKIE',
      ]
    );
    return result.lastInsertRowId;
  }

  async updateUser(user: UserEntity): Promise<void> {
    const db = await this.db();
    await db.runAsync(
      `UPDATE users SET username = ?, email = ?, passwordHash = ?,
       profilePictureUri = ?, level = ?, tier = ? WHERE id = ?`,
      [
        user.username,
        user.email,
        user.passwordHash,
        user.profilePictureUri ?? null,
        user.level,
        user.tier,
        user.id,
      ]
    );
  }

  async getUserByEmailOrUsername(emailOrUsername: string): Promise<UserEntity | null> {
    const db = await this.db();
    const row = await db.getFirstAsync<any>(
      `SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1`,
      [emailOrUsername, emailOrUsername]
    );
    return row ? this.mapRow(row) : null;
  }

  async getUserById(id: number): Promise<UserEntity | null> {
    const db = await this.db();
    const row = await db.getFirstAsync<any>(
      `SELECT * FROM users WHERE id = ? LIMIT 1`,
      [id]
    );
    return row ? this.mapRow(row) : null;
  }

  async login(email: string, passwordHash: string): Promise<UserEntity | null> {
    const db = await this.db();
    const row = await db.getFirstAsync<any>(
      `SELECT * FROM users WHERE email = ? AND passwordHash = ? LIMIT 1`,
      [email, passwordHash]
    );
    return row ? this.mapRow(row) : null;
  }

  async deleteUserById(id: number): Promise<void> {
    const db = await this.db();
    await db.runAsync(`DELETE FROM users WHERE id = ?`, [id]);
  }

  async emailExists(email: string): Promise<number> {
    const db = await this.db();
    const row = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM users WHERE email = ?`,
      [email]
    );
    return row?.count ?? 0;
  }

  async usernameExists(username: string): Promise<number> {
    const db = await this.db();
    const row = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM users WHERE username = ?`,
      [username]
    );
    return row?.count ?? 0;
  }

  private mapRow(row: any): UserEntity {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.passwordHash,
      profilePictureUri: row.profilePictureUri ?? null,
      level: row.level ?? 1,
      tier: row.tier ?? 'ROOKIE',
      createdAt: row.createdAt,
    };
  }
}

export const userDao = new UserDao();