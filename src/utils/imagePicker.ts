import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';

/** Pick image from gallery — returns local URI or null */
export async function pickImageFromGallery(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;
  return copyImageToInternalStorage(result.assets[0].uri);
}

/** Take photo with camera — returns local URI or null */
export async function takePhotoWithCamera(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;
  return copyImageToInternalStorage(result.assets[0].uri);
}

/** Copy source URI to internal app storage, returns the persisted file path */
async function copyImageToInternalStorage(sourceUri: string): Promise<string | null> {
  try {
    const fileName = `profile_${Date.now()}.jpg`;
    
    // Creăm un obiect File pentru sursă și unul pentru destinație
    const sourceFile = new File(sourceUri);
    const destFile = new File(Paths.document, fileName); 
    
    // Folosim metoda nouă async de copiere
    await sourceFile.copy(destFile);
    
    // Returnăm noul path
    return destFile.uri;
  } catch (error) {
    console.error(error);
    return null;
  }
}