export interface AnalysisResult {
  id: string;
  imageUrl: string;
  classification: string;   // <- "SEM lixo" | "COM lixo"
  plasticDetected: boolean;
  confidence: number;
  detectionAreas: any[];
  timestamp: Date;
  location?: string;
  apiResponse: any;
}

export interface MarineStat {
  id: number;
  title: string;
  value: string;
  description: string;
}

export type ThemeMode = 'light' | 'dark';