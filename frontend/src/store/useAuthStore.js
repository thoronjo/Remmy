import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { signOut } from '../services/auth';
import { loadGamification, saveGamification } from '../services/db';
import useRemmyStore from './useRemmyStore';

const applyUserState = async (user, set) => {
  set({ user, loading: false, initialized: true });

  if (!user) {
    return;
  }

  try {
    const data = await loadGamification(user.id);
    if (data) {
      useRemmyStore.setState({
        gamification: {
          clarityPoints: data.clarity_points,
          level: data.level,
          streak: data.streak,
          totalDecisions: data.total_decisions,
          achievements: data.achievements || [],
        },
      });
    }
  } catch (err) {
    console.error('Failed to load gamification:', err);
  }
};

const cleanOAuthParams = () => {
  const url = new URL(window.location.href);
  const authParams = ['code', 'state', 'error', 'error_code', 'error_description'];

  let changed = false;
  for (const param of authParams) {
    if (url.searchParams.has(param)) {
      url.searchParams.delete(param);
      changed = true;
    }
  }

  if (changed) {
    const cleanUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }
};

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  initialized: false,

  initialize: () => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const authCode = url.searchParams.get('code');

        if (authCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(authCode);
          if (!error) {
            cleanOAuthParams();
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        await applyUserState(session?.user || null, set);
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        set({ loading: false, initialized: true });
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await applyUserState(session?.user || null, set);
      }
    );

    return () => subscription.unsubscribe();
  },

  logout: async () => {
    await signOut();
    set({ user: null });
  },

  syncGamification: async () => {
    const { user } = get();
    if (!user) return;

    const { gamification } = useRemmyStore.getState();
    try {
      await saveGamification(user.id, gamification);
    } catch (err) {
      console.error('Failed to sync gamification:', err);
    }
  },
}));

export default useAuthStore;
