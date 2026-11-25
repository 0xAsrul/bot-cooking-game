// Saffron Stall — all sound is synthesised with WebAudio, no audio files.
// Nothing here loads over the network; the first user gesture unlocks it.

/** One tiny synth: oscillators plus filtered noise, kept very short. */
export class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  /** Create the AudioContext on the first gesture (browsers require it). */
  ensure() {
    if (this.ctx) return;
    try {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctor();
    } catch {
      this.ctx = null;
    }
  }

  /** A short tone that slides from `from` to `to` Hz. */
  tone(from, to, seconds, type = 'sine', gain = 0.12) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + seconds);
    amp.gain.setValueAtTime(gain, t0);
    amp.gain.exponentialRampToValueAtTime(0.001, t0 + seconds);
    osc.connect(amp).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.02);
  }

  /** A burst of filtered noise (a chop, a sizzle, a clatter). */
  noise(seconds, frequency = 1200, gain = 0.1) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * seconds));
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = frequency;
    const amp = this.ctx.createGain();
    amp.gain.setValueAtTime(gain, t0);
    amp.gain.exponentialRampToValueAtTime(0.001, t0 + seconds);
    src.connect(filter).connect(amp).connect(this.ctx.destination);
    src.start(t0);
  }

  /** Knife on the board. */
  chop() {
    this.noise(0.08, 900, 0.16);
    this.tone(180, 90, 0.07, 'triangle', 0.08);
  }

  /** Something hitting the grill or the pot. */
  sizzle() {
    this.noise(0.35, 2600, 0.06);
  }

  /** An ingredient lands on the plate. */
  plop() {
    this.tone(420, 240, 0.09, 'sine', 0.1);
  }

  /** A dish is served: a little two-note ding. */
  ding() {
    this.tone(880, 880, 0.12, 'sine', 0.12);
    setTimeout(() => this.tone(1318, 1318, 0.18, 'sine', 0.12), 90);
  }

  /** Wrong ingredient for the dish. */
  error() {
    this.tone(160, 110, 0.16, 'square', 0.06);
  }

  /** The rush clock ticks under thirty seconds. */
  tick() {
    this.tone(1200, 1200, 0.04, 'square', 0.04);
  }

  /** The shift ends. */
  fanfare() {
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, f, 0.22, 'triangle', 0.1), i * 110));
  }
}
