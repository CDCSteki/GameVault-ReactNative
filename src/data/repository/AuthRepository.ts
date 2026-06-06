import * as Crypto from "expo-crypto";
import { userDao } from "../db/dao/userDao";
import { AppPreferences } from "../preferences/AppPreferences";
import { UserEntity } from "../db/entities";

// ─── Result types ─────────────────────────────────────────────────────────────

export type RegisterResult =
  | { type: "Success"; userId: number }
  | { type: "EmailAlreadyExists" }
  | { type: "UsernameAlreadyExists" };

export type LoginResult =
  | { type: "Success"; user: UserEntity }
  | { type: "InvalidCredentials" };

export type UpdateProfileResult =
  | { type: "Success" }
  | { type: "UsernameAlreadyExists" }
  | { type: "UserNotFound" };

export type UpdatePasswordResult =
  | { type: "Success" }
  | { type: "WrongCurrentPassword" }
  | { type: "UserNotFound" };

// ─── Repository ───────────────────────────────────────────────────────────────

class AuthRepositoryClass {
  async isLoggedIn(): Promise<boolean> {
    return AppPreferences.isLoggedIn();
  }

  async getLoggedInUserId(): Promise<number> {
    return AppPreferences.getLoggedInUserId();
  }

  async getUserById(id: number): Promise<UserEntity | null> {
    return userDao.getUserById(id);
  }

  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<RegisterResult> {
    if ((await userDao.emailExists(email)) > 0) {
      return { type: "EmailAlreadyExists" };
    }
    if ((await userDao.usernameExists(username)) > 0) {
      return { type: "UsernameAlreadyExists" };
    }

    const passwordHash = await this.hashPassword(password);
    const userId = await userDao.insertUser({
      username,
      email,
      passwordHash,
      profilePictureUri: null,
      level: 1,
      tier: "ROOKIE",
    });

    await AppPreferences.saveLoggedInUser(userId);
    return { type: "Success", userId };
  }

  async login(emailOrUsername: string, password: string): Promise<LoginResult> {
    const passwordHash = await this.hashPassword(password);

    let user = await userDao.login(emailOrUsername, passwordHash);

    if (!user) {
      const found = await userDao.getUserByEmailOrUsername(emailOrUsername);
      if (found && found.passwordHash === passwordHash) {
        user = found;
      }
    }

    if (user) {
      await AppPreferences.saveLoggedInUser(user.id);
      return { type: "Success", user };
    }
    return { type: "InvalidCredentials" };
  }

  async logout(): Promise<void> {
    await AppPreferences.clearLoggedInUser();
  }

  async updateProfile(
    userId: number,
    username: string,
    profilePictureUri: string | null,
  ): Promise<UpdateProfileResult> {
    const existing = await userDao.getUserByEmailOrUsername(username);
    if (existing && existing.id !== userId) {
      return { type: "UsernameAlreadyExists" };
    }

    const userToUpdate = await userDao.getUserById(userId);
    if (!userToUpdate) return { type: "UserNotFound" };

    await userDao.updateUser({
      ...userToUpdate,
      username,
      profilePictureUri,
    });
    return { type: "Success" };
  }

  async updatePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<UpdatePasswordResult> {
    const currentHash = await this.hashPassword(currentPassword);
    const newHash = await this.hashPassword(newPassword);

    const userToUpdate = await userDao.getUserById(userId);
    if (!userToUpdate) return { type: "UserNotFound" };

    if (userToUpdate.passwordHash !== currentHash) {
      return { type: "WrongCurrentPassword" };
    }

    await userDao.updateUser({ ...userToUpdate, passwordHash: newHash });
    return { type: "Success" };
  }

  async deleteAccount(userId: number): Promise<void> {
    await userDao.deleteUserById(userId);
    await AppPreferences.clearLoggedInUser();
  }

  private async hashPassword(password: string): Promise<string> {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password,
    );
    return hash;
  }
}

export const AuthRepository = new AuthRepositoryClass();
