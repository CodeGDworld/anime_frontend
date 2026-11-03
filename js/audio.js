/**
 * Anime Nexus - Procedural Web Audio API Sound-FX Matrix
 * Complete zero-dependency procedural audio synthesis engine:
 * 
 * 1. Master Audio Bus with DynamicsCompressorNode & StereoPannerNode
 * 2. Manga Ink Splatter & Bursting Halftone Dots Sound Synthesizers
 * 3. Authentic Anime Signature Attack Audio:
 *    - Kamehameha: Multi-stage Ki Charge + Cosmic Beam Eruption
 *    - Serious Punch: 25Hz Sub-bass Thump + Waveshaper Overdrive Shockwave
 *    - Domain Expansion: Resonant Buddhist Temple Gong & Void Ring Modulation
 *    - Sakura Vortex: Pentatonic Crystalline Wind Chimes & Flutter
 *    - Ice Glaciation: FM Glass Shattering & Frost Fracture
 *    - Solar Flare: Thermal Whiteout Roar & Solar Wind
 * 4. 3D Mechanical Cube Gyroscope Clack & UI Feedback Acoustics
 */

export class SoundFXMatrix {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.compressor = null;
    this.distortionCurve = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // 1. Master Dynamics Compressor (Gives thick punchy anime movie mastering)
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(10, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.18, this.ctx.currentTime);

      // 2. Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);

      // Connect: Compressor -> Master Gain -> Speakers
      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // 3. Precompute Hyperbolic Tangent Distortion Curve
      this.distortionCurve = this.makeDistortionCurve(50);

      this.initialized = true;
    } catch (e) {
      console.warn('[SoundFXMatrix] AudioContext init error:', e);
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  /**
   * Precomputes an S-curve for heavy waveshaper distortion
   */
  makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  // ========================================================
  // 1. MANGA INK & HALFTONE TRANSITION SOUNDS
  // ========================================================

  /**
   * Wet sumi-e ink brush splatter & paper burst sound
   */
  playMangaInkSplatter() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Pink / White Noise burst through fast decaying resonant bandpass
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.06));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(320, t + 0.28);
    filter.Q.value = 4.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    noise.start(t);
  }

  /**
   * Rapid bubbling staccato frequency-modulated pops as halftone dots burst outward
   */
  playHalftoneDotPop() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const count = 10;
    const baseFreqs = [520, 680, 840, 1020, 1260, 1500, 1780, 2100, 2450, 2800];

    for (let i = 0; i < count; i++) {
      const startTime = t + (i * 0.024);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(baseFreqs[i], startTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreqs[i] * 0.45, startTime + 0.045);

      gain.gain.setValueAtTime(0.28, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.045);

      osc.connect(gain);
      gain.connect(this.compressor);

      osc.start(startTime);
      osc.stop(startTime + 0.05);
    }
  }

  // ========================================================
  // 2. SIGNATURE ANIME ATTACK SYNTHESIZERS
  // ========================================================

  /**
   * Dragon Ball Kamehameha: Dual-stage FM Ki Charge + Cosmic Beam Eruption
   */
  playKamehameha() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Stage 1: Rising Ki Charge FM Synthesis
    const carrier = this.ctx.createOscillator();
    const modulator = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    carrier.type = 'sawtooth';
    carrier.frequency.setValueAtTime(95, t);
    carrier.frequency.exponentialRampToValueAtTime(880, t + 1.25);

    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(25, t);
    modulator.frequency.linearRampToValueAtTime(140, t + 1.25);

    modGain.gain.setValueAtTime(120, t);
    modGain.gain.linearRampToValueAtTime(500, t + 1.25);
    modulator.connect(carrier.frequency);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, t);
    filter.frequency.exponentialRampToValueAtTime(5500, t + 1.25);
    filter.Q.value = 6;

    gain.gain.setValueAtTime(0.02, t);
    gain.gain.linearRampToValueAtTime(0.75, t + 1.0);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.35);

    carrier.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    modulator.start(t);
    carrier.start(t);
    modulator.stop(t + 1.35);
    carrier.stop(t + 1.35);

    // Stage 2: Cosmic Beam Explosion (Sub-bass boom + screaming high-frequency energy beam)
    setTimeout(() => {
      if (this.isMuted || !this.ctx) return;
      const tBlast = this.ctx.currentTime;

      // Sub-bass Thump
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(140, tBlast);
      sub.frequency.exponentialRampToValueAtTime(35, tBlast + 1.1);

      subGain.gain.setValueAtTime(0.9, tBlast);
      subGain.gain.exponentialRampToValueAtTime(0.001, tBlast + 1.2);

      sub.connect(subGain);
      subGain.connect(this.compressor);
      sub.start(tBlast);
      sub.stop(tBlast + 1.2);

      // Noise Beam Screamer
      const bufSize = this.ctx.sampleRate * 1.5;
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const output = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.45));
      }

      const noiseSrc = this.ctx.createBufferSource();
      noiseSrc.buffer = buf;

      const beamFilter = this.ctx.createBiquadFilter();
      beamFilter.type = 'bandpass';
      beamFilter.frequency.setValueAtTime(3200, tBlast);
      beamFilter.frequency.exponentialRampToValueAtTime(600, tBlast + 1.4);
      beamFilter.Q.value = 3.5;

      const beamGain = this.ctx.createGain();
      beamGain.gain.setValueAtTime(0.85, tBlast);
      beamGain.gain.exponentialRampToValueAtTime(0.001, tBlast + 1.5);

      noiseSrc.connect(beamFilter);
      beamFilter.connect(beamGain);
      beamGain.connect(this.compressor);

      noiseSrc.start(tBlast);
    }, 1100);
  }

  /**
   * One Punch Man Serious Punch: 25Hz Sub-bass Thump + Overdrive Distortion
   */
  playSeriousPunch() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // 1. Deep 25Hz Sub-bass Thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.6);

    gain.gain.setValueAtTime(1.0, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);

    // 2. Waveshaper Overdrive for crunchy anime physical punch impact
    const shaper = this.ctx.createWaveShaper();
    shaper.curve = this.distortionCurve;
    shaper.oversample = '4x';

    osc.connect(shaper);
    shaper.connect(gain);
    gain.connect(this.compressor);

    osc.start(t);
    osc.stop(t + 1.1);

    // 3. Shockwave Air Decompression Crunch
    const bufSize = this.ctx.sampleRate * 0.9;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.18));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + 0.85);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.compressor);

    noise.start(t);
  }

  /**
   * Jujutsu Kaisen Domain Expansion: Ancient Buddhist Gong & Ring Modulated Drone
   */
  playDomainExpansion() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Harmonic frequencies of deep temple gong: 180Hz, 356Hz, 724Hz
    const freqs = [180, 356, 724];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.96, t + 2.8);

      const amp = 0.55 / (idx + 1);
      gain.gain.setValueAtTime(amp, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 3.0);

      osc.connect(gain);
      gain.connect(this.compressor);

      osc.start(t);
      osc.stop(t + 3.0);
    });

    // Sub-octave void drone (60Hz)
    const subDrone = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subDrone.type = 'sine';
    subDrone.frequency.setValueAtTime(60, t);
    subGain.gain.setValueAtTime(0.4, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

    subDrone.connect(subGain);
    subGain.connect(this.compressor);

    subDrone.start(t);
    subDrone.stop(t + 2.5);
  }

  /**
   * Slice of Life Sakura Vortex: Pentatonic Crystalline Chimes & Flutter
   */
  playSakuraVortex() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    // C Major Pentatonic high octave (E5, G5, A5, B5, D6, E6)
    const chimes = [659.25, 783.99, 880.00, 987.77, 1174.66, 1318.51];

    chimes.forEach((freq, i) => {
      const startTime = t + (i * 0.08);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

      osc.connect(gain);
      gain.connect(this.compressor);

      osc.start(startTime);
      osc.stop(startTime + 1.25);
    });
  }

  /**
   * Winter Ice Glaciation: FM Glass Shattering & Frost Crackle
   */
  playIceGlaciation() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const shards = [1900, 2400, 3100, 4200, 5600];

    shards.forEach((freq, idx) => {
      const startTime = t + (idx * 0.035);
      const carrier = this.ctx.createOscillator();
      const mod = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      const gain = this.ctx.createGain();

      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(freq, startTime);

      mod.type = 'square';
      mod.frequency.setValueAtTime(freq * 0.35, startTime);
      modGain.gain.setValueAtTime(800, startTime);
      mod.connect(carrier.frequency);

      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      carrier.connect(gain);
      gain.connect(this.compressor);

      mod.start(startTime);
      carrier.start(startTime);
      mod.stop(startTime + 0.38);
      carrier.stop(startTime + 0.38);
    });
  }

  /**
   * Summer Solar Flare: Blazing Thermal Roar & Solar Wind
   */
  playSolarFlare() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Low thermal rumble
    const lowOsc = this.ctx.createOscillator();
    const lowGain = this.ctx.createGain();
    lowOsc.type = 'sawtooth';
    lowOsc.frequency.setValueAtTime(75, t);
    lowOsc.frequency.exponentialRampToValueAtTime(190, t + 1.2);

    lowGain.gain.setValueAtTime(0.45, t);
    lowGain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

    lowOsc.connect(lowGain);
    lowGain.connect(this.compressor);

    lowOsc.start(t);
    lowOsc.stop(t + 1.4);

    // Blazing white noise heat sweep
    const bufSize = this.ctx.sampleRate * 1.4;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.6));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.exponentialRampToValueAtTime(4200, t + 1.1);
    filter.Q.value = 3.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.65, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    noise.start(t);
  }

  // ========================================================
  // 3. 3D GYROSCOPE CUBE & UI FEEDBACK ACOUSTICS
  // ========================================================

  /**
   * 3D Category Cube Gyroscope Clack / Ratchet Snap
   */
  playCubeGyroClack() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.06);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.compressor);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  playClick() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.04);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.compressor);

    osc.start(t);
    osc.stop(t + 0.045);
  }

  playWhoosh() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const bufSize = this.ctx.sampleRate * 0.25;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufSize) * Math.PI);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(250, t);
    filter.frequency.exponentialRampToValueAtTime(1400, t + 0.12);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.25);
    filter.Q.value = 2.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    noise.start(t);
  }

  playSparkleBurst() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const freqs = [1046.50, 1318.51, 1567.98, 2093.00]; // C6, E6, G6, C7

    freqs.forEach((f, i) => {
      const startTime = t + (i * 0.04);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(this.compressor);

      osc.start(startTime);
      osc.stop(startTime + 0.22);
    });
  }

  playEnergyPulse() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.15);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.compressor);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  playAttackCharge() {
    this.playEnergyPulse();
  }
}

// Singleton export
export const soundEngine = new SoundFXMatrix();
export const soundFXMatrix = soundEngine;
