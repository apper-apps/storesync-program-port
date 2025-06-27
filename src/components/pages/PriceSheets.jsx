import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import FileUploadZone from '@/components/organisms/FileUploadZone';
import syncJobService from '@/services/api/syncJobService';
import storeService from '@/services/api/storeService';
import { formatRelativeTime } from '@/utils/helpers';

const PriceSheets = () => {
  const [stores, setStores] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedStore, setSelectedStore] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [columnMapping, setColumnMapping] = useState({});
  const [previewData, setPreviewData] = useState([]);
  const [showMapping, setShowMapping] = useState(false);

  const requiredColumns = [
    { key: 'sku', label: 'SKU', required: true },
    { key: 'title', label: 'Product Title', required: true },
    { key: 'price', label: 'Price', required: true },
    { key: 'inventory', label: 'Inventory', required: true },
    { key: 'description', label: 'Description', required: false },
    { key: 'vendor', label: 'Vendor', required: false },
    { key: 'category', label: 'Category', required: false }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [storeData, jobData] = await Promise.all([
        storeService.getAll(),
        syncJobService.getAll()
      ]);
      
      setStores(storeData.filter(s => s.status === 'connected'));
      setRecentUploads(jobData.filter(j => j.type === 'price_update').slice(0, 5));
      
      if (storeData.length > 0) {
        setSelectedStore(storeData[0].Id.toString());
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file) => {
    setUploadedFile(file);
    
    // Simulate file parsing to show column mapping
    setTimeout(() => {
      // Mock parsed data for demonstration
      const mockColumns = ['SKU', 'Product_Name', 'Retail_Price', 'Stock_Qty', 'Description', 'Supplier'];
      const mockData = [
        { SKU: 'TECH-001', Product_Name: 'Wireless Headphones', Retail_Price: '99.99', Stock_Qty: '25', Description: 'Premium wireless headphones', Supplier: 'TechCorp' },
        { SKU: 'TECH-002', Product_Name: 'Bluetooth Speaker', Retail_Price: '149.99', Stock_Qty: '15', Description: 'Portable Bluetooth speaker', Supplier: 'TechCorp' },
        { SKU: 'TECH-003', Product_Name: 'USB-C Cable', Retail_Price: '19.99', Stock_Qty: '100', Description: 'High-speed USB-C cable', Supplier: 'TechCorp' }
      ];
      
      setPreviewData(mockData);
      setShowMapping(true);
      
      // Initialize mapping with best guesses
      const initialMapping = {
        sku: 'SKU',
        title: 'Product_Name',
        price: 'Retail_Price',
        inventory: 'Stock_Qty',
        description: 'Description',
        vendor: 'Supplier'
      };
      setColumnMapping(initialMapping);
    }, 1500);
  };

  const handleProcessFile = async () => {
    if (!selectedStore) {
      toast.error('Please select a store');
      return;
    }

    // Validate required mappings
    const missingRequired = requiredColumns
      .filter(col => col.required && !columnMapping[col.key])
      .map(col => col.label);
      
    if (missingRequired.length > 0) {
      toast.error(`Please map required columns: ${missingRequired.join(', ')}`);
      return;
    }

    setIsProcessing(true);
    try {
      const job = await syncJobService.create({
        type: 'price_update',
        storeId: parseInt(selectedStore),
        title: `Price Sheet Update - ${uploadedFile.name}`,
        details: {
          totalItems: previewData.length,
          processed: 0,
          updated: 0,
          created: 0,
          archived: 0,
          errors: 0,
          source: uploadedFile.name,
          mapping: columnMapping
        }
      });
      
      await syncJobService.startJob(job.Id);
      toast.success('Price sheet processing started successfully!');
      
      // Reset form
      setUploadedFile(null);
      setShowMapping(false);
      setPreviewData([]);
      setColumnMapping({});
      
      // Reload recent uploads
      loadData();
    } catch (error) {
      toast.error('Failed to process price sheet');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-8">
          <div className="w-48 h-8 bg-surface-700 rounded animate-pulse mb-2"></div>
          <div className="w-96 h-4 bg-surface-700 rounded animate-pulse"></div>
        </div>
        
        <SkeletonLoader type="card" count={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to load price sheets"
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Price Sheets</h1>
          <p className="text-surface-400">Upload and process vendor price sheets</p>
        </div>
        
        <EmptyState
          icon="Store"
          title="No connected stores"
          description="You need to connect at least one store before you can upload price sheets. Set up your Shopify or WooCommerce connection first."
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
        <h1 className="text-3xl font-bold text-white mb-2">Price Sheets</h1>
        <p className="text-surface-400">
          Upload vendor price sheets to automatically update your product catalog
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Store Selection */}
          <div className="bg-dark-surface border border-surface-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Select Target Store</h2>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full px-3 py-2.5 bg-dark-surface border border-surface-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            >
              {stores.map(store => (
                <option key={store.Id} value={store.Id}>
                  {store.name} ({store.platform})
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <FileUploadZone
            onFileSelect={handleFileSelect}
            acceptedTypes={['.xlsx', '.xls', '.csv']}
            maxFileSize={10}
          />

          {/* Column Mapping */}
          {showMapping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-surface border border-surface-700 rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Map Columns</h2>
              <p className="text-surface-400 mb-6">
                Map the columns from your file to our product fields
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {requiredColumns.map((column) => (
                  <div key={column.key}>
                    <label className="block text-sm font-medium text-surface-300 mb-2">
                      {column.label}
                      {column.required && <span className="text-danger ml-1">*</span>}
                    </label>
                    <select
                      value={columnMapping[column.key] || ''}
                      onChange={(e) => setColumnMapping(prev => ({
                        ...prev,
                        [column.key]: e.target.value
                      }))}
                      className="w-full px-3 py-2 bg-dark-surface border border-surface-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                    >
                      <option value="">Select column...</option>
                      {Object.keys(previewData[0] || {}).map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Preview Table */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3">Data Preview</h3>
                <div className="overflow-x-auto bg-surface-800 rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-surface-700">
                      <tr>
                        {Object.keys(previewData[0] || {}).map(col => (
                          <th key={col} className="px-4 py-2 text-left text-surface-300 font-medium">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-600">
                      {previewData.slice(0, 3).map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2 text-surface-300">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="primary"
                  icon="Play"
                  onClick={handleProcessFile}
                  loading={isProcessing}
                  className="flex-1"
                >
                  Process Price Sheet
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMapping(false);
                    setUploadedFile(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Recent Uploads Sidebar */}
        <div className="space-y-6">
          <div className="bg-dark-surface border border-surface-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Uploads</h2>
            
            {recentUploads.length > 0 ? (
              <div className="space-y-3">
                {recentUploads.map((job) => (
                  <motion.div
                    key={job.Id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-surface-800 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-white text-sm">{job.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        job.status === 'completed' ? 'bg-success/10 text-success' :
                        job.status === 'failed' ? 'bg-danger/10 text-danger' :
                        job.status === 'processing' ? 'bg-info/10 text-info' :
                        'bg-warning/10 text-warning'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-surface-400">
                      <span>{job.details.processed || 0} / {job.details.totalItems || 0} items</span>
                      <span>{formatRelativeTime(job.createdAt)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ApperIcon name="FileSpreadsheet" className="w-12 h-12 text-surface-400 mx-auto mb-4" />
                <p className="text-surface-400">No recent uploads</p>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              icon="Clock"
              onClick={() => window.location.href = '/history'}
              className="w-full mt-4"
            >
              View All History
            </Button>
          </div>

          {/* Help Guide */}
          <div className="bg-dark-surface border border-surface-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">File Format Guide</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <ApperIcon name="CheckCircle" className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-surface-300">Supported formats: Excel (.xlsx, .xls) and CSV</span>
              </div>
              <div className="flex items-start space-x-2">
                <ApperIcon name="CheckCircle" className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-surface-300">First row should contain column headers</span>
              </div>
              <div className="flex items-start space-x-2">
                <ApperIcon name="CheckCircle" className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-surface-300">Required columns: SKU, Title, Price, Inventory</span>
              </div>
              <div className="flex items-start space-x-2">
                <ApperIcon name="CheckCircle" className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-surface-300">Maximum file size: 10MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceSheets;