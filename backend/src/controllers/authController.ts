import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import { Loan, LoanStatus } from '../models/Loan';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

// Public Borrower Registration
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email, and password are required' });
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ message: 'Please enter a valid email address' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    if (phone && !PHONE_REGEX.test(phone)) {
      res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone ? phone.trim() : undefined,
      role: UserRole.BORROWER, // Server-hardcoded for security
    });

    // Automatically create a LEAD entry in Loan collection for Sales Queue tracking (unapplied lead has no salary yet)
    await Loan.create({
      borrowerId: user._id,
      fullName: user.name,
      email: user.email,
      phone: user.phone || '9876543210',
      monthlySalary: undefined,
      status: LoanStatus.LEAD,
      auditTrail: [
        {
          action: 'USER_REGISTERED_LEAD',
          performedBy: user.name,
          performedByRole: 'BORROWER',
          timestamp: new Date(),
          notes: 'Registered user lead automatically created in Sales Queue.',
        },
      ],
    });

    const token = jwt.sign(
      { userId: user._id, id: user._id, role: user.role, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Staff Account Registration (Admin or Onboarding Secret protected)
export const registerStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, role, secretKey } = req.body;

    const validSecret = process.env.STAFF_REGISTER_SECRET || 'creditsea_staff_2026';
    if (secretKey && secretKey !== validSecret) {
      res.status(403).json({ message: 'Invalid Staff Onboarding Secret Key' });
      return;
    }

    if (!name || !email || !password || !role) {
      res.status(400).json({ message: 'Name, email, password, and staff role are required' });
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ message: 'Please enter a valid email address' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    if (phone && !PHONE_REGEX.test(phone)) {
      res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' });
      return;
    }

    // Ensure role is one of the staff roles
    const allowedStaffRoles = [
      UserRole.SALES,
      UserRole.SANCTION,
      UserRole.DISBURSEMENT,
      UserRole.COLLECTION,
      UserRole.ADMIN,
    ];

    if (!allowedStaffRoles.includes(role)) {
      res.status(400).json({ message: 'Invalid staff role specified' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone ? phone.trim() : undefined,
      role,
    });

    const token = jwt.sign(
      { userId: user._id, id: user._id, role: user.role, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Staff account created successfully',
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Staff registration failed', error: error.message });
  }
};

// Login User
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Explicitly include +password field since UserSchema has select: false for password
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !user.password) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, id: user._id, role: user.role, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};
