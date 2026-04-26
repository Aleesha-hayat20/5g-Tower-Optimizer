import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  useEffect(() => {
    const fetchAllRuns = async () => {
      try {
        const response = await apiService.getResults();
        if (response.cached_runs) {
          const summaryData = await Promise.all(
            response.cached_runs.map(async (id) => {
              try {
                const data = await apiService.getResultFile(id);
                return {
                  id,
                  city: data.city || id.split('_')[0],
                  fitness: data.best_fitness || 0,
                  coverage: data.best_coverage || 0,
                  sites: data.optimized_towers?.length || 0,
                  timestamp: id.split('_').slice(1).join(' ').replace('.json', '').replace(/ /g, ':'),
                  config: data.config || {}
                };
              } catch (e) { return null; }
            })
          );
          setRuns(summaryData.filter(r => r !== null));
        }
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllRuns();
  }, []);

  const handleRerun = (run) => {
    const weights = run.config.weights || { coverage: 0.5, snr: 0.25, interference: 0.15, cost: 0.1 };
    navigate('/optimization', { 
      state: { 
        city: run.city.toLowerCase(), 
        towers: run.sites, 
        populationSize: run.config.population_size || 30, 
        generations: run.config.generations || 15,
        weights: weights
      } 
    });
  };

  const handleViewDetails = (runId) => {
    navigate(`/results?id=${runId}`);
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await apiService.deleteResult(deleteModal.id);
      setRuns(runs.filter(r => r.id !== deleteModal.id));
      setDeleteModal({ show: false, id: null });
    } catch (e) {
      alert("Failed to delete the simulation.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-6">
        <div className="w-16 h-16 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Simulation Archives...</p>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-12">
        <div>
          <span className="inline-block px-4 py-1 rounded-full bg-yellow-400/10 text-yellow-600 font-bold text-[10px] mb-3 border border-yellow-400/20 uppercase tracking-widest">Central Archive</span>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">Simulation History</h1>
          <p className="text-lg font-medium text-slate-400 mt-4 uppercase tracking-widest">Browse and manage historical network optimizations</p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="text-right">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Archived</p>
                 <p className="text-xl font-black text-slate-900">{runs.length}</p>
              </div>
              <span className="material-symbols-outlined text-yellow-500">folder_open</span>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[48px] border border-slate-200 overflow-x-auto shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] modern-scroll">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-10 py-8 font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">Regional Cluster</th>
              <th className="px-10 py-8 font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">Simulation Time</th>
              <th className="px-10 py-8 font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">Density</th>
              <th className="px-10 py-8 font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">Global Fitness</th>
              <th className="px-10 py-8 font-black uppercase tracking-[0.2em] text-[10px] text-slate-400 text-right w-[400px]">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {runs.map((run, index) => (
              <tr key={index} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-10 py-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-yellow-400 group-hover:text-slate-900 transition-all shadow-sm">
                      <span className="material-symbols-outlined text-2xl">location_city</span>
                    </div>
                    <div>
                      <span className="text-2xl font-black text-slate-900 uppercase tracking-tight block leading-none">{run.city}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 block">Regional Cluster</span>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-10 whitespace-nowrap">
                  <div className="flex flex-col">
                    <p className="text-sm font-black text-slate-900">
                      {run.timestamp.substring(6,8)} {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(run.timestamp.substring(4,6))-1]} {run.timestamp.substring(0,4)}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {run.timestamp.substring(9,11)}:{run.timestamp.substring(11,13)}:{run.timestamp.substring(13,15)}
                    </p>
                  </div>
                </td>
                <td className="px-10 py-10 whitespace-nowrap">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-50 border border-blue-100">
                    <span className="text-sm font-black text-blue-600">{run.sites}</span>
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Sites Deployed</span>
                  </div>
                </td>
                <td className="px-10 py-10 font-black text-3xl text-slate-900 tabular-nums whitespace-nowrap">
                  {(run.fitness * 100).toFixed(2)}<span className="text-sm opacity-30 ml-1">%</span>
                </td>
                <td className="px-10 py-10 text-right">
                  <div className="flex justify-end gap-3 whitespace-nowrap">
                    <button 
                      onClick={() => handleViewDetails(run.id)}
                      className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      View Intel
                    </button>
                    <button 
                      onClick={() => handleRerun(run)}
                      className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-yellow-400 text-slate-900 hover:bg-yellow-500 transition-all shadow-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-sm">refresh</span>
                      Re-run
                    </button>
                    <button 
                      onClick={() => setDeleteModal({ show: true, id: run.id })}
                      className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-2xl">delete_sweep</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {runs.length === 0 && (
          <div className="p-20 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">folder_off</span>
            <h3 className="text-xl font-bold text-slate-400">No archived simulations found</h3>
            <p className="text-slate-300 mt-2">Run your first optimization to begin building your library.</p>
          </div>
        )}
      </div>

      {/* Professional Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 animate-in fade-in duration-300">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
             onClick={() => setDeleteModal({ show: false, id: null })}
           ></div>
           
           {/* Modal Content */}
           <div className="bg-white rounded-[40px] w-full max-w-md p-10 relative z-10 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center text-red-500 mb-8 mx-auto shadow-inner">
                 <span className="material-symbols-outlined text-4xl font-bold">warning</span>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 text-center uppercase tracking-tight mb-4">
                 Confirm Deletion
              </h3>
              
              <p className="text-slate-500 text-center text-sm font-medium leading-relaxed mb-10">
                 Are you sure you want to permanently delete this simulation archive? 
                 This action is irreversible and the spatial intelligence data will be lost.
              </p>
              
              <div className="flex flex-col gap-3">
                 <button 
                   onClick={confirmDelete}
                   className="w-full py-4 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest text-[11px] hover:bg-red-600 transition-all shadow-lg active:scale-[0.98]"
                 >
                   Delete Archive Permanently
                 </button>
                 <button 
                   onClick={() => setDeleteModal({ show: false, id: null })}
                   className="w-full py-4 rounded-2xl bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[11px] hover:bg-slate-200 transition-all active:scale-[0.98]"
                 >
                   Cancel and Keep
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
