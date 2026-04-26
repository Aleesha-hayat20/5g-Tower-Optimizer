import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';

const OptimizationStatus = ({ weights, city, towers }) => {
  const navigate = useNavigate();
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkDuplicate = async () => {
      try {
        const response = await apiService.getResults();
        if (response.cached_runs) {
          // Check top 5 for duplicates (to avoid heavy fetch)
          const recentRuns = await Promise.all(
            response.cached_runs.slice(0, 5).map(id => apiService.getResultFile(id))
          );
          
          const duplicate = recentRuns.find(run => {
            if (!run || !run.config) return false;
            const matchCity = run.city.toLowerCase() === city.toLowerCase();
            const matchTowers = run.config.num_towers === towers;
            // Check weights with small epsilon for float precision
            const matchWeights = Object.keys(weights).every(k => 
              Math.abs((run.config.weights[k] || 0) - weights[k]) < 0.01
            );
            return matchCity && matchTowers && matchWeights;
          });
          
          setIsDuplicate(!!duplicate);
        }
      } catch (err) {
        console.error("Duplicate check failed", err);
      }
    };
    
    checkDuplicate();
  }, [city, towers, weights]);

  const handleStart = () => {
    navigate('/optimization', {
      state: {
        city,
        towers,
        weights,
        populationSize: 100,
        generations: 50
      }
    });
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const isReady = totalWeight > 0.99 && towers >= 1;

  return (
    <div className={`col-span-12 rounded-[32px] p-lg flex flex-col md:flex-row items-center justify-between gap-lg font-plus-jakarta transition-all duration-500 border ${isDuplicate ? 'bg-amber-50 border-amber-200' : 'bg-primary-container border-transparent'}`}>
      <div className="flex items-center space-x-6">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm transition-colors ${isDuplicate ? 'bg-amber-100 text-amber-600' : 'bg-white text-gray-900'}`}>
          <span className="material-symbols-outlined text-3xl">{isDuplicate ? 'history' : 'memory'}</span>
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-headline-md font-bold text-gray-900">
              {isDuplicate ? 'Existing Result Detected' : 'Optimization Engine Ready'}
            </h3>
            {isDuplicate && (
              <span className="px-3 py-1 rounded-full bg-amber-200 text-amber-700 text-[9px] font-black uppercase tracking-widest">Duplicate</span>
            )}
          </div>
          <p className="text-body-md font-medium text-gray-800">
            {isDuplicate 
              ? 'You have simulated these exact parameters recently. Proceed to create a new variant or view existing data.' 
              : 'Configurations validated. Ready for cluster processing.'}
          </p>
        </div>
      </div>
      <button 
        onClick={handleStart}
        disabled={!isReady}
        className={`text-white font-black text-lg px-12 py-5 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-3 ${!isReady ? 'opacity-50 cursor-not-allowed' : ''} ${isDuplicate ? 'bg-amber-600 shadow-amber-200' : 'bg-gray-900'}`}
      >
        <span className="uppercase tracking-tight">{isDuplicate ? 'RE-SIMULATE VARIANT' : 'INITIATE OPTIMIZATION'}</span>
        <span className="material-symbols-outlined">bolt</span>
      </button>
    </div>
  );
};

export default OptimizationStatus;