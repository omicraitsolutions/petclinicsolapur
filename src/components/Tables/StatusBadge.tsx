import React from 'react';
import { getStatusBadgeStyle } from '../../utils/formatters';

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const styles = getStatusBadgeStyle(status);

  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-full border whitespace-nowrap transition-colors
        ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
        ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {status}
    </span>
  );
};
