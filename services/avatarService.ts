import { supabase } from './supabaseClient';

export const uploadAvatar = async (
  userId: string,
  file: File
): Promise<{ path: string | null; error: string | null }> => {
  try {
    const fileName = `${userId}/avatar.png`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      return { path: null, error: error.message };
    }

    return { path: fileName, error: null };
  } catch (e: any) {
    return { path: null, error: e.message || 'Failed to upload avatar' };
  }
};

export const deleteAvatar = async (
  fileName: string
): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.storage
      .from('avatars')
      .remove([fileName]);

    return { error: error?.message || null };
  } catch (e: any) {
    return { error: e.message || 'Failed to delete avatar' };
  }
};

export const getSignedAvatarUrl = async (
  fileName: string,
  expiresInSeconds: number = 60 * 60 * 24
): Promise<{ url: string | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.storage
      .from('avatars')
      .createSignedUrl(fileName, expiresInSeconds);

    if (error) {
      return { url: null, error: error.message };
    }

    return { url: data.signedUrl, error: null };
  } catch (e: any) {
    return { url: null, error: e.message || 'Failed to create signed URL' };
  }
};

export const getPublicAvatarUrl = (
  fileName: string
): { url: string | null; error: string | null } => {
  try {
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return { url: data.publicUrl, error: null };
  } catch (e: any) {
    return { url: null, error: e.message || 'Failed to create public URL' };
  }
};
