/**
 * Anime Nexus - Auth, User Panel, Favorites & Admin Panel UI Controller
 */

import { api } from './api.js';
import { soundEngine } from './audio.js';
import { movesEngine } from './moves.js';
import { CATEGORIES } from './data.js';

export class AuthAndPanelsUI {
  constructor(router) {
    this.router = router;
    this.authModal = null;
    this.currentAuthTab = 'login';
  }

  init() {
    this.injectAuthModal();
    this.setupHeaderUserMenu();
    this.subscribeToApiEvents();
  }

  injectAuthModal() {
    this.authModal = document.createElement('div');
    this.authModal.id = 'auth-modal';
    this.authModal.className = 'auth-modal-overlay hidden';

    this.authModal.innerHTML = `
      <div class="auth-backdrop" id="auth-backdrop"></div>
      <div class="auth-dialog">
        <button class="auth-close-btn" id="auth-close-btn">&times;</button>
        
        <!-- Tab Switcher -->
        <div class="auth-tabs">
          <button class="auth-tab-btn active" id="tab-btn-login">LOGIN</button>
          <button class="auth-tab-btn" id="tab-btn-register">REGISTER</button>
        </div>

        <!-- Quick 1-Click Demo Login Bar -->
        <div class="demo-login-bar">
          <span class="demo-label">1-Click Demo Logins:</span>
          <div class="demo-btns-row">
            <button class="demo-btn admin-demo-btn" id="btn-demo-admin" title="Login as Admin">
              👑 Gojo (Admin)
            </button>
            <button class="demo-btn user-demo-btn" id="btn-demo-user" title="Login as Saitama User">
              🥊 Saitama (User)
            </button>
          </div>
        </div>

        <!-- Notification Banner -->
        <div class="auth-alert hidden" id="auth-alert"></div>

        <!-- LOGIN FORM -->
        <form class="auth-form" id="form-login">
          <div class="form-group">
            <label for="login-email">Email Address</label>
            <input type="email" id="login-email" class="form-input" placeholder="e.g. saitama@hero.com" required>
          </div>
          <div class="form-group">
            <label for="login-password">Password</label>
            <input type="password" id="login-password" class="form-input" placeholder="••••••••" required>
          </div>
          <button type="submit" class="auth-submit-btn" id="login-submit-btn">
            <span>ENTER THE NEXUS</span> &rarr;
          </button>
        </form>

        <!-- REGISTER FORM -->
        <form class="auth-form hidden" id="form-register">
          <div class="form-group">
            <label for="reg-username">Hero / Shinobi Alias</label>
            <input type="text" id="reg-username" class="form-input" placeholder="e.g. GenosTheCyborg" required>
          </div>
          <div class="form-group">
            <label for="reg-email">Email Address</label>
            <input type="email" id="reg-email" class="form-input" placeholder="e.g. genos@hero.com" required>
          </div>
          <div class="form-group">
            <label for="reg-password">Password (min 6 characters)</label>
            <input type="password" id="reg-password" class="form-input" placeholder="••••••••" minlength="6" required>
          </div>
          <div class="form-group">
            <label>Select Your Avatar</label>
            <div class="avatar-picker" id="avatar-picker">
              <span class="avatar-option selected" data-avatar="⚡">⚡</span>
              <span class="avatar-option" data-avatar="🥊">🥊</span>
              <span class="avatar-option" data-avatar="👑">👑</span>
              <span class="avatar-option" data-avatar="🌸">🌸</span>
              <span class="avatar-option" data-avatar="🔮">🔮</span>
              <span class="avatar-option" data-avatar="🔥">🔥</span>
              <span class="avatar-option" data-avatar="❄️">❄️</span>
              <span class="avatar-option" data-avatar="🗡️">🗡️</span>
            </div>
            <input type="hidden" id="selected-avatar-input" value="⚡">
          </div>
          <button type="submit" class="auth-submit-btn">
            <span>JOIN AS NEW HERO</span> &rarr;
          </button>
        </form>

      </div>
    `;

    document.body.appendChild(this.authModal);
    this.setupAuthModalEvents();
  }

  setupAuthModalEvents() {
    const backdrop = document.getElementById('auth-backdrop');
    const closeBtn = document.getElementById('auth-close-btn');
    const tabLogin = document.getElementById('tab-btn-login');
    const tabRegister = document.getElementById('tab-btn-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const demoAdmin = document.getElementById('btn-demo-admin');
    const demoUser = document.getElementById('btn-demo-user');
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const avatarInput = document.getElementById('selected-avatar-input');

    const closeModal = () => this.hideAuthModal();
    backdrop.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);

    // Switch Tabs
    tabLogin.addEventListener('click', () => {
      soundEngine.playClick();
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      formLogin.classList.remove('hidden');
      formRegister.classList.add('hidden');
      this.clearAlert();
    });

    tabRegister.addEventListener('click', () => {
      soundEngine.playClick();
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      formRegister.classList.remove('hidden');
      formLogin.classList.add('hidden');
      this.clearAlert();
    });

    // Avatar Selection
    avatarOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        avatarOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        avatarInput.value = opt.dataset.avatar;
      });
    });

    // Demo Admin 1-Click
    demoAdmin.addEventListener('click', async () => {
      soundEngine.playClick();
      try {
        await api.login('admin@animenexus.io', 'admin123');
        this.showAlert('Welcome back, Gojo Admin! Special Grade clearance granted.', 'success');
        setTimeout(() => closeModal(), 600);
      } catch (err) {
        this.showAlert(err.message, 'error');
      }
    });

    // Demo User 1-Click
    demoUser.addEventListener('click', async () => {
      soundEngine.playClick();
      try {
        await api.login('saitama@hero.com', 'punch123');
        this.showAlert('Yo Saitama! Ready for 100 pushups & anime?', 'success');
        setTimeout(() => closeModal(), 600);
      } catch (err) {
        this.showAlert(err.message, 'error');
      }
    });

    // Handle Login Submit
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;
      try {
        await api.login(email, pass);
        this.showAlert('Login successful! Welcome back!', 'success');
        setTimeout(() => closeModal(), 600);
      } catch (err) {
        this.showAlert(err.message, 'error');
      }
    });

    // Handle Register Submit
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('reg-username').value;
      const email = document.getElementById('reg-email').value;
      const pass = document.getElementById('reg-password').value;
      const avatar = avatarInput.value;
      try {
        await api.register(username, email, pass, avatar);
        this.showAlert('Registration complete! Welcome to Anime Nexus!', 'success');
        setTimeout(() => closeModal(), 600);
      } catch (err) {
        this.showAlert(err.message, 'error');
      }
    });
  }

  showAuthModal(tab = 'login') {
    if (!this.authModal) this.injectAuthModal();
    this.authModal.classList.remove('hidden');
    if (tab === 'login') {
      document.getElementById('tab-btn-login').click();
    } else {
      document.getElementById('tab-btn-register').click();
    }
  }

  hideAuthModal() {
    if (this.authModal) this.authModal.classList.add('hidden');
  }

  showAlert(msg, type = 'error') {
    const alert = document.getElementById('auth-alert');
    alert.textContent = msg;
    alert.className = `auth-alert ${type}`;
    alert.classList.remove('hidden');
  }

  clearAlert() {
    const alert = document.getElementById('auth-alert');
    alert.classList.add('hidden');
  }

  // ==================== HEADER USER MENU ====================

  setupHeaderUserMenu() {
    const userSlot = document.getElementById('header-user-slot');
    if (!userSlot) return;

    this.renderHeaderUserSlot();
  }

  renderHeaderUserSlot() {
    const userSlot = document.getElementById('header-user-slot');
    if (!userSlot) return;

    const user = api.currentUser;
    const favCount = api.favoriteIds.size;

    if (!user) {
      userSlot.innerHTML = `
        <div class="guest-auth-actions">
          <a href="login.html" class="auth-btn login-btn" id="btn-open-login">Sign In</a>
          <a href="register.html" class="auth-btn register-btn" id="btn-open-register">Register</a>
        </div>
      `;
    } else {
      userSlot.innerHTML = `
        <div class="user-profile-widget">
          <!-- Favorites Pill Shortcut -->
          <button class="fav-badge-btn" id="btn-nav-favorites" title="My Favorites">
            <span class="fav-icon">❤️</span>
            <span class="fav-counter">${favCount}</span>
          </button>

          <!-- Avatar & Dropdown -->
          <div class="user-dropdown-wrapper" id="user-dropdown-wrapper">
            <button class="user-avatar-btn" id="btn-user-avatar">
              <span class="avatar-icon">${user.avatar || '⚡'}</span>
              <span class="avatar-name">${user.username}</span>
              ${user.role === 'admin' ? '<span class="admin-shield">ADMIN</span>' : ''}
              <span class="dropdown-caret">▼</span>
            </button>

            <div class="user-dropdown-menu" id="user-dropdown-menu">
              <div class="user-menu-header">
                <strong>${user.username}</strong>
                <small>${user.email}</small>
                <span class="hero-rank-tag">${user.heroRank || 'Hero'}</span>
              </div>
              <div class="user-menu-divider"></div>
              <a href="#favorites" class="user-menu-link" id="link-menu-favorites">
                <span>❤️ My Favorites (${favCount})</span>
              </a>
              <a href="#profile" class="user-menu-link" id="link-menu-profile">
                <span>👤 Hero Profile</span>
              </a>
              ${user.role === 'admin' ? `
                <a href="#admin" class="user-menu-link admin-link" id="link-menu-admin">
                  <span>👑 Admin Command Center</span>
                </a>
              ` : ''}
              <div class="user-menu-divider"></div>
              <button class="user-menu-logout" id="btn-menu-logout">
                <span>🚪 Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      `;

      // Toggle user dropdown
      const avatarBtn = document.getElementById('btn-user-avatar');
      const menu = document.getElementById('user-dropdown-menu');
      avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('open');
      });

      document.addEventListener('click', () => {
        if (menu) menu.classList.remove('open');
      });

      // Navigation links
      document.getElementById('btn-nav-favorites').addEventListener('click', () => {
        soundEngine.playClick();
        this.router.navigateTo('favorites');
      });

      document.getElementById('link-menu-favorites').addEventListener('click', (e) => {
        e.preventDefault();
        soundEngine.playClick();
        if (menu) menu.classList.remove('open');
        this.router.navigateTo('favorites');
      });

      document.getElementById('link-menu-profile').addEventListener('click', (e) => {
        e.preventDefault();
        soundEngine.playClick();
        if (menu) menu.classList.remove('open');
        this.router.navigateTo('profile');
      });

      const adminLink = document.getElementById('link-menu-admin');
      if (adminLink) {
        adminLink.addEventListener('click', (e) => {
          e.preventDefault();
          soundEngine.playClick();
          if (menu) menu.classList.remove('open');
          this.router.navigateTo('admin');
        });
      }

      document.getElementById('btn-menu-logout').addEventListener('click', () => {
        soundEngine.playClick();
        api.logout();
        this.router.navigateTo('home');
      });
    }
  }

  subscribeToApiEvents() {
    api.subscribe((event) => {
      if (event === 'auth:change' || event === 'favorites:change') {
        this.renderHeaderUserSlot();
      }
    });
  }
}
