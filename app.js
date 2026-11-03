'use strict';
const $ = id => document.getElementById(id);
const STORAGE_KEY = 'weekwise.v1';
const { cycleAt, readingPercent } = Weekwise;
let active = 'codex';
let data = { codex: null, claude: null };
let storageWarning = '';
try {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (stored && typeof stored === 'object') {
    for (const provider of ['codex', 'claude']) {
      const p = stored[provider];
      if (p && Number.isFinite(Date.parse(p.start)) && ['tokens', 'percent'].includes(p.mode) && Array.isArray(p.readings)) {
        p.readings = p.readings.filter(r => Number.isFinite(r.at) && Number.isFinite(r.cycle) && Number.isFinite(r.percent) && r.percent >= 0 && r.percent <= 100 && Number.isFinite(r.remaining)).slice(-100);
        // Preserve old percentage and token-mode readings as subscription percentages.
        p.readings = p.readings.map(r => ({ ...r, remaining: r.percent }));
        data[provider] = { ...p, mode: 'percent', limit: 100, plan: typeof p.plan === 'string' ? p.plan.slice(0, 40) : '' };
      }
    }
  }
} catch { storageWarning = 'Browser storage is unavailable or unreadable. New readings will work for this session.'; }
const name = () => active === 'codex' ? 'Codex' : 'Claude';
const date = (value, options = {}) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', ...options }).format(value);
const fullDate = value => date(value, { weekday: 'short', hour: 'numeric', minute: '2-digit' });
const pct = value => `${value.toFixed(1)}%`;
const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
function setBar(id, value) { $(id).style.width = `${Math.max(0, Math.min(100, value))}%`; }
function localInput(value) { const d = new Date(value); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
function render() {
  const now = Date.now(), profile = data[active];
  const cycle = profile ? cycleAt(profile.start, now) : null;
  const latest = profile?.readings.at(-1);
  const current = latest && cycle && latest.cycle === cycle.start ? latest : null;
  const time = cycle ? cycle.remaining * 100 : 0;
  const quota = current?.percent ?? 0;
  $('today-date').textContent = date(now, { weekday: 'long', year: 'numeric' });
  $('timezone').textContent = zone;
  $('provider-title').textContent = `${name()}${profile?.plan ? ` · ${profile.plan}` : ''} · weekly overview`;
  $('cycle-label').textContent = cycle ? `${fullDate(cycle.start)} — ${fullDate(cycle.end)}` : 'A fresh view of your weekly allowance';
  $('state-label').textContent = !cycle ? 'Not configured' : cycle.future ? 'Scheduled' : 'Current week';
  const warning = storageWarning || (!cycle ? 'Start with Week settings: choose your weekly start time and enter your remaining usage percentage.' : cycle.future ? 'Your weekly window has not started yet. Time remaining shows the full week; pacing begins at your start time.' : !current ? 'A new weekly window has started. Update your usage to confirm the current usage percentage; old readings are not carried forward.' : '');
  $('notice').textContent = warning; $('notice').hidden = !warning;
  if (cycle) {
    const mins = Math.ceil((cycle.end - Math.max(now, cycle.start)) / 60000);
    $('countdown').innerHTML = `${Number((cycle.remaining * 7).toFixed(2))}<small> / 7 days</small>`;
    $('time-percent').textContent = `${Math.floor(mins / 1440)}d ${Math.floor(mins % 1440 / 60)}h ${mins % 60}m left · ${pct(time)} remaining`;
  } else $('countdown').textContent = '—';
  if (!cycle) $('time-percent').textContent = 'Set your weekly start time';
  $('reset-short').textContent = cycle ? date(cycle.end, { weekday: 'short', hour: 'numeric', minute: '2-digit' }) : '—';
  $('quota-number').innerHTML = current ? `${Number(quota.toFixed(1))}%<small> / 100%</small>` : '—';
  $('quota-detail').textContent = current ? `Usage left until reset · ${pct(100 - quota)} used` : 'Enter the % left shown by your provider';
  $('updated-at').textContent = current ? `As of ${date(current.at, { hour: 'numeric', minute: '2-digit' })}` : 'Manually tracked';
  const ratio = current && cycle && !cycle.future ? quota / time : null;
  $('ratio-number').innerHTML = ratio !== null ? `${ratio > 999 ? '999+' : ratio.toFixed(2)}<small>×</small>` : '—';
  $('ratio-detail').textContent = ratio === null ? 'Your pacing at a glance' : quota === 0 ? 'Weekly usage exhausted' : ratio >= 1 ? 'You have breathing room' : 'A slower pace will stretch your usage';
  $('pace-note').textContent = ratio === null ? '1.00× means usage and time are in balance.' : `${Math.abs(quota - time).toFixed(1)} percentage points ${quota >= time ? 'above' : 'below'} time remaining.`;
  for (const id of ['time-bar','timeline-time']) setBar(id, time);
  for (const id of ['quota-bar','timeline-quota']) setBar(id, quota);
  $('timeline-time-label').textContent = cycle ? pct(time) : '—';
  $('timeline-quota-label').textContent = current ? pct(quota) : '—';
  $('week-strip').replaceChildren();
  for (let i = 0; i < 7; i++) {
    const start = cycle ? cycle.start + i * 86400000 : null;
    const day = document.createElement('div');
    day.className = 'day' + (start !== null && now >= start + 86400000 ? ' past' : start !== null && now >= start ? ' current' : '');
    const label = document.createElement('span'), sub = document.createElement('small');
    label.textContent = start !== null ? date(start, { weekday: 'short', month: undefined, day: undefined }) : `Day ${i+1}`;
    sub.textContent = day.classList.contains('current') ? 'NOW' : start !== null ? date(start) : '—';
    if (start !== null) day.title = `${fullDate(start)} to ${fullDate(start + 86400000)}`;
    day.append(label, sub); $('week-strip').append(day);
  }
  $('start-label').textContent = cycle ? `Start · ${fullDate(cycle.start)}` : 'Start your week in settings';
  $('end-label').textContent = cycle ? `Reset · ${fullDate(cycle.end)}` : '';
  const history = profile?.readings.slice(-5).reverse() ?? [];
  $('history-count').textContent = `${history.length} recent reading${history.length === 1 ? '' : 's'}`;
  $('history-list').replaceChildren();
  if (!history.length) { const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = 'Your story starts with a check-in. Update your usage whenever you want a fresh picture of the week.'; $('history-list').append(empty); }
  history.forEach(r => {
    const row = document.createElement('div'); row.className = 'history-item';
    const left = document.createElement('div'); left.textContent = fullDate(r.at);
    const sub = document.createElement('span'); sub.textContent = r.cycle === cycle.start ? 'Current window · manual update' : 'Previous window · manual update'; left.append(sub);
    const right = document.createElement('strong'); right.textContent = `${pct(r.percent)} left`;
    row.append(left, right); $('history-list').append(row);
  });
  if (current && cycle && !cycle.future) {
    const days = cycle.remaining * 7;
    const allowance = `${(quota / days).toFixed(1)}% of weekly usage`;
    $('budget').textContent = `${allowance} / day`;
    $('budget-detail').textContent = `An even pace for the remaining ${days.toFixed(1)} days, based on your latest reading. ${days < 1 ? 'Less than a day remains; this is a 24-hour equivalent rate. ' : ''}Update usage after a work session to keep this useful.`;
  } else { $('budget').textContent = 'Your week. Your pace.'; $('budget-detail').textContent = 'Set your weekly start and add a usage percentage to see a daily allowance.'; }
}
function openSettings(focusUsage = false) {
  const p = data[active];
  $('form-provider').textContent = name().toUpperCase();
  $('start-input').value = localInput(p?.start || Date.now());
  $('plan-input').value = p?.plan || '';
  const latest = p?.readings.at(-1);
  const fresh = p && latest?.cycle === cycleAt(p.start, Date.now()).start;
  $('remaining-input').value = fresh ? latest.remaining : '';
  $('timezone-help').textContent = `Local timezone: ${zone}. Each window lasts exactly 168 hours.`;
  $('form-error').textContent = ''; $('settings-dialog').showModal();
  if (focusUsage) $('remaining-input').focus();
}
document.querySelectorAll('[data-provider]').forEach(button => {
  button.addEventListener('click', () => {
    active = button.dataset.provider;
    document.querySelectorAll('[data-provider]').forEach(b => { b.setAttribute('aria-selected', String(b === button)); b.tabIndex = b === button ? 0 : -1; });
    $('dashboard').setAttribute('aria-labelledby', button.id); render();
  });
  button.addEventListener('keydown', event => { if (['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) { event.preventDefault(); const target = event.key === 'Home' ? $('tab-codex') : event.key === 'End' ? $('tab-claude') : document.querySelector(`[data-provider="${active === 'codex' ? 'claude' : 'codex'}"]`); target.click(); target.focus(); } });
});
$('edit').addEventListener('click', () => openSettings());
$('update').addEventListener('click', () => openSettings(true));
document.querySelectorAll('.close').forEach(b => b.addEventListener('click', () => $('settings-dialog').close()));
$('settings-form').addEventListener('submit', event => {
  event.preventDefault();
  try {
    const start = new Date($('start-input').value).toISOString();
    const mode = 'percent', limit = 100;
    const plan = $('plan-input').value.trim();
    const remaining = Number($('remaining-input').value);
    const percent = readingPercent(mode, remaining, limit);
    const at = Date.now(), cycle = cycleAt(start, at).start;
    const previous = data[active];
    // Changing the quota definition starts a new history to avoid mixing unlike readings.
    const readings = previous?.start === start && previous?.mode === mode && previous?.limit === limit ? [...previous.readings] : [];
    readings.push({ at, cycle, remaining, percent });
    data[active] = { start, mode, limit, plan, readings: readings.slice(-100) };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); storageWarning = ''; }
    catch { storageWarning = 'Your changes are active for this session, but browser storage could not save them.'; }
    $('settings-dialog').close(); render();
    $('toast').textContent = storageWarning || `${name()} usage updated`; $('toast').hidden = false;
    setTimeout(() => { $('toast').hidden = true; }, 3500);
  } catch (error) { $('form-error').textContent = error.message; }
});
render(); setInterval(render, 15000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
