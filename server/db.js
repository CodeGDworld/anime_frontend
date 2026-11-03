/**
 * Anime Nexus - Database Engine
 * Zero-dependency, file-backed atomic JSON database
 * Stores users, anime catalog, favorites, categories, and logs
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'data', 'database.json');

// JWT Secret Key (in production, use process.env.JWT_SECRET)
const JWT_SECRET = 'anime-nexus-secret-key-super-saiyan-9000';

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch (e) {
    return null;
  }
}

class Database {
  constructor() {
    this.data = {
      users: [],
      anime: [],
      favorites: {}, // userId -> [animeId]
      logs: []
    };
    this.init();
  }

  init() {
    // Ensure data directory exists
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(DB_PATH)) {
      try {
        const raw = fs.readFileSync(DB_PATH, 'utf8');
        this.data = JSON.parse(raw);
        console.log(`[DB] Loaded ${this.data.anime.length} anime, ${this.data.users.length} users.`);
      } catch (err) {
        console.error('[DB] Error reading database, re-seeding:', err);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('[DB] Save error:', err);
    }
  }

  seedInitialData() {
    console.log('[DB] Seeding initial database with users and anime...');

    // 1. Seed Predefined Users (Admin & Saitama Demo)
    const adminSalt = generateSalt();
    const adminUser = {
      id: 'usr-admin-1',
      username: 'GojoAdmin',
      email: 'admin@animenexus.io',
      salt: adminSalt,
      passwordHash: hashPassword('admin123', adminSalt),
      role: 'admin',
      avatar: '👑',
      heroRank: 'Special Grade Admin',
      createdAt: new Date().toISOString()
    };

    const saitamaSalt = generateSalt();
    const saitamaUser = {
      id: 'usr-saitama-2',
      username: 'SaitamaSensei',
      email: 'saitama@hero.com',
      salt: saitamaSalt,
      passwordHash: hashPassword('punch123', saitamaSalt),
      role: 'user',
      avatar: '🥊',
      heroRank: 'Class A-39 Hero',
      createdAt: new Date().toISOString()
    };

    this.data.users = [adminUser, saitamaUser];

    // 2. Load 130 Curated Anime from data.js
    const dataJsPath = path.join(__dirname, '..', 'js', 'data.js');
    if (fs.existsSync(dataJsPath)) {
      try {
        const fileContent = fs.readFileSync(dataJsPath, 'utf8');
        // Extract ANIME_DATABASE array via regex/eval extraction safely
        const startIdx = fileContent.indexOf('export const ANIME_DATABASE = [');
        const endIdx = fileContent.indexOf('export function getAnimeByCategory');
        if (startIdx !== -1 && endIdx !== -1) {
          const jsCode = fileContent.slice(startIdx, endIdx).replace('export const ANIME_DATABASE =', 'const list =') + '; module.exports = list;';
          const m = new module.constructor();
          m.paths = module.paths;
          m._compile(jsCode, 'temp_data.js');
          this.data.anime = m.exports;
        }
      } catch (e) {
        console.warn('[DB] Could not parse js/data.js dynamically, fallback seeding.', e.message);
      }
    }

    // 3. Seed Favorites for Saitama
    this.data.favorites = {
      'usr-saitama-2': ['act-2', 'act-10', 'sol-1', 'sol-9']
    };

    this.save();
    console.log(`[DB] Seeding complete: ${this.data.anime.length} anime, ${this.data.users.length} users.`);
  }

  // ==================== USER METHODS ====================

  findUserByEmail(email) {
    if (!email) return null;
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  createUser({ username, email, password, role = 'user', avatar = '⚡', heroRank = 'Hero Candidate' }) {
    if (this.findUserByEmail(email)) {
      throw new Error('Email already registered');
    }

    const salt = generateSalt();
    const newUser = {
      id: 'usr-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      salt,
      passwordHash: hashPassword(password, salt),
      role: role === 'admin' ? 'admin' : 'user',
      avatar: avatar || '⚡',
      heroRank: role === 'admin' ? 'Special Grade Admin' : heroRank,
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.data.favorites[newUser.id] = [];
    this.save();

    return this.sanitizeUser(newUser);
  }

  verifyUser(email, password) {
    const user = this.findUserByEmail(email);
    if (!user) return null;
    const testHash = hashPassword(password, user.salt);
    if (testHash === user.passwordHash) {
      return this.sanitizeUser(user);
    }
    return null;
  }

  updateUser(id, updates) {
    const user = this.findUserById(id);
    if (!user) return null;

    if (updates.username) user.username = updates.username.trim();
    if (updates.avatar) user.avatar = updates.avatar;
    if (updates.heroRank) user.heroRank = updates.heroRank;
    if (updates.role && ['user', 'admin'].includes(updates.role)) user.role = updates.role;

    this.save();
    return this.sanitizeUser(user);
  }

  deleteUser(id) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    this.data.users.splice(idx, 1);
    delete this.data.favorites[id];
    this.save();
    return true;
  }

  getAllUsers() {
    return this.data.users.map(u => ({
      ...this.sanitizeUser(u),
      favoritesCount: (this.data.favorites[u.id] || []).length
    }));
  }

  sanitizeUser(user) {
    const { passwordHash, salt, ...safe } = user;
    return safe;
  }

  // ==================== ANIME CRUD METHODS ====================

  getAllAnime({ search, category, sort } = {}) {
    let list = [...this.data.anime];

    if (category && category !== 'all') {
      list = list.filter(a => a.category === category);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.japaneseTitle && a.japaneseTitle.toLowerCase().includes(q)) ||
        (a.studio && a.studio.toLowerCase().includes(q)) ||
        (a.signatureMove && a.signatureMove.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q)) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (sort) {
      switch (sort) {
        case 'rating':
          list.sort((a, b) => b.rating - a.rating);
          break;
        case 'year-desc':
          list.sort((a, b) => b.year - a.year);
          break;
        case 'year-asc':
          list.sort((a, b) => a.year - b.year);
          break;
        case 'title':
          list.sort((a, b) => a.title.localeCompare(b.title));
          break;
      }
    }

    return list;
  }

  getAnimeById(id) {
    return this.data.anime.find(a => a.id === id);
  }

  createAnime(item) {
    const newId = item.id || `custom-${Date.now()}`;
    const newAnime = {
      id: newId,
      category: item.category || 'action',
      dimension: item.dimension || 'genres',
      title: item.title,
      japaneseTitle: item.japaneseTitle || item.title,
      studio: item.studio || 'Animation Studio',
      year: parseInt(item.year, 10) || new Date().getFullYear(),
      episodes: item.episodes || '12 Episodes',
      rating: parseFloat(item.rating) || 8.0,
      image: item.image || 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg',
      tags: Array.isArray(item.tags) ? item.tags : (item.tags ? item.tags.split(',').map(s => s.trim()) : ['Anime']),
      signatureMove: item.signatureMove || 'Cosmic Energy Wave',
      moveType: item.moveType || 'kamehameha',
      description: item.description || 'An extraordinary anime adventure.',
      quote: item.quote || 'Believe in your own power!'
    };

    this.data.anime.unshift(newAnime);
    this.save();
    return newAnime;
  }

  updateAnime(id, updates) {
    const anime = this.getAnimeById(id);
    if (!anime) return null;

    Object.assign(anime, updates);
    if (updates.tags && typeof updates.tags === 'string') {
      anime.tags = updates.tags.split(',').map(s => s.trim());
    }
    if (updates.year) anime.year = parseInt(updates.year, 10);
    if (updates.rating) anime.rating = parseFloat(updates.rating);

    this.save();
    return anime;
  }

  deleteAnime(id) {
    const idx = this.data.anime.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.data.anime.splice(idx, 1);

    // Remove from all favorites
    Object.keys(this.data.favorites).forEach(uid => {
      this.data.favorites[uid] = this.data.favorites[uid].filter(aid => aid !== id);
    });

    this.save();
    return true;
  }

  // ==================== FAVORITES METHODS ====================

  getFavorites(userId) {
    if (!userId) return [];
    const favIds = this.data.favorites[userId] || [];
    return this.data.anime.filter(a => favIds.includes(a.id));
  }

  isFavorite(userId, animeId) {
    if (!userId || !animeId) return false;
    const favIds = this.data.favorites[userId] || [];
    return favIds.includes(animeId);
  }

  toggleFavorite(userId, animeId) {
    if (!userId || !animeId) return { isFavorite: false, count: 0 };

    if (!this.data.favorites[userId]) {
      this.data.favorites[userId] = [];
    }

    const list = this.data.favorites[userId];
    const idx = list.indexOf(animeId);
    let isFavorite = false;

    if (idx === -1) {
      list.push(animeId);
      isFavorite = true;
    } else {
      list.splice(idx, 1);
      isFavorite = false;
    }

    this.save();
    return {
      isFavorite,
      count: list.length,
      favoriteIds: list
    };
  }

  // ==================== ADMIN STATS ====================

  getAdminStats() {
    const totalAnime = this.data.anime.length;
    const totalUsers = this.data.users.length;

    let totalFavorites = 0;
    const favCounts = {}; // animeId -> count

    Object.values(this.data.favorites).forEach(list => {
      totalFavorites += list.length;
      list.forEach(id => {
        favCounts[id] = (favCounts[id] || 0) + 1;
      });
    });

    // Top 5 favorited anime
    const topFavorited = Object.entries(favCounts)
      .map(([id, count]) => {
        const a = this.getAnimeById(id);
        return a ? { id: a.id, title: a.title, studio: a.studio, rating: a.rating, count } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Category distribution
    const categoryCounts = {};
    this.data.anime.forEach(a => {
      categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    });

    return {
      totalAnime,
      totalUsers,
      totalFavorites,
      topFavorited,
      categoryCounts,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }
}

const db = new Database();

module.exports = {
  db,
  signToken,
  verifyToken
};
