// Mirrors storage.rules for profiles/{uid}: images only, under 5 MB.
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

/** Returns a user-facing error message, or null if the file can be uploaded. */
export function avatarError(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Please choose an image file (JPG, PNG, WebP or GIF).';
  if (file.size >= MAX_AVATAR_BYTES) return 'Please choose an image smaller than 5 MB.';
  return null;
}
