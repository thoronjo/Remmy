const Anthropic = require('@anthropic-ai/sdk');

const REMMY_SYSTEM_PROMPT = `You are Remmy - the AI brain behind a cat mascot who helps overthinkers stop overthinking and start deciding.

Your personality:
- Direct and honest, never cruel
- Calls out avoidance patterns by name
- Cites real psychology briefly (Kahneman, Gollwitzer, Steel, CBT)
- Short punchy responses - never more than 150 words
- Occasionally dry humor, never sarcastic at the user's expense
- You genuinely want the user to win
- No bullet points. Short paragraphs only.
- Never say "I understand" or "Great question"
- Speak like a brilliant, caring friend who won't let you off the hook

The user is an intelligent overthinker who has been stuck in analysis paralysis.
Your job: Help them decide, commit, and act. In that order.`;

const STAGE_PROMPTS = {
  intake: 'User is describing their decision for the first time. Acknowledge it briefly, call out how long they have been stuck, then set up the process ahead.',
  narrowing: 'User is eliminating fake options. Call out safety options directly. Be firm.',
  gut_check: 'User just did their 60-second gut check. Challenge why they are second-guessing their gut answer.',
  resistance: 'User is listing fears. Ask them to keep going, get it all out. No filtering.',
  anxiety_analysis: 'Analyze the fears. Separate rational concerns from anxiety masquerading as wisdom. Be surgical.',
  deadline: 'User is setting their commitment deadline. Make the weight of this commitment feel real.',
  committed: 'User just committed. Brief celebration, then immediately pivot to execution. What is the first action?',
  implementation: 'User is building their action plan. Make the if-then plan concrete and binding.',
  checkin: 'User is checking in on their first action. If they did it, celebrate briefly then push forward. If they did not, call it out directly.',
};

const DEFAULT_PROVIDER_ORDER = ['anthropic', 'qwen', 'gemini', 'groq'];
const DEFAULT_TIMEOUT_MS = 12000;
const DEFAULT_MAX_RETRIES = 1;
const DEFAULT_BREAKER_THRESHOLD = 3;
const DEFAULT_BREAKER_COOLDOWN_MS = 60000;
const DEFAULT_MONTHLY_BUDGET_USD = 15;
const DEFAULT_ESTIMATED_REQUEST_COST_USD = 0.002;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseProviderOrder = () => {
  const raw = (process.env.AI_PROVIDER_ORDER || DEFAULT_PROVIDER_ORDER.join(',')).trim();
  const selected = raw
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const unique = [...new Set(selected)];
  return unique.length ? unique : DEFAULT_PROVIDER_ORDER;
};

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getMonthKey = (date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

const isRetryableStatus = (status) => status === 429 || (status >= 500 && status <= 599);

const parseErrorMessage = async (response) => {
  try {
    const data = await response.json();
    return data?.error?.message || data?.message || `HTTP ${response.status}`;
  } catch (err) {
    return `HTTP ${response.status}`;
  }
};

class ProviderError extends Error {
  constructor(provider, message, options = {}) {
    super(message);
    this.name = 'ProviderError';
    this.provider = provider;
    this.status = options.status || null;
    this.retryable = Boolean(options.retryable);
    this.code = options.code || null;
  }
}

class CircuitBreaker {
  constructor({ failureThreshold, cooldownMs }) {
    this.failureThreshold = failureThreshold;
    this.cooldownMs = cooldownMs;
    this.failures = new Map();
    this.openUntil = new Map();
  }

  canTry(provider) {
    const openUntil = this.openUntil.get(provider) || 0;
    return openUntil <= Date.now();
  }

  recordSuccess(provider) {
    this.failures.delete(provider);
    this.openUntil.delete(provider);
  }

  recordFailure(provider) {
    const next = (this.failures.get(provider) || 0) + 1;
    this.failures.set(provider, next);
    if (next >= this.failureThreshold) {
      this.openUntil.set(provider, Date.now() + this.cooldownMs);
    }
  }
}

class MonthlyBudgetLedger {
  constructor(monthlyBudgetUsd, estimatedRequestCostUsd) {
    this.monthlyBudgetUsd = monthlyBudgetUsd;
    this.estimatedRequestCostUsd = estimatedRequestCostUsd;
    this.usageByUser = new Map();
  }

  ensureBudget(userId) {
    const monthKey = getMonthKey(new Date());
    const current = this.usageByUser.get(userId);
    const spent = current?.monthKey === monthKey ? current.spentUsd : 0;
    if ((spent + this.estimatedRequestCostUsd) > this.monthlyBudgetUsd) {
      throw new Error('AI budget exceeded');
    }
  }

  commit(userId) {
    const monthKey = getMonthKey(new Date());
    const current = this.usageByUser.get(userId);
    const spent = current?.monthKey === monthKey ? current.spentUsd : 0;
    this.usageByUser.set(userId, {
      monthKey,
      spentUsd: spent + this.estimatedRequestCostUsd,
    });
  }
}

const buildUserMessage = (message, context) => {
  let contextStr = '';
  if (context && typeof context === 'object') {
    if (context.decision) contextStr += `Decision: ${String(context.decision).slice(0, 500)}\n`;
    if (context.gutChoice) contextStr += `Gut choice: ${String(context.gutChoice).slice(0, 200)}\n`;
    if (context.daysStuck) contextStr += `Days stuck: ${String(context.daysStuck).slice(0, 50)}\n`;
  }
  return contextStr ? `${contextStr}\nUser message: ${message}` : message;
};

const buildSystemPrompt = (stage) => {
  const stagePrompt = STAGE_PROMPTS[stage] || '';
  return `${REMMY_SYSTEM_PROMPT}\n\nCurrent stage: ${stage}\n${stagePrompt}`;
};

const createAnthropicProvider = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

  return {
    name: 'anthropic',
    run: async ({ system, userMessage, signal }) => {
      try {
        const response = await client.messages.create({
          model,
          max_tokens: 300,
          system,
          messages: [{ role: 'user', content: userMessage }],
          signal,
        });
        const text = response?.content?.[0]?.text || '';
        if (!text) throw new ProviderError('anthropic', 'No response text from Anthropic');
        return text;
      } catch (err) {
        if (err instanceof ProviderError) throw err;
        const status = err?.status || err?.statusCode || null;
        const retryable = err?.name === 'AbortError' || isRetryableStatus(status);
        throw new ProviderError('anthropic', err?.message || 'Anthropic request failed', {
          status,
          retryable,
          code: err?.error?.type || err?.code || null,
        });
      }
    },
  };
};

const createOpenAiCompatibleProvider = ({ name, apiKeyEnv, baseUrlEnv, defaultBaseUrl, modelEnv, defaultModel }) => {
  const apiKey = process.env[apiKeyEnv];
  if (!apiKey) return null;
  const baseUrl = (process.env[baseUrlEnv] || defaultBaseUrl).replace(/\/+$/, '');
  const model = process.env[modelEnv] || defaultModel;

  return {
    name,
    run: async ({ system, userMessage, signal }) => {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 300,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: userMessage },
          ],
        }),
      });

      if (!response.ok) {
        const message = await parseErrorMessage(response);
        throw new ProviderError(name, message, {
          status: response.status,
          retryable: isRetryableStatus(response.status),
        });
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content || '';
      if (!text) throw new ProviderError(name, `${name} returned an empty response`);
      return text;
    },
  };
};

const responseDataToGeminiText = (data) => {
  return data?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text || '')
    .join('')
    .trim();
};

const createGeminiProvider = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const baseUrl = (process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com').replace(/\/+$/, '');

  return {
    name: 'gemini',
    run: async ({ system, userMessage, signal }) => {
      const endpoint = `${baseUrl}/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          generationConfig: { maxOutputTokens: 300 },
        }),
      });

      if (!response.ok) {
        const message = await parseErrorMessage(response);
        throw new ProviderError('gemini', message, {
          status: response.status,
          retryable: isRetryableStatus(response.status),
        });
      }

      const text = responseDataToGeminiText(await response.json());
      if (!text) throw new ProviderError('gemini', 'gemini returned an empty response');
      return text;
    },
  };
};

const createProviders = () => {
  const map = new Map();
  const anthropic = createAnthropicProvider();
  const qwen = createOpenAiCompatibleProvider({
    name: 'qwen',
    apiKeyEnv: 'QWEN_API_KEY',
    baseUrlEnv: 'QWEN_BASE_URL',
    defaultBaseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
    modelEnv: 'QWEN_MODEL',
    defaultModel: 'qwen-plus',
  });
  const groq = createOpenAiCompatibleProvider({
    name: 'groq',
    apiKeyEnv: 'GROQ_API_KEY',
    baseUrlEnv: 'GROQ_BASE_URL',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    modelEnv: 'GROQ_MODEL',
    defaultModel: 'llama-3.3-70b-versatile',
  });
  const gemini = createGeminiProvider();

  [anthropic, qwen, gemini, groq].filter(Boolean).forEach((provider) => {
    map.set(provider.name, provider);
  });
  return map;
};

class AIOrchestrator {
  constructor(options = {}) {
    this.providers = options.providers || createProviders();
    this.providerOrder = options.providerOrder || parseProviderOrder();
    this.timeoutMs = options.timeoutMs || toNumber(process.env.AI_REQUEST_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);
    this.maxRetries = options.maxRetries || toNumber(process.env.AI_PROVIDER_MAX_RETRIES, DEFAULT_MAX_RETRIES);
    this.breaker = options.breaker || new CircuitBreaker({
      failureThreshold: toNumber(process.env.AI_CIRCUIT_FAILURE_THRESHOLD, DEFAULT_BREAKER_THRESHOLD),
      cooldownMs: toNumber(process.env.AI_CIRCUIT_OPEN_MS, DEFAULT_BREAKER_COOLDOWN_MS),
    });
    this.budgetLedger = options.budgetLedger || new MonthlyBudgetLedger(
      toNumber(process.env.AI_USER_MONTHLY_CAP_USD, DEFAULT_MONTHLY_BUDGET_USD),
      toNumber(process.env.AI_ESTIMATED_COST_PER_REQUEST_USD, DEFAULT_ESTIMATED_REQUEST_COST_USD)
    );
  }

  getEnabledProviders() {
    return this.providerOrder
      .map((name) => this.providers.get(name))
      .filter(Boolean)
      .filter((provider) => this.breaker.canTry(provider.name));
  }

  async callProvider(provider, payload) {
    let lastErr;
    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const reply = await provider.run({
          ...payload,
          signal: controller.signal,
        });
        clearTimeout(timeout);
        return { reply, provider: provider.name };
      } catch (err) {
        clearTimeout(timeout);
        lastErr = err;
        const retryable = err?.name === 'AbortError' || err?.retryable === true;
        if (!retryable || attempt === this.maxRetries) break;
        await sleep(250 * 2 ** attempt);
      }
    }
    throw lastErr;
  }

  async generate({ userId, message, stage, context }) {
    this.budgetLedger.ensureBudget(userId);
    const system = buildSystemPrompt(stage);
    const userMessage = buildUserMessage(message, context);

    const providers = this.getEnabledProviders();
    if (!providers.length) throw new Error('No AI providers are currently available');

    const failures = [];
    for (const provider of providers) {
      try {
        const result = await this.callProvider(provider, { system, userMessage });
        this.breaker.recordSuccess(provider.name);
        this.budgetLedger.commit(userId);
        return result;
      } catch (err) {
        this.breaker.recordFailure(provider.name);
        failures.push(`${provider.name}: ${err?.message || 'unknown error'}`);
      }
    }

    throw new Error(`All providers failed: ${failures.join(' | ')}`);
  }
}

const aiOrchestrator = new AIOrchestrator();

module.exports = {
  aiOrchestrator,
  AIOrchestrator,
  CircuitBreaker,
  MonthlyBudgetLedger,
  buildSystemPrompt,
  buildUserMessage,
  parseProviderOrder,
  ProviderError,
};
