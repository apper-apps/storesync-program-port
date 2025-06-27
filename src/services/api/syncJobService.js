import { delay } from '@/utils/helpers';
import syncJobData from '@/services/mockData/syncJobs.json';

const apiDelay = () => delay(Math.random() * 300 + 200);

let syncJobs = [...syncJobData];

export const syncJobService = {
  async getAll() {
    await apiDelay();
    return [...syncJobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getById(id) {
    await apiDelay();
    const job = syncJobs.find(j => j.Id === parseInt(id));
    if (!job) {
      throw new Error('Sync Job not found');
    }
    return { ...job };
  },

  async create(jobData) {
    await apiDelay();
    const maxId = Math.max(...syncJobs.map(j => j.Id), 0);
    const newJob = {
      Id: maxId + 1,
      ...jobData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null
    };
    syncJobs.push(newJob);
    return { ...newJob };
  },

  async update(id, jobData) {
    await apiDelay();
    const index = syncJobs.findIndex(j => j.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Sync Job not found');
    }
    syncJobs[index] = { 
      ...syncJobs[index], 
      ...jobData,
      Id: syncJobs[index].Id,
      updatedAt: new Date().toISOString()
    };
    return { ...syncJobs[index] };
  },

  async startJob(id) {
    await apiDelay();
    const job = await this.update(id, {
      status: 'processing',
      startedAt: new Date().toISOString()
    });
    
    // Simulate job processing
    setTimeout(async () => {
      const isSuccessful = Math.random() > 0.15; // 85% success rate
      await this.update(id, {
        status: isSuccessful ? 'completed' : 'failed',
        completedAt: new Date().toISOString(),
        details: {
          ...job.details,
          processed: isSuccessful ? job.details.totalItems : Math.floor(job.details.totalItems * 0.7),
          errors: isSuccessful ? 0 : Math.floor(job.details.totalItems * 0.3)
        }
      });
    }, 2000 + Math.random() * 3000);
    
    return job;
  },

  async getRecentActivity(limit = 10) {
    await apiDelay();
    return [...syncJobs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }
};

export default syncJobService;