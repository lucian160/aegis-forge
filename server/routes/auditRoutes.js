import { Router } from 'express';
import { listAuditEntries } from '../controllers/auditController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/authorizationMiddleware.js';

const router = Router();

router.get('/', requireAuth, requirePermission('activities', 'view'), listAuditEntries);

export default router;
