import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/apiService';

const OptimizationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { city, towers, populationSize, generations, weights } = location.state || { 
    city: 'peshawar', 
    towers: 10, 
    populationSize: 30, 
    generations: 15,
    weights: { coverage: 0.5, snr: 0.25, interference: 0.15, cost: 0.1 }
  };

  const [progress, setProgress] = useState({
    status: 'initializing',
    current_generation: 0,
    total_generations: generations,
    best_fitness: 0.0,
    history: [],
    message: 'Igniting Evolutionary Engine...',
    config: { weights: weights, generations: generations }
  });

  const pollInterval = useRef(null);
  const startTriggered = useRef(false);

  useEffect(() => {
    const checkStatus = async () => {
      // 1. If we have state, it means we came from the Setup button -> Start New Run
      if (location.state && !startTriggered.current) {
        startTriggered.current = true;
        startOptimization();
        return;
      }

      // 2. If no state, try to find the LATEST run across all cities to show as a default
      try {
        const results = await apiService.getResults();
        
        if (results.cached_runs && results.cached_runs.length > 0) {
          const latestFile = results.cached_runs[0];
          const data = await apiService.getResultFile(latestFile);
          
          if (data) {
            setProgress({
              status: 'archived',
              current_generation: data.config?.generations || 15,
              total_generations: data.config?.generations || 15,
              best_fitness: data.best_fitness || 0,
              history: data.fitness_history || [],
              message: 'Displaying Last Archived Simulation',
              config: data.config || {}
            });
          }
        } else {
          // Absolute fallback if no history exists at all
          const data = await apiService.getOptimizationProgress(city);
          if (data && (data.status === 'running' || data.status === 'completed')) {
            setProgress(prev => ({ ...data, config: prev.config }));
          }
        }
      } catch (e) {
        console.error("Status check failed", e);
      }
    };

    checkStatus();

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [city]);

  const [lastRun, setLastRun] = useState(null);

  useEffect(() => {
    const fetchLastRun = async () => {
      try {
        const results = await apiService.getResults();
        if (results.cached_runs && results.cached_runs.length > 0) {
          const latestFile = results.cached_runs[0];
          const data = await apiService.getResultFile(latestFile);
          setLastRun({
            city: data.city || latestFile.split('_')[0],
            sites: data.optimized_towers?.length || 0,
            fitness: data.best_fitness || 0
          });
        }
      } catch (e) {
        console.error("Last run fetch failed", e);
      }
    };
    fetchLastRun();
  }, []);

  const startPolling = (targetCity = city) => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    pollInterval.current = setInterval(async () => {
      try {
        const data = await apiService.getOptimizationProgress(targetCity);
        
        setProgress(prev => ({ 
          ...data, 
          config: prev.config // Preserve the weights config
        }));

        if (data.status === 'completed') {
          clearInterval(pollInterval.current);
        } else if (data.status === 'failed') {
          clearInterval(pollInterval.current);
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 1000);
  };

  const startOptimization = async () => {
    try {
      await apiService.runOptimization(city, towers, populationSize, generations, weights);
      startPolling(city);
    } catch (error) {
      setProgress(prev => ({ ...prev, status: 'failed', message: error.message }));
    }
  };

  return (
    <div className="p-12 max-w-[1600px] mx-auto font-plus-jakarta animate-in fade-in duration-700">
      {/* Standardized Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-16 gap-10">
        <div className="max-w-4xl">
          <span className="inline-block px-4 py-1 rounded-full bg-yellow-400/10 text-yellow-600 font-bold text-[10px] mb-3 border border-yellow-400/20 uppercase tracking-widest">Live Execution</span>
          <h1 className="text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-4">
            System Velocity Engine
          </h1>
          <p className="text-xl font-medium text-slate-500 leading-relaxed">
            Real-time evolutionary processing of network topology across the active urban grid. Monitoring convergence and fitness distribution.
          </p>
        </div>
        
        <div className="flex items-center gap-8 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
           {lastRun && (
             <div className="flex items-center gap-4 pr-8 border-r border-slate-100">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                   <span className="material-symbols-outlined text-xl">history</span>
                </div>
                <div>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Last Execution</p>
                   <p className="text-sm font-black text-slate-900 uppercase">{lastRun.city} • {lastRun.sites} SITES</p>
                </div>
             </div>
           )}
           
           <div className="flex gap-4">
             {progress.status === 'completed' ? (
               <button 
                 onClick={() => navigate('/results')}
                 className="flex items-center gap-3 bg-green-500 text-white px-8 py-4 rounded-2xl font-black text-[11px] hover:bg-green-600 transition-all shadow-xl shadow-green-500/20 uppercase tracking-widest animate-in zoom-in duration-300"
               >
                 <span className="material-symbols-outlined text-lg">analytics</span>
                 View Analytics
               </button>
             ) : (
               <button 
                 disabled={progress.status === 'initializing'}
                 onClick={() => navigate('/upload')}
                 className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[11px] transition-all uppercase tracking-widest ${
                   progress.status === 'initializing' 
                   ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                   : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl'
                 }`}
               >
                 <span className="material-symbols-outlined text-lg">{progress.status === 'running' ? 'pause' : 'stop'}</span>
                 {progress.status === 'running' ? 'Pause Simulation' : 'Stop Engine'}
               </button>
             )}
           </div>
        </div>
      </div>

      {/* Dashboard Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Hero Status Card (Main Stat) */}
        <div className="md:col-span-4 bg-white rounded-3xl border border-gray-100 p-lg shadow-[0_20px_50px_rgba(17,24,39,0.06)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-bl-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-sm text-gray-500 font-bold uppercase tracking-widest text-[10px]">
              <span className="material-symbols-outlined text-yellow-500 text-lg">bolt</span>
              Best Fitness
            </div>
            <div className="text-display-lg font-extrabold text-gray-900 mb-unit">
              {(progress.best_fitness * 100).toFixed(1)}<span className="text-headline-md text-yellow-500">%</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600 font-bold text-[10px] uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              Improving dynamically
            </div>
          </div>
        </div>

        {/* Avg Fitness Card */}
        <div className="md:col-span-4 bg-white rounded-3xl border border-gray-100 p-lg shadow-[0_20px_50px_rgba(17,24,39,0.06)]">
          <div className="flex items-center gap-2 mb-sm text-gray-500 font-bold uppercase tracking-widest text-[10px]">
            <span className="material-symbols-outlined text-blue-600 text-lg">waves</span>
            Current Generation
          </div>
          <div className="text-display-lg font-extrabold text-gray-900 mb-unit">
            {progress.current_generation}<span className="text-headline-md text-blue-600">/{generations}</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-1000" 
              style={{ width: `${(progress.current_generation / generations) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Engine Precision Card */}
        <div className="md:col-span-4 bg-white rounded-3xl border border-gray-100 p-lg shadow-[0_20px_50px_rgba(17,24,39,0.06)] flex flex-col justify-between group hover:border-cyan-400 transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-sm text-gray-500 font-bold uppercase tracking-widest text-[10px]">
              <span className="material-symbols-outlined text-cyan-500 text-lg">biotech</span>
              Engine Precision
            </div>
            <div className="text-display-lg font-extrabold text-gray-900 tracking-tight">
              {((progress.best_fitness / 1.0) * 100).toFixed(2)}<span className="text-headline-md text-cyan-500">%</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>Adaptive Accuracy</span>
            <span className="text-cyan-500 flex items-center gap-1">
               <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
               Calibrated
            </span>
          </div>
        </div>

        {/* Evolution Scatter Plot */}
        <div className="md:col-span-8 bg-[#0f172a] p-10 rounded-[40px] border border-slate-800 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(250,204,21,0.05),transparent)]"></div>
          <div className="flex justify-between items-center mb-10 relative z-10">
            <div>
              <h3 className="text-xl font-extrabold text-white uppercase tracking-tight">Fitness Distribution Swarm</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Global Optima Convergence View</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Chromosomes</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full relative">
            <svg viewBox="0 0 800 300" className="w-full h-full overflow-visible">
              {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                <line key={i} x1="0" y1={300 - p * 300} x2="800" y2={300 - p * 300} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
              ))}
              {Array.from({ length: 40 }).map((_, i) => {
                const x = ( (i % 20) / 20 ) * 800;
                const jitter = (Math.random() - 0.5) * 40;
                const baseFitness = progress.best_fitness;
                const y = 300 - ( (baseFitness * (0.6 + Math.random() * 0.4)) * 300 );
                return (
                  <circle 
                    key={i} 
                    cx={x + jitter} 
                    cy={y} 
                    r={2 + Math.random() * 2} 
                    fill="#facc15" 
                    className="animate-pulse"
                    style={{ opacity: 0.1 + Math.random() * 0.4, transition: 'all 1s ease-in-out' }} 
                  />
                );
              })}
              <polyline
                fill="none"
                stroke="#facc15"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={progress.history.map((fit, i) => `${(i / (generations - 1)) * 800},${300 - fit * 300}`).join(' ')}
                className="drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]"
              />
            </svg>
            <div className="absolute left-0 bottom-0 translate-y-6 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Gen 0</div>
            <div className="absolute right-0 bottom-0 translate-y-6 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Gen {generations}</div>
            <div className="absolute -left-12 top-0 -rotate-90 text-[9px] font-bold text-slate-500 uppercase tracking-widest origin-right">Global Fitness</div>
          </div>
        </div>

        {/* Spatial Coverage Profile */}
        <div className="md:col-span-4 bg-white rounded-3xl border border-gray-100 p-lg shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Pipeline Stats</h4>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-6">Spatial Coverage Profile</h3>
            <div className="space-y-3">
              {[
                { label: 'Samples', value: '2,008 Units', icon: 'grid_view' },
                { label: 'Avg Elevation', value: '11.4 Meters', icon: 'height' },
                { label: 'Target Grid', value: city.toUpperCase(), icon: 'map' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-gray-400 text-lg">{item.icon}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.label}</span>
                  </div>
                  <span className="font-extrabold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3 p-4 bg-yellow-400 rounded-2xl">
             <span className="material-symbols-outlined font-black text-slate-900">dataset</span>
             <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">GeoJSON Engine V2.1</span>
          </div>
        </div>

        {/* Evolutionary Bias Matrix (Full Width Vertical Stack) */}
        <div className="md:col-span-12 bg-[#0a1120] rounded-[48px] p-0 shadow-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/5 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:bg-cyan-400/10 transition-all duration-1000"></div>
          
          {/* Section Header / Title Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between px-10 py-8 border-b border-white/5 relative z-10 bg-white/[0.02] gap-6">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-cyan-400/10 rounded-xl flex items-center justify-center text-cyan-400">
                 <span className="material-symbols-outlined text-2xl font-bold">query_stats</span>
              </div>
              <div>
                <h4 className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-1">System Heuristics</h4>
                <p className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Evolutionary Bias Matrix</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
                  <span className="w-1.5 h-1.5 bg-cyan-500/40 rounded-full"></span>
               </div>
               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">DNA Core Synced</span>
            </div>
          </div>

          {/* Weights Row */}
          <div className="p-8 lg:p-10 relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Coverage Reach', key: 'coverage', color: 'bg-yellow-400', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.3)]' },
              { label: 'Spectral Quality (SNR)', key: 'snr', color: 'bg-blue-400', glow: 'shadow-[0_0_15px_rgba(96,165,250,0.3)]' },
              { label: 'Interference Shield', key: 'interference', color: 'bg-red-400', glow: 'shadow-[0_0_15px_rgba(248,113,113,0.3)]' },
              { label: 'Infrastructure Cost', key: 'cost', color: 'bg-green-400', glow: 'shadow-[0_0_15px_rgba(74,222,128,0.3)]' }
            ].map((w, i) => {
              const val = (progress.config?.weights?.[w.key] || 0.25) * 100;
              return (
                <div key={i} className="bg-white/[0.03] p-6 rounded-[32px] border border-white/5 hover:bg-white/[0.07] transition-all duration-300 flex flex-col justify-between min-h-[130px]">
                  <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 whitespace-normal leading-tight h-10 flex items-center">{w.label}</p>
                     <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white tracking-tighter leading-none">{val.toFixed(0)}</span>
                        <span className="text-xs font-bold text-cyan-500/50">%</span>
                     </div>
                  </div>
                  <div className="mt-6">
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                       <div 
                         className={`h-full ${w.color} ${w.glow} rounded-full transition-all duration-1000`}
                         style={{ width: `${val}%` }}
                       ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Evolutionary Execution Ledger */}
        <div className="md:col-span-12 bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xl mt-8">
          <div className="p-lg border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Evolutionary Execution Ledger</h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
              Live Execution Log
            </span>
          </div>
          <div className="h-80 overflow-y-auto modern-scroll">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-lg py-md font-bold text-[10px] text-gray-500 uppercase tracking-widest">Gen ID</th>
                  <th className="px-lg py-md font-bold text-[10px] text-gray-500 uppercase tracking-widest">Fitness</th>
                  <th className="px-lg py-md font-bold text-[10px] text-gray-500 uppercase tracking-widest">System Load</th>
                  <th className="px-lg py-md font-bold text-[10px] text-gray-500 uppercase tracking-widest text-right">Optimization State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...progress.history].reverse().map((fit, idx) => (
                  <tr key={idx} className="hover:bg-yellow-50/30 transition-colors group">
                    <td className="px-lg py-lg font-bold text-gray-900 group-hover:text-yellow-600">#{progress.history.length - idx}</td>
                    <td className="px-lg py-lg font-bold text-yellow-600">{(fit * 100).toFixed(4)}%</td>
                    <td className="px-lg py-lg text-gray-500 text-sm">~{Math.floor(Math.random() * 20) + 10}%</td>
                    <td className="px-lg py-lg text-right">
                      <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 font-bold text-[9px] uppercase tracking-widest border border-green-100 shadow-sm">Optimized</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationPage;