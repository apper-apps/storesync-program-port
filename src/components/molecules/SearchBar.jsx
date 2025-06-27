import { useState } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const SearchBar = ({ 
  placeholder = 'Search...', 
  onSearch, 
  className = '',
  debounceMs = 300 
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const handleSearch = (value) => {
    setQuery(value);
    if (onSearch) {
      // Simple debounce
      clearTimeout(window.searchTimeout);
      window.searchTimeout = setTimeout(() => {
        onSearch(value);
      }, debounceMs);
    }
  };
  
  const clearSearch = () => {
    setQuery('');
    if (onSearch) {
      onSearch('');
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <ApperIcon 
          name="Search" 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400" 
        />
        
        <motion.input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full pl-10 pr-10 py-2.5 bg-dark-surface border border-surface-600 rounded-lg text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
            isFocused ? 'shadow-lg' : ''
          }`}
          whileFocus={{ scale: 1.01 }}
        />
        
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-surface-600 rounded-full transition-colors"
          >
            <ApperIcon name="X" className="w-3 h-3 text-surface-400" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;