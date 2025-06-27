import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import StatusBadge from '@/components/atoms/StatusBadge';
import SearchBar from '@/components/molecules/SearchBar';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import syncJobService from '@/services/api/syncJobService';
import { formatDate, formatRelativeTime } from '@/utils/helpers';

const History = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const jobTypes = [
    { value: 'price_update', label: 'Price Updates', icon: 'DollarSign' },
    { value: 'inventory_sync', label: 'Inventory Sync', icon: 'Package' },
    { value: 'description_generation', label: 'AI Descriptions', icon: 'Bot' },
    { value: 'image_optimization', label: 'Image Optimization', icon: 'Image' },
    { value: 'full_sync', label: 'Full Sync', icon: 'RefreshCw' }
  ];

  const statusTypes = ['all', 'pending', 'processing', 'completed', 'failed'];

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, statusFilter, typeFilter]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await syncJobService.getAll();
      setJobs(data);
    } catch (err) {
      setError(err.message || 'Failed to load history');
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.details.source && job.details.source.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(job => job.type === typeFilter);
    }

    setFilteredJobs(filtered);
  };

  const getJobIcon = (type) => {
    const jobType = jobTypes.find(t => t.value === type);
    return jobType ? jobType.icon : 'Activity';
  };

  const getJobTypeLabel = (type) => {
    const jobType = jobTypes.find(t => t.value === type);
    return jobType ? jobType.label : type;
  };

  const handleExport = () => {
    // In a real app, this would generate and download a CSV/Excel file
    toast.info('Export functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-8">
          <div className="w-48 h-8 bg-surface-700 rounded animate-pulse mb-2"></div>
          <div className="w-96 h-4 bg-surface-700 rounded animate-pulse"></div>
        </div>
        
        <SkeletonLoader type="table" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to load history"
          message={error}
          onRetry={loadHistory}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Activity History</h1>
          <p className="text-surface-400">
            View all synchronization jobs and AI operations
          </p>
        </div>
        
        <Button
          variant="outline"
          icon="Download"
          onClick={handleExport}
        >
          Export History
        </Button>
      </div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-surface border border-surface-700 rounded-lg p-6 mb-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-surface-800 rounded-lg">
            <p className="text-2xl font-bold text-white">{jobs.length}</p>
            <p className="text-xs text-surface-400">Total Jobs</p>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-lg border border-success/20">
            <p className="text-2xl font-bold text-success">
              {jobs.filter(j => j.status === 'completed').length}
            </p>
            <p className="text-xs text-success/80">Completed</p>
          </div>
          <div className="text-center p-3 bg-info/10 rounded-lg border border-info/20">
            <p className="text-2xl font-bold text-info">
              {jobs.filter(j => j.status === 'processing').length}
            </p>
            <p className="text-xs text-info/80">In Progress</p>
          </div>
          <div className="text-center p-3 bg-danger/10 rounded-lg border border-danger/20">
            <p className="text-2xl font-bold text-danger">
              {jobs.filter(j => j.status === 'failed').length}
            </p>
            <p className="text-xs text-danger/80">Failed</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="bg-dark-surface border border-surface-700 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <SearchBar
            placeholder="Search jobs..."
            onSearch={setSearchQuery}
            className="flex-1 lg:max-w-md"
          />
          
          <div className="flex space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-dark-surface border border-surface-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            >
              <option value="all">All Status</option>
              {statusTypes.slice(1).map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-dark-surface border border-surface-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            >
              <option value="all">All Types</option>
              {jobTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      {filteredJobs.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-surface border border-surface-700 rounded-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-700">
              <thead className="bg-surface-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="bg-dark-surface divide-y divide-surface-700">
                {filteredJobs.map((job, index) => (
                  <motion.tr
                    key={job.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-surface-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                          <ApperIcon 
                            name={getJobIcon(job.type)} 
                            className="w-5 h-5 text-secondary" 
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">
                            {job.title}
                          </p>
                          <p className="text-xs text-surface-400 truncate">
                            {job.details.source || 'System operation'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-300">
                      {getJobTypeLabel(job.type)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-300">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-surface-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              job.status === 'completed' ? 'bg-success' :
                              job.status === 'failed' ? 'bg-danger' :
                              job.status === 'processing' ? 'bg-info' :
                              'bg-surface-600'
                            }`}
                            style={{ 
                              width: `${job.details.totalItems > 0 ? (job.details.processed / job.details.totalItems) * 100 : 0}%` 
                            }}
                          />
                        </div>
                        <span className="text-xs min-w-0">
                          {job.details.processed || 0}/{job.details.totalItems || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-400">
                      {formatRelativeTime(job.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-400">
                      {job.completedAt && job.startedAt
                        ? `${Math.round((new Date(job.completedAt) - new Date(job.startedAt)) / 1000)}s`
                        : job.status === 'processing' 
                        ? 'Running...' 
                        : '-'
                      }
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <EmptyState
          icon="Clock"
          title="No activity found"
          description={
            searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? "No jobs match your current filters. Try adjusting your search criteria."
              : "No synchronization jobs have been run yet. Upload a price sheet or run a sync to see activity here."
          }
          actionLabel={searchQuery || statusFilter !== 'all' || typeFilter !== 'all' ? "Clear Filters" : "Upload Price Sheet"}
          onAction={() => {
            if (searchQuery || statusFilter !== 'all' || typeFilter !== 'all') {
              setSearchQuery('');
              setStatusFilter('all');
              setTypeFilter('all');
            } else {
              window.location.href = '/price-sheets';
            }
          }}
        />
      )}
    </div>
  );
};

export default History;