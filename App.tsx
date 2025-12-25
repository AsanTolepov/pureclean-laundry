// App.tsx
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import CustomerForm from './pages/CustomerForm';
import CustomerHome from './pages/CustomerHome';
import CustomerConfirmation from './pages/CustomerConfirmation';

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminEmployeesPage from './pages/AdminEmployeesPage';
import AdminExpensesPage from './pages/AdminExpensesPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminProfilePage from './pages/AdminProfilePage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminOrderDetails from './pages/AdminOrderDetails';
import AdminDailyReportPage from './pages/AdminDailyReportPage';

import SuperAdminDashboard from './pages/SuperAdminDashboard';

// Oddiy admin uchun guard
const RequireAdmin: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const isAuthed =
    typeof window !== 'undefined' &&
    localStorage.getItem('isAdminAuthed') === 'true';

  if (!isAuthed) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Super admin uchun guard
const RequireSuperAdmin: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const isAuthed =
    typeof window !== 'undefined' &&
    localStorage.getItem('isSuperAdminAuthed') === 'true';

  if (!isAuthed) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Mijoz tomon */}
        <Route path="/" element={<CustomerForm />} />
        <Route path="/welcome" element={<CustomerHome />} />
        <Route path="/new-order" element={<CustomerForm />} />

        {/* ❗ QR uchun companyId bilan maxsus route */}
        <Route path="/c/:companyId/new-order" element={<CustomerForm />} />

        <Route path="/confirmation/:id" element={<CustomerConfirmation />} />

        {/* Admin login */}
        <Route path="/login" element={<AdminLogin />} />

        {/* Oddiy admin */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <RequireAdmin>
              <AdminOrdersPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <RequireAdmin>
              <AdminEmployeesPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/expenses"
          element={
            <RequireAdmin>
              <AdminExpensesPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <RequireAdmin>
              <AdminReportsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <RequireAdmin>
              <AdminProfilePage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <RequireAdmin>
              <AdminSettingsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/order/:id"
          element={
            <RequireAdmin>
              <AdminOrderDetails />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/daily/:date"
          element={
            <RequireAdmin>
              <AdminDailyReportPage />
            </RequireAdmin>
          }
        />

        {/* Super admin */}
        <Route
          path="/superadmin"
          element={
            <RequireSuperAdmin>
              <SuperAdminDashboard />
            </RequireSuperAdmin>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;