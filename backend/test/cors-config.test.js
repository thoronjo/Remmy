const test = require('node:test');
const assert = require('node:assert/strict');

const {
  parseCsv,
  parseRegexCsv,
  getCorsConfig,
  isAllowedOrigin,
} = require('../src/config/cors');

const withEnv = (updates, fn) => {
  const previous = {};
  for (const key of Object.keys(updates)) {
    previous[key] = process.env[key];
    if (updates[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = updates[key];
    }
  }

  try {
    fn();
  } finally {
    for (const key of Object.keys(updates)) {
      if (previous[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous[key];
      }
    }
  }
};

test('parseCsv returns trimmed entries', () => {
  assert.deepEqual(parseCsv('  http://a.com, http://b.com ,, '), [
    'http://a.com',
    'http://b.com',
  ]);
});

test('parseRegexCsv ignores invalid regex entries', () => {
  const patterns = parseRegexCsv('^https://ok\\.com$,([invalid');
  assert.equal(patterns.length, 1);
  assert.equal(patterns[0].test('https://ok.com'), true);
});

test('getCorsConfig uses env origins in production and disables patterns', () => {
  withEnv(
    {
      NODE_ENV: 'production',
      ALLOWED_ORIGINS: 'https://app.example.com,https://www.example.com',
      ALLOWED_ORIGIN_PATTERNS: '^https://preview\\.example\\.com$',
    },
    () => {
      const config = getCorsConfig();
      assert.deepEqual(config.allowedOrigins, ['https://app.example.com', 'https://www.example.com']);
      assert.equal(config.allowedPatterns.length, 0);
    }
  );
});

test('getCorsConfig uses localhost defaults in development', () => {
  withEnv(
    {
      NODE_ENV: 'development',
      ALLOWED_ORIGINS: '',
      ALLOWED_ORIGIN_PATTERNS: '',
    },
    () => {
      const config = getCorsConfig();
      assert.deepEqual(config.allowedOrigins, ['http://localhost:5173', 'http://localhost:4173']);
      assert.equal(config.allowedPatterns.length, 0);
    }
  );
});

test('isAllowedOrigin checks exact and regex origins', () => {
  const exactAllowed = isAllowedOrigin(
    'https://a.example.com',
    ['https://a.example.com'],
    []
  );
  const patternAllowed = isAllowedOrigin(
    'https://preview.example.com',
    [],
    [/^https:\/\/preview\.example\.com$/]
  );
  const denied = isAllowedOrigin(
    'https://blocked.example.com',
    ['https://a.example.com'],
    [/^https:\/\/preview\.example\.com$/]
  );

  assert.equal(exactAllowed, true);
  assert.equal(patternAllowed, true);
  assert.equal(denied, false);
});
