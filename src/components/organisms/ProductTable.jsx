import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import StatusBadge from '@/components/atoms/StatusBadge';
import SearchBar from '@/components/molecules/SearchBar';
import { formatCurrency, formatRelativeTime } from '@/utils/helpers';

const ProductTable = ({ 
  products = [], 
  loading = false, 
  onEdit, 
  onDelete, 
  onBulkUpdate,
  showActions = true 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.vendor?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort products
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [products, searchQuery, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.Id));
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const SortHeader = ({ field, children }) => (
    <th
      onClick={() => handleSort(field)}
      className="px-6 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider cursor-pointer hover:text-surface-300 transition-colors"
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          <ApperIcon 
            name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
            className="w-3 h-3" 
          />
        )}
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="bg-dark-surface border border-surface-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-700">
          <div className="animate-pulse flex space-x-4">
            <div className="w-1/4 h-4 bg-surface-700 rounded"></div>
            <div className="w-1/4 h-4 bg-surface-700 rounded"></div>
            <div className="w-1/4 h-4 bg-surface-700 rounded"></div>
            <div className="w-1/4 h-4 bg-surface-700 rounded"></div>
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
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
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <SearchBar
          placeholder="Search products..."
          onSearch={setSearchQuery}
          className="flex-1 sm:max-w-md"
        />
        
        {selectedProducts.length > 0 && onBulkUpdate && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-surface-400">
              {selectedProducts.length} selected
            </span>
            <Button
              variant="primary"
              size="sm"
              icon="RefreshCw"
              onClick={() => onBulkUpdate(selectedProducts)}
            >
              Bulk Update
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-dark-surface border border-surface-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-700">
            <thead className="bg-surface-800">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary bg-dark-surface border-surface-600 rounded focus:ring-primary/50"
                  />
                </th>
                <SortHeader field="title">Product</SortHeader>
                <SortHeader field="sku">SKU</SortHeader>
                <SortHeader field="price">Price</SortHeader>
                <SortHeader field="inventory">Inventory</SortHeader>
                <SortHeader field="status">Status</SortHeader>
                <SortHeader field="lastUpdated">Updated</SortHeader>
                {showActions && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-dark-surface divide-y divide-surface-700">
              {filteredProducts.map((product, index) => (
                <motion.tr
                  key={product.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-surface-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.Id)}
                      onChange={() => handleSelectProduct(product.Id)}
                      className="w-4 h-4 text-primary bg-dark-surface border-surface-600 rounded focus:ring-primary/50"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-surface-600 rounded-lg flex items-center justify-center">
                        <ApperIcon name="Package" className="w-5 h-5 text-surface-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                          {product.title}
                        </p>
                        <p className="text-xs text-surface-400 truncate">
                          {product.vendor}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-300">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-white">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-300">
                    {product.inventory}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-400">
                    {formatRelativeTime(product.lastUpdated)}
                  </td>
                  {showActions && (
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="Edit"
                        onClick={() => onEdit && onEdit(product)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="Trash2"
                        onClick={() => onDelete && onDelete(product.Id)}
                      />
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <ApperIcon name="Package" className="w-12 h-12 text-surface-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-white mb-2">No products found</p>
            <p className="text-surface-400">
              {searchQuery ? 'Try adjusting your search terms' : 'No products available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTable;