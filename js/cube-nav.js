/**
 * Anime Nexus - 3D Cube & 3D Carousel Paging Engine
 * Provides:
 * 1. Category3DCube: 3D interactive cube with circular orbit ring for category switching
 * 2. Anime3DCarousel: 3D cylinder carousel for paging through the 10 anime entries in any category
 */

import { CATEGORIES, getAnimeByCategory } from './data.js';
import { getAnimePoster, createStylizedAnimePosterSVG } from './poster-fallback.js';
import { soundEngine, soundFXMatrix } from './audio.js';
import { movesEngine } from './moves.js';

// Order of all 13 categories
export const ALL_CATEGORY_IDS = [
  'slice-of-life', 'mystery', 'action', 'romance',
  'spring', 'summer', 'autumn', 'winter',
  'shounen', 'shoujo', 'kodomo', 'seinen', 'josei'
];

/**
 * 3D Category Cube Component
 */
export class Category3DCube {
  constructor(router, containerId = 'cube-mount-point') {
    this.router = router;
    this.container = document.getElementById(containerId);
    this.currentIndex = 0;
    this.activeDimension = 'all'; // 'all', 'genres', 'seasons', 'age'
    this.categoryList = [...ALL_CATEGORY_IDS];

    // 3D Angles
    this.rotX = -12;
    this.rotY = 25;
    this.targetRotX = -12;
    this.targetRotY = 25;

    // Interaction State
    this.isDragging = false;
    this.isDialDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.lastDialAngle = 0;
    this.autoSpin = false;
    this.animFrameId = null;

    // Face mapping: 6 faces on the cube
    this.faceDefinitions = [
      { name: 'front',  rotX: 0,   rotY: 0 },
      { name: 'right',  rotX: 0,   rotY: -90 },
      { name: 'back',   rotX: 0,   rotY: -180 },
      { name: 'left',   rotX: 0,   rotY: 90 },
      { name: 'top',    rotX: -90, rotY: 0 },
      { name: 'bottom', rotX: 90,  rotY: 0 }
    ];
  }

  mount(targetElement) {
    if (typeof targetElement === 'string') {
      this.container = document.getElementById(targetElement);
    } else {
      this.container = targetElement;
    }
    if (!this.container) return;

    this.filterCategories(this.activeDimension);
    this.render();
    this.setupEventListeners();
    this.startLoop();
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.boundPointerMove) {
      window.removeEventListener('pointermove', this.boundPointerMove);
    }
    if (this.boundPointerUp) {
      window.removeEventListener('pointerup', this.boundPointerUp);
    }
    if (this.boundKeyDown) {
      window.removeEventListener('keydown', this.boundKeyDown);
    }
  }

  filterCategories(dimension) {
    this.activeDimension = dimension;
    if (dimension === 'all') {
      this.categoryList = [...ALL_CATEGORY_IDS];
    } else {
      this.categoryList = ALL_CATEGORY_IDS.filter(id => CATEGORIES[id]?.dimension === dimension);
    }
    this.currentIndex = 0;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <section class="cube-showcase-section">
        <div class="cube-header">
          <div class="cube-header-badge">
            <span>🎲</span>
            <span>3D ICONIC PAGING SYSTEM</span>
          </div>
          <h2 class="cube-header-title">
            NAVIGATE THE MULTIVERSE IN <span class="gradient-text">3D SPACE</span>
          </h2>
          <p class="cube-header-subtitle">
            Circle the glowing gyroscope ring or drag the 3D cube to flip dimensions across Genres, Seasons, and Demographics with signature attack effects.
          </p>

          <!-- Filter Pills -->
          <div class="cube-filter-row" style="margin-top: 1.25rem;">
            <button class="cube-filter-pill ${this.activeDimension === 'all' ? 'active' : ''}" data-dim="all">🌟 All 13 Categories</button>
            <button class="cube-filter-pill ${this.activeDimension === 'genres' ? 'active' : ''}" data-dim="genres">⚡ Genres (4)</button>
            <button class="cube-filter-pill ${this.activeDimension === 'seasons' ? 'active' : ''}" data-dim="seasons">🌸 Seasons (4)</button>
            <button class="cube-filter-pill ${this.activeDimension === 'age' ? 'active' : ''}" data-dim="age">🔥 Demographics (5)</button>
          </div>
        </div>

        <!-- 3D Scene Viewport -->
        <div class="cube-viewport" id="cube-viewport-element">
          <div class="cube-hologram-floor"></div>
          
          <div class="cube-3d-box" id="cube-3d-box-element">
            ${this.renderCubeFacesHTML()}
          </div>
        </div>

        <!-- Circular Orbit Ring ("Circle it to move next category") -->
        <div class="cube-orbit-wrapper">
          <div class="cube-circle-dial" id="cube-circle-dial" title="Drag in a circle to spin the 3D Cube">
            ${this.renderDialTicksHTML()}
            <div class="circle-orbit-handle" id="circle-orbit-handle"></div>
            <div class="circle-center-hub">
              <span class="circle-center-icon">🌀</span>
              <span class="circle-center-text">DRAG CIRCLE</span>
              <span class="circle-drag-hint">Orbit to switch</span>
            </div>
          </div>

          <!-- Action Toolbar -->
          <div class="cube-action-toolbar">
            <button class="cube-tool-btn" id="cube-btn-prev">
              <span>↺</span>
              <span>Prev Face</span>
            </button>
            <button class="cube-tool-btn" id="cube-btn-autospin">
              <span>⚡</span>
              <span id="cube-autospin-text">Auto-Spin: OFF</span>
            </button>
            <button class="cube-tool-btn" id="cube-btn-next">
              <span>Next Face</span>
              <span>↻</span>
            </button>
          </div>
        </div>
      </section>
    `;

    this.cacheElements();
    this.updateCubeRotation();
  }

  renderCubeFacesHTML() {
    const faces = ['front', 'right', 'back', 'left', 'top', 'bottom'];
    return faces.map((faceName, idx) => {
      // Map index into category list
      const catId = this.categoryList[(this.currentIndex + idx) % this.categoryList.length];
      const cat = CATEGORIES[catId] || CATEGORIES['action'];
      const animeSamples = getAnimeByCategory(catId).slice(0, 3);

      return `
        <div 
          class="cube-face cube-face-${faceName}" 
          data-face-index="${idx}" 
          data-cat-id="${cat.id}"
          style="--face-accent: ${cat.accentColor}; --face-gradient: ${cat.gradient};"
        >
          <div class="face-top-row">
            <span class="face-cat-badge">${cat.dimension}</span>
            <span class="face-kanji">${cat.japaneseName.split(' ')[0] || ''}</span>
          </div>

          <div class="face-middle">
            <h3 class="face-cat-name">${cat.name}</h3>
            <span class="face-move-tag">
              <span>💥</span>
              <span>${cat.signatureMove.name.slice(0, 24)}</span>
            </span>

            <!-- Instant zero-latency SVG anime poster thumbnails -->
            <div class="face-posters-strip">
              ${animeSamples.map(a => `
                <img 
                  src="${createStylizedAnimePosterSVG(a)}" 
                  alt="${a.title}" 
                  class="face-poster-thumb"
                  loading="lazy"
                  decoding="async"
                />
              `).join('')}
            </div>
          </div>

          <button class="face-footer-btn" data-enter-cat="${cat.id}">
            <span>Enter ${cat.name}</span>
            <span>➔</span>
          </button>
        </div>
      `;
    }).join('');
  }

  renderDialTicksHTML() {
    let ticks = '';
    for (let i = 0; i < 24; i++) {
      const angle = i * 15;
      const isMajor = i % 6 === 0;
      ticks += `<div class="circle-tick ${isMajor ? 'major' : ''}" style="transform: rotate(${angle}deg);"></div>`;
    }
    return ticks;
  }

  cacheElements() {
    this.boxElement = document.getElementById('cube-3d-box-element');
    this.viewportElement = document.getElementById('cube-viewport-element');
    this.dialElement = document.getElementById('cube-circle-dial');
    this.handleElement = document.getElementById('circle-orbit-handle');
    this.autospinText = document.getElementById('cube-autospin-text');
  }

  setupEventListeners() {
    // 1. Direct drag on 3D Box
    if (this.viewportElement) {
      this.viewportElement.addEventListener('pointerdown', (e) => this.onBoxPointerDown(e));
    }

    // 2. Circular drag on Orbit Dial
    if (this.dialElement) {
      this.dialElement.addEventListener('pointerdown', (e) => this.onDialPointerDown(e));
    }

    // 3. Document level pointer move & up
    this.boundGlobalMove = (e) => this.onGlobalPointerMove(e);
    this.boundGlobalUp = (e) => this.onGlobalPointerUp(e);
    window.addEventListener('pointermove', this.boundGlobalMove);
    window.addEventListener('pointerup', this.boundGlobalUp);

    // 4. Buttons
    const prevBtn = document.getElementById('cube-btn-prev');
    const nextBtn = document.getElementById('cube-btn-next');
    const spinBtn = document.getElementById('cube-btn-autospin');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        soundEngine.playClick();
        this.stepCategory(-1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        soundEngine.playClick();
        this.stepCategory(1);
      });
    }

    if (spinBtn) {
      spinBtn.addEventListener('click', () => {
        this.autoSpin = !this.autoSpin;
        soundEngine.playClick();
        spinBtn.classList.toggle('active', this.autoSpin);
        if (this.autospinText) {
          this.autospinText.textContent = `Auto-Spin: ${this.autoSpin ? 'ON' : 'OFF'}`;
        }
        this.wakeLoop();
      });
    }

    // 5. Dimension Filter Pills
    this.container.querySelectorAll('.cube-filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        soundEngine.playClick();
        const dim = pill.dataset.dim;
        this.filterCategories(dim);
        this.refreshFaces();
        this.container.querySelectorAll('.cube-filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
    });

    // 6. Enter category buttons on faces
    this.container.addEventListener('click', (e) => {
      const enterBtn = e.target.closest('[data-enter-cat]');
      if (enterBtn) {
        e.stopPropagation();
        const catId = enterBtn.dataset.enterCat;
        soundEngine.playAttackCharge();
        this.router.navigateTo('category', catId);
      }
    });
  }

  onBoxPointerDown(e) {
    if (e.target.closest('.face-footer-btn')) return;
    this.isDragging = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.autoSpin = false;
    if (this.boxElement) this.boxElement.classList.add('grabbing');
    this.wakeLoop();
  }

  onDialPointerDown(e) {
    this.isDialDragging = true;
    this.autoSpin = false;
    if (this.dialElement) this.dialElement.classList.add('active');
    const rect = this.dialElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    this.lastDialAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    this.wakeLoop();
  }

  onGlobalPointerMove(e) {
    // Handling direct box drag
    if (this.isDragging) {
      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;
      this.targetRotY += dx * 0.5;
      this.targetRotX -= dy * 0.4;
      // Clamp vertical tilt
      this.targetRotX = Math.max(-60, Math.min(60, this.targetRotX));
      this.startX = e.clientX;
      this.startY = e.clientY;
    }

    // Handling circular dial drag ("Circle it to move next category")
    if (this.isDialDragging && this.dialElement) {
      const rect = this.dialElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

      let delta = currentAngle - this.lastDialAngle;
      // Handle 180/-180 wrap
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      this.targetRotY += delta * 1.3;
      this.lastDialAngle = currentAngle;

      // Update handle position along the circumference
      if (this.handleElement) {
        this.handleElement.style.transform = `rotate(${currentAngle + 90}deg)`;
      }

      // Check if rotated past 90 degrees threshold to cycle category
      if (Math.abs(delta) > 5) {
        this.checkCategoryAdvance();
      }
    }
  }

  onGlobalPointerUp() {
    if (this.isDragging) {
      this.isDragging = false;
      if (this.boxElement) this.boxElement.classList.remove('grabbing');
      this.snapToClosestFace();
    }
    if (this.isDialDragging) {
      this.isDialDragging = false;
      if (this.dialElement) this.dialElement.classList.remove('active');
      this.snapToClosestFace();
    }
  }

  checkCategoryAdvance() {
    // Normalize targetRotY
    const step = 90;
    const nearestFace = Math.round(this.targetRotY / step);
    const expectedIndex = Math.abs(nearestFace) % this.categoryList.length;
    if (expectedIndex !== this.currentIndex) {
      this.currentIndex = expectedIndex;
      soundFXMatrix.playCubeGyroClack();
    }
  }

  snapToClosestFace() {
    const snapY = Math.round(this.targetRotY / 90) * 90;
    const snapX = Math.round(this.targetRotX / 90) * 90;
    this.targetRotY = snapY;
    this.targetRotX = Math.max(-30, Math.min(30, snapX));

    // Calculate which face ended up in front
    const faceIndex = ((Math.round(-snapY / 90) % 4) + 4) % 4;
    this.currentIndex = (this.currentIndex + faceIndex) % this.categoryList.length;
    soundFXMatrix.playCubeGyroClack();
  }

  stepCategory(direction) {
    this.targetRotY -= direction * 90;
    this.currentIndex = (this.currentIndex + direction + this.categoryList.length) % this.categoryList.length;
    soundEngine.playWhoosh();
    this.refreshFaces();
    this.wakeLoop();
  }

  refreshFaces() {
    if (!this.boxElement) return;
    this.boxElement.innerHTML = this.renderCubeFacesHTML();
  }

  wakeLoop() {
    if (!this.animFrameId) {
      this.startLoop();
    }
  }

  startLoop() {
    const animate = () => {
      if (!this.container || !document.body.contains(this.container)) {
        this.animFrameId = null;
        return;
      }

      if (this.autoSpin) {
        this.targetRotY += 0.4;
      }

      const diffX = this.targetRotX - this.rotX;
      const diffY = this.targetRotY - this.rotY;
      const hasMotion = Math.abs(diffX) > 0.04 || Math.abs(diffY) > 0.04 || this.autoSpin || this.isDragging || this.isDialDragging;

      if (hasMotion) {
        this.rotX += diffX * 0.12;
        this.rotY += diffY * 0.12;
        this.updateCubeRotation();
        this.animFrameId = requestAnimationFrame(animate);
      } else {
        // Snap cleanly and pause loop to save 100% CPU when idle
        this.rotX = this.targetRotX;
        this.rotY = this.targetRotY;
        this.updateCubeRotation();
        this.animFrameId = null;
      }
    };

    if (!this.animFrameId) {
      this.animFrameId = requestAnimationFrame(animate);
    }
  }

  updateCubeRotation() {
    if (this.boxElement) {
      this.boxElement.style.transform = `rotateX(${this.rotX}deg) rotateY(${this.rotY}deg)`;
    }
  }
}

/**
 * 3D Anime Poster Carousel Component (In-Category 3D Paging)
 */
export class Anime3DCarousel {
  constructor(router, containerId = 'carousel-3d-mount') {
    this.router = router;
    this.container = document.getElementById(containerId);
    this.animeList = [];
    this.category = null;
    this.currentIndex = 0;
    this.currentAngle = 0;
    this.targetAngle = 0;
    this.isDragging = false;
    this.startX = 0;
    this.animFrameId = null;
  }

  mount(targetElement, categoryId) {
    if (typeof targetElement === 'string') {
      this.container = document.getElementById(targetElement);
    } else {
      this.container = targetElement;
    }
    if (!this.container) return;

    this.category = CATEGORIES[categoryId] || CATEGORIES['action'];
    this.animeList = getAnimeByCategory(categoryId);
    this.currentIndex = 0;
    this.currentAngle = 0;
    this.targetAngle = 0;

    this.render();
    this.setupEventListeners();
    this.startLoop();
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.boundPointerMove) {
      window.removeEventListener('pointermove', this.boundPointerMove);
    }
    if (this.boundPointerUp) {
      window.removeEventListener('pointerup', this.boundPointerUp);
    }
    if (this.boundKeyDown) {
      window.removeEventListener('keydown', this.boundKeyDown);
    }
  }

  render() {
    if (!this.container) return;
    const total = this.animeList.length;
    const angleStep = 360 / Math.max(1, total);
    // Radius for 10 cards of 240px width ~ 420px
    const radius = Math.round((240 / 2) / Math.tan(Math.PI / total)) + 50;

    this.container.innerHTML = `
      <section class="anime-carousel-3d-section">
        <div class="carousel-3d-header">
          <div class="carousel-3d-title-group">
            <span style="font-size: 1.8rem;">🎲</span>
            <div>
              <h2>3D CUBE CAROUSEL PAGING</h2>
              <small style="color: #94a3b8;">Rotate the 3D polygon ring to inspect all ${total} official anime posters</small>
            </div>
          </div>

          <div class="carousel-counter-tag" id="carousel-counter">
            1 / ${total}
          </div>
        </div>

        <!-- 3D Viewport with Surrounding Holographic Atmosphere -->
        <div class="carousel-3d-viewport" id="carousel-viewport">
          <!-- Surrounding Atmosphere Effects -->
          <div class="carousel-ambient-spotlight"></div>
          <div class="carousel-hologram-floor"></div>
          <div class="carousel-stage-ring"></div>
          <div class="carousel-spatial-particles">
            <span class="c-spark c-spark-1"></span>
            <span class="c-spark c-spark-2"></span>
            <span class="c-spark c-spark-3"></span>
            <span class="c-spark c-spark-4"></span>
            <span class="c-spark c-spark-5"></span>
            <span class="c-spark c-spark-6"></span>
          </div>

          <div class="carousel-3d-ring" id="carousel-ring">
            ${this.animeList.map((anime, idx) => {
              const cardAngle = idx * angleStep;
              const posterUrl = getAnimePoster(anime);
              return `
                <div 
                  class="carousel-3d-card ${idx === 0 ? 'active-center' : 'inactive'}" 
                  data-card-index="${idx}"
                  data-anime-id="${anime.id}"
                  style="transform: rotateY(${cardAngle}deg) translateZ(${radius}px);"
                >
                  <img 
                    src="${posterUrl}" 
                    alt="${anime.title}" 
                    class="card-3d-poster-img"
                    loading="lazy"
                    decoding="async"
                    onerror="this.onerror=null; this.src='${createStylizedAnimePosterSVG(anime)}';"
                  />
                  <div class="card-3d-overlay">
                    <span>⭐</span>
                    <span>${anime.rating}</span>
                  </div>

                  <div class="card-3d-info">
                    <div>
                      <h4 class="card-3d-title" title="${anime.title}">${anime.title}</h4>
                      <div class="card-3d-meta">
                        <span>${anime.studio}</span>
                        <span>${anime.year}</span>
                      </div>
                    </div>
                    <div class="card-3d-move" title="${anime.signatureMove}">
                      <span>💥</span>
                      <span>${anime.signatureMove}</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Carousel Controls -->
        <div class="carousel-3d-controls-bar">
          <button class="carousel-nav-btn" id="carousel-btn-prev" title="Previous Anime (←)">‹</button>
          
          <div class="carousel-dots-list" id="carousel-dots-list">
            ${this.animeList.map((_, i) => `
              <div class="carousel-dot ${i === 0 ? 'active' : ''}" data-dot-index="${i}"></div>
            `).join('')}
          </div>

          <button class="carousel-nav-btn" id="carousel-btn-next" title="Next Anime (→)">›</button>
        </div>
      </section>
    `;

    this.ringElement = document.getElementById('carousel-ring');
    this.viewportElement = document.getElementById('carousel-viewport');
    this.counterElement = document.getElementById('carousel-counter');
    this.dotsContainer = document.getElementById('carousel-dots-list');
  }

  setupEventListeners() {
    if (this.viewportElement) {
      this.viewportElement.addEventListener('pointerdown', (e) => {
        this.isDragging = true;
        this.startX = e.clientX;
        this.wakeLoop();
      });
    }

    this.boundPointerMove = (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.startX;
      this.targetAngle += dx * 0.45;
      this.startX = e.clientX;
      this.wakeLoop();
    };

    this.boundPointerUp = () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.snapToClosestCard();
      }
    };

    this.boundKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        this.step(-1);
      } else if (e.key === 'ArrowRight') {
        this.step(1);
      }
    };

    window.addEventListener('pointermove', this.boundPointerMove);
    window.addEventListener('pointerup', this.boundPointerUp);
    window.addEventListener('keydown', this.boundKeyDown);

    // Nav Buttons
    const prevBtn = document.getElementById('carousel-btn-prev');
    const nextBtn = document.getElementById('carousel-btn-next');
    if (prevBtn) prevBtn.addEventListener('click', () => this.step(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => this.step(1));

    // Dots Click
    if (this.dotsContainer) {
      this.dotsContainer.querySelectorAll('.carousel-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          const idx = parseInt(dot.dataset.dotIndex, 10);
          this.goToIndex(idx);
        });
      });
    }

    // Card Click -> Open Detail Modal
    if (this.ringElement) {
      this.ringElement.addEventListener('click', (e) => {
        const card = e.target.closest('.carousel-3d-card');
        if (!card) return;
        const idx = parseInt(card.dataset.cardIndex, 10);
        if (idx !== this.currentIndex) {
          // If clicked a side card, rotate it to center first
          this.goToIndex(idx);
        } else {
          // If already centered, open modal
          const animeId = card.dataset.animeId;
          soundEngine.playClick();
          this.router.openAnimeModal(animeId);
        }
      });
    }
  }

  step(direction) {
    const total = this.animeList.length;
    this.goToIndex((this.currentIndex + direction + total) % total);
  }

  goToIndex(targetIdx) {
    const total = this.animeList.length;
    const angleStep = 360 / Math.max(1, total);
    this.currentIndex = (targetIdx + total) % total;
    this.targetAngle = -this.currentIndex * angleStep;
    soundEngine.playWhoosh();
    this.updateCardClasses();
    this.wakeLoop();
  }

  snapToClosestCard() {
    const total = this.animeList.length;
    const angleStep = 360 / Math.max(1, total);
    const normalized = -this.targetAngle / angleStep;
    const nearestIdx = ((Math.round(normalized) % total) + total) % total;
    this.goToIndex(nearestIdx);
  }

  updateCardClasses() {
    if (!this.ringElement) return;
    const cards = this.ringElement.querySelectorAll('.carousel-3d-card');
    cards.forEach((card, idx) => {
      const isActive = idx === this.currentIndex;
      card.classList.toggle('active-center', isActive);
      card.classList.toggle('inactive', !isActive);
    });

    if (this.counterElement) {
      this.counterElement.textContent = `${this.currentIndex + 1} / ${this.animeList.length}`;
    }

    if (this.dotsContainer) {
      const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === this.currentIndex);
      });
    }
  }

  wakeLoop() {
    if (!this.animFrameId) {
      this.startLoop();
    }
  }

  startLoop() {
    const animate = () => {
      if (!this.container || !document.body.contains(this.container)) {
        this.animFrameId = null;
        return;
      }

      const diff = this.targetAngle - this.currentAngle;
      if (Math.abs(diff) > 0.04 || this.isDragging) {
        this.currentAngle += diff * 0.15;
        if (this.ringElement) {
          this.ringElement.style.transform = `rotateY(${this.currentAngle}deg)`;
        }
        this.animFrameId = requestAnimationFrame(animate);
      } else {
        // Settle cleanly to exact target angle and pause loop
        this.currentAngle = this.targetAngle;
        if (this.ringElement) {
          this.ringElement.style.transform = `rotateY(${this.currentAngle}deg)`;
        }
        this.animFrameId = null;
      }
    };

    if (!this.animFrameId) {
      this.animFrameId = requestAnimationFrame(animate);
    }
  }
}
