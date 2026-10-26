// Progress, practice log and settings, persisted in localStorage.

const KEY = 'surtaal-v1';

const defaults = () => ({
  completed: {},          // lessonId -> ISO date completed
  log: {},                // 'YYYY-MM-DD' -> minutes practised
  practice: {},           // lessonId -> { exerciseIndex: best score % }
  practicePassed: {},     // lessonId -> { exerciseIndex: true }
  practiceDone: {},       // lessonId -> ISO date every practical exercise was passed
  carrySeconds: 0,        // practice time not yet a whole minute
  lastLesson: null,
  badges: {},             // badgeId -> ISO date earned
  songs: {},              // songId -> best sing-along score %
  mySongs: {},            // songId -> song typed in by the learner (see data/mysongs.js)
  trackLyrics: {},        // audio file name -> lyrics pasted for it
  settings: { saMidi: 53 }, // Sa = F3 until the learner picks their own
});

const withDefaults = (saved) => {
  const base = defaults();
  return { ...base, ...saved, settings: { ...base.settings, ...(saved.settings || {}) } };
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return withDefaults(JSON.parse(raw));
  } catch { /* storage unavailable or corrupt: start fresh */ }
  return defaults();
}

// Backup files: { app: 'surtaal', version: 1, saved: ISO date, state }.
export function makeBackup(s) {
  return JSON.stringify({ app: 'surtaal', version: 1, saved: new Date().toISOString(), state: s }, null, 1);
}

// Returns the progress inside a backup file, or throws a readable error.
export function parseBackup(text) {
  let data;
  const fail = (code, message) => Object.assign(new Error(message), { code });
  try { data = JSON.parse(text); } catch { throw fail('backup.invalid', 'This file is not a SurTaal progress backup.'); }
  const s = data?.state;
  if (data?.app !== 'surtaal' || !s || typeof s !== 'object') throw fail('backup.invalid', 'This file is not a SurTaal progress backup.');
  for (const key of ['completed', 'log', 'practice', 'practicePassed', 'practiceDone', 'badges', 'songs', 'mySongs', 'trackLyrics', 'settings']) {
    if (s[key] != null && (typeof s[key] !== 'object' || Array.isArray(s[key]))) throw fail('backup.damaged', 'This backup file is damaged.');
  }
  if (s.log && Object.values(s.log).some((v) => typeof v !== 'number' || v < 0)) throw fail('backup.damaged', 'This backup file is damaged.');
  return withDefaults(s);
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
  // Adds practice time in seconds, logging whole minutes as they accumulate.
  logSeconds(seconds) {
    state.carrySeconds = (state.carrySeconds || 0) + seconds;
    const minutes = Math.floor(state.carrySeconds / 60);
    state.carrySeconds -= minutes * 60;
    if (minutes) state.log[dayKey()] = (state.log[dayKey()] || 0) + minutes;
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

  // Practical mode results. Returns true when this result completes the lesson's practical.
  recordPractice(lessonId, index, score, passed, exerciseCount) {
    const best = (state.practice[lessonId] ||= {});
    best[index] = Math.max(best[index] || 0, score);
    const passes = (state.practicePassed[lessonId] ||= {});
    if (passed) passes[index] = true;
    let newlyDone = false;
    if (!state.practiceDone[lessonId] && Array.from({ length: exerciseCount }, (_, i) => passes[i]).every(Boolean)) {
      state.practiceDone[lessonId] = new Date().toISOString();
      newlyDone = true;
    }
    save();
    return newlyDone;
  },
  practiceBest: (lessonId, index) => state.practice[lessonId]?.[index],
  practicePassed: (lessonId, index) => Boolean(state.practicePassed[lessonId]?.[index]),
  isPracticeDone: (id) => Boolean(state.practiceDone[id]),

  // Records newly earned badges; returns the ids that are new.
  awardBadges(ids) {
    const fresh = ids.filter((id) => !state.badges[id]);
    if (!fresh.length) return fresh;
    const now = new Date().toISOString();
    fresh.forEach((id) => { state.badges[id] = now; });
    save();
    return fresh;
  },
  hasBadge: (id) => Boolean(state.badges[id]),

  // Sing-along: keeps each song's best score.
  recordSong(id, score) {
    state.songs[id] = Math.max(state.songs[id] || 0, score);
    save();
  },
  songBest: (id) => state.songs[id] ?? null,

  // My Songs: kept only on this device (and in backups).
  mySongs: () => Object.values(state.mySongs).sort((a, b) => (b.saved || '').localeCompare(a.saved || '')),
  mySong: (id) => state.mySongs[id] ?? null,
  saveMySong(raw) {
    state.mySongs[raw.id] = { ...raw, saved: new Date().toISOString() };
    save();
  },
  deleteMySong(id) {
    delete state.mySongs[id];
    delete state.songs[id];
    save();
  },
  trackLyrics: (name) => state.trackLyrics[name] ?? '',
  setTrackLyrics(name, text) {
    if (text.trim()) state.trackLyrics[name] = text; else delete state.trackLyrics[name];
    save();
  },

  setting: (key) => state.settings[key],
  setSetting(key, value) { state.settings[key] = value; save(); },

  backup: () => makeBackup(state),
  restore(text) { state = parseBackup(text); save(); },

  reset() { state = defaults(); save(); },
};
