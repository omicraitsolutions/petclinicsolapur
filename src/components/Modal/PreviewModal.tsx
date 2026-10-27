import React, { useEffect } from 'react';
import { X } from 'lucide-react';

// One popup card used for every "preview" in the app (lab reports, saved
// forms) so they always look and behave the same: same size, header, scroll
// behaviour and footer. Content is clipped to the card, so both images and
// PDFs/forms fit the same fixed frame.

interface PreviewModalProps {
  title: string;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ title, subtitle, icon, onClose, children, footer }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-3xl h-[85vh] max-h-[820px] flex flex-col overflow-hidden"
      >
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50 shrink-0">
          {icon && (
            <div className="w-9 h-9 rounded-lg bg-[#E8F8F0] text-[#0F6B63] flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-slate-800 truncate">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 truncate mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 p-1.5 rounded-md cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 relative bg-slate-100 overflow-hidden">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-slate-100 bg-white shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
