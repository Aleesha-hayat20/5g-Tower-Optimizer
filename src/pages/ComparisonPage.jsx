import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

const ComparisonPage = () => {
  const navigate = useNavigate();
  const [allRuns, setAllRuns] = useState([]);
  const [selectedIds, setSelectedIds] = useState(() => {
    const saved = localStorage.getItem('selected_comparison_ids');
    return saved ? JSON.parse(saved) : [];
  });
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('selected_comparison_ids', JSON.stringify(selectedIds));
  }, [selectedIds]);

  useEffect(() => {
    const fetchAllRuns = async () => {
      setLoading(true);
      try {
        const response = await apiService.getResults();
        if (response.cached_runs && response.cached_runs.length > 0) {
          const runMetadata = response.cached_runs.map(file => {
            const parts = file.split('_');
            const city = parts[0] || 'Unknown';
            const dateStr = parts[1] || '00000000';
            const timeStr = (parts[2] || '000000').split('.')[0];
            
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const mIdx = parseInt(dateStr.substring(4, 6)) - 1;
            const month = (mIdx >= 0 && mIdx < 12) ? monthNames[mIdx] : 'Jan';
            const day = dateStr.substring(6, 8) || '01';
            const hour = timeStr.substring(0, 2) || '00';
            const min = timeStr.substring(2, 4) || '00';
            
            return {
              id: file,
              city: city.toUpperCase(),
              timestamp: `${month} ${day}, ${hour}:${min}`,
              rawTime: `${dateStr}_${timeStr}`,
              numericTime: parseInt(dateStr + timeStr)
            };
          }).sort((a, b) => b.numericTime - a.numericTime); // SORT NEWEST FIRST
          
          setAllRuns(runMetadata);
          
          // Validate existing selection
          const validSelected = selectedIds.filter(id => runMetadata.some(r => r.id === id));
          
          if (validSelected.length < 2 && runMetadata.length >= 2) {
            // Auto-select the two absolute NEWEST runs
            setSelectedIds([runMetadata[0].id, runMetadata[1].id]);
          } else if (validSelected.length !== selectedIds.length) {
            setSelectedIds(validSelected);
          }
        }
      } catch (error) {
        console.error("Error loading run history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllRuns();
  }, []);

  useEffect(() => {
    const loadSelectedData = async () => {
      if (selectedIds.length !== 2) {
        setScenarios([]);
        return;
      }
      
      setLoading(true);
      try {
        const loaded = await Promise.all(
          selectedIds.map(async (id) => {
            try {
              const data = await apiService.getResultFile(id);
              const meta = allRuns.find(r => r.id === id) || { city: 'Unknown', timestamp: 'N/A' };
              return {
                id: id,
                name: meta.city,
                timestamp: meta.timestamp,
                best_fitness: data?.best_fitness || 0,
                coverage: (data?.metrics?.coverage_percent / 100) || data?.metrics?.coverage_score || 0,
                throughput: data?.metrics?.avg_throughput || (20 * Math.log2(1 + Math.pow(10, (data?.metrics?.avg_snr_db || 10) / 10))),
                sites: data?.optimized_towers?.length || 0,
                towers: data?.optimized_towers || []
              };
            } catch (fileErr) {
              console.error(`Error loading file ${id}`, fileErr);
              return null;
            }
          })
        );
        setScenarios(loaded.filter(s => s !== null));
      } catch (err) {
        console.error("Error in comparison batch load", err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedIds.length === 2 && allRuns.length > 0) {
      loadSelectedData();
    }
  }, [selectedIds, allRuns]);

  const toggleSelection = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id]; // Shift and add
      }
      return [...prev, id];
    });
  };

  if (allRuns.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4 bg-[#fff9ef]">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">compare_arrows</span>
        <h2 className="text-2xl font-bold text-gray-900">Not Enough Data</h2>
        <p className="text-gray-500 mt-2">Run at least two simulations to unlock manual benchmarking.</p>
      </div>
    );
  }

  return (
    <div className="ml-0 pt-10 px-10 pb-16 bg-[#fff9ef] min-h-screen font-plus-jakarta">
      {/* Header Section */}
      <div className="flex flex-col gap-10 mb-16">
        <div className="min-w-0">
          <span className="inline-block px-4 py-1 rounded-full bg-yellow-400/10 text-yellow-600 font-bold text-[10px] mb-3 border border-yellow-400/20 uppercase tracking-widest">Performance Benchmark</span>
          <h1 className="text-6xl font-black tracking-tighter uppercase text-[#0f172a] mb-4 leading-none">
            Scenario Benchmarking
          </h1>
          <p className="text-xl font-medium text-slate-500 leading-relaxed max-w-3xl">
            Select any two simulations from your history to perform a deep-dive performance comparison.
          </p>
        </div>
        
        {/* Run Selector - Now Full Width Below Heading */}
        <div className="w-full">
          <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                <span className="material-symbols-outlined text-sm font-bold">history</span>
                Simulation Run History
              </h4>
              <button 
                onClick={() => navigate('/history')}
                className="flex items-center gap-2 px-6 py-2 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-yellow-400 hover:text-slate-900 transition-all active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">database</span>
                View Full Library
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 modern-scroll">
              {allRuns.slice(0, 10).map((run) => {
                const isSelected = selectedIds.includes(run.id);
                // Attempt to find loaded data for this run to show site count if available
                const loadedData = scenarios.find(s => s.id === run.id);
                
                return (
                  <button
                    key={run.id}
                    onClick={() => toggleSelection(run.id)}
                    className={`flex-shrink-0 p-4 rounded-2xl border-2 transition-all text-left min-w-[150px] relative ${
                      isSelected 
                        ? 'border-yellow-400 bg-yellow-50 shadow-md' 
                        : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-yellow-600' : 'text-slate-400'}`}>
                        {run.timestamp}
                      </p>
                    </div>
                    <p className="text-sm font-extrabold text-[#0f172a] mb-1">{run.city}</p>
                    {loadedData && (
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                        {loadedData.sites} Sites
                      </p>
                    )}
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-[40px] border border-slate-100 shadow-sm">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Simulation Data...</p>
        </div>
      ) : scenarios.length < 2 ? (
        <div className="bg-white rounded-[40px] p-20 text-center border border-dashed border-slate-300">
           <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">touch_app</span>
           <h3 className="text-xl font-bold text-slate-400">
             {allRuns.length < 2 ? 'Run at least 2 simulations to compare' : 'Select two runs from the history above to compare'}
           </h3>
        </div>
      ) : (
        <>
          {/* Key Differentiators Banner */}
          <div className="mb-12 bg-white rounded-[48px] p-10 border border-slate-200 flex flex-col md:flex-row items-center gap-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="flex-shrink-0 w-20 h-20 bg-[#0f172a] rounded-[32px] flex items-center justify-center text-yellow-400 shadow-2xl relative z-10 group-hover:rotate-12 transition-transform duration-500">
              <span className="material-symbols-outlined text-4xl font-bold">analytics</span>
            </div>
            <div className="flex-grow min-w-0 relative z-10">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">
                {scenarios[0].name === scenarios[1].name ? 'Configuration Variance Analysis' : 'Geographic Benchmarking Analysis'}
              </h4>
              <p className="text-xl font-bold text-[#0f172a] leading-tight w-full">
                {scenarios[0].name === scenarios[1].name ? (
                  <>
                    Analyzing two variants of <span className="text-blue-600 uppercase">{scenarios[0].name}</span>. 
                    {scenarios[0].sites !== scenarios[1].sites ? ` Variant site density (${scenarios[0].sites} vs ${scenarios[1].sites} towers).` : ' Identical density with tuned genetic weights.'}
                  </>
                ) : (
                  <>
                    Benchmarking <span className="text-blue-600 uppercase">{scenarios[0].name}</span> against <span className="text-slate-400 uppercase">{scenarios[1].name}</span>. 
                    {scenarios[0].sites !== scenarios[1].sites ? ` Variant site density detected (${scenarios[0].sites} vs ${scenarios[1].sites}).` : ' Identical site counts with distinct spatial topology.'}
                  </>
                )}
              </p>
            </div>
            <div className="flex gap-6 relative z-10">
              {['Coverage', 'Fitness'].map(metric => {
                const val1 = Number(scenarios[0][metric.toLowerCase()]) || 0;
                const val2 = Number(scenarios[1][metric.toLowerCase()]) || 0;
                const diff = (val1 - val2) * 100;
                
                return (
                  <div key={metric} className="px-8 py-5 rounded-[32px] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{metric} Variance</p>
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-sm font-bold ${diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {diff >= 0 ? 'trending_up' : 'trending_down'}
                      </span>
                      <p className={`text-2xl font-black ${diff >= 0 ? 'text-green-600' : 'text-red-600'} tracking-tighter`}>
                        {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Topology Comparison & Cards */}
          <div className="grid grid-cols-12 gap-8 mb-12">
            {/* Topology Maps Overlay */}
            <div className="col-span-12 bg-[#0f172a] rounded-[56px] p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
               <div className="flex justify-between items-center mb-10 relative z-10">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Competitive Topology</h3>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em]">Spatial Distribution Comparison</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">{scenarios[0].name} Sites</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">{scenarios[1].name} Sites</span>
                    </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                  {scenarios.map((s, i) => (
                    <div key={i} className="relative aspect-[21/9] bg-white/5 rounded-[40px] border border-white/5 flex items-center justify-center group/map overflow-visible">
                       <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[40px]"></div>
                       <svg viewBox="0 0 400 150" className="w-full h-full p-8">
                          {/* Simplified Urban Grid */}
                          {[...Array(6)].map((_, j) => (
                            <line key={`h-${j}`} x1="0" y1={j * 30} x2="400" y2={j * 30} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          ))}
                          {[...Array(12)].map((_, j) => (
                            <line key={`v-${j}`} x1={j * 40} y1="0" x2={j * 40} y2="150" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          ))}
                          
                          {/* Tower Markers - Real Coordinates */}
                          {s.towers.map((tower, j) => {
                            // Normalize coordinates to fit 400x150 viewBox
                            const minLat = Math.min(...s.towers.map(t => t.lat));
                            const maxLat = Math.max(...s.towers.map(t => t.lat));
                            const minLng = Math.min(...s.towers.map(t => t.lng));
                            const maxLng = Math.max(...s.towers.map(t => t.lng));
                            
                            const x = 20 + (tower.lng - minLng) / (maxLng - minLng || 1) * 360;
                            const y = 130 - (tower.lat - minLat) / (maxLat - minLat || 1) * 110;
                            
                            const color = i === 0 ? "#facc15" : "#94a3b8";
                            const glow = i === 0 ? "rgba(250,204,21,0.2)" : "rgba(148,163,184,0.2)";
                            
                            return (
                              <g key={j} className="animate-in fade-in zoom-in duration-1000" style={{ animationDelay: `${j * 30}ms` }}>
                                <circle cx={x} cy={y} r="12" fill={glow} className="hover:r-16 transition-all" />
                                <circle cx={x} cy={y} r="2" fill={color} />
                                <circle cx={x} cy={y} r="2" fill={color} className="animate-ping" style={{ animationDuration: '3s' }} />
                              </g>
                            );
                          })}
                       </svg>
                       <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-[#0f172a]/90 backdrop-blur-md border border-white/10 text-[9px] font-black text-white uppercase tracking-[0.2em] opacity-0 group-hover/map:opacity-100 transition-opacity">
                         {s.name} Cluster Map
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="col-span-12 xl:col-span-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {scenarios.map((s, i) => {
                const isOverallWinner = scenarios.length > 1 && s.best_fitness === Math.max(...scenarios.map(x => x.best_fitness));
                
                return (
                  <div key={i} className={`bg-white rounded-[48px] p-12 border-2 ${isOverallWinner ? 'border-green-400 shadow-2xl shadow-green-400/10' : 'border-slate-100 shadow-sm'} transition-all relative group`}>
                    {isOverallWinner && (
                      <div className="absolute -top-4 -right-4 bg-green-500 text-white font-black text-[10px] px-8 py-3 uppercase tracking-[0.3em] rounded-2xl shadow-xl z-20 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm font-bold">workspace_premium</span>
                        Optimal Design
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-12">
                      <div>
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-slate-300'}`}></div>
                          <p className={`text-[11px] font-black uppercase tracking-[0.3em] ${i === 0 ? 'text-yellow-600' : 'text-slate-400'}`}>
                            {s.timestamp} • SCENARIO {i === 0 ? 'A' : 'B'}
                          </p>
                        </div>
                        <h3 className="text-4xl font-extrabold text-[#0f172a] uppercase tracking-tighter leading-none mb-3">
                          {s.name}
                        </h3>
                        <p className="text-xl font-bold text-slate-300 tracking-tight">{s.sites} OPTIMIZED SITES</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-slate-50 rounded-[40px] border border-slate-100 transition-all hover:bg-slate-100 group/card flex flex-col items-center justify-center text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Throughput</p>
                        <p className="text-2xl font-extrabold text-blue-600 tracking-tight whitespace-nowrap">
                          {s.throughput.toFixed(1)} <span className="text-[10px] font-bold opacity-40 ml-0.5 uppercase">Mbps</span>
                        </p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-[40px] border border-slate-100 transition-all hover:bg-slate-100 group/card flex flex-col items-center justify-center text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Coverage</p>
                        <p className="text-2xl font-extrabold text-yellow-600 tracking-tight whitespace-nowrap">
                          {(s.coverage * 100).toFixed(1)} <span className="text-[10px] font-bold opacity-40 ml-0.5">%</span>
                        </p>
                      </div>
                      <div className="col-span-2 p-10 bg-[#0f172a] rounded-[40px] border border-slate-800 shadow-2xl group-hover:bg-slate-900 transition-all transform group-hover:-translate-y-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">AI Optimization Score</p>
                            <p className="text-4xl font-extrabold text-white tracking-tighter">{(s.best_fitness * 100).toFixed(2)}<span className="text-sm font-bold text-slate-500 ml-1">%</span></p>
                          </div>
                          <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center text-yellow-400 shadow-inner">
                            <span className="material-symbols-outlined text-4xl font-black">bolt</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Radar Chart Visualization */}
            <div className="col-span-12 xl:col-span-4 bg-[#0f172a] rounded-[56px] p-12 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl border border-slate-800">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(250,204,21,0.08),transparent)] pointer-events-none"></div>
              <h4 className="text-[12px] font-black text-yellow-400 uppercase tracking-[0.5em] mb-16 relative z-10 text-center">Competitive Fingerprint</h4>
              
              <div className="relative w-full aspect-square max-w-[300px]">
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                  {/* Radar Grid */}
                  {[0.2, 0.4, 0.6, 0.8, 1].map((r, i) => (
                    <circle key={i} cx="100" cy="100" r={80 * r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  ))}
                  {[0, 90, 180, 270].map((a, i) => (
                    <line key={i} x1="100" y1="100" x2={100 + 80 * Math.cos(a * Math.PI / 180)} y2={100 + 80 * Math.sin(a * Math.PI / 180)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  ))}

                  {/* Data Polygons */}
                  {scenarios.map((s, i) => {
                    const metrics = [
                      s.best_fitness, // Fitness
                      s.coverage, // Coverage
                      s.throughput / 100, // Throughput (normalized)
                      1 - (s.sites / 100) // Site Efficiency
                    ];
                    const points = metrics.map((m, j) => {
                      const angle = (j * 90) * Math.PI / 180;
                      const r = Math.min(m, 1) * 80;
                      return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
                    }).join(' ');
                    
                    return (
                      <polygon 
                        key={i}
                        points={points}
                        fill={i === 0 ? 'rgba(250, 204, 21, 0.4)' : 'rgba(148, 163, 184, 0.2)'}
                        stroke={i === 0 ? '#facc15' : '#94a3b8'}
                        strokeWidth="3"
                        className="transition-all duration-1000"
                        style={{ filter: i === 0 ? 'drop-shadow(0 0 8px rgba(250,204,21,0.4))' : 'none' }}
                      />
                    );
                  })}
                </svg>
                
                {/* Labels */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Fitness</div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Throughput</div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] -rotate-90">Coverage</div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] rotate-90">Efficiency</div>
              </div>
              
              <div className="mt-16 flex gap-10">
                {scenarios.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-lg ${i === 0 ? 'bg-yellow-400' : 'bg-slate-500'}`}></div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{s.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-[48px] p-12 border border-slate-200 shadow-2xl mb-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-slate-50 rounded-full -mr-48 -mt-48 pointer-events-none"></div>
            <div className="flex items-center justify-between mb-12 relative z-10">
              <h2 className="text-3xl font-black text-[#0f172a] uppercase tracking-tighter flex items-center">
                <span className="w-16 h-16 rounded-[24px] bg-[#0f172a] flex items-center justify-center mr-6 text-yellow-400 shadow-xl">
                  <span className="material-symbols-outlined text-3xl font-bold">compare</span>
                </span>
                Direct Metric Benchmarking
              </h2>
            </div>
            <div className="overflow-x-auto relative z-10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="py-8 px-10 font-black text-slate-400 uppercase tracking-[0.3em] text-[11px]">Performance Vector</th>
                    <th className="py-8 px-10 font-black text-[#0f172a] text-center bg-yellow-50/50 rounded-t-[32px] text-lg uppercase tracking-tight">{scenarios[0].name}</th>
                    <th className="py-8 px-10 font-black text-slate-400 text-center text-lg uppercase tracking-tight">{scenarios[1].name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { name: 'Average Throughput', val0: scenarios[0].throughput.toFixed(1), val1: scenarios[1].throughput.toFixed(1), unit: 'Mbps', color: 'text-blue-600' },
                    { name: 'Coverage Area', val0: (scenarios[0].coverage * 100).toFixed(1), val1: (scenarios[1].coverage * 100).toFixed(1), unit: '%', color: 'text-yellow-600' },
                    { name: 'GA System Fitness', val0: (scenarios[0].best_fitness * 100).toFixed(1), val1: (scenarios[1].best_fitness * 100).toFixed(1), unit: '%', color: 'text-[#0f172a]' },
                    { name: 'Total Sites', val0: scenarios[0].sites, val1: scenarios[1].sites, unit: 'Towers', color: 'text-slate-600' },
                  ].map((m, i) => {
                    const isWinner0 = parseFloat(m.val0) >= parseFloat(m.val1);
                    const isWinner1 = parseFloat(m.val1) > parseFloat(m.val0);
                    
                    return (
                      <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-10 px-10">
                          <p className="font-black text-[#0f172a] uppercase tracking-tight text-xl">{m.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Simulated Network Metric</p>
                        </td>
                        <td className={`py-10 px-10 text-center ${isWinner0 ? 'bg-green-50/30' : 'bg-yellow-50/10'}`}>
                          <div className="flex flex-col items-center gap-2">
                            <span className={`text-4xl font-black ${isWinner0 ? 'text-green-600' : 'text-slate-300'}`}>
                              {m.val0}<span className="text-sm ml-1 opacity-40">{m.unit}</span>
                            </span>
                            {isWinner0 && (
                              <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-green-200 shadow-sm animate-in slide-in-from-bottom-2 duration-500">
                                <span className="material-symbols-outlined text-[10px] font-bold text-green-600">check_circle</span>
                                <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Optimal</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className={`py-10 px-10 text-center ${isWinner1 ? 'bg-green-50/30' : ''}`}>
                          <div className="flex flex-col items-center gap-2">
                            <span className={`text-3xl font-black ${isWinner1 ? 'text-green-600' : 'text-slate-200'}`}>
                              {m.val1}<span className="text-sm ml-1">{m.unit}</span>
                            </span>
                            {isWinner1 && (
                              <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-green-200 shadow-sm animate-in slide-in-from-bottom-2 duration-500">
                                <span className="material-symbols-outlined text-[10px] font-bold text-green-600">check_circle</span>
                                <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Optimal</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ComparisonPage;
