import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, ImageIcon, XCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import LocationSelector from './LocationSelector';

interface UploadSectionProps {
  onImageSelected: (imageUrl: string, location?: string) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onImageSelected }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      const file = acceptedFiles[0];
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, envie um arquivo de imagem');
        return;
      }
      
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('O tamanho da imagem deve ser menor que 5MB');
        return;
      }
      
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      
      toast.success('Imagem enviada com sucesso!');
    }
  }, []);

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  const handleAnalyze = () => {
    if (preview && selectedLocation) {
      onImageSelected(preview, selectedLocation);
    } else if (!selectedLocation) {
      toast.error('Por favor, selecione uma localização');
    } else if (!preview) {
      toast.error('Por favor, envie uma imagem');
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
    <div className="w-full max-w-2xl mx-auto px-4">
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
                <p className="text-xl font-heading font-medium mb-1">Solte sua imagem aqui</p>
                <p className="text-sm text-ocean-500 dark:text-ocean-300">
                  Vamos analisá-la para detectar poluição plástica
                </p>
              </div>
            ) : (
              <div className="text-ocean-700 dark:text-ocean-300">
                <Upload size={40} className="mx-auto mb-4" strokeWidth={1.5} />
                <p className="text-xl font-heading font-medium mb-1">Envie uma imagem submarina</p>
                <p className="text-sm text-ocean-500 dark:text-ocean-400 max-w-xs mx-auto">
                  Arraste e solte ou clique para selecionar uma imagem para análise de poluição plástica
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
            <Info size={12} className="mr-1" /> JPG, PNG, WebP até 5MB
          </motion.div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <motion.div 
            className="relative overflow-hidden rounded-xl shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img 
              src={preview} 
              alt="Pré-visualização" 
              className="w-full h-auto object-cover rounded-xl max-h-96" 
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-ocean-900/60 text-white p-1 rounded-full hover:bg-ocean-700 transition-colors"
              aria-label="Remover imagem"
            >
              <XCircle size={24} />
            </button>
          </motion.div>
          
          <div className="bg-white/50 dark:bg-ocean-800/50 backdrop-blur-sm rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-ocean-700 dark:text-ocean-300 mb-2">
                Localização para Análise
              </label>
              <LocationSelector 
                value={selectedLocation}
                onChange={setSelectedLocation}
              />
            </div>
            
            <button
              onClick={handleAnalyze}
              disabled={!selectedLocation}
              className="w-full px-6 py-3 bg-ocean-600 hover:bg-ocean-700 disabled:bg-ocean-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              <span>Analisar Imagem</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-5 h-5 ml-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadSection;