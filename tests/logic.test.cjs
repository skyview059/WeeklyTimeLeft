const test = require('node:test');
const assert = require('node:assert/strict');
const { WEEK, cycleAt, readingPercent } = require('../logic.js');
const start = '2026-11-01T12:00:00.000Z';
const anchor = Date.parse(start);
test('halfway through a week, half the time remains', () => {
  assert.equal(cycleAt(start, anchor + WEEK / 2).remaining, 0.5);
});
test('reset boundary advances exactly once and restores full time', () => {
  assert.deepEqual(cycleAt(start, anchor + WEEK), { start: anchor + WEEK, end: anchor + WEEK * 2, remaining: 1, future: false });
});
test('missed weeks advance to the current cycle', () => {
  assert.equal(cycleAt(start, anchor + WEEK * 8.5).start, anchor + WEEK * 8);
});
test('future start keeps a full week without a negative elapsed time', () => {
  assert.equal(cycleAt(start, anchor - 1000).remaining, 1);
  assert.equal(cycleAt(start, anchor - 1000).future, true);
});
test('remaining token counts convert to percentages including exhaustion', () => {
  assert.equal(readingPercent('tokens', 43000, 100000), 43);
  assert.equal(readingPercent('tokens', 0, 100000), 0);
  assert.equal(readingPercent('percent', 100, 100), 100);
});
test('invalid or excessive quotas are rejected', () => {
  for (const args of [['percent', -1, 100], ['percent', 101, 100], ['tokens', 1, 0], ['tokens', 1.5, 10], ['tokens', 11, 10], ['percent', NaN, 100]]) assert.throws(() => readingPercent(...args));
});
