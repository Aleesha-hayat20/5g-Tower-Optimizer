import React from 'react';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/upload': return 'Simulation Setup';
      case '/optimization': return 'Evolution Engine';
      case '/results': return 'Results Dashboard';
      case '/comparison': return 'Compare Scenarios';
      default: return 'NetGenesis Control';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-10 py-5">
      <div className="max-w-[1600px] mx-auto flex justify-between items-center">
        <div className="flex items-center gap-10">
          <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight">{getPageTitle()}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-green-50 rounded-xl border border-green-100">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-green-700 uppercase tracking-[0.2em]">Engine Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
