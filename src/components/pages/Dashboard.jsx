import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import StatCard from '@/components/molecules/StatCard';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import Button from '@/components/atoms/Button';
import StatusBadge from '@/components/atoms/StatusBadge';
import storeService from '@/services/api/storeService';
import productService from '@/services/api/productService';
import syncJobService from '@/services/api/syncJobService';
import { formatRelativeTime } from '@/utils/helpers';

const Dashboard = () => {
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [storeData, productData, jobData] = await Promise.all([
        storeService.getAll(),
        productService.getAll(),
        syncJobService.getRecentActivity(5)
      ]);
      
      setStores(storeData);
      setProducts(productData);
      setRecentJobs(jobData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalStores: stores.length,
    connectedStores: stores.filter(s => s.status === 'connected').length,
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'active').length,
    outOfStock: products.filter(p => p.inventory === 0).length,
    completedJobs: recentJobs.filter(j => j.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-8">
          <div className="w-48 h-8 bg-surface-700 rounded animate-pulse mb-2"></div>
          <div className="w-96 h-4 bg-surface-700 rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <SkeletonLoader key={i} type="card" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader type="table" />
          <SkeletonLoader type="table" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Dashboard Error"
          message={error}
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-surface-400">Welcome to StoreSync AI</p>
        </div>
        
        <EmptyState
          icon="Store"
          title="No stores connected"
          description="Connect your first Shopify or WooCommerce store to get started with automated product management and AI-powered optimization."
          actionLabel="Connect Store"
          onAction={() => window.location.href = '/store-setup'}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-surface-400">
          Monitor your stores and automation status
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Connected Stores"
          value={`${stats.connectedStores}/${stats.totalStores}`}
          change={stats.connectedStores === stats.totalStores ? '100%' : `${Math.round((stats.connectedStores / stats.totalStores) * 100)}%`}
          changeType={stats.connectedStores === stats.totalStores ? 'positive' : 'neutral'}
          icon="Store"
          color="primary"
        />
        
        <StatCard
          title="Active Products"
          value={stats.activeProducts.toLocaleString()}
          change={`${stats.totalProducts - stats.activeProducts} inactive`}
          changeType="neutral"
          icon="Package"
          color="accent"
        />
        
        <StatCard
          title="Out of Stock"
          value={stats.outOfStock}
          change={stats.outOfStock > 0 ? 'Attention needed' : 'All in stock'}
          changeType={stats.outOfStock > 0 ? 'negative' : 'positive'}
          icon="AlertTriangle"
          color={stats.outOfStock > 0 ? 'danger' : 'success'}
        />
        
        <StatCard
          title="Recent Syncs"
          value={stats.completedJobs}
          change="Last 24 hours"
          changeType="positive"
          icon="RefreshCw"
          color="secondary"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-surface border border-surface-700 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Store Status</h2>
            <Button
              variant="outline"
              size="sm"
              icon="Plus"
              onClick={() => window.location.href = '/store-setup'}
            >
              Add Store
            </Button>
          </div>
          
          <div className="space-y-4">
            {stores.map((store, index) => (
              <motion.div
                key={store.Id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-surface-800 rounded-lg hover:bg-surface-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <ApperIcon name="Store" className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{store.name}</h3>
                    <p className="text-sm text-surface-400 capitalize">{store.platform}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <StatusBadge status={store.status} />
                  <p className="text-xs text-surface-500 mt-1">
                    {store.lastSync ? formatRelativeTime(store.lastSync) : 'Never synced'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-surface border border-surface-700 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            <Button
              variant="outline"
              size="sm"
              icon="Clock"
              onClick={() => window.location.href = '/history'}
            >
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentJobs.length > 0 ? recentJobs.map((job, index) => (
              <motion.div
                key={job.Id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-surface-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <ApperIcon 
                      name={job.type.includes('ai') ? 'Bot' : 'RefreshCw'}
                      className="w-5 h-5 text-secondary" 
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{job.title}</h3>
                    <p className="text-sm text-surface-400">
                      {job.details.processed || 0} / {job.details.totalItems || 0} items
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <StatusBadge status={job.status} />
                  <p className="text-xs text-surface-500 mt-1">
                    {formatRelativeTime(job.createdAt)}
                  </p>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-8">
                <ApperIcon name="Activity" className="w-12 h-12 text-surface-400 mx-auto mb-4" />
                <p className="text-surface-400">No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-dark-surface border border-surface-700 rounded-lg p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="primary"
            icon="Upload"
            className="h-16 flex-col"
            onClick={() => window.location.href = '/price-sheets'}
          >
            <span className="font-medium">Upload Price Sheet</span>
            <span className="text-xs opacity-75">Update product data</span>
          </Button>
          
          <Button
            variant="secondary"
            icon="Bot"
            className="h-16 flex-col"
            onClick={() => window.location.href = '/ai-tools'}
          >
            <span className="font-medium">Generate Descriptions</span>
            <span className="text-xs opacity-75">AI-powered content</span>
          </Button>
          
          <Button
            variant="accent"
            icon="RefreshCw"
            className="h-16 flex-col"
            onClick={() => window.location.href = '/product-sync'}
          >
            <span className="font-medium">Sync Products</span>
            <span className="text-xs opacity-75">Update inventory</span>
          </Button>
          
          <Button
            variant="outline"
            icon="Settings"
            className="h-16 flex-col"
            onClick={() => window.location.href = '/store-setup'}
          >
            <span className="font-medium">Configure Stores</span>
            <span className="text-xs opacity-75">Manage connections</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;