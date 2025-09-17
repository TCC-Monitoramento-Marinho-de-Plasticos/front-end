import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import UploadSection from './components/UploadSection';
import ResultsDisplay from './components/ResultsDisplay';
import InfoSection from './components/InfoSection';
import Gallery from './components/Gallery';
import Footer from './components/Footer';
import BackgroundElements from './components/BackgroundElements';
import Dashboard from './components/Dashboard';
import { useImageProcessing } from './hooks/useImageProcessing';
import { AnalysisResult } from './types';

function App() {
  const { isProcessing, result, processImage } = useImageProcessing();
  const [previousResults, setPreviousResults] = useState<AnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);

  const handleImageSelected = (imageUrl: string) => {
    processImage(imageUrl);
    setSelectedResult(null);
  };

  // Add result to previous results when a new analysis is complete
  React.useEffect(() => {
    if (result && !isProcessing) {
      setPreviousResults(prev => {
        // Avoid duplicates
        if (prev.some(r => r.id === result.id)) {
          return prev;
        }
        return [result, ...prev].slice(0, 8); // Keep only most recent 8
      });
    }
  }, [result, isProcessing]);

  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={
          <div className="min-h-screen bg-gradient-to-b from-white to-ocean-50 dark:from-ocean-950 dark:to-ocean-900 text-ocean-900 dark:text-white transition-colors duration-300">
            <BackgroundElements />
            <Header />
            
            <main>
              <Hero />
              
              <section id="upload" className="py-16">
                <div className="container mx-auto px-4">
                  <h2 className="text-3xl font-heading font-bold text-center text-ocean-800 dark:text-white mb-8">
                    Envie uma Imagem Submarina
                  </h2>
                  <UploadSection onImageSelected={handleImageSelected} />
                  <ResultsDisplay 
                    result={selectedResult || result} 
                    isLoading={isProcessing} 
                  />
                </div>
              </section>
              
              <Gallery 
                results={previousResults} 
                onSelect={setSelectedResult}
              />
              
              <div id="info">
                <InfoSection />
              </div>
            </main>
            
            <Footer />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;