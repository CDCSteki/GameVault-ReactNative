import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Modal, Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';
import { GameVaultTopBar } from '../shared/GameVaultTopBar';
import { GameVaultTextField } from '../shared/GameVaultTextField';
import { GradientButton } from '../shared/GradientButton';
import { PasswordStrengthIndicator } from '../shared/PasswordStrengthIndicator';
import { useProfileStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import { pickImageFromGallery, takePhotoWithCamera } from '../../utils/imagePicker';

interface ProfileScreenProps {
  onLogout: () => void;
}

export function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const { colors } = useTheme();
  const { userId } = useAppStore();
  const {
    user, username, currentPassword, newPassword, confirmNewPassword,
    isCurrentPasswordVisible, isNewPasswordVisible, isConfirmPasswordVisible,
    profilePictureUri, isLoading, successMessage, errorMessage,
    loadUser, setUsername, setCurrentPassword, setNewPassword, setConfirmNewPassword,
    toggleCurrentPasswordVisibility, toggleNewPasswordVisibility, toggleConfirmPasswordVisibility,
    saveUsername, savePassword, updateProfilePicture, logout, clearMessages,
  } = useProfileStore();

  const [showImagePicker, setShowImagePicker] = React.useState(false);

  useEffect(() => {
    if (userId !== -1) loadUser(userId);
  }, [userId]);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const t = setTimeout(clearMessages, 5000);
      return () => clearTimeout(t);
    }
  }, [successMessage, errorMessage]);

  const handlePickGallery = async () => {
    setShowImagePicker(false);
    const uri = await pickImageFromGallery();
    if (uri) await updateProfilePicture(uri, userId);
  };

  const handleTakePhoto = async () => {
    setShowImagePicker(false);
    const uri = await takePhotoWithCamera();
    if (uri) await updateProfilePicture(uri, userId);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <GameVaultTopBar />

        {/* Avatar */}
        <AvatarSection
          profilePictureUri={profilePictureUri}
          username={user?.username ?? ''}
          level={user?.level ?? 1}
          tier={user?.tier ?? 'ROOKIE'}
          onEditClick={() => setShowImagePicker(true)}
          colors={colors}
        />

        {/* Success Message */}
        {successMessage && (
          <View style={[styles.messageBanner, { backgroundColor: colors.statusGreen + '26', borderColor: colors.statusGreen }]}>
            <Ionicons name="checkmark-circle" size={16} color={colors.statusGreen} />
            <Text style={[Typography.bodySmall, { color: colors.statusGreen, marginLeft: 8 }]}>
              {successMessage}
            </Text>
          </View>
        )}

        {/* Error Message */}
        {errorMessage && (
          <View style={[styles.messageBanner, { backgroundColor: colors.statusRed + '26', borderColor: colors.statusRed }]}>
            <Ionicons name="alert-circle" size={16} color={colors.statusRed} />
            <Text style={[Typography.bodySmall, { color: colors.statusRed, marginLeft: 8 }]}>
              {errorMessage}
            </Text>
          </View>
        )}

        {/* Username Section */}
        <ProfileSectionCard title="USERNAME" colors={colors}>
          <View style={{ padding: 16, gap: 12 }}>
            <GameVaultTextField
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              leadingIcon="person-outline"
              autoCapitalize="none"
            />
            <GradientButton
              text="UPDATE USERNAME"
              onPress={() => saveUsername(userId)}
              isLoading={isLoading}
            />
          </View>
        </ProfileSectionCard>

        <View style={{ height: 12 }} />

        {/* Password Section */}
        <ProfileSectionCard title="CHANGE PASSWORD" colors={colors}>
          <View style={{ padding: 16, gap: 12 }}>
            <View>
              <Text style={[Typography.labelMedium, { color: colors.textSecondary, marginBottom: 6 }]}>
                Current Password
              </Text>
              <GameVaultTextField
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                leadingIcon="lock-closed-outline"
                isPassword
                isPasswordVisible={isCurrentPasswordVisible}
                onTogglePasswordVisibility={toggleCurrentPasswordVisibility}
              />
            </View>
            <View>
              <Text style={[Typography.labelMedium, { color: colors.textSecondary, marginBottom: 6 }]}>
                New Password
              </Text>
              <GameVaultTextField
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Min. 6 characters"
                leadingIcon="lock-closed-outline"
                isPassword
                isPasswordVisible={isNewPasswordVisible}
                onTogglePasswordVisibility={toggleNewPasswordVisibility}
              />
            </View>
            <View>
              <Text style={[Typography.labelMedium, { color: colors.textSecondary, marginBottom: 6 }]}>
                Confirm New Password
              </Text>
              <GameVaultTextField
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                placeholder="Repeat new password"
                leadingIcon="lock-closed-outline"
                isPassword
                isPasswordVisible={isConfirmPasswordVisible}
                onTogglePasswordVisibility={toggleConfirmPasswordVisibility}
              />
            </View>
            {newPassword.length > 0 && (
              <PasswordStrengthIndicator password={newPassword} />
            )}
            <GradientButton
              text="UPDATE PASSWORD"
              onPress={() => savePassword(userId)}
              isLoading={isLoading}
            />
          </View>
        </ProfileSectionCard>

        <View style={{ height: 12 }} />

        {/* Logout */}
        <TouchableOpacity
          onPress={() => logout(onLogout)}
          style={[styles.logoutBtn, { borderColor: colors.border }]}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.textSecondary} />
          <Text style={[Typography.labelLarge, { color: colors.textSecondary, marginLeft: 8, letterSpacing: 1 }]}>
            LOGOUT
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Image Picker Modal */}
      <Modal
        transparent
        visible={showImagePicker}
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowImagePicker(false)}
        >
          <View style={[styles.imagePickerSheet, { backgroundColor: colors.card }]}>
            <Text style={[Typography.titleMedium, { color: colors.textPrimary, fontWeight: '700', marginBottom: 16 }]}>
              Change Profile Picture
            </Text>

            <TouchableOpacity
              style={[styles.imagePickerOption, { backgroundColor: colors.backgroundSecondary }]}
              onPress={handleTakePhoto}
            >
              <Ionicons name="camera" size={24} color={colors.accentSecondary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[Typography.titleMedium, { color: colors.textPrimary, fontWeight: '700' }]}>
                  Take Photo
                </Text>
                <Text style={[Typography.bodySmall, { color: colors.textMuted }]}>
                  Use your camera
                </Text>
              </View>
            </TouchableOpacity>

            <View style={{ height: 12 }} />

            <TouchableOpacity
              style={[styles.imagePickerOption, { backgroundColor: colors.backgroundSecondary }]}
              onPress={handlePickGallery}
            >
              <Ionicons name="images" size={24} color={colors.accent} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[Typography.titleMedium, { color: colors.textPrimary, fontWeight: '700' }]}>
                  Choose from Gallery
                </Text>
                <Text style={[Typography.bodySmall, { color: colors.textMuted }]}>
                  Pick from your photos
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowImagePicker(false)}
              style={{ marginTop: 16, alignItems: 'center' }}
            >
              <Text style={[Typography.labelMedium, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── Avatar Section ───────────────────────────────────────────────────────────

function AvatarSection({ profilePictureUri, username, level, tier, onEditClick, colors }: {
  profilePictureUri: string | null;
  username: string;
  level: number;
  tier: string;
  onEditClick: () => void;
  colors: any;
}) {
  return (
    <View style={styles.avatarSection}>
      <View>
        <View style={[styles.avatarRing, { borderColor: colors.accent }]}>
          {profilePictureUri ? (
            <Image
              source={{ uri: profilePictureUri }}
              style={styles.avatarImage}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.card }]}>
              <Ionicons name="person" size={52} color={colors.textSecondary} />
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={onEditClick}
          style={[styles.editAvatarBtn, { backgroundColor: colors.accent, borderColor: colors.background }]}
        >
          <LinearGradient
            colors={[colors.accent, colors.accentSecondary]}
            style={styles.editAvatarGradient}
          >
            <Ionicons name="camera" size={16} color={colors.textPrimary} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={{ height: 12 }} />

      <Text style={[Typography.headlineSmall, { color: colors.textPrimary, fontWeight: '700' }]}>
        {username}
      </Text>

      <View style={{ height: 6 }} />

      <View style={[styles.levelBadge, { backgroundColor: colors.accent + '33', borderColor: colors.accent + '80' }]}>
        <Text style={[Typography.labelSmall, { color: colors.accent, fontWeight: '700' }]}>
          LVL {level}  •  {tier}
        </Text>
      </View>
    </View>
  );
}

// ─── Profile Section Card ─────────────────────────────────────────────────────

function ProfileSectionCard({ title, colors, children }: {
  title: string; colors: any; children: React.ReactNode;
}) {
  return (
    <View style={[styles.sectionCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <View style={styles.sectionCardHeader}>
        <View style={[styles.sectionBar, { backgroundColor: colors.accent }]} />
        <Text style={[Typography.labelSmall, { color: colors.accent, fontWeight: '700', letterSpacing: 1 }]}>
          {title}
        </Text>
      </View>
      <View style={[styles.sectionDivider, { backgroundColor: colors.border + '4D' }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  avatarRing: {
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 3,
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  editAvatarGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  messageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  sectionCard: {
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  sectionBar: { width: 3, height: 16, borderRadius: 2 },
  sectionDivider: { height: 1 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  imagePickerSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
  },
});