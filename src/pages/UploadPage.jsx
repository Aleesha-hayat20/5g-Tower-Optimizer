import React, { useState } from 'react';
import FitnessWeights from '../components/upload/FitnessWeights';
import TowerArraySettings from '../components/upload/TowerArraySettings';
import OptimizationStatus from '../components/upload/OptimizationStatus';
import { useNavigate } from 'react-router-dom';

const UploadPage = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const cities = [
    { id: 'peshawar', name: 'Peshawar Region' },
    { id: 'islamabad', name: 'Islamabad Cluster' },
    { id: 'karachi', name: 'Karachi Metro' },
    { id: 'lahore', name: 'Lahore Urban Hub' },
  ];

  const [weights, setWeights] = useState({
    coverage: 0.50,
    snr: 0.25,
    interference: 0.15,
    cost: 0.10
  });

  const [settings, setSettings] = useState({
    city: 'peshawar',
    towers: 10
  });

  const handleWeightChange = (key, value) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-xl max-w-container-max mx-auto font-plus-jakarta">
      <div className="mb-16">
        <span className="inline-block px-4 py-1 rounded-full bg-yellow-400/10 text-yellow-600 font-bold text-[10px] mb-3 border border-yellow-400/20 uppercase tracking-widest">Environment Config</span>
        <h1 className="text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-4">
          Simulation Setup
        </h1>
        <p className="text-xl font-medium text-slate-500 leading-relaxed max-w-4xl">
          Initialize your network environment by selecting target regions and configuring tower density.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* City/Region Selection Section */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-[32px] p-xl shadow-[0_20px_50px_rgba(17,24,39,0.08)] border border-gray-100">
          <div className="flex items-center justify-between mb-lg">
            <div className="flex items-center space-x-4">
              <div className="bg-[#0f172a] p-3 rounded-2xl text-yellow-400">
                <span className="material-symbols-outlined">map</span>
              </div>
              <h2 className="text-headline-md font-bold text-gray-900">Target Region</h2>
            </div>
            <span className="text-label-sm font-bold text-green-600 px-4 py-1 bg-green-50 rounded-full uppercase border border-green-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Dataset Ready
            </span>
          </div>
          
          <div className="space-y-8">
            <p className="text-body-lg text-slate-500 leading-relaxed font-medium">
              Select a pre-processed urban cluster from the data pipeline. Each region includes building density, terrain height, and population distribution metrics.
            </p>

            <div className="relative">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Select Active Simulation Grid</p>
              
              <div className="relative z-20">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-5 flex items-center justify-between group hover:border-yellow-400 transition-all text-left"
                >
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Cluster</p>
                    <p className="text-xl font-extrabold text-[#0f172a] uppercase tracking-tight">
                      {cities.find(c => c.id === settings.city)?.name}
                    </p>
                  </div>
                  <div className={`w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:border-yellow-400 transition-all ${isDropdownOpen ? 'rotate-180 bg-yellow-400 border-yellow-400 text-slate-900' : 'text-slate-400'}`}>
                    <span className="material-symbols-outlined font-bold">expand_more</span>
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-[0_30px_70px_rgba(15,23,42,0.15)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    {cities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => {
                          handleSettingChange('city', city.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-8 py-5 flex items-center justify-between group transition-all ${settings.city === city.id ? 'bg-slate-50' : 'hover:bg-yellow-50'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${settings.city === city.id ? 'bg-yellow-400 text-slate-900' : 'bg-slate-100 text-slate-400 group-hover:bg-yellow-100 group-hover:text-yellow-600'}`}>
                            <span className="material-symbols-outlined text-sm font-bold">location_city</span>
                          </div>
                          <span className={`text-sm font-bold uppercase tracking-wider ${settings.city === city.id ? 'text-[#0f172a]' : 'text-slate-500 group-hover:text-[#0f172a]'}`}>
                            {city.name}
                          </span>
                        </div>
                        {settings.city === city.id && (
                          <span className="material-symbols-outlined text-yellow-500 font-bold">check_circle</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {cities.map(c => (
                  <button 
                    key={c.id}
                    onClick={() => handleSettingChange('city', c.id)}
                    className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap ${settings.city === c.id ? 'bg-[#0f172a] border-[#0f172a] text-white shadow-lg shadow-slate-900/10 scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600'}`}
                  >
                    {c.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Resolution</p>
                <p className="text-xl font-extrabold text-[#0f172a]">10m Grid</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Layers</p>
                <p className="text-xl font-extrabold text-[#0f172a]">Buildings, DEM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fitness Weights Section */}
        <div className="col-span-12 lg:col-span-5">
          <FitnessWeights weights={weights} onChange={handleWeightChange} />
        </div>

        {/* Tower Array Settings Section */}
        <div className="col-span-12">
          <TowerArraySettings settings={settings} onChange={handleSettingChange} />
        </div>

        {/* Optimization Engine Status Panel */}
        <div className="col-span-12">
          <OptimizationStatus
            weights={weights}
            city={settings.city}
            towers={settings.towers}
            onCityChange={(val) => handleSettingChange('city', val)}
            onTowersChange={(val) => handleSettingChange('towers', val)}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadPage;