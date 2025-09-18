import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { AnalysisResult } from '../types';

// API endpoints with fallback
const PRIMARY_API_URL = 'http://3.225.100.118:8081/api/predict';
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
      // Converter blob URL em File
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: blob.type });

      // Montar form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('localization', location);

      let apiResponse;
      let usedFallback = false;

      try {
        // Tenta API primária
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
          // Tenta API fallback
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

      // ✅ Resposta agora é TEXTO
      const responseText = await apiResponse.text();

      // Quebrar linhas
      const lines = responseText.split('\n').map(l => l.trim());

      const predictionLine = lines.find(l => l.startsWith('Predição:'));
      const locationLine = lines.find(l => l.startsWith('Localização:'));
      const coordinatesLine = lines.find(l => l.startsWith('Coordenadas:'));

      const prediction = predictionLine?.replace('Predição:', '').trim() || 'DESCONHECIDO';
      const locationResp = locationLine?.replace('Localização:', '').trim() || location;
      const coordinates = coordinatesLine?.replace('Coordenadas:', '').trim() || '';

      const [latitude, longitude] = coordinates.split(',').map(c => c.trim());

      // Montar objeto AnalysisResult
      const analysisResult: AnalysisResult = {
        id: Math.random().toString(36).substring(2, 11),
        imageUrl,
        classification: prediction, // "SEM lixo" ou "COM lixo"
        plasticDetected: prediction.toUpperCase() !== 'SEM LIXO',
        confidence: 1, // default (já que a API não retorna)
        detectionAreas: [], // não vem na resposta
        timestamp: new Date(),
        location: locationResp,
        apiResponse: {
          raw: responseText,
          prediction,
          latitude,
          longitude,
        },
      };

      // Feedback
      if (usedFallback) {
        toast.success('Análise concluída (usando servidor local)');
      } else {
        toast.success('Análise concluída');
      }

      setResult(analysisResult);

    } catch (error) {
      console.error('Error processing image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error(`Erro ao processar imagem: ${errorMessage}`);

      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { isProcessing, result, error, processImage };
};
