import { delay } from '@/utils/helpers';
import aiProviderData from '@/services/mockData/aiProviders.json';

const apiDelay = () => delay(Math.random() * 300 + 200);

let aiProviders = [...aiProviderData];

export const aiProviderService = {
  async getAll() {
    await apiDelay();
    return [...aiProviders];
  },

  async getById(id) {
    await apiDelay();
    const provider = aiProviders.find(p => p.Id === parseInt(id));
    if (!provider) {
      throw new Error('AI Provider not found');
    }
    return { ...provider };
  },

  async create(providerData) {
    await apiDelay();
    const maxId = Math.max(...aiProviders.map(p => p.Id), 0);
    const newProvider = {
      Id: maxId + 1,
      ...providerData,
      createdAt: new Date().toISOString()
    };
    aiProviders.push(newProvider);
    return { ...newProvider };
  },

  async update(id, providerData) {
    await apiDelay();
    const index = aiProviders.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error('AI Provider not found');
    }
    aiProviders[index] = { 
      ...aiProviders[index], 
      ...providerData,
      Id: aiProviders[index].Id,
      updatedAt: new Date().toISOString()
    };
    return { ...aiProviders[index] };
  },

  async delete(id) {
    await apiDelay();
    const index = aiProviders.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error('AI Provider not found');
    }
    const deletedProvider = aiProviders.splice(index, 1)[0];
    return { ...deletedProvider };
  },

  async testConnection(providerId) {
    await apiDelay();
    const provider = aiProviders.find(p => p.Id === parseInt(providerId));
    if (!provider) {
      throw new Error('AI Provider not found');
    }
    
    // Simulate API test
    const isSuccessful = Math.random() > 0.2; // 80% success rate
    if (!isSuccessful) {
      throw new Error('Failed to connect to AI provider. Please check your API key.');
    }
    
    return { 
      success: true, 
      message: 'AI Provider connection successful',
      model: provider.model,
      timestamp: new Date().toISOString()
    };
  },

  async generateDescription(providerId, productData, template) {
    await apiDelay();
    const provider = aiProviders.find(p => p.Id === parseInt(providerId));
    if (!provider) {
      throw new Error('AI Provider not found');
    }

    // Simulate AI description generation
    const descriptions = [
      `<h2>Premium ${productData.title}</h2><p>Experience the ultimate in quality and performance with our ${productData.title}. Designed for professionals who demand excellence, this product delivers outstanding results every time.</p><ul><li>Superior quality materials</li><li>Professional-grade performance</li><li>Backed by our satisfaction guarantee</li></ul>`,
      `<div class="product-description"><h3>Introducing ${productData.title}</h3><p>Transform your workflow with the revolutionary ${productData.title}. Built to exceed expectations and deliver unmatched reliability.</p><h4>Key Features:</h4><ul><li>Advanced engineering</li><li>Durable construction</li><li>Easy to use interface</li></ul></div>`,
      `<section><h2>${productData.title} - The Professional Choice</h2><p>Elevate your business with our premium ${productData.title}. Crafted with precision and designed for longevity, this is the investment that pays dividends.</p><div class="features"><h3>Why Choose ${productData.title}?</h3><ul><li>Industry-leading quality</li><li>Comprehensive warranty</li><li>Expert customer support</li></ul></div></section>`
    ];

    const generatedDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    return {
      description: generatedDescription,
      provider: provider.name,
      model: provider.model,
      template: template,
      timestamp: new Date().toISOString()
    };
  }
};

export default aiProviderService;