import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  PawPrint,
  PlusCircle,
  FileBadge,
  Users,
  Stethoscope,
  Calendar,
  Receipt,
  BarChart2,
  Mail,
  Settings,
  LogOut,
  FileText,
  FlaskConical,
  ChevronDown,
  MoreHorizontal,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, clinicSettings } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  // Primary items: used daily, always visible.
  const primaryNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <Home className="w-4 h-4" /> },
    { label: 'Pets', path: '/pets', icon: <PawPrint className="w-4 h-4" /> },
    { label: 'Treatments', path: '/treatments', icon: <Stethoscope className="w-4 h-4" /> },
    { label: 'Appointments', path: '/appointments', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Forms', path: '/forms', icon: <FileText className="w-4 h-4" /> },
    { label: 'Billing', path: '/billing', icon: <Receipt className="w-4 h-4" /> },
    { label: 'Email Report', path: '/email-report', icon: <Mail className="w-4 h-4" /> }
  ];

  // Secondary items: used occasionally, tucked under "More".
  const moreNavItems = [
    { label: 'Add Pet', path: '/register-pet', icon: <PlusCircle className="w-4 h-4" /> },
    { label: 'Pet Profile', path: '/pet-profile', icon: <FileBadge className="w-4 h-4" /> },
    { label: 'Owners', path: '/owners', icon: <Users className="w-4 h-4" /> },
    { label: 'Lab Reports', path: '/lab-reports', icon: <FlaskConical className="w-4 h-4" /> },
    { label: 'Reports', path: '/reports', icon: <BarChart2 className="w-4 h-4" /> },
    { label: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const isItemActive = (path: string) =>
    location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));

  const isMoreActive = moreNavItems.some(item => isItemActive(item.path));
  const [isMoreOpen, setIsMoreOpen] = useState(isMoreActive);

  // Keep "More" expanded whenever navigation lands on one of its items
  // (e.g. clicking "Edit Profile" on a Pet Profile page jumps to Add Pet's
  // route) so the active item is never hidden inside a collapsed section.
  useEffect(() => {
    if (isMoreActive) setIsMoreOpen(true);
  }, [isMoreActive]);

  const renderNavLink = (item: { label: string; path: string; icon: React.ReactNode }, indent = false) => {
    const isActive = isItemActive(item.path);
    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={onClose}
        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-150 group ${
          indent ? 'ml-2' : ''
        } ${
          isActive
            ? 'bg-[#158076] text-white shadow-xs font-semibold'
            : 'text-white/80 hover:text-white hover:bg-[#12756c]'
        }`}
      >
        <span
          className={`transition-colors ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}
        >
          {item.icon}
        </span>
        <span className="truncate">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-60 bg-[#0F6B63] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-xl lg:shadow-none`}
      >
        {/* Brand Header */}
        <div className="min-h-16 flex items-center justify-between gap-2 px-6 py-3 border-b border-[#147a71]/40 shrink-0">
          <div
            onClick={() => {
              navigate('/dashboard');
              onClose();
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none group min-w-0"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform overflow-hidden shrink-0 p-0.5">
              {clinicSettings.logoUrl ? (
                <img src={clinicSettings.logoUrl} alt="Clinic logo" className="w-full h-full object-contain" />
              ) : (
                <PawPrint className="w-5 h-5 text-[#F97316] fill-[#F97316]" />
              )}
            </div>
            {/* Wraps a multi-word clinic name onto a second line instead of truncating it */}
            <span className="font-extrabold text-base leading-tight tracking-tight font-['Poppins'] break-words max-w-[120px]">
              {clinicSettings.clinicName || 'Pet Hospital'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-white/70 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav list */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 sidebar-nav-scroll">
          {primaryNavItems.map(item => renderNavLink(item))}

          {/* More (collapsible) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsMoreOpen(prev => !prev)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-150 group cursor-pointer ${
                isMoreActive && !isMoreOpen
                  ? 'bg-[#158076]/60 text-white'
                  : 'text-white/80 hover:text-white hover:bg-[#12756c]'
              }`}
            >
              <span className={`transition-colors ${isMoreActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                <MoreHorizontal className="w-4 h-4" />
              </span>
              <span className="truncate flex-1 text-left">More</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-white/60 transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-200 ease-in-out ${
                isMoreOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="space-y-1 border-l border-white/15 ml-3.5 pl-1">
                {moreNavItems.map(item => renderNavLink(item, true))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom / Logout */}
        <div className="p-3 border-t border-[#147a71]/40 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs md:text-sm font-medium text-white/80 hover:text-white hover:bg-[#12756c] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-white/70" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};