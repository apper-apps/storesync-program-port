import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import StatusBadge from '@/components/atoms/StatusBadge';
import FormField from '@/components/molecules/FormField';
import { formatRelativeTime } from '@/utils/helpers';
import storeService from '@/services/api/storeService';

const StoreConnectionCard = ({ store, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [formData, setFormData] = useState({
    name: store?.name || '',
    platform: store?.platform || 'shopify',
    apiUrl: store?.apiUrl || '',
    apiKey: store?.apiKey || ''
  });

  const handleSave = async () => {
    if (!formData.name || !formData.apiUrl || !formData.apiKey) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      let result;
      if (store) {
        result = await storeService.update(store.Id, formData);
        toast.success('Store connection updated successfully');
      } else {
        result = await storeService.create(formData);
        toast.success('Store connection created successfully');
      }
      
      if (onUpdate) {
        onUpdate(result);
      }
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || 'Failed to save store connection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!store) {
      toast.error('Please save the store connection first');
      return;
    }

    setTestingConnection(true);
    try {
      await storeService.testConnection(store.Id);
      toast.success('Connection test successful!');
    } catch (error) {
      toast.error(error.message || 'Connection test failed');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleDelete = async () => {
    if (!store || !window.confirm('Are you sure you want to delete this store connection?')) {
      return;
    }

    setIsLoading(true);
    try {
      await storeService.delete(store.Id);
      toast.success('Store connection deleted successfully');
      if (onDelete) {
        onDelete(store.Id);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete store connection');
    } finally {
      setIsLoading(false);
    }
  };

  const platformIcons = {
    shopify: 'Store',
    woocommerce: 'ShoppingCart'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-surface border border-surface-700 rounded-lg p-6 hover:border-surface-600 transition-all duration-200"
    >
      {!isEditing && store ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <ApperIcon 
                  name={platformIcons[store.platform]} 
                  className="w-5 h-5 text-primary" 
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{store.name}</h3>
                <p className="text-sm text-surface-400 capitalize">{store.platform}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <StatusBadge status={store.status} />
              <Button
                variant="ghost"
                size="sm"
                icon="Edit"
                onClick={() => setIsEditing(true)}
              />
              <Button
                variant="ghost"
                size="sm"
                icon="Trash2"
                onClick={handleDelete}
                loading={isLoading}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-surface-800 rounded-lg">
              <p className="text-2xl font-bold text-white">{store.productCount || 0}</p>
              <p className="text-xs text-surface-400">Products</p>
            </div>
            <div className="text-center p-3 bg-surface-800 rounded-lg">
              <p className="text-sm font-medium text-white">
                {store.lastSync ? formatRelativeTime(store.lastSync) : 'Never'}
              </p>
              <p className="text-xs text-surface-400">Last Sync</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              variant="primary"
              size="sm"
              icon="RefreshCw"
              onClick={handleTestConnection}
              loading={testingConnection}
              className="flex-1"
            >
              Test Connection
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon="Activity"
              className="flex-1"
            >
              View Products
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {store ? 'Edit Store Connection' : 'New Store Connection'}
            </h3>
            {store && (
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={() => setIsEditing(false)}
              />
            )}
          </div>

          <div className="space-y-4">
            <FormField
              label="Store Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Store"
              required
            />

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Platform <span className="text-danger">*</span>
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3 py-2.5 bg-dark-surface border border-surface-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              >
                <option value="shopify">Shopify</option>
                <option value="woocommerce">WooCommerce</option>
              </select>
            </div>

            <FormField
              label="API URL"
              value={formData.apiUrl}
              onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
              placeholder={formData.platform === 'shopify' ? 'your-store.myshopify.com' : 'yourstore.com'}
              required
            />

            <FormField
              label="API Key"
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder="Enter your API key"
              required
            />

            <div className="flex space-x-2">
              <Button
                variant="primary"
                onClick={handleSave}
                loading={isLoading}
                className="flex-1"
              >
                {store ? 'Update Connection' : 'Create Connection'}
              </Button>
              {store && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StoreConnectionCard;