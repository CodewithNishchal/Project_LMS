import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { UserRole } from './types';
import { useAuth } from './context/AuthContext';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { StaffRegisterPage } from './pages/auth/StaffRegisterPage';
import { ApplyPage } from './pages/borrower/ApplyPage';
import { BorrowerDashboard } from './pages/borrower/BorrowerDashboard';
import { SalesDashboard } from './pages/dashboard/SalesDashboard';
import { SanctionDashboard } from './pages/dashboard/SanctionDashboard';
import { DisbursementDashboard } from './pages/dashboard/DisbursementDashboard';
import { CollectionDashboard } from './pages/dashboard/CollectionDashboard';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

const App: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const getDefaultRedirect = () => {
    if (!user) return '/login';
    switch (user.role) {
      case UserRole.BORROWER:
        return '/borrower/dashboard';
      case UserRole.SALES:
        return '/dashboard/sales';
      case UserRole.SANCTION:
        return '/dashboard/sanction';
      case UserRole.DISBURSEMENT:
        return '/dashboard/disbursement';
      case UserRole.COLLECTION:
        return '/dashboard/collection';
      case UserRole.ADMIN:
        return '/dashboard/admin';
      default:
        return '/login';
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/staff" element={<StaffRegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Central Dashboard Route Redirect */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                UserRole.BORROWER,
                UserRole.SALES,
                UserRole.SANCTION,
                UserRole.DISBURSEMENT,
                UserRole.COLLECTION,
                UserRole.ADMIN,
              ]}
            >
              <Navigate to={getDefaultRedirect()} replace />
            </ProtectedRoute>
          }
        />

        {/* Borrower Routes */}
        <Route element={<ProtectedRoute allowedRoles={[UserRole.BORROWER]} />}>
          <Route path="/apply" element={<ApplyPage />} />
          <Route path="/borrower/dashboard" element={<BorrowerDashboard />} />
        </Route>

        {/* Sales Executive Queue */}
        <Route element={<ProtectedRoute allowedRoles={[UserRole.SALES, UserRole.ADMIN]} />}>
          <Route path="/dashboard/sales" element={<SalesDashboard />} />
        </Route>

        {/* Sanction Officer Queue */}
        <Route element={<ProtectedRoute allowedRoles={[UserRole.SANCTION, UserRole.ADMIN]} />}>
          <Route path="/dashboard/sanction" element={<SanctionDashboard />} />
        </Route>

        {/* Disbursement Release Queue */}
        <Route element={<ProtectedRoute allowedRoles={[UserRole.DISBURSEMENT, UserRole.ADMIN]} />}>
          <Route path="/dashboard/disbursement" element={<DisbursementDashboard />} />
        </Route>

        {/* Collection & Recovery Queue */}
        <Route element={<ProtectedRoute allowedRoles={[UserRole.COLLECTION, UserRole.ADMIN]} />}>
          <Route path="/dashboard/collection" element={<CollectionDashboard />} />
        </Route>

        {/* Admin Dashboard */}
        <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? getDefaultRedirect() : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
