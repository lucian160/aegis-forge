import { Router } from 'express';
import { submitContact } from '../controllers/contactController.js';
import { createRateLimit } from '../middleware/rateLimitMiddleware.js';

const router = Router();
const contactRateLimit = createRateLimit({ limit: 5, windowMs: 15 * 60 * 1000 });
const asyncHandler = (handler) => (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next);

router.post('/', contactRateLimit, asyncHandler(submitContact));

export default router;