import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { PawPrint, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabaseClient';
import { friendlyError } from '../../utils/errors';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const { login, clinicSettings, isAuthenticated } = useApp();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setError('');
    setInfo('');
    setIsLoading(true);

    const result = await login(email, password);

    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Unable to log in. Please check your credentials.');
    }
  };

  const handleForgotPassword = async () => {
    setInfo('');
    if (!email) {
      setError('Enter your email address above first, then tap "Forgot Password?"');
      return;
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (resetError) {
      setError(friendlyError(resetError, 'Could not send the reset link. Please try again.'));
    } else {
      setError('');
      setInfo('A password reset link has been sent to your email address.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-['Poppins']">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 border border-slate-100 min-h-[520px]">
        {/* Left Side: Dark Teal Brand Container */}
        <div className="bg-[#0F6B63] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Top Brand */}
          <div className="z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-inner overflow-hidden shrink-0 p-1">
                {clinicSettings.logoUrl ? (
                  <img src={clinicSettings.logoUrl} alt="Clinic logo" className="w-full h-full object-contain" />
                ) : (
                  <PawPrint className="w-6 h-6 text-[#F97316] fill-[#F97316]" />
                )}
              </div>
              <span className="text-2xl font-black tracking-tight">{clinicSettings.clinicName || 'Pet Hospital Solapur'}</span>
            </div>
            <p className="text-white/85 text-sm sm:text-base leading-relaxed max-w-xs font-normal">
              Manage Pets, Treatments, Appointments and Medical Records.
            </p>
          </div>

          {/* Center Dog Illustration Card */}
          <div className="my-6 z-10 flex items-center justify-center">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-white p-4 shadow-2xl flex items-center justify-center overflow-hidden">
              {clinicSettings.logoUrl ? (
                <img src={clinicSettings.logoUrl} alt="" className="w-full h-full object-contain" />
              ) : (
                <PawPrint className="w-20 h-20 text-[#F97316] fill-[#F97316]" />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="z-10 text-xs text-white/70">
            <span>© {new Date().getFullYear()} {clinicSettings.clinicName || 'Pet Hospital Solapur'}</span>
          </div>

          {/* Background Decorative Rings */}
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
              Please login to continue
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              {info}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Email
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="username"
                  required
                  className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 text-sm rounded-lg pl-10 pr-3.5 py-2.5 focus:border-[#0F6B63] focus:ring-2 focus:ring-[#0F6B63]/20 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 text-sm rounded-lg pl-10 pr-10 py-2.5 focus:border-[#0F6B63] focus:ring-2 focus:ring-[#0F6B63]/20 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end pt-1 text-xs">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[#0F6B63] hover:underline font-semibold cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#0F6B63] hover:bg-[#0c5750] text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <span>Logging in...</span>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};