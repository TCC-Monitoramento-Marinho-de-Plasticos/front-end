import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Share2 } from 'lucide-react';
import { AnalysisResult } from '../types';
import MarineStats from './MarineStats';

interface ResultsDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-ocean-200 dark:border-ocean-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-ocean-500 rounded-full animate-spin"></div>
        </div>
        <div className="mt-6 relative">
          <div className="h-1 w-48 bg-ocean-200 dark:bg-ocean-700 rounded-full overflow-hidden">
            <div className="h-full bg-ocean-500 rounded-full w-1/2 animate-wave"></div>
          </div>
        </div>
        <p className="mt-4 text-ocean-700 dark:text-ocean-300 font-medium">Analyzing image...</p>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <motion.div 
      className="mt-10 w-full max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white dark:bg-ocean-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-ocean-800 dark:text-white">
              Analysis Results
            </h2>
            <button 
              className="flex items-center px-4 py-2 text-sm rounded-lg bg-ocean-100 dark:bg-ocean-700 text-ocean-600 dark:text-ocean-300 hover:bg-ocean-200 dark:hover:bg-ocean-600 transition-colors"
              aria-label="Share results"
            >
              <Share2 size={16} className="mr-2" />
              Share
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={result.imageUrl} 
                  alt="Analyzed image" 
                  className="w-full h-auto object-cover rounded-lg" 
                />
                
                {result.detectionAreas && result.detectionAreas.length > 0 && result.plasticDetected && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {result.detectionAreas.map((area, index) => (
                      <rect 
                        key={index}
                        x={`${area.x}%`}
                        y={`${area.y}%`}
                        width={`${area.width}%`}
                        height={`${area.height}%`}
                        stroke="#FF7863"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray="5,5"
                        className="animate-pulse"
                      />
                    ))}
                  </svg>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="mb-6 flex items-center">
                <div className={`p-3 rounded-full ${result.plasticDetected ? 'bg-coral-100 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'} mr-4`}>
                  {result.plasticDetected ? (
                    <AlertTriangle size={28} />
                  ) : (
                    <CheckCircle size={28} />
                  )}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-ocean-800 dark:text-white">
                    {result.plasticDetected ? 'Plastic Detected' : 'No Plastic Detected'}
                  </h3>
                  <p className="text-ocean-600 dark:text-ocean-400">
                    {result.plasticDetected 
                      ? `Confidence: ${(result.confidence * 100).toFixed(1)}%`
                      : 'This image appears to be pollution-free'}
                  </p>
                </div>
              </div>
              
              <div className="bg-ocean-50 dark:bg-ocean-700/30 p-4 rounded-lg mb-6">
                <h4 className="font-heading font-medium text-ocean-700 dark:text-ocean-300 mb-2">
                  Analysis Summary
                </h4>
                <p className="text-ocean-600 dark:text-ocean-400 text-sm">
                  {result.plasticDetected 
                    ? "Our system has identified potential plastic pollution in this underwater image. The highlighted areas show where plastic debris may be present. This type of pollution poses significant threats to marine ecosystems."
                    : "This underwater environment appears to be free from visible plastic pollution. Healthy marine ecosystems are vital for ocean biodiversity and planetary health."}
                </p>
              </div>
              
              <MarineStats />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsDisplay;