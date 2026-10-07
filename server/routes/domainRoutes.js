import { Router } from 'express';
import {
  createResourceHandler,
  deleteResourceHandler,
  getResource,
  listResources,
  updateResourceHandler,
} from '../controllers/domainController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/authorizationMiddleware.js';

const router = Router();
const asyncHandler = (handler) => (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next);
const resources = [
  ['departments', 'departments', 'view'],
  ['roles', 'roles', 'view'],
  ['permissions', 'permissions', 'view'],
  ['projects', 'projects', 'view'],
  ['tasks', 'tasks', 'view'],
  ['comments', 'comments', 'view'],
  ['announcements', 'announcements', 'view'],
  ['notifications', 'notifications', 'view'],
  ['activities', 'activities', 'view'],
  ['documents', 'documents', 'view'],
  ['knowledge', 'knowledge', 'view'],
  ['researchProjects', 'research', 'view'],
  ['researchEntries', 'research', 'view'],
  ['applications', 'applications', 'view'],
  ['meetings', 'meetings', 'view'],
];

for (const [route, scope, action] of resources) {
  router.get('/:resource', requireAuth, requirePermission(scope, action), asyncHandler(listResources));
  router.get('/:resource/:id', requireAuth, requirePermission(scope, action), asyncHandler(getResource));
  router.post('/:resource', requireAuth, requirePermission(scope, 'manage'), asyncHandler(createResourceHandler));
  router.put('/:resource/:id', requireAuth, requirePermission(scope, 'manage'), asyncHandler(updateResourceHandler));
  router.delete('/:resource/:id', requireAuth, requirePermission(scope, 'manage'), asyncHandler(deleteResourceHandler));
}

export default router;
