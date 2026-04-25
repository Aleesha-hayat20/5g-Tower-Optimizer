import React from 'react';

const TowerArraySettings = () => {
  const settings = [
    { label: 'Frequency (GHz)', value: '2.4 - 5.0', min: 'Sub-6GHz', max: 'mmWave' },
    { label: 'TX Power (dBm)', value: '46.5', min: 'Low Power', max: 'Max Boost' },
    { label: 'Tilt Angle (°)', value: '-2.0', min: 'Uptilt', max: 'Downtilt' },
  ];

  return (
    <div className="col-span-12 bg-white rounded-[32px] p-10 shadow-[0_20px_50px_rgba(17,24,39,0.08)] border border-gray-100">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center space-x-4">
          <div className="bg-primary-container p-3 rounded-2xl">
            <span className="material-symbols-outlined text-gray-900">cell_tower</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Tower Array Settings</h2>
        </div>
        <button className="flex items-center space-x-2 text-gray-900 font-bold border-2 border-gray-900 px-6 py-2 rounded-xl hover:bg-gray-900 hover:text-white transition-colors">
          <span className="material-symbols-outlined">refresh</span>
          <span>Reset to Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {settings.map((setting, index) => (
          <div key={index} className="p-6 bg-surface-container-low rounded-[24px] border border-white">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-sm text-gray-900">{setting.label}</span>
              <span className="bg-gray-900 text-white px-3 py-1 rounded-lg text-xs font-bold">{setting.value}</span>
            </div>
            <div className="relative pt-6 pb-2">
              <input 
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500" 
                type="range"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-4 uppercase font-bold tracking-widest">
                <span>{setting.min}</span>
                <span>{setting.max}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TowerArraySettings;
