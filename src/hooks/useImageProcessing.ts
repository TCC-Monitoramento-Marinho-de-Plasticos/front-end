import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { AnalysisResult } from '../types';

// API endpoints with fallback
const PRIMARY_API_URL = 'http://3.225.100.118:8080/api/predict';
const FALLBACK_API_URL = 'http://localhost:8081/api/predict';

export const useImageProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processImage = useCallback(async (imageUrl: string, location?: string) => {
    if (!location) {
      toast.error('Por favor, selecione uma localização antes de analisar a imagem');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      // Convert blob URL to File object
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: blob.type });
      
      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('localization', location);
      
      let apiResponse;
      let usedFallback = false;
      
      try {
        // Try primary API first
        apiResponse = await fetch(PRIMARY_API_URL, {
          method: 'POST',
          body: formData,
        });
        
        if (!apiResponse.ok) {
          throw new Error(`Primary API failed: ${apiResponse.status}`);
        }
      } catch (primaryError) {
        console.warn('Primary API failed, trying fallback:', primaryError);
        usedFallback = true;
        
        try {
          // Try fallback API
          apiResponse = await fetch(FALLBACK_API_URL, {
            method: 'POST',
            body: formData,
          });
          
          if (!apiResponse.ok) {
            throw new Error(`Fallback API failed: ${apiResponse.status}`);
          }
        } catch (fallbackError) {
          throw new Error(`Both APIs failed. Primary: ${primaryError}. Fallback: ${fallbackError}`);
        }
      }
      
      const data = await apiResponse.json();
      
      // Show success message with API info
      if (usedFallback) {
        toast.success('Análise concluída (usando servidor local)');
      } else {
        toast.success('Análise concluída');
      }
      
      // Parse API response and create AnalysisResult
      const analysisResult: AnalysisResult = {
        id: Math.random().toString(36).substring(2, 11),
        imageUrl,
        plasticDetected: data.plastic_detected || false,
        confidence: data.confidence || 0,
        detectionAreas: data.detection_areas || [],
        timestamp: new Date(),
        location: location,
        apiResponse: data
      };
      
      setResult(analysisResult);
      
    } catch (error) {
      console.error('Error processing image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error(`Erro ao processar imagem: ${errorMessage}`);
      
      // Set a null result to clear any previous results
      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  }, []);
  
  return { isProcessing, result, error, processImage };
};