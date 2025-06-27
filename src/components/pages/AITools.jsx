import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";
import productService from "@/services/api/productService";
import aiProviderService from "@/services/api/aiProviderService";
import templateService from "@/services/api/templateService";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import SkeletonLoader from "@/components/molecules/SkeletonLoader";
import EmptyState from "@/components/molecules/EmptyState";
import ErrorState from "@/components/molecules/ErrorState";
import AIProviderPanel from "@/components/organisms/AIProviderPanel";
import Button from "@/components/atoms/Button";

const AITools = () => {
  const [activeProviders, setActiveProviders] = useState([]);
  const [products, setProducts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('providers');
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('1');
  const [generatedDescription, setGeneratedDescription] = useState('');
  
  // Description Builder state
  const [selectedTemplateForBuilder, setSelectedTemplateForBuilder] = useState('1');
  const [selectedProductForBuilder, setSelectedProductForBuilder] = useState('');
  const [customTemplateContent, setCustomTemplateContent] = useState('');
  const [templatePreview, setTemplatePreview] = useState('');
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
const [availableVariables, setAvailableVariables] = useState([]);

  const templateExamples = [
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
      const [providerData, productData, templateData, variableData] = await Promise.all([
        aiProviderService.getAll(),
        productService.getAll(),
        templateService.getAll(),
        templateService.getAvailableVariables()
]);
      
      const filteredProviders = providerData.filter(p => p.isActive && p.status === 'connected');
      setActiveProviders(filteredProviders);
      setProducts(productData.filter(p => p.status === 'active'));
      setTemplates(templateData);
      setAvailableVariables(variableData || []);
     
      if (filteredProviders.length > 0 && filteredProviders[0]?.Id) {
        setSelectedProvider(filteredProviders[0].Id.toString());
      }
// Initialize with first template and product if available
      if (templateData.length > 0 && productData.length > 0) {
        setCustomTemplateContent(templateData[0].content || '');
        updatePreview(templateData[0].content || '', productData[0]);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load AI tools data');
      toast.error('Failed to load AI tools data');
    } finally {
      setLoading(false);
    }
  };

const updatePreview = async (templateContent, productData) => {
    if (!templateContent || !productData) return;
    
    try {
      // Simulate template processing
      let preview = templateContent;
      const variables = {
        title: productData.title || 'Product Title',
        description: productData.description || 'Product description',
        sku: productData.sku || 'N/A',
        category: productData.category || 'Uncategorized',
        vendor: productData.vendor || 'Unknown Vendor',
        price: productData.price ? productData.price.toFixed(2) : '0.00',
        inventory: productData.inventory?.toString() || '0',
        lastUpdated: productData.lastUpdated ? new Date(productData.lastUpdated).toLocaleDateString() : 'N/A'
      };
      
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        preview = preview.replace(regex, value);
      });
      
      setTemplatePreview(DOMPurify.sanitize(preview));
    } catch (error) {
      console.error('Preview update failed:', error);
    }
  };

  const handleTemplateSelect = async (templateId) => {
    setSelectedTemplateForBuilder(templateId);
    const template = templates.find(t => t.Id === parseInt(templateId));
    if (template) {
      setCustomTemplateContent(template.content);
      const product = products.find(p => p.Id === parseInt(selectedProductForBuilder));
      if (product) {
        updatePreview(template.content, product);
      }
    }
  };

  const handleProductSelect = (productId) => {
    setSelectedProductForBuilder(productId);
    const product = products.find(p => p.Id === parseInt(productId));
    if (product) {
      updatePreview(customTemplateContent, product);
    }
  };

  const handleTemplateContentChange = (content) => {
    setCustomTemplateContent(content);
    const product = products.find(p => p.Id === parseInt(selectedProductForBuilder));
    if (product) {
      updatePreview(content, product);
    }
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim() || !customTemplateContent.trim()) {
      toast.error('Please provide template name and content');
      return;
    }

    try {
      const templateData = {
        name: newTemplateName,
        description: newTemplateDescription,
        content: customTemplateContent
      };

      if (editingTemplateId) {
        await templateService.update(editingTemplateId, templateData);
        toast.success('Template updated successfully!');
      } else {
        await templateService.create(templateData);
        toast.success('Template saved successfully!');
      }

      // Reload templates
      const updatedTemplates = await templateService.getAll();
      setTemplates(updatedTemplates);
      
      // Reset form
      setIsEditingTemplate(false);
      setEditingTemplateId(null);
      setNewTemplateName('');
      setNewTemplateDescription('');
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  const handleEditTemplate = (template) => {
    setIsEditingTemplate(true);
    setEditingTemplateId(template.Id);
    setNewTemplateName(template.name);
    setNewTemplateDescription(template.description);
    setCustomTemplateContent(template.content);
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await templateService.delete(templateId);
      toast.success('Template deleted successfully!');
      
      // Reload templates
      const updatedTemplates = await templateService.getAll();
      setTemplates(updatedTemplates);
    } catch (error) {
      toast.error(error.message || 'Failed to delete template');
    }
  };

  const handleGenerateDescription = async () => {
    if (!selectedProduct || !selectedProvider) {
      toast.error('Please select a product and AI provider');
      return;
    }

    const product = products.find(p => p.Id === parseInt(selectedProduct));
    const template = templates.find(t => t.Id === parseInt(selectedTemplate));
    
    if (!product) {
      toast.error('Selected product not found');
      return;
    }

    setGeneratingDescription(true);
    try {
      const result = await aiProviderService.generateDescription(
        parseInt(selectedProvider),
        product,
        template?.name || 'seo_optimized'
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
            AI Generator
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'builder'
                ? 'bg-primary text-white shadow-sm'
                : 'text-surface-300 hover:text-white hover:bg-surface-700'
            }`}
          >
            <ApperIcon name="FileText" className="w-4 h-4 mr-2 inline" />
            Description Builder
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
      ) : activeTab === 'builder' ? (
        <motion.div
          key="builder"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          {products.length === 0 ? (
            <EmptyState
              icon="Package"
              title="No products available"
              description="You need to have products synced before you can build descriptions. Upload a price sheet or sync your store products first."
              actionLabel="Go to Product Sync"
              onAction={() => window.location.href = '/product-sync'}
            />
          ) : (
            <>
              {/* Template Builder */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Template Editor */}
                <div className="bg-dark-surface border border-surface-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Template Builder</h2>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditingTemplate(true);
                          setEditingTemplateId(null);
                          setNewTemplateName('');
                          setNewTemplateDescription('');
                          setCustomTemplateContent('');
                        }}
                      >
                        <ApperIcon name="Plus" className="w-4 h-4 mr-1" />
                        New Template
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Template Selection */}
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">
                        Base Template
                      </label>
                      <select
                        value={selectedTemplateForBuilder}
                        onChange={(e) => handleTemplateSelect(e.target.value)}
className="w-full px-3 py-2.5 bg-dark-surface border border-surface-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                      >
                        {templates.map(template => template?.Id ? (
                          <option key={template.Id} value={template.Id}>
                            {template.name} {template.isCustom ? '(Custom)' : ''}
                          </option>
                        ) : null)}
                      </select>
                    </div>

                    {/* Product Selection */}
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">
                        Preview Product
                      </label>
                      <select
                        value={selectedProductForBuilder}
                        onChange={(e) => handleProductSelect(e.target.value)}
                        className="w-full px-3 py-2.5 bg-dark-surface border border-surface-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                      >
                        <option value="">Select a product...</option>
                        {products.map(product => (
                          <option key={product.Id} value={product.Id}>
                            {product.title} ({product.sku})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Template Content Editor */}
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">
                        Template Content
                      </label>
                      <textarea
                        value={customTemplateContent}
                        onChange={(e) => handleTemplateContentChange(e.target.value)}
                        placeholder="Enter your template HTML with variables like {{title}}, {{price}}, etc."
                        className="w-full h-64 px-3 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 resize-none"
                      />
                    </div>

                    {/* Available Variables */}
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">
                        Available Variables
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableVariables.map(variable => (
                          <button
                            key={variable.key}
                            onClick={() => {
                              const textarea = document.querySelector('textarea');
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const text = customTemplateContent;
                              const newText = text.substring(0, start) + `{{${variable.key}}}` + text.substring(end);
                              setCustomTemplateContent(newText);
                              handleTemplateContentChange(newText);
                            }}
                            className="px-2 py-1 bg-surface-700 hover:bg-surface-600 text-xs text-surface-300 hover:text-white rounded transition-colors"
                            title={variable.description}
                          >
                            {`{{${variable.key}}}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Save Template Form */}
                    {isEditingTemplate && (
                      <div className="border-t border-surface-600 pt-4 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-surface-300 mb-1">
                            Template Name
                          </label>
                          <input
                            type="text"
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            placeholder="Enter template name"
                            className="w-full px-3 py-2 bg-dark-surface border border-surface-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-surface-300 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={newTemplateDescription}
                            onChange={(e) => setNewTemplateDescription(e.target.value)}
                            placeholder="Enter template description"
                            className="w-full px-3 py-2 bg-dark-surface border border-surface-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSaveTemplate}
                          >
                            <ApperIcon name="Save" className="w-4 h-4 mr-1" />
                            Save Template
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsEditingTemplate(false);
                              setEditingTemplateId(null);
                              setNewTemplateName('');
                              setNewTemplateDescription('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Preview */}
                <div className="bg-dark-surface border border-surface-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Live Preview</h2>
                    {templatePreview && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(templatePreview);
                          toast.success('Preview copied to clipboard');
                        }}
                      >
                        <ApperIcon name="Copy" className="w-4 h-4 mr-1" />
                        Copy HTML
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Raw HTML Preview */}
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">
                        Generated HTML
                      </label>
                      <div className="h-48 p-4 bg-surface-800 border border-surface-600 rounded-lg overflow-auto custom-scrollbar">
                        <pre className="text-xs text-surface-300 whitespace-pre-wrap font-mono">
                          {templatePreview || 'Select a product to preview the template'}
                        </pre>
                      </div>
                    </div>

                    {/* Rendered Preview */}
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">
                        Visual Preview
                      </label>
                      <div className="h-48 p-4 bg-white border border-surface-600 rounded-lg overflow-auto custom-scrollbar">
                        {templatePreview ? (
                          <div 
                            className="text-black text-sm"
                            dangerouslySetInnerHTML={{ __html: templatePreview }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Select a product to preview the template</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Management */}
              <div className="bg-dark-surface border border-surface-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Template Library</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <motion.div
                      key={template.Id}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 border border-surface-600 rounded-lg hover:border-surface-500 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                          <p className="text-sm text-surface-400 mb-2">{template.description}</p>
                          {template.isCustom && (
                            <span className="inline-block px-2 py-1 text-xs bg-accent/20 text-accent rounded">
                              Custom
                            </span>
                          )}
                        </div>
                      </div>
                      
<div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTemplateSelect(template?.Id?.toString() || '')}
                          className="flex-1"
                        >
                          <ApperIcon name="Eye" className="w-3 h-3 mr-1" />
                          Use
                        </Button>
                        {template?.isCustom && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTemplate(template)}
                            >
                              <ApperIcon name="Edit" className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTemplate(template.Id)}
                              className="text-danger hover:text-danger"
                            >
                              <ApperIcon name="Trash2" className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}
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
                        onChange={(e) => e.target.value && setSelectedTemplate(e.target.value)}
                        className="w-full px-3 py-2.5 bg-dark-surface border border-surface-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                      >
                        {templates.map(template => template?.Id ? (
                          <option key={template.Id} value={template.Id}>
                            {template.name}
                          </option>
) : null)}
                      </select>
                      {selectedTemplate && (
                        <p className="text-xs text-surface-400 mt-1">
                          {templates.find(t => t.Id === parseInt(selectedTemplate))?.description}
                        </p>
                      )}
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
                  {templateExamples.map((template) => (
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