import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Sanitize string input before sending
const sanitize = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, 2000);
};

export const askRemmy = async (message, stage, context = {}) => {
  try {
    const response = await api.post('/api/ai/chat', {
      message: sanitize(message),
      stage: sanitize(stage),
      context: {
        decision: sanitize(context.decision || ''),
        gutChoice: sanitize(context.gutChoice || ''),
        daysStuck: sanitize(context.daysStuck || ''),
      },
    });
    return response.data.reply;
  } catch (err) {
    if (err.response?.status === 429) {
      return "Remmy needs a breather. Too many requests. Try again in a few minutes.";
    }
    if (err.response?.status === 400) {
      return "Something about that input didn't work. Try rephrasing.";
    }
    return "Remmy is thinking hard. Check your connection and try again.";
  }
};