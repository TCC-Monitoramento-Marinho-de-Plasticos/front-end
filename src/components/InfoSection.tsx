import React from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Droplets, Fish, TreePine } from 'lucide-react';

const InfoSection: React.FC = () => {
  const infoItems = [
    {
      icon: <Fish className="w-10 h-10 text-ocean-500" />,
      title: "Marine Life Impact",
      description: "Plastic pollution harms countless marine species through entanglement and ingestion."
    },
    {
      icon: <Droplets className="w-10 h-10 text-ocean-500" />,
      title: "Water Quality",
      description: "Microplastics contaminate our water sources and can enter the human food chain."
    },
    {
      icon: <CloudRain className="w-10 h-10 text-ocean-500" />,
      title: "Ecosystem Disruption",
      description: "Pollution disrupts delicate ocean ecosystems and coral reefs worldwide."
    },
    {
      icon: <TreePine className="w-10 h-10 text-ocean-500" />,
      title: "Conservation Efforts",
      description: "Identifying pollution hotspots helps target cleanup and prevention efforts."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <section className="py-16 bg-ocean-50 dark:bg-ocean-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-ocean-800 dark:text-white mb-4">
            Why Ocean Protection Matters
          </h2>
          <p className="text-ocean-600 dark:text-ocean-300">
            Plastic pollution poses a serious threat to marine ecosystems worldwide. Understanding and identifying this pollution is the first step to effective action.
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {infoItems.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white dark:bg-ocean-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="bg-ocean-100 dark:bg-ocean-700/50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-lg font-heading font-bold text-ocean-700 dark:text-ocean-300 mb-2">
                {item.title}
              </h3>
              <p className="text-ocean-600 dark:text-ocean-400 text-sm">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default InfoSection;