import { supabase } from './supabase';

// ─── Gamification ────────────────────────────────────────────────

export const loadGamification = async (userId) => {
  const { data, error } = await supabase
    .from('gamification')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const saveGamification = async (userId, gamification) => {
  const { error } = await supabase
    .from('gamification')
    .update({
      clarity_points: gamification.clarityPoints,
      level: gamification.level,
      streak: gamification.streak,
      total_decisions: gamification.totalDecisions,
      achievements: gamification.achievements,
    })
    .eq('user_id', userId);

  if (error) throw error;
};

// ─── Decisions ───────────────────────────────────────────────────

export const saveDecision = async (userId, decisionData) => {
  const { data, error } = await supabase
    .from('decisions')
    .upsert({
      id: decisionData.id,
      user_id: userId,
      decision: decisionData.decision,
      options: decisionData.options,
      gut_choice: decisionData.gutChoice,
      fears: decisionData.fears,
      first_action: decisionData.firstAction,
      action_time: decisionData.actionTime,
      days_stuck: decisionData.daysStuck,
      checkin_result: decisionData.checkinResult,
      completed: decisionData.completed || false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const loadDecisions = async (userId) => {
  const { data, error } = await supabase
    .from('decisions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateDecisionCheckin = async (decisionId, checkinResult) => {
  const { error } = await supabase
    .from('decisions')
    .update({
      checkin_result: checkinResult,
      completed: checkinResult === 'yes',
    })
    .eq('id', decisionId);

  if (error) throw error;
};