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
    this.hasThree = typeof window !== 'undefined' && typeof window.THREE !== 'undefined';
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

  resolveMoveType(rawType, options = {}) {
    const title = (options.title || '').toLowerCase();
    const sub = (options.subtitle || '').toLowerCase();
    const type = (rawType || '').toLowerCase();
    const str = `${title} ${sub} ${type}`;

    if (str.includes('thunderbolt') || str.includes('volt') || str.includes('lightning') || str.includes('electric') || str.includes('raikiri') || str.includes('chidori') || str.includes('godspeed') || str.includes('pikachu')) {
      return 'thunderbolt';
    }
    if (str.includes('shiny arc') || str.includes('starlight arrow') || str.includes('arrow') || str.includes('bow') || str.includes('heilig pfeil') || str.includes('archer')) {
      return 'starlight_arrow';
    }
    if (str.includes('anywhere door') || str.includes('door of disaster') || str.includes('dimensional step') || str.includes('warp') || str.includes('teleport') || str.includes('dimension') || str.includes('timeline shift') || str.includes('space step') || str.includes('keystone')) {
      return 'dimensional_warp';
    }
    if (str.includes('tiamat') || str.includes('comet') || str.includes('starfall') || str.includes('meteor') || str.includes('aurora blossom') || str.includes('stardust')) {
      return 'comet_starfall';
    }
    if (str.includes('blade') || str.includes('slash') || str.includes('katana') || str.includes('sword') || str.includes('getsuga') || str.includes('bankai') || str.includes('breathing') || str.includes('nichirin') || str.includes('cleave') || str.includes('dismantle')) {
      return 'blade_slash';
    }
    if (str.includes('psychic') || str.includes('telekine') || str.includes('singularity') || str.includes('100% explosion') || str.includes('neo-tokyo') || str.includes('mob') || str.includes('cantus')) {
      return 'psychic_singularity';
    }
    if (str.includes('dragon') || str.includes('haku') || str.includes('shenron') || str.includes('kaido') || str.includes('river spirit')) {
      return 'dragon_spiral';
    }
    if (str.includes('solar') || str.includes('flame') || str.includes('fire') || str.includes('sun') || str.includes('calcifer') || str.includes('blaze')) {
      return 'solar_flare';
    }
    if (str.includes('serious punch') || str.includes('punch') || str.includes('smash') || str.includes('fist') || str.includes('suplex') || str.includes('strike') || str.includes('gatling')) {
      return 'serious_punch';
    }
    if (str.includes('domain') || str.includes('infinite void') || str.includes('shrine') || str.includes('territory') || str.includes('sorcery')) {
      return 'domain_expansion';
    }
    if (str.includes('ice') || str.includes('frost') || str.includes('glaciation') || str.includes('freeze') || str.includes('zero') || str.includes('cold')) {
      return 'ice_glaciation';
    }
    if (str.includes('leaf') || str.includes('autumn') || str.includes('tempest') || str.includes('foliage') || str.includes('wind')) {
      return 'leaf_storm';
    }
    if (str.includes('sakura') || str.includes('blossom') || str.includes('flower') || str.includes('spring') || str.includes('petal') || str.includes('iyashikei') || str.includes('reconciliation')) {
      return 'sakura_blossom';
    }
    if (str.includes('sparkle') || str.includes('love') || str.includes('pure love') || str.includes('shoujo') || str.includes('moonlight') || str.includes('melody') || str.includes('tea time')) {
      return 'sparkle_burst';
    }
    if (str.includes('kamehameha') || str.includes('beam') || str.includes('blast') || str.includes('zoltraak') || str.includes('wave') || str.includes('cannon')) {
      return 'kamehameha';
    }

    const valid = ['kamehameha', 'serious_punch', 'sakura_blossom', 'domain_expansion', 'solar_flare', 'ice_glaciation', 'leaf_storm', 'sparkle_burst', 'thunderbolt', 'starlight_arrow', 'dimensional_warp', 'comet_starfall', 'blade_slash', 'psychic_singularity', 'dragon_spiral'];
    if (valid.includes(rawType)) return rawType;
    return 'kamehameha';
  }

  /**
   * Main entry point to trigger an attack move
   * @param {string} rawMoveType - Type of move (kamehameha, thunderbolt, etc.)
   * @param {Object} options - Custom options (title, subtitle, quote, duration, onComplete)
   */
  trigger(rawMoveType, options = {}) {
    if (!this.overlay) this.init();
    if (this.isPlaying) this.finish();

    this.isPlaying = true;
    this.onCompleteCallback = options.onComplete || null;

    const moveType = this.resolveMoveType(rawMoveType, options);
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
    const duration = options.duration || 2200;
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
      case 'thunderbolt':
        soundEngine.playThunderbolt();
        break;
      case 'starlight_arrow':
        soundEngine.playStarlightArrow();
        break;
      case 'dimensional_warp':
        soundEngine.playDimensionalWarp();
        break;
      case 'comet_starfall':
        soundEngine.playCometStarfall();
        break;
      case 'blade_slash':
        soundEngine.playBladeSlash();
        break;
      case 'psychic_singularity':
        soundEngine.playPsychicSingularity();
        break;
      case 'dragon_spiral':
        soundEngine.playDragonFlight();
        break;
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
      thunderbolt: {
        kanji: '万雷一閃・千万ボルト',
        title: custom.title || '10,000,000 VOLT THUNDERBOLT',
        subtitle: custom.subtitle || 'HIGH VOLTAGE // ELECTRIC OVERCHARGE',
        quote: custom.quote || 'Pika-Pika... PIKACHUUUUUU!'
      },
      starlight_arrow: {
        kanji: '光の弓・星光矢',
        title: custom.title || 'SHINY ARC STARLIGHT ARROW',
        subtitle: custom.subtitle || 'LUNA NOVA CHARIOT // CELESTIAL STARDUST',
        quote: custom.quote || 'A believing heart is your magic!'
      },
      dimensional_warp: {
        kanji: 'どこでもドア・次元跳躍',
        title: custom.title || 'ANYWHERE DOOR DIMENSIONAL STEP',
        subtitle: custom.subtitle || 'SPATIAL WARP // COSMIC CONTINUUM',
        quote: custom.quote || 'Step through the threshold of infinite possibility.'
      },
      comet_starfall: {
        kanji: 'ティアマト彗星・黄昏の絆',
        title: custom.title || 'TIAMAT COMET: TWILIGHT CONNECTION',
        subtitle: custom.subtitle || 'COSMIC STARFALL // KATAWARE-DOKI',
        quote: custom.quote || 'Wherever you are in this world, I swear I will find you.'
      },
      blade_slash: {
        kanji: '一刀両断・烈火斬',
        title: custom.title || 'FLAME BREATHING: RENGOKU SLASH',
        subtitle: custom.subtitle || 'NICHIREN BLADE // SUN EMBERS',
        quote: custom.quote || 'Set your heart ablaze! Go beyond all mortal limits!'
      },
      psychic_singularity: {
        kanji: '超能力特異点・百分爆発',
        title: custom.title || 'PSYCHIC SINGULARITY BURST',
        subtitle: custom.subtitle || 'TELEKINETIC HYPER-FIELD // 100% OVERDRIVE',
        quote: custom.quote || 'Energy cannot be destroyed—only unleashed!'
      },
      dragon_spiral: {
        kanji: '白竜飛翔・清流結界',
        title: custom.title || 'DRAGON RIVER SPIRIT: HAKU FLIGHT',
        subtitle: custom.subtitle || 'SPIRIT FLIGHT // RAMPANT RIVER VORTEX',
        quote: custom.quote || 'Remember your true name, and the currents will guide you home.'
      },
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
      case 'thunderbolt':
        return ['#fef08a', '#facc15', '#eab308', '#38bdf8', '#ffffff'][Math.floor(Math.random() * 5)];
      case 'starlight_arrow':
        return ['#f472b6', '#ec4899', '#38bdf8', '#a855f7', '#ffffff', '#fef08a'][Math.floor(Math.random() * 6)];
      case 'dimensional_warp':
        return ['#f43f5e', '#ec4899', '#8b5cf6', '#c084fc', '#38bdf8', '#ffffff'][Math.floor(Math.random() * 6)];
      case 'comet_starfall':
        return ['#6366f1', '#818cf8', '#06b6d4', '#22d3ee', '#ffffff', '#fbbf24'][Math.floor(Math.random() * 6)];
      case 'blade_slash':
        return ['#ef4444', '#f97316', '#fbbf24', '#ffffff', '#fee2e2'][Math.floor(Math.random() * 5)];
      case 'psychic_singularity':
        return ['#a855f7', '#7c3aed', '#ec4899', '#3b82f6', '#000000', '#ffffff'][Math.floor(Math.random() * 6)];
      case 'dragon_spiral':
        return ['#10b981', '#34d399', '#06b6d4', '#67e8f9', '#ffffff', '#a7f3d0'][Math.floor(Math.random() * 6)];
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
      case 'thunderbolt':
        this.renderThunderbolt(cx, cy, progress, elapsed, particles);
        break;
      case 'starlight_arrow':
        this.renderStarlightArrow(cx, cy, progress, elapsed, particles);
        break;
      case 'dimensional_warp':
        this.renderDimensionalWarp(cx, cy, progress, elapsed, particles);
        break;
      case 'comet_starfall':
        this.renderCometStarfall(cx, cy, progress, elapsed, particles);
        break;
      case 'blade_slash':
        this.renderBladeSlash(cx, cy, progress, elapsed, particles);
        break;
      case 'psychic_singularity':
        this.renderPsychicSingularity(cx, cy, progress, elapsed, particles);
        break;
      case 'dragon_spiral':
        this.renderDragonFlight(cx, cy, progress, elapsed, particles);
        break;
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

  // ==========================================
  // 9. 10,000,000 VOLT THUNDERBOLT (Pokémon Pikachu)
  // ==========================================
  renderThunderbolt(cx, cy, progress, elapsed, particles) {
    const ctx = this.ctx;

    // Dark storm sky vignette
    ctx.fillStyle = `rgba(8, 12, 28, ${0.45 + progress * 0.35})`;
    ctx.fillRect(0, 0, this.width, this.height);

    // Strobe ionization flash on screen
    if (progress > 0.25 && progress < 0.8 && Math.sin(elapsed * 0.06) > 0.3) {
      ctx.fillStyle = 'rgba(254, 240, 138, 0.18)';
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // Helper: Draw fractal zig-zag lightning
    const drawFractalBolt = (x1, y1, x2, y2, depth, color, width) => {
      if (depth === 0) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.shadowColor = color;
        ctx.shadowBlur = width * 4;
        ctx.stroke();
        return;
      }
      const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * (depth * 35);
      const my = (y1 + y2) / 2 + (Math.random() - 0.5) * (depth * 35);
      drawFractalBolt(x1, y1, mx, my, depth - 1, color, width);
      drawFractalBolt(mx, my, x2, y2, depth - 1, color, width);
      // Chance of random branch
      if (Math.random() > 0.65 && depth > 1) {
        const bx = mx + (Math.random() - 0.5) * 80;
        const by = my + (Math.random() - 0.5) * 80;
        drawFractalBolt(mx, my, bx, by, depth - 2, color, width * 0.6);
      }
    };

    // Draw main lightning strikes from clouds to center
    const strikeCount = 4 + Math.floor(progress * 6);
    ctx.save();
    for (let i = 0; i < strikeCount; i++) {
      const startX = cx + (Math.sin(i * 1.5 + elapsed * 0.01) * this.width * 0.45);
      const startY = 0;
      drawFractalBolt(startX, startY, cx + (Math.random() - 0.5) * 60, cy + (Math.random() - 0.5) * 60, 4, '#ffffff', 4);
      drawFractalBolt(startX, startY, cx, cy, 3, '#facc15', 7);
      drawFractalBolt(startX, startY, cx, cy, 2, '#38bdf8', 11);
    }
    ctx.restore();

    // Central Plasma Ball at (cx, cy)
    const coreRadius = 35 + progress * 75 + Math.sin(elapsed * 0.05) * 12;
    const plasmaGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, coreRadius * 1.6);
    plasmaGrad.addColorStop(0, '#ffffff');
    plasmaGrad.addColorStop(0.3, '#fef08a');
    plasmaGrad.addColorStop(0.65, '#eab308');
    plasmaGrad.addColorStop(0.85, '#38bdf8');
    plasmaGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

    ctx.save();
    ctx.fillStyle = plasmaGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // High-voltage expanding electrical shockwave rings
    const ringRadius = (elapsed * 0.8) % (this.width * 0.6);
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(254, 240, 138, ${Math.max(0, 1 - ringRadius / (this.width * 0.6))})`;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    // Erratic electric plasma sparks
    particles.forEach(p => {
      p.x += p.vx * 1.8 + (Math.random() - 0.5) * 8;
      p.y += p.vy * 1.8 + (Math.random() - 0.5) * 8;

      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 + Math.sin(elapsed * 0.05)), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ==========================================
  // 10. SHINY ARC STARLIGHT ARROW (Little Witch Academia)
  // ==========================================
  renderStarlightArrow(cx, cy, progress, elapsed, particles) {
    const ctx = this.ctx;

    // Celestial midnight violet background
    const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, this.width * 0.8);
    bgGrad.addColorStop(0, 'rgba(49, 10, 82, 0.7)');
    bgGrad.addColorStop(0.6, 'rgba(15, 23, 42, 0.85)');
    bgGrad.addColorStop(1, '#050711');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(cx, cy);

    // 1. Astrological Runic Magic Circle
    const circleRadius = 140 + Math.sin(elapsed * 0.003) * 10;
    const rot = elapsed * 0.0015;

    ctx.save();
    ctx.rotate(rot);
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#f472b6';
    ctx.shadowBlur = 20;

    // Outer & inner rings
    ctx.beginPath();
    ctx.arc(0, 0, circleRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, circleRadius * 0.75, 0, Math.PI * 2);
    ctx.stroke();

    // 8-point celestial star vertices
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * circleRadius * 0.75, Math.sin(a) * circleRadius * 0.75);
      ctx.lineTo(Math.cos(a) * circleRadius, Math.sin(a) * circleRadius);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Shiny Arc Magic Bow (Crescent)
    const bowRadius = 110;
    ctx.save();
    ctx.beginPath();
    ctx.arc(-30, 0, bowRadius, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 25;
    ctx.stroke();

    // Bowstring pulled back
    const pullBack = progress < 0.4 ? -80 * (progress / 0.4) : 0;
    ctx.beginPath();
    ctx.moveTo(-30 + Math.cos(-Math.PI * 0.45) * bowRadius, Math.sin(-Math.PI * 0.45) * bowRadius);
    ctx.lineTo(-30 + pullBack, 0);
    ctx.lineTo(-30 + Math.cos(Math.PI * 0.45) * bowRadius, Math.sin(Math.PI * 0.45) * bowRadius);
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // 3. Hypersonic Starlight Arrow
    if (progress < 0.4) {
      // Charging arrow at bow center
      const arrowLen = 160;
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.moveTo(-30 + pullBack, 0);
      ctx.lineTo(-30 + pullBack + arrowLen, 0);
      ctx.stroke();
      ctx.restore();
    } else {
      // Arrow in hypersonic flight across screen
      const shootProgress = (progress - 0.4) / 0.6;
      const arrowX = -30 + shootProgress * (this.width * 1.2);

      // Prismatic Rainbow Trail Ribbon
      const trailGrad = ctx.createLinearGradient(arrowX - 450, 0, arrowX, 0);
      trailGrad.addColorStop(0, 'rgba(236, 72, 153, 0)');
      trailGrad.addColorStop(0.3, 'rgba(168, 85, 247, 0.4)');
      trailGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.7)');
      trailGrad.addColorStop(1, '#ffffff');

      ctx.save();
      ctx.fillStyle = trailGrad;
      ctx.beginPath();
      ctx.moveTo(arrowX - 450, -4);
      ctx.lineTo(arrowX, -16);
      ctx.lineTo(arrowX + 25, 0);
      ctx.lineTo(arrowX, 16);
      ctx.lineTo(arrowX - 450, 4);
      ctx.closePath();
      ctx.fill();

      // Arrowhead 4-point Diamond Star
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 40;
      const s = 35;
      ctx.beginPath();
      ctx.moveTo(arrowX + 25, -s);
      ctx.quadraticCurveTo(arrowX + 25, 0, arrowX + 25 + s, 0);
      ctx.quadraticCurveTo(arrowX + 25, 0, arrowX + 25, s);
      ctx.quadraticCurveTo(arrowX + 25, 0, arrowX + 25 - s, 0);
      ctx.quadraticCurveTo(arrowX + 25, 0, arrowX + 25, -s);
      ctx.fill();

      // Chromatic shockwave ring
      ctx.beginPath();
      ctx.arc(arrowX + 25, 0, 45 + shootProgress * 100, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(236, 72, 153, ${1 - shootProgress})`;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // Floating Stardust Particles
    particles.forEach(p => {
      p.x += p.vx * 1.5;
      p.y += p.vy * 0.8;
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ==========================================
  // 11. ANYWHERE DOOR DIMENSIONAL STEP (Doraemon)
  // ==========================================
  renderDimensionalWarp(cx, cy, progress, elapsed, particles) {
    const ctx = this.ctx;

    // Cosmic Space-time background
    ctx.fillStyle = '#03050c';
    ctx.fillRect(0, 0, this.width, this.height);

    // Space-time perspective grid lines
    ctx.save();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, this.height);
      ctx.lineTo(cx + (x - cx) * 0.15, cy + 80);
      ctx.stroke();
    }
    for (let y = cy + 80; y < this.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    ctx.restore();

    // Anywhere Door parameters
    const doorW = 160;
    const doorH = 280;
    const doorX = cx - doorW / 2;
    const doorY = cy - doorH / 2;

    // Outer door frame (Neon Pink Door Casing)
    ctx.save();
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 12;
    ctx.shadowColor = '#fb7185';
    ctx.shadowBlur = 35;
    ctx.strokeRect(doorX, doorY, doorW, doorH);

    // Inside door: Hyperspace Wormhole Tunnel when open
    const openProgress = Math.min(1.0, progress * 1.8);
    const doorAngle = openProgress * (Math.PI * 0.42);

    // Draw Wormhole Tunnel behind open door
    const wormholeGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 180);
    wormholeGrad.addColorStop(0, '#ffffff');
    wormholeGrad.addColorStop(0.3, '#38bdf8');
    wormholeGrad.addColorStop(0.65, '#8b5cf6');
    wormholeGrad.addColorStop(1, '#0f172a');

    ctx.save();
    ctx.fillStyle = wormholeGrad;
    ctx.fillRect(doorX + 6, doorY + 6, doorW - 12, doorH - 12);

    // Hyperspace streaming streaks from inside the door
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + elapsed * 0.003;
      const r = (elapsed * 0.2 + i * 15) % 150;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }
    ctx.restore();

    // The Swinging Pink Door Panel (rendered with perspective)
    ctx.save();
    const swingW = Math.cos(doorAngle) * (doorW - 12);
    ctx.fillStyle = '#f43f5e';
    ctx.shadowColor = '#e11d48';
    ctx.shadowBlur = 20;

    ctx.beginPath();
    ctx.moveTo(doorX + 6, doorY + 6);
    ctx.lineTo(doorX + 6 + swingW, doorY + 6 - Math.sin(doorAngle) * 20);
    ctx.lineTo(doorX + 6 + swingW, doorY + doorH - 6 + Math.sin(doorAngle) * 20);
    ctx.lineTo(doorX + 6, doorY + doorH - 6);
    ctx.closePath();
    ctx.fill();

    // Golden brass door knob
    if (swingW > 15) {
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(doorX + 6 + swingW * 0.85, cy, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Expanding Reality Ripple Pulse
    const rippleRadius = (progress * this.width * 0.8) % (this.width * 0.8);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, rippleRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(244, 63, 94, ${Math.max(0, 1 - rippleRadius / (this.width * 0.8))})`;
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.restore();

    // Dimensional stardust fragments
    particles.forEach(p => {
      p.x += (cx - p.x) * 0.03;
      p.y += (cy - p.y) * 0.03;
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ==========================================
  // 12. TIAMAT COMET STARFALL (Your Name.)
  // ==========================================
  renderCometStarfall(cx, cy, progress, elapsed, particles) {
    const ctx = this.ctx;

    // Kataware-doki twilight twilight sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, '#0c0a2a');
    skyGrad.addColorStop(0.45, '#1e1b4b');
    skyGrad.addColorStop(0.75, '#4c1d95');
    skyGrad.addColorStop(1, '#831843');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Twin Comets split path
    const startX = -100;
    const startY = -50;
    const endX = this.width + 150;
    const endY = this.height * 0.75;

    const currentX = startX + (endX - startX) * progress;
    const currentY = startY + (endY - startY) * progress;

    // Helper: Draw ion comet trail
    const drawComet = (headX, headY, color, coreColor, size) => {
      ctx.save();
      const trailLen = 320;
      const trailGrad = ctx.createLinearGradient(headX - trailLen, headY - trailLen * 0.65, headX, headY);
      trailGrad.addColorStop(0, 'rgba(0,0,0,0)');
      trailGrad.addColorStop(0.5, color);
      trailGrad.addColorStop(1, '#ffffff');

      ctx.fillStyle = trailGrad;
      ctx.beginPath();
      ctx.moveTo(headX - trailLen, headY - trailLen * 0.65);
      ctx.lineTo(headX - size, headY - size * 1.5);
      ctx.lineTo(headX + size * 1.5, headY + size * 0.8);
      ctx.lineTo(headX + size * 0.5, headY + size * 2);
      ctx.closePath();
      ctx.fill();

      // Glowing nucleus
      ctx.fillStyle = coreColor;
      ctx.shadowColor = coreColor;
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.arc(headX, headY, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Primary Turquoise Comet (Tiamat Primary)
    drawComet(currentX, currentY, 'rgba(34, 211, 238, 0.45)', '#38bdf8', 16);

    // Secondary Fragment (Split fragment in Twilight Magenta)
    const splitOffset = progress * 70;
    drawComet(currentX - 50, currentY + splitOffset, 'rgba(236, 72, 153, 0.45)', '#ec4899', 12);

    // Celestial Horizon Bloom
    if (progress > 0.65) {
      const bloomProgress = (progress - 0.65) / 0.35;
      const bloomGrad = ctx.createRadialGradient(cx, this.height * 0.8, 10, cx, this.height * 0.8, this.width * 0.65);
      bloomGrad.addColorStop(0, `rgba(255, 255, 255, ${0.7 * bloomProgress})`);
      bloomGrad.addColorStop(0.35, `rgba(129, 140, 248, ${0.5 * bloomProgress})`);
      bloomGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = bloomGrad;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // Meteor shower stardust particles
    particles.forEach(p => {
      p.x += 4;
      p.y += 2.8;
      if (p.x > this.width) p.x = 0;
      if (p.y > this.height) p.y = 0;

      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ==========================================
  // 13. BLADE & KATANA SLASH (Demon Slayer / Bleach)
  // ==========================================
  renderBladeSlash(cx, cy, progress, elapsed, particles) {
    const ctx = this.ctx;

    // Dark high-contrast cinema backdrop
    ctx.fillStyle = 'rgba(5, 5, 10, 0.65)';
    ctx.fillRect(0, 0, this.width, this.height);

    const x1 = -50;
    const y1 = -50;
    const x2 = this.width + 50;
    const y2 = this.height + 50;

    // Razor-sharp cutting edge
    const slashProgress = Math.min(1.0, progress * 2.2);
    const curX = x1 + (x2 - x1) * slashProgress;
    const curY = y1 + (y2 - y1) * slashProgress;

    // Fiery Nichiren Flame Slash Arc
    ctx.save();
    const slashGrad = ctx.createLinearGradient(x1, y1, curX, curY);
    slashGrad.addColorStop(0, 'rgba(239, 68, 68, 0)');
    slashGrad.addColorStop(0.7, '#f97316');
    slashGrad.addColorStop(0.95, '#fef08a');
    slashGrad.addColorStop(1, '#ffffff');

    ctx.strokeStyle = slashGrad;
    ctx.lineWidth = 14;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 35;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(curX, curY);
    ctx.stroke();

    // Inner pure-white laser core
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.restore();

    // Vacuum shockwaves
    if (progress > 0.3) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1 + 35, y1 - 25);
      ctx.lineTo(curX + 35, curY - 25);
      ctx.moveTo(x1 - 35, y1 + 25);
      ctx.lineTo(curX - 35, curY + 25);
      ctx.stroke();
      ctx.restore();
    }

    // Exploding fiery embers and blade sparks
    particles.forEach(p => {
      p.x += p.vx * 2.5;
      p.y += p.vy * 2.5;
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ==========================================
  // 14. PSYCHIC SINGULARITY (Akira / Mob Psycho)
  // ==========================================
  renderPsychicSingularity(cx, cy, progress, elapsed, particles) {
    const ctx = this.ctx;

    // Void background
    ctx.fillStyle = '#05020a';
    ctx.fillRect(0, 0, this.width, this.height);

    // Gravitational lensing rings
    for (let r = 80; r < 360; r += 50) {
      ctx.beginPath();
      ctx.arc(cx, cy, r + Math.sin(elapsed * 0.005 + r) * 15, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Black Hole / Singularity Core
    const singularitySize = 40 + Math.sin(elapsed * 0.02) * 8;
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 45;
    ctx.beginPath();
    ctx.arc(cx, cy, singularitySize, 0, Math.PI * 2);
    ctx.fill();

    // 100% Psychic Overdrive Burst
    if (progress > 0.5) {
      const explodeProgress = (progress - 0.5) / 0.5;
      const blastRadius = explodeProgress * this.width * 0.85;

      const blastGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, blastRadius);
      blastGrad.addColorStop(0, '#ffffff');
      blastGrad.addColorStop(0.3, '#c084fc');
      blastGrad.addColorStop(0.7, '#7c3aed');
      blastGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = blastGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, blastRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Telekinetic rubble swirling inward then exploding outward
    particles.forEach(p => {
      if (progress < 0.5) {
        // Gravitational suction
        p.x += (cx - p.x) * 0.08;
        p.y += (cy - p.y) * 0.08;
      } else {
        // Shockwave expulsion
        p.x += p.vx * 4;
        p.y += p.vy * 4;
      }

      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ==========================================
  // 15. DRAGON RIVER SPIRIT FLIGHT (Spirited Away Haku)
  // ==========================================
  renderDragonFlight(cx, cy, progress, elapsed, particles) {
    const ctx = this.ctx;

    // Misty river moonlit gradient
    const waterGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    waterGrad.addColorStop(0, '#041d1a');
    waterGrad.addColorStop(0.6, '#063c36');
    waterGrad.addColorStop(1, '#021815');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Sine-wave Serpentine Dragon Body (Haku)
    ctx.save();
    const segments = 55;
    const waveAmp = 75;
    const waveFreq = 0.015;
    const dragonSpeed = elapsed * 0.003;

    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#10b981';
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 25;

    ctx.beginPath();
    for (let i = 0; i < segments; i++) {
      const segProgress = i / segments;
      const x = -100 + (this.width + 250) * segProgress;
      const y = cy + Math.sin(x * waveFreq + dragonSpeed) * waveAmp;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // White pearlescent belly strip
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.beginPath();
    for (let i = 0; i < segments; i++) {
      const segProgress = i / segments;
      const x = -100 + (this.width + 250) * segProgress;
      const y = cy + Math.sin(x * waveFreq + dragonSpeed) * waveAmp + 6;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Turquoise dorsal mane
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 6;
    ctx.beginPath();
    for (let i = 0; i < segments; i++) {
      const segProgress = i / segments;
      const x = -100 + (this.width + 250) * segProgress;
      const y = cy + Math.sin(x * waveFreq + dragonSpeed) * waveAmp - 10;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    // Swirling water droplets and spirit petals
    particles.forEach(p => {
      p.x += p.vx * 1.2;
      p.y += p.vy * 0.6;
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = '#67e8f9';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}

export const movesEngine = new SignatureMovesEngine();
