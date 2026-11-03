/**
 * Anime Nexus - Signature Move 3D Engine & Transition Controller
 * Features:
 * - Kamehameha (Dragon Ball)
 * - Serious Punch (One Punch Man)
 * - Sakura Blossom Storm (Slice of Life & Spring)
 * - Domain Expansion (Mystery & Seinen)
 * - Solar Flare (Summer)
 * - Ice Glaciation (Winter)
 * - Autumn Leaf Storm (Autumn)
 * - Sparkle Burst (Romance & Shoujo)
 * - Interactive 3D Video Hologram Arena
 */

import { soundEngine } from './audio.js';

export class SignatureMovesEngine {
  constructor() {
    this.overlay = null;
    this.canvas = null;
    this.ctx = null;
    this.banner = null;
    this.animationId = null;
    this.isPlaying = false;
    this.onCompleteCallback = null;
    this.threeScene = null;
    this.threeCamera = null;
    this.threeRenderer = null;
    this.threeParticles = null;
    this.threeMesh = null;
    this.hasThree = typeof window.THREE !== 'undefined';
  }

  init() {
    // Inject overlay container into DOM
    this.overlay = document.createElement('div');
    this.overlay.id = 'signature-move-overlay';
    this.overlay.className = 'signature-overlay hidden';

    this.overlay.innerHTML = `
      <canvas id="signature-canvas"></canvas>
      <div class="move-cinematic-vignette"></div>
      <div class="move-speed-lines"></div>
      <div class="move-impact-flash"></div>
      <div class="move-screen-shatter"></div>
      
      <!-- Anime Title / Callout Banner -->
      <div class="move-banner-container">
        <div class="move-japanese-kanji" id="move-kanji">かめはめ波</div>
        <h2 class="move-title" id="move-title">SUPER KAMEHAMEHA</h2>
        <div class="move-subtitle" id="move-subtitle">TURTLE HERMIT SCHOOL</div>
        <p class="move-quote" id="move-quote">"Ka... Me... Ha... Me... HAAAA!"</p>
      </div>

      <button class="move-skip-btn" id="move-skip-btn" title="Skip Animation">
        <span>Skip</span> &rarr;
      </button>
    `;

    document.body.appendChild(this.overlay);

    this.canvas = document.getElementById('signature-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.banner = this.overlay.querySelector('.move-banner-container');
    this.impactFlash = this.overlay.querySelector('.move-impact-flash');
    this.shatterOverlay = this.overlay.querySelector('.move-screen-shatter');
    this.speedLines = this.overlay.querySelector('.move-speed-lines');

    document.getElementById('move-skip-btn').addEventListener('click', () => {
      this.finish();
    });

    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  /**
   * Main entry point to trigger an attack move
   * @param {string} moveType - Type of move (kamehameha, serious_punch, sakura_blossom, etc.)
   * @param {Object} options - Custom options (title, subtitle, quote, duration, onComplete)
   */
  trigger(moveType, options = {}) {
    if (!this.overlay) this.init();
    if (this.isPlaying) this.finish();

    this.isPlaying = true;
    this.onCompleteCallback = options.onComplete || null;

    const moveMeta = this.getMoveMetadata(moveType, options);

    // Update banner text
    document.getElementById('move-kanji').textContent = moveMeta.kanji;
    document.getElementById('move-title').textContent = moveMeta.title;
    document.getElementById('move-subtitle').textContent = moveMeta.subtitle;
    document.getElementById('move-quote').textContent = `"${moveMeta.quote}"`;

    // Reset visual effects classes
    this.overlay.className = `signature-overlay active mode-${moveType}`;
    this.shatterOverlay.classList.remove('active');
    this.impactFlash.classList.remove('active');
    this.speedLines.classList.remove('active');

    // Trigger procedural audio FX
    this.playMoveAudio(moveType);

    // Run specific animation loop
    const duration = options.duration || 2100;
    const startTime = performance.now();

    const particles = this.createMoveParticles(moveType);

    const loop = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1.0);

      this.ctx.clearRect(0, 0, this.width, this.height);

      // Render attack specific graphics
      this.renderAttack(moveType, progress, elapsed, particles);

      if (progress < 1.0 && this.isPlaying) {
        this.animationId = requestAnimationFrame(loop);
      } else {
        this.finish();
      }
    };

    this.animationId = requestAnimationFrame(loop);
  }

  finish() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.overlay) {
      this.overlay.classList.add('fading-out');
      setTimeout(() => {
        this.overlay.className = 'signature-overlay hidden';
        if (this.ctx) this.ctx.clearRect(0, 0, this.width, this.height);
        if (this.onCompleteCallback) {
          this.onCompleteCallback();
          this.onCompleteCallback = null;
        }
      }, 400);
    } else if (this.onCompleteCallback) {
      this.onCompleteCallback();
      this.onCompleteCallback = null;
    }
  }

  playMoveAudio(type) {
    switch (type) {
      case 'kamehameha':
        soundEngine.playKamehameha();
        break;
      case 'serious_punch':
        soundEngine.playSeriousPunch();
        break;
      case 'sakura_blossom':
        soundEngine.playSakuraBreeze();
        break;
      case 'domain_expansion':
        soundEngine.playDomainExpansion();
        break;
      case 'ice_glaciation':
        soundEngine.playIceGlaciation();
        break;
      case 'solar_flare':
        soundEngine.playSolarFlare();
        break;
      case 'sparkle_burst':
        soundEngine.playSparkleBurst();
        break;
      case 'leaf_storm':
        soundEngine.playSakuraBreeze();
        break;
      default:
        soundEngine.playSeriousPunch();
    }
  }

  getMoveMetadata(type, custom = {}) {
    const registry = {
      kamehameha: {
        kanji: 'かめはめ波',
        title: custom.title || 'SUPER KAMEHAMEHA',
        subtitle: custom.subtitle || 'TURTLE HERMIT FORM // FULL POWER',
        quote: custom.quote || 'Ka... Me... Ha... Me... HAAAAAA!'
      },
      serious_punch: {
        kanji: 'マジ殴り',
        title: custom.title || 'SERIOUS PUNCH',
        subtitle: custom.subtitle || 'HERO FOR FUN // DEATH BLOW',
        quote: custom.quote || 'Serious Series: SERIOUS PUNCH!'
      },
      sakura_blossom: {
        kanji: '桜吹雪',
        title: custom.title || 'SAKURA BLOSSOM VORTEX',
        subtitle: custom.subtitle || 'SPRING EQUINOX // IYASHIKEI REALM',
        quote: custom.quote || 'Even the smallest fleeting moments hold infinite eternity.'
      },
      domain_expansion: {
        kanji: '領域展開',
        title: custom.title || 'DOMAIN EXPANSION: INFINITE VOID',
        subtitle: custom.subtitle || 'JUJUTSU SORCERY // BOUNDLESS REALM',
        quote: custom.quote || 'Throughout heaven and earth, I alone am the honored one.'
      },
      solar_flare: {
        kanji: '太陽拳・火炎',
        title: custom.title || 'SOLAR FLARE FLAMEBURST',
        subtitle: custom.subtitle || 'MIDSUMMER ZENITH // SUN BREATHING',
        quote: custom.quote || 'Set your heart ablaze! Go beyond all mortal limits!'
      },
      ice_glaciation: {
        kanji: '氷結破砕',
        title: custom.title || 'ABSOLUTE ZERO GLACIATION',
        subtitle: custom.subtitle || 'SUB-ZERO FROST // DIAMOND SHATTER',
        quote: custom.quote || 'In the silent permafrost, reality freezes into crystal.'
      },
      leaf_storm: {
        kanji: '紅葉乱舞',
        title: custom.title || 'CRIMSON LEAF TEMPEST',
        subtitle: custom.subtitle || 'AUTUMN TWILIGHT // SWORDSMAN\'S GALE',
        quote: custom.quote || 'As crimson leaves descend, a legend carves its destiny.'
      },
      sparkle_burst: {
        kanji: '純愛光彩',
        title: custom.title || 'CELESTIAL STARLIGHT BURST',
        subtitle: custom.subtitle || 'STAR-CROSSED DEVOTION // MOONLIGHT HEALING',
        quote: custom.quote || 'In all of time and space, my heart will always seek you.'
      }
    };
    return registry[type] || registry.kamehameha;
  }

  createMoveParticles(type) {
    const particles = [];
    const count = type === 'sakura_blossom' || type === 'leaf_storm' ? 120 : 150;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        z: Math.random() * 1000 + 100,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        vz: (Math.random() - 0.5) * 10,
        size: Math.random() * 8 + 3,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        color: this.getParticleColor(type),
        alpha: Math.random() * 0.8 + 0.2
      });
    }
    return particles;
  }

  getParticleColor(type) {
    switch (type) {
      case 'kamehameha':
        return ['#60a5fa', '#38bdf8', '#0284c7', '#ffffff', '#93c5fd'][Math.floor(Math.random() * 5)];
      case 'serious_punch':
        return ['#ef4444', '#f97316', '#fbbf24', '#ffffff', '#dc2626'][Math.floor(Math.random() * 5)];
      case 'sakura_blossom':
        return ['#f472b6', '#fbcfe8', '#fda4af', '#ffffff', '#ec4899'][Math.floor(Math.random() * 5)];
      case 'domain_expansion':
        return ['#8b5cf6', '#c084fc', '#4c1d95', '#000000', '#3b82f6'][Math.floor(Math.random() * 5)];
      case 'solar_flare':
        return ['#f59e0b', '#ef4444', '#fbbf24', '#ffedd5', '#ea580c'][Math.floor(Math.random() * 5)];
      case 'ice_glaciation':
        return ['#38bdf8', '#7dd3fc', '#bae6fd', '#ffffff', '#e0f2fe'][Math.floor(Math.random() * 5)];
      case 'leaf_storm':
        return ['#ea580c', '#c2410c', '#fb923c', '#ca8a04', '#b45309'][Math.floor(Math.random() * 5)];
      case 'sparkle_burst':
        return ['#f43f5e', '#ec4899', '#fbcfe8', '#fef08a', '#ffffff'][Math.floor(Math.random() * 5)];
      default:
        return '#ffffff';
    }
  }

  renderAttack(type, progress, elapsed, particles) {
    const cx = this.width / 2;
    const cy = this.height / 2;

    switch (type) {
      case 'kamehameha':
        this.renderKamehameha(cx, cy, progress, elapsed, particles);
        break;
      case 'serious_punch':
        this.renderSeriousPunch(cx, cy, progress, elapsed, particles);
        break;
      case 'sakura_blossom':
        this.renderSakuraBlossom(cx, cy, progress, elapsed, particles);
        break;
      case 'domain_expansion':
        this.renderDomainExpansion(cx, cy, progress, elapsed, particles);
        break;
      case 'solar_flare':
        this.renderSolarFlare(cx, cy, progress, elapsed, particles);
        break;
      case 'ice_glaciation':
        this.renderIceGlaciation(cx, cy, progress, elapsed, particles);
        break;
      case 'leaf_storm':
        this.renderLeafStorm(cx, cy, progress, elapsed, particles);
        break;
      case 'sparkle_burst':
        this.renderSparkleBurst(cx, cy, progress, elapsed, particles);
        break;
      default:
        this.renderKamehameha(cx, cy, progress, elapsed, particles);
    }
  }

  // ==========================================
  // 1. DRAGON BALL KAMEHAMEHA
  // ==========================================
  renderKamehameha(cx, cy, progress, elapsed, particles) {
    const ctx = this.ctx;

    // Phase 1: Charge (0.0 to 0.5)
    // Phase 2: Fire Beam (0.5 to 1.0)
    if (progress < 0.5) {
      const chargeProgress = progress / 0.5;
      const sphereRadius = 30 + chargeProgress * 80;

      // Dark background vignette
      ctx.fillStyle = `rgba(5, 15, 35, ${0.4 + chargeProgress * 0.4})`;
      ctx.fillRect(0, 0, this.width, this.height);

      // Inward gathering Ki particles
      particles.forEach(p => {
        const dx = cx - p.x;
        const dy = cy - p.y;
        p.x += dx * 0.08 * (1 + chargeProgress * 2);
        p.y += dy * 0.08 * (1 + chargeProgress * 2);

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - chargeProgress * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Electric Ki arcs around sphere
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#60a5fa';
      ctx.shadowBlur = 20;
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i + elapsed * 0.01;
        const dist = sphereRadius * (1.1 + Math.random() * 0.4);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * (sphereRadius * 0.6), cy + Math.sin(angle) * (sphereRadius * 0.6));
        ctx.lineTo(cx + Math.cos(angle + 0.3) * dist, cy + Math.sin(angle + 0.3) * dist);
        ctx.stroke();
      }
      ctx.restore();

      // Core Glowing Ki Sphere
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, sphereRadius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#7dd3fc');
      grad.addColorStop(0.7, '#0284c7');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, sphereRadius, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // Beam Eruption
      const beamProgress = (progress - 0.5) / 0.5;
      const beamHeight = 120 + Math.sin(elapsed * 0.05) * 30 + beamProgress * 200;

      if (progress < 0.6) {
        this.impactFlash.classList.add('active');
      } else {
        this.impactFlash.classList.remove('active');
      }

      this.speedLines.classList.add('active');

      // Giant Horizontal Cosmic Beam
      const beamGrad = ctx.createLinearGradient(0, cy - beamHeight, 0, cy + beamHeight);
      beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      beamGrad.addColorStop(0.2, 'rgba(2, 132, 199, 0.85)');
      beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
      beamGrad.addColorStop(0.8, 'rgba(2, 132, 199, 0.85)');
      beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.save();
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, cy - beamHeight, this.width, beamHeight * 2);

      // Core intense beam
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 40;
      ctx.fillRect(0, cy - beamHeight * 0.3, this.width, beamHeight * 0.6);
      ctx.restore();

      // Energy shockwave rings traveling horizontally
      ctx.save();
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 6;
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 25;
      for (let x = 0; x < this.width; x += 150) {
        const ringX = (x + elapsed * 1.5) % this.width;
        ctx.beginPath();
        ctx.ellipse(ringX, cy, 35, beamHeight * 0.9, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // ==========================================
  // 2. ONE PUNCH MAN SERIOUS PUNCH
  // ==========================================
  renderSeriousPunch(cx, cy, progress, elapsed, particles) {
    const ctx = this.ctx;

    if (progress < 0.4) {
      // Wind-up: extreme red zoom & tension
      const windProgress = progress / 0.4;
      ctx.fillStyle = `rgba(30, 0, 0, ${windProgress * 0.7})`;
      ctx.fillRect(0, 0, this.width, this.height);

      // Speed lines rushing toward center
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r1 = 300 + Math.random() * 200;
        const r2 = 60 + Math.random() * 40;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
        ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
        ctx.stroke();
      }
      ctx.restore();

      // Red Fist Emblem silhouette
      ctx.save();
      ctx.fillStyle = '#dc2626';
      ctx.shadowColor = '#f87171';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(cx, cy, 40 + windProgress * 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

    } else {
      // IMPACT!
      const impactProgress = (progress - 0.4) / 0.6;
      const shockRadius = impactProgress * Math.max(this.width, this.height) * 1.2;

      if (progress < 0.55) {
        this.shatterOverlay.classList.add('active');
        this.impactFlash.classList.add('active');
      } else {
        this.impactFlash.classList.remove('active');
      }

      // Massive expanding golden-orange shockwave rings
      ctx.save();
      ctx.lineWidth = 14 * (1 - impactProgress);
      ctx.strokeStyle = '#fbbf24';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.arc(cx, cy, shockRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Secondary shock ring
      ctx.lineWidth = 8 * (1 - impactProgress);
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, shockRadius * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Blown outward debris particles
      particles.forEach(p => {
        p.x += p.vx * 3;
        p.y += p.vy * 3;
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - impactProgress * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // "DEATH" Kanji Stamp flash behind
      ctx.save();
      ctx.fillStyle = `rgba(220, 38, 38, ${Math.max(0, 0.9 - impactProgress * 1.5)})`;
      ctx.font = 'bold 220px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('死', cx, cy);
      ctx.restore();
    }
  }

  // ==========================================
  // 3. SPRING SAKURA BLOSSOM (Slice of Life)
  // ==========================================
  renderSakuraBlossom(cx, cy, progress, elapsed, particles) {
    const ctx = this.ctx;

    // Gentle pastel aura
    const aura = ctx.createRadialGradient(cx, cy, 100, cx, cy, this.width * 0.7);
    aura.addColorStop(0, 'rgba(253, 232, 242, 0.4)');
    aura.addColorStop(0.7, 'rgba(244, 114, 182, 0.25)');
    aura.addColorStop(1, 'rgba(15, 23, 42, 0.8)');
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, this.width, this.height);

    // 3D swirling petals in vortex
    particles.forEach(p => {
      p.rot += p.rotSpeed;
      p.x += Math.cos(p.rot) * 5 + Math.sin(elapsed * 0.002) * 2;
      p.y += Math.sin(p.rot) * 3 + 2.5;

      if (p.y > this.height) p.y = -20;
      if (p.x > this.width) p.x = -20;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 10;

      // Draw delicate petal shape
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-p.size, -p.size * 1.5, -p.size * 1.5, p.size, 0, p.size * 1.8);
      ctx.bezierCurveTo(p.size * 1.5, p.size, p.size, -p.size * 1.5, 0, 0);
      ctx.fill();
      ctx.restore();
    });

    // Radiant blossoming spiral in center
    ctx.save();
    ctx.strokeStyle = 'rgba(251, 207, 232, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let theta = 0; theta < Math.PI * 6; theta += 0.1) {
      const r = theta * 25 * progress;
      const x = cx + Math.cos(theta + elapsed * 0.002) * r;
      const y = cy + Math.sin(theta + elapsed * 0.002) * r;
      if (theta === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================
  // 4. DOMAIN EXPANSION (Mystery & Seinen)
  // ==========================================
  renderDomainExpansion(cx, cy, progress, elapsed, particles) {
    const ctx = this.ctx;

    // Void Darkness expanding
    ctx.fillStyle = 'rgba(8, 7, 22, 0.85)';
    ctx.fillRect(0, 0, this.width, this.height);

    // Mystic Hand-sign geometric mandala rings
    const maxRadius = Math.min(this.width, this.height) * 0.45;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(elapsed * 0.001);

    for (let r = 80; r <= maxRadius; r += 70) {
      ctx.strokeStyle = `rgba(139, 92, 246, ${0.4 + (1 - r / maxRadius) * 0.5})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = '#a78bfa';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, r * progress, 0, Math.PI * 2);
      ctx.stroke();

      // Ancient Kanji / Seal ticks around ring
      const points = 12;
      for (let i = 0; i < points; i++) {
        const angle = (Math.PI * 2 / points) * i;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * (r * progress - 10), Math.sin(angle) * (r * progress - 10));
        ctx.lineTo(Math.cos(angle) * (r * progress + 10), Math.sin(angle) * (r * progress + 10));
        ctx.stroke();
      }
    }

    // All-seeing eye iris at center
    ctx.rotate(-elapsed * 0.002);
    ctx.fillStyle = '#6d28d9';
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(0, 0, 35 * progress, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, 16 * progress, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Floating dark matter particles
    particles.forEach(p => {
      p.x += Math.sin(elapsed * 0.003 + p.y) * 2;
      p.y -= 1.5;
      if (p.y < 0) p.y = this.height;

      ctx.save();
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ==========================================
  // 5. SOLAR FLARE (Summer)
  // ==========================================
  renderSolarFlare(cx, cy, progress, elapsed, particles) {
    const ctx = this.ctx;

    // Blinding Solar Corona
    const sunRadius = 90 + Math.sin(elapsed * 0.02) * 20 + progress * 80;

    const heatGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, this.width * 0.8);
    heatGrad.addColorStop(0, '#ffffff');
    heatGrad.addColorStop(0.2, '#fef08a');
    heatGrad.addColorStop(0.5, '#f59e0b');
    heatGrad.addColorStop(0.8, '#dc2626');
    heatGrad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');

    ctx.fillStyle = heatGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Radiant Solar Corona Spikes
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(elapsed * 0.001);
    ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 / 16) * i;
      const len = sunRadius * (1.6 + Math.sin(elapsed * 0.01 + i) * 0.4);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle - 0.1) * (sunRadius * 0.8), Math.sin(angle - 0.1) * (sunRadius * 0.8));
      ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
      ctx.lineTo(Math.cos(angle + 0.1) * (sunRadius * 0.8), Math.sin(angle + 0.1) * (sunRadius * 0.8));
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Fiery Embers
    particles.forEach(p => {
      p.y -= p.size * 1.5;
      p.x += (Math.random() - 0.5) * 4;
      if (p.y < 0) p.y = this.height;

      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ==========================================
  // 6. ICE GLACIATION (Winter)
  // ==========================================
  renderIceGlaciation(cx, cy, progress, elapsed, particles) {
    const ctx = this.ctx;

    // Sub-zero frost aura
    const frostGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, this.width * 0.7);
    frostGrad.addColorStop(0, 'rgba(224, 242, 254, 0.5)');
    frostGrad.addColorStop(0.6, 'rgba(56, 189, 248, 0.35)');
    frostGrad.addColorStop(1, 'rgba(8, 14, 29, 0.85)');

    ctx.fillStyle = frostGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Geometric Ice Crystals / Snowflakes
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 20;

    const arms = 6;
    for (let arm = 0; arm < arms; arm++) {
      const angle = (Math.PI * 2 / arms) * arm + elapsed * 0.0005;
      const length = 220 * progress;
      const xEnd = cx + Math.cos(angle) * length;
      const yEnd = cy + Math.sin(angle) * length;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(xEnd, yEnd);
      ctx.stroke();

      // Side crystal needles
      for (let branch = 40; branch < length; branch += 40) {
        const bx = cx + Math.cos(angle) * branch;
        const by = cy + Math.sin(angle) * branch;
        const bAngle1 = angle + Math.PI / 4;
        const bAngle2 = angle - Math.PI / 4;

        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(bAngle1) * 30, by + Math.sin(bAngle1) * 30);
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(bAngle2) * 30, by + Math.sin(bAngle2) * 30);
        ctx.stroke();
      }
    }
    ctx.restore();

    // Glittering diamond frost dust
    particles.forEach(p => {
      p.y += 1.2;
      p.x += Math.sin(elapsed * 0.002 + p.y) * 1.5;
      if (p.y > this.height) p.y = 0;

      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#7dd3fc';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ==========================================
  // 7. AUTUMN LEAF STORM (Autumn & Josei)
  // ==========================================
  renderLeafStorm(cx, cy, progress, elapsed, particles) {
    const ctx = this.ctx;

    // Amber twilight backdrop
    ctx.fillStyle = 'rgba(26, 12, 5, 0.75)';
    ctx.fillRect(0, 0, this.width, this.height);

    // Spiraling maple leaves
    particles.forEach(p => {
      p.rot += p.rotSpeed * 2;
      p.x += p.vx * 2 + Math.cos(elapsed * 0.003) * 3;
      p.y += p.vy + 2;

      if (p.x > this.width + 50) p.x = -50;
      if (p.y > this.height + 50) p.y = -50;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 10;

      // 5-point Japanese Momiji Maple Leaf
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (Math.PI * 2 / 5) * i;
        const r1 = p.size * 1.8;
        const r2 = p.size * 0.6;
        ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
        ctx.lineTo(Math.cos(a + 0.3) * r2, Math.sin(a + 0.3) * r2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  // ==========================================
  // 8. CELESTIAL SPARKLE BURST (Romance & Shoujo)
  // ==========================================
  renderSparkleBurst(cx, cy, progress, elapsed, particles) {
    const ctx = this.ctx;

    // Romantic rose gradient
    const roseGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, this.width * 0.7);
    roseGrad.addColorStop(0, 'rgba(255, 228, 230, 0.6)');
    roseGrad.addColorStop(0.5, 'rgba(244, 63, 94, 0.3)');
    roseGrad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');

    ctx.fillStyle = roseGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Floating Starlight Hearts
    particles.forEach(p => {
      p.y -= 2;
      p.rot += 0.02;
      if (p.y < 0) p.y = this.height;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = p.color;
      ctx.shadowColor = '#fb7185';
      ctx.shadowBlur = 15;

      // Heart shape
      const s = p.size * 0.8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-s, -s, -s * 1.5, s * 0.5, 0, s * 1.8);
      ctx.bezierCurveTo(s * 1.5, s * 0.5, s, -s, 0, 0);
      ctx.fill();
      ctx.restore();
    });

    // 4-point Diamond Starlight Shimmers
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 30;

    const stars = [
      { x: cx, y: cy, s: 70 * progress },
      { x: cx - 180, y: cy - 100, s: 40 * progress },
      { x: cx + 180, y: cy + 100, s: 45 * progress }
    ];

    stars.forEach(st => {
      ctx.beginPath();
      ctx.moveTo(st.x, st.y - st.s);
      ctx.quadraticCurveTo(st.x, st.y, st.x + st.s, st.y);
      ctx.quadraticCurveTo(st.x, st.y, st.x, st.y + st.s);
      ctx.quadraticCurveTo(st.x, st.y, st.x - st.s, st.y);
      ctx.quadraticCurveTo(st.x, st.y, st.x, st.y - st.s);
      ctx.fill();
    });
    ctx.restore();
  }
}

export const movesEngine = new SignatureMovesEngine();
