import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Login } from '../pages/Login/Login';
import { Loader } from '../components/Loader/Loader';
import { useApp } from '../context/AppContext';

// Pages are loaded on demand so the first screen opens quickly.
const named = <T extends Record<string, React.ComponentType<any>>>(
  load: () => Promise<T>,
  key: keyof T
) => lazy(() => load().then(m => ({ default: m[key] })));

const ResetPassword = named(() => import('../pages/Login/ResetPassword'), 'ResetPassword');
const Dashboard = named(() => import('../pages/Dashboard/Dashboard'), 'Dashboard');
const PetManagement = named(() => import('../pages/Pets/PetManagement'), 'PetManagement');
const RegisterPet = named(() => import('../pages/RegisterPet/RegisterPet'), 'RegisterPet');
const PetProfile = named(() => import('../pages/PetProfile/PetProfile'), 'PetProfile');
const OwnerManagement = named(() => import('../pages/Owners/OwnerManagement'), 'OwnerManagement');
const TreatmentDetails = named(() => import('../pages/Treatments/TreatmentDetails'), 'TreatmentDetails');
const TreatmentHistory = named(() => import('../pages/Treatments/TreatmentHistory'), 'TreatmentHistory');
const AppointmentManagement = named(() => import('../pages/Appointments/AppointmentManagement'), 'AppointmentManagement');
const BillingManagement = named(() => import('../pages/Billing/BillingManagement'), 'BillingManagement');
const ReportsAnalytics = named(() => import('../pages/Reports/ReportsAnalytics'), 'ReportsAnalytics');
const EmailReport = named(() => import('../pages/EmailReport/EmailReport'), 'EmailReport');
const Settings = named(() => import('../pages/Settings/Settings'), 'Settings');
const FormsCenter = named(() => import('../pages/Forms/FormsCenter'), 'FormsCenter');
const LabReportsOverview = named(() => import('../pages/LabReports/LabReportsOverview'), 'LabReportsOverview');

// Protected layout route
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  const { passwordRecovery } = useApp();
  const location = useLocation();

  // Arriving from a password-reset email always lands on the "set new password" screen.
  if (passwordRecovery && location.pathname !== '/reset-password') {
    return <Navigate to="/reset-password" replace />;
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB]">
          <Loader message="Loading..." />
        </div>
      }
    >
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Main layout with sub-routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pets" element={<PetManagement />} />
          <Route path="register-pet" element={<RegisterPet />} />
          <Route path="add-pet" element={<RegisterPet />} />
          <Route path="pet-profile" element={<PetProfile />} />
          <Route path="owners" element={<OwnerManagement />} />
          <Route path="treatments" element={<TreatmentDetails />} />
          <Route path="treatment" element={<TreatmentDetails />} />
          <Route path="treatment-history" element={<TreatmentHistory />} />
          <Route path="appointments" element={<AppointmentManagement />} />
          <Route path="billing" element={<BillingManagement />} />
          <Route path="forms" element={<FormsCenter />} />
          <Route path="lab-reports" element={<LabReportsOverview />} />
          <Route path="reports" element={<ReportsAnalytics />} />
          <Route path="email-report" element={<EmailReport />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Wildcard fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};
