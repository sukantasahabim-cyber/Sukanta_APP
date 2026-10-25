// Turns a stream of pitch readings (one every ~20 ms) into sung notes.
// A note is reported once its pitch has stayed steady for `minDur` seconds.
// A short silence, or a jump of more than `jump` semitones, ends the note.

export const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  return s.length ? s[s.length >> 1] : NaN;
};

export class NoteTracker {
  constructor({ minDur = 0.25, jump = 0.7, gap = 0.06 } = {}) {
    Object.assign(this, { minDur, jump, gap });
    this.seg = null;
    this.silentSince = null;
  }

  // midi: fractional MIDI number, or null when no pitch was heard.
  frame(midi, time) {
    if (midi == null) {
      this.silentSince ??= time;
      if (this.seg && time - this.silentSince >= this.gap) this.seg = null;
      return null;
    }
    this.silentSince = null;
    if (this.seg) {
      const ref = median(this.seg.midis.slice(-10));
      if (Math.abs(midi - ref) > this.jump) {
        // Two readings in a row far away = a new note; one is just a glitch.
        if (++this.seg.off < 2) return null;
        this.seg = null;
      } else {
        this.seg.off = 0;
      }
    }
    if (!this.seg) this.seg = { midis: [], start: time, off: 0, emitted: false };
    this.seg.midis.push(midi);
    if (!this.seg.emitted && time - this.seg.start >= this.minDur) {
      this.seg.emitted = true;
      return { midi: median(this.seg.midis.slice(2)), start: this.seg.start, time };
    }
    return null;
  }
}
