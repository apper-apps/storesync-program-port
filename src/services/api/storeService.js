import { delay } from '@/utils/helpers';
import storeData from '@/services/mockData/stores.json';

// Simulate API delay
const apiDelay = () => delay(Math.random() * 300 + 200);

let stores = [...storeData];

export const storeService = {
  async getAll() {
    await apiDelay();
    return [...stores];
  },

  async getById(id) {
    await apiDelay();
    const store = stores.find(s => s.Id === parseInt(id));
    if (!store) {
      throw new Error('Store not found');
    }
    return { ...store };
  },

  async create(storeData) {
    await apiDelay();
    const maxId = Math.max(...stores.map(s => s.Id), 0);
    const newStore = {
      Id: maxId + 1,
      ...storeData,
      createdAt: new Date().toISOString(),
      lastSync: null
    };
    stores.push(newStore);
    return { ...newStore };
  },

  async update(id, storeData) {
    await apiDelay();
    const index = stores.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Store not found');
    }
    stores[index] = { 
      ...stores[index], 
      ...storeData,
      Id: stores[index].Id, // Preserve ID
      updatedAt: new Date().toISOString()
    };
    return { ...stores[index] };
  },

  async delete(id) {
    await apiDelay();
    const index = stores.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Store not found');
    }
    const deletedStore = stores.splice(index, 1)[0];
    return { ...deletedStore };
  },

  async testConnection(storeId) {
    await apiDelay();
    const store = stores.find(s => s.Id === parseInt(storeId));
    if (!store) {
      throw new Error('Store not found');
    }
    
    // Simulate connection test
    const isSuccessful = Math.random() > 0.3; // 70% success rate
    if (!isSuccessful) {
      throw new Error('Failed to connect to store. Please check your API credentials.');
    }
    
    return { 
      success: true, 
      message: 'Connection successful',
      timestamp: new Date().toISOString()
    };
  }
};

export default storeService;