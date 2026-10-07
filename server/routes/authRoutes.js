import { Router } from 'express';
import { getProfile, login, logout, refresh, register, requestPasswordReset, resetPassword, resendVerification, verifyEmail } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { createRateLimit } from '../middleware/rateLimitMiddleware.js';

const router = Router();
const loginRateLimit = createRateLimit({ limit: 10, windowMs: 15 * 60 * 1000 });
const registrationRateLimit = createRateLimit({ limit: 5, windowMs: 15 * 60 * 1000 });
const refreshRateLimit = createRateLimit({ limit: 20, windowMs: 5 * 60 * 1000 });
const verificationRateLimit = createRateLimit({ limit: 5, windowMs: 15 * 60 * 1000 });
const verifyLinkRateLimit = createRateLimit({ limit: 10, windowMs: 15 * 60 * 1000 });
const passwordResetRequestRateLimit = createRateLimit({ limit: 5, windowMs: 15 * 60 * 1000 });
const passwordResetRateLimit = createRateLimit({ limit: 10, windowMs: 15 * 60 * 1000 });
const asyncHandler = (handler) => (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next);


router.get('/register-status', (request, response) => {
  response.json({
    status: 'ok',
    message: 'Registration API is reachable',
  });
});

router.post('/register', registrationRateLimit, asyncHandler(register));
router.post('/register', registrationRateLimit, asyncHandler(register));
router.get('/verify-email', verifyLinkRateLimit, asyncHandler(verifyEmail));
router.post('/resend-verification', verificationRateLimit, asyncHandler(resendVerification));
router.post('/forgot-password', passwordResetRequestRateLimit, asyncHandler(requestPasswordReset));
router.post('/reset-password', passwordResetRateLimit, asyncHandler(resetPassword));
router.post('/login', loginRateLimit, asyncHandler(login));
router.post('/refresh', refreshRateLimit, asyncHandler(refresh));
router.post('/logout', asyncHandler(logout));
router.get('/profile', requireAuth, asyncHandler(getProfile));

export default router;
