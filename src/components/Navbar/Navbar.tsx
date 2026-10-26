import React from 'react';
import { Menu, User, Plus, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';

export interface NavbarProps {
  onToggleSidebar: () => void;
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, title }) => {
  const { clinicSettings } = useApp();
  const navigate = useNavigate();
  const { canInstall, install } = useInstallPrompt();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-100 px-4 md:px-8 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title && (
          <h1 className="text-lg md:text-xl font-bold text-slate-800 font-['Poppins']">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Install as a desktop / phone app (only shown when the browser allows it) */}
        {canInstall && (
          <button
            type="button"
            onClick={install}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0F6B63]/30 text-[#0F6B63] hover:bg-[#0F6B63]/10 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {/* Quick Add Pet Button */}
        <button
          type="button"
          onClick={() => navigate('/register-pet')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F6B63]/10 text-[#0F6B63] hover:bg-[#0F6B63]/20 font-semibold text-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Quick Register</span>
        </button>

        {/* Doctor profile pill */}
        <button
          type="button"
          onClick={() => navigate('/settings')}
          title="Clinic settings"
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 cursor-pointer transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[#0F6B63] text-white flex items-center justify-center text-xs font-bold shadow-xs">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 leading-tight">
              {clinicSettings.doctorName || 'Doctor'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Veterinarian</span>
          </div>
        </button>
      </div>
    </header>
  );
};

