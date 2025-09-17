export interface AnalysisResult {
  id: string;
  imageUrl: string;
  plasticDetected: boolean;
  confidence: number;
  detectionAreas?: { x: number; y: number; width: number; height: number }[];
  timestamp: Date;
  location?: string;
  apiResponse?: any;
}

export interface MarineStat {
  id: number;
  title: string;
  value: string;
  description: string;
}

export type ThemeMode = 'light' | 'dark';