import { Router } from 'express';
import { createMeeting, getMeetings, getMeetingById } from '../controllers/meetingController';

const router = Router();

router.post('/', createMeeting);
router.get('/', getMeetings);
router.get('/:id', getMeetingById);

export default router;
