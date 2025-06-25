import { useState, useEffect } from 'react';
import { MarineStat } from '../types';

export const useMarineStats = () => {
  const [stats, setStats] = useState<MarineStat[]>([]);

  useEffect(() => {
    // In a real app, these could come from an API
    const marineStats: MarineStat[] = [
      {
        id: 1,
        title: "8 million tons of plastic enter oceans annually",
        description: "That's equivalent to dumping a garbage truck of plastic into the ocean every minute.",
        value: "8M tons"
      },
      {
        id: 2,
        title: "Over 5 trillion plastic pieces pollute our oceans",
        description: "These pieces weigh over 250,000 tons and threaten marine life worldwide.",
        value: "5T+ pieces"
      },
      {
        id: 3,
        title: "700+ marine species affected by plastic pollution",
        description: "From the smallest plankton to the largest whales, plastic pollution impacts marine life.",
        value: "700+ species"
      }
    ];
    
    setStats(marineStats);
  }, []);

  return stats;
};