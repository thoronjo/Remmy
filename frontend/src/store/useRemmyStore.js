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
];

const getLevel = (cp) => {
  return [...LEVELS].reverse().find(l => cp >= l.minCP) || LEVELS[0];
};

// Generate a simple UUID for decisions
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
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
      gamification: INITIAL_GAMIFICATION,
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

      // Save or update decision in Supabase
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

      // Called when checkin result is set
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

      // Award points and check achievements
      awardPoints: (points, reason) => {
        const state = get();
        const current = state.gamification;
        const newCP = current.clarityPoints + points;
        const newLevel = getLevel(newCP);
        const leveledUp = newLevel.level > current.level;

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

        return { leveledUp, newLevel, newAchievements, points };
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