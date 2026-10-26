export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export const getStatusBadgeStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'healthy':
    case 'recovered':
    case 'paid':
    case 'confirmed':
      return {
        bg: 'bg-[#E8F8F0]',
        text: 'text-[#1E8E5A]',
        border: 'border-[#bbf0d7]'
      };
    case 'treatment':
    case 'pending':
      return {
        bg: 'bg-[#FEF6E6]',
        text: 'text-[#D97706]',
        border: 'border-[#fde68a]'
      };
    case 'arrived':
      return {
        bg: 'bg-[#F3E8FF]',
        text: 'text-[#7E22CE]',
        border: 'border-[#e9d5ff]'
      };
    case 'critical':
    case 'overdue':
    case 'cancelled':
      return {
        bg: 'bg-[#FEEAEA]',
        text: 'text-[#DC2626]',
        border: 'border-[#fecaca]'
      };
    case 'done':
    case 'completed':
      return {
        bg: 'bg-[#E0F2FE]',
        text: 'text-[#0284C7]',
        border: 'border-[#bae6fd]'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200'
      };
  }
};