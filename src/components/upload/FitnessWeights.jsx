import React from 'react';

const FitnessWeights = ({ weights, onChange }) => {
  const items = [
    { key: 'coverage', label: 'Coverage Capacity', desc: 'Maximize spatial signal reach', icon: 'radar' },
    { key: 'snr', label: 'Spectral Quality', desc: 'Optimize SNR distribution', icon: 'signal_cellular_alt' },
    { key: 'interference', label: 'Signal Isolation', desc: 'Minimize cell overlap', icon: 'waves' },
    { key: 'cost', label: 'Economic Efficiency', desc: 'Optimize deployment cost', icon: 'payments' },
  ];

  return (
    <div className="bg-[#0f172a] rounded-[40px] p-xl shadow-[0_40px_100px_rgba(15,23,42,0.2)] text-white font-plus-jakarta border border-slate-800">
      <div className="flex items-center space-x-4 mb-lg">
        <div className="bg-yellow-400 p-3 rounded-2xl">
          <span className="material-symbols-outlined text-slate-900 font-bold">analytics</span>
        </div>
        <div>
          <h2 className="text-headline-md font-extrabold text-white">Fitness Weights</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Multi-Objective Balancing</p>
        </div>
      </div>
      
      <div className="space-y-12 mt-10">
        {items.map((item, index) => (
          <div key={index} className="group">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-yellow-400 text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                <div>
                   <span className="block text-sm font-extrabold uppercase tracking-tight text-slate-100">{item.label}</span>
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{item.desc}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-5xl font-black text-white tabular-nums tracking-tighter">
                  {Math.round((weights[item.key] || 0) * 100)}
                </span>
                <span className="text-sm font-black text-yellow-400 ml-1">%</span>
              </div>
            </div>
            <div className="relative pt-2">
              <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={weights[item.key] || 0}
                onChange={(e) => onChange(item.key, parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-yellow-400 hover:accent-yellow-300 transition-all"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FitnessWeights;
