/**
 * Anime Nexus - Main Application Bootstrap
 * Resilient initialization sequence:
 * 1. Immediate readyState detection (works whether DOMContentLoaded has fired or not)
 * 2. Protected try/catch per subsystem to guarantee UI and 3D navigation render
 * 3. Router & Saitama HelpBot prioritized for instant user interactivity
 */

import { AppRouter } from './router.js';
import { movesEngine } from './moves.js';
import { soundEngine, soundFXMatrix } from './audio.js';
import { SaitamaAssistant } from './saitama.js';
import { video3DTheater } from './video-theater.js';
import { api } from './api.js';
import { AuthAndPanelsUI } from './auth-ui.js';
import { mangaTransition } from './manga-transition.js';
import { video3DShaderPipeline } from './video-shader-pipeline.js';

async function startApp() {
  console.log('⚡ Starting Anime Nexus Full Stack Platform...');

  // 1. Initialize Dynamic Router FIRST so the user sees the page immediately!
  let router = null;
  try {
    router = new AppRouter();
    router.init('app-content');
    window.appRouter = router;
    console.log('✅ Router & Home View mounted successfully.');
  } catch (err) {
    console.error('[App] Router init error:', err);
  }

  // 2. Initialize Saitama Hero Interactive Assistant (HelpBot)
  try {
    const saitama = new SaitamaAssistant(router);
    saitama.init();
    window.saitamaAssistant = saitama;
    console.log('✅ Saitama HelpBot mounted with golden radiant aura.');
  } catch (err) {
    console.error('[App] Saitama HelpBot init error:', err);
  }

  // 3. Initialize Auth & User/Admin Panels
  try {
    const authUI = new AuthAndPanelsUI(router);
    authUI.init();
    window.authUI = authUI;
    await api.checkAuth();
    console.log('✅ Auth & User Panels ready.');
  } catch (err) {
    console.error('[App] Auth init error:', err);
  }

  // 4. Setup Header Dropdown Menus & Mobile Drawer
  try {
    setupNavDropdowns();
    if (router) setupMobileDrawer(router);
    console.log('✅ Navigation dropdowns initialized.');
  } catch (err) {
    console.error('[App] Nav setup error:', err);
  }

  // 5. Initialize Dynamic Manga Ink Transition WebGL Shaders
  try {
    mangaTransition.init('manga-transition-canvas');
  } catch (err) {
    console.warn('[App] Manga Transition init fallback:', err);
  }

  // 6. Initialize Signature Moves Canvas Overlay
  try {
    movesEngine.init();
  } catch (err) {
    console.warn('[App] Moves engine init fallback:', err);
  }

  // 7. Initialize Video-to-3D Shader Pipeline (Hidden HTML5 videos & 3D textures)
  try {
    video3DShaderPipeline.setupHiddenVideos();
  } catch (err) {
    console.warn('[App] Video-3D pipeline setup fallback:', err);
  }

  // 8. Initialize 3D Video Hologram Arena
  try {
    video3DTheater.init();
  } catch (err) {
    console.warn('[App] 3D Theater init fallback:', err);
  }

  console.log('⚡ Anime Nexus Full Stack Platform Fully Initialized! All Systems Operational.');
}

function setupNavDropdowns() {
  const dropdownTriggers = document.querySelectorAll('.nav-dropdown-trigger');
  dropdownTriggers.forEach(trigger => {
    const parent = trigger.closest('.nav-item-dropdown');
    if (!parent) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = parent.classList.contains('open');
      document.querySelectorAll('.nav-item-dropdown').forEach(d => d.classList.remove('open'));
      if (!isActive) parent.classList.add('open');
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-item-dropdown').forEach(d => d.classList.remove('open'));
  });
}

function setupMobileDrawer(router) {
  const toggle = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const close = document.getElementById('mobile-drawer-close');

  if (!toggle || !drawer) return;

  toggle.addEventListener('click', () => {
    soundEngine.playClick();
    drawer.classList.add('open');
  });

  if (close) {
    close.addEventListener('click', () => {
      drawer.classList.remove('open');
    });
  }

  drawer.querySelectorAll('[data-route]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      drawer.classList.remove('open');
      const route = link.dataset.route;
      const param = link.dataset.param || null;
      if (router) router.navigateTo(route, param);
    });
  });
}

// Resilient DOM ready check
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  // DOM is already parsed/ready, start immediately
  startApp();
}
