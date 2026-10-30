import { updateProfile, User as FirebaseUser } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

// Mirrors storage.rules for profiles/{uid}: images only, under 5 MB.
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

/** Returns a user-facing error message, or null if the file can be uploaded. */
export function avatarError(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Please choose an image file (JPG, PNG, WebP or GIF).';
  if (file.size >= MAX_AVATAR_BYTES) return 'Please choose an image smaller than 5 MB.';
  return null;
}

/**
 * Uploads a new profile photo and points both the Firestore profile and the Auth
 * profile at it, so the new photo shows wherever `user.photoURL` is read.
 * Returns the download URL.
 */
export async function uploadAvatar(user: FirebaseUser, file: File): Promise<string> {
  const storageRef = ref(storage, `profiles/${user.uid}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  const url = await getDownloadURL(storageRef);
  await updateProfile(user, { photoURL: url });
  try {
    // Mirror into the Firestore profile. It may not exist yet right after a first sign-in.
    await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
  } catch (error) {
    console.error('NexCart: could not save the photo URL to the user profile document.', error);
  }
  return url;
}
