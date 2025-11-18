// Dashboard.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  X, MapPin, Calendar, Package, Home, BarChart3, AlertTriangle,
  TrendingUp, Loader2, Star, Leaf, Activity, Circle
} from 'lucide-react';

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
  residueRate: number;
  cleanestArea: string;
  cleanestAreaReports: number;
  trendMap: { [date: string]: number };
  changeRate: number;
  totalCleanReports: number;
  totalDirtyReports: number;
}

const Dashboard: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeRef = useRef<THREE.Group | null>(null);
  const pointsRef = useRef<THREE.Mesh[]>([]);
  const controlsRef = useRef<any>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const mouseRef = useRef<THREE.Vector2 | null>(null);

  // state
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- Fetches ----------
  const fetchLocations = async () => {
    try {
      setIsLoadingLocations(true);
      const res = await fetch('http://localhost:8081/api/locations');
      if (!res.ok) throw new Error(`Failed to fetch locations (${res.status})`);
      const data: LocationData[] = await res.json();
      setLocationData(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to fetch locations');
      setLocationData([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const fetchSummary = async () => {
    try {
      setIsLoadingSummary(true);
      const res = await fetch('http://localhost:8081/api/summary');
      if (!res.ok) throw new Error(`Failed to fetch summary (${res.status})`);
      const data: SummaryData = await res.json();
      setSummaryData(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to fetch summary');
      setSummaryData({
        totalReports: 0,
        totalLocations: 0,
        criticalArea: 'N/A',
        reportsInCriticalArea: 0,
        residueRate: 0,
        cleanestArea: 'N/A',
        cleanestAreaReports: 0,
        trendMap: {},
        changeRate: 0,
        totalCleanReports: 0,
        totalDirtyReports: 0
      });
    } finally {
      setIsLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Helpers ----------
  const latLonToVector3 = (lat: number, lon: number, radius = 1) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  // Build sparkline path from trendMap
  const buildSparklinePath = (trendMap: { [date: string]: number } | undefined, width = 120, height = 34) => {
    if (!trendMap || Object.keys(trendMap).length === 0) return { path: '', viewBox: `0 0 ${width} ${height}` };

    const entries = Object.entries(trendMap)
      .map(([d, v]) => ({ date: new Date(d), value: v }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const values = entries.map(e => e.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const spacing = width / Math.max(1, values.length - 1);
    const points = values.map((val, i) => {
      const x = i * spacing;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return [x, y];
    });

    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');
    return { path, viewBox: `0 0 ${width} ${height}` };
  };

  const formatPercent = (n?: number) => (typeof n === 'number' ? `${n.toFixed(1)}%` : 'N/A');

  const formatDateRange = (reports?: WasteReport[]) => {
    if (!reports || reports.length === 0) return 'N/A';
    const dates = reports.map(r => new Date(r.timestamp)).sort((a, b) => a.getTime() - b.getTime());
    if (dates.length === 1) return dates[0].toLocaleString('pt-BR');
    return `${dates[0].toLocaleDateString('pt-BR')} - ${dates[dates.length - 1].toLocaleDateString('pt-BR')}`;
  };

  // ---------- Three.js initialization ----------
  useEffect(() => {
    if (!mountRef.current || locationData.length === 0) return;

    // cleanup previous renderer
    pointsRef.current.forEach(pt => {
      if (globeRef.current) globeRef.current.remove(pt);
      pt.geometry.dispose();
      // material dispose will be handled by renderer dispose on cleanup
    });
    pointsRef.current = [];

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 3);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setClearColor(0x071019, 1); // dark background
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(5, 3, 5);
    scene.add(dir);

    const globeGroup = new THREE.Group();
    globeRef.current = globeGroup;
    scene.add(globeGroup);

    // Earth
    const geo = new THREE.SphereGeometry(1, 64, 64);
    const loader = new THREE.TextureLoader();
    loader.load('https://unpkg.com/three-globe/example/img/earth-day.jpg', (tex) => {
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, metalness: 0.05 });
      const earth = new THREE.Mesh(geo, mat);
      globeGroup.add(earth);

      const atm = new THREE.Mesh(
        new THREE.SphereGeometry(1.02, 64, 64),
        new THREE.MeshBasicMaterial({ color: 0x79b0ff, transparent: true, opacity: 0.06, side: THREE.BackSide })
      );
      globeGroup.add(atm);
    });

    // Points
    const typeColors: { [key: string]: number } = {
      'Garrafas PET': 0xff6b6b,
      'Plásticos Descartáveis': 0xffd166,
      'Redes de Pesca': 0x6be58a,
      'Microplásticos Visíveis': 0x6bdfe5,
      'Outros': 0xc77dff,
    };

    locationData.forEach(loc => {
      const pos = latLonToVector3(loc.lat, loc.lon, 1.02);
      const size = Math.max(0.02, Math.min(0.06, 0.02 + (loc.totalReports * 0.008)));
      const g = new THREE.SphereGeometry(size, 12, 12);
      const m = new THREE.MeshStandardMaterial({ color: typeColors[loc.mostCommonType] || 0xffffff, emissive: 0x071019, roughness: 0.6 });
      const mesh = new THREE.Mesh(g, m);
      mesh.position.copy(pos);
      (mesh.userData as any).payload = loc;
      globeGroup.add(mesh);
      pointsRef.current.push(mesh);
    });

    // orbit controls - try to get from global, else try dynamic import
    let OrbitControls: any = null;
    try {
      OrbitControls = (window as any).THREE?.OrbitControls;
    } catch (e) { OrbitControls = null; }
    if (!OrbitControls) {
      try {
        // dynamic import from examples (works with bundlers)
        // @ts-ignore
        const oc = require('three/examples/jsm/controls/OrbitControls');
        OrbitControls = oc.OrbitControls;
      } catch (e) {
        console.warn('OrbitControls not found - panning will not work');
      }
    }

    const controls = OrbitControls ? new OrbitControls(camera, renderer.domElement) : null;
    if (controls) {
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.enablePan = false;
      controls.minDistance = 1.5;
      controls.maxDistance = 8;
    }
    controlsRef.current = controls;

    // raycaster + mouse
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    raycasterRef.current = raycaster;
    mouseRef.current = mouse;

    const onClick = (ev: MouseEvent) => {
      if (!renderer.domElement) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(pointsRef.current, true);
      if (intersects.length > 0) {
        const obj = intersects[0].object;
        const payload: LocationData | undefined = (obj.userData as any).payload;
        if (payload) setSelectedLocation(payload);
      }
    };

    renderer.domElement.addEventListener('click', onClick);

    // animate
    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (globeGroup) globeGroup.rotation.y += 0.0006;
      if (controls) controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // cleanup
    return () => {
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('click', onClick);
      cancelAnimationFrame(rafId);
      try {
        mountRef.current?.removeChild(renderer.domElement);
      } catch (e) { /* ignore */ }
      renderer.dispose();
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      globeRef.current = null;
    };

    // dependency on locationData only
  }, [locationData]);

  // ---------- Loading / Error UI ----------
  if (isLoadingLocations || isLoadingSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#071019] to-[#0b1220] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={56} className="animate-spin text-white/80 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold">Carregando Painel</h2>
          <p className="text-sm text-white/70 mt-2">
            {isLoadingLocations && 'Carregando localizações...'} {isLoadingSummary && 'Carregando estatísticas...'}
          </p>
        </div>
      </div>
    );
  }

  if (error && !summaryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#071019] to-[#0b1220] text-white flex items-center justify-center">
        <div className="bg-[#0e1a26] p-8 rounded-xl shadow-xl max-w-md text-center">
          <AlertTriangle size={48} className="mx-auto text-red-400" />
          <h3 className="mt-4 text-xl font-semibold">Erro ao carregar dados</h3>
          <p className="text-sm text-white/70 mt-2">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => { fetchLocations(); fetchSummary(); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">Tentar novamente</button>
            <a href="/" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">Voltar</a>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Render Dashboard ----------
  const spark = buildSparklinePath(summaryData?.trendMap);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071019] to-[#0b1220] text-white">
      {/* HEADER */}
      <header className="p-6 border-b border-white/6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-[#00c6ff] to-[#0072ff] p-3 rounded-xl shadow-lg">
              <Star size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Painel de Monitoramento - Resíduos Costeiros</h1>
              <p className="text-sm text-white/70">Visão geral e tendências</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 bg-white/6 hover:bg-white/10 px-4 py-2 rounded-lg">
              <Home size={16} /> Voltar ao Início
            </a>
          </div>
        </div>
      </header>

      {/* CARDS GRID - Option A (4 cols x 2 rows) */}
      <section className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Reports */}
          <div className="bg-gradient-to-br from-[#0f1724] to-[#08101a] p-5 rounded-2xl shadow-lg transform hover:-translate-y-1 transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/60">Total de Relatos</p>
                <p className="text-3xl font-bold mt-2">{summaryData?.totalReports ?? 0}</p>
                <p className="text-xs text-white/60 mt-2">Relatos acumulados</p>
              </div>
              <div className="bg-gradient-to-br from-[#ff7a7a] to-[#ff4d4d] p-3 rounded-lg shadow-md">
                <Activity size={28} className="text-white" />
              </div>
            </div>
          </div>

          {/* Card 2: Total Locations */}
          <div className="bg-gradient-to-br from-[#0f1724] to-[#08101a] p-5 rounded-2xl shadow-lg transform hover:-translate-y-1 transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/60">Localizações Monitoradas</p>
                <p className="text-3xl font-bold mt-2">{summaryData?.totalLocations ?? 0}</p>
                <p className="text-xs text-white/60 mt-2">Regiões únicas</p>
              </div>
              <div className="bg-gradient-to-br from-[#6be58a] to-[#22c55e] p-3 rounded-lg shadow-md">
                <MapPin size={28} className="text-white" />
              </div>
            </div>
          </div>

          {/* Card 3: Critical Area */}
          <div className="bg-gradient-to-br from-[#0f1724] to-[#08101a] p-5 rounded-2xl shadow-lg transform hover:-translate-y-1 transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/60">Área Crítica</p>
                <p className="text-lg font-semibold mt-2">{summaryData?.criticalArea ?? 'N/A'}</p>
                <p className="text-xs text-white/60 mt-2">{summaryData?.reportsInCriticalArea ?? 0} relatos críticos</p>
              </div>
              <div className="bg-gradient-to-br from-[#ffb86b] to-[#ff7a00] p-3 rounded-lg shadow-md">
                <AlertTriangle size={28} className="text-white" />
              </div>
            </div>
          </div>

          {/* Card 4: Cleanest Area */}
          <div className="bg-gradient-to-br from-[#0f1724] to-[#08101a] p-5 rounded-2xl shadow-lg transform hover:-translate-y-1 transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/60">Área Mais Limpa</p>
                <p className="text-lg font-semibold mt-2">{summaryData?.cleanestArea ?? 'N/A'}</p>
                <p className="text-xs text-white/60 mt-2">{summaryData?.cleanestAreaReports ?? 0} relatos limpos</p>
              </div>
              <div className="bg-gradient-to-br from-[#7be3ff] to-[#4aa8ff] p-3 rounded-lg shadow-md">
                <Leaf size={28} className="text-white" />
              </div>
            </div>
          </div>

          {/* Card 5: Residue Rate */}
          <div className="bg-gradient-to-br from-[#081623] to-[#071220] p-5 rounded-2xl shadow-lg transform hover:-translate-y-1 transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/60">Taxa de Resíduos</p>
                <p className="text-3xl font-bold mt-2 text-red-400">{formatPercent(summaryData?.residueRate)}</p>
                <p className="text-xs text-white/60 mt-2">Porcentagem de relatos com resíduo</p>
              </div>
              <div className="bg-gradient-to-br from-[#ff6b6b] to-[#ff3d3d] p-3 rounded-lg shadow-md">
                <Circle size={28} className="text-white" />
              </div>
            </div>
          </div>

          {/* Card 6: Weekly Change */}
          <div className="bg-gradient-to-br from-[#081623] to-[#071220] p-5 rounded-2xl shadow-lg transform hover:-translate-y-1 transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/60">Variação Semanal</p>
                <p className="text-3xl font-bold mt-2 text-blue-300">{summaryData?.changeRate ?? 0}%</p>
                <p className="text-xs text-white/60 mt-2">Comparação com semana anterior</p>
              </div>
              <div className="bg-gradient-to-br from-[#60a5fa] to-[#3b82f6] p-3 rounded-lg shadow-md">
                <TrendingUp size={28} className="text-white" />
              </div>
            </div>
            {/* small sparkline */}
            <div className="mt-4">
              <svg viewBox={spark.viewBox} width="100%" height="34" className="opacity-90">
                <path d={spark.path} fill="none" stroke="#60a5fa" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                {/* optional area under the curve */}
              </svg>
            </div>
          </div>

          {/* Card 7: Clean Reports */}
          <div className="bg-gradient-to-br from-[#081623] to-[#071220] p-5 rounded-2xl shadow-lg transform hover:-translate-y-1 transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/60">Relatos Limpos</p>
                <p className="text-3xl font-bold mt-2 text-green-300">{summaryData?.totalCleanReports ?? 0}</p>
                <p className="text-xs text-white/60 mt-2">Registros sem resíduo</p>
              </div>
              <div className="bg-gradient-to-br from-[#9be7a3] to-[#34d399] p-3 rounded-lg shadow-md">
                <MapPin size={28} className="text-white" />
              </div>
            </div>
          </div>

          {/* Card 8: Dirty Reports */}
          <div className="bg-gradient-to-br from-[#081623] to-[#071220] p-5 rounded-2xl shadow-lg transform hover:-translate-y-1 transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/60">Relatos Sujos</p>
                <p className="text-3xl font-bold mt-2 text-red-300">{summaryData?.totalDirtyReports ?? 0}</p>
                <p className="text-xs text-white/60 mt-2">Registros com resíduo</p>
              </div>
              <div className="bg-gradient-to-br from-[#ff8a8a] to-[#ff6b6b] p-3 rounded-lg shadow-md">
                <AlertTriangle size={28} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN: Globe + Sidebar */}
      <main className="relative h-[calc(100vh-320px)]"> {/* leave room for header + cards */}
        <div ref={mountRef} className="w-full h-full" />

        {/* Sidebar */}
        <aside className={`fixed top-28 left-6 w-96 bg-[#071526]/95 backdrop-blur-md border border-white/6 rounded-2xl p-6 transition-transform z-30
            ${selectedLocation ? 'translate-x-0' : '-translate-x-96'}`}>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Dados da Região</h3>
            <button onClick={() => setSelectedLocation(null)} className="p-2 rounded-md hover:bg-white/6">
              <X size={18} />
            </button>
          </div>

          {!selectedLocation && (
            <div className="text-sm text-white/60">
              Clique em um ponto no globo para ver detalhes da região.
            </div>
          )}

          {selectedLocation && (
            <div>
              <div className="mb-4">
                <img src="https://placehold.co/800x400/111827/9CA3AF?text=Foto+da+região" alt="região" className="w-full rounded-lg" />
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-white/60">Localização</p>
                  <p className="font-semibold">{selectedLocation.location}</p>
                </div>

                <div>
                  <p className="text-xs text-white/60">Coordenadas</p>
                  <p className="text-sm">{selectedLocation.lat.toFixed(4)}°, {selectedLocation.lon.toFixed(4)}°</p>
                </div>

                <div>
                  <p className="text-xs text-white/60">Total de Relatos</p>
                  <p className="text-lg font-semibold">{selectedLocation.totalReports}</p>
                </div>

                {selectedLocation.reports && (
                  <div>
                    <p className="text-xs text-white/60">Período dos relatos</p>
                    <p className="text-sm">{formatDateRange(selectedLocation.reports)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </main>

      {/* small footer */}
      <footer className="p-4 text-xs text-white/60 text-center">
        Dados e visualização — Painel· {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Dashboard;