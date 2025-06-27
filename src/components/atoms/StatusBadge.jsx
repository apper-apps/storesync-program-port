import ApperIcon from '@/components/ApperIcon';
import { getStatusColor } from '@/utils/helpers';

const StatusBadge = ({ status, icon, children, className = '' }) => {
  const statusClasses = getStatusColor(status);
  
  const statusIcons = {
    connected: 'CheckCircle',
    disconnected: 'XCircle',
    error: 'AlertCircle',
    active: 'CheckCircle',
    inactive: 'Circle',
    pending: 'Clock',
    processing: 'Loader2',
    completed: 'CheckCircle',
    failed: 'XCircle',
    out_of_stock: 'AlertTriangle'
  };
  
  const iconName = icon || statusIcons[status] || 'Circle';
  const isProcessing = status === 'processing';
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses} ${className}`}>
      <ApperIcon 
        name={iconName} 
        className={`w-3 h-3 mr-1 flex-shrink-0 ${isProcessing ? 'animate-spin' : ''}`} 
      />
      {children || status}
    </span>
  );
};

export default StatusBadge;