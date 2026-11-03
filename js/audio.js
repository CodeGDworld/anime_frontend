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

  // ========================================================
  // 5. SIGNATURE ATTACK SPECIFIC AUDIO SYNTHESIZERS
  // ========================================================

  /**
   * High-Voltage Thunderbolt Discharge (Pikachu 10,000,000V)
   * Electrical ionization noise + dual sawtooth jitter + resonant thunder roar
   */
  playThunderbolt() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // 1. High-voltage electrical crackle noise
    const crackleLen = Math.floor(this.ctx.sampleRate * 0.45);
    const crackleBuf = this.ctx.createBuffer(1, crackleLen, this.ctx.sampleRate);
    const data = crackleBuf.getChannelData(0);
    for (let i = 0; i < crackleLen; i++) {
      // Sporadic steep electrical impulses
      const isImpulse = Math.random() > 0.88;
      data[i] = isImpulse ? (Math.random() * 2 - 1) * 1.5 : (Math.random() * 0.2 - 0.1);
    }
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = crackleBuf;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2400, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(800, t + 0.4);
    noiseFilter.Q.value = 6;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.compressor);
    noiseNode.start(t);

    // 2. Dual Sawtooth high-voltage ionization buzz
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const buzzGain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(110, t);
    osc1.frequency.linearRampToValueAtTime(440, t + 0.12);
    osc1.frequency.exponentialRampToValueAtTime(80, t + 0.5);

    osc2.frequency.setValueAtTime(225, t);
    osc2.frequency.linearRampToValueAtTime(880, t + 0.14);
    osc2.frequency.exponentialRampToValueAtTime(120, t + 0.5);

    buzzGain.gain.setValueAtTime(0.5, t);
    buzzGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    osc1.connect(buzzGain);
    osc2.connect(buzzGain);
    buzzGain.connect(this.compressor);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.55);
    osc2.stop(t + 0.55);

    // 3. Deep resonant sub-bass thunder boom
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(85, t + 0.05);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.9);

    subGain.gain.setValueAtTime(0.8, t + 0.05);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.95);

    subOsc.connect(subGain);
    subGain.connect(this.compressor);
    subOsc.start(t + 0.05);
    subOsc.stop(t + 0.95);
  }

  /**
   * Celestial Starlight Arrow (Little Witch Academia Shiny Arc)
   * Harmonic crystal bow tension + hypersonic starlight whistle + celestial chime
   */
  playStarlightArrow() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // 1. Celestial magic bow drawing chord (F#5, A5, C#6, F#6)
    const chord = [739.99, 880.00, 1108.73, 1479.98];
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq * 1.05, t + 0.25);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5 + idx * 0.05);

      osc.connect(gain);
      gain.connect(this.compressor);
      osc.start(t);
      osc.stop(t + 0.65);
    });

    // 2. Hypersonic starlight arrow release whistle
    const arrowOsc = this.ctx.createOscillator();
    const arrowGain = this.ctx.createGain();
    arrowOsc.type = 'triangle';
    arrowOsc.frequency.setValueAtTime(600, t + 0.22);
    arrowOsc.frequency.exponentialRampToValueAtTime(4200, t + 0.42);
    arrowOsc.frequency.exponentialRampToValueAtTime(1200, t + 0.7);

    arrowGain.gain.setValueAtTime(0.001, t + 0.22);
    arrowGain.gain.linearRampToValueAtTime(0.4, t + 0.3);
    arrowGain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

    arrowOsc.connect(arrowGain);
    arrowGain.connect(this.compressor);
    arrowOsc.start(t + 0.22);
    arrowOsc.stop(t + 0.75);

    // 3. Stardust chime burst
    const chimes = [2093.00, 2637.02, 3135.96, 4186.01];
    chimes.forEach((f, i) => {
      const chimeTime = t + 0.38 + i * 0.05;
      const cOsc = this.ctx.createOscillator();
      const cGain = this.ctx.createGain();
      cOsc.type = 'sine';
      cOsc.frequency.setValueAtTime(f, chimeTime);

      cGain.gain.setValueAtTime(0.25, chimeTime);
      cGain.gain.exponentialRampToValueAtTime(0.001, chimeTime + 0.3);

      cOsc.connect(cGain);
      cGain.connect(this.compressor);
      cOsc.start(chimeTime);
      cOsc.stop(chimeTime + 0.32);
    });
  }

  /**
   * Anywhere Door Dimensional Step / Spatial Warp
   * Sub-bass gravity warp + metallic door latch snap + futuristic wormhole sweep
   */
  playDimensionalWarp() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // 1. Door latch click / pop
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(450, t);
    clickOsc.frequency.exponentialRampToValueAtTime(80, t + 0.04);
    clickGain.gain.setValueAtTime(0.6, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    clickOsc.connect(clickGain);
    clickGain.connect(this.compressor);
    clickOsc.start(t);
    clickOsc.stop(t + 0.05);

    // 2. Spatial wormhole portal sweep
    const portalOsc = this.ctx.createOscillator();
    const portalFilter = this.ctx.createBiquadFilter();
    const portalGain = this.ctx.createGain();

    portalOsc.type = 'sawtooth';
    portalOsc.frequency.setValueAtTime(70, t + 0.04);
    portalOsc.frequency.exponentialRampToValueAtTime(320, t + 0.45);
    portalOsc.frequency.exponentialRampToValueAtTime(95, t + 0.8);

    portalFilter.type = 'lowpass';
    portalFilter.frequency.setValueAtTime(400, t + 0.04);
    portalFilter.frequency.linearRampToValueAtTime(2200, t + 0.4);
    portalFilter.frequency.exponentialRampToValueAtTime(300, t + 0.85);
    portalFilter.Q.value = 5.0;

    portalGain.gain.setValueAtTime(0.5, t + 0.04);
    portalGain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    portalOsc.connect(portalFilter);
    portalFilter.connect(portalGain);
    portalGain.connect(this.compressor);

    portalOsc.start(t + 0.04);
    portalOsc.stop(t + 0.85);

    // 3. Dimensional sub-bass boom
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOscInit: {
      sub.type = 'sine';
      sub.frequency.setValueAtTime(48, t + 0.08);
      sub.frequency.exponentialRampToValueAtTime(28, t + 0.7);
      subGain.gain.setValueAtTime(0.7, t + 0.08);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
      sub.connect(subGain);
      subGain.connect(this.compressor);
      sub.start(t + 0.08);
      sub.stop(t + 0.75);
    }
  }

  /**
   * Tiamat Comet Starfall (Your Name)
   * Twin descending celestial glissando + cosmic shimmer + atmospheric detonation
   */
  playCometStarfall() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Twin comets descending
    [1200, 1500].forEach((startF, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(startF, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.55);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(gain);
      gain.connect(this.compressor);
      osc.start(t);
      osc.stop(t + 0.62);
    });

    // Cosmic detonation bloom
    const boomOsc = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(120, t + 0.45);
    boomOsc.frequency.exponentialRampToValueAtTime(35, t + 1.1);

    boomGain.gain.setValueAtTime(0.75, t + 0.45);
    boomGain.gain.exponentialRampToValueAtTime(0.001, t + 1.15);

    boomOsc.connect(boomGain);
    boomGain.connect(this.compressor);
    boomOsc.start(t + 0.45);
    boomOsc.stop(t + 1.15);
  }

  /**
   * Blade & Katana Slash (Demon Slayer / Bleach / Wind Slashes)
   * Razor-sharp steel air cut whistle + fiery combust roar
   */
  playBladeSlash() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // 1. Razor air slice whistle
    const bufSize = Math.floor(this.ctx.sampleRate * 0.22);
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.sin((i / bufSize) * Math.PI);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3800, t);
    filter.frequency.exponentialRampToValueAtTime(750, t + 0.2);
    filter.Q.value = 5.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);
    noise.start(t);

    // 2. High-resonance Katana Steel Ring
    const ring = this.ctx.createOscillator();
    const ringGain = this.ctx.createGain();
    ring.type = 'sine';
    ring.frequency.setValueAtTime(1760, t + 0.05); // A6
    ringGain.gain.setValueAtTime(0.35, t + 0.05);
    ringGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    ring.connect(ringGain);
    ringGain.connect(this.compressor);
    ring.start(t + 0.05);
    ring.stop(t + 0.62);

    // 3. Flame ignition roar
    const flame = this.ctx.createOscillator();
    const flameGain = this.ctx.createGain();
    flame.type = 'sawtooth';
    flame.frequency.setValueAtTime(120, t + 0.08);
    flame.frequency.exponentialRampToValueAtTime(45, t + 0.45);
    flameGain.gain.setValueAtTime(0.4, t + 0.08);
    flameGain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
    flame.connect(flameGain);
    flameGain.connect(this.compressor);
    flame.start(t + 0.08);
    flame.stop(t + 0.5);
  }

  /**
   * Psychic Singularity Burst (Akira / Mob Psycho)
   * Gravitational pitch escalation + psychic distortion + kinetic blast
   */
  playPsychicSingularity() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(950, t + 0.4);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.8);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0.6, t + 0.38);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start(t);
    osc.stop(t + 0.85);
  }

  /**
   * Dragon Flight River Roar (Spirited Away Haku)
   * Low mythical dragon roar + cascading water whoosh
   */
  playDragonFlight() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.linearRampToValueAtTime(260, t + 0.3);
    osc.frequency.exponentialRampToValueAtTime(65, t + 0.7);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start(t);
    osc.stop(t + 0.75);
  }
}

// Singleton export
export const soundEngine = new SoundFXMatrix();
export const soundFXMatrix = soundEngine;
