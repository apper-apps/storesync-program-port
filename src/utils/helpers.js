export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

export const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

export const getStatusColor = (status) => {
  const colors = {
    connected: 'text-success bg-success/10',
    disconnected: 'text-surface-400 bg-surface-400/10',
    error: 'text-danger bg-danger/10',
    active: 'text-success bg-success/10',
    inactive: 'text-surface-400 bg-surface-400/10',
    pending: 'text-warning bg-warning/10',
    processing: 'text-info bg-info/10',
    completed: 'text-success bg-success/10',
    failed: 'text-danger bg-danger/10',
    out_of_stock: 'text-danger bg-danger/10'
  };
  return colors[status] || 'text-surface-400 bg-surface-400/10';
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};