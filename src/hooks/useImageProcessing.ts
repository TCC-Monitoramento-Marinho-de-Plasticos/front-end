import { useState, useCallback } from 'react';
import { AnalysisResult } from '../types';

export const useImageProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const processImage = useCallback(async (imageFile: File) => {
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      console.log('[ImageProcessing] Sending image to backend...');

      const response = await fetch('http://3.225.100.118:8080/api/predict', {
        method: 'POST',
        body: formData,
      });

      console.log('[ImageProcessing] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ImageProcessing] Error response body:', errorText);
        throw new Error(`Erro ao enviar imagem. Status: ${response.status}`);
      }

      const text = await response.text();
      console.log('[ImageProcessing] Response body:', text);

      const plasticDetected = text.trim().toLowerCase() === 'com lixo';

      const analysisResult: AnalysisResult = {
        id: Math.random().toString(36).substring(2, 11),
        imageUrl: URL.createObjectURL(imageFile),
        plasticDetected,
        confidence: plasticDetected ? 0.95 : 0.99,
        detectionAreas: [],
        timestamp: new Date(),
      };

      console.log('[ImageProcessing] Analysis result:', analysisResult);
      setResult(analysisResult);

    } catch (error) {
      console.error('[ImageProcessing] Failed to process image:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { isProcessing, result, processImage };
};