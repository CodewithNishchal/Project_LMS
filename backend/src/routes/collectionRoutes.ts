import { Router } from 'express';
import { recordPayment, getCollectionLoans } from '../controllers/collectionController';
import { authenticateJwt, authorizeRoles } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';

const router = Router();

router.get('/loans', authenticateJwt, authorizeRoles(UserRole.COLLECTION, UserRole.ADMIN), getCollectionLoans);
router.post('/repayment', authenticateJwt, authorizeRoles(UserRole.COLLECTION, UserRole.ADMIN), recordPayment);

export default router;
