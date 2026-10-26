import React from 'react';

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  error,
  helperText,
  className = '',
  rows = 3,
  id,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`w-full bg-[#F8FAFC] border text-slate-800 text-sm rounded-lg px-3.5 py-2.5 transition-colors duration-150 outline-none
          ${error ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#0F6B63] focus:ring-2 focus:ring-[#0F6B63]/20 focus:bg-white'}
          ${props.disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-400 mt-0.5">{helperText}</p>}
    </div>
  );
};
