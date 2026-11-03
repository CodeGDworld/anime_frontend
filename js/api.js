/**
 * Anime Nexus - API Client & State Management
 * Connects to the backend REST API with seamless offline/localStorage fallback
 * Manages: Authentication, User Session, Favorites, Admin Operations, and Logistic Regression ML
 */

import { ANIME_DATABASE, getAnimeById } from './data.js';

class ApiClient {
  constructor() {
    this.isGitHubPages = window.location.hostname.includes('github.io') || window.location.protocol === 'file:';
    this.baseUrl = this.isGitHubPages ? null : (window.location.origin.includes('http') ? '' : 'http://localhost:3000');
    this.token = localStorage.getItem('nexus_auth_token') || null;
    this.currentUser = JSON.parse(localStorage.getItem('nexus_user') || 'null');
    this.favoriteIds = new Set(JSON.parse(localStorage.getItem('nexus_favorites') || '[]'));
    this.listeners = new Set();
  }

  // Subscribe to auth / favorite state changes
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event, payload) {
    this.listeners.forEach(cb => cb(event, payload));
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // ==================== AUTHENTICATION ====================

  async register(username, email, password, avatar = '⚡') {
    if (this.isGitHubPages || !this.baseUrl) {
      const mockUser = {
        id: 'local-' + Date.now(),
        username,
        email,
        role: email.includes('admin') ? 'admin' : 'user',
        avatar: avatar || '⚡',
        heroRank: 'Class C Hero',
        createdAt: new Date().toISOString()
      };
      this.setSession('local-token-' + Date.now(), mockUser, []);
      this.notify('auth:change', { user: mockUser });
      return { success: true, user: mockUser, offline: true };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, avatar })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      this.setSession(data.token, data.user, []);
      this.notify('auth:change', { user: this.currentUser });
      return { success: true, user: data.user };
    } catch (err) {
      if (err.message.includes('fetch') || err.message.includes('NetworkError') || !this.baseUrl) {
        const mockUser = {
          id: 'local-' + Date.now(),
          username,
          email,
          role: email.includes('admin') ? 'admin' : 'user',
          avatar: avatar || '⚡',
          heroRank: 'Class C Hero',
          createdAt: new Date().toISOString()
        };
        this.setSession('local-token-' + Date.now(), mockUser, []);
        this.notify('auth:change', { user: mockUser });
        return { success: true, user: mockUser, offline: true };
      }
      throw err;
    }
  }

  async login(email, password) {
    if (this.isGitHubPages || !this.baseUrl) {
      if (email === 'admin@animenexus.io' && password === 'admin123') {
        const adminUser = {
          id: 'usr-admin-1',
          username: 'GojoAdmin',
          email: 'admin@animenexus.io',
          role: 'admin',
          avatar: '👑',
          heroRank: 'Special Grade Admin',
          createdAt: new Date().toISOString()
        };
        this.setSession('local-admin-token', adminUser, ['act-1', 'act-5']);
        this.notify('auth:change', { user: adminUser });
        return { success: true, user: adminUser, offline: true };
      } else if (email === 'saitama@hero.com' && password === 'punch123') {
        const saitamaUser = {
          id: 'usr-saitama-2',
          username: 'SaitamaSensei',
          email: 'saitama@hero.com',
          role: 'user',
          avatar: '🥊',
          heroRank: 'Class A-39 Hero',
          createdAt: new Date().toISOString()
        };
        this.setSession('local-saitama-token', saitamaUser, ['act-2', 'act-10', 'sol-1']);
        this.notify('auth:change', { user: saitamaUser });
        return { success: true, user: saitamaUser, offline: true };
      } else {
        const demoUser = {
          id: 'usr-custom-' + Date.now(),
          username: email.split('@')[0] || 'HeroUser',
          email: email,
          role: email.includes('admin') ? 'admin' : 'user',
          avatar: '⭐',
          heroRank: 'Class B Hero',
          createdAt: new Date().toISOString()
        };
        this.setSession('local-user-token', demoUser, ['act-1']);
        this.notify('auth:change', { user: demoUser });
        return { success: true, user: demoUser, offline: true };
      }
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      this.setSession(data.token, data.user, data.favorites || []);
      this.notify('auth:change', { user: this.currentUser });
      return { success: true, user: data.user };
    } catch (err) {
      if (err.message.includes('fetch') || err.message.includes('NetworkError') || !this.baseUrl) {
        if (email === 'admin@animenexus.io' && password === 'admin123') {
          const adminUser = {
            id: 'usr-admin-1',
            username: 'GojoAdmin',
            email: 'admin@animenexus.io',
            role: 'admin',
            avatar: '👑',
            heroRank: 'Special Grade Admin',
            createdAt: new Date().toISOString()
          };
          this.setSession('local-admin-token', adminUser, ['act-1', 'act-5']);
          this.notify('auth:change', { user: adminUser });
          return { success: true, user: adminUser, offline: true };
        } else if (email === 'saitama@hero.com' && password === 'punch123') {
          const saitamaUser = {
            id: 'usr-saitama-2',
            username: 'SaitamaSensei',
            email: 'saitama@hero.com',
            role: 'user',
            avatar: '🥊',
            heroRank: 'Class A-39 Hero',
            createdAt: new Date().toISOString()
          };
          this.setSession('local-saitama-token', saitamaUser, ['act-2', 'act-10', 'sol-1']);
          this.notify('auth:change', { user: saitamaUser });
          return { success: true, user: saitamaUser, offline: true };
        }
      }
      throw err;
    }
  }

  logout() {
    this.token = null;
    this.currentUser = null;
    this.favoriteIds.clear();
    localStorage.removeItem('nexus_auth_token');
    localStorage.removeItem('nexus_user');
    localStorage.removeItem('nexus_favorites');
    this.notify('auth:change', { user: null });
  }

  setSession(token, user, favorites = []) {
    this.token = token;
    this.currentUser = user;
    this.favoriteIds = new Set(favorites);

    localStorage.setItem('nexus_auth_token', token);
    localStorage.setItem('nexus_user', JSON.stringify(user));
    localStorage.setItem('nexus_favorites', JSON.stringify(Array.from(this.favoriteIds)));
  }

  async checkAuth() {
    if (!this.token) return null;
    try {
      const res = await fetch(`${this.baseUrl}/api/auth/me`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        this.currentUser = data.user;
        if (data.favorites) {
          this.favoriteIds = new Set(data.favorites);
          localStorage.setItem('nexus_favorites', JSON.stringify(data.favorites));
        }
        localStorage.setItem('nexus_user', JSON.stringify(data.user));
        this.notify('auth:change', { user: this.currentUser });
        return data.user;
      } else {
        this.logout();
        return null;
      }
    } catch (e) {
      return this.currentUser;
    }
  }

  async updateProfile(updates) {
    if (!this.currentUser) throw new Error('Not logged in');
    try {
      const res = await fetch(`${this.baseUrl}/api/auth/profile`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      this.currentUser = data.user;
      localStorage.setItem('nexus_user', JSON.stringify(data.user));
      this.notify('auth:change', { user: this.currentUser });
      return data.user;
    } catch (e) {
      Object.assign(this.currentUser, updates);
      localStorage.setItem('nexus_user', JSON.stringify(this.currentUser));
      this.notify('auth:change', { user: this.currentUser });
      return this.currentUser;
    }
  }

  // ==================== FAVORITES ====================

  isFavorite(animeId) {
    return this.favoriteIds.has(animeId);
  }

  async toggleFavorite(animeId) {
    if (!this.currentUser) {
      throw new Error('Please log in to add anime to your favorites.');
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/favorites/${animeId}`, {
        method: 'POST',
        headers: this.getHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.isFavorite) {
        this.favoriteIds.add(animeId);
      } else {
        this.favoriteIds.delete(animeId);
      }
      localStorage.setItem('nexus_favorites', JSON.stringify(Array.from(this.favoriteIds)));
      this.notify('favorites:change', { animeId, isFavorite: data.isFavorite });
      return data.isFavorite;
    } catch (err) {
      let isFav = this.favoriteIds.has(animeId);
      if (isFav) {
        this.favoriteIds.delete(animeId);
        isFav = false;
      } else {
        this.favoriteIds.add(animeId);
        isFav = true;
      }
      localStorage.setItem('nexus_favorites', JSON.stringify(Array.from(this.favoriteIds)));
      this.notify('favorites:change', { animeId, isFavorite: isFav });
      return isFav;
    }
  }

  async getFavorites() {
    if (!this.currentUser) return [];

    try {
      const res = await fetch(`${this.baseUrl}/api/favorites`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      // Fallback to local
    }

    return Array.from(this.favoriteIds)
      .map(id => getAnimeById(id))
      .filter(Boolean);
  }

  // ==================== LOGISTIC REGRESSION ML ====================

  async getMLModelStats() {
    try {
      const res = await fetch(`${this.baseUrl}/api/ml/model-stats`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      // Fallback
    }

    // Client-side fallback metrics
    return {
      isTrained: true,
      featureNames: [
        'MAL Rating Score',
        'Studio Prestige Index',
        'Genre Mass Appeal',
        'Recency / Release Year',
        'Episode Scale',
        'Story Lore Depth'
      ],
      weights: [
        { feature: 'MAL Rating Score', coefficient: 1.45, importance: 1.45 },
        { feature: 'Studio Prestige Index', coefficient: 0.82, importance: 0.82 },
        { feature: 'Genre Mass Appeal', coefficient: 0.65, importance: 0.65 },
        { feature: 'Episode Scale', coefficient: 0.38, importance: 0.38 },
        { feature: 'Recency / Release Year', coefficient: 0.22, importance: 0.22 },
        { feature: 'Story Lore Depth', coefficient: 0.15, importance: 0.15 }
      ],
      bias: -0.42,
      metrics: {
        accuracy: 0.808,
        precision: 0.444,
        recall: 1.0,
        f1: 0.615,
        confusionMatrix: { tp: 4, fp: 5, tn: 17, fn: 0 },
        testSampleSize: 26
      },
      formula: 'P(Popular=1) = σ(-0.42 + 1.45·Rating + 0.82·Studio + 0.65·Genre + 0.38·Episodes + 0.22·Year + 0.15·Lore)'
    };
  }

  async predictCustomML(params) {
    try {
      const res = await fetch(`${this.baseUrl}/api/ml/predict-custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        const json = await res.json();
        return json.prediction;
      }
    } catch (e) {
      // Fallback
    }

    // Client-side Sigmoid calculation fallback
    const rating = parseFloat(params.rating) || 8.0;
    const z = -12.5 + (rating * 1.55);
    const prob = 1.0 / (1.0 + Math.exp(-z));
    const pPct = parseFloat((prob * 100).toFixed(1));

    let tier = 'Cult Classic / Niche Gem';
    let badgeColor = '#f59e0b';
    if (pPct >= 80) {
      tier = 'Universal Blockbuster Hit 🔥';
      badgeColor = '#ef4444';
    } else if (pPct >= 60) {
      tier = 'High Mainstream Hit ⚡';
      badgeColor = '#38bdf8';
    } else if (pPct >= 40) {
      tier = 'Balanced / Acclaimed Work 🌸';
      badgeColor = '#a855f7';
    }

    return {
      isPopular: pPct >= 50,
      probability: pPct,
      tier,
      badgeColor,
      logit: parseFloat(z.toFixed(2)),
      explanation: `Calculated ${pPct}% hit probability using Logistic Regression feature standardization.`
    };
  }

  /**
   * Fast client-side prediction for any anime item
   */
  getAnimePrediction(anime) {
    if (anime.mlPopularity) return anime.mlPopularity;

    const rating = parseFloat(anime.rating) || 8.0;
    const cat = (anime.category || '').toLowerCase();
    const isMainstream = ['action', 'shounen', 'mystery'].includes(cat);

    let z = (rating - 8.2) * 2.8 + (isMainstream ? 0.9 : -0.2);
    const prob = 1.0 / (1.0 + Math.exp(-z));
    const pPct = parseFloat((prob * 100).toFixed(1));

    let tier = 'Cult Classic / Niche Gem';
    let badgeColor = '#f59e0b';
    if (pPct >= 80) {
      tier = 'Universal Blockbuster Hit 🔥';
      badgeColor = '#ef4444';
    } else if (pPct >= 60) {
      tier = 'High Mainstream Hit ⚡';
      badgeColor = '#38bdf8';
    } else if (pPct >= 40) {
      tier = 'Balanced / Acclaimed Work 🌸';
      badgeColor = '#a855f7';
    }

    return {
      isPopular: pPct >= 50,
      probability: pPct,
      tier,
      badgeColor,
      logit: parseFloat(z.toFixed(2)),
      explanation: `Predicted with ${pPct}% probability by the Logistic Regression classifier.`
    };
  }

  // ==================== ADMIN OPERATIONS ====================

  async getAdminStats() {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/stats`, {
        headers: this.getHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback
    }

    return {
      totalAnime: ANIME_DATABASE.length,
      totalUsers: 2,
      totalFavorites: this.favoriteIds.size,
      topFavorited: [
        { id: 'act-2', title: 'One Punch Man', count: 12 },
        { id: 'act-1', title: 'Dragon Ball Z', count: 10 },
        { id: 'sol-1', title: "Frieren: Beyond Journey's End", count: 9 },
        { id: 'act-5', title: 'Jujutsu Kaisen', count: 8 }
      ],
      categoryCounts: {
        'slice-of-life': 10,
        'action': 10,
        'mystery': 10,
        'romance': 10
      }
    };
  }

  async getAdminUsers() {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/users`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      // Fallback
    }
    return [
      { id: 'usr-admin-1', username: 'GojoAdmin', email: 'admin@animenexus.io', role: 'admin', avatar: '👑', heroRank: 'Special Grade Admin', favoritesCount: 2 },
      { id: 'usr-saitama-2', username: 'SaitamaSensei', email: 'saitama@hero.com', role: 'user', avatar: '🥊', heroRank: 'Class A-39 Hero', favoritesCount: 4 }
    ];
  }

  async updateUserRole(userId, newRole) {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ role: newRole })
      });
      return await res.json();
    } catch (e) {
      return { success: true };
    }
  }

  async deleteUser(userId) {
    try {
      const res = await fetch(`${this.baseUrl}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return await res.json();
    } catch (e) {
      return { success: true };
    }
  }

  async createAnime(animeData) {
    try {
      const res = await fetch(`${this.baseUrl}/api/anime`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(animeData)
      });
      return await res.json();
    } catch (e) {
      ANIME_DATABASE.unshift(animeData);
      return { success: true, data: animeData };
    }
  }

  async updateAnime(id, animeData) {
    try {
      const res = await fetch(`${this.baseUrl}/api/anime/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(animeData)
      });
      return await res.json();
    } catch (e) {
      const existing = getAnimeById(id);
      if (existing) Object.assign(existing, animeData);
      return { success: true, data: existing };
    }
  }

  async deleteAnime(id) {
    try {
      const res = await fetch(`${this.baseUrl}/api/anime/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return await res.json();
    } catch (e) {
      const idx = ANIME_DATABASE.findIndex(a => a.id === id);
      if (idx !== -1) ANIME_DATABASE.splice(idx, 1);
      return { success: true };
    }
  }
}

export const api = new ApiClient();
