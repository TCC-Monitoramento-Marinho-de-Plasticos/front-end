import React from 'react';
import { motion } from 'framer-motion';
import { MarineStat } from '../types';
import { useMarineStats } from '../hooks/useMarineStats';

const MarineStats: React.FC = () => {
  const stats = useMarineStats();
  
  return (
    <div className="bg-ocean-50 dark:bg-ocean-700/30 rounded-lg p-4">
      <h4 className="font-heading font-medium text-ocean-700 dark:text-ocean-300 mb-3">
        Fatos sobre Poluição Oceânica
      </h4>
      
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-start"
          >
            <div className="bg-ocean-100 dark:bg-ocean-600/40 text-ocean-600 dark:text-ocean-300 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              <span className="text-xs font-medium">{index + 1}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-ocean-700 dark:text-ocean-200">
                {stat.title}
              </p>
              <p className="text-xs text-ocean-600 dark:text-ocean-400 mt-1">
                {stat.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MarineStats;