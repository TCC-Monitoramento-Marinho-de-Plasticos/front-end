import { useState, useEffect } from 'react';
import { MarineStat } from '../types';

export const useMarineStats = () => {
  const [stats, setStats] = useState<MarineStat[]>([]);

  useEffect(() => {
    // In a real app, these could come from an API
    const marineStats: MarineStat[] = [
      {
        id: 1,
        title: "8 milhões de toneladas de plástico entram nos oceanos anualmente",
        description: "Isso equivale a despejar um caminhão de lixo de plástico no oceano a cada minuto.",
        value: "8M tons"
      },
      {
        id: 2,
        title: "Mais de 5 trilhões de pedaços de plástico poluem nossos oceanos",
        description: "Essas peças pesam mais de 250.000 toneladas e ameaçam a vida marinha em todo o mundo.",
        value: "5T+ peças"
      },
      {
        id: 3,
        title: "Mais de 700 espécies marinhas afetadas pela poluição plástica",
        description: "Do menor plâncton às maiores baleias, a poluição plástica impacta a vida marinha.",
        value: "700+ espécies"
      }
    ];
    
    setStats(marineStats);
  }, []);

  return stats;
};