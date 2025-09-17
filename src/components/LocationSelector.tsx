import React from 'react';
import { MapPin } from 'lucide-react';

interface LocationSelectorProps {
  value: string;
  onChange: (location: string) => void;
  className?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ value, onChange, className = '' }) => {
  const locations = [
    { value: 'Sao Paulo, SP, Brazil', label: 'São Paulo, SP' },
    { value: 'Rio de Janeiro, RJ, Brazil', label: 'Rio de Janeiro, RJ' },
    { value: 'Salvador, BA, Brazil', label: 'Salvador, BA' },
    { value: 'Brasilia, DF, Brazil', label: 'Brasília, DF' },
    { value: 'Fortaleza, CE, Brazil', label: 'Fortaleza, CE' },
    { value: 'Belo Horizonte, MG, Brazil', label: 'Belo Horizonte, MG' },
    { value: 'Manaus, AM, Brazil', label: 'Manaus, AM' },
    { value: 'Curitiba, PR, Brazil', label: 'Curitiba, PR' },
    { value: 'Recife, PE, Brazil', label: 'Recife, PE' },
    { value: 'Goiania, GO, Brazil', label: 'Goiânia, GO' },
    { value: 'Belem, PA, Brazil', label: 'Belém, PA' },
    { value: 'Guarulhos, SP, Brazil', label: 'Guarulhos, SP' },
    { value: 'Campinas, SP, Brazil', label: 'Campinas, SP' },
    { value: 'Sao Luis, MA, Brazil', label: 'São Luís, MA' },
    { value: 'Sao Goncalo, RJ, Brazil', label: 'São Gonçalo, RJ' },
    { value: 'Maceio, AL, Brazil', label: 'Maceió, AL' },
    { value: 'Duque de Caxias, RJ, Brazil', label: 'Duque de Caxias, RJ' },
    { value: 'Natal, RN, Brazil', label: 'Natal, RN' },
    { value: 'Teresina, PI, Brazil', label: 'Teresina, PI' },
    { value: 'Campo Grande, MS, Brazil', label: 'Campo Grande, MS' },
    { value: 'Nova Iguacu, RJ, Brazil', label: 'Nova Iguaçu, RJ' },
    { value: 'Sao Bernardo do Campo, SP, Brazil', label: 'São Bernardo do Campo, SP' },
    { value: 'Joao Pessoa, PB, Brazil', label: 'João Pessoa, PB' },
    { value: 'Santo Andre, SP, Brazil', label: 'Santo André, SP' },
    { value: 'Osasco, SP, Brazil', label: 'Osasco, SP' },
    { value: 'Jaboatao dos Guararapes, PE, Brazil', label: 'Jaboatão dos Guararapes, PE' },
    { value: 'Sao Jose dos Campos, SP, Brazil', label: 'São José dos Campos, SP' },
    { value: 'Ribeirao Preto, SP, Brazil', label: 'Ribeirão Preto, SP' },
    { value: 'Uberlandia, MG, Brazil', label: 'Uberlândia, MG' },
    { value: 'Contagem, MG, Brazil', label: 'Contagem, MG' },
    { value: 'Aracaju, SE, Brazil', label: 'Aracaju, SE' },
    { value: 'Cuiaba, MT, Brazil', label: 'Cuiabá, MT' },
    { value: 'Sorocaba, SP, Brazil', label: 'Sorocaba, SP' },
    { value: 'Feira de Santana, BA, Brazil', label: 'Feira de Santana, BA' },
    { value: 'Joinville, SC, Brazil', label: 'Joinville, SC' },
    { value: 'Juiz de Fora, MG, Brazil', label: 'Juiz de Fora, MG' },
    { value: 'Londrina, PR, Brazil', label: 'Londrina, PR' },
    { value: 'Aparecida de Goiania, GO, Brazil', label: 'Aparecida de Goiânia, GO' },
    { value: 'Niteroi, RJ, Brazil', label: 'Niterói, RJ' },
    { value: 'Ananindeua, PA, Brazil', label: 'Ananindeua, PA' },
    { value: 'Porto Alegre, RS, Brazil', label: 'Porto Alegre, RS' },
    { value: 'Florianopolis, SC, Brazil', label: 'Florianópolis, SC' },
    { value: 'Santos, SP, Brazil', label: 'Santos, SP' },
    { value: 'Vitoria, ES, Brazil', label: 'Vitória, ES' },
    { value: 'Paranagua, PR, Brazil', label: 'Paranaguá, PR' },
    // North America
    { value: 'New York, NY, USA', label: 'New York, NY' },
    { value: 'Los Angeles, CA, USA', label: 'Los Angeles, CA' },
    { value: 'Toronto, ON, Canada', label: 'Toronto, ON' },
    { value: 'Mexico City, Mexico', label: 'Mexico City' },

    // South America
    { value: 'Buenos Aires, Argentina', label: 'Buenos Aires' },
    { value: 'Lima, Peru', label: 'Lima' },
    { value: 'Bogota, Colombia', label: 'Bogotá' },
    { value: 'Santiago, Chile', label: 'Santiago' },

    // Europe
    { value: 'London, England, UK', label: 'London' },
    { value: 'Paris, France', label: 'Paris' },
    { value: 'Berlin, Germany', label: 'Berlin' },
    { value: 'Madrid, Spain', label: 'Madrid' },
    { value: 'Rome, Italy', label: 'Rome' },
    { value: 'Moscow, Russia', label: 'Moscow' },

    // Africa
    { value: 'Cairo, Egypt', label: 'Cairo' },
    { value: 'Lagos, Nigeria', label: 'Lagos' },
    { value: 'Johannesburg, South Africa', label: 'Johannesburg' },
    { value: 'Nairobi, Kenya', label: 'Nairobi' },

    // Asia
    { value: 'Tokyo, Japan', label: 'Tokyo' },
    { value: 'Beijing, China', label: 'Beijing' },
    { value: 'Shanghai, China', label: 'Shanghai' },
    { value: 'Hong Kong, China', label: 'Hong Kong' },
    { value: 'Seoul, South Korea', label: 'Seoul' },
    { value: 'Bangkok, Thailand', label: 'Bangkok' },
    { value: 'Singapore, Singapore', label: 'Singapore' },
    { value: 'Mumbai, India', label: 'Mumbai' },
    { value: 'Delhi, India', label: 'Delhi' },

    // Oceania
    { value: 'Sydney, Australia', label: 'Sydney' },
    { value: 'Melbourne, Australia', label: 'Melbourne' },
    { value: 'Auckland, New Zealand', label: 'Auckland' }

  ];

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center">
        <MapPin size={16} className="text-ocean-500 dark:text-ocean-400 mr-2 flex-shrink-0" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-ocean-700 border border-ocean-300 dark:border-ocean-600 rounded-lg text-ocean-800 dark:text-ocean-200 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
        >
          <option value="">Selecione uma localização</option>
          {locations.map((location) => (
            <option key={location.value} value={location.value}>
              {location.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LocationSelector;