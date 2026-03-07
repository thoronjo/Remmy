import { create } from 'zustand';
import { onAuthStateChange, signOut } from '../services/auth';
import { loadGamification, saveGamification } from '../services/db';
import useRemmyStore from './useRemmyStore';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  initialized: false,

  initialize: () => {
  // Handle OAuth callback from URL
  supabase.auth.getSession().then(({ data: { session } }) => {
    const user = session?.user || null;
    set({ user, loading: false, initialized: true });

    if (user) {
      loadGamification(user.id)
        .then(data => {
          if (data) {
            useRemmyStore.setState({
              gamification: {
                clarityPoints: data.clarity_points,
                level: data.level,
                streak: data.streak,
                totalDecisions: data.total_decisions,
                achievements: data.achievements || [],
              }
            });
          }
        })
        .catch(err => console.error('Failed to load gamification:', err));
    }
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      const user = session?.user || null;
      set({ user, loading: false, initialized: true });

      if (user) {
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
              }
            });
          }
        } catch (err) {
          console.error('Failed to load gamification:', err);
        }
      }
    }
  );

  return () => subscription.unsubscribe();
 },
}));

export default useAuthStore;