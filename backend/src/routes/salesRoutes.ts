import { Router } from 'express';
import { getLeads, convertLead, toggleEngageLead } from '../controllers/salesController';
import { authenticateJwt, authorizeRoles } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';

const router = Router();

router.get('/leads', authenticateJwt, authorizeRoles(UserRole.SALES, UserRole.ADMIN), getLeads);
router.post('/convert', authenticateJwt, authorizeRoles(UserRole.SALES, UserRole.ADMIN), convertLead);
router.post('/engage', authenticateJwt, authorizeRoles(UserRole.SALES, UserRole.ADMIN), toggleEngageLead);

export default router;
