import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Droplets } from 'lucide-react';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300 bg-white/90 dark:bg-ocean-800/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Droplets 
            size={32} 
            className="text-ocean-600 dark:text-ocean-400" 
            strokeWidth={1.5}
          />
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-ocean-800 dark:text-white">
              Ocean Guardian
            </h1>
            <p className="text-xs text-ocean-600 dark:text-ocean-400 font-medium">
              Plastic Pollution Detection
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-ocean-100 dark:bg-ocean-700 text-ocean-600 dark:text-ocean-300 hover:bg-ocean-200 dark:hover:bg-ocean-600 transition-colors"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <Moon size={20} />
            ) : (
              <Sun size={20} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;