import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ProductTable from '@/components/organisms/ProductTable';
import productService from '@/services/api/productService';
import storeService from '@/services/api/storeService';
import syncJobService from '@/services/api/syncJobService';

const ProductSync = () => {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStore, setSelectedStore] = useState('all');
  const [syncingAll, setSyncingAll] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productData, storeData] = await Promise.all([
        productService.getAll(),
        storeService.getAll()
      ]);
      
      setProducts(productData);
      setStores(storeData);
    } catch (err) {
      setError(err.message || 'Failed to load product data');
      toast.error('Failed to load product data');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    try {
      const job = await syncJobService.create({
        type: 'full_sync',
        title: 'Complete Product Synchronization',
        details: {
          totalItems: products.length,
          processed: 0,
          updated: 0,
          created: 0,
          archived: 0,
          errors: 0
        }
      });
      
      await syncJobService.startJob(job.Id);
      toast.success('Product sync started successfully');
      
      // Reload data after a delay to show updated sync status
      setTimeout(() => {
        loadData();
      }, 2000);
    } catch (error) {
      toast.error('Failed to start product sync');
    } finally {
      setSyncingAll(false);
    }
  };

  const handleBulkUpdate = async (selectedProductIds) => {
    try {
      const job = await syncJobService.create({
        type: 'inventory_sync',
        title: `Bulk Update - ${selectedProductIds.length} Products`,
        details: {
          totalItems: selectedProductIds.length,
          processed: 0,
          updated: 0,
          created: 0,
          archived: 0,
          errors: 0
        }
      });
      
      await syncJobService.startJob(job.Id);
      toast.success(`Bulk update started for ${selectedProductIds.length} products`);
    } catch (error) {
      toast.error('Failed to start bulk update');
    }
  };

  const handleProductEdit = (product) => {
    // In a real app, this would open an edit modal or navigate to edit page
    toast.info(`Edit functionality for ${product.title} would open here`);
  };

  const handleProductDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      await productService.delete(productId);
      setProducts(prevProducts => prevProducts.filter(p => p.Id !== productId));
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = selectedStore === 'all' 
    ? products 
    : products.filter(p => p.storeId === parseInt(selectedStore));

  const connectedStores = stores.filter(s => s.status === 'connected');

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-8">
          <div className="w-48 h-8 bg-surface-700 rounded animate-pulse mb-2"></div>
          <div className="w-96 h-4 bg-surface-700 rounded animate-pulse"></div>
        </div>
        
        <SkeletonLoader type="table" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to load products"
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  if (connectedStores.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Product Sync</h1>
          <p className="text-surface-400">Manage and synchronize your product inventory</p>
        </div>
        
        <EmptyState
          icon="Store"
          title="No connected stores"
          description="You need to connect at least one store before you can sync products. Set up your Shopify or WooCommerce connection first."
          actionLabel="Connect Store"
          onAction={() => window.location.href = '/store-setup'}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Product Sync</h1>
          <p className="text-surface-400">
            Manage and synchronize your product inventory across stores
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Button
            variant="accent"
            icon="RefreshCw"
            onClick={handleSyncAll}
            loading={syncingAll}
          >
            Sync All Products
          </Button>
          <Button
            variant="primary"
            icon="Upload"
            onClick={() => window.location.href = '/price-sheets'}
          >
            Upload Price Sheet
          </Button>
        </div>
      </div>

      {/* Store Filter & Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-surface border border-surface-700 rounded-lg p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Filter by Store
              </label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="px-3 py-2 bg-dark-surface border border-surface-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              >
                <option value="all">All Stores</option>
                {connectedStores.map(store => (
                  <option key={store.Id} value={store.Id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{filteredProducts.length}</p>
              <p className="text-xs text-surface-400">Total Products</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">
                {filteredProducts.filter(p => p.status === 'active').length}
              </p>
              <p className="text-xs text-surface-400">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-danger">
                {filteredProducts.filter(p => p.inventory === 0).length}
              </p>
              <p className="text-xs text-surface-400">Out of Stock</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Product Table */}
      {filteredProducts.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ProductTable
            products={filteredProducts}
            onEdit={handleProductEdit}
            onDelete={handleProductDelete}
            onBulkUpdate={handleBulkUpdate}
          />
        </motion.div>
      ) : (
        <EmptyState
          icon="Package"
          title="No products found"
          description={
            selectedStore === 'all' 
              ? "No products are currently synced from your connected stores. Upload a price sheet or run a full sync to populate your product catalog."
              : "No products found for the selected store. Try selecting a different store or upload product data."
          }
          actionLabel="Upload Price Sheet"
          onAction={() => window.location.href = '/price-sheets'}
        />
      )}
    </div>
  );
};

export default ProductSync;