import { create } from 'zustand';
import { AuthRepository } from '../data/repository/AuthRepository';
import { UserEntity } from '../data/db/entities';
import { useAppStore } from './useAppStore';

// ─── Login ────────────────────────────────────────────────────────────────────

interface LoginState {
  emailOrUsername: string;
  password: string;
  isPasswordVisible: boolean;
  isLoading: boolean;
  errorMessage: string | null;

  setEmailOrUsername: (v: string) => void;
  setPassword: (v: string) => void;
  togglePasswordVisibility: () => void;
  login: (onSuccess: () => void) => Promise<void>;
  resetLogin: () => void;
}

export const useLoginStore = create<LoginState>((set, get) => ({
  emailOrUsername: '',
  password: '',
  isPasswordVisible: false,
  isLoading: false,
  errorMessage: null,

  setEmailOrUsername: (v) => set({ emailOrUsername: v, errorMessage: null }),
  setPassword: (v) => set({ password: v, errorMessage: null }),
  togglePasswordVisibility: () =>
    set((s) => ({ isPasswordVisible: !s.isPasswordVisible })),

  login: async (onSuccess) => {
    const { emailOrUsername, password } = get();
    if (!emailOrUsername.trim()) {
      set({ errorMessage: 'Enter your email or username' });
      return;
    }
    if (!password) {
      set({ errorMessage: 'Enter your password' });
      return;
    }
    set({ isLoading: true, errorMessage: null });
    const result = await AuthRepository.login(emailOrUsername.trim(), password);
    if (result.type === 'Success') {
      await useAppStore.getState().setLoggedIn(result.user.id);
      set({ isLoading: false });
      onSuccess();
    } else {
      set({ isLoading: false, errorMessage: 'Invalid email or password' });
    }
  },

  resetLogin: () =>
    set({ emailOrUsername: '', password: '', isPasswordVisible: false, isLoading: false, errorMessage: null }),
}));

// ─── Register ─────────────────────────────────────────────────────────────────

interface RegisterState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  isPasswordVisible: boolean;
  isConfirmPasswordVisible: boolean;
  isLoading: boolean;
  errorMessage: string | null;

  setUsername: (v: string) => void;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  togglePasswordVisibility: () => void;
  toggleConfirmPasswordVisibility: () => void;
  register: (onSuccess: () => void) => Promise<void>;
  resetRegister: () => void;
}

export const useRegisterStore = create<RegisterState>((set, get) => ({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  isPasswordVisible: false,
  isConfirmPasswordVisible: false,
  isLoading: false,
  errorMessage: null,

  setUsername: (v) => set({ username: v, errorMessage: null }),
  setEmail: (v) => set({ email: v, errorMessage: null }),
  setPassword: (v) => set({ password: v, errorMessage: null }),
  setConfirmPassword: (v) => set({ confirmPassword: v, errorMessage: null }),
  togglePasswordVisibility: () =>
    set((s) => ({ isPasswordVisible: !s.isPasswordVisible })),
  toggleConfirmPasswordVisibility: () =>
    set((s) => ({ isConfirmPasswordVisible: !s.isConfirmPasswordVisible })),

  register: async (onSuccess) => {
    const { username, email, password, confirmPassword } = get();
    if (!username.trim()) { set({ errorMessage: 'Enter a username' }); return; }
    if (username.length < 3) { set({ errorMessage: 'Username must be at least 3 characters' }); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      set({ errorMessage: 'Enter a valid email address' }); return;
    }
    if (password.length < 6) { set({ errorMessage: 'Password must be at least 6 characters' }); return; }
    if (password !== confirmPassword) { set({ errorMessage: 'Passwords do not match' }); return; }

    set({ isLoading: true, errorMessage: null });
    const result = await AuthRepository.register(username.trim(), email.trim().toLowerCase(), password);
    if (result.type === 'Success') {
      await useAppStore.getState().setLoggedIn(result.userId);
      set({ isLoading: false });
      onSuccess();
    } else if (result.type === 'EmailAlreadyExists') {
      set({ isLoading: false, errorMessage: 'This email is already registered' });
    } else {
      set({ isLoading: false, errorMessage: 'This username is already taken' });
    }
  },

  resetRegister: () =>
    set({ username: '', email: '', password: '', confirmPassword: '', isLoading: false, errorMessage: null }),
}));

// ─── Profile ──────────────────────────────────────────────────────────────────

interface ProfileState {
  user: UserEntity | null;
  username: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  isCurrentPasswordVisible: boolean;
  isNewPasswordVisible: boolean;
  isConfirmPasswordVisible: boolean;
  profilePictureUri: string | null;
  isLoading: boolean;
  successMessage: string | null;
  errorMessage: string | null;

  loadUser: (userId: number) => Promise<void>;
  setUsername: (v: string) => void;
  setCurrentPassword: (v: string) => void;
  setNewPassword: (v: string) => void;
  setConfirmNewPassword: (v: string) => void;
  toggleCurrentPasswordVisibility: () => void;
  toggleNewPasswordVisibility: () => void;
  toggleConfirmPasswordVisibility: () => void;
  saveUsername: (userId: number) => Promise<void>;
  savePassword: (userId: number) => Promise<void>;
  updateProfilePicture: (uri: string, userId: number) => Promise<void>;
  logout: (onSuccess: () => void) => Promise<void>;
  clearMessages: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  user: null,
  username: '',
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
  isCurrentPasswordVisible: false,
  isNewPasswordVisible: false,
  isConfirmPasswordVisible: false,
  profilePictureUri: null,
  isLoading: false,
  successMessage: null,
  errorMessage: null,

  loadUser: async (userId) => {
    const user = await AuthRepository.getUserById(userId);
    set({
      user,
      username: user?.username ?? '',
      profilePictureUri: user?.profilePictureUri ?? null,
    });
  },

  setUsername: (v) => set({ username: v, errorMessage: null, successMessage: null }),
  setCurrentPassword: (v) => set({ currentPassword: v, errorMessage: null, successMessage: null }),
  setNewPassword: (v) => set({ newPassword: v, errorMessage: null, successMessage: null }),
  setConfirmNewPassword: (v) => set({ confirmNewPassword: v, errorMessage: null, successMessage: null }),
  toggleCurrentPasswordVisibility: () =>
    set((s) => ({ isCurrentPasswordVisible: !s.isCurrentPasswordVisible })),
  toggleNewPasswordVisibility: () =>
    set((s) => ({ isNewPasswordVisible: !s.isNewPasswordVisible })),
  toggleConfirmPasswordVisibility: () =>
    set((s) => ({ isConfirmPasswordVisible: !s.isConfirmPasswordVisible })),

  saveUsername: async (userId) => {
    const { username, profilePictureUri } = get();
    if (!username.trim()) { set({ errorMessage: 'Username cannot be empty' }); return; }
    if (username.length < 3) { set({ errorMessage: 'Username must be at least 3 characters' }); return; }
    set({ isLoading: true });
    const result = await AuthRepository.updateProfile(userId, username.trim(), profilePictureUri);
    if (result.type === 'Success') {
      set({ isLoading: false, successMessage: 'Profile updated successfully!' });
      await get().loadUser(userId);
    } else if (result.type === 'UsernameAlreadyExists') {
      set({ isLoading: false, errorMessage: 'This username is already taken' });
    } else {
      set({ isLoading: false, errorMessage: 'User not found' });
    }
  },

  savePassword: async (userId) => {
    const { currentPassword, newPassword, confirmNewPassword } = get();
    if (!currentPassword) { set({ errorMessage: 'Enter your current password' }); return; }
    if (newPassword.length < 6) { set({ errorMessage: 'Password must be at least 6 characters' }); return; }
    if (newPassword !== confirmNewPassword) { set({ errorMessage: 'Passwords do not match' }); return; }
    if (currentPassword === newPassword) { set({ errorMessage: 'New password must be different' }); return; }
    set({ isLoading: true });
    const result = await AuthRepository.updatePassword(userId, currentPassword, newPassword);
    if (result.type === 'Success') {
      set({ isLoading: false, currentPassword: '', newPassword: '', confirmNewPassword: '',
        successMessage: 'Password updated successfully!' });
    } else if (result.type === 'WrongCurrentPassword') {
      set({ isLoading: false, errorMessage: 'Current password is incorrect' });
    } else {
      set({ isLoading: false, errorMessage: 'User not found' });
    }
  },

  updateProfilePicture: async (uri, userId) => {
    const { user } = get();
    if (!user) return;
    set({ profilePictureUri: uri });
    await AuthRepository.updateProfile(userId, user.username, uri);
    await get().loadUser(userId);
  },

  logout: async (onSuccess) => {
    await AuthRepository.logout();
    await useAppStore.getState().setLoggedOut();
    set({ user: null, username: '', profilePictureUri: null });
    onSuccess();
  },

  clearMessages: () => set({ successMessage: null, errorMessage: null }),
}));