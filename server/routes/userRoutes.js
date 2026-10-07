import { Router } from 'express';
import { getUser, listUsers, updateUser } from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requirePermission, requireUserManagementPermission } from '../middleware/authorizationMiddleware.js';

const router = Router();
const asyncHandler = (handler) => (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next);

router.get('/', requireAuth, requirePermission('users', 'view'), asyncHandler(listUsers));
router.get('/:id', requireAuth, requirePermission('users', 'view'), asyncHandler(getUser));
router.put('/:id/role', requireAuth, requireUserManagementPermission, asyncHandler(updateUser));
router.patch('/:id/role', requireAuth, requireUserManagementPermission, asyncHandler(updateUser));
router.put('/:id', requireAuth, requireUserManagementPermission, asyncHandler(updateUser));

export default router;
