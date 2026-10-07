import { Router } from 'express';
import { submitApplication } from '../controllers/applicationController.js';
import { createRateLimit } from '../middleware/rateLimitMiddleware.js';

const router = Router();
const applicationRateLimit = createRateLimit({ limit: 5, windowMs: 60 * 60 * 1000 });
const asyncHandler = (handler) => (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next);

router.post('/', applicationRateLimit, asyncHandler(submitApplication));

export default router;