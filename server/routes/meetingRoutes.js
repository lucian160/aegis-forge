import { Router } from 'express';
import {
  addMeetingParticipant,
  cancelMeeting,
  createMeeting,
  getMeeting,
  listMeetings,
  removeMeetingParticipant,
  updateMeeting,
  updateMeetingStatus,
} from '../controllers/meetingController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/authorizationMiddleware.js';

const router = Router();

router.get('/', requireAuth, requirePermission('meetings', 'view'), listMeetings);
router.get('/:id', requireAuth, requirePermission('meetings', 'view'), getMeeting);
router.post('/', requireAuth, requirePermission('meetings', 'manage'), createMeeting);
router.put('/:id', requireAuth, requirePermission('meetings', 'manage'), updateMeeting);
router.patch('/:id/cancel', requireAuth, requirePermission('meetings', 'manage'), cancelMeeting);
router.patch('/:id/status', requireAuth, requirePermission('meetings', 'manage'), updateMeetingStatus);
router.post('/:id/participants', requireAuth, requirePermission('meetings', 'manage'), addMeetingParticipant);
router.delete('/:id/participants', requireAuth, requirePermission('meetings', 'manage'), removeMeetingParticipant);

export default router;
