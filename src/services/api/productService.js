import { delay } from '@/utils/helpers';
import productData from '@/services/mockData/products.json';

const apiDelay = () => delay(Math.random() * 300 + 200);

let products = [...productData];

export const productService = {
  async getAll() {
    await apiDelay();
    return [...products];
  },

  async getByStoreId(storeId) {
    await apiDelay();
    const storeProducts = products.filter(p => p.storeId === parseInt(storeId));
    return [...storeProducts];
  },

  async getById(id) {
    await apiDelay();
    const product = products.find(p => p.Id === parseInt(id));
    if (!product) {
      throw new Error('Product not found');
    }
    return { ...product };
  },

  async create(productData) {
    await apiDelay();
    const maxId = Math.max(...products.map(p => p.Id), 0);
    const newProduct = {
      Id: maxId + 1,
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    products.push(newProduct);
    return { ...newProduct };
  },

  async update(id, productData) {
    await apiDelay();
    const index = products.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Product not found');
    }
    products[index] = { 
      ...products[index], 
      ...productData,
      Id: products[index].Id,
      updatedAt: new Date().toISOString()
    };
    return { ...products[index] };
  },

  async delete(id) {
    await apiDelay();
    const index = products.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Product not found');
    }
    const deletedProduct = products.splice(index, 1)[0];
    return { ...deletedProduct };
  },

  async bulkUpdate(updates) {
    await apiDelay();
    const updatedProducts = [];
    
    for (const update of updates) {
      const index = products.findIndex(p => p.Id === parseInt(update.Id));
      if (index !== -1) {
        products[index] = { 
          ...products[index], 
          ...update,
          Id: products[index].Id,
          updatedAt: new Date().toISOString()
        };
        updatedProducts.push({ ...products[index] });
      }
    }
    
    return updatedProducts;
  }
};

export default productService;