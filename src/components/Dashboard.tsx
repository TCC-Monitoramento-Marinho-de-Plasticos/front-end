import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { X, MapPin, Calendar, Package, Zap, Home, BarChart3, AlertTriangle, TrendingUp } from 'lucide-react';

interface WasteReport {
  id: string;
  lat: number;
  lon: number;
  type: string;
  timestamp: string;
  location: string;
}

interface LocationData {
  location: string;
  lat: number;
  lon: number;
  totalReports: number;
  reports: WasteReport[];
  mostCommonType: string;
  typeDistribution: { [key: string]: number };
}

const Dashboard: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const globeRef = useRef<THREE.Group>();
  const controlsRef = useRef<any>();
  const pointsRef = useRef<THREE.Mesh[]>([]);
  const raycasterRef = useRef<THREE.Raycaster>();
  const mouseRef = useRef<THREE.Vector2>();
  
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');

  // Dados simulados de relatos de resíduos costeiros (expandidos)
  const wasteReports: WasteReport[] = [
    // Rio de Janeiro - múltiplos relatos
    {
      id: 'RJ001',
      lat: -22.9068,
      lon: -43.1729,
      type: 'Garrafas PET',
      timestamp: '2024-01-15T10:30:00Z',
      location: 'Rio de Janeiro, RJ'
    },
    {
      id: 'RJ002',
      lat: -22.9068,
      lon: -43.1729,
      type: 'Plásticos Descartáveis',
      timestamp: '2024-01-14T14:20:00Z',
      location: 'Rio de Janeiro, RJ'
    },
    {
      id: 'RJ003',
      lat: -22.9068,
      lon: -43.1729,
      type: 'Garrafas PET',
      timestamp: '2024-01-13T09:15:00Z',
      location: 'Rio de Janeiro, RJ'
    },
    {
      id: 'RJ004',
      lat: -22.9068,
      lon: -43.1729,
      type: 'Redes de Pesca',
      timestamp: '2024-01-12T16:45:00Z',
      location: 'Rio de Janeiro, RJ'
    },
    // Santos - múltiplos relatos
    {
      id: 'SP001',
      lat: -23.9608,
      lon: -46.3331,
      type: 'Redes de Pesca',
      timestamp: '2024-01-14T14:20:00Z',
      location: 'Santos, SP'
    },
    {
      id: 'SP002',
      lat: -23.9608,
      lon: -46.3331,
      type: 'Redes de Pesca',
      timestamp: '2024-01-13T11:30:00Z',
      location: 'Santos, SP'
    },
    {
      id: 'SP003',
      lat: -23.9608,
      lon: -46.3331,
      type: 'Plásticos Descartáveis',
      timestamp: '2024-01-12T08:45:00Z',
      location: 'Santos, SP'
    },
    // Florianópolis
    {
      id: 'SC001',
      lat: -27.5954,
      lon: -48.5480,
      type: 'Plásticos Descartáveis',
      timestamp: '2024-01-13T09:15:00Z',
      location: 'Florianópolis, SC'
    },
    {
      id: 'SC002',
      lat: -27.5954,
      lon: -48.5480,
      type: 'Microplásticos Visíveis',
      timestamp: '2024-01-11T15:20:00Z',
      location: 'Florianópolis, SC'
    },
    // São Luís
    {
      id: 'MA001',
      lat: -2.5387,
      lon: -44.2825,
      type: 'Microplásticos Visíveis',
      timestamp: '2024-01-12T16:45:00Z',
      location: 'São Luís, MA'
    },
    // Paranaguá
    {
      id: 'PR001',
      lat: -25.5163,
      lon: -48.5108,
      type: 'Outros',
      timestamp: '2024-01-11T11:30:00Z',
      location: 'Paranaguá, PR'
    },
    // Salvador
    {
      id: 'BA001',
      lat: -12.9714,
      lon: -38.5014,
      type: 'Garrafas PET',
      timestamp: '2024-01-10T13:20:00Z',
      location: 'Salvador, BA'
    },
    {
      id: 'BA002',
      lat: -12.9714,
      lon: -38.5014,
      type: 'Plásticos Descartáveis',
      timestamp: '2024-01-09T10:15:00Z',
      location: 'Salvador, BA'
    }
  ];

  // Agregar dados por localização
  const locationData: LocationData[] = React.useMemo(() => {
    const grouped = wasteReports.reduce((acc, report) => {
      const key = report.location;
      if (!acc[key]) {
        acc[key] = {
          location: report.location,
          lat: report.lat,
          lon: report.lon,
          totalReports: 0,
          reports: [],
          mostCommonType: '',
          typeDistribution: {}
        };
      }
      
      acc[key].totalReports++;
      acc[key].reports.push(report);
      
      // Contar tipos
      if (!acc[key].typeDistribution[report.type]) {
        acc[key].typeDistribution[report.type] = 0;
      }
      acc[key].typeDistribution[report.type]++;
      
      return acc;
    }, {} as { [key: string]: LocationData });

    // Determinar tipo mais comum para cada localização
    Object.values(grouped).forEach(location => {
      let maxCount = 0;
      let mostCommon = '';
      
      Object.entries(location.typeDistribution).forEach(([type, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommon = type;
        }
      });
      
      location.mostCommonType = mostCommon;
    });

    return Object.values(grouped);
  }, []);

  // Calcular estatísticas gerais
  const totalReports = wasteReports.length;
  const totalLocations = locationData.length;
  const typeStats = wasteReports.reduce((acc, report) => {
    acc[report.type] = (acc[report.type] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  
  const mostReportedType = Object.entries(typeStats).reduce((a, b) => 
    typeStats[a[0]] > typeStats[b[0]] ? a : b
  )[0];

  const locationWithMostReports = locationData.reduce((a, b) => 
    a.totalReports > b.totalReports ? a : b
  );

  // Converter coordenadas lat/lon para posição 3D no globo
  const latLonToVector3 = (lat: number, lon: number, radius: number = 1) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    
    return new THREE.Vector3(x, y, z);
  };

  // Inicializar Three.js
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x0a0a0a);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // luz geral uniforme
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 3, 5); // luz suave
    scene.add(directionalLight);

    // Globe
    const globeGroup = new THREE.Group();
    globeRef.current = globeGroup;
    scene.add(globeGroup);

    // Earth geometry and material
    const geometry = new THREE.SphereGeometry(1, 64, 64);
  const textureLoader = new THREE.TextureLoader();

  textureLoader.load(
    'https://unpkg.com/three-globe/example/img/earth-day.jpg', // textura clara
    (texture) => {
      // Material claro, com volume suave
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.8,   // superfície mais fosca
        metalness: 0.1,   // pouco metalizado
      });

      const earth = new THREE.Mesh(geometry, material);
      globeGroup.add(earth);

      // Atmosfera sutil
      const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.02, 64, 64),
        new THREE.MeshBasicMaterial({
          color: 0x87ceeb,
          transparent: true,
          opacity: 0.1,
          side: THREE.BackSide,
        })
      );
      globeGroup.add(atmosphere);
    }
  );

    // Add location points (agregados)
    locationData.forEach((location) => {
      const typeColors: { [key: string]: number } = {
      'Garrafas PET': 0xff4500,       // laranja
      'Plásticos Descartáveis': 0xffff00, // amarelo
      'Redes de Pesca': 0x00ff00,     // verde
      'Microplásticos Visíveis': 0x00ffff, // ciano
      'Outros': 0xff00ff               // rosa
    };
      const position = latLonToVector3(location.lat, location.lon, 1.02);
      
      // Tamanho do ponto baseado no número de relatos
      const pointSize = Math.max(0.02, Math.min(0.05, 0.02 + (location.totalReports * 0.008)));
      
      const pointGeometry = new THREE.SphereGeometry(pointSize, 16, 16);
      const pointMaterial = new THREE.MeshBasicMaterial({ 
        color: typeColors[location.mostCommonType] || 0xffffff // branco se não definido
      });
      const point = new THREE.Mesh(pointGeometry, pointMaterial);
      
      point.position.copy(position);
      point.userData = location;
      
      globeGroup.add(point);
      pointsRef.current.push(point);
    });

    // Controls (OrbitControls)
    const OrbitControls = (window as any).THREE.OrbitControls;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controlsRef.current = controls;

    // Raycaster for mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    raycasterRef.current = raycaster;
    mouseRef.current = mouse;

    // Mouse click handler
    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(pointsRef.current);

      if (intersects.length > 0) {
        const selectedPoint = intersects[0].object;
        setSelectedLocation(selectedPoint.userData as LocationData);
        setAnalysis(''); // Reset analysis when selecting new location
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Auto rotation
      if (globeGroup) {
        globeGroup.rotation.y += 0.0005;
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [locationData]);

  const generateAnalysis = async () => {
    if (!selectedLocation) return;
    
    setIsAnalyzing(true);
    
    // Simular análise de IA baseada nos dados agregados
    setTimeout(() => {
      const analyses = [
        `Análise Consolidada - ${selectedLocation.location}:\n\nEsta região apresenta ${selectedLocation.totalReports} relatos de poluição marinha, com predominância de "${selectedLocation.mostCommonType}". A concentração de resíduos indica possível fonte de poluição sistemática. Recomenda-se:\n\n• Monitoramento intensificado da área\n• Implementação de programas de limpeza regular\n• Identificação e controle das fontes de poluição\n• Engajamento da comunidade local para prevenção`,
        
        `Relatório de Impacto Regional - ${selectedLocation.location}:\n\nCom ${selectedLocation.totalReports} ocorrências registradas, esta área requer atenção prioritária. O tipo mais comum "${selectedLocation.mostCommonType}" representa ${Math.round((selectedLocation.typeDistribution[selectedLocation.mostCommonType] / selectedLocation.totalReports) * 100)}% dos casos.\n\nImpactos identificados:\n• Ameaça à fauna marinha local\n• Degradação do ecossistema costeiro\n• Possível impacto no turismo e pesca\n\nAções recomendadas: implementação de barreiras de contenção e programas educacionais.`,
        
        `Avaliação Ambiental Detalhada - ${selectedLocation.location}:\n\nAnálise de ${selectedLocation.totalReports} relatos revela padrão preocupante de poluição. A diversidade de tipos de resíduos (${Object.keys(selectedLocation.typeDistribution).length} categorias diferentes) sugere múltiplas fontes de contaminação.\n\nTendências observadas:\n• Concentração elevada de resíduos plásticos\n• Possível influência de correntes marítimas\n• Necessidade de intervenção coordenada\n\nRecomenda-se parceria entre órgãos ambientais, prefeitura e ONGs para ação efetiva.`
      ];
      
      const randomAnalysis = analyses[Math.floor(Math.random() * analyses.length)];
      setAnalysis(randomAnalysis);
      setIsAnalyzing(false);
    }, 2500);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDateRange = (reports: WasteReport[]) => {
    const dates = reports.map(r => new Date(r.timestamp)).sort((a, b) => a.getTime() - b.getTime());
    const oldest = dates[0];
    const newest = dates[dates.length - 1];
    
    if (dates.length === 1) {
      return formatDate(oldest.toISOString());
    }
    
    return `${oldest.toLocaleDateString('pt-BR')} - ${newest.toLocaleDateString('pt-BR')}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header com botão Home */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">
            Painel de Monitoramento de Resíduos Costeiros
          </h1>
          <a 
            href="/"
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Home size={20} className="mr-2" />
            Voltar ao Início
          </a>
        </div>
        <p className="text-gray-400 text-center">
          Visualização interativa de relatos de poluição marinha no Brasil
        </p>
      </div>

      {/* Seção de Estatísticas */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <BarChart3 size={24} className="mr-2 text-blue-400" />
          <h2 className="text-xl font-bold">Estatísticas Gerais</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total de Relatos */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Relatos</p>
                <p className="text-2xl font-bold text-white">{totalReports}</p>
              </div>
              <AlertTriangle size={32} className="text-red-400" />
            </div>
          </div>

          {/* Localizações Monitoradas */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Localizações</p>
                <p className="text-2xl font-bold text-white">{totalLocations}</p>
              </div>
              <MapPin size={32} className="text-blue-400" />
            </div>
          </div>

          {/* Tipo Mais Reportado */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tipo Mais Comum</p>
                <p className="text-lg font-bold text-white">{mostReportedType}</p>
                <p className="text-sm text-gray-400">{typeStats[mostReportedType]} ocorrências</p>
              </div>
              <Package size={32} className="text-orange-400" />
            </div>
          </div>

          {/* Área Crítica */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Área Crítica</p>
                <p className="text-lg font-bold text-white">{locationWithMostReports.location.split(',')[0]}</p>
                <p className="text-sm text-gray-400">{locationWithMostReports.totalReports} relatos</p>
              </div>
              <TrendingUp size={32} className="text-red-400" />
            </div>
          </div>
        </div>

        {/* Distribuição por Tipo */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Distribuição por Tipo de Resíduo</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(typeStats).map(([type, count]) => (
              <div key={type} className="bg-gray-700 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-400">{type}</p>
                <p className="text-xl font-bold text-white">{count}</p>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${(count / totalReports) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative h-screen">
        {/* 3D Globe Container */}
        <div 
          ref={mountRef} 
          className="w-full h-full cursor-grab active:cursor-grabbing"
          style={{ cursor: 'grab' }}
        />

        {/* Sidebar para dados agregados */}
        <div className={`fixed top-0 left-0 h-full w-96 bg-gray-800 border-r border-gray-700 transform transition-transform duration-500 ease-in-out z-10 ${
          selectedLocation ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-6 h-full overflow-y-auto custom-scrollbar">
            {/* Close Button */}
            <button
              onClick={() => setSelectedLocation(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            {selectedLocation && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-6">Dados da Região</h2>
                
                {/* Image Placeholder */}
                <div className="mb-6">
                  <img 
                    src="https://placehold.co/600x400/374151/E5E7EB?text=Vista+da+Região"
                    alt="Vista da região"
                    className="w-full rounded-lg"
                  />
                </div>

                {/* Dados Agregados */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <MapPin className="mr-3 text-blue-500" size={20} />
                    <div>
                      <p className="text-sm text-gray-400">Localização</p>
                      <p className="font-semibold">{selectedLocation.location}</p>
                      <p className="text-xs text-gray-500">
                        {selectedLocation.lat.toFixed(4)}°, {selectedLocation.lon.toFixed(4)}°
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Package className="mr-3 text-orange-500" size={20} />
                    <div>
                      <p className="text-sm text-gray-400">Total de Relatos</p>
                      <p className="font-semibold text-xl">{selectedLocation.totalReports}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <AlertTriangle className="mr-3 text-red-500" size={20} />
                    <div>
                      <p className="text-sm text-gray-400">Tipo Mais Comum</p>
                      <p className="font-semibold">{selectedLocation.mostCommonType}</p>
                      <p className="text-xs text-gray-500">
                        {selectedLocation.typeDistribution[selectedLocation.mostCommonType]} de {selectedLocation.totalReports} relatos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="mr-3 text-green-500" size={20} />
                    <div>
                      <p className="text-sm text-gray-400">Período dos Relatos</p>
                      <p className="font-semibold text-sm">{getDateRange(selectedLocation.reports)}</p>
                    </div>
                  </div>

                  {/* Distribuição de Tipos */}
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">Distribuição por Tipo</p>
                    <div className="space-y-2">
                      {Object.entries(selectedLocation.typeDistribution).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-sm">{type}</span>
                          <div className="flex items-center">
                            <span className="text-sm mr-2">{count}</span>
                            <div className="w-16 bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-orange-500 h-2 rounded-full" 
                                style={{ width: `${(count / selectedLocation.totalReports) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        {!selectedLocation && (
          <div className="absolute bottom-6 left-6 bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg max-w-sm">
            <h3 className="font-semibold mb-2">Como usar:</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Arraste para rotacionar o globo</li>
              <li>• Use a roda do mouse para zoom</li>
              <li>• Clique nos pontos laranja para ver dados regionais</li>
              <li>• Pontos maiores = mais relatos na região</li>
            </ul>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6B7280;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9CA3AF;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;