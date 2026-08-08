import { Router } from 'express';
import multer from 'multer';
import { applyForLoan, getMyLoan, uploadSalarySlip } from '../controllers/borrowerController';
import { authenticateJwt, authorizeRoles } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post('/apply', authenticateJwt, authorizeRoles(UserRole.BORROWER), applyForLoan);
router.get('/my-loan', authenticateJwt, authorizeRoles(UserRole.BORROWER), getMyLoan);
router.get('/dashboard', authenticateJwt, authorizeRoles(UserRole.BORROWER), getMyLoan); // Alias for frontend polling compatibility
router.post('/upload-slip', authenticateJwt, authorizeRoles(UserRole.BORROWER), upload.single('file'), uploadSalarySlip);

export default router;
