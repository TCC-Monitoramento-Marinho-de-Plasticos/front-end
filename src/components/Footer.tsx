import React from 'react';
import { Github, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-ocean-800 dark:bg-ocean-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
              <h3 className="text-xl font-heading font-bold">Ocean Guardian</h3>
            </div>
            <p className="text-ocean-200 text-sm text-center md:text-left max-w-md">
              Ajudando a identificar e combater a poluição plástica em nossos oceanos 
              através de tecnologia avançada de reconhecimento de imagem.
            </p>
          </div>
          
          <div>
            <div className="flex flex-col items-center md:items-end">
              <div className="flex space-x-4 mb-4">
                <a 
                  href="#"
                  className="text-ocean-300 hover:text-white transition-colors duration-200"
                  aria-label="GitHub"
                >
                  <Github size={20} />
                </a>
              </div>
              <p className="text-ocean-300 text-sm flex items-center">
                Feito com <Heart size={14} className="mx-1 text-coral-500" /> pelos nossos oceanos
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-ocean-700">
          <p className="text-center text-ocean-400 text-sm">
            © {new Date().getFullYear()} Ocean Guardian. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;