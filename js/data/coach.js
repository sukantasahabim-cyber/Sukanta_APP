// "What to fix": the mistakes that keep coming back. Every practical attempt
// saves what the app heard (store.recordAttempt); this finds the mistakes
// repeated over the last week, how they have changed, and a short drill for each.
//
// An attempt is { id, at, course, lesson, ex, obs }, where obs are short
// observations (they are stored and synced, so keep them small):
//   { k: 'note', sw: 'G', c: -28 }        a sung swara (letter) and how far from it in cents;
//                                          more than 50 away means another note was sung
//   { k: 'steady', w: 22 }                how much a held note wobbled, in cents
//   { k: 'stroke', b: 'Na', s: 'late' }   a stroke: ok | early | late | missed | sound (f: family heard)
//   { k: 'tempo', r: 1.08, bpm: 60 }      tempo played ÷ tempo asked

export const WINDOW_DAYS = 7;
export const KEEP_DAYS = 30;
export const KEEP_MAX = 400;

const OFF_TUNE = 15;      // cents: further than this, on average, is flat or sharp
const WRONG_NOTE = 50;    // cents: further than this is another note
const WOBBLE = 15;        // cents of wobble on a held note
const TEMPO = 0.06;       // 6% faster or slower than the count
const STROKE_FAULTS = ['late', 'early', 'missed', 'sound'];

const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  if (!s.length) return NaN;
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// Map.groupBy is too new for some phones still in use.
function groupBy(list, keyOf) {
  const groups = new Map();
  for (const item of list) {
    const k = keyOf(item);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(item);
  }
  return groups;
}

// Keeps the attempts of the last KEEP_DAYS days, at most KEEP_MAX of them.
export function pruneAttempts(attempts, now = new Date()) {
  const since = new Date(now.getTime() - KEEP_DAYS * 864e5).toISOString();
  const kept = Object.entries(attempts || {})
    .filter(([, a]) => a && (a.at || '') >= since)
    .sort(([, a], [, b]) => b.at.localeCompare(a.at))
    .slice(0, KEEP_MAX);
  return Object.fromEntries(kept);
}

// A problem's samples, oldest first: { at, bad, v } (v: the measured value, if any).
function summarise(samples) {
  const days = [...new Set(samples.map((s) => s.at.slice(0, 10)))];
  const day = (d) => {
    const list = samples.filter((s) => s.at.startsWith(d));
    const values = list.map((s) => s.v).filter((v) => v != null);
    return { n: list.filter((s) => s.bad).length, total: list.length, value: values.length ? median(values) : null };
  };
  // First and latest day of practice, when there are two to compare.
  const before = days.length > 1 ? day(days[0]) : null;
  const now = days.length > 1 ? day(days.at(-1)) : null;
  const last = samples.slice(-3);
  const fixed = last.length === 3 && last.every((s) => !s.bad);
  const better = before && now.n / now.total < before.n / before.total;
  return {
    count: samples.filter((s) => s.bad).length,
    total: samples.length,
    status: fixed ? 'fixed' : better ? 'better' : 'open',
    before,
    now,
    lastAt: samples.at(-1).at,
  };
}

function pitchProblems(course, notes) {
  const out = [];
  for (const [sw, list] of groupBy(notes, (o) => o.sw)) {
    const close = list.filter((o) => Math.abs(o.c) <= WRONG_NOTE);
    const wrong = list.filter((o) => Math.abs(o.c) > WRONG_NOTE);
    if (list.length >= 3 && wrong.length >= 2 && wrong.length / list.length >= 0.25) {
      out.push({ kind: 'wrong', course, key: sw, samples: list.map((o) => ({ at: o.at, bad: Math.abs(o.c) > WRONG_NOTE })) });
    }
    const mid = median(close.map((o) => o.c));
    if (close.length >= 3 && Math.abs(mid) >= OFF_TUNE) {
      const kind = mid < 0 ? 'flat' : 'sharp';
      const bad = (c) => (kind === 'flat' ? c <= -OFF_TUNE : c >= OFF_TUNE);
      out.push({ kind, course, key: sw, value: Math.round(Math.abs(mid)), samples: close.map((o) => ({ at: o.at, bad: bad(o.c), v: o.c })) });
    }
  }
  return out;
}

function steadyProblems(course, holds) {
  const mid = median(holds.map((o) => o.w));
  if (holds.length < 2 || mid <= WOBBLE) return [];
  return [{ kind: 'steady', course, key: 'hold', value: Math.round(mid), samples: holds.map((o) => ({ at: o.at, bad: o.w > WOBBLE, v: o.w })) }];
}

function strokeProblems(course, strokes) {
  const out = [];
  for (const [bol, list] of groupBy(strokes, (o) => o.b)) {
    if (list.length < 4) continue;
    const counts = STROKE_FAULTS.map((s) => [s, list.filter((o) => o.s === s).length]);
    const [kind, n] = counts.sort((a, b) => b[1] - a[1])[0];
    if (n < 2 || n / list.length < 0.25) continue;
    const heard = [...groupBy(list.filter((o) => o.s === 'sound' && o.f), (o) => o.f)]
      .sort((a, b) => b[1].length - a[1].length)[0]?.[0];
    // Drill with the exercise where this went wrong most recently.
    const src = list.filter((o) => o.s === kind).at(-1);
    out.push({
      kind, course, key: bol, heard, source: { lesson: src.lesson, ex: src.ex },
      samples: list.map((o) => ({ at: o.at, bad: o.s === kind })),
    });
  }
  return out;
}

function tempoProblems(course, tempos) {
  const mid = median(tempos.map((o) => o.r));
  if (tempos.length < 2 || Math.abs(mid - 1) < TEMPO) return [];
  const kind = mid > 1 ? 'rushing' : 'dragging';
  const bad = (r) => (kind === 'rushing' ? r >= 1 + TEMPO : r <= 1 - TEMPO);
  const src = tempos.filter((o) => bad(o.r)).at(-1);
  return [{
    kind, course, key: 'tempo', value: Math.round(Math.abs(mid - 1) * 100), source: { lesson: src.lesson, ex: src.ex },
    samples: tempos.map((o) => ({ at: o.at, bad: bad(o.r), v: Math.round((o.r - 1) * 100) })),
  }];
}

const STATUS_ORDER = { open: 0, better: 1, fixed: 2 };

// The repeated mistakes of the last `days` days, most pressing first.
export function findProblems(attempts, { now = new Date(), days = WINDOW_DAYS, course = null } = {}) {
  const since = new Date(now.getTime() - days * 864e5).toISOString();
  const recent = attempts
    .filter((a) => (a.at || '') >= since && (!course || a.course === course))
    .sort((a, b) => a.at.localeCompare(b.at));
  const problems = [];
  for (const [c, list] of groupBy(recent, (a) => a.course)) {
    const obs = list.flatMap((a) => (a.obs || []).map((o) => ({ ...o, at: a.at, lesson: a.lesson, ex: a.ex })));
    const of = (k) => obs.filter((o) => o.k === k);
    problems.push(
      ...pitchProblems(c, of('note')),
      ...steadyProblems(c, of('steady')),
      ...strokeProblems(c, of('stroke')),
      ...tempoProblems(c, of('tempo')),
    );
  }
  return problems
    .map(({ samples, ...p }) => ({ ...p, id: `${p.kind}:${p.course}:${p.key}`, ...summarise(samples) }))
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.count - a.count || b.lastAt.localeCompare(a.lastAt));
}

// Problems still worth showing (fixed ones only appear on the full list).
export const openProblems = (problems) => problems.filter((p) => p.status !== 'fixed');

// The drill for a problem. Singing drills are fixed exercises; tabla drills
// replay the exercise where the mistake happened, starting slower.
export function drillFor(problem, baseBpm) {
  const sw = problem.key;
  switch (problem.kind) {
    case 'flat':
    case 'sharp':
    case 'wrong':
      return {
        steps: [
          { type: 'hold', note: sw, seconds: 4 },
          { type: 'sing', notes: sw === 'S' ? 'S P S' : `S ${sw} S ${sw}` },
        ],
      };
    case 'steady':
      return { steps: [{ type: 'hold', note: 'S', seconds: 6 }, { type: 'hold', note: 'P', seconds: 6 }] };
    default: {
      const target = baseBpm || 60;
      const share = problem.kind === 'rushing' || problem.kind === 'dragging' ? 0.8 : 0.7;
      const start = Math.min(target, Math.max(40, Math.round((target * share) / 5) * 5));
      return { rhythm: problem.source, startBpm: start, targetBpm: target, step: 5 };
    }
  }
}
