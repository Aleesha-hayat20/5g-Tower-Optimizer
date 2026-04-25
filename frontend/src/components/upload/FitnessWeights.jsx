import React from 'react';

const FitnessWeights = () => {
  const metrics = [
    { label: 'Coverage Depth', value: 85, color: 'bg-yellow-400', textColor: 'text-yellow-400' },
    { label: 'Latency Optimization', value: 42, color: 'bg-white', textColor: 'text-gray-400' },
    { label: 'Energy Efficiency', value: 68, color: 'bg-white/50', textColor: 'text-gray-400' },
  ];

  return (
    <div className="col-span-12 lg:col-span-5 bg-gray-900 rounded-[32px] p-10 shadow-[20px_20px_60px_rgba(0,0,0,0.15)] text-white">
      <div className="flex items-center space-x-4 mb-8">
        <div className="bg-yellow-400 p-3 rounded-2xl">
          <span className="material-symbols-outlined text-gray-900">fitness_center</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Fitness Weights</h2>
      </div>
      <p className="text-gray-400 mb-10">Prioritize network performance metrics for the AI optimizer.</p>
      
      <div className="space-y-10">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-4">
            <div className="flex justify-between items-end">
              <span className={`font-bold uppercase tracking-wider text-xs ${metric.textColor}`}>{metric.label}</span>
              <span className="text-5xl font-extrabold leading-none">
                {metric.value}<span className="text-2xl font-bold">%</span>
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${metric.color} rounded-full transition-all duration-500`} 
                style={{ width: `${metric.value}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FitnessWeights;
