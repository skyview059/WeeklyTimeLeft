/* Pure calculations shared by the browser and Node tests. Windows are exactly 168 hours. */
(function (root) {
  const WEEK = 7 * 24 * 60 * 60 * 1000;
  function cycleAt(start, now) {
    const anchor = new Date(start).getTime();
    if (!Number.isFinite(anchor) || !Number.isFinite(now)) throw new Error('Invalid date');
    if (now < anchor) return { start: anchor, end: anchor + WEEK, remaining: 1, future: true };
    const cycleStart = anchor + Math.floor((now - anchor) / WEEK) * WEEK;
    return { start: cycleStart, end: cycleStart + WEEK, remaining: (cycleStart + WEEK - now) / WEEK, future: false };
  }
  function readingPercent(mode, remaining, limit) {
    if (!Number.isFinite(remaining) || remaining < 0) throw new Error('Remaining quota must be zero or greater.');
    if (mode === 'tokens' && (!Number.isSafeInteger(limit) || limit <= 0 || !Number.isSafeInteger(remaining))) throw new Error('Use whole token counts and a positive weekly limit.');
    const maximum = mode === 'tokens' ? limit : 100;
    if (remaining > maximum) throw new Error('Remaining quota cannot exceed your weekly limit.');
    return remaining / maximum * 100;
  }
  const api = { WEEK, cycleAt, readingPercent };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Weekwise = api;
})(typeof window !== 'undefined' ? window : globalThis);
