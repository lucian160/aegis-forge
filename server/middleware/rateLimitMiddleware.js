const defaultLimit = 10;
const defaultWindowMs = 15 * 60 * 1000;

function getClientKey(request) {
  return request.ip || request.socket?.remoteAddress || 'unknown';
}

function pruneExpiredEntries(attempts) {
  const now = Date.now();
  for (const [key, entry] of attempts) {
    if (entry.expiresAt <= now) attempts.delete(key);
  }
}

export function createRateLimit({ limit = defaultLimit, windowMs = defaultWindowMs } = {}) {
  const attempts = new Map();
  return (request, response, next) => {
    pruneExpiredEntries(attempts);
    const key = getClientKey(request);
    const entry = attempts.get(key);

    if (!entry || entry.count < limit) {
      attempts.set(key, { count: (entry?.count || 0) + 1, expiresAt: Date.now() + windowMs });
      return next();
    }

    return response.status(429).json({
      error: 'Too many requests. Please wait before trying again.',
      retryAfter: Math.ceil((entry.expiresAt - Date.now()) / 1000),
    });
  };
}
