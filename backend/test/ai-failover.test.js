const test = require('node:test');
const assert = require('node:assert/strict');

const {
  AIOrchestrator,
  CircuitBreaker,
  MonthlyBudgetLedger,
  ProviderError,
} = require('../src/services/aiFailover');

test('falls back to second provider when first fails', async () => {
  const firstProvider = {
    name: 'anthropic',
    run: async () => {
      throw new ProviderError('anthropic', 'provider down', { retryable: false });
    },
  };

  const secondProvider = {
    name: 'qwen',
    run: async () => 'fallback response',
  };

  const orchestrator = new AIOrchestrator({
    providers: new Map([
      ['anthropic', firstProvider],
      ['qwen', secondProvider],
    ]),
    providerOrder: ['anthropic', 'qwen'],
    timeoutMs: 50,
    maxRetries: 0,
    breaker: new CircuitBreaker({ failureThreshold: 2, cooldownMs: 1000 }),
    budgetLedger: new MonthlyBudgetLedger(10, 0.1),
  });

  const result = await orchestrator.generate({
    userId: 'user-1',
    message: 'hello',
    stage: 'intake',
    context: {},
  });

  assert.equal(result.provider, 'qwen');
  assert.equal(result.reply, 'fallback response');
});

test('opens circuit after repeated failures and skips provider', async () => {
  let anthropicCalls = 0;

  const firstProvider = {
    name: 'anthropic',
    run: async () => {
      anthropicCalls += 1;
      throw new ProviderError('anthropic', 'down', { retryable: false });
    },
  };

  const secondProvider = {
    name: 'qwen',
    run: async () => 'ok from qwen',
  };

  const orchestrator = new AIOrchestrator({
    providers: new Map([
      ['anthropic', firstProvider],
      ['qwen', secondProvider],
    ]),
    providerOrder: ['anthropic', 'qwen'],
    timeoutMs: 50,
    maxRetries: 0,
    breaker: new CircuitBreaker({ failureThreshold: 1, cooldownMs: 60_000 }),
    budgetLedger: new MonthlyBudgetLedger(10, 0.1),
  });

  const first = await orchestrator.generate({
    userId: 'user-2',
    message: 'hello',
    stage: 'intake',
    context: {},
  });

  const second = await orchestrator.generate({
    userId: 'user-2',
    message: 'hello again',
    stage: 'intake',
    context: {},
  });

  assert.equal(first.provider, 'qwen');
  assert.equal(second.provider, 'qwen');
  assert.equal(anthropicCalls, 1);
});

test('rejects requests when monthly budget is exceeded', async () => {
  const onlyProvider = {
    name: 'qwen',
    run: async () => 'ok',
  };

  const orchestrator = new AIOrchestrator({
    providers: new Map([['qwen', onlyProvider]]),
    providerOrder: ['qwen'],
    timeoutMs: 50,
    maxRetries: 0,
    breaker: new CircuitBreaker({ failureThreshold: 2, cooldownMs: 1000 }),
    budgetLedger: new MonthlyBudgetLedger(0.15, 0.1),
  });

  await orchestrator.generate({
    userId: 'budget-user',
    message: 'one',
    stage: 'intake',
    context: {},
  });

  await assert.rejects(
    () =>
      orchestrator.generate({
        userId: 'budget-user',
        message: 'two',
        stage: 'intake',
        context: {},
      }),
    /AI budget exceeded/
  );
});
