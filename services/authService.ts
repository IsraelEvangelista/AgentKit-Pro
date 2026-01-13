import { supabase } from './supabaseClient';
import { User } from '../types';

export interface AuthUser extends User {
  accessToken?: string;
}

/**
 * Sign in with GitHub OAuth
 */
export const signInWithGitHub = async (): Promise<{ user: AuthUser | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    // OAuth flow will redirect, so we return the URL
    return { user: null, error: null };
  } catch (e: any) {
    return { user: null, error: e.message || 'Failed to sign in with GitHub' };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message || null };
  } catch (e: any) {
    return { error: e.message || 'Failed to sign out' };
  }
};

/**
 * Get the current session
 */
export const getSession = async (): Promise<{ user: AuthUser | null; error: string | null }> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return { user: null, error: error.message };
    }

    if (!session?.user) {
      return { user: null, error: null };
    }

    // Extract avatar and display_name from multiple possible sources
    const metadata = session.user.user_metadata || {};
    const identities = session.user.identities || [];
    const githubIdentity = identities.find((i: any) => i.provider === 'github');
    const githubData = githubIdentity?.identity_data || {};

    const avatar =
      metadata.avatar_url ||
      metadata.picture ||
      githubData.avatar_url ||
      undefined;

    const displayName =
      metadata.name ||
      metadata.full_name ||
      metadata.user_name ||
      githubData.name ||
      githubData.login ||
      session.user.email?.split('@')[0] ||
      'User';

    const user: AuthUser = {
      id: session.user.id,
      email: session.user.email || '',
      role: metadata.role || 'admin',
      avatar,
      display_name: displayName,
    };

    return { user, error: null };
  } catch (e: any) {
    return { user: null, error: e.message || 'Failed to get session' };
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (!session?.user) {
      callback(null);
      return;
    }

    // Extract avatar and display_name from multiple possible sources
    const metadata = session.user.user_metadata || {};
    const identities = session.user.identities || [];
    const githubIdentity = identities.find((i: any) => i.provider === 'github');
    const githubData = githubIdentity?.identity_data || {};

    const avatar =
      metadata.avatar_url ||
      metadata.picture ||
      githubData.avatar_url ||
      undefined;

    const displayName =
      metadata.name ||
      metadata.full_name ||
      metadata.user_name ||
      githubData.name ||
      githubData.login ||
      session.user.email?.split('@')[0] ||
      'User';

    const user: AuthUser = {
      id: session.user.id,
      email: session.user.email || '',
      role: metadata.role || 'admin',
      avatar,
      display_name: displayName,
    };

    callback(user);
  });
};
