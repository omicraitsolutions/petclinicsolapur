import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { Navbar } from '../components/Navbar/Navbar';
import { ToastContainer } from '../components/Toast/Toast';
import { useApp } from '../context/AppContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  pets: 'Pet Management',
  'register-pet': 'Register New Pet',
  'add-pet': 'Register New Pet',
  'pet-profile': 'Pet Profile',
  owners: 'Owner Management',
  treatments: 'Treatment Details',
  treatment: 'Treatment Details',
  'treatment-history': 'Treatment History',
  appointments: 'Appointment Management',
  billing: 'Billing & Invoices',
  forms: 'Forms',
  'lab-reports': 'Lab Reports',
  reports: 'Reports & Analytics',
  'email-report': 'Email Treatment Report',
  settings: 'Clinic Settings'
};

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { clinicSettings } = useApp();
  const isOnline = useOnlineStatus();

  const clinicName = clinicSettings.clinicName || 'Pet Hospital Solapur';
  const segment = location.pathname.split('/').filter(Boolean)[0] || 'dashboard';
  const pageTitle = PAGE_TITLES[segment] || clinicName;

  // Shown in the browser tab and in the installed app's window title.
  useEffect(() => {
    document.title = pageTitle === clinicName ? clinicName : `${pageTitle} | ${clinicName}`;
  }, [pageTitle, clinicName]);

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-800 flex">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} title={pageTitle} />

        {!isOnline && (
          <div
            role="status"
            className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-medium px-4 md:px-8 py-2 flex items-center gap-2"
          >
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            <span>You are offline. Changes cannot be saved until the internet connection is back.</span>
          </div>
        )}

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
