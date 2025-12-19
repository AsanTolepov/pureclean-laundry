// src/App.tsx
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import CustomerHome from './pages/CustomerHome';
import CustomerForm from './pages/CustomerForm';
import CustomerConfirmation from './pages/CustomerConfirmation';

import AdminDashboard from './pages/AdminDashboard';
import AdminOrderDetails from './pages/AdminOrderDetails';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminEmployeesPage from './pages/AdminEmployeesPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminLogin from './pages/AdminLogin';

import { MOCK_ORDERS } from './constants';

// Admin kirish tekshiruvchi kichik komponent
const RequireAdmin: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const isAuthed =
    typeof window !== 'undefined' &&
    localStorage.getItem('isAdminAuthed') === 'true';

  if (!isAuthed) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App: React.FC = () => {
  useEffect(() => {
    if (!localStorage.getItem('orders')) {
      localStorage.setItem('orders', JSON.stringify(MOCK_ORDERS));
    }
  }, []);

  return (
    <HashRouter>
      <Routes>
        {/* Mijozlar portali – to‘g‘ridan-to‘g‘ri forma */}
        <Route path="/" element={<CustomerForm />} />
        <Route path="/welcome" element={<CustomerHome />} />
        <Route path="/new-order" element={<CustomerForm />} />
        <Route path="/confirmation/:id" element={<CustomerConfirmation />} />

        {/* Admin login sahifasi */}
        <Route path="/login" element={<AdminLogin />} />

        {/* Admin portali – faqat login bo‘lsa kiradi */}
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
          path="/admin/reports"
          element={
            <RequireAdmin>
              <AdminReportsPage />
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;