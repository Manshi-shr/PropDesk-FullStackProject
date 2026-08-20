export function formatINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRCompact(amount: number | undefined | null): string {
  if (!amount || isNaN(amount)) return '₹0';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return `₹${amount}`;
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  try {
    const now = new Date().getTime();
    const past = new Date(dateStr).getTime();
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 30) return `${diffDay}d ago`;
    return formatDate(dateStr);
  } catch {
    return '';
  }
}

export function getPriorityBadgeVariant(priority: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  switch (priority?.toUpperCase()) {
    case 'URGENT':
      return 'danger';
    case 'HIGH':
      return 'danger';
    case 'MEDIUM':
      return 'warning';
    case 'LOW':
      return 'neutral';
    default:
      return 'info';
  }
}

export function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
    case 'OCCUPIED':
    case 'PAID':
    case 'RESOLVED':
    case 'CLOSED':
      return 'success';
    case 'PENDING':
    case 'UPCOMING':
    case 'IN_PROGRESS':
    case 'ACKNOWLEDGED':
    case 'PARTIAL':
      return 'warning';
    case 'OVERDUE':
    case 'REJECTED':
    case 'TERMINATED':
    case 'URGENT':
      return 'danger';
    case 'AVAILABLE':
    case 'OPEN':
    case 'RESERVED':
      return 'info';
    case 'MAINTENANCE':
    case 'EXPIRED':
    default:
      return 'neutral';
  }
}
