import React from 'react';

const TowerArraySettings = ({ settings, onChange }) => {
  return (
    <div className="bg-white rounded-[32px] p-xl shadow-[0_20px_50px_rgba(17,24,39,0.08)] border border-gray-100 font-plus-jakarta">
      <div className="flex items-center justify-between mb-xl">
        <div className="flex items-center space-x-4">
          <div className="bg-[#0f172a] p-3 rounded-2xl text-yellow-400">
            <span className="material-symbols-outlined">cell_tower</span>
          </div>
          <h2 className="text-headline-md font-bold text-gray-900">Tower Configuration</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
        <div className="p-lg bg-slate-50 rounded-[24px] border border-slate-100">
          <div className="flex justify-between items-center mb-md">
            <span className="text-label-bold font-bold text-[#0f172a] uppercase tracking-tight">Required Tower Count</span>
            <span className="bg-[#0f172a] text-yellow-400 px-4 py-1.5 rounded-xl text-lg font-extrabold">{settings.towers}</span>
          </div>
          <div className="relative pt-6 pb-2">
            <input 
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-yellow-500" 
              type="range"
              min="1"
              max="100"
              value={settings.towers}
              onChange={(e) => onChange('towers', parseInt(e.target.value))}
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-widest">
              <span>Min Deployment (1)</span>
              <span>Max Capacity (100)</span>
            </div>
          </div>
        </div>

        <div className="p-lg bg-slate-50 rounded-[24px] border border-slate-100 flex flex-col justify-center">
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            The solver will attempt to place these {settings.towers} towers to maximize signal coverage across the selected grid while minimizing interference.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TowerArraySettings;
