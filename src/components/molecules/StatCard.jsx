import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon, 
  color = 'primary',
  loading = false,
  className = '' 
}) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger'
  };
  
  const changeColors = {
    positive: 'text-success',
    negative: 'text-danger',
    neutral: 'text-surface-400'
  };
  
  const changeIcons = {
    positive: 'TrendingUp',
    negative: 'TrendingDown',
    neutral: 'Minus'
  };
  
  if (loading) {
    return (
      <div className={`bg-dark-surface border border-surface-700 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 bg-surface-700 rounded-lg"></div>
            <div className="w-16 h-4 bg-surface-700 rounded"></div>
          </div>
          <div className="w-20 h-8 bg-surface-700 rounded mb-2"></div>
          <div className="w-24 h-4 bg-surface-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-dark-surface border border-surface-700 rounded-lg p-6 hover:border-surface-600 transition-all duration-200 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <ApperIcon name={icon} className="w-5 h-5" />
        </div>
        
        {change && (
          <div className={`flex items-center space-x-1 ${changeColors[changeType]}`}>
            <ApperIcon name={changeIcons[changeType]} className="w-3 h-3" />
            <span className="text-xs font-medium">{change}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-surface-400">{title}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;