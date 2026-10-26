// Forwards raw input audio to the main thread in 1024-sample batches,
// stamped with the AudioContext time of the first sample.
class Capture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buf = new Float32Array(1024);
    this.n = 0;
    this.time = 0;
  }

  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch) {
      let i = 0;
      while (i < ch.length) {
        if (this.n === 0) this.time = currentTime + i / sampleRate;
        const take = Math.min(ch.length - i, this.buf.length - this.n);
        this.buf.set(ch.subarray(i, i + take), this.n);
        this.n += take;
        i += take;
        if (this.n === this.buf.length) {
          this.port.postMessage({ samples: this.buf, time: this.time }, [this.buf.buffer]);
          this.buf = new Float32Array(1024);
          this.n = 0;
        }
      }
    }
    return true;
  }
}

registerProcessor('surtaal-capture', Capture);
