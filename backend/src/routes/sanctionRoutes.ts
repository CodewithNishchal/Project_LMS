import { Router } from 'express';
import { getSanctionQueue, decideSanction, analyzeLoanCreditRisk } from '../controllers/sanctionController';
import { authenticateJwt, authorizeRoles } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';

const router = Router();

router.get('/queue', authenticateJwt, authorizeRoles(UserRole.SANCTION, UserRole.ADMIN), getSanctionQueue);
router.post('/decide', authenticateJwt, authorizeRoles(UserRole.SANCTION, UserRole.ADMIN), decideSanction);
router.post('/ai-analyze', authenticateJwt, authorizeRoles(UserRole.SANCTION, UserRole.ADMIN), analyzeLoanCreditRisk);

export default router;
