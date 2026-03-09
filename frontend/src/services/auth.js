import { supabase } from './supabase';

const getAllowedRedirects = () => {
  const raw = import.meta.env.VITE_AUTH_REDIRECT_ALLOWLIST || '';
  return raw
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);
};

const getOAuthRedirectUrl = () => {
  const configured = (import.meta.env.VITE_AUTH_REDIRECT_URL || '').trim();
  const fallback = window.location.origin;
  const redirectTo = configured || fallback;
  const allowlist = getAllowedRedirects();

  if (allowlist.length === 0) {
    return redirectTo;
  }

  if (allowlist.includes(redirectTo)) {
    return redirectTo;
  }

  throw new Error('Invalid OAuth redirect URL. Check VITE_AUTH_REDIRECT_URL and allow-list settings.');
};

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signInWithGoogle = async () => {
  const redirectTo = getOAuthRedirectUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw error;
};

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
};

