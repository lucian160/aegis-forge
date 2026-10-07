import { verifyAccessToken } from '../services/authService.js';

export async function requireAuth(request, response, next) {
  try {
    const authorization = request.get('authorization') || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

    if (!token) {
      return response.status(401).json({ error: 'Authentication is required.' });
    }

    const decoded = verifyAccessToken(token);
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(decoded.sub).select('-passwordHash -refreshTokenHash');

    if (!user || !user.isActive || !user.isVerified) {
      return response.status(401).json({ error: 'Account is unavailable.' });
    }

    request.user = user;
    next();
  } catch {
    response.status(401).json({ error: 'Invalid or expired access token.' });
  }
}
