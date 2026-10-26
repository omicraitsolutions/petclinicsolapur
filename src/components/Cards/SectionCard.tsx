import React from 'react';

export interface SectionCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  icon,
  headerAction,
  children,
  className = '',
  bodyClassName = 'p-6'
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-100/80 overflow-hidden ${className}`}>
      {(title || headerAction) && (
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2.5">
            {icon && <span className="text-[#0F6B63] flex items-center">{icon}</span>}
            <div>
              {title && <h2 className="text-base font-bold text-slate-800 tracking-tight">{title}</h2>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
};
