import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const FormField = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  placeholder,
  icon,
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const fieldId = `field-${Math.random().toString(36).substring(2)}`;
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-surface-300">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <ApperIcon name={icon} className="w-4 h-4 text-surface-400" />
          </div>
        )}
        
        <motion.input
          id={fieldId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 bg-dark-surface border rounded-lg text-white placeholder-surface-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
            error 
              ? 'border-danger focus:ring-danger/50' 
              : 'border-surface-600 focus:ring-primary/50 focus:border-primary'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          whileFocus={{ scale: 1.01 }}
          {...props}
        />
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-danger flex items-center space-x-1"
        >
          <ApperIcon name="AlertCircle" className="w-3 h-3" />
          <span>{error}</span>
        </motion.p>
      )}
    </div>
  );
};

export default FormField;