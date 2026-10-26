import React from 'react';
import { Search } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = ''
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#F8FAFC] md:bg-white border border-slate-200 text-slate-800 text-sm rounded-lg pl-9 pr-4 py-2 min-h-[38px] transition-colors focus:border-[#0F6B63] focus:ring-2 focus:ring-[#0F6B63]/20 outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 text-slate-400 hover:text-slate-600 text-xs px-1"
        >
          ✕
        </button>
      )}
    </div>
  );
};
