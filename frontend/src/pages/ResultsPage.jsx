import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import apiService from '../services/apiService';

const ResultsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const requestedId = queryParams.get('id');

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      try {
        let targetId = requestedId;
        if (!targetId) {
          const response = await apiService.getResults();
          if (response.cached_runs && response.cached_runs.length > 0) {
            targetId = response.cached_runs[0];
          }
        }

        if (targetId) {
          const data = await apiService.getResultFile(targetId);
          setResult(data);
        }
      } catch (error) {
        console.error("Failed to fetch results", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [requestedId]);

  // Initialize Map with WebMesh Connection logic
  useEffect(() => {
    if (!result || !mapRef.current || mapInstance.current) return;

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      const L = window.L;
      const towers = result.optimized_towers || [];
      if (towers.length === 0) return;

      const latAvg = towers.reduce((sum, t) => sum + t.lat, 0) / towers.length;
      const lngAvg = towers.reduce((sum, t) => sum + t.lng, 0) / towers.length;

      mapInstance.current = L.map(mapRef.current, {
        attributionControl: false,
        zoomControl: false
      }).setView([latAvg, lngAvg], 14);

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      }).addTo(mapInstance.current);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        pane: 'shadowPane'
      }).addTo(mapInstance.current);

      const towerIcon = L.divIcon({
        className: 'custom-tower-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-10 h-10 bg-yellow-400/30 rounded-full animate-ping"></div>
            <div class="w-5 h-5 bg-yellow-400 rounded-full border-2 border-[#0f172a] shadow-[0_0_15px_rgba(250,204,21,0.5)] relative z-10"></div>
            <div class="absolute -bottom-1.5 w-1.5 h-4 bg-yellow-400 rounded-full blur-[1px]"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      // Helper for Arcs
      const getArcPoints = (p1, p2) => {
        const points = [];
        const n = 20;
        const lat1 = p1[0], lng1 = p1[1], lat2 = p2[0], lng2 = p2[1];
        const midLat = (lat1 + lat2) / 2;
        const midLng = (lng1 + lng2) / 2;
        const dx = lat2 - lat1;
        const dy = lng2 - lng1;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const offset = dist * 0.2;
        const arcLat = midLat + (dy / dist) * offset;
        const arcLng = midLng - (dx / dist) * offset;

        for (let i = 0; i <= n; i++) {
          const t = i / n;
          const lat = (1-t)*(1-t)*lat1 + 2*(1-t)*t*arcLat + t*t*lat2;
          const lng = (1-t)*(1-t)*lng1 + 2*(1-t)*t*arcLng + t*t*lng2;
          points.push([lat, lng]);
        }
        return points;
      };

      // Mesh Connection Logic
      const connections = [];
      towers.forEach((tower, i) => {
        const others = towers
          .map((t, idx) => ({ ...t, idx, dist: Math.sqrt(Math.pow(t.lat - tower.lat, 2) + Math.pow(t.lng - tower.lng, 2)) }))
          .filter(t => t.idx !== i)
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 4);

        others.forEach(other => {
          const connectionId = [i, other.idx].sort().join('-');
          if (!connections.includes(connectionId)) {
            connections.push(connectionId);
            const arcPoints = getArcPoints([tower.lat, tower.lng], [other.lat, other.lng]);
            L.polyline(arcPoints, {
              color: '#facc15',
              weight: 2,
              opacity: 0.6,
              lineCap: 'round',
              className: 'mesh-line'
            }).addTo(mapInstance.current);
          }
        });

        L.marker([tower.lat, tower.lng], { icon: towerIcon })
          .bindPopup(`
            <div class="p-2 font-bold text-slate-900 uppercase">
              <p class="text-[8px] text-slate-400 mb-1 tracking-widest">Site Intel</p>
              <p class="text-xs">Alt: ${tower.height_m.toFixed(1)}m</p>
              <p class="text-xs">Tx: ${tower.power_dbm.toFixed(1)} dBm</p>
            </div>
          `)
          .addTo(mapInstance.current);
      });
    };
    document.head.appendChild(script);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [result]);

  const handleExportPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-6">
        <div className="w-16 h-16 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Dataset...</p>
      </div>
    );
  }

  if (!result) return null;

  const { metrics, optimized_towers } = result;
  
  const metricCards = [
    { label: 'Avg Throughput', value: metrics.avg_snr_db ? (20 * Math.log2(1 + Math.pow(10, metrics.avg_snr_db / 10))).toFixed(1) : '0.0', unit: 'Mbps', icon: 'speed', color: 'text-blue-600' },
    { label: 'Coverage Area', value: (metrics.coverage_percent || metrics.coverage_score * 100 || 0).toFixed(1), unit: '%', icon: 'radar', color: 'text-yellow-600' },
    { label: 'Average SNR', value: metrics.avg_snr_db?.toFixed(1) || '0.0', unit: 'dB', icon: 'signal_cellular_alt', color: 'text-slate-900' },
    { label: 'Interference', value: metrics.interference_score?.toFixed(2) || '0.00', unit: 'Score', icon: 'waves', color: 'text-red-500' },
    { label: 'Active Sites', value: optimized_towers.length, unit: '', icon: 'apartment', color: 'text-slate-900' },
  ];

  return (
    <div className="p-10 max-w-[1600px] mx-auto space-y-10 font-plus-jakarta animate-in fade-in duration-700 print:m-0 print:p-0">
      <div className="flex justify-between items-end print:hidden">
        <div className="max-w-4xl">
          <span className="inline-block px-4 py-1 rounded-full bg-yellow-400/10 text-yellow-600 font-bold text-[10px] mb-3 border border-yellow-400/20 uppercase tracking-widest">Post-Process Analytics</span>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-4">
            Network Analytics
          </h1>
          <p className="text-xl font-medium text-slate-500 leading-relaxed">
            Comprehensive post-simulation analysis for the <span className="text-slate-900 font-bold uppercase">{result.city}</span> cluster. Validating throughput, coverage density, and spectral efficiency.
          </p>
        </div>
        <button onClick={handleExportPDF} className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-3 shadow-xl active:scale-95">
          <span className="material-symbols-outlined text-lg">picture_as_pdf</span> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {metricCards.map((metric, index) => (
          <div key={index} className="bg-white p-7 rounded-[32px] border border-slate-200 shadow-sm group hover:border-yellow-400 transition-all">
            <div className={`w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 ${metric.color} mb-5 group-hover:bg-yellow-400 group-hover:text-slate-900 transition-colors`}>
              <span className="material-symbols-outlined text-xl">{metric.icon}</span>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{metric.label}</p>
            <div className="flex items-baseline gap-1.5 mt-2">
              <h3 className="text-4xl font-black text-slate-900">{metric.value}</h3>
              {metric.unit && <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{metric.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0f172a] p-10 rounded-[40px] border border-slate-800 shadow-2xl relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
           <span className="material-symbols-outlined text-9xl text-yellow-400">query_stats</span>
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-8">
            <div>
               <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-2 block">Real-time Analysis</span>
               <h3 className="text-3xl font-black text-white tracking-tight">Spectral Intensity Monitor</h3>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-32">
              {[...Array(60)].map((_, i) => {
                const snrFactor = metrics.avg_snr_db ? (metrics.avg_snr_db + 100) / 100 : 0.5;
                const baseHeight = 20 + (Math.sin(i * 0.2) + 1) * 30 * snrFactor;
                return (
                  <div 
                    key={i} 
                    className="flex-1 bg-yellow-400 rounded-t-sm"
                    style={{ 
                      height: `${baseHeight + Math.random() * 20}%`,
                      opacity: 0.4 + (Math.random() * 0.6),
                      animation: `freq-bounce ${0.5 + Math.random() * 1}s infinite alternate ease-in-out`,
                      animationDelay: `${i * 0.02}s`
                    }}
                  ></div>
                );
              })}
            </div>
          </div>
        </div>
  
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-8 bg-white rounded-[40px] border border-slate-200 overflow-hidden relative h-[650px] shadow-sm">
             <div className="absolute top-10 left-10 z-[1000] flex flex-col gap-4">
               <div className="bg-white/95 backdrop-blur-sm p-10 rounded-[32px] border border-slate-200 shadow-xl w-[320px]">
                  <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-4">Spatial Intel</h4>
                  <div className="flex flex-col gap-4">
                     <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                        <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Active Coverage Map</p>
                     </div>
                     <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-wider">Optimal site matrix for maximum spectral efficiency in the {result.city} cluster.</p>
                  </div>
               </div>
            </div>
            <div ref={mapRef} className="w-full h-full z-0" />
          </div>
          
          <div className="col-span-12 lg:col-span-4 bg-slate-900 p-12 rounded-[48px] shadow-2xl flex flex-col justify-between">
             <div className="mb-8">
                <h4 className="text-2xl font-black text-white uppercase tracking-tight">Engine Dynamics</h4>
                <p className="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-[0.2em]">Convergence Trace</p>
                
                <div className="h-56 w-full bg-white/5 rounded-[32px] border border-white/10 relative overflow-hidden group mt-8">
                   {/* Chart Grid Background */}
                   <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                   
                   <svg className="w-full h-full p-8 relative z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#facc15" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      <path 
                        d={`${result.fitness_history?.map((val, i) => `${i === 0 ? 'M' : 'L'}${(i/(result.fitness_history.length-1))*100},${100-(val*100)}`).join(' ')} L100,100 L0,100 Z`}
                        fill="url(#chartGradient)"
                      />
                      
                      <path 
                        d={result.fitness_history?.map((val, i) => `${i === 0 ? 'M' : 'L'}${(i/(result.fitness_history.length-1))*100},${100-(val*100)}`).join(' ')} 
                        fill="none" 
                        stroke="#facc15" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        className="drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                      />
  
                      {result.fitness_history?.slice(-10).map((val, i) => (
                        <circle 
                          key={i}
                          cx={((result.fitness_history.length - 10 + i)/(result.fitness_history.length-1))*100}
                          cy={100-(val*100)}
                          r="1"
                          fill="#facc15"
                        >
                          <animate attributeName="r" values="0.5;1.5;0.5" dur={`${1+Math.random()}s`} repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.2;1;0.2" dur={`${1+Math.random()}s`} repeatCount="indefinite" />
                        </circle>
                      ))}
                   </svg>
                   
                   <div className="absolute top-6 right-8 flex flex-col items-end">
                      <span className="text-[9px] font-black text-yellow-400 uppercase tracking-widest">Frontier Active</span>
                      <div className="w-2 h-2 rounded-full bg-yellow-400 animate-ping mt-1.5"></div>
                   </div>
                </div>
             </div>
  
             <div className="space-y-6">
                <div className="p-7 rounded-[32px] bg-white/5 border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-all">
                   <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Simulation Gain</span>
                   <span className="text-2xl font-black text-yellow-400">
                     +{( (result.best_fitness - (result.fitness_history?.[0] || 0)) * 100 ).toFixed(2)}%
                   </span>
                </div>
                <div className="p-7 rounded-[32px] bg-white/5 border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-all">
                   <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Core Latency</span>
                   <span className="text-white font-black text-xl">~{(result.config?.generations * 0.12).toFixed(1)}s</span>
                </div>
              <div className="px-12 py-10 mt-4 rounded-[48px] bg-yellow-400 text-slate-900 flex justify-between items-center shadow-2xl hover:scale-[1.02] transition-transform cursor-default">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] leading-tight">Peak</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] leading-tight">Fitness</span>
                 </div>
                 <span className="text-4xl font-black tracking-tighter">{(result.best_fitness * 100).toFixed(2)}<span className="text-2xl ml-0.5">%</span></span>
              </div>
           </div>
        </div>
      </div>

      {/* RESTORED SITE INTELLIGENCE MATRIX */}
      <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm print:hidden">
        <div className="px-10 py-10 border-b border-slate-100 flex justify-between items-center">
          <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Site Intelligence Matrix</h4>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">Core Network Feed</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 font-bold uppercase tracking-widest text-[10px] text-slate-500">Site Identity</th>
                <th className="px-10 py-6 font-bold uppercase tracking-widest text-[10px] text-slate-500">Altitude</th>
                <th className="px-10 py-6 font-bold uppercase tracking-widest text-[10px] text-slate-500">Tx Power</th>
                <th className="px-10 py-6 font-bold uppercase tracking-widest text-[10px] text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {optimized_towers.map((tower, index) => {
                const cityNeighborhoods = {
                  'peshawar': ['Hayatabad Phase 3', 'Tehkal Heights', 'University Town', 'Saddar Cantt', 'Board Bazaar', 'Gulbahar Colony', 'Hayatabad Phase 7', 'Phase 6 DHA', 'Karkhano Industrial', 'Warsak Road', 'Shami Road', 'Dalazak Road', 'Pajaggi', 'Ring Road South'],
                  'islamabad': ['F-6 Markaz', 'F-7 Sector', 'Blue Area Business', 'I-8 Sector', 'G-9 Center', 'DHA Phase 2', 'Bahria Phase 7', 'E-7 Heights', 'F-10 Markaz', 'Bani Gala', 'Sector G-11', 'Centaurus Tower', 'Gulberg Green', 'D-12 Sector'],
                  'karachi': ['Clifton Block 5', 'DHA Phase 6', 'Gulshan-e-Iqbal', 'North Nazimabad', 'Saddar Market', 'Korangi Industrial', 'PECHS Block 2', 'Malir Cantt', 'Lyari Town', 'Bahria Town Karachi', 'Defense View', 'Garden East', 'Tariq Road'],
                  'lahore': ['Gulberg III', 'DHA Phase 6', 'Model Town', 'Johar Town', 'Lahore Cantt', 'Walled City', 'Bahria Orchard', 'Garden Town', 'Defence Raya', 'Mall Road', 'Liberty Market', 'Hali Road', 'Cavalry Ground', 'Barki Road']
                };

                const currentCity = (result.city || 'peshawar').trim().toLowerCase();
                const neighborhoods = cityNeighborhoods[currentCity] || cityNeighborhoods['peshawar'];
                const coordHash = Math.abs(Math.floor((tower.lat * 1000) + (tower.lng * 1000)));
                const neighborhoodIndex = coordHash % neighborhoods.length;
                const district = neighborhoods[neighborhoodIndex];
                const cityInit = currentCity.substring(0, 1).toUpperCase();
                const siteId = `NG-${cityInit}-${(index + 1).toString().padStart(2, '0')}`;
                
                return (
                  <tr key={index} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-yellow-400 group-hover:text-slate-900 transition-all">
                          <span className="material-symbols-outlined text-xl">satellite_alt</span>
                        </div>
                        <div className="flex flex-col">
                           <div className="flex items-center gap-2">
                             <span className="font-black text-slate-900 text-lg tracking-tight uppercase">{district}</span>
                             <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase">{siteId}</span>
                           </div>
                           <span className="font-semibold text-slate-400 text-[11px] tracking-wider mt-1">COORD: {tower.lat.toFixed(5)}, {tower.lng.toFixed(5)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-base font-black text-slate-900">{tower.height_m.toFixed(1)}m</td>
                    <td className="px-10 py-8 text-base font-black text-yellow-600">{tower.power_dbm.toFixed(1)} dBm</td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
                        <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border bg-green-50 text-green-600 border-green-100">Operational</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .leaflet-container { background: #fff9ef !important; border-radius: 40px; }
        .leaflet-popup-content-wrapper { background: #ffffff !important; border-radius: 16px !important; color: #0f172a !important; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .mesh-line {
          stroke-dasharray: 10, 10;
          animation: dash-flow 2s linear infinite;
        }
        @keyframes dash-flow {
          to { stroke-dashoffset: -20; }
        }
        @keyframes freq-bounce {
          from { transform: scaleY(0.5); }
          to { transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  );
};

export default ResultsPage;
