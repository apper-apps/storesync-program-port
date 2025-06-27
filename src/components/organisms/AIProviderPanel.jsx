import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import StatusBadge from '@/components/atoms/StatusBadge';
import FormField from '@/components/molecules/FormField';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import aiProviderService from '@/services/api/aiProviderService';

const AIProviderPanel = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProvider, setEditingProvider] = useState(null);
  const [formData, setFormData] = useState({
    name: 'openai',
    apiKey: '',
    model: 'gpt-4'
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const data = await aiProviderService.getAll();
      setProviders(data);
    } catch (error) {
      toast.error('Failed to load AI providers');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.apiKey) {
      toast.error('Please enter an API key');
      return;
    }

    try {
      let result;
      if (editingProvider) {
        result = await aiProviderService.update(editingProvider.Id, formData);
        toast.success('AI provider updated successfully');
      } else {
        result = await aiProviderService.create(formData);
        toast.success('AI provider added successfully');
      }
      
      await loadProviders();
      setEditingProvider(null);
      setFormData({ name: 'openai', apiKey: '', model: 'gpt-4' });
    } catch (error) {
      toast.error(error.message || 'Failed to save AI provider');
    }
  };

  const handleTest = async (provider) => {
    try {
      await aiProviderService.testConnection(provider.Id);
      toast.success(`${provider.displayName} connection successful!`);
      await loadProviders();
    } catch (error) {
      toast.error(error.message || 'Connection test failed');
    }
  };

  const handleDelete = async (providerId) => {
    if (!window.confirm('Are you sure you want to delete this AI provider?')) {
      return;
    }

    try {
      await aiProviderService.delete(providerId);
      toast.success('AI provider deleted successfully');
      await loadProviders();
    } catch (error) {
      toast.error('Failed to delete AI provider');
    }
  };

  const handleEdit = (provider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      apiKey: provider.apiKey,
      model: provider.model
    });
  };

  const providerOptions = [
    { value: 'openai', label: 'OpenAI', models: ['gpt-4', 'gpt-3.5-turbo'] },
    { value: 'claude', label: 'Anthropic Claude', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
    { value: 'openrouter', label: 'OpenRouter', models: ['openai/gpt-4', 'anthropic/claude-3-opus'] },
    { value: 'straico', label: 'Straico', models: ['gpt-4', 'claude-3-opus'] },
    { value: 'perplexity', label: 'Perplexity', models: ['llama-3-sonar-large', 'llama-3-sonar-small'] }
  ];

  const selectedProvider = providerOptions.find(p => p.value === formData.name);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Provider List */}
      <div className="grid gap-4">
        {providers.map((provider) => (
          <motion.div
            key={provider.Id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-surface border border-surface-700 rounded-lg p-6 hover:border-surface-600 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Bot" className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{provider.displayName}</h3>
                  <p className="text-sm text-surface-400">{provider.model}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <StatusBadge status={provider.status} />
                <div className="text-right">
                  <p className="text-sm text-surface-400">{provider.requestCount} requests</p>
                  <p className="text-xs text-surface-500">
                    {provider.lastUsed ? `Last used ${new Date(provider.lastUsed).toLocaleDateString()}` : 'Never used'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4">
              <Button
                variant="primary"
                size="sm"
                icon="Zap"
                onClick={() => handleTest(provider)}
              >
                Test Connection
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon="Edit"
                onClick={() => handleEdit(provider)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon="Trash2"
                onClick={() => handleDelete(provider.Id)}
              >
                Delete
              </Button>
              <Button
                variant={provider.isActive ? 'accent' : 'outline'}
                size="sm"
                icon={provider.isActive ? 'Check' : 'Play'}
                onClick={() => aiProviderService.update(provider.Id, { isActive: !provider.isActive }).then(loadProviders)}
              >
                {provider.isActive ? 'Active' : 'Activate'}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Form */}
      <div className="bg-dark-surface border border-surface-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">
          {editingProvider ? 'Edit AI Provider' : 'Add AI Provider'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              Provider <span className="text-danger">*</span>
            </label>
            <select
              value={formData.name}
              onChange={(e) => {
                const newProvider = e.target.value;
                const defaultModel = providerOptions.find(p => p.value === newProvider)?.models[0] || '';
                setFormData({ ...formData, name: newProvider, model: defaultModel });
              }}
              className="w-full px-3 py-2.5 bg-dark-surface border border-surface-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            >
              {providerOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              Model <span className="text-danger">*</span>
            </label>
            <select
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-3 py-2.5 bg-dark-surface border border-surface-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            >
              {selectedProvider?.models.map(model => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

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
            >
              {editingProvider ? 'Update Provider' : 'Add Provider'}
            </Button>
            {editingProvider && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingProvider(null);
                  setFormData({ name: 'openai', apiKey: '', model: 'gpt-4' });
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIProviderPanel;