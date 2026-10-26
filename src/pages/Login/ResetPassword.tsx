import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const MIN_LENGTH = 8;

export const ResetPassword: React.FC = () => {
  const { isAuthenticated, updatePassword, clinicSettings } = useApp();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_LENGTH) {
      setError(`Password must be at least ${MIN_LENGTH} characters long.`);
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    setError('');
    setIsSaving(true);
    const result = await updatePassword(password);
    setIsSaving(false);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error || 'Could not update the password. Please try again.');
    }
  };

  const inputClass =
    'w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 text-sm rounded-lg pl-10 pr-3.5 py-2.5 focus:border-[#0F6B63] focus:ring-2 focus:ring-[#0F6B63]/20 outline-none transition-colors';

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-4 font-['Poppins']">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md p-8 sm:p-10">
        {clinicSettings.logoUrl && (
          <img src={clinicSettings.logoUrl} alt="" className="w-16 h-16 object-contain mx-auto mb-4" />
        )}

        {!isAuthenticated ? (
          <div className="text-center">
            <h1 className="text-xl font-extrabold text-slate-800">Link expired</h1>
            <p className="text-sm text-slate-500 mt-2">
              This password reset link is invalid or has expired. Please request a new one from the login page.
            </p>
            <Link
              to="/login"
              className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-[#0F6B63] hover:bg-[#0c5750] text-white text-sm font-semibold"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Set a new password</h1>
            <p className="text-sm text-slate-500 mt-1.5 mb-6">Choose a password you have not used before.</p>

            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 px-4 bg-[#0F6B63] hover:bg-[#0c5750] text-white font-semibold text-sm rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-70"
              >
                {isSaving ? 'Saving...' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
