import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: (string | SelectOption)[];
  error?: string;
  helperText?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  options,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full appearance-none bg-[#F8FAFC] border text-slate-800 text-sm rounded-lg px-3.5 py-2.5 pr-8 min-h-[42px] transition-colors duration-150 outline-none
            ${error ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#0F6B63] focus:ring-2 focus:ring-[#0F6B63]/20 focus:bg-white'}
            ${props.disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}
            ${className}`}
          {...props}
        >
          {options.map((opt, index) => {
            const value = typeof opt === 'string' ? opt : opt.value;
            const text = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={index} value={value}>
                {text}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-400 mt-0.5">{helperText}</p>}
    </div>
  );
};
