import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { X, MapPin, Calendar, Package, Zap, Home, BarChart3, AlertTriangle, TrendingUp, Loader2 } from 'lucide-react';

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
  reports?: WasteReport[];
  mostCommonType: string;
  typeDistribution: { [key: string]: number };
}

interface SummaryData {
  totalReports: number;
  totalLocations: number;
  criticalArea: string;
  reportsInCriticalArea: number;
  mostCommonResidueType: string;
  mostCommonResidueQuantity: number;
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
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch locations data
  const fetchLocations = async () => {
    try {
      setIsLoadingLocations(true);
      const response = await fetch('http://44.215.6.82:8081/api/locations', {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch locations: ${response.status}`);
      }

      const locations: LocationData[] = await response.json();
      setLocationData(locations);
      setError(null);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch locations');
      // Fallback to mock data if API fails
      setLocationData([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  // Fetch summary data
  const fetchSummary = async () => {
    try {
      setIsLoadingSummary(true);
      const response = await fetch('http://44.215.6.82:8081/api/summary', {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch summary: ${response.status}`);
      }

      const summary: SummaryData = await response.json();
      setSummaryData(summary);
      setError(null);
    } catch (err) {
      console.error('Error fetching summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch summary');
      // Fallback to mock data if API fails
      setSummaryData({
        totalReports: 0,
        totalLocations: 0,
        criticalArea: 'N/A',
        reportsInCriticalArea: 0,
        mostCommonResidueType: 'N/A',
        mostCommonResidueQuantity: 0,
      });
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchLocations();
    fetchSummary();
  }, []);

  // Convert coordinates lat/lon to 3D position on globe
  const latLonToVector3 = (lat: number, lon: number, radius: number = 1) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    
    return new THREE.Vector3(x, y, z);
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current || locationData.length === 0) return;

    // Clear existing points
    pointsRef.current.forEach(point => {
      if (globeRef.current) {
        globeRef.current.remove(point);
      }
    });
    pointsRef.current = [];

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Globe
    const globeGroup = new THREE.Group();
    globeRef.current = globeGroup;
    scene.add(globeGroup);

    // Earth geometry and material
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load(
      'https://unpkg.com/three-globe/example/img/earth-day.jpg',
      (texture) => {
        const material = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.8,
          metalness: 0.1,
        });

        const earth = new THREE.Mesh(geometry, material);
        globeGroup.add(earth);

        // Atmosphere
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

    // Add location points from API data
    locationData.forEach((location) => {
      const typeColors: { [key: string]: number } = {
        'Garrafas PET': 0xff4500,
        'Plásticos Descartáveis': 0xffff00,
        'Redes de Pesca': 0x00ff00,
        'Microplásticos Visíveis': 0x00ffff,
        'Outros': 0xff00ff
      };
      
      const position = latLonToVector3(location.lat, location.lon, 1.02);
      
      // Point size based on number of reports
      const pointSize = Math.max(0.02, Math.min(0.05, 0.02 + (location.totalReports * 0.008)));
      
      const pointGeometry = new THREE.SphereGeometry(pointSize, 16, 16);
      const pointMaterial = new THREE.MeshBasicMaterial({ 
        color: typeColors[location.mostCommonType] || 0xffffff
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
    if (!reports || reports.length === 0) return 'N/A';
    
    const dates = reports.map(r => new Date(r.timestamp)).sort((a, b) => a.getTime() - b.getTime());
    const oldest = dates[0];
    const newest = dates[dates.length - 1];
    
    if (dates.length === 1) {
      return formatDate(oldest.toISOString());
    }
    
    return `${oldest.toLocaleDateString('pt-BR')} - ${newest.toLocaleDateString('pt-BR')}`;
  };

  // Loading state
  if (isLoadingLocations || isLoadingSummary) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Carregando Dashboard</h2>
          <p className="text-gray-400">
            {isLoadingLocations && 'Carregando localizações...'}
            {isLoadingSummary && 'Carregando estatísticas...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && locationData.length === 0 && !summaryData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erro ao Carregar Dados</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => {
                fetchLocations();
                fetchSummary();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Tentar Novamente
            </button>
            <a 
              href="/"
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors inline-block"
            >
              Voltar ao Início
            </a>
          </div>
        </div>
      </div>
    );
  }

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
                <p className="text-2xl font-bold text-white">
                  {summaryData?.totalReports || 0}
                </p>
              </div>
              <AlertTriangle size={32} className="text-red-400" />
            </div>
          </div>

          {/* Localizações Monitoradas */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Localizações</p>
                <p className="text-2xl font-bold text-white">
                  {summaryData?.totalLocations || locationData.length}
                </p>
              </div>
              <MapPin size={32} className="text-blue-400" />
            </div>
          </div>

          {/* Tipo Mais Reportado */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tipo Mais Comum</p>
                <p className="text-lg font-bold text-white">
                  {summaryData?.mostCommonResidueType || 'N/A'}
                </p>
                <p className="text-sm text-gray-400">
                  {summaryData?.mostCommonResidueQuantity || 0} ocorrências
                </p>
              </div>
              <Package size={32} className="text-orange-400" />
            </div>
          </div>

          {/* Área Crítica */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Área Crítica</p>
                <p className="text-lg font-bold text-white">
                  {summaryData?.criticalArea?.split(',')[0] || 'N/A'}
                </p>
                <p className="text-sm text-gray-400">
                  {summaryData?.reportsInCriticalArea || 0} relatos
                </p>
              </div>
              <TrendingUp size={32} className="text-red-400" />
            </div>
          </div>
        </div>

        {/* Distribuição por Tipo */}
{locationData.length > 0 && (
  <div className="mt-6 w-full px-0">
    <h3 className="text-lg font-semibold mb-3">Distribuição por Tipo de Resíduo</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
      {Object.entries(
        locationData.reduce((acc, location) => {
          Object.entries(location.typeDistribution).forEach(([type, count]) => {
            acc[type] = (acc[type] || 0) + count;
          });
          return acc;
        }, {} as Record<string, number>)
      ).map(([type, count], _, arr) => {
        const totalReports = Object.values(
          locationData.reduce((acc, location) => {
            Object.entries(location.typeDistribution).forEach(([t, c]) => {
              acc[t] = (acc[t] || 0) + c;
            });
            return acc;
          }, {} as Record<string, number>)
        ).reduce((sum, c) => sum + c, 0);

        return (
          <div key={type} className="bg-gray-700 p-3 rounded-lg text-center w-full">
            <p className="text-sm text-gray-400">{type}</p>
            <p className="text-xl font-bold text-white">{count}</p>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: `${totalReports > 0 ? (count / totalReports) * 100 : 0}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
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

                  {selectedLocation.reports && (
                    <div className="flex items-center">
                      <Calendar className="mr-3 text-green-500" size={20} />
                      <div>
                        <p className="text-sm text-gray-400">Período dos Relatos</p>
                        <p className="font-semibold text-sm">{getDateRange(selectedLocation.reports)}</p>
                      </div>
                    </div>
                  )}

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
              <li>• Clique nos pontos coloridos para ver dados regionais</li>
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