import { delay, formatDate } from "@/utils/helpers";

const apiDelay = () => delay(Math.random() * 300 + 200);

// Default templates with variable placeholders
let templates = [
  {
    id: 1,
    name: 'SEO Optimized',
    description: 'Search engine optimized product descriptions with structured content',
    content: `<div class="product-description">
  <h2>{{title}}</h2>
  <p class="lead">{{description}}</p>
  
  <div class="features">
    <h3>Key Features:</h3>
    <ul>
      <li>SKU: {{sku}}</li>
      <li>Category: {{category}}</li>
      <li>Vendor: {{vendor}}</li>
    </ul>
  </div>
  
<div class="pricing">
    <h3>Pricing Information:</h3>
    <p><strong>Price:</strong> $\{{price}}</p>
    <p><strong>Stock:</strong> {{inventory}} units available</p>
  </div>
  
  <div class="meta">
    <p><em>Last updated: {{lastUpdated}}</em></p>
  </div>
</div>`,
    variables: ['title', 'description', 'sku', 'category', 'vendor', 'price', 'inventory', 'lastUpdated'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Marketing Focused',
    description: 'Persuasive copy designed to drive conversions and sales',
    content: `<div class="marketing-description">
  <h1>🚀 {{title}} - Transform Your Experience!</h1>
  
  <div class="hero-section">
    <p class="headline">{{description}}</p>
    <p class="value-prop"><strong>Why choose {{title}}?</strong> Because excellence matters!</p>
  </div>
  
  <div class="features-grid">
    <div class="feature-card">
      <h3>✨ Premium Quality</h3>
      <p>Product Code: {{sku}}</p>
    </div>
    <div class="feature-card">
      <h3>🏆 Trusted Brand</h3>
      <p>By {{vendor}} in {{category}}</p>
    </div>
<div class="feature-card">
      <h3>💰 Great Value</h3>
      <p>Only $\{{price}} - {{inventory}} left in stock!</p>
    </div>
  </div>
  
  <div class="cta-section">
    <p><strong>Don't miss out!</strong> Order now while supplies last.</p>
  </div>
</div>`,
    variables: ['title', 'description', 'sku', 'category', 'vendor', 'price', 'inventory'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Technical Detailed',
    description: 'Comprehensive technical specifications and features',
    content: `<div class="technical-specs">
  <header>
    <h1>{{title}}</h1>
    <p class="subtitle">Model: {{sku}} | Category: {{category}}</p>
  </header>
  
  <section class="overview">
    <h2>Product Overview</h2>
    <p>{{description}}</p>
  </section>
  
  <section class="specifications">
    <h2>Technical Specifications</h2>
    <table>
      <tr><td><strong>SKU:</strong></td><td>{{sku}}</td></tr>
<tr><td><strong>Category:</strong></td><td>{{category}}</td></tr>
      <tr><td><strong>Manufacturer:</strong></td><td>{{vendor}}</td></tr>
      <tr><td><strong>Price:</strong></td><td>$\{{price}}</td></tr>
      <tr><td><strong>Availability:</strong></td><td>{{inventory}} units</td></tr>
    </table>
  </section>
  
  <section class="additional-info">
    <h2>Additional Information</h2>
    <p><small>Product information last updated: {{lastUpdated}}</small></p>
  </section>
</div>`,
    variables: ['title', 'sku', 'category', 'description', 'vendor', 'price', 'inventory', 'lastUpdated'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Minimalist',
    description: 'Clean and simple product presentation',
    content: `<div class="minimalist-description">
  <h1>{{title}}</h1>
  
  <p>{{description}}</p>
<div class="essentials">
    <p><strong>$\{{price}}</strong></p>
    <p>{{inventory}} available</p>
    <p><small>{{sku}}</small></p>
  </div>
</div>`,
    variables: ['title', 'description', 'sku', 'price', 'inventory'],
    isCustom: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Variable substitution engine
const substituteVariables = (template, productData) => {
  // Validate inputs with detailed error handling
  if (!template) {
    console.error('Template is required for variable substitution');
    return '';
  }
  
  if (!productData) {
    console.error('Product data is required for variable substitution');
    return template;
  }

  try {
    // Create comprehensive variable mapping with robust formatting and fallbacks
    let formattedPrice = '0.00';
    
    // Enhanced price formatting with comprehensive null/undefined handling
    if (productData.price !== null && productData.price !== undefined) {
      if (typeof productData.price === 'number') {
        formattedPrice = productData.price.toFixed(2);
      } else if (typeof productData.price === 'string') {
        const parsedPrice = parseFloat(productData.price);
        formattedPrice = !isNaN(parsedPrice) ? parsedPrice.toFixed(2) : '0.00';
      } else {
        console.warn('Price value is not a valid number or string:', productData.price);
        formattedPrice = '0.00';
      }
    }

    // Comprehensive variable mapping with safe type conversion
    const variables = {
      title: productData.title?.toString() || 'Product Title',
      description: productData.description?.toString() || 'Product Description',
      price: formattedPrice,
      inventory: productData.inventory !== null && productData.inventory !== undefined ? 
        productData.inventory.toString() : '0',
      sku: productData.sku?.toString() || 'N/A',
      vendor: productData.vendor?.toString() || 'Unknown Vendor',
      category: productData.category?.toString() || 'Uncategorized',
      status: productData.status?.toString() || 'active',
      storeId: productData.storeId !== null && productData.storeId !== undefined ? 
        productData.storeId.toString() : '0',
      lastUpdated: productData.lastUpdated ? 
        formatDate(productData.lastUpdated) : formatDate(new Date())
    };

    let result = template;
    
    // Enhanced variable replacement with error handling
    Object.keys(variables).forEach(key => {
      try {
        const regex = new RegExp(`{{${key}}}`, 'g');
        const value = variables[key];
        
        // Ensure we have a valid string value for replacement
        const safeValue = value !== null && value !== undefined ? value.toString() : '';
        result = result.replace(regex, safeValue);
      } catch (error) {
        console.error(`Error replacing variable '${key}':`, error);
        // Continue with other variables even if one fails
      }
    });
    
    // Enhanced unreplaced variable detection with detailed logging
    const unreplacedVars = result.match(/{{(\w+)}}/g);
    if (unreplacedVars && unreplacedVars.length > 0) {
      console.warn('Unreplaced template variables found:', {
        variables: unreplacedVars,
        availableData: Object.keys(productData),
        templateVariables: Object.keys(variables)
      });
    }
    
    return result;
    
  } catch (error) {
    console.error('Critical error in variable substitution:', error);
    console.error('Template:', template);
    console.error('Product data:', productData);
    return template; // Return original template as fallback
  }
};

// Extract variables from template content
const extractVariables = (content) => {
  if (!content || typeof content !== 'string') return [];
  
  try {
    const matches = content.match(/{{(\w+)}}/g);
    if (!matches) return [];
    return [...new Set(matches.map(match => match.replace(/[{}]/g, '')))];
  } catch (error) {
    console.error('Error extracting variables from template:', error);
    return [];
  }
};

const templateService = {
  async getAll() {
    await apiDelay();
    return [...templates];
  },

  async getById(id) {
    await apiDelay();
    const template = templates.find(t => t.id === parseInt(id));
    if (!template) {
      throw new Error('Template not found');
    }
    return { ...template };
},

  async create(templateData) {
    await apiDelay();
    const maxId = Math.max(...templates.map(t => t.id), 0);
    const variables = extractVariables(templateData.content);
    
    const newTemplate = {
      id: maxId + 1,
      name: templateData.name,
      description: templateData.description || '',
      content: templateData.content,
      variables,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    templates.push(newTemplate);
    return { ...newTemplate };
},

  async update(id, templateData) {
    await apiDelay();
    const index = templates.findIndex(t => t.id === parseInt(id));
    if (index === -1) {
      throw new Error('Template not found');
    }
    
    const variables = extractVariables(templateData.content);
    
    templates[index] = {
      ...templates[index],
      ...templateData,
      id: templates[index].id,
      variables,
      updatedAt: new Date().toISOString()
    };
    
    return { ...templates[index] };
  },

  async delete(id) {
    await apiDelay();
    const index = templates.findIndex(t => t.id === parseInt(id));
    if (index === -1) {
      throw new Error('Template not found');
    }
    
    // Prevent deletion of default templates
    if (!templates[index].isCustom) {
      throw new Error('Cannot delete default templates');
    }
    
    const deletedTemplate = templates.splice(index, 1)[0];
    return { ...deletedTemplate };
},

  async generatePreview(templateId, productData) {
    await apiDelay();
    const template = templates.find(t => t.id === parseInt(templateId));
    if (!template) {
      throw new Error('Template not found');
    }
    
    const preview = substituteVariables(template.content, productData);
    return { preview, variables: template.variables };
  },

  async getAvailableVariables() {
    await apiDelay();
    return [
      { key: 'title', label: 'Product Title', description: 'The name of the product' },
      { key: 'description', label: 'Description', description: 'Product description' },
      { key: 'sku', label: 'SKU', description: 'Stock Keeping Unit identifier' },
      { key: 'category', label: 'Category', description: 'Product category' },
      { key: 'vendor', label: 'Vendor', description: 'Product vendor/supplier' },
      { key: 'price', label: 'Price', description: 'Product price (formatted)' },
      { key: 'inventory', label: 'Inventory', description: 'Stock quantity' },
      { key: 'lastUpdated', label: 'Last Updated', description: 'Last update date (formatted)' },
      { key: 'storeId', label: 'Store ID', description: 'Associated store identifier' },
      { key: 'status', label: 'Status', description: 'Product status' }
    ];
  }
};

export default templateService;