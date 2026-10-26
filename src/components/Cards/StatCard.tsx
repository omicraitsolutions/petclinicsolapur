import React from 'react';

export interface StatCardProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  trend?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center transition-all duration-200 hover:shadow-md hover:border-slate-200 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-[#0F6B63] mb-3 transition-transform hover:scale-110">
        {icon}
      </div>
      <div className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1 font-['Poppins']">
        {value}
      </div>
      <div className="text-xs font-medium text-slate-500 tracking-wide uppercase">
        {label}
      </div>
    </div>
  );
};
