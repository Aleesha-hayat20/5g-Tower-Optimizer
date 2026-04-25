import React from 'react';

const Sidebar = () => {
  const menuItems = [
    { icon: 'cloud_upload', label: 'Upload & Configure', active: true },
    { icon: 'precision_manufacturing', label: 'Optimization' },
    { icon: 'dashboard', label: 'Results Dashboard' },
    { icon: 'compare_arrows', label: 'Compare Scenarios' },
  ];

  const bottomItems = [
    { icon: 'help', label: 'Support' },
    { icon: 'person', label: 'Account' },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col bg-gray-900 border-r border-white/10 shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-50">
      <div className="flex flex-col h-full py-6 space-y-4">
        <div className="px-8 mb-8">
          <span className="text-yellow-400 font-black text-xl">SignalProphet</span>
          <p className="font-plus-jakarta font-bold uppercase tracking-widest text-[10px] text-gray-400 mt-1">
            v2.4.0 High-Performance
          </p>
        </div>
        
        <nav className="flex-1 space-y-2">
          {menuItems.map((item, index) => (
            <div 
              key={index} 
              className={`${
                item.active 
                ? 'bg-yellow-400 text-gray-900 shadow-[0_0_20px_rgba(255,215,0,0.4)]' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              } rounded-2xl m-2 flex items-center p-4 cursor-pointer transition-colors transition-transform duration-200`}
            >
              <span className="material-symbols-outlined mr-3">{item.icon}</span>
              <span className="font-plus-jakarta font-bold uppercase tracking-widest text-[10px]">{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="px-4 py-6 border-t border-white/10">
          <button className="w-full bg-yellow-400 text-gray-900 font-bold py-3 rounded-xl hover:scale-105 transition-transform duration-200">
            Deploy Site
          </button>
        </div>

        <div className="space-y-1">
          {bottomItems.map((item, index) => (
            <div 
              key={index} 
              className="text-gray-400 hover:text-white flex items-center p-4 m-2 transition-colors hover:bg-gray-800/50 rounded-2xl cursor-pointer"
            >
              <span className="material-symbols-outlined mr-3">{item.icon}</span>
              <span className="font-plus-jakarta font-bold uppercase tracking-widest text-[10px]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
