// Progress, practice log and settings, persisted in localStorage.

const KEY = 'surtaal-v1';

const defaults = () => ({
  completed: {},          // lessonId -> ISO date completed
  log: {},                // 'YYYY-MM-DD' -> minutes practised
  lastLesson: null,
  settings: { saMidi: 53 }, // Sa = F3 until the learner picks their own
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      const base = defaults();
      return { ...base, ...saved, settings: { ...base.settings, ...(saved.settings || {}) } };
    }
  } catch { /* storage unavailable or corrupt: start fresh */ }
  return defaults();
}

let state = load();
const listeners = new Set();

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ }
  listeners.forEach((fn) => fn(state));
}

export function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const store = {
  get: () => state,
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  isDone: (id) => Boolean(state.completed[id]),
  complete(id, minutes = 0) {
    if (state.completed[id]) return false;
    state.completed[id] = new Date().toISOString();
    if (minutes) state.log[dayKey()] = (state.log[dayKey()] || 0) + minutes;
    save();
    return true;
  },
  setLastLesson(id) { state.lastLesson = id; save(); },

  logMinutes(minutes) {
    if (minutes <= 0) return;
    state.log[dayKey()] = (state.log[dayKey()] || 0) + minutes;
    save();
  },
  minutesOn: (key) => state.log[key] || 0,
  totalMinutes: () => Object.values(state.log).reduce((a, b) => a + b, 0),

  // Consecutive practice days ending today (or yesterday, so the streak survives until tonight).
  streak() {
    const day = new Date();
    if (!state.log[dayKey(day)]) day.setDate(day.getDate() - 1);
    let count = 0;
    while (state.log[dayKey(day)]) { count++; day.setDate(day.getDate() - 1); }
    return count;
  },

  setting: (key) => state.settings[key],
  setSetting(key, value) { state.settings[key] = value; save(); },

  reset() { state = defaults(); save(); },
};
