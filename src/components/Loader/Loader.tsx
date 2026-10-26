import React from 'react';

export const Loader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 gap-3 text-slate-500">
      <div className="w-8 h-8 border-3 border-[#0F6B63]/20 border-t-[#0F6B63] rounded-full animate-spin"></div>
      <p className="text-xs font-medium tracking-wide uppercase">{message}</p>
    </div>
  );
};
