/**
 * Anime Nexus - Saitama Interactive Hero Assistant & HelpBot
 * Matches Reference Screenshot UI:
 * - Floating circular Saitama avatar badge with radiant golden-yellow aura glow
 * - Pure white high-contrast speech card with bold headline
 * - Action chips: 🔥 HYPE ACTION, 🌸 CHILL SLICE OF LIFE, 🥊 ONE PUNCH PICK
 * - Comprehensive AI Assistant handling ANY user need, query, or interaction
 * - Integrated Speech-to-Text Voice Recognition for instant voice interaction
 */

import { ANIME_DATABASE, CATEGORIES, getAnimeByCategory, searchAnime } from './data.js';
import { movesEngine } from './moves.js';
import { soundEngine, soundFXMatrix } from './audio.js';
import { api } from './api.js';
import { getAnimePoster, createStylizedAnimePosterSVG } from './poster-fallback.js';
import { voiceRecognition } from './speech.js';

export class SaitamaAssistant {
  constructor(router) {
    this.router = router;
    this.container = null;
    this.cardEl = null;
    this.headerEl = null;
    this.chatDrawerEl = null;
    this.chatStreamEl = null;
    this.inputEl = null;
    this.micBtn = null;
    this.isChatOpen = false;
    this.isCollapsed = false;

    // Default hero picks
    this.defaultPicks = [
      {
        type: 'SERIOUS PUNCH PICK',
        animeTitle: 'Vinland Saga',
        realm: 'Winter Season',
        reason: 'S-Tier Viking epic with a 98.4% Hit Probability via Logistic Regression!'
      },
      {
        type: 'SERIOUS PUNCH PICK',
        animeTitle: 'Attack on Titan',
        realm: 'Action & Battle',
        reason: 'Cosmic scale narrative warfare with maximum blockbuster resonance!'
      },
      {
        type: 'SERIOUS PUNCH PICK',
        animeTitle: 'Steins;Gate',
        realm: 'Mystery & Thriller',
        reason: 'Calculated 97.9% popularity probability with elite studio prestige!'
      }
    ];

    this.currentPickIndex = 0;
  }

  init() {
    this.container = document.createElement('div');
    this.container.id = 'saitama-assistant';
    this.container.className = 'saitama-container';

    const pick = this.defaultPicks[this.currentPickIndex];

    this.container.innerHTML = `
      <!-- ==================== SPEECH CARD (Matches Screenshot) ==================== -->
      <div class="saitama-card" id="saitama-card" role="region" aria-label="Saitama Hero HelpBot">
        <!-- Close / Minimize Button -->
        <button class="saitama-card-close" id="saitama-card-close" title="Minimize Saitama Card">&times;</button>

        <!-- Main Headline Speech (Matches Reference Text) -->
        <div class="saitama-speech-header" id="saitama-speech-header">
          ${pick.type}: "${pick.animeTitle}" from the ${pick.realm} realm!
        </div>

        <!-- Action Chips Stack (Screenshot Exact Styles) -->
        <div class="saitama-chips-stack">
          <button class="saitama-chip chip-action" id="chip-hype-action" title="Hype Action Recommendation">
            <span class="chip-emoji">🔥</span>
            <span>HYPE ACTION</span>
          </button>
          
          <button class="saitama-chip chip-sol" id="chip-chill-sol" title="Relaxing Slice of Life Recommendation">
            <span class="chip-emoji">🌸</span>
            <span>CHILL SLICE OF LIFE</span>
          </button>

          <button class="saitama-chip chip-punch" id="chip-one-punch" title="Saitama's One Punch ML Pick">
            <span class="chip-emoji">🥊</span>
            <span>ONE PUNCH PICK</span>
          </button>
        </div>

        <!-- Chat Drawer Toggle -->
        <button class="saitama-toggle-chat-btn" id="saitama-toggle-chat-btn">
          <span>💬 Ask Saitama Anything (Voice / Text)</span>
          <span id="saitama-toggle-arrow">▾</span>
        </button>

        <!-- Conversational Chat Drawer -->
        <div class="saitama-chat-drawer hidden" id="saitama-chat-drawer">
          <div class="saitama-chat-stream" id="saitama-chat-stream">
            <div class="saitama-msg bot">
              Yo! I'm Saitama, Hero for Fun. Ask me about anime recommendations, the Logistic Regression ML model, signature moves, or click the mic (🎙️) to speak!
            </div>
          </div>

          <!-- Input Bar with Speech-to-Text Mic -->
          <div class="saitama-input-bar">
            <input 
              type="text" 
              id="saitama-chat-input" 
              class="saitama-input" 
              placeholder="Ask Saitama anything (or click 🎙️)..." 
              autocomplete="off"
            />
            <button 
              type="button" 
              id="saitama-mic-btn" 
              class="saitama-mic-btn" 
              title="Speak to Saitama (Speech-to-Text)" 
              aria-label="Voice Input"
            >
              🎙️
            </button>
            <button 
              type="button" 
              id="saitama-send-btn" 
              class="saitama-send-btn" 
              title="Send Message" 
              aria-label="Send"
            >
              ➤
            </button>
          </div>

          <!-- Quick Suggestion Pills -->
          <div class="saitama-quick-suggs">
            <button class="saitama-sugg-pill" data-sugg="Explain Logistic Regression model">🤖 Explain ML</button>
            <button class="saitama-sugg-pill" data-sugg="Trigger Serious Punch!">🥊 Serious Punch</button>
            <button class="saitama-sugg-pill" data-sugg="Recommend a top mystery anime">🔮 Mystery Pick</button>
            <button class="saitama-sugg-pill" data-sugg="Take me to Winter Season">❄️ Winter Season</button>
          </div>
        </div>
      </div>

      <!-- ==================== CIRCULAR AVATAR BADGE WITH RADIANT AURA ==================== -->
      <button class="saitama-badge-btn" id="saitama-badge-btn" title="Toggle Saitama Hero HelpBot" aria-label="Saitama Assistant">
        <div class="saitama-aura-wrapper">
          <svg class="saitama-svg-avatar" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id="saitama-avatar-clip">
                <circle cx="50" cy="50" r="46" />
              </clipPath>
            </defs>

            <!-- Outer Circle Background -->
            <circle cx="50" cy="50" r="46" fill="#facc15" />

            <!-- Content Clipped Inside Circular Badge -->
            <g clip-path="url(#saitama-avatar-clip)">
              <!-- Red Hero Suit Shoulders -->
              <path d="M 8 94 C 15 74, 34 71, 42 73 L 42 100 L 8 100 Z" fill="#dc2626" stroke="#000000" stroke-width="2.8" />
              <path d="M 92 94 C 85 74, 66 71, 58 73 L 58 100 L 92 100 Z" fill="#dc2626" stroke="#000000" stroke-width="2.8" />

              <!-- Yellow Hero Suit Torso -->
              <path d="M 42 73 L 58 73 L 58 100 L 42 100 Z" fill="#facc15" />
              <line x1="50" y1="77" x2="50" y2="100" stroke="#000000" stroke-width="2.2" />

              <!-- White Cape Collar with Two Clasps (Matches Screenshot) -->
              <path d="M 30 73 C 30 68, 70 68, 70 73 C 70 80, 30 80, 30 73 Z" fill="#ffffff" stroke="#000000" stroke-width="2.6" />
              <circle cx="38" cy="74" r="3.2" fill="#000000" />
              <circle cx="62" cy="74" r="3.2" fill="#000000" />

              <!-- Saitama Egg-shaped Bald Head -->
              <path d="M 50 18 C 36 18, 29 29, 29 43 C 29 59, 38 69, 50 69 C 62 69, 71 59, 71 43 C 71 29, 64 18, 50 18 Z" fill="#fde3c8" stroke="#000000" stroke-width="3.2" />

              <!-- White Gleam on Bald Head -->
              <ellipse cx="39" cy="25" rx="4" ry="2.8" transform="rotate(-30 39 25)" fill="#ffffff" />

              <!-- Eyebrows (Subtle simple lines) -->
              <line x1="38" y1="38" x2="44" y2="39" stroke="#000000" stroke-width="2.4" stroke-linecap="round" />
              <line x1="62" y1="38" x2="56" y2="39" stroke="#000000" stroke-width="2.4" stroke-linecap="round" />

              <!-- Eyes (Simple black ovals, deadpan hero expression) -->
              <ellipse cx="41.5" cy="45" rx="2.4" ry="2.8" fill="#000000" />
              <ellipse cx="58.5" cy="45" rx="2.4" ry="2.8" fill="#000000" />

              <!-- Nose (Subtle arc) -->
              <path d="M 50 50.5 L 48 53" stroke="#000000" stroke-width="2" stroke-linecap="round" />

              <!-- Mouth (Calm gentle smile curve) -->
              <path d="M 45 58 Q 50 61 55 58" fill="none" stroke="#000000" stroke-width="2.4" stroke-linecap="round" />
            </g>

            <!-- Outer Solid Black Border Ring -->
            <circle cx="50" cy="50" r="46" fill="none" stroke="#000000" stroke-width="3.6" />
          </svg>

          <!-- Status Indicator Pill -->
          <div class="saitama-help-pill">HELP</div>
        </div>
      </button>
    `;

    document.body.appendChild(this.container);

    this.cardEl = document.getElementById('saitama-card');
    this.headerEl = document.getElementById('saitama-speech-header');
    this.chatDrawerEl = document.getElementById('saitama-chat-drawer');
    this.chatStreamEl = document.getElementById('saitama-chat-stream');
    this.inputEl = document.getElementById('saitama-chat-input');
    this.micBtn = document.getElementById('saitama-mic-btn');

    this.setupEventListeners();
  }

  setupEventListeners() {
    const badgeBtn = document.getElementById('saitama-badge-btn');
    const closeBtn = document.getElementById('saitama-card-close');
    const toggleChatBtn = document.getElementById('saitama-toggle-chat-btn');
    const sendBtn = document.getElementById('saitama-send-btn');

    const chipHype = document.getElementById('chip-hype-action');
    const chipChill = document.getElementById('chip-chill-sol');
    const chipPunch = document.getElementById('chip-one-punch');

    // 1. Avatar Click -> Toggle Card Visibility
    badgeBtn.addEventListener('click', () => {
      soundEngine.playClick();
      this.toggleCard();
    });

    // 2. Close Card
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hideCard();
    });

    // 3. Chip 1: HYPE ACTION
    chipHype.addEventListener('click', () => {
      soundEngine.playClick();
      this.handleHypeAction();
    });

    // 4. Chip 2: CHILL SLICE OF LIFE
    chipChill.addEventListener('click', () => {
      soundEngine.playClick();
      this.handleChillSol();
    });

    // 5. Chip 3: ONE PUNCH PICK
    chipPunch.addEventListener('click', () => {
      soundEngine.playClick();
      this.handleOnePunchPick();
    });

    // 6. Toggle Chat Drawer
    toggleChatBtn.addEventListener('click', () => {
      soundEngine.playClick();
      this.toggleChatDrawer();
    });

    // 7. Send Chat Message
    sendBtn.addEventListener('click', () => {
      this.submitUserMessage();
    });

    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.submitUserMessage();
      }
    });

    // 8. Speech-to-Text Microphone Button in HelpBot
    if (this.micBtn) {
      this.micBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleVoiceRecognition();
      });
    }

    // 9. Quick Suggestion Pills
    document.querySelectorAll('.saitama-sugg-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const query = pill.dataset.sugg;
        if (query) {
          this.inputEl.value = query;
          this.submitUserMessage();
        }
      });
    });
  }

  toggleCard() {
    if (this.isCollapsed) {
      this.showCard();
    } else {
      this.hideCard();
    }
  }

  showCard() {
    this.isCollapsed = false;
    this.cardEl.classList.remove('collapsed');
  }

  hideCard() {
    this.isCollapsed = true;
    this.cardEl.classList.add('collapsed');
  }

  toggleChatDrawer() {
    this.isChatOpen = !this.isChatOpen;
    const arrow = document.getElementById('saitama-toggle-arrow');
    if (this.isChatOpen) {
      this.chatDrawerEl.classList.remove('hidden');
      if (arrow) arrow.textContent = '▴';
      this.inputEl.focus();
    } else {
      this.chatDrawerEl.classList.add('hidden');
      if (arrow) arrow.textContent = '▾';
    }
  }

  openChatDrawer() {
    if (!this.isChatOpen) {
      this.toggleChatDrawer();
    }
  }

  // =========================================================================
  // Speech-to-Text Voice Recognition in HelpBot
  // =========================================================================

  toggleVoiceRecognition() {
    if (this.micBtn.classList.contains('listening')) {
      voiceRecognition.stop();
      this.micBtn.classList.remove('listening');
      this.inputEl.classList.remove('voice-active');
    } else {
      this.openChatDrawer();
      this.micBtn.classList.add('listening');
      soundFXMatrix.playClick();

      voiceRecognition.startHelpBotListening(this.inputEl, (transcript) => {
        this.micBtn.classList.remove('listening');
        this.inputEl.classList.remove('voice-active');
        if (transcript && transcript.trim()) {
          this.submitUserMessage(transcript);
        }
      });
    }
  }

  // =========================================================================
  // Chip Click Handlers
  // =========================================================================

  handleHypeAction() {
    const actionList = getAnimeByCategory('action').concat(getAnimeByCategory('shounen'));
    const pick = actionList[Math.floor(Math.random() * actionList.length)];
    const pred = api.getAnimePrediction(pick);

    this.headerEl.innerHTML = `🔥 HYPE PICK: "${pick.title}" (${pick.studio})! Rated ⭐ ${pick.rating}!`;
    this.appendBotMessage(`
      🔥 <strong>HYPE BATTLE RECOMMENDATION!</strong><br>
      You need high adrenaline? Watch <strong>"${pick.title}"</strong>! Studio ${pick.studio} animated some of the most ridiculous fight choreography in history. Our ML model gives it a <strong>${pred.probability}%</strong> hit probability!
    `, pick);

    soundFXMatrix.playKamehameha();
  }

  handleChillSol() {
    const solList = getAnimeByCategory('slice-of-life').concat(getAnimeByCategory('spring'));
    const pick = solList[Math.floor(Math.random() * solList.length)];
    const pred = api.getAnimePrediction(pick);

    this.headerEl.innerHTML = `🌸 IYASHIKEI PICK: "${pick.title}" from ${pick.studio}!`;
    this.appendBotMessage(`
      🌸 <strong>HEALING SLICE OF LIFE!</strong><br>
      After fighting cosmic threats, I sit down with <strong>"${pick.title}"</strong>. It's calming, warm, and guaranteed to heal your weary soul. ML prediction: <strong>${pred.probability}%</strong> satisfaction!
    `, pick);

    soundFXMatrix.playSakuraVortex();
  }

  handleOnePunchPick() {
    // Pick the highest ML predicted anime
    const sorted = [...ANIME_DATABASE].sort((a, b) => {
      const predA = api.getAnimePrediction(a).probability;
      const predB = api.getAnimePrediction(b).probability;
      return predB - predA;
    });

    const topAnime = sorted[Math.floor(Math.random() * 5)];
    const pred = api.getAnimePrediction(topAnime);

    this.headerEl.innerHTML = `🥊 SERIOUS PUNCH PICK: "${topAnime.title}" from the ${topAnime.category} realm!`;
    this.appendBotMessage(`
      🥊 <strong>ONE PUNCH SERIOUS PICK!</strong><br>
      My hero intuition and our AI Logistic Regression engine have evaluated 130 anime. <strong>"${topAnime.title}"</strong> crushed the charts with a <strong>${pred.probability}%</strong> blockbuster probability!
      <br><br>
      <button class="saitama-sugg-pill" id="bot-trigger-punch" style="background:#ef4444; color:#fff; font-weight:bold;">
        💥 Unleash Serious Punch on Screen!
      </button>
    `, topAnime);

    const punchBtn = document.getElementById('bot-trigger-punch');
    if (punchBtn) {
      punchBtn.addEventListener('click', () => {
        movesEngine.trigger('serious_punch', {
          title: 'SERIOUS PUNCH!',
          subtitle: 'DEATH BLOW // 100% POWER',
          quote: 'I became a hero because I wanted to. SERIOUS PUNCH!'
        });
      });
    }

    soundFXMatrix.playSeriousPunch();
  }

  // =========================================================================
  // Chat Messaging & Universal Query Intent Matcher
  // =========================================================================

  submitUserMessage(explicitText = null) {
    const text = (explicitText || this.inputEl.value || '').trim();
    if (!text) return;

    this.appendUserMessage(text);
    this.inputEl.value = '';

    soundEngine.playClick();
    this.openChatDrawer();

    // Small delay to simulate thinking & responding
    setTimeout(() => {
      this.handleUserQuery(text);
    }, 280);
  }

  handleUserQuery(rawQuery) {
    const q = rawQuery.toLowerCase();

    // 1. Attack Move Triggers
    if (q.includes('punch') || q.includes('serious punch')) {
      this.appendBotMessage("🥊 SERIOUS SERIES: SERIOUS PUNCH! Watch the screen shatter!");
      movesEngine.trigger('serious_punch');
      return;
    }
    if (q.includes('kamehameha') || q.includes('goku') || q.includes('dragon ball')) {
      this.appendBotMessage("⚡ KA-ME-HA-ME-HA! Channeling maximum Ki beam!");
      movesEngine.trigger('kamehameha');
      return;
    }
    if (q.includes('domain') || q.includes('expansion') || q.includes('gojo')) {
      this.appendBotMessage("🔮 RYŌIKI TENKAI! Domain Expansion: Infinite Void active!");
      movesEngine.trigger('domain_expansion');
      return;
    }
    if (q.includes('sakura') || q.includes('blossom') || q.includes('vortex')) {
      this.appendBotMessage("🌸 Cherry Blossom Vortex blooming across the realm!");
      movesEngine.trigger('sakura_blossom');
      return;
    }
    if (q.includes('ice') || q.includes('frost') || q.includes('glaciation')) {
      this.appendBotMessage("❄️ Sub-zero Ice Glaciation freezing the canvas!");
      movesEngine.trigger('ice_glaciation');
      return;
    }
    if (q.includes('solar') || q.includes('sun') || q.includes('flare')) {
      this.appendBotMessage("🔥 Taiyoken! Solar Flare lighting up the screen!");
      movesEngine.trigger('solar_flare');
      return;
    }

    // 2. Machine Learning & Logistic Regression Queries
    if (q.includes('logistic') || q.includes('regression') || q.includes('ml') || q.includes('sigmoid') || q.includes('model') || q.includes('algorithm')) {
      this.appendBotMessage(`
        🤖 <strong>Logistic Regression Popularity Engine:</strong><br>
        Our backend trains a binary classification model where probability = <strong>1 / (1 + e<sup>-z</sup>)</strong>.<br>
        • Rating Weight: <strong>+0.85</strong><br>
        • Studio Prestige: <strong>+0.58</strong> (Ufotable, MAPPA, Madhouse lead)<br>
        • Members & Favorites: <strong>+0.72 & +0.65</strong><br>
        Want to inspect the interactive curve and feature weights? Click below!
        <br><br>
        <button class="saitama-sugg-pill" id="chat-open-ml" style="background:#38bdf8; color:#0f172a; font-weight:bold;">
          🚀 Open ML Popularity Studio
        </button>
      `);

      const openMl = document.getElementById('chat-open-ml');
      if (openMl && this.router) {
        openMl.addEventListener('click', () => this.router.navigateTo('ml-studio'));
      }
      return;
    }

    // 3. Navigation queries
    if (q.includes('favorite') || q.includes('wishlist') || q.includes('saved')) {
      this.appendBotMessage("❤️ Taking you to your Favorites Vault!");
      if (this.router) this.router.navigateTo('favorites');
      return;
    }
    if (q.includes('admin') || q.includes('dashboard') || q.includes('crud')) {
      this.appendBotMessage("👑 Opening the Master Admin Command Panel!");
      if (this.router) this.router.navigateTo('admin');
      return;
    }
    if (q.includes('cube') || q.includes('3d') || q.includes('gyroscope')) {
      this.appendBotMessage("🎲 Opening 3D Cube Paging! Circle the gyroscope ring to navigate categories!");
      if (this.router) this.router.navigateTo('home');
      return;
    }

    // 4. Genre recommendations
    if (q.includes('mystery') || q.includes('thriller') || q.includes('detective') || q.includes('mind')) {
      const picks = getAnimeByCategory('mystery');
      const pick = picks[Math.floor(Math.random() * picks.length)];
      this.appendBotMessage(`🔮 For intense mind games and dark mysteries, nothing tops <strong>"${pick.title}"</strong>!`, pick);
      return;
    }
    if (q.includes('romance') || q.includes('love') || q.includes('couple') || q.includes('romantic')) {
      const picks = getAnimeByCategory('romance');
      const pick = picks[Math.floor(Math.random() * picks.length)];
      this.appendBotMessage(`💖 Looking for romance? <strong>"${pick.title}"</strong> will give you butterflies (and tears)!`, pick);
      return;
    }
    if (q.includes('action') || q.includes('fight') || q.includes('battle') || q.includes('shounen')) {
      const picks = getAnimeByCategory('action').concat(getAnimeByCategory('shounen'));
      const pick = picks[Math.floor(Math.random() * picks.length)];
      this.appendBotMessage(`⚡ For pure high-voltage battles, check out <strong>"${pick.title}"</strong>!`, pick);
      return;
    }
    if (q.includes('slice of life') || q.includes('relax') || q.includes('calm') || q.includes('chill')) {
      const picks = getAnimeByCategory('slice-of-life');
      const pick = picks[Math.floor(Math.random() * picks.length)];
      this.appendBotMessage(`🌸 Soothing slice of life: <strong>"${pick.title}"</strong> is pure therapeutic peace.`, pick);
      return;
    }

    // 5. Seasons recommendations
    if (q.includes('winter')) {
      const picks = getAnimeByCategory('winter');
      const pick = picks[Math.floor(Math.random() * picks.length)];
      this.appendBotMessage(`❄️ Winter Season masterpiece: <strong>"${pick.title}"</strong>! Cold atmosphere, fiery resolve.`, pick);
      return;
    }
    if (q.includes('spring')) {
      const picks = getAnimeByCategory('spring');
      const pick = picks[Math.floor(Math.random() * picks.length)];
      this.appendBotMessage(`🌱 Spring Season selection: <strong>"${pick.title}"</strong>! Blossoms and new beginnings.`, pick);
      return;
    }
    if (q.includes('summer')) {
      const picks = getAnimeByCategory('summer');
      const pick = picks[Math.floor(Math.random() * picks.length)];
      this.appendBotMessage(`☀️ Summer Season fire: <strong>"${pick.title}"</strong>! Unstoppable summer heat.`, pick);
      return;
    }
    if (q.includes('autumn') || q.includes('fall')) {
      const picks = getAnimeByCategory('autumn');
      const pick = picks[Math.floor(Math.random() * picks.length)];
      this.appendBotMessage(`🍂 Autumn Season gem: <strong>"${pick.title}"</strong>! Rich colors and deep plotlines.`, pick);
      return;
    }

    // 6. Direct Anime Search Matching
    const searchMatches = searchAnime(rawQuery);
    if (searchMatches && searchMatches.length > 0) {
      const best = searchMatches[0];
      const pred = api.getAnimePrediction(best);
      this.appendBotMessage(`
        Found exact match: <strong>"${best.title}"</strong> (${best.studio})!<br>
        ⭐ Rating: <strong>${best.rating}</strong> | 🤖 ML Popularity: <strong>${pred.probability}%</strong><br>
        Signature Move: <em>${best.signatureMove}</em>
      `, best);
      return;
    }

    // 7. Generic humor & hero assistance fallback
    const randomAnime = ANIME_DATABASE[Math.floor(Math.random() * ANIME_DATABASE.length)];
    const pred = api.getAnimePrediction(randomAnime);

    this.appendBotMessage(`
      Got it! As a hero for fun, I recommend <strong>"${randomAnime.title}"</strong> (${randomAnime.category}).<br>
      Our Logistic Regression model puts its hit probability at <strong>${pred.probability}%</strong>. You can ask me for genres, seasons, signature moves, or hit 🎙️ to talk!
    `, randomAnime);
  }

  appendUserMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'saitama-msg user';
    msg.textContent = text;
    this.chatStreamEl.appendChild(msg);
    this.chatStreamEl.scrollTop = this.chatStreamEl.scrollHeight;
  }

  appendBotMessage(htmlText, animeCard = null) {
    const msg = document.createElement('div');
    msg.className = 'saitama-msg bot';
    msg.innerHTML = htmlText;

    if (animeCard) {
      const embed = document.createElement('div');
      embed.className = 'saitama-anime-embed';
      embed.innerHTML = `
        <img 
          src="${getAnimePoster(animeCard)}" 
          alt="${animeCard.title}" 
          class="saitama-embed-poster"
          onerror="this.src='${createStylizedAnimePosterSVG(animeCard)}'"
        />
        <div class="saitama-embed-details">
          <strong class="saitama-embed-title">${animeCard.title}</strong>
          <div class="saitama-embed-sub">${animeCard.studio} &bull; ⭐ ${animeCard.rating}</div>
        </div>
        <button class="saitama-embed-btn" data-anime-id="${animeCard.id}">VIEW</button>
      `;

      const viewBtn = embed.querySelector('.saitama-embed-btn');
      if (viewBtn) {
        viewBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          soundEngine.playClick();
          if (this.router && this.router.openAnimeModal) {
            this.router.openAnimeModal(animeCard.id);
          }
        });
      }

      msg.appendChild(embed);
    }

    this.chatStreamEl.appendChild(msg);
    this.chatStreamEl.scrollTop = this.chatStreamEl.scrollHeight;
  }
}
