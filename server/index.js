/**
 * Anime Nexus - Full Stack Server
 * High performance, zero-dependency Node.js HTTP REST API & Static File Server
 * Features:
 * - Built-in JSON body parser & CORS
 * - Token-based authentication with role verification (User & Admin)
 * - CRUD operations for Anime Catalog
 * - Favorites management per user
 * - Admin analytics & user management
 * - Logistic Regression Machine Learning Engine for Anime Popularity Prediction
 * - Static file serving with proper MIME caching
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { db, signToken, verifyToken } = require('./db');
const { mlEngine } = require('./ml');

let PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const PUBLIC_DIR = path.resolve(__dirname, '..');

// Train ML Model on startup
mlEngine.train(db.getAllAnime());

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: message, success: false });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 5 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        const json = body ? JSON.parse(body) : {};
        resolve(json);
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function authenticate(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload || !payload.id) return null;
  return db.findUserById(payload.id);
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    });
    return res.end();
  }

  // ==========================================
  // REST API ROUTING (/api/...)
  // ==========================================
  if (pathname.startsWith('/api/')) {

    // 0. HEALTH CHECK ROUTE
    if (pathname === '/api/health' && method === 'GET') {
      return sendJson(res, 200, {
        status: 'online',
        uptime: process.uptime(),
        totalAnime: db.getAllAnime().length,
        mlTrained: mlEngine.isTrained,
        timestamp: new Date().toISOString()
      });
    }

    // ----------------------------------------
    // 1. AUTH ROUTES
    // ----------------------------------------
    if (pathname === '/api/auth/register' && method === 'POST') {
      try {
        const body = await readBody(req);
        if (!body.username || !body.email || !body.password) {
          return sendError(res, 400, 'Username, email, and password are required.');
        }
        if (body.password.length < 6) {
          return sendError(res, 400, 'Password must be at least 6 characters.');
        }

        const user = db.createUser(body);
        const token = signToken({ id: user.id, email: user.email, role: user.role });
        return sendJson(res, 201, { success: true, user, token });
      } catch (err) {
        return sendError(res, 400, err.message);
      }
    }

    if (pathname === '/api/auth/login' && method === 'POST') {
      try {
        const body = await readBody(req);
        if (!body.email || !body.password) {
          return sendError(res, 400, 'Email and password required.');
        }

        const user = db.verifyUser(body.email, body.password);
        if (!user) {
          return sendError(res, 401, 'Invalid email or password.');
        }

        const token = signToken({ id: user.id, email: user.email, role: user.role });
        const favorites = db.getFavorites(user.id).map(a => a.id);

        return sendJson(res, 200, {
          success: true,
          user,
          token,
          favorites
        });
      } catch (err) {
        return sendError(res, 500, err.message);
      }
    }

    if (pathname === '/api/auth/me' && method === 'GET') {
      const user = authenticate(req);
      if (!user) return sendError(res, 401, 'Unauthorized');

      const safeUser = db.sanitizeUser(user);
      const favorites = db.getFavorites(user.id).map(a => a.id);
      return sendJson(res, 200, { user: safeUser, favorites });
    }

    if (pathname === '/api/auth/profile' && method === 'PATCH') {
      const user = authenticate(req);
      if (!user) return sendError(res, 401, 'Unauthorized');

      const body = await readBody(req);
      const updated = db.updateUser(user.id, body);
      return sendJson(res, 200, { success: true, user: updated });
    }

    // ----------------------------------------
    // 2. ANIME CATALOG ROUTES
    // ----------------------------------------
    if (pathname === '/api/anime' && method === 'GET') {
      const { search, category, sort } = parsedUrl.query;
      const list = db.getAllAnime({ search, category, sort });
      
      // Attach ML Popularity prediction to each anime item
      const enriched = list.map(a => {
        const mlPred = mlEngine.predict(a);
        return {
          ...a,
          mlPopularity: mlPred
        };
      });

      return sendJson(res, 200, { count: enriched.length, data: enriched });
    }

    if (pathname.startsWith('/api/anime/') && method === 'GET') {
      const id = pathname.replace('/api/anime/', '');
      const anime = db.getAnimeById(id);
      if (!anime) return sendError(res, 404, 'Anime not found');

      const mlPred = mlEngine.predict(anime);
      return sendJson(res, 200, { ...anime, mlPopularity: mlPred });
    }

    // CREATE ANIME (Admin only)
    if (pathname === '/api/anime' && method === 'POST') {
      const user = authenticate(req);
      if (!user || user.role !== 'admin') {
        return sendError(res, 403, 'Forbidden: Admin access required.');
      }

      const body = await readBody(req);
      if (!body.title) return sendError(res, 400, 'Anime title is required.');

      const newAnime = db.createAnime(body);
      mlEngine.train(db.getAllAnime()); // Retrain model with new anime
      return sendJson(res, 201, { success: true, data: newAnime });
    }

    // UPDATE ANIME (Admin only)
    if (pathname.startsWith('/api/anime/') && method === 'PUT') {
      const user = authenticate(req);
      if (!user || user.role !== 'admin') {
        return sendError(res, 403, 'Forbidden: Admin access required.');
      }

      const id = pathname.replace('/api/anime/', '');
      const body = await readBody(req);
      const updated = db.updateAnime(id, body);
      if (!updated) return sendError(res, 404, 'Anime not found');
      return sendJson(res, 200, { success: true, data: updated });
    }

    // DELETE ANIME (Admin only)
    if (pathname.startsWith('/api/anime/') && method === 'DELETE') {
      const user = authenticate(req);
      if (!user || user.role !== 'admin') {
        return sendError(res, 403, 'Forbidden: Admin access required.');
      }

      const id = pathname.replace('/api/anime/', '');
      const ok = db.deleteAnime(id);
      if (!ok) return sendError(res, 404, 'Anime not found');
      return sendJson(res, 200, { success: true, message: 'Anime deleted' });
    }

    // ----------------------------------------
    // 3. FAVORITES ROUTES
    // ----------------------------------------
    if (pathname === '/api/favorites' && method === 'GET') {
      const user = authenticate(req);
      if (!user) return sendError(res, 401, 'Please log in to view favorites.');

      const favAnime = db.getFavorites(user.id).map(a => ({
        ...a,
        mlPopularity: mlEngine.predict(a)
      }));
      return sendJson(res, 200, { count: favAnime.length, data: favAnime });
    }

    if (pathname.startsWith('/api/favorites/') && method === 'POST') {
      const user = authenticate(req);
      if (!user) return sendError(res, 401, 'Please log in to save favorites.');

      const animeId = pathname.replace('/api/favorites/', '');
      const result = db.toggleFavorite(user.id, animeId);
      return sendJson(res, 200, { success: true, ...result });
    }

    // ----------------------------------------
    // 4. LOGISTIC REGRESSION ML ROUTES
    // ----------------------------------------
    if (pathname === '/api/ml/model-stats' && method === 'GET') {
      const summary = mlEngine.getModelSummary();
      return sendJson(res, 200, { success: true, data: summary });
    }

    if (pathname.startsWith('/api/ml/predict/') && method === 'GET') {
      const animeId = pathname.replace('/api/ml/predict/', '');
      const anime = db.getAnimeById(animeId);
      if (!anime) return sendError(res, 404, 'Anime not found');

      const prediction = mlEngine.predict(anime);
      return sendJson(res, 200, { success: true, anime: anime.title, prediction });
    }

    if (pathname === '/api/ml/predict-custom' && method === 'POST') {
      const body = await readBody(req);
      const prediction = mlEngine.predict(body);
      return sendJson(res, 200, { success: true, prediction });
    }

    if (pathname === '/api/ml/rankings' && method === 'GET') {
      const allAnime = db.getAllAnime();
      const scored = allAnime.map(a => ({
        id: a.id,
        title: a.title,
        studio: a.studio,
        rating: a.rating,
        category: a.category,
        image: a.image,
        mlPopularity: mlEngine.predict(a)
      })).sort((a, b) => b.mlPopularity.probability - a.mlPopularity.probability);

      return sendJson(res, 200, { count: scored.length, data: scored });
    }

    if (pathname === '/api/ml/retrain' && method === 'POST') {
      const user = authenticate(req);
      if (!user || user.role !== 'admin') {
        return sendError(res, 403, 'Forbidden: Admin access required.');
      }
      const newMetrics = mlEngine.train(db.getAllAnime());
      return sendJson(res, 200, { success: true, metrics: newMetrics });
    }

    // ----------------------------------------
    // 5. ADMIN PANEL ROUTES
    // ----------------------------------------
    if (pathname === '/api/admin/stats' && method === 'GET') {
      const user = authenticate(req);
      if (!user || user.role !== 'admin') {
        return sendError(res, 403, 'Forbidden: Admin access required.');
      }

      const stats = db.getAdminStats();
      const mlSummary = mlEngine.getModelSummary();
      return sendJson(res, 200, { ...stats, mlModel: mlSummary });
    }

    if (pathname === '/api/admin/users' && method === 'GET') {
      const user = authenticate(req);
      if (!user || user.role !== 'admin') {
        return sendError(res, 403, 'Forbidden: Admin access required.');
      }

      const users = db.getAllUsers();
      return sendJson(res, 200, { count: users.length, data: users });
    }

    if (pathname.startsWith('/api/admin/users/') && pathname.endsWith('/role') && method === 'PATCH') {
      const user = authenticate(req);
      if (!user || user.role !== 'admin') {
        return sendError(res, 403, 'Forbidden: Admin access required.');
      }

      const targetId = pathname.replace('/api/admin/users/', '').replace('/role', '');
      const body = await readBody(req);
      if (!body.role || !['user', 'admin'].includes(body.role)) {
        return sendError(res, 400, 'Invalid role');
      }

      const updated = db.updateUser(targetId, { role: body.role });
      if (!updated) return sendError(res, 404, 'User not found');
      return sendJson(res, 200, { success: true, user: updated });
    }

    if (pathname.startsWith('/api/admin/users/') && method === 'DELETE') {
      const user = authenticate(req);
      if (!user || user.role !== 'admin') {
        return sendError(res, 403, 'Forbidden: Admin access required.');
      }

      const targetId = pathname.replace('/api/admin/users/', '');
      if (targetId === user.id) {
        return sendError(res, 400, 'Cannot delete your own admin account');
      }

      const ok = db.deleteUser(targetId);
      if (!ok) return sendError(res, 404, 'User not found');
      return sendJson(res, 200, { success: true, message: 'User deleted' });
    }

    return sendError(res, 404, 'API endpoint not found');
  }

  // ==========================================
  // STATIC FILE SERVING
  // ==========================================
  const cleanPath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  let filePath = path.resolve(PUBLIC_DIR, cleanPath);
  
  if (!filePath.toLowerCase().startsWith(PUBLIC_DIR.toLowerCase())) {
    res.writeHead(403);
    return res.end('Access denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexPath, (readErr, content) => {
        if (readErr) {
          res.writeHead(404);
          return res.end('Not Found');
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

function startServer(portToTry) {
  server.listen(portToTry, () => {
    console.log(`\n==================================================`);
    console.log(`⚡ ANIME NEXUS FULL STACK SERVER ONLINE!`);
    console.log(`📡 Local URL:  http://localhost:${portToTry}`);
    console.log(`📡 IPv4 URL:   http://127.0.0.1:${portToTry}`);
    console.log(`🤖 Logistic Regression ML Model: TRAINED & READY`);
    console.log(`👑 Admin Credentials: admin@animenexus.io / admin123`);
    console.log(`🥊 Saitama Demo User: saitama@hero.com / punch123`);
    console.log(`==================================================\n`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
    console.warn(`[SERVER] Port ${PORT} unavailable (${err.code}). Trying fallback port ${PORT + 1}...`);
    PORT = PORT + 1;
    startServer(PORT);
  } else {
    console.error('[SERVER] Fatal server error:', err);
  }
});

startServer(PORT);
