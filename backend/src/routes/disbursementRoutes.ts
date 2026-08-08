import { Router } from 'express';
import { getDisbursementQueue, releaseDisbursement, rejectDisbursement } from '../controllers/disbursementController';
import { authenticateJwt, authorizeRoles } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';

const router = Router();

router.get('/queue', authenticateJwt, authorizeRoles(UserRole.DISBURSEMENT, UserRole.ADMIN), getDisbursementQueue);
router.post('/release', authenticateJwt, authorizeRoles(UserRole.DISBURSEMENT, UserRole.ADMIN), releaseDisbursement);
router.post('/reject', authenticateJwt, authorizeRoles(UserRole.DISBURSEMENT, UserRole.ADMIN), rejectDisbursement);

export default router;
