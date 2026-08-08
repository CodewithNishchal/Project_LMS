import { Router } from 'express';
import { getAdminMetrics, getAllLoansAdmin, getAllAuditLogsAdmin } from '../controllers/adminController';
import { authenticateJwt, authorizeRoles } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';

const router = Router();

router.get('/metrics', authenticateJwt, authorizeRoles(UserRole.ADMIN), getAdminMetrics);
router.get('/all-loans', authenticateJwt, authorizeRoles(UserRole.ADMIN), getAllLoansAdmin);
router.get('/audit-logs', authenticateJwt, authorizeRoles(UserRole.ADMIN), getAllAuditLogsAdmin);

export default router;
