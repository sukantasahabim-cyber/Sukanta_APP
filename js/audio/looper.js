import { getCtx } from './engine.js';

const LOOKAHEAD = 0.12;

// Sample-accurate loop scheduler ("two clocks" pattern): a timer wakes up
// often and schedules every step that falls inside the lookahead window.
//   length()      number of steps in the loop
//   duration(i)   seconds step i lasts
//   play(i, t)    schedule audio for step i at AudioContext time t
//   onStep(i)     UI callback, fired when step i actually sounds
export class Looper {
  constructor({ length, duration, play, onStep }) {
    Object.assign(this, { length, duration, play, onStep });
    this.running = false;
    this.timers = new Set();
  }

  start() {
    if (this.running) return;
    const ctx = getCtx();
    this.running = true;
    this.index = 0;
    this.nextTime = ctx.currentTime + 0.1;
    this.interval = setInterval(() => this.tick(), 25);
    this.tick();
  }

  tick() {
    const ctx = getCtx();
    // After the tab was in the background, resync instead of firing a burst.
    if (this.nextTime < ctx.currentTime - 0.2) this.nextTime = ctx.currentTime + 0.05;
    while (this.running && this.nextTime < ctx.currentTime + LOOKAHEAD) {
      const i = this.index;
      const t = this.nextTime;
      this.play(i, t);
      if (this.onStep) {
        const id = setTimeout(() => {
          this.timers.delete(id);
          if (this.running) this.onStep(i);
        }, Math.max(0, (t - ctx.currentTime) * 1000));
        this.timers.add(id);
      }
      this.nextTime += this.duration(i);
      this.index = (i + 1) % this.length();
    }
  }

  stop() {
    this.running = false;
    clearInterval(this.interval);
    this.timers.forEach(clearTimeout);
    this.timers.clear();
  }
}
