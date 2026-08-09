import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db';
import { User, UserRole } from './models/User';
import { Loan, LoanStatus } from './models/Loan';

dotenv.config();

const seed = async () => {
  await connectDB();

  console.log('🌱 Seeding initial staff & mock data into MongoDB...');

  await User.deleteMany({});
  await Loan.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  const users = await User.create([
    { name: 'Nishchal Verma', email: 'borrower@demo.com', password: passwordHash, role: UserRole.BORROWER, phone: '9876543210' },
    { name: 'Rohan Sales Exec', email: 'sales@creditsea.com', password: passwordHash, role: UserRole.SALES, phone: '9812345678' },
    { name: 'Priya Underwriter', email: 'sanction@creditsea.com', password: passwordHash, role: UserRole.SANCTION, phone: '9845012345' },
    { name: 'Amit Disbursal', email: 'disbursement@creditsea.com', password: passwordHash, role: UserRole.DISBURSEMENT, phone: '9811122334' },
    { name: 'Neha Collections', email: 'collection@creditsea.com', password: passwordHash, role: UserRole.COLLECTION, phone: '9898765432' },
    { name: 'System Admin', email: 'admin@creditsea.com', password: passwordHash, role: UserRole.ADMIN, phone: '9900011122' },
  ]);

  const demoBorrower = users[0];

  console.log('✅ Staff Accounts Created (Password: password123):');
  users.forEach((u) => console.log(`   - ${u.role}: ${u.email}`));

  // Create initial Sales Leads & Seeded Demo Borrower Lead
  await Loan.create([
    {
      borrowerId: demoBorrower._id,
      fullName: demoBorrower.name,
      email: demoBorrower.email,
      phone: demoBorrower.phone,
      status: LoanStatus.LEAD,
      auditTrail: [
        {
          action: 'LEAD_CREATED',
          performedBy: demoBorrower.name,
          performedByRole: 'BORROWER',
          timestamp: new Date(),
          notes: 'Pre-seeded demo borrower account initialized in LEAD status.',
        },
      ],
    },
    {
      fullName: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '9812345678',
      status: LoanStatus.LEAD,
      monthlySalary: 65000,
    },
    {
      fullName: 'Ananya Gupta',
      email: 'ananya@example.com',
      phone: '9898765432',
      status: LoanStatus.LEAD,
      monthlySalary: 82000,
    },
  ]);

  console.log('✅ Initial Sales Leads & Demo Borrower Seeded!');
  process.exit(0);
};

seed();
