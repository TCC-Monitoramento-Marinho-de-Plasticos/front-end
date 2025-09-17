import React from 'react';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center bg-ocean-100/80 dark:bg-ocean-800/50 backdrop-blur-sm text-ocean-600 dark:text-ocean-300 rounded-full px-4 py-2 mb-6"
          >
            <Droplets size={20} className="mr-2" />
            <span className="text-sm font-medium">Detecção de Poluição Marinha com IA</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-ocean-900 dark:text-white mb-6 leading-tight"
          >
            Detecte Poluição Plástica em Nossos Oceanos
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-lg text-ocean-700 dark:text-ocean-300 mb-8 max-w-2xl mx-auto"
          >
            Envie imagens submarinas para identificar poluição plástica com nossa tecnologia avançada de detecção. Ajude a proteger nossos oceanos contribuindo para a pesquisa de poluição marinha.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a 
              href="#upload"
              className="px-6 py-3 bg-ocean-600 hover:bg-ocean-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all group flex items-center justify-center"
            >
              <span>Analisar uma Imagem</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <a 
              href="#info"
              className="px-6 py-3 bg-transparent border border-ocean-300 dark:border-ocean-600 text-ocean-600 dark:text-ocean-300 hover:bg-ocean-100 dark:hover:bg-ocean-800/50 font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              Saiba Mais
            </a>
          </motion.div>
        </div>
      </div>
      
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ocean-50/80 to-white/30 dark:from-ocean-900/50 dark:to-ocean-950/80" />
    </section>
  );
};

export default Hero;