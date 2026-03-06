import axios from 'axios';
import { sanitize } from './sanitize';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export const askRemmy = async (message, stage, context = {}) => {
  try {
    const response = await api.post('/api/ai/chat', {
      message: sanitize(message, 2000),
      stage: sanitize(stage, 50),
      context: {
        decision: sanitize(context.decision || '', 500),
        gutChoice: sanitize(context.gutChoice || '', 200),
        daysStuck: sanitize(context.daysStuck || '', 50),
      },
    });
    return response.data.reply;
  } catch (err) {
    if (err.response?.status === 429) {
      return 'Remmy needs a breather. Too many requests. Try again in a few minutes.';
    }
    if (err.response?.status === 400) {
      return "Something about that input did not work. Try rephrasing.";
    }
    return 'Remmy is thinking hard. Check your connection and try again.';
  }
};
