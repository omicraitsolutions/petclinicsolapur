import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = '127.0.0.1:5500 says',
  message = 'Pet Registered Successfully!',
  buttonText = 'OK'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 text-center transform transition-all animate-scaleUp">
        <div className="text-xs font-semibold text-slate-400 mb-2">{title}</div>
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="text-base font-semibold text-slate-800 mb-6">{message}</div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-2 bg-[#0284C7] hover:bg-[#0369a1] text-white font-medium rounded-lg text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0284C7]/40 cursor-pointer min-w-[100px]"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};
