// Streaming onset detector for struck and plucked sounds: tabla strokes,
// guitar plucks and strums, claps. It watches the energy of the first
// difference of the signal (a cheap high-pass filter) in short frames and
// fires when that energy jumps well above both the recent level and the
// background noise.
export class OnsetDetector {
  constructor(sampleRate, { frame = 256, rise = 3, floorRatio = 10, minGap = 0.09, minEnergy = 2e-7 } = {}) {
    Object.assign(this, { frame, rise, floorRatio, minEnergy });
    this.minGapFrames = Math.max(1, Math.round((minGap * sampleRate) / frame));
    this.pos = 0;            // absolute index of the next incoming sample
    this.prev = 0;
    this.acc = 0;
    this.count = 0;
    this.history = [];
    this.floor = null;
    this.sinceLast = Infinity;
  }

  // Feed samples; returns the absolute sample indices of new onsets.
  push(chunk) {
    const onsets = [];
    for (let i = 0; i < chunk.length; i++) {
      const d = chunk[i] - this.prev;
      this.prev = chunk[i];
      this.acc += d * d;
      if (++this.count === this.frame) {
        if (this.isOnset(this.acc / this.frame)) onsets.push(this.pos + i + 1 - this.frame);
        this.acc = 0;
        this.count = 0;
      }
    }
    this.pos += chunk.length;
    return onsets;
  }

  isOnset(e) {
    const h = this.history;
    const recent = h.length ? h.reduce((a, b) => a + b, 0) / h.length : e;
    if (this.floor === null) this.floor = e;
    // The noise floor follows quiet passages quickly and loud ones slowly.
    this.floor = e < this.floor ? 0.8 * this.floor + 0.2 * e : 0.998 * this.floor + 0.002 * e;
    h.push(e);
    if (h.length > 8) h.shift();
    this.sinceLast++;
    const hit = this.sinceLast >= this.minGapFrames && e > this.minEnergy && e > this.rise * recent && e > this.floorRatio * this.floor;
    if (hit) this.sinceLast = 0;
    return hit;
  }
}
