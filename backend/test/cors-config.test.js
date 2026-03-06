const test = require('node:test');
const assert = require('node:assert/strict');

const {
  parseCsv,
  parseRegexCsv,
  getCorsConfig,
  isAllowedOrigin,
} = require('../src/config/cors');

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

test('getCorsConfig prefers env values when provided', () => {
  const oldOrigins = process.env.ALLOWED_ORIGINS;
  const oldPatterns = process.env.ALLOWED_ORIGIN_PATTERNS;

  process.env.ALLOWED_ORIGINS = 'https://custom.example.com';
  process.env.ALLOWED_ORIGIN_PATTERNS = '^https://preview\\.example\\.com$';

  const config = getCorsConfig();

  assert.deepEqual(config.allowedOrigins, ['https://custom.example.com']);
  assert.equal(config.allowedPatterns.length, 1);
  assert.equal(config.allowedPatterns[0].test('https://preview.example.com'), true);

  process.env.ALLOWED_ORIGINS = oldOrigins;
  process.env.ALLOWED_ORIGIN_PATTERNS = oldPatterns;
});

test('isAllowedOrigin checks explicit and regex origins', () => {
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
