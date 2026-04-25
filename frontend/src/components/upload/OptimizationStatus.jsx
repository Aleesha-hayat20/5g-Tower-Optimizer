import React from 'react';

const OptimizationStatus = () => {
  return (
    <div className="col-span-12 lg:col-span-12 bg-primary-container rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="flex items-center space-x-6">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-gray-900">memory</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Optimization Engine Ready</h3>
          <p className="text-gray-800">Configurations validated. Ready for cluster processing.</p>
        </div>
      </div>
      <button className="bg-gray-900 text-white font-black text-lg px-12 py-5 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-3">
        <span>INITIATE OPTIMIZATION</span>
        <span className="material-symbols-outlined font-bold">bolt</span>
      </button>
    </div>
  );
};

export default OptimizationStatus;
