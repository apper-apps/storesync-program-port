import { motion } from 'framer-motion';

const SkeletonLoader = ({ count = 1, type = 'card', className = '' }) => {
  const skeletonVariants = {
    card: (
      <div className="bg-dark-surface border border-surface-700 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-surface-700 rounded-lg"></div>
            <div className="w-16 h-4 bg-surface-700 rounded"></div>
          </div>
          <div className="w-20 h-8 bg-surface-700 rounded mb-2"></div>
          <div className="w-32 h-4 bg-surface-700 rounded"></div>
        </div>
      </div>
    ),
    row: (
      <div className="bg-dark-surface border border-surface-700 rounded-lg p-4">
        <div className="animate-pulse flex items-center space-x-4">
          <div className="w-10 h-10 bg-surface-700 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="w-3/4 h-4 bg-surface-700 rounded"></div>
            <div className="w-1/2 h-3 bg-surface-700 rounded"></div>
          </div>
          <div className="w-16 h-6 bg-surface-700 rounded"></div>
        </div>
      </div>
    ),
    table: (
      <div className="bg-dark-surface border border-surface-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-700">
          <div className="animate-pulse flex space-x-4">
            <div className="w-1/4 h-4 bg-surface-700 rounded"></div>
            <div className="w-1/4 h-4 bg-surface-700 rounded"></div>
            <div className="w-1/4 h-4 bg-surface-700 rounded"></div>
            <div className="w-1/4 h-4 bg-surface-700 rounded"></div>
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-surface-700 last:border-b-0">
            <div className="animate-pulse flex space-x-4">
              <div className="w-1/4 h-4 bg-surface-700 rounded"></div>
              <div className="w-1/4 h-4 bg-surface-700 rounded"></div>
              <div className="w-1/4 h-4 bg-surface-700 rounded"></div>
              <div className="w-1/4 h-4 bg-surface-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  };
  
  const items = [...Array(count)].map((_, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={className}
    >
      {skeletonVariants[type]}
    </motion.div>
  ));
  
  return count === 1 ? items[0] : <div className="space-y-4">{items}</div>;
};

export default SkeletonLoader;