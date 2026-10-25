// Turns a scored rhythm into a map of where the playing is in sync with the
// music and where it is not: one cell per grid position, plus the unexpected
// strokes at their (fractional) positions.

// Position of a grid slot as the learner would count it: "3", "3&", "3.3".
export function beatLabel(slot, perBeat) {
  const beat = Math.floor(slot / perBeat) + 1;
  const sub = slot % perBeat;
  if (!sub) return String(beat);
  return perBeat === 2 ? `${beat}&` : `${beat}.${sub + 1}`;
}

// `states` optionally overrides a result's status per slot (e.g. wrong sound).
export function syncModel(scored, slots, perBeat, states = {}) {
  const byslot = new Map(scored.results.map((r) => [r.slot, r]));
  const cells = slots.map((expected, slot) => {
    const label = beatLabel(slot, perBeat);
    if (!expected) return { slot, label, expected: false, status: 'rest' };
    const r = byslot.get(slot);
    const status = states[slot] || r.status;
    const offsetMs = r.offset === undefined ? null : Math.round(r.offset * 1000);
    // Where the stroke landed, in slot units from its ideal position (−0.5…0.5).
    const shift = r.offset === undefined ? 0 : Math.max(-0.5, Math.min(0.5, r.offset / scored.slotDur));
    return { slot, label, expected: true, status, offsetMs, shift };
  });
  // `onset` of each extra is an index, so positions come from the caller's times.
  return { cells };
}

export function extraPositions(times, scored, slots, perBeat) {
  return scored.extras
    .map((i) => ({ i, pos: (times[i] - scored.start) / scored.slotDur }))
    .filter((e) => e.pos > -0.5 && e.pos < slots.length - 0.5)
    .map((e) => ({ ...e, label: beatLabel(Math.max(0, Math.min(slots.length - 1, Math.round(e.pos))), perBeat) }));
}

// The problem positions, in playing order, ready for a plain-text summary.
export function problemSpots(model) {
  return model.cells.filter((c) => c.expected && c.status !== 'ok');
}
