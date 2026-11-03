/**
 * Anime Nexus - Video into 3D Website Version & Attack Hologram Arena
 * Projects dynamic anime signature move video & visuals onto a 3D curved canvas
 * with interactive 3D camera orbit controls, floating spatial particles, and battle HUD.
 */

import { movesEngine } from './moves.js';
import { soundEngine, soundFXMatrix } from './audio.js';
import { video3DShaderPipeline } from './video-shader-pipeline.js';

export class Video3DTheater {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.isOpen = false;
    this.currentMove = 'kamehameha';
    this.rotX = 0;
    this.rotY = 0;
    this.targetRotX = 0;
    this.targetRotY = 0;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.animId = null;
    this.particles = [];
  }

  init() {
    this.container = document.createElement('div');
    this.container.id = 'video-3d-arena';
    this.container.className = 'video-3d-overlay hidden';

    this.container.innerHTML = `
      <div class="video-3d-backdrop"></div>
      
      <!-- Top HUD Header -->
      <div class="video-3d-hud-header">
        <div class="hud-brand">
          <span class="hud-pulse-dot"></span>
          <strong>3D ANIME SIGNATURE MOVE HOLOGRAM ARENA</strong>
          <span class="hud-tag">3D CANVAS // VIDEO SYNCHRONIZATION</span>
        </div>
        <button class="video-3d-close-btn" id="video-3d-close">&times; CLOSE ARENA</button>
      </div>

      <!-- 3D WebGL / Canvas Viewport -->
      <div class="video-3d-viewport-wrapper">
        <canvas id="video-3d-canvas"></canvas>
        <div class="video-3d-crosshairs"></div>
        <div class="video-3d-instructions">
          <span>&circlearrowleft; Drag mouse to orbit in 3D space</span>
        </div>
      </div>

      <!-- Live Battle Telemetry HUD -->
      <div class="video-3d-telemetry">
        <div class="telemetry-card">
          <span class="t-label">ATTACK SIGNATURE</span>
          <strong class="t-val" id="t-attack-name">SUPER KAMEHAMEHA</strong>
        </div>
        <div class="telemetry-card">
          <span class="t-label">KI ENERGY OUTPUT</span>
          <strong class="t-val text-cyan" id="t-energy">1,250,000 GW</strong>
        </div>
        <div class="telemetry-card">
          <span class="t-label">IMPACT RADIUS</span>
          <strong class="t-val text-red" id="t-radius">PLANETARY (CLASS EX)</strong>
        </div>
        <div class="telemetry-card">
          <span class="t-label">COMBAT SAKUGA FPS</span>
          <strong class="t-val text-emerald">60.0 FPS</strong>
        </div>
      </div>

      <!-- Bottom Attack Switcher Bar -->
      <div class="video-3d-controls-dock">
        <div class="control-label">SELECT 3D ATTACK MOVE:</div>
        <div class="move-selector-pills">
          <button class="pill-btn active" data-move="kamehameha">⚡ Kamehameha</button>
          <button class="pill-btn" data-move="serious_punch">🥊 Serious Punch</button>
          <button class="pill-btn" data-move="domain_expansion">🔮 Domain Expansion</button>
          <button class="pill-btn" data-move="sakura_blossom">🌸 Sakura Whirlwind</button>
          <button class="pill-btn" data-move="solar_flare">🔥 Solar Flare</button>
          <button class="pill-btn" data-move="ice_glaciation">❄️ Ice Glaciation</button>
        </div>
        <button class="blast-3d-btn" id="blast-3d-btn">
          <span>💥 UNLEASH FULL BLAST</span>
        </button>

        <!-- Custom MP4 Video URL Projection Bar -->
        <div class="custom-video-pipeline-row" style="display: flex; gap: 0.6rem; align-items: center; margin-top: 0.8rem; padding-top: 0.8rem; border-top: 1px solid rgba(56, 189, 248, 0.2); width: 100%;">
          <span style="font-size: 0.72rem; color: #38bdf8; font-weight: 800; letter-spacing: 1px;">VIDEO-TO-3D SOURCE:</span>
          <input type="url" id="custom-video-input" placeholder="Paste custom MP4 URL to project through 3D emissive meshes..." style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 8px; padding: 0.35rem 0.75rem; color: #fff; font-size: 0.78rem; flex: 1; outline: none;">
          <button id="btn-project-custom-video" class="pill-btn" style="background: rgba(56, 189, 248, 0.2); border-color: #38bdf8; color: #38bdf8; font-size: 0.75rem;">
            <span>Project MP4 to 3D</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.canvas = document.getElementById('video-3d-canvas');

    this.setupEvents();
    this.init3DParticles();
    try {
      video3DShaderPipeline.init(this.container);
    } catch (e) {
      console.warn('[Video3DTheater] Pipeline init fallback:', e);
    }
  }

  setupEvents() {
    const closeBtn = document.getElementById('video-3d-close');
    const blastBtn = document.getElementById('blast-3d-btn');
    const pills = this.container.querySelectorAll('.pill-btn');
    const customInput = document.getElementById('custom-video-input');
    const projectBtn = document.getElementById('btn-project-custom-video');

    if (projectBtn && customInput) {
      projectBtn.addEventListener('click', () => {
        const url = customInput.value.trim();
        if (url) {
          soundEngine.playClick();
          video3DShaderPipeline.loadCustomVideo(url);
        }
      });
    }

    closeBtn.addEventListener('click', () => this.close());

    blastBtn.addEventListener('click', () => {
      soundEngine.playClick();
      // Play corresponding procedural attack sound
      if (this.currentMove === 'kamehameha') soundFXMatrix.playKamehameha();
      else if (this.currentMove === 'serious_punch') soundFXMatrix.playSeriousPunch();
      else if (this.currentMove === 'domain_expansion') soundFXMatrix.playDomainExpansion();
      else if (this.currentMove === 'sakura_blossom') soundFXMatrix.playSakuraVortex();
      else if (this.currentMove === 'ice_glaciation') soundFXMatrix.playIceGlaciation();
      else if (this.currentMove === 'solar_flare') soundFXMatrix.playSolarFlare();

      movesEngine.trigger(this.currentMove, {
        onComplete: () => {
          // Keep arena open
        }
      });
    });

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        soundEngine.playClick();
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.selectMove(pill.dataset.move);
      });
    });

    // 3D Mouse Orbit Listeners
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging || !this.isOpen) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.targetRotY += dx * 0.005;
      this.targetRotX += dy * 0.005;
      // Clamp pitch
      this.targetRotX = Math.max(-0.6, Math.min(0.6, this.targetRotX));
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    // Touch support for mobile/tablets
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      }
    });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || !this.isOpen || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - this.lastMouseX;
      const dy = e.touches[0].clientY - this.lastMouseY;
      this.targetRotY += dx * 0.005;
      this.targetRotX += dy * 0.005;
      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;
    });

    window.addEventListener('resize', () => {
      if (this.isOpen) this.resizeCanvas();
    });
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  init3DParticles() {
    this.particles = [];
    for (let i = 0; i < 200; i++) {
      this.particles.push({
        x: (Math.random() - 0.5) * 1200,
        y: (Math.random() - 0.5) * 800,
        z: (Math.random() - 0.5) * 1000,
        size: Math.random() * 3 + 1,
        color: '#60a5fa'
      });
    }
  }

  open(initialMove = 'kamehameha') {
    if (!this.container) this.init();
    this.isOpen = true;
    this.container.classList.remove('hidden');
    this.resizeCanvas();
    this.selectMove(initialMove);

    // Initialize & launch Three.js Video-to-3D Shader Pipeline
    video3DShaderPipeline.init(this.container);
    video3DShaderPipeline.open(initialMove);

    const start = performance.now();
    const renderLoop = (time) => {
      if (!this.isOpen) return;

      // Update telemetry FPS counter
      const fpsEl = document.querySelector('.text-emerald');
      if (fpsEl && video3DShaderPipeline.fps) {
        fpsEl.textContent = `${video3DShaderPipeline.fps.toFixed(1)} FPS`;
      }

      // Smooth camera interpolation
      this.rotX += (this.targetRotX - this.rotX) * 0.1;
      this.rotY += (this.targetRotY - this.rotY) * 0.1;

      this.render3DArena(time - start);
      this.animId = requestAnimationFrame(renderLoop);
    };

    this.animId = requestAnimationFrame(renderLoop);
  }

  close() {
    this.isOpen = false;
    video3DShaderPipeline.close();
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.container) {
      this.container.classList.add('hidden');
    }
  }

  selectMove(move) {
    this.currentMove = move;
    video3DShaderPipeline.selectMove(move);
    const nameEl = document.getElementById('t-attack-name');
    const energyEl = document.getElementById('t-energy');
    const radiusEl = document.getElementById('t-radius');

    const meta = {
      kamehameha: {
        name: 'SUPER KAMEHAMEHA (かめはめ波)',
        energy: '9,999,999 GW (KI SURGE)',
        radius: 'SOLAR SYSTEM SCALE',
        color: '#38bdf8'
      },
      serious_punch: {
        name: 'SERIOUS PUNCH (マジ殴り)',
        energy: 'INFINITE KINETIC FORCE',
        radius: 'ATMOSPHERIC SPLIT',
        color: '#ef4444'
      },
      domain_expansion: {
        name: 'DOMAIN EXPANSION: INFINITE VOID (領域展開)',
        energy: 'UNBOUNDED CURSED FLOW',
        radius: 'SPATIAL REALM DIMENSION',
        color: '#a78bfa'
      },
      sakura_blossom: {
        name: 'SPRING SAKURA VORTEX (桜吹雪)',
        energy: '100% HEALING IYASHIKEI',
        radius: 'CONTINENTAL BLOSSOM',
        color: '#f472b6'
      },
      solar_flare: {
        name: 'SOLAR FLARE FLAMEBURST (太陽拳)',
        energy: '15,000,000 KELVIN',
        radius: 'SUPERNOVA CORONA',
        color: '#f59e0b'
      },
      ice_glaciation: {
        name: 'ABSOLUTE ZERO GLACIATION (氷結破砕)',
        energy: '0.0001 KELVIN PERMAFROST',
        radius: 'CRYSTALLINE CONTINENT',
        color: '#06b6d4'
      }
    };

    const cur = meta[move] || meta.kamehameha;
    if (nameEl) nameEl.textContent = cur.name;
    if (energyEl) energyEl.textContent = cur.energy;
    if (radiusEl) radiusEl.textContent = cur.radius;

    // Update particle colors
    this.particles.forEach(p => {
      p.color = cur.color;
    });
  }

  /**
   * Projects a 3D Curved Hologram Screen inside the 3D space
   */
  render3DArena(elapsed) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height / 2;
    const fov = 450;

    // 3D Perspective Projection helper
    const project = (x, y, z) => {
      // Rotate around X
      let y1 = y * Math.cos(this.rotX) - z * Math.sin(this.rotX);
      let z1 = y * Math.sin(this.rotX) + z * Math.cos(this.rotX);

      // Rotate around Y
      let x2 = x * Math.cos(this.rotY) + z1 * Math.sin(this.rotY);
      let z2 = -x * Math.sin(this.rotY) + z1 * Math.cos(this.rotY);

      const depth = z2 + 650;
      if (depth <= 10) return null;
      const scale = fov / depth;
      return {
        x: cx + x2 * scale,
        y: cy + y1 * scale,
        scale: scale,
        depth: depth
      };
    };

    // 1. Draw 3D Floating Grid Floor
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 1;
    const gridSize = 400;
    const gridStep = 80;
    const floorY = 220;

    for (let x = -gridSize; x <= gridSize; x += gridStep) {
      const p1 = project(x, floorY, -gridSize);
      const p2 = project(x, floorY, gridSize);
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
    for (let z = -gridSize; z <= gridSize; z += gridStep) {
      const p1 = project(-gridSize, floorY, z);
      const p2 = project(gridSize, floorY, z);
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
    ctx.restore();

    // 2. Render 3D Floating Spatial Particles
    this.particles.forEach(p => {
      p.z -= 1.5;
      if (p.z < -500) p.z = 500;

      const proj = project(p.x, p.y, p.z);
      if (proj) {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, Math.max(1, p.size * proj.scale), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // 3. Render 3D Curved Cinema Screen (Video Hologram mesh)
    const screenWidth = 420;
    const screenHeight = 250;
    const segments = 12;

    const quadPoints = [];
    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const angle = (u - 0.5) * 0.7; // slight curve
      const radius = 500;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius - 450;

      const top = project(x, -screenHeight / 2, z);
      const bottom = project(x, screenHeight / 2, z);
      quadPoints.push({ top, bottom, u });
    }

    // Fill Curved Hologram Screen with glowing gradient & scanlines
    for (let i = 0; i < segments; i++) {
      const pA = quadPoints[i];
      const pB = quadPoints[i + 1];

      if (pA.top && pA.bottom && pB.top && pB.bottom) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pA.top.x, pA.top.y);
        ctx.lineTo(pB.top.x, pB.top.y);
        ctx.lineTo(pB.bottom.x, pB.bottom.y);
        ctx.lineTo(pA.bottom.x, pA.bottom.y);
        ctx.closePath();

        // Dynamic Holographic Screen Glow
        const screenGrad = ctx.createLinearGradient(pA.top.x, pA.top.y, pA.bottom.x, pA.bottom.y);
        screenGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
        screenGrad.addColorStop(0.5, 'rgba(30, 58, 138, 0.85)');
        screenGrad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');

        ctx.fillStyle = screenGrad;
        ctx.fill();

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
    }

    // 4. Render Live Anime Video Hologram Content on screen
    const centerPoint = project(0, 0, 50);
    if (centerPoint) {
      ctx.save();
      ctx.translate(centerPoint.x, centerPoint.y);
      ctx.scale(centerPoint.scale, centerPoint.scale);

      // Holographic Video Texture Simulation
      this.renderSimulatedAnimeVideo(ctx, elapsed, this.currentMove);
      ctx.restore();
    }
  }

  /**
   * Simulates rich anime video battle sequences on the 3D Hologram screen
   */
  renderSimulatedAnimeVideo(ctx, elapsed, move) {
    const w = 340;
    const h = 200;
    ctx.save();
    ctx.rect(-w / 2, -h / 2, w, h);
    ctx.clip();

    // Background video backdrop
    ctx.fillStyle = '#050a18';
    ctx.fillRect(-w / 2, -h / 2, w, h);

    if (move === 'kamehameha') {
      // Goku Charging Ki Beam
      const kiRadius = 40 + Math.sin(elapsed * 0.02) * 12;
      const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, kiRadius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#38bdf8');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, kiRadius, 0, Math.PI * 2);
      ctx.fill();

      // Horizontal beam sweeps
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(-w / 2, -15, w, 30);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.fillRect(-w / 2, -40, w, 80);

    } else if (move === 'serious_punch') {
      // Saitama Punch silhouette & shockwaves
      const ring = (elapsed * 0.2) % 180;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, ring, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('マジ殴り', 0, 10);

    } else if (move === 'domain_expansion') {
      // Gojo's Infinite Void
      const rot = elapsed * 0.002;
      ctx.save();
      ctx.rotate(rot);
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 3;
      ctx.strokeRect(-40, -40, 80, 80);
      ctx.strokeRect(-60, -60, 120, 120);
      ctx.restore();

      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('無量空処', 0, 60);

    } else if (move === 'sakura_blossom') {
      // Swirling cherry blossoms
      for (let i = 0; i < 20; i++) {
        const x = Math.sin(elapsed * 0.002 + i) * 120;
        const y = Math.cos(elapsed * 0.003 + i) * 70;
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fda4af';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('日常の癒し (Slice of Life)', 0, 0);

    } else {
      // Flame / Ice / Default
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(move.toUpperCase(), 0, 0);
    }

    // Video Scanline Overlay
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = 1;
    for (let y = -h / 2; y <= h / 2; y += 4) {
      ctx.beginPath();
      ctx.moveTo(-w / 2, y);
      ctx.lineTo(w / 2, y);
      ctx.stroke();
    }

    // Video Frame Border
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
    ctx.lineWidth = 2;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    ctx.restore();
  }
}

export const video3DTheater = new Video3DTheater();
