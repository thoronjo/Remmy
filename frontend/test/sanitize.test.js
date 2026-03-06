import test from 'node:test';
import assert from 'node:assert/strict';

import { sanitize } from '../src/services/sanitize.js';

test('sanitize trims and truncates strings', () => {
  assert.equal(sanitize('  hello  ', 10), 'hello');
  assert.equal(sanitize('abcdefgh', 5), 'abcde');
});

test('sanitize returns empty string for non-string input', () => {
  assert.equal(sanitize(undefined), '');
  assert.equal(sanitize(42), '');
  assert.equal(sanitize({}), '');
});
