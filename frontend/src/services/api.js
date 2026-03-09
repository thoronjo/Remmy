import axios from 'axios';
import { sanitize } from './sanitize';
import { supabase } from './supabase';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

const getAccessToken = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    return null;
  }

  return data?.session?.access_token || null;
};

export const askRemmy = async (message, stage, context = {}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return 'Please sign in to continue with AI coaching.';
    }

    const response = await api.post(
      '/api/ai/chat',
      {
        message: sanitize(message, 2000),
        stage: sanitize(stage, 50),
        context: {
          decision: sanitize(context.decision || '', 500),
          gutChoice: sanitize(context.gutChoice || '', 200),
          daysStuck: sanitize(context.daysStuck || '', 50),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data.reply;
  } catch (err) {
    if (err.response?.status === 401) {
      return 'Your session expired. Please sign in again.';
    }
    if (err.response?.status === 429) {
      return 'Remmy needs a breather. Too many requests. Try again in a few minutes.';
    }
    if (err.response?.status === 400) {
      return 'Something about that input did not work. Try rephrasing.';
    }
    return 'Remmy is thinking hard. Check your connection and try again.';
  }
};
