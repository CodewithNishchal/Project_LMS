import { Router } from 'express';
import { register, registerStaff, login } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/register/staff', registerStaff);
router.post('/login', login);

export default router;

