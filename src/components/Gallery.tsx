import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { AnalysisResult } from '../types';

interface GalleryProps {
  results: AnalysisResult[];
  onSelect: (result: AnalysisResult) => void;
}

const Gallery: React.FC<GalleryProps> = ({ results, onSelect }) => {
  if (!results.length) return null;
  
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-heading font-bold text-ocean-800 dark:text-white mb-6">
          Recent Analyses
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((result) => (
            <motion.div 
              key={result.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
              onClick={() => onSelect(result)}
              className="cursor-pointer group rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img 
                  src={result.imageUrl} 
                  alt="Analyzed underwater image" 
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute top-2 right-2 p-1 rounded-full bg-white/90 dark:bg-ocean-900/90">
                  {result.plasticDetected ? (
                    <AlertTriangle size={16} className="text-coral-600" />
                  ) : (
                    <CheckCircle size={16} className="text-green-500" />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ocean-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-white text-xs font-medium">
                    {result.plasticDetected ? 'Plastic detected' : 'No plastic found'}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;