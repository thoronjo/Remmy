import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { saveDecision, updateDecisionCheckin } from '../services/db';
import useAuthStore from './useAuthStore';

const INITIAL_GAMIFICATION = {
  clarityPoints: 0,
  level: 1,
  streak: 0,
  achievements: [],
  totalDecisions: 0,
  lastDecisionDate: null,  // ISO date string, tracks daily streak
  freezeTokens: 0,         // streak freeze tokens
  longestStreak: 0,        // personal best
};

const LEVELS = [
  { level: 1, name: 'Frozen',    minCP: 0,     remmyState: 'sleeping'  },
  { level: 2, name: 'Stirring',  minCP: 200,   remmyState: 'waking'    },
  { level: 3, name: 'Deciding',  minCP: 500,   remmyState: 'alert'     },
  { level: 4, name: 'Acting',    minCP: 1200,  remmyState: 'charged'   },
  { level: 5, name: 'Committed', minCP: 2500,  remmyState: 'glowing'   },
  { level: 6, name: 'Forging',   minCP: 5000,  remmyState: 'powerful'  },
  { level: 7, name: 'Resolved',  minCP: 10000, remmyState: 'legendary' },
];

const ACHIEVEMENTS = [
  { id: 'first_strike',    label: 'First Strike',   emoji: '🎯', condition: (s) => s.gamification.totalDecisions >= 1   },
  { id: 'lightning',       label: 'Lightning',       emoji: '⚡', condition: (s) => s.fastDecision                      },
  { id: 'vault',           label: 'Vault',           emoji: '🔒', condition: (s) => s.completedLock                     },
  { id: 'ironwill',        label: 'Ironwill',        emoji: '💪', condition: (s) => s.resistedUnlocks >= 3              },
  { id: 'on_fire',         label: 'On Fire',         emoji: '🔥', condition: (s) => s.gamification.streak >= 5          },
  { id: 'eyes_open',       label: 'Eyes Open',       emoji: '👁️', condition: (s) => s.scaryChoices >= 5                 },
  { id: 'pattern_breaker', label: 'Pattern Breaker', emoji: '🧠', condition: (s) => s.gamification.totalDecisions >= 10 },
  { id: 'forged',          label: 'Forged',          emoji: '🏆', condition: (s) => s.gamification.level >= 7           },
  { id: 'comeback',        label: 'Comeback Kid',    emoji: '🔄', condition: (s) => s.gamification.recoveryCount >= 1   },
  { id: 'frozen_solid',    label: 'Frost Proof',     emoji: '🧊', condition: (s) => s.gamification.freezeTokens >= 3    },
];

const getLevel = (cp) => {
  return [...LEVELS].reverse().find(l => cp >= l.minCP) || LEVELS[0];
};

const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Get today's date as YYYY-MM-DD string
const toDateStr = (date = new Date()) => date.toISOString().split('T')[0];

// Days between two YYYY-MM-DD strings
const daysBetween = (a, b) => {
  const msPerDay = 86400000;
  return Math.round((new Date(b) - new Date(a)) / msPerDay);
};

const useRemmyStore = create(
  persist(
    (set, get) => ({
      // Decision state
      stage: 'intake',
      decision: '',
      options: [],
      realOptions: [],
      gutChoice: null,
      fears: [],
      firstAction: '',
      actionTime: '',
      obstacle: '',
      obstacleIf: '',
      daysStuck: '',
      deadlineDays: 7,
      lockDays: 30,
      locked: false,
      checkinResult: null,
      aiMessage: '',
      aiLoading: false,
      currentDecisionId: null,

      // Gamification
      gamification: {
        ...INITIAL_GAMIFICATION,
        recoveryCount: 0,
      },
      fastDecision: false,
      completedLock: false,
      resistedUnlocks: 0,
      scaryChoices: 0,
      decisionStartTime: null,

      // Actions
      setStage: (stage) => set({ stage }),
      setDecision: (decision) => set({ decision }),
      setOptions: (options) => set({ options }),
      setRealOptions: (realOptions) => set({ realOptions }),
      setGutChoice: (gutChoice) => set({ gutChoice }),
      setFears: (fears) => set({ fears }),
      setFirstAction: (firstAction) => set({ firstAction }),
      setActionTime: (actionTime) => set({ actionTime }),
      setObstacle: (obstacle) => set({ obstacle }),
      setObstacleIf: (obstacleIf) => set({ obstacleIf }),
      setDaysStuck: (daysStuck) => set({ daysStuck }),
      setDeadlineDays: (deadlineDays) => set({ deadlineDays }),
      setLockDays: (lockDays) => set({ lockDays }),
      setLocked: (locked) => set({ locked }),
      setAiMessage: (aiMessage) => set({ aiMessage }),
      setAiLoading: (aiLoading) => set({ aiLoading }),
      setDecisionStartTime: (t) => set({ decisionStartTime: t }),
      setFastDecision: (v) => set({ fastDecision: v }),

      // ─── Streak logic ─────────────────────────────────────────────

      // Call this when a decision is completed (checkin = yes)
      processStreak: () => {
        const state = get();
        const current = state.gamification;
        const today = toDateStr();
        const last = current.lastDecisionDate;

        let newStreak = current.streak;
        let newFreezeTokens = current.freezeTokens;
        let recoveryBonus = 0;
        let newRecoveryCount = current.recoveryCount || 0;
        let streakMessage = null;

        if (!last) {
          // First ever decision
          newStreak = 1;
        } else {
          const gap = daysBetween(last, today);

          if (gap === 0) {
            // Already completed one today — no streak change
          } else if (gap === 1) {
            // Consecutive day — increment streak
            newStreak = current.streak + 1;
          } else if (gap === 2 && newFreezeTokens > 0) {
            // Missed one day but has a freeze token — use it
            newFreezeTokens = newFreezeTokens - 1;
            newStreak = current.streak + 1;
            streakMessage = 'freeze_used';
          } else if (gap > 1) {
            // Streak broken — check if recovering
            if (current.streak > 0) {
              // They had a streak and broke it — give recovery bonus
              recoveryBonus = 25;
              newRecoveryCount = newRecoveryCount + 1;
              streakMessage = 'recovery';
            }
            newStreak = 1;
          }
        }

        const newLongestStreak = Math.max(current.longestStreak || 0, newStreak);

        // Award weekly freeze token (every 7-day streak milestone)
        if (newStreak > 0 && newStreak % 7 === 0) {
          newFreezeTokens = newFreezeTokens + 1;
          streakMessage = streakMessage || 'freeze_earned';
        }

        set({
          gamification: {
            ...current,
            streak: newStreak,
            lastDecisionDate: today,
            freezeTokens: newFreezeTokens,
            longestStreak: newLongestStreak,
            recoveryCount: newRecoveryCount,
          },
        });

        return { recoveryBonus, streakMessage, newStreak };
      },

      // Use a freeze token manually
      useFreezeToken: () => {
        const state = get();
        const { freezeTokens } = state.gamification;
        if (freezeTokens <= 0) return false;

        set({
          gamification: {
            ...state.gamification,
            freezeTokens: freezeTokens - 1,
          },
        });
        return true;
      },

      // ─── Supabase sync ────────────────────────────────────────────

      syncDecision: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const state = get();
        const decisionId = state.currentDecisionId || generateId();

        if (!state.currentDecisionId) {
          set({ currentDecisionId: decisionId });
        }

        try {
          await saveDecision(user.id, {
            id: decisionId,
            decision: state.decision,
            options: state.realOptions,
            gutChoice: state.gutChoice,
            fears: state.fears,
            firstAction: state.firstAction,
            actionTime: state.actionTime,
            daysStuck: state.daysStuck,
            checkinResult: state.checkinResult,
            completed: state.checkinResult === 'yes',
          });
        } catch (err) {
          console.error('Failed to sync decision:', err);
        }
      },

      setCheckinResult: async (checkinResult) => {
        set({ checkinResult });

        const user = useAuthStore.getState().user;
        const { currentDecisionId } = get();

        if (user && currentDecisionId) {
          try {
            await updateDecisionCheckin(currentDecisionId, checkinResult);
          } catch (err) {
            console.error('Failed to update checkin:', err);
          }
        }
      },

      // ─── Points + achievements ────────────────────────────────────

      awardPoints: (points, reason) => {
        const state = get();
        const current = state.gamification;
        const newCP = current.clarityPoints + points;
        const newLevel = getLevel(newCP);

        const newTotalDecisions = reason === 'Created decision'
          ? current.totalDecisions + 1
          : current.totalDecisions;

        const updatedState = {
          ...state,
          gamification: {
            ...current,
            clarityPoints: newCP,
            level: newLevel.level,
            totalDecisions: newTotalDecisions,
          },
        };

        const newAchievements = ACHIEVEMENTS.filter(a =>
          !current.achievements.includes(a.id) && a.condition(updatedState)
        ).map(a => a.id);

        set({
          gamification: {
            ...current,
            clarityPoints: newCP,
            level: newLevel.level,
            totalDecisions: newTotalDecisions,
            achievements: [...current.achievements, ...newAchievements],
          },
        });

        return { leveledUp: newLevel.level > current.level, newLevel, newAchievements, points };
      },

      incrementStreak: () => {
        const state = get();
        set({
          gamification: {
            ...state.gamification,
            streak: state.gamification.streak + 1,
          },
        });
      },

      getLevelInfo: () => {
        const { gamification } = get();
        const current = getLevel(gamification.clarityPoints);
        const nextLevel = LEVELS.find(l => l.level === current.level + 1);
        const progress = nextLevel
          ? ((gamification.clarityPoints - current.minCP) / (nextLevel.minCP - current.minCP)) * 100
          : 100;
        return { current, nextLevel, progress, LEVELS };
      },

      getAchievements: () => {
        const { gamification } = get();
        return ACHIEVEMENTS.map(a => ({
          ...a,
          unlocked: gamification.achievements.includes(a.id),
        }));
      },

      // Personal bests summary
      getPersonalBests: () => {
        const { gamification } = get();
        return {
          longestStreak: gamification.longestStreak || 0,
          totalDecisions: gamification.totalDecisions || 0,
          freezeTokens: gamification.freezeTokens || 0,
          recoveryCount: gamification.recoveryCount || 0,
          clarityPoints: gamification.clarityPoints || 0,
          level: gamification.level || 1,
        };
      },

      resetDecision: () => set({
        stage: 'intake',
        decision: '',
        options: [],
        realOptions: [],
        gutChoice: null,
        fears: [],
        firstAction: '',
        actionTime: '',
        obstacle: '',
        obstacleIf: '',
        daysStuck: '',
        deadlineDays: 7,
        lockDays: 30,
        locked: false,
        checkinResult: null,
        aiMessage: '',
        aiLoading: false,
        decisionStartTime: null,
        currentDecisionId: null,
      }),
    }),
    {
      name: 'remmy-storage',
      partialize: (state) => ({
        gamification: state.gamification,
        fastDecision: state.fastDecision,
        completedLock: state.completedLock,
        resistedUnlocks: state.resistedUnlocks,
        scaryChoices: state.scaryChoices,
      }),
    }
  )
);

export { LEVELS, ACHIEVEMENTS, getLevel };
export default useRemmyStore;