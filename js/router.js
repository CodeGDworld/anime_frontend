/**
 * Anime Nexus - Dynamic Page Router & Full Stack Views Manager
 * Handles:
 * - Dynamic view rendering: Home, Category, Anime Details, Favorites, User Profile, Admin Panel, and ML Popularity Studio
 * - Logistic Regression Machine Learning Predictions & Sigmoid Visualization
 * - Anime Signature Move Page Transitions (Kamehameha, Serious Punch, Sakura Whirlwind, etc.)
 * - Favorites sync & toggle
 * - Admin Panel (Analytics, Anime Catalog CRUD, Hero Users Registry)
 * - Filtering, Sorting, and Search
 */

import { CATEGORIES, ANIME_DATABASE, getAnimeByCategory, getAnimeById, searchAnime } from './data.js';
import { movesEngine } from './moves.js';
import { soundEngine, soundFXMatrix } from './audio.js';
import { video3DTheater } from './video-theater.js';
import { api } from './api.js';
import { getAnimePoster, createStylizedAnimePosterSVG } from './poster-fallback.js';
import { Category3DCube, Anime3DCarousel, ALL_CATEGORY_IDS } from './cube-nav.js';
import { mangaTransition } from './manga-transition.js';
import { voiceRecognition } from './speech.js';

export class AppRouter {
  constructor() {
    this.mainContainer = null;
    this.currentRoute = 'home';
    this.currentCategory = null;
    this.currentSort = 'rating';
    this.adminActiveTab = 'analytics';
    this.categoryCube = null;
    this.animeCarousel = null;
    this.categoryViewMode = '3d-carousel'; // Default to iconic 3D Cube Carousel with quick toggle
  }

  init(containerId = 'app-content') {
    this.mainContainer = document.getElementById(containerId);
    this.setupNavigationListeners();
    this.setupSearch();
    this.setupModal();

    // Subscribe to API favorites/auth changes to re-render hearts
    api.subscribe((event) => {
      if (event === 'favorites:change') {
        this.updateHeartButtons();
      }
    });

    // Handle browser hash changes
    window.addEventListener('hashchange', () => this.handleHashChange());
    this.handleHashChange();
  }

  setupNavigationListeners() {
    // Nav links
    document.querySelectorAll('[data-route]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        soundEngine.playClick();
        const route = link.dataset.route;
        const param = link.dataset.param || null;
        this.navigateTo(route, param);
      });
    });

    // 3D Arena Button
    const arenaBtn = document.getElementById('nav-arena-btn');
    if (arenaBtn) {
      arenaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        soundEngine.playClick();
        video3DTheater.open('kamehameha');
      });
    }

    // Audio Toggle
    const soundToggle = document.getElementById('audio-toggle-btn');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        const isMuted = soundEngine.toggleMute();
        soundToggle.classList.toggle('muted', isMuted);
        const icon = soundToggle.querySelector('.audio-icon');
        const text = soundToggle.querySelector('.audio-text');
        if (icon) icon.textContent = isMuted ? '🔇' : '🔊';
        if (text) text.textContent = isMuted ? 'Muted' : 'Sound ON';
      });
    }

    // Attacks Dojo Quick Menu Dropdown
    document.querySelectorAll('[data-trigger-move]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const move = btn.dataset.triggerMove;
        movesEngine.trigger(move);
      });
    });
  }

  setupSearch() {
    const searchInput = document.getElementById('global-search-input');
    const searchResults = document.getElementById('search-results-dropdown');
    const voiceSearchBtn = document.getElementById('voice-search-btn');

    if (!searchInput || !searchResults) return;

    if (voiceSearchBtn) {
      voiceSearchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (voiceSearchBtn.classList.contains('listening')) {
          voiceRecognition.stop();
          voiceSearchBtn.classList.remove('listening');
          searchInput.classList.remove('voice-active');
        } else {
          voiceSearchBtn.classList.add('listening');
          soundFXMatrix.playClick();
          voiceRecognition.startSearchListening(searchInput, (transcript) => {
            voiceSearchBtn.classList.remove('listening');
            searchInput.classList.remove('voice-active');
          });
        }
      });
    }

    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      if (q.length < 2) {
        searchResults.classList.add('hidden');
        searchResults.innerHTML = '';
        return;
      }

      const results = searchAnime(q).slice(0, 6);
      if (results.length === 0) {
        searchResults.innerHTML = `<div class="search-empty">No anime found matching "${q}"</div>`;
      } else {
        searchResults.innerHTML = results.map(anime => `
          <div class="search-result-item" data-anime-id="${anime.id}">
            <img 
              src="${getAnimePoster(anime)}" 
              alt="${anime.title}" 
              class="search-thumb" 
              onerror="this.src='${createStylizedAnimePosterSVG(anime)}'"
            >
            <div class="search-info">
              <strong class="search-title">${anime.title}</strong>
              <div class="search-sub">${anime.studio} &bull; ${anime.year} &bull; ⭐ ${anime.rating}</div>
            </div>
            <span class="search-move-tag">${anime.signatureMove}</span>
          </div>
        `).join('');

        searchResults.querySelectorAll('.search-result-item').forEach(item => {
          item.addEventListener('click', () => {
            soundEngine.playClick();
            searchResults.classList.add('hidden');
            searchInput.value = '';
            this.openAnimeModal(item.dataset.animeId);
          });
        });
      }
      searchResults.classList.remove('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.add('hidden');
      }
    });
  }

  setupModal() {
    const modal = document.getElementById('anime-detail-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const backdrop = document.getElementById('modal-backdrop');

    if (closeBtn) closeBtn.addEventListener('click', () => this.closeAnimeModal());
    if (backdrop) backdrop.addEventListener('click', () => this.closeAnimeModal());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeAnimeModal();
    });
  }

  handleHashChange() {
    const hash = window.location.hash.slice(1);
    if (!hash || hash === 'home') {
      this.renderHome();
    } else if (hash.startsWith('category/')) {
      const catId = hash.replace('category/', '');
      this.renderCategory(catId, false);
    } else if (hash === 'favorites') {
      this.renderFavorites();
    } else if (hash === 'profile') {
      this.renderProfile();
    } else if (hash === 'admin') {
      this.renderAdmin();
    } else if (hash === 'ml-studio') {
      this.renderMLStudio();
    } else if (hash.startsWith('anime/')) {
      const animeId = hash.replace('anime/', '');
      this.openAnimeModal(animeId);
    } else if (hash === 'arena') {
      video3DTheater.open();
    }
  }

  /**
   * Navigate with Dynamic "Manga Ink" Transition Shaders & Halftone Screentone Burst
   */
  navigateTo(route, param = null) {
    // Execute custom GLSL Manga Ink transition shader:
    // Outward bursting monochrome halftone dots -> midpoint view swap -> ink dissolve
    mangaTransition.execute(
      () => {
        // Midpoint callback: swap page underneath while covered by manga ink
        this.executeNavigation(route, param);
      },
      () => {
        // Complete callback
      }
    );
  }

  executeNavigation(route, param) {
    if (route === 'home') {
      window.location.hash = 'home';
      this.renderHome();
    } else if (route === 'category') {
      window.location.hash = `category/${param}`;
      this.renderCategory(param, true);
    } else if (route === 'favorites') {
      window.location.hash = 'favorites';
      this.renderFavorites();
    } else if (route === 'profile') {
      window.location.hash = 'profile';
      this.renderProfile();
    } else if (route === 'admin') {
      window.location.hash = 'admin';
      this.renderAdmin();
    } else if (route === 'ml-studio') {
      window.location.hash = 'ml-studio';
      this.renderMLStudio();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================
  // VIEW: HOME DASHBOARD
  // ==========================================
  renderHome() {
    this.currentRoute = 'home';
    this.updateActiveNav('home');
    document.body.className = 'theme-home';

    this.mainContainer.innerHTML = `
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-bg-fx"></div>
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-fire">🔥</span>
            <span>AI POWERED FULL STACK ANIME SYSTEM</span>
          </div>
          <h1 class="hero-title">
            UNLEASH YOUR ULTIMATE <span class="gradient-text">ANIME DESTINY</span>
          </h1>
          <p class="hero-desc">
            Experience deep anime recommendations powered by <strong>3D Signature Attack Moves</strong>, a <strong>Logistic Regression Popularity Model</strong>, <strong>Admin Controls</strong>, and <strong>Favorites Vault</strong>.
          </p>
          <div class="hero-action-row">
            <button class="hero-primary-btn" id="hero-explore-btn">
              <span>EXPLORE ALL CATEGORIES</span> &rarr;
            </button>
            <button class="hero-secondary-btn" id="hero-ml-launch">
              <span>🤖 ML POPULARITY STUDIO</span>
            </button>
            <button class="hero-punch-btn" id="hero-punch-trigger">
              <span>🥊 SERIOUS PUNCH!</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Signature Moves Quick Dojo Bar -->
      <section class="moves-dojo-strip">
        <div class="dojo-header">
          <span class="dojo-kanji">必殺技</span>
          <strong class="dojo-title">ANIME SIGNATURE ATTACK DOJO</strong>
          <span class="dojo-sub">Click any move to trigger its 3D blast:</span>
        </div>
        <div class="dojo-buttons-grid">
          <button class="dojo-attack-btn btn-kame" data-attack="kamehameha">
            <span class="btn-icon">⚡</span>
            <div class="btn-text">
              <strong>Kamehameha</strong>
              <small>Dragon Ball Z</small>
            </div>
          </button>
          <button class="dojo-attack-btn btn-punch" data-attack="serious_punch">
            <span class="btn-icon">🥊</span>
            <div class="btn-text">
              <strong>Serious Punch</strong>
              <small>One Punch Man</small>
            </div>
          </button>
          <button class="dojo-attack-btn btn-sakura" data-attack="sakura_blossom">
            <span class="btn-icon">🌸</span>
            <div class="btn-text">
              <strong>Sakura Vortex</strong>
              <small>Slice of Life</small>
            </div>
          </button>
          <button class="dojo-attack-btn btn-void" data-attack="domain_expansion">
            <span class="btn-icon">🔮</span>
            <div class="btn-text">
              <strong>Domain Expansion</strong>
              <small>Jujutsu Kaisen</small>
            </div>
          </button>
          <button class="dojo-attack-btn btn-solar" data-attack="solar_flare">
            <span class="btn-icon">🔥</span>
            <div class="btn-text">
              <strong>Solar Flare</strong>
              <small>Summer Season</small>
            </div>
          </button>
          <button class="dojo-attack-btn btn-ice" data-attack="ice_glaciation">
            <span class="btn-icon">❄️</span>
            <div class="btn-text">
              <strong>Ice Glaciation</strong>
              <small>Winter Season</small>
            </div>
          </button>
        </div>
      </section>

      <!-- 3D Category Cube Navigator ("Circle it to move next categorized category") -->
      <div id="home-3d-cube-mount"></div>

      <!-- 3 Categorization Pillars -->
      <div class="dimension-section" id="categories-section">
        
        <!-- 1. GENRES (Slice of life, Mystery, Action, Romance) -->
        <div class="dimension-block">
          <div class="dimension-header">
            <div class="dimension-title-group">
              <span class="dim-tag">DIMENSION 01</span>
              <h2 class="dimension-title">GENRES (ジャンル)</h2>
            </div>
            <p class="dimension-sub">Four core thematic realms featuring customized attack transitions.</p>
          </div>
          <div class="category-cards-grid">
            ${this.renderCategoryCard('slice-of-life')}
            ${this.renderCategoryCard('mystery')}
            ${this.renderCategoryCard('action')}
            ${this.renderCategoryCard('romance')}
          </div>
        </div>

        <!-- 2. SEASONS (Spring, Summer, Autumn, Winter) -->
        <div class="dimension-block">
          <div class="dimension-header">
            <div class="dimension-title-group">
              <span class="dim-tag">DIMENSION 02</span>
              <h2 class="dimension-title">SEASONS (四季の季節)</h2>
            </div>
            <p class="dimension-sub">Follow anime through blooming springs, blazing summers, crimson autumns, and frosty winters.</p>
          </div>
          <div class="category-cards-grid">
            ${this.renderCategoryCard('spring')}
            ${this.renderCategoryCard('summer')}
            ${this.renderCategoryCard('autumn')}
            ${this.renderCategoryCard('winter')}
          </div>
        </div>

        <!-- 3. AGE / DEMOGRAPHICS (Shounen, Shoujo, Kodomo, Seinen, Josei) -->
        <div class="dimension-block">
          <div class="dimension-header">
            <div class="dimension-title-group">
              <span class="dim-tag">DIMENSION 03</span>
              <h2 class="dimension-title">DEMOGRAPHICS & AGE (対象年代)</h2>
            </div>
            <p class="dimension-sub">From pure childhood wonder to adult psychological masterworks.</p>
          </div>
          <div class="category-cards-grid five-cols">
            ${this.renderCategoryCard('shounen')}
            ${this.renderCategoryCard('shoujo')}
            ${this.renderCategoryCard('kodomo')}
            ${this.renderCategoryCard('seinen')}
            ${this.renderCategoryCard('josei')}
          </div>
        </div>
      </div>
    `;

    document.getElementById('hero-explore-btn').addEventListener('click', () => {
      document.getElementById('categories-section').scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('hero-ml-launch').addEventListener('click', () => {
      this.navigateTo('ml-studio');
    });

    document.getElementById('hero-punch-trigger').addEventListener('click', () => {
      movesEngine.trigger('serious_punch');
    });

    this.mainContainer.querySelectorAll('[data-attack]').forEach(btn => {
      btn.addEventListener('click', () => {
        movesEngine.trigger(btn.dataset.attack);
      });
    });

    this.mainContainer.querySelectorAll('[data-open-category]').forEach(card => {
      card.addEventListener('click', () => {
        const catId = card.dataset.openCategory;
        this.navigateTo('category', catId);
      });
    });

    // Mount Interactive 3D Category Cube with Circular Gyroscope Dial
    if (this.categoryCube) this.categoryCube.destroy();
    this.categoryCube = new Category3DCube(this);
    this.categoryCube.mount('home-3d-cube-mount');
  }

  renderCategoryCard(catId) {
    const cat = CATEGORIES[catId];
    if (!cat) return '';

    return `
      <div class="category-portal-card" data-open-category="${cat.id}" style="--accent-color: ${cat.accentColor};">
        <div class="card-glow-bg" style="background: ${cat.gradient};"></div>
        <div class="card-inner">
          <div class="cat-card-top">
            <span class="cat-kanji">${cat.japaneseName}</span>
            <span class="cat-move-pill">${cat.signatureMove.name}</span>
          </div>
          <h3 class="cat-name">${cat.name}</h3>
          <p class="cat-tagline">${cat.tagline}</p>
          
          <div class="cat-meta-footer">
            <span class="cat-count">10 Curated Masterpieces</span>
            <span class="cat-arrow">&rarr;</span>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // VIEW: DYNAMIC CATEGORY PAGE (10 Anime)
  // ==========================================
  renderCategory(categoryId, hasTransitioned = false) {
    const cat = CATEGORIES[categoryId];
    if (!cat) {
      this.renderHome();
      return;
    }

    this.currentRoute = `category/${categoryId}`;
    this.currentCategory = categoryId;
    this.updateActiveNav(categoryId);
    document.body.className = `theme-${categoryId}`;

    const animeList = getAnimeByCategory(categoryId);

    // Compute previous and next category for 3D transit
    const catIdx = ALL_CATEGORY_IDS.indexOf(categoryId);
    const prevCatId = ALL_CATEGORY_IDS[(catIdx - 1 + ALL_CATEGORY_IDS.length) % ALL_CATEGORY_IDS.length];
    const nextCatId = ALL_CATEGORY_IDS[(catIdx + 1) % ALL_CATEGORY_IDS.length];
    const prevCat = CATEGORIES[prevCatId];
    const nextCat = CATEGORIES[nextCatId];

    this.mainContainer.innerHTML = `
      <section class="category-hero-banner" style="--accent: ${cat.accentColor};">
        <div class="cat-hero-glow" style="background: ${cat.gradient};"></div>
        
        <div class="cat-hero-container">
          <div class="cat-breadcrumbs">
            <a href="#home" class="crumb-link" data-route="home">Home</a>
            <span class="crumb-sep">/</span>
            <span class="crumb-dim">${cat.dimension.toUpperCase()}</span>
            <span class="crumb-sep">/</span>
            <span class="crumb-current">${cat.name}</span>
          </div>

          <div class="cat-hero-headline">
            <span class="cat-hero-kanji">${cat.japaneseName}</span>
            <h1 class="cat-hero-title">${cat.name}</h1>
            <p class="cat-hero-tagline">${cat.tagline}</p>
          </div>

          <div class="cat-lore-box">
            <div class="cat-lore-header">
              <span class="lore-icon">📖</span>
              <strong>ABOUT THIS CATEGORY</strong>
            </div>
            <div class="cat-lore-text">
              ${cat.description.split('\n\n').map(p => `<p>${p}</p>`).join('')}
            </div>
          </div>

          <div class="cat-signature-widget">
            <div class="widget-left">
              <span class="widget-tag">CATEGORY SIGNATURE ATTACK</span>
              <h3 class="widget-move-name">${cat.signatureMove.name}</h3>
              <p class="widget-quote">"${cat.signatureMove.quote}"</p>
              <div class="widget-origin">Source: <strong>${cat.signatureMove.origin}</strong></div>
            </div>
            <div class="widget-right">
              <button class="trigger-category-move-btn" id="btn-trigger-cat-move">
                <span>💥 UNLEASH ${cat.signatureMove.name.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="anime-shelf-container">
        <div class="shelf-controls-bar">
          <div class="shelf-title-group">
            <h2 class="shelf-title">10 CURATED RECOMMENDATIONS</h2>
            <span class="shelf-count">Official Anime Posters (${animeList.length} Items)</span>
          </div>

          <!-- 3D Paging View Toggle -->
          <div class="carousel-view-toggles">
            <button class="view-toggle-btn ${this.categoryViewMode === '3d-carousel' ? 'active' : ''}" id="toggle-view-3d">
              <span>🎲</span>
              <span>3D Cube Paging</span>
            </button>
            <button class="view-toggle-btn ${this.categoryViewMode === 'grid' ? 'active' : ''}" id="toggle-view-grid">
              <span>🗂️</span>
              <span>Grid View</span>
            </button>
          </div>

          <div class="shelf-filters">
            <label for="shelf-sort">Sort by:</label>
            <select id="shelf-sort" class="shelf-select">
              <option value="rating">Highest Rating ⭐</option>
              <option value="year-desc">Newest First 📅</option>
              <option value="year-asc">Oldest First ⏳</option>
              <option value="title">Alphabetical (A-Z) 🔤</option>
            </select>
          </div>
        </div>

        <!-- 1. 3D Cube Carousel View (Default) -->
        <div id="cat-3d-carousel-mount" class="${this.categoryViewMode === '3d-carousel' ? '' : 'hidden'}"></div>

        <!-- 2. Grid View -->
        <div class="anime-cards-grid ${this.categoryViewMode === 'grid' ? '' : 'hidden'}" id="anime-cards-grid">
          ${this.renderAnimeCardList(animeList)}
        </div>

        <!-- 3D Multiverse Category Transit Bar -->
        <section class="cat-transit-bar" style="margin: 2.5rem 0; padding: 1.25rem 1.75rem; background: rgba(15, 23, 42, 0.85); border-radius: 18px; border: 1px solid rgba(56, 189, 248, 0.25); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <button class="cube-tool-btn" id="cat-transit-prev" data-target-cat="${prevCatId}">
            <span>‹</span>
            <span>3D Prev: <strong>${prevCat.name}</strong></span>
          </button>
          
          <button class="cube-tool-btn active" id="cat-transit-cube-jump">
            <span>🎲</span>
            <span>Circle 3D Multiverse Cube</span>
          </button>

          <button class="cube-tool-btn" id="cat-transit-next" data-target-cat="${nextCatId}">
            <span>3D Next: <strong>${nextCat.name}</strong></span>
            <span>›</span>
          </button>
        </section>
      </section>
    `;

    // Mount 3D Anime Poster Carousel
    if (this.animeCarousel) this.animeCarousel.destroy();
    this.animeCarousel = new Anime3DCarousel(this);
    this.animeCarousel.mount('cat-3d-carousel-mount', categoryId);

    // View Toggle Handlers
    const toggle3D = document.getElementById('toggle-view-3d');
    const toggleGrid = document.getElementById('toggle-view-grid');
    const carouselMount = document.getElementById('cat-3d-carousel-mount');
    const gridMount = document.getElementById('anime-cards-grid');

    if (toggle3D && toggleGrid) {
      toggle3D.addEventListener('click', () => {
        soundEngine.playClick();
        this.categoryViewMode = '3d-carousel';
        toggle3D.classList.add('active');
        toggleGrid.classList.remove('active');
        carouselMount.classList.remove('hidden');
        gridMount.classList.add('hidden');
      });

      toggleGrid.addEventListener('click', () => {
        soundEngine.playClick();
        this.categoryViewMode = 'grid';
        toggleGrid.classList.add('active');
        toggle3D.classList.remove('active');
        gridMount.classList.remove('hidden');
        carouselMount.classList.add('hidden');
      });
    }

    // Transit Bar Handlers
    const btnPrev = document.getElementById('cat-transit-prev');
    const btnNext = document.getElementById('cat-transit-next');
    const btnJump = document.getElementById('cat-transit-cube-jump');

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        this.navigateTo('category', prevCatId);
      });
    }
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        this.navigateTo('category', nextCatId);
      });
    }
    if (btnJump) {
      btnJump.addEventListener('click', () => {
        this.navigateTo('home');
        setTimeout(() => {
          const el = document.getElementById('home-3d-cube-mount');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      });
    }

    document.getElementById('btn-trigger-cat-move').addEventListener('click', () => {
      movesEngine.trigger(cat.signatureMove.type, {
        title: cat.signatureMove.name,
        subtitle: cat.signatureMove.origin,
        quote: cat.signatureMove.quote
      });
    });

    const sortSelect = document.getElementById('shelf-sort');
    sortSelect.addEventListener('change', (e) => {
      const sorted = this.sortAnimeList([...animeList], e.target.value);
      document.getElementById('anime-cards-grid').innerHTML = this.renderAnimeCardList(sorted);
      this.hookCardEvents();
    });

    this.hookCardEvents();
  }

  // ==========================================
  // VIEW: FAVORITES PANEL
  // ==========================================
  async renderFavorites() {
    this.currentRoute = 'favorites';
    this.updateActiveNav('favorites');
    document.body.className = 'theme-favorites';

    if (!api.currentUser) {
      this.mainContainer.innerHTML = `
        <div class="favorites-view-container">
          <div class="favorites-empty-box">
            <span class="empty-fav-icon">🔒</span>
            <h2 class="empty-fav-title">SIGN IN TO ACCESS FAVORITES</h2>
            <p class="empty-fav-desc">Save your favorite anime, track your watchlists, and sync across devices.</p>
            <button class="explore-fav-btn" id="btn-fav-login">SIGN IN / REGISTER</button>
          </div>
        </div>
      `;
      document.getElementById('btn-fav-login').addEventListener('click', () => {
        window.authUI.showAuthModal('login');
      });
      return;
    }

    const favList = await api.getFavorites();

    this.mainContainer.innerHTML = `
      <div class="favorites-view-container">
        <div class="favorites-header-banner">
          <div class="fav-banner-glow"></div>
          <h1 class="fav-title">MY FAVORITES VAULT</h1>
          <p class="fav-sub">You have saved <strong>${favList.length}</strong> legendary anime series to your personal collection.</p>
        </div>

        ${favList.length === 0 ? `
          <div class="favorites-empty-box">
            <span class="empty-fav-icon">💔</span>
            <h2 class="empty-fav-title">YOUR FAVORITES VAULT IS EMPTY</h2>
            <p class="empty-fav-desc">Explore categories and click the heart icon on any anime card to add it to your vault!</p>
            <button class="explore-fav-btn" id="btn-explore-now">EXPLORE RECOMMENDATIONS &rarr;</button>
          </div>
        ` : `
          <div class="anime-cards-grid" id="favorites-cards-grid">
            ${this.renderAnimeCardList(favList)}
          </div>
        `}
      </div>
    `;

    if (favList.length === 0) {
      document.getElementById('btn-explore-now').addEventListener('click', () => {
        this.navigateTo('home');
      });
    } else {
      this.hookCardEvents();
    }
  }

  // ==========================================
  // VIEW: USER PROFILE PANEL
  // ==========================================
  renderProfile() {
    this.currentRoute = 'profile';
    this.updateActiveNav('profile');
    document.body.className = 'theme-home';

    const user = api.currentUser;
    if (!user) {
      this.navigateTo('home');
      return;
    }

    const favCount = api.favoriteIds.size;
    const powerLevel = 9000 + (favCount * 1250);

    this.mainContainer.innerHTML = `
      <div class="profile-view-container">
        <div class="profile-hero-card">
          <div class="profile-identity-group">
            <div class="profile-avatar-badge">${user.avatar || '⚡'}</div>
            <div class="profile-meta">
              <h2>${user.username}</h2>
              <div class="profile-email">${user.email}</div>
              <span class="profile-rank-pill">${user.heroRank || 'Class S Candidate'}</span>
            </div>
          </div>

          <div class="profile-power-level-card">
            <span class="power-lbl">COMBAT POWER LEVEL</span>
            <strong class="power-val">${powerLevel.toLocaleString()}</strong>
          </div>
        </div>

        <div class="saitama-workout-strip">
          <div class="workout-left">
            <strong>🥊 SAITAMA HERO TRAINING STATS</strong>
            <p>"If you do 100 pushups every day, your power level increases exponentially!"</p>
          </div>
          <div class="workout-counters">
            <div class="counter-chip">💪 100 Push-ups [DONE]</div>
            <div class="counter-chip">🏃 10KM Run [DONE]</div>
            <div class="counter-chip">❤️ ${favCount} Anime Watched</div>
          </div>
        </div>

        <div class="profile-edit-section">
          <h3>EDIT HERO ALIAS & AVATAR</h3>
          <form id="profile-edit-form" class="auth-form">
            <div class="form-group">
              <label for="edit-username">Change Hero Alias</label>
              <input type="text" id="edit-username" class="form-input" value="${user.username}" required>
            </div>
            <div class="form-group">
              <label>Select New Avatar</label>
              <div class="avatar-picker" id="edit-avatar-picker">
                ${['⚡', '🥊', '👑', '🌸', '🔮', '🔥', '❄️', '🗡️'].map(av => `
                  <span class="avatar-option ${user.avatar === av ? 'selected' : ''}" data-avatar="${av}">${av}</span>
                `).join('')}
              </div>
              <input type="hidden" id="edit-avatar-val" value="${user.avatar || '⚡'}">
            </div>
            <button type="submit" class="auth-submit-btn" style="max-width: 250px;">
              <span>SAVE PROFILE UPDATES</span>
            </button>
          </form>
        </div>
      </div>
    `;

    const opts = this.mainContainer.querySelectorAll('.avatar-option');
    const input = document.getElementById('edit-avatar-val');
    opts.forEach(o => {
      o.addEventListener('click', () => {
        opts.forEach(x => x.classList.remove('selected'));
        o.classList.add('selected');
        input.value = o.dataset.avatar;
      });
    });

    document.getElementById('profile-edit-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('edit-username').value;
      const avatar = input.value;
      await api.updateProfile({ username, avatar });
      soundEngine.playSparkleBurst();
      alert('Profile updated successfully!');
      this.renderProfile();
    });
  }

  // ==========================================
  // VIEW: LOGISTIC REGRESSION ML STUDIO
  // ==========================================
  async renderMLStudio() {
    this.currentRoute = 'ml-studio';
    this.updateActiveNav('ml-studio');
    document.body.className = 'theme-ml-studio';

    const stats = await api.getMLModelStats();

    this.mainContainer.innerHTML = `
      <div class="ml-studio-container">
        <!-- ML Hero Banner -->
        <div class="ml-studio-hero">
          <div class="ml-hero-glow"></div>
          <h1 class="ml-studio-title">LOGISTIC REGRESSION POPULARITY MODEL</h1>
          <p class="ml-studio-sub">
            Binary classification engine trained on 130 curated anime using Gradient Descent, L2 Regularization, and strict training-split feature standardization.
          </p>
        </div>

        <div class="ml-grid-layout">
          <!-- LEFT: Interactive Prediction Simulator -->
          <div class="ml-simulator-card">
            <div class="sim-header">
              <h3>⚡ WHAT-IF POPULARITY SIMULATOR</h3>
              <p>Adjust parameters to test how the model computes the probability of an anime becoming a universal blockbuster hit.</p>
            </div>

            <!-- MAL Rating Slider -->
            <div class="sim-slider-row">
              <div class="sim-slider-labels">
                <span>MAL Score Rating</span>
                <strong id="sim-rating-display">8.60 / 10</strong>
              </div>
              <input type="range" min="6.5" max="9.8" step="0.05" value="8.60" class="sim-range-input" id="sim-rating">
            </div>

            <!-- Studio Prestige Selector -->
            <div class="sim-slider-row">
              <div class="sim-slider-labels">
                <span>Studio Sakuga Tier</span>
                <strong id="sim-studio-display">Top Tier (Ufotable/Madhouse/MAPPA)</strong>
              </div>
              <select class="form-input" id="sim-studio">
                <option value="Ufotable">Top Tier (Ufotable, Madhouse, MAPPA, Bones, KyoAni)</option>
                <option value="CloverWorks">Mid Tier (CloverWorks, Pierrot, Production I.G, Trigger)</option>
                <option value="Standard">Indie / Classic Studios</option>
              </select>
            </div>

            <!-- Genre Appeal -->
            <div class="sim-slider-row">
              <div class="sim-slider-labels">
                <span>Category Mass Appeal</span>
              </div>
              <select class="form-input" id="sim-genre">
                <option value="action">Action & Battle / Shounen (High Traffic)</option>
                <option value="mystery">Mystery & Thriller</option>
                <option value="romance">Romance & Drama</option>
                <option value="slice-of-life">Slice of Life (Iyashikei Healing)</option>
                <option value="seinen">Seinen / Josei (Mature Realism)</option>
              </select>
            </div>

            <!-- Episodes Scale -->
            <div class="sim-slider-row">
              <div class="sim-slider-labels">
                <span>Episodes / Cour Scale</span>
                <strong id="sim-episodes-display">24 Episodes</strong>
              </div>
              <input type="range" min="1" max="100" step="1" value="24" class="sim-range-input" id="sim-episodes">
            </div>

            <!-- Real-time Output Gauge -->
            <div class="sim-result-gauge">
              <span class="gauge-lbl">PREDICTED POPULARITY PROBABILITY</span>
              <div class="gauge-val" id="sim-prob-val">87.4%</div>
              <div class="gauge-tier" id="sim-tier-val">Universal Blockbuster Hit 🔥</div>
              <p class="ml-explanation-text" id="sim-explanation" style="margin-top: 0.75rem;">
                Model indicates high probability driven by top-tier studio prestige and strong MAL score.
              </p>
            </div>
          </div>

          <!-- RIGHT: Model Diagnostics, Confusion Matrix & Coefficients -->
          <div class="ml-diagnostics-column">
            <!-- 4 Metrics Tiles -->
            <div class="ml-metrics-strip">
              <div class="ml-metric-tile">
                <span class="tile-label">TEST ACCURACY</span>
                <strong class="tile-number text-emerald">${(stats.metrics.accuracy * 100).toFixed(1)}%</strong>
              </div>
              <div class="ml-metric-tile">
                <span class="tile-label">RECALL RATE</span>
                <strong class="tile-number text-cyan">${(stats.metrics.recall * 100).toFixed(1)}%</strong>
              </div>
              <div class="ml-metric-tile">
                <span class="tile-label">F1-SCORE</span>
                <strong class="tile-number" style="color: #a855f7;">${stats.metrics.f1.toFixed(3)}</strong>
              </div>
              <div class="ml-metric-tile">
                <span class="tile-label">HOLDOUT SPLIT</span>
                <strong class="tile-number">${stats.metrics.testSampleSize} Test</strong>
              </div>
            </div>

            <!-- Confusion Matrix Card -->
            <div class="confusion-matrix-card">
              <h4 class="cm-title">CONFUSION MATRIX (HOLDOUT TEST EVALUATION)</h4>
              <div class="cm-grid">
                <div class="cm-cell true-hit">
                  <span class="cm-cell-val">${stats.metrics.confusionMatrix.tp}</span>
                  <span class="cm-cell-lbl">True Positives (Blockbuster Hits Correctly Identified)</span>
                </div>
                <div class="cm-cell false-alarm">
                  <span class="cm-cell-val">${stats.metrics.confusionMatrix.fp}</span>
                  <span class="cm-cell-lbl">False Positives (Predicted Hits)</span>
                </div>
                <div class="cm-cell false-alarm">
                  <span class="cm-cell-val">${stats.metrics.confusionMatrix.fn}</span>
                  <span class="cm-cell-lbl">False Negatives (Missed Hits)</span>
                </div>
                <div class="cm-cell true-hit">
                  <span class="cm-cell-val">${stats.metrics.confusionMatrix.tn}</span>
                  <span class="cm-cell-lbl">True Negatives (Niche Gems Correctly Classified)</span>
                </div>
              </div>
            </div>

            <!-- Feature Importance Bar Chart -->
            <div class="feature-weights-card">
              <h4 class="cm-title">FEATURE WEIGHTS / LOGISTIC COEFFICIENTS</h4>
              <div class="weights-bars-list">
                ${stats.weights.map(w => {
                  const pct = Math.min(100, Math.round((Math.abs(w.coefficient) / 1.6) * 100));
                  return `
                    <div class="weight-row">
                      <div class="weight-info-line">
                        <span>${w.feature}</span>
                        <strong style="color: ${w.coefficient > 0 ? '#38bdf8' : '#f87171'};">
                          ${w.coefficient > 0 ? '+' : ''}${w.coefficient}
                        </strong>
                      </div>
                      <div class="weight-bar-track">
                        <div class="weight-bar-fill" style="width: ${pct}%;"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Mathematical Formula Banner -->
            <div class="sigmoid-canvas-card">
              <h4 class="cm-title">LOGISTIC REGRESSION SIGMOID EQUATION</h4>
              <p style="font-family: monospace; color: #38bdf8; font-size: 0.9rem; line-height: 1.6; word-break: break-all;">
                ${stats.formula}
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Hook Interactive Simulator
    const ratingSlider = document.getElementById('sim-rating');
    const studioSelect = document.getElementById('sim-studio');
    const genreSelect = document.getElementById('sim-genre');
    const episodesSlider = document.getElementById('sim-episodes');

    const updateSimulator = async () => {
      const rating = parseFloat(ratingSlider.value);
      const studio = studioSelect.value;
      const category = genreSelect.value;
      const episodes = parseInt(episodesSlider.value, 10);

      document.getElementById('sim-rating-display').textContent = `${rating.toFixed(2)} / 10`;
      document.getElementById('sim-episodes-display').textContent = `${episodes} Episodes`;

      const pred = await api.predictCustomML({ rating, studio, category, episodes, year: 2024, description: 'Epic masterpiece' });
      
      const probVal = document.getElementById('sim-prob-val');
      const tierVal = document.getElementById('sim-tier-val');
      const expVal = document.getElementById('sim-explanation');

      probVal.textContent = `${pred.probability}%`;
      probVal.style.color = pred.badgeColor;
      tierVal.textContent = pred.tier;
      expVal.textContent = pred.explanation;
    };

    ratingSlider.addEventListener('input', updateSimulator);
    studioSelect.addEventListener('change', updateSimulator);
    genreSelect.addEventListener('change', updateSimulator);
    episodesSlider.addEventListener('input', updateSimulator);
  }

  // ==========================================
  // VIEW: ADMIN PANEL
  // ==========================================
  async renderAdmin() {
    this.currentRoute = 'admin';
    this.updateActiveNav('admin');
    document.body.className = 'theme-admin';

    const user = api.currentUser;
    if (!user || user.role !== 'admin') {
      this.mainContainer.innerHTML = `
        <div class="admin-view-container">
          <div class="favorites-empty-box">
            <span class="empty-fav-icon">⛔</span>
            <h2 class="empty-fav-title">ACCESS DENIED: ADMIN ONLY</h2>
            <p class="empty-fav-desc">You need Gojo Admin privileges to access the Command Center. Sign in with the Admin Demo account to continue.</p>
            <button class="explore-fav-btn" id="btn-admin-signin">SIGN IN AS ADMIN</button>
          </div>
        </div>
      `;
      document.getElementById('btn-admin-signin').addEventListener('click', () => {
        window.authUI.showAuthModal('login');
      });
      return;
    }

    const stats = await api.getAdminStats();
    const users = await api.getAdminUsers();

    this.mainContainer.innerHTML = `
      <div class="admin-view-container">
        <!-- Header Banner -->
        <div class="admin-header-banner">
          <div class="admin-title-row">
            <span class="admin-badge">SPECIAL GRADE CLEARANCE</span>
            <div class="admin-headline">
              <h1>ADMIN COMMAND CENTER</h1>
              <p>Manage Anime Catalog, Hero Users Registry & ML Diagnostics</p>
            </div>
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <button class="hero-secondary-btn" id="btn-admin-ml-link" style="padding: 0.65rem 1.25rem;">
              <span>🤖 Open ML Studio</span>
            </button>
            <button class="table-add-btn" id="btn-admin-add-anime">
              <span>+ ADD NEW ANIME</span>
            </button>
          </div>
        </div>

        <!-- Admin Tabs -->
        <div class="admin-tabs-nav">
          <button class="admin-tab-btn ${this.adminActiveTab === 'analytics' ? 'active' : ''}" data-admin-tab="analytics">📊 System Analytics & ML</button>
          <button class="admin-tab-btn ${this.adminActiveTab === 'anime' ? 'active' : ''}" data-admin-tab="anime">🎬 Anime Catalog (${stats.totalAnime})</button>
          <button class="admin-tab-btn ${this.adminActiveTab === 'users' ? 'active' : ''}" data-admin-tab="users">👥 Hero Users Registry (${users.length})</button>
        </div>

        <!-- TAB CONTENT: ANALYTICS -->
        <div id="admin-tab-analytics" class="${this.adminActiveTab === 'analytics' ? '' : 'hidden'}">
          <div class="admin-metrics-grid">
            <div class="metric-card">
              <div class="metric-icon">🎬</div>
              <div class="metric-content">
                <span class="m-label">TOTAL ANIME TITLES</span>
                <strong class="m-number">${stats.totalAnime}</strong>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">👥</div>
              <div class="metric-content">
                <span class="m-label">REGISTERED HEROES</span>
                <strong class="m-number">${users.length}</strong>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">❤️</div>
              <div class="metric-content">
                <span class="m-label">TOTAL FAVORITES STORED</span>
                <strong class="m-number">${stats.totalFavorites}</strong>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">🤖</div>
              <div class="metric-content">
                <span class="m-label">LOGISTIC REGRESSION</span>
                <strong class="m-number" style="color: #38bdf8; font-size: 1.5rem;">80.8% ACCURACY</strong>
              </div>
            </div>
          </div>

          <div class="admin-table-container">
            <div class="table-toolbar">
              <strong style="color: #ffffff; font-size: 1.1rem;">🔥 TOP FAVORITED ANIME LEADERBOARD</strong>
            </div>
            <table class="admin-data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Title</th>
                  <th>Studio</th>
                  <th>Rating</th>
                  <th>Favorited By</th>
                </tr>
              </thead>
              <tbody>
                ${stats.topFavorited.map((item, idx) => `
                  <tr>
                    <td><strong>#${idx + 1}</strong></td>
                    <td style="color: #ffffff; font-weight: 700;">${item.title}</td>
                    <td>${item.studio || 'Studio'}</td>
                    <td>⭐ ${item.rating || 9.0}</td>
                    <td><span class="cat-move-pill">${item.count} Heroes</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB CONTENT: ANIME CATALOG CRUD -->
        <div id="admin-tab-anime" class="${this.adminActiveTab === 'anime' ? '' : 'hidden'}">
          <div class="admin-table-container">
            <div class="table-toolbar">
              <input type="text" id="admin-anime-search" class="table-search-input" placeholder="Filter anime table...">
              <button class="table-add-btn" id="btn-admin-add-anime-2">+ Add Anime</button>
            </div>
            <div style="overflow-x: auto;">
              <table class="admin-data-table" id="admin-anime-table">
                <thead>
                  <tr>
                    <th>Poster</th>
                    <th>Title & Japanese</th>
                    <th>Category</th>
                    <th>Studio</th>
                    <th>Year</th>
                    <th>Rating</th>
                    <th>ML Popularity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="admin-anime-tbody">
                  ${this.renderAdminAnimeRows(ANIME_DATABASE)}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- TAB CONTENT: USERS REGISTRY -->
        <div id="admin-tab-users" class="${this.adminActiveTab === 'users' ? '' : 'hidden'}">
          <div class="admin-table-container">
            <table class="admin-data-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Hero Alias</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Hero Rank</th>
                  <th>Favorites</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(u => `
                  <tr>
                    <td style="font-size: 1.5rem;">${u.avatar || '⚡'}</td>
                    <td><strong>${u.username}</strong></td>
                    <td>${u.email}</td>
                    <td>
                      <span class="cat-move-pill" style="color: ${u.role === 'admin' ? '#f59e0b' : '#38bdf8'};">
                        ${u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>${u.heroRank || 'Hero'}</td>
                    <td>${u.favoritesCount || 0} Saved</td>
                    <td>
                      <div class="table-actions">
                        <button class="table-btn btn-role" data-toggle-role="${u.id}" data-current-role="${u.role}">
                          ${u.role === 'admin' ? 'Make User' : 'Make Admin'}
                        </button>
                        ${u.id !== user.id ? `
                          <button class="table-btn btn-delete" data-delete-user="${u.id}">Delete</button>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Add / Edit Anime Admin Modal -->
      <div id="admin-anime-modal" class="auth-modal-overlay hidden">
        <div class="auth-backdrop" id="admin-modal-backdrop"></div>
        <div class="admin-modal-dialog">
          <h2 id="admin-modal-title" style="color: #ffffff; font-family: var(--font-display); margin-bottom: 1.5rem;">ADD NEW ANIME</h2>
          <form id="admin-anime-form" class="auth-form">
            <input type="hidden" id="admin-anime-id">
            <div class="admin-form-grid">
              <div class="form-group full-col">
                <label>Anime English Title</label>
                <input type="text" id="adm-title" class="form-input" placeholder="e.g. Solo Leveling" required>
              </div>
              <div class="form-group">
                <label>Japanese Romaji / Kanji Title</label>
                <input type="text" id="adm-jp" class="form-input" placeholder="e.g. 俺だけレベルアップな件">
              </div>
              <div class="form-group">
                <label>Category</label>
                <select id="adm-cat" class="form-input">
                  <option value="slice-of-life">Slice of Life</option>
                  <option value="mystery">Mystery</option>
                  <option value="action">Action</option>
                  <option value="romance">Romance</option>
                  <option value="spring">Spring Season</option>
                  <option value="summer">Summer Season</option>
                  <option value="autumn">Autumn Season</option>
                  <option value="winter">Winter Season</option>
                  <option value="shounen">Shounen</option>
                  <option value="shoujo">Shoujo</option>
                  <option value="kodomo">Kodomo</option>
                  <option value="seinen">Seinen</option>
                  <option value="josei">Josei</option>
                </select>
              </div>
              <div class="form-group">
                <label>Animation Studio</label>
                <input type="text" id="adm-studio" class="form-input" placeholder="e.g. MAPPA / Ufotable" required>
              </div>
              <div class="form-group">
                <label>Release Year</label>
                <input type="number" id="adm-year" class="form-input" value="2024" required>
              </div>
              <div class="form-group">
                <label>Episodes / Format</label>
                <input type="text" id="adm-episodes" class="form-input" value="12 Episodes" required>
              </div>
              <div class="form-group">
                <label>Score / Rating (1-10)</label>
                <input type="number" step="0.01" id="adm-rating" class="form-input" value="8.50" required>
              </div>
              <div class="form-group full-col">
                <label>Poster Image URL</label>
                <input type="url" id="adm-image" class="form-input" placeholder="https://..." value="https://cdn.myanimelist.net/images/anime/1208/141044l.jpg">
              </div>
              <div class="form-group">
                <label>Signature Move Name</label>
                <input type="text" id="adm-move" class="form-input" placeholder="e.g. Shadow Arise" required>
              </div>
              <div class="form-group">
                <label>3D Move Animation Effect</label>
                <select id="adm-move-type" class="form-input">
                  <option value="kamehameha">Kamehameha Beam</option>
                  <option value="serious_punch">Serious Punch</option>
                  <option value="sakura_blossom">Sakura Blossom Vortex</option>
                  <option value="domain_expansion">Domain Expansion</option>
                  <option value="solar_flare">Solar Flare Heatwave</option>
                  <option value="ice_glaciation">Ice Glaciation</option>
                  <option value="leaf_storm">Crimson Leaf Tempest</option>
                  <option value="sparkle_burst">Celestial Starlight</option>
                </select>
              </div>
              <div class="form-group full-col">
                <label>Tags (comma separated)</label>
                <input type="text" id="adm-tags" class="form-input" placeholder="Action, Overpowered, Sakuga">
              </div>
              <div class="form-group full-col">
                <label>Synopsis Description</label>
                <textarea id="adm-desc" class="form-input" rows="3" required></textarea>
              </div>
              <div class="form-group full-col">
                <label>Iconic Character Quote</label>
                <input type="text" id="adm-quote" class="form-input" placeholder="e.g. ARISE!">
              </div>
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
              <button type="submit" class="auth-submit-btn" style="flex: 1;">SAVE ANIME ENTRY</button>
              <button type="button" class="auth-btn login-btn" id="adm-cancel-btn">CANCEL</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('btn-admin-ml-link').addEventListener('click', () => {
      this.navigateTo('ml-studio');
    });

    this.mainContainer.querySelectorAll('[data-admin-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        soundEngine.playClick();
        this.adminActiveTab = tab.dataset.adminTab;
        this.renderAdmin();
      });
    });

    const searchInput = document.getElementById('admin-anime-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        const filtered = ANIME_DATABASE.filter(a => a.title.toLowerCase().includes(q) || a.studio.toLowerCase().includes(q));
        document.getElementById('admin-anime-tbody').innerHTML = this.renderAdminAnimeRows(filtered);
        this.hookAdminTableActions();
      });
    }

    const openAddModal = () => this.openAdminAnimeModal();
    const btn1 = document.getElementById('btn-admin-add-anime');
    const btn2 = document.getElementById('btn-admin-add-anime-2');
    if (btn1) btn1.addEventListener('click', openAddModal);
    if (btn2) btn2.addEventListener('click', openAddModal);

    this.hookAdminTableActions();
    this.hookAdminUserActions();
  }

  renderAdminAnimeRows(list) {
    return list.slice(0, 40).map(a => {
      const pred = api.getAnimePrediction(a);
      return `
        <tr data-anime-row="${a.id}">
          <td>
            <img 
              src="${getAnimePoster(a)}" 
              alt="${a.title}" 
              class="table-thumb" 
              onerror="this.src='${createStylizedAnimePosterSVG(a)}'"
            >
          </td>
          <td>
            <strong style="color: #ffffff;">${a.title}</strong>
            <div style="font-size: 0.75rem; color: var(--text-dim);">${a.japaneseTitle || ''}</div>
          </td>
          <td><span class="cat-move-pill">${a.category}</span></td>
          <td>${a.studio}</td>
          <td>${a.year}</td>
          <td>⭐ ${a.rating}</td>
          <td><strong style="color: ${pred.badgeColor};">${pred.probability}%</strong></td>
          <td>
            <div class="table-actions">
              <button class="table-btn btn-edit" data-edit-anime="${a.id}">Edit</button>
              <button class="table-btn btn-delete" data-delete-anime="${a.id}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  hookAdminTableActions() {
    this.mainContainer.querySelectorAll('[data-edit-anime]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.editAnime;
        const anime = getAnimeById(id);
        if (anime) this.openAdminAnimeModal(anime);
      });
    });

    this.mainContainer.querySelectorAll('[data-delete-anime]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.deleteAnime;
        if (confirm(`Are you sure you want to delete anime "${id}" from the database?`)) {
          await api.deleteAnime(id);
          soundEngine.playSeriousPunch();
          this.renderAdmin();
        }
      });
    });
  }

  hookAdminUserActions() {
    this.mainContainer.querySelectorAll('[data-toggle-role]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const uid = btn.dataset.toggleRole;
        const curRole = btn.dataset.currentRole;
        const newRole = curRole === 'admin' ? 'user' : 'admin';
        await api.updateUserRole(uid, newRole);
        soundEngine.playSparkleBurst();
        this.renderAdmin();
      });
    });

    this.mainContainer.querySelectorAll('[data-delete-user]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const uid = btn.dataset.deleteUser;
        if (confirm('Are you sure you want to delete this user account?')) {
          await api.deleteUser(uid);
          soundEngine.playClick();
          this.renderAdmin();
        }
      });
    });
  }

  openAdminAnimeModal(anime = null) {
    const modal = document.getElementById('admin-anime-modal');
    const form = document.getElementById('admin-anime-form');
    const title = document.getElementById('admin-modal-title');
    const backdrop = document.getElementById('admin-modal-backdrop');
    const cancel = document.getElementById('adm-cancel-btn');

    const closeModal = () => modal.classList.add('hidden');
    backdrop.onclick = closeModal;
    cancel.onclick = closeModal;

    if (anime) {
      title.textContent = `EDIT ANIME: ${anime.title.toUpperCase()}`;
      document.getElementById('admin-anime-id').value = anime.id;
      document.getElementById('adm-title').value = anime.title;
      document.getElementById('adm-jp').value = anime.japaneseTitle || '';
      document.getElementById('adm-cat').value = anime.category;
      document.getElementById('adm-studio').value = anime.studio;
      document.getElementById('adm-year').value = anime.year;
      document.getElementById('adm-episodes').value = anime.episodes;
      document.getElementById('adm-rating').value = anime.rating;
      document.getElementById('adm-image').value = anime.image;
      document.getElementById('adm-move').value = anime.signatureMove;
      document.getElementById('adm-move-type').value = anime.moveType;
      document.getElementById('adm-tags').value = Array.isArray(anime.tags) ? anime.tags.join(', ') : '';
      document.getElementById('adm-desc').value = anime.description;
      document.getElementById('adm-quote').value = anime.quote || '';
    } else {
      title.textContent = 'ADD NEW ANIME';
      form.reset();
      document.getElementById('admin-anime-id').value = '';
    }

    form.onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('admin-anime-id').value;
      const animeData = {
        title: document.getElementById('adm-title').value,
        japaneseTitle: document.getElementById('adm-jp').value,
        category: document.getElementById('adm-cat').value,
        studio: document.getElementById('adm-studio').value,
        year: parseInt(document.getElementById('adm-year').value, 10),
        episodes: document.getElementById('adm-episodes').value,
        rating: parseFloat(document.getElementById('adm-rating').value),
        image: document.getElementById('adm-image').value,
        signatureMove: document.getElementById('adm-move').value,
        moveType: document.getElementById('adm-move-type').value,
        tags: document.getElementById('adm-tags').value.split(',').map(s => s.trim()),
        description: document.getElementById('adm-desc').value,
        quote: document.getElementById('adm-quote').value
      };

      if (id) {
        await api.updateAnime(id, animeData);
      } else {
        await api.createAnime(animeData);
      }

      soundEngine.playSparkleBurst();
      closeModal();
      this.renderAdmin();
    };

    modal.classList.remove('hidden');
  }

  // ==========================================
  // VIEW: ANIME FULL DETAIL MODAL
  // ==========================================
  openAnimeModal(animeId) {
    const anime = getAnimeById(animeId);
    if (!anime) return;

    soundEngine.playClick();
    const modal = document.getElementById('anime-detail-modal');
    const body = document.getElementById('modal-content-body');
    const isFav = api.isFavorite(anime.id);
    const mlPred = api.getAnimePrediction(anime);
    const cat = CATEGORIES[anime.category] || CATEGORIES['action'];

    body.innerHTML = `
      <div class="modal-anime-hero" style="--modal-accent: ${cat.accentColor};" data-category="${anime.category}">
        <div class="modal-poster-col">
          <img 
            src="${getAnimePoster(anime)}" 
            alt="${anime.title}" 
            class="modal-poster-img"
            onerror="this.src='${createStylizedAnimePosterSVG(anime)}'"
          />
          <div class="modal-poster-meta">
            <div class="meta-item"><span class="m-lbl">STUDIO</span><strong>${anime.studio}</strong></div>
            <div class="meta-item"><span class="m-lbl">YEAR</span><strong>${anime.year}</strong></div>
            <div class="meta-item"><span class="m-lbl">RATING</span><strong>⭐ ${anime.rating} / 10</strong></div>
            <div class="meta-item"><span class="m-lbl">FORMAT</span><strong>${anime.episodes}</strong></div>
          </div>
        </div>

        <div class="modal-info-col">
          <div class="modal-header-block">
            <span class="modal-jp-title">${anime.japaneseTitle || ''}</span>
            <h2 class="modal-title">${anime.title}</h2>
            <div class="modal-tags-row">
              ${(anime.tags || []).map(t => `<span class="modal-pill">${t}</span>`).join('')}
            </div>
          </div>

          <!-- ML Popularity Prediction Insight Box -->
          <div class="modal-ml-box">
            <div class="ml-box-header">
              <span class="ml-tag">🤖 LOGISTIC REGRESSION POPULARITY PREDICTION</span>
              <strong class="ml-prob-val" style="color: ${mlPred.badgeColor};">${mlPred.probability}%</strong>
            </div>
            <div class="ml-meter-bar">
              <div class="ml-meter-fill" style="width: ${mlPred.probability}%;"></div>
            </div>
            <div class="ml-explanation-text">
              <strong>Tier: ${mlPred.tier}</strong> &bull; ${mlPred.explanation}
            </div>
          </div>

          <div class="modal-synopsis-block">
            <h4>SYNOPSIS</h4>
            <p>${anime.description}</p>
          </div>

          <div class="modal-quote-block">
            <span class="quote-mark">“</span>
            <p class="modal-quote-text">${anime.quote}</p>
          </div>

          <!-- Attack Move Banner in Modal -->
          <div class="modal-attack-banner">
            <div class="att-info">
              <span class="att-label">SIGNATURE ATTACK TECHNIQUE:</span>
              <h3 class="att-name">${anime.signatureMove}</h3>
            </div>
            <button class="modal-blast-btn" id="modal-blast-btn">
              <span>💥 FIRE ATTACK NOW!</span>
            </button>
          </div>

          <!-- Extra Actions: Favorites & 3D Arena -->
          <div class="modal-extra-actions">
            <button class="modal-fav-toggle-btn ${isFav ? 'is-favorite' : ''}" id="modal-fav-btn">
              <span>${isFav ? '❤️ In Favorites' : '🤍 Add to Favorites'}</span>
            </button>
            <button class="modal-arena-btn" id="modal-arena-btn">
              <span>🥋 3D Battle Arena</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('modal-blast-btn').addEventListener('click', () => {
      this.closeAnimeModal();
      movesEngine.trigger(anime.moveType, {
        title: anime.signatureMove,
        subtitle: `${anime.title} // ${anime.studio}`,
        quote: anime.quote
      });
    });

    document.getElementById('modal-arena-btn').addEventListener('click', () => {
      this.closeAnimeModal();
      video3DTheater.open(anime.moveType);
    });

    const favBtn = document.getElementById('modal-fav-btn');
    favBtn.addEventListener('click', async () => {
      if (!api.currentUser) {
        window.authUI.showAuthModal('login');
        return;
      }
      const nowFav = await api.toggleFavorite(anime.id);
      soundEngine.playSparkleBurst();
      favBtn.classList.toggle('is-favorite', nowFav);
      favBtn.querySelector('span').textContent = nowFav ? '❤️ In Favorites' : '🤍 Add to Favorites';
    });

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  closeAnimeModal() {
    const modal = document.getElementById('anime-detail-modal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // ==========================================
  // HELPERS: CARDS LIST & HEART HOOKS
  // ==========================================

  renderAnimeCardList(list) {
    return list.map(anime => {
      const isFav = api.isFavorite(anime.id);
      const mlPred = api.getAnimePrediction(anime);

      return `
        <div class="anime-card" data-anime-id="${anime.id}" data-category="${anime.category}">
          <div class="card-poster-wrapper">
            <img 
              src="${getAnimePoster(anime)}" 
              alt="${anime.title}" 
              class="card-poster"
              loading="lazy"
              decoding="async"
              onerror="this.src='${createStylizedAnimePosterSVG(anime)}'"
            />
            <div class="card-rating-badge">⭐ ${anime.rating}</div>
            
            <!-- ML Popularity Badge -->
            <div class="card-ml-badge" style="--badge-color: ${mlPred.badgeColor};" title="${mlPred.explanation}">
              <span class="ml-dot"></span>
              <span>${mlPred.probability}% Hit</span>
            </div>

            <!-- Heart Favorite Button -->
            <button class="card-fav-btn ${isFav ? 'is-favorite' : ''}" data-fav-anime-id="${anime.id}" title="${isFav ? 'Remove Favorite' : 'Save to Favorites'}">
              ♥
            </button>
            
            <div class="card-hover-actions">
              <button class="card-quick-move-btn" data-trigger-card-move="${anime.moveType}" title="Unleash Move">
                <span>💥 ${anime.signatureMove}</span>
              </button>
              <button class="card-quick-detail-btn" data-view-detail="${anime.id}">
                <span>📖 View Lore</span>
              </button>
            </div>
          </div>

          <div class="card-details">
            <div class="card-studio-row">
              <span class="card-studio">${anime.studio}</span>
              <span class="card-episodes">${anime.episodes}</span>
            </div>

            <h3 class="card-title" title="${anime.title}">${anime.title}</h3>
            <div class="card-jp-title">${anime.japaneseTitle || ''}</div>

            <p class="card-desc">${(anime.description || '').slice(0, 115)}...</p>

            <div class="card-tags">
              ${(anime.tags || []).slice(0, 3).map(t => `<span class="anime-tag">${t}</span>`).join('')}
            </div>

            <div class="card-move-footer">
              <span class="move-label">Move:</span>
              <strong class="move-highlight">${anime.signatureMove}</strong>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  hookCardEvents() {
    document.querySelectorAll('[data-anime-id]').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-trigger-card-move]') || e.target.closest('[data-fav-anime-id]')) return;
        const id = card.dataset.animeId;
        this.openAnimeModal(id);
      });
    });

    document.querySelectorAll('[data-trigger-card-move]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const moveType = btn.dataset.triggerCardMove;
        movesEngine.trigger(moveType);
      });
    });

    document.querySelectorAll('[data-fav-anime-id]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!api.currentUser) {
          window.authUI.showAuthModal('login');
          return;
        }

        const aid = btn.dataset.favAnimeId;
        const isFav = await api.toggleFavorite(aid);
        soundEngine.playSparkleBurst();
        btn.classList.toggle('is-favorite', isFav);

        if (this.currentRoute === 'favorites' && !isFav) {
          this.renderFavorites();
        }
      });
    });
  }

  updateHeartButtons() {
    document.querySelectorAll('[data-fav-anime-id]').forEach(btn => {
      const aid = btn.dataset.favAnimeId;
      btn.classList.toggle('is-favorite', api.isFavorite(aid));
    });
  }

  sortAnimeList(list, sortBy) {
    switch (sortBy) {
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating);
      case 'year-desc':
        return list.sort((a, b) => b.year - a.year);
      case 'year-asc':
        return list.sort((a, b) => a.year - b.year);
      case 'title':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return list;
    }
  }

  updateActiveNav(activeId) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.dataset.param === activeId || link.dataset.route === activeId) {
        link.classList.add('active');
      }
    });
  }
}
