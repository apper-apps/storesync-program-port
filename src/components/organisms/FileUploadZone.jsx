import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import ProgressRing from '@/components/atoms/ProgressRing';

const FileUploadZone = ({ 
  onFileSelect, 
  acceptedTypes = ['.xlsx', '.xls', '.csv'],
  maxFileSize = 10,
  className = '' 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const validateFile = (file) => {
    // Check file size (in MB)
    if (file.size > maxFileSize * 1024 * 1024) {
      throw new Error(`File size must be less than ${maxFileSize}MB`);
    }

    // Check file type
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      throw new Error(`File type not supported. Accepted types: ${acceptedTypes.join(', ')}`);
    }

    return true;
  };

  const simulateUpload = (file) => {
    return new Promise((resolve) => {
      setIsUploading(true);
      setUploadProgress(0);
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          if (newProgress >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            setUploadedFile(file);
            resolve(file);
            return 100;
          }
          return newProgress;
        });
      }, 200);
    });
  };

  const handleFiles = async (files) => {
    const file = files[0];
    if (!file) return;

    try {
      validateFile(file);
      await simulateUpload(file);
      
      if (onFileSelect) {
        onFileSelect(file);
      }
      
      toast.success('File uploaded successfully!');
    } catch (error) {
      toast.error(error.message);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  return (
    <div className={className}>
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        animate={{ 
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? '#5046E5' : '#4B5563'
        }}
        className="relative border-2 border-dashed border-surface-600 rounded-lg p-8 text-center transition-all duration-200 hover:border-surface-500"
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <ProgressRing 
                progress={uploadProgress} 
                size={80}
                color="#5046E5"
                backgroundColor="#374151"
              />
            </div>
            <div>
              <p className="text-lg font-medium text-white">Uploading...</p>
              <p className="text-sm text-surface-400">
                {uploadedFile?.name || 'Processing file'}
              </p>
            </div>
          </div>
        ) : uploadedFile ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-success/10 rounded-2xl flex items-center justify-center">
              <ApperIcon name="CheckCircle" className="w-8 h-8 text-success" />
            </div>
            <div>
              <p className="text-lg font-medium text-white">File uploaded successfully!</p>
              <p className="text-sm text-surface-400">{uploadedFile.name}</p>
              <p className="text-xs text-surface-500 mt-1">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="flex space-x-2 justify-center">
              <Button variant="primary" size="sm">
                Process File
              </Button>
              <Button variant="outline" size="sm" onClick={resetUpload}>
                Upload Different File
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
                <ApperIcon name="Upload" className="w-8 h-8 text-primary" />
              </div>
            </motion.div>
            
            <div>
              <p className="text-lg font-medium text-white mb-2">
                Drop your price sheet here
              </p>
              <p className="text-surface-400 mb-4">
                or click to browse files
              </p>
              <p className="text-xs text-surface-500">
                Supports {acceptedTypes.join(', ')} • Max {maxFileSize}MB
              </p>
            </div>
            
            <input
              type="file"
              multiple={false}
              accept={acceptedTypes.join(',')}
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <Button
              variant="primary"
              icon="Upload"
              onClick={() => document.querySelector('input[type="file"]').click()}
            >
              Select File
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FileUploadZone;