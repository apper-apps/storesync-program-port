import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import StoreConnectionCard from '@/components/organisms/StoreConnectionCard';
import storeService from '@/services/api/storeService';

const StoreSetup = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await storeService.getAll();
      setStores(data);
    } catch (err) {
      setError(err.message || 'Failed to load stores');
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const handleStoreUpdate = (updatedStore) => {
    setStores(prevStores => {
      const existingIndex = prevStores.findIndex(s => s.Id === updatedStore.Id);
      if (existingIndex >= 0) {
        const newStores = [...prevStores];
        newStores[existingIndex] = updatedStore;
        return newStores;
      } else {
        return [...prevStores, updatedStore];
      }
    });
    setShowAddForm(false);
  };

  const handleStoreDelete = (storeId) => {
    setStores(prevStores => prevStores.filter(s => s.Id !== storeId));
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-8">
          <div className="w-48 h-8 bg-surface-700 rounded animate-pulse mb-2"></div>
          <div className="w-96 h-4 bg-surface-700 rounded animate-pulse"></div>
        </div>
        
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <SkeletonLoader key={i} type="card" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to load stores"
          message={error}
          onRetry={loadStores}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Store Setup</h1>
          <p className="text-surface-400">
            Connect and manage your Shopify and WooCommerce stores
          </p>
        </div>
        
        <Button
          variant="primary"
          icon="Plus"
          onClick={() => setShowAddForm(true)}
        >
          Add Store
        </Button>
      </div>

      {/* Connection Status Overview */}
      {stores.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-surface border border-surface-700 rounded-lg p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Connection Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
              <p className="text-2xl font-bold text-success">
                {stores.filter(s => s.status === 'connected').length}
              </p>
              <p className="text-sm text-success/80">Connected</p>
            </div>
            
            <div className="text-center p-4 bg-danger/10 rounded-lg border border-danger/20">
              <p className="text-2xl font-bold text-danger">
                {stores.filter(s => s.status === 'error').length}
              </p>
              <p className="text-sm text-danger/80">Errors</p>
            </div>
            
            <div className="text-center p-4 bg-surface-700 rounded-lg">
              <p className="text-2xl font-bold text-white">
                {stores.reduce((sum, store) => sum + (store.productCount || 0), 0)}
              </p>
              <p className="text-sm text-surface-400">Total Products</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Store Connections */}
      <div className="space-y-6">
        {/* Add New Store Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <StoreConnectionCard
              onUpdate={handleStoreUpdate}
              onCancel={() => setShowAddForm(false)}
            />
          </motion.div>
        )}

        {/* Existing Stores */}
        {stores.length > 0 ? (
          <div className="grid gap-6">
            {stores.map((store, index) => (
              <motion.div
                key={store.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <StoreConnectionCard
                  store={store}
                  onUpdate={handleStoreUpdate}
                  onDelete={handleStoreDelete}
                />
              </motion.div>
            ))}
          </div>
        ) : !showAddForm && (
          <EmptyState
            icon="Store"
            title="No stores connected"
            description="Connect your first Shopify or WooCommerce store to start managing your products with AI-powered automation."
            actionLabel="Connect Your First Store"
            onAction={() => setShowAddForm(true)}
          />
        )}
      </div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-dark-surface border border-surface-700 rounded-lg p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Setup Guide</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-3 flex items-center">
              <ApperIcon name="Store" className="w-5 h-5 mr-2 text-primary" />
              Shopify Setup
            </h3>
            <ul className="space-y-2 text-sm text-surface-400">
              <li className="flex items-start">
                <ApperIcon name="CheckCircle" className="w-4 h-4 mr-2 mt-0.5 text-accent flex-shrink-0" />
                Go to your Shopify admin → Apps → Manage private apps
              </li>
              <li className="flex items-start">
                <ApperIcon name="CheckCircle" className="w-4 h-4 mr-2 mt-0.5 text-accent flex-shrink-0" />
                Create a private app with read/write product permissions
              </li>
              <li className="flex items-start">
                <ApperIcon name="CheckCircle" className="w-4 h-4 mr-2 mt-0.5 text-accent flex-shrink-0" />
                Copy the API key and enter it above
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-white mb-3 flex items-center">
              <ApperIcon name="ShoppingCart" className="w-5 h-5 mr-2 text-secondary" />
              WooCommerce Setup
            </h3>
            <ul className="space-y-2 text-sm text-surface-400">
              <li className="flex items-start">
                <ApperIcon name="CheckCircle" className="w-4 h-4 mr-2 mt-0.5 text-accent flex-shrink-0" />
                Go to WooCommerce → Settings → Advanced → REST API
              </li>
              <li className="flex items-start">
                <ApperIcon name="CheckCircle" className="w-4 h-4 mr-2 mt-0.5 text-accent flex-shrink-0" />
                Create a new API key with read/write permissions
              </li>
              <li className="flex items-start">
                <ApperIcon name="CheckCircle" className="w-4 h-4 mr-2 mt-0.5 text-accent flex-shrink-0" />
                Use the consumer key as your API key
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StoreSetup;