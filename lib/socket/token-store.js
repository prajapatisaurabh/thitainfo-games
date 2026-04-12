/**
 * Shared in-memory token store for Socket.IO connection tokens.
 * Tokens are single-use and expire after TOKEN_TTL_MS.
 *
 * Note: Works for single-instance deployments. For horizontally scaled
 * deployments, replace with a Redis-backed store.
 */

const TOKEN_TTL_MS = 60 * 1000; // 1 minute

// Use a global to survive Next.js hot-reload in development
if (!global.__socketTokenStore) {
  global.__socketTokenStore = new Map();

  // Periodically clean up expired tokens
  setInterval(() => {
    const now = Date.now();
    for (const [token, expiry] of global.__socketTokenStore) {
      if (now > expiry) global.__socketTokenStore.delete(token);
    }
  }, 30 * 1000).unref();
}

const tokenStore = global.__socketTokenStore;

function createToken(token) {
  tokenStore.set(token, Date.now() + TOKEN_TTL_MS);
}

function validateToken(token) {
  if (!token || !tokenStore.has(token)) return false;
  const expiry = tokenStore.get(token);
  if (Date.now() > expiry) {
    tokenStore.delete(token);
    return false;
  }
  tokenStore.delete(token); // single-use
  return true;
}

module.exports = { createToken, validateToken };
