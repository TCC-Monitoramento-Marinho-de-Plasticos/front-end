import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, ImageIcon, XCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface UploadSectionProps {
  onImageSelected: (imageUrl: string) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onImageSelected }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      const file = acceptedFiles[0];
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onImageSelected(previewUrl);
      
      toast.success('Image uploaded successfully!');
    }
  }, [onImageSelected]);

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxFiles: 1,
  });

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      {!preview ? (
        <motion.div
          {...getRootProps()}
          className={`border-2 border-dashed relative rounded-xl transition-all duration-300
            ${isDragActive 
              ? 'border-ocean-500 bg-ocean-500/10' 
              : 'border-ocean-300 dark:border-ocean-600 hover:border-ocean-500 dark:hover:border-ocean-500'} 
            bg-white/50 dark:bg-ocean-800/50 backdrop-blur-sm cursor-pointer p-8 flex flex-col items-center justify-center h-64`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <input {...getInputProps()} />
          
          <motion.div
            animate={{ 
              y: isDragActive ? -10 : 0,
              scale: isDragActive ? 1.05 : 1
            }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            {isDragActive ? (
              <div className="text-ocean-600 dark:text-ocean-400">
                <ImageIcon size={48} className="mx-auto mb-4" strokeWidth={1.5} />
                <p className="text-xl font-heading font-medium mb-1">Drop your image here</p>
                <p className="text-sm text-ocean-500 dark:text-ocean-300">
                  We'll analyze it for plastic pollution
                </p>
              </div>
            ) : (
              <div className="text-ocean-700 dark:text-ocean-300">
                <Upload size={40} className="mx-auto mb-4" strokeWidth={1.5} />
                <p className="text-xl font-heading font-medium mb-1">Upload an underwater image</p>
                <p className="text-sm text-ocean-500 dark:text-ocean-400 max-w-xs mx-auto">
                  Drag and drop or click to select an image to analyze for plastic pollution
                </p>
              </div>
            )}
          </motion.div>

          <motion.div 
            className="absolute bottom-3 left-3 text-xs text-ocean-500 dark:text-ocean-400 flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovering || isDragActive ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Info size={12} className="mr-1" /> JPG, PNG, WebP up to 5MB
          </motion.div>
        </motion.div>
      ) : (
        <motion.div 
          className="relative overflow-hidden rounded-xl shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-auto object-cover rounded-xl" 
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-ocean-900/60 text-white p-1 rounded-full hover:bg-ocean-700 transition-colors"
            aria-label="Remove image"
          >
            <XCircle size={24} />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default UploadSection;