import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import FormField from '@/components/molecules/FormField';
import AIProviderPanel from '@/components/organisms/AIProviderPanel';
import aiProviderService from '@/services/api/aiProviderService';
import productService from '@/services/api/productService';

const AITools = () => {
  const [activeProviders, setActiveProviders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('providers');
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('seo_optimized');
  const [generatedDescription, setGeneratedDescription] = useState('');

  const templates = [
    { 
      value: 'seo_optimized', 
      label: 'SEO Optimized',
      description: 'Description optimized for search engines with structured HTML'
    },
    { 
      value: 'marketing_focused', 
      label: 'Marketing Focused',
      description: 'Persuasive copy designed to convert visitors to customers'
    },
    { 
      value: 'technical_detailed', 
      label: 'Technical Detailed',
      description: 'Comprehensive technical specifications and features'
    },
    { 
      value: 'minimalist', 
      label: 'Minimalist',
      description: 'Clean, concise descriptions highlighting key benefits'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [providerData, productData] = await Promise.all([
        aiProviderService.getAll(),
        productService.getAll()
      ]);
      
      setActiveProviders(providerData.filter(p => p.isActive && p.status === 'connected'));
      setProducts(productData.filter(p => p.status === 'active'));
      
      if (activeProviders.length > 0) {
        setSelectedProvider(activeProviders[0].Id.toString());
      }
    } catch (err) {
      setError(err.message || 'Failed to load AI tools data');
      toast.error('Failed to load AI tools data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!selectedProduct || !selectedProvider) {
      toast.error('Please select a product and AI provider');
      return;
    }

    const product = products.find(p => p.Id === parseInt(selectedProduct));
    if (!product) {
      toast.error('Selected product not found');
      return;
    }

    setGeneratingDescription(true);
    try {
      const result = await aiProviderService.generateDescription(
        parseInt(selectedProvider),
        product,
        selectedTemplate
      );
      
      setGeneratedDescription(result.description);
      toast.success('Product description generated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to generate description');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleSaveDescription = async () => {
    if (!selectedProduct || !generatedDescription) {
      toast.error('No description to save');
      return;
    }

    try {
      await productService.update(parseInt(selectedProduct), {
        description: generatedDescription
      });
      
      toast.success('Product description saved successfully!');
      setGeneratedDescription('');
      setSelectedProduct('');
    } catch (error) {
      toast.error('Failed to save description');
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
          title="Failed to load AI tools"
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Tools</h1>
        <p className="text-surface-400">
          Leverage AI to generate optimized product descriptions and content
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-dark-surface border border-surface-700 rounded-lg p-2 mb-6">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('providers')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'providers'
                ? 'bg-primary text-white shadow-sm'
                : 'text-surface-300 hover:text-white hover:bg-surface-700'
            }`}
          >
            <ApperIcon name="Settings" className="w-4 h-4 mr-2 inline" />
            AI Providers
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'generator'
                ? 'bg-primary text-white shadow-sm'
                : 'text-surface-300 hover:text-white hover:bg-surface-700'
            }`}
          >
            <ApperIcon name="Bot" className="w-4 h-4 mr-2 inline" />
            Description Generator
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'providers' ? (
        <motion.div
          key="providers"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
        >
          <AIProviderPanel />
        </motion.div>
      ) : (
        <motion.div
          key="generator"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {activeProviders.length === 0 ? (
            <EmptyState
              icon="Bot"
              title="No AI providers configured"
              description="You need to set up at least one AI provider before you can generate product descriptions. Configure your API keys in the AI Providers tab."
              actionLabel="Configure AI Providers"
              onAction={() => setActiveTab('providers')}
            />
          ) : products.length === 0 ? (
            <EmptyState
              icon="Package"
              title="No products available"
              description="You need to have products synced before you can generate descriptions. Upload a price sheet or sync your store products first."
              actionLabel="Go to Product Sync"
              onAction={() => window.location.href = '/product-sync'}
            />
          ) : (
            <>
              {/* Generation Form */}
              <div className="bg-dark-surface border border-surface-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Generate Product Description</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">
                        Select Product <span className="text-danger">*</span>
                      </label>
                      <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="w-full px-3 py-2.5 bg-dark-surface border border-surface-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                      >
                        <option value="">Choose a product...</option>
                        {products.map(product => (
                          <option key={product.Id} value={product.Id}>
                            {product.title} ({product.sku})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">
                        AI Provider <span className="text-danger">*</span>
                      </label>
                      <select
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value)}
                        className="w-full px-3 py-2.5 bg-dark-surface border border-surface-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                      >
                        {activeProviders.map(provider => (
                          <option key={provider.Id} value={provider.Id}>
                            {provider.displayName} ({provider.model})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">
                        Template <span className="text-danger">*</span>
                      </label>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="w-full px-3 py-2.5 bg-dark-surface border border-surface-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                      >
                        {templates.map(template => (
                          <option key={template.value} value={template.value}>
                            {template.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-surface-400 mt-1">
                        {templates.find(t => t.value === selectedTemplate)?.description}
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      icon="Zap"
                      onClick={handleGenerateDescription}
                      loading={generatingDescription}
                      disabled={!selectedProduct || !selectedProvider}
                      className="w-full"
                    >
                      Generate Description
                    </Button>
                  </div>

                  {/* Preview */}
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">
                      Generated Description
                    </label>
                    <div className="h-64 p-4 bg-surface-800 border border-surface-600 rounded-lg overflow-y-auto custom-scrollbar">
                      {generatingDescription ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <ApperIcon name="Loader2" className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                            <p className="text-surface-400">Generating description...</p>
                          </div>
                        </div>
                      ) : generatedDescription ? (
                        <div 
                          className="text-sm text-surface-300"
                          dangerouslySetInnerHTML={{ __html: generatedDescription }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-surface-500">Generated description will appear here</p>
                        </div>
                      )}
                    </div>
                    
                    {generatedDescription && (
                      <div className="flex space-x-2 mt-4">
                        <Button
                          variant="accent"
                          icon="Save"
                          onClick={handleSaveDescription}
                          className="flex-1"
                        >
                          Save to Product
                        </Button>
                        <Button
                          variant="outline"
                          icon="Copy"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedDescription);
                            toast.success('Description copied to clipboard');
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Template Examples */}
              <div className="bg-dark-surface border border-surface-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Template Examples</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <motion.div
                      key={template.value}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedTemplate === template.value
                          ? 'border-primary bg-primary/5'
                          : 'border-surface-600 hover:border-surface-500'
                      }`}
                      onClick={() => setSelectedTemplate(template.value)}
                    >
                      <h3 className="font-semibold text-white mb-2">{template.label}</h3>
                      <p className="text-sm text-surface-400">{template.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AITools;