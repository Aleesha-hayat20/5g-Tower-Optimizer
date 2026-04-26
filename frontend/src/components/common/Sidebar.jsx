import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const links = [
    { name: 'Simulation Setup', icon: 'settings_input_component', path: '/upload' },
    { name: 'Optimization', icon: 'precision_manufacturing', path: '/optimization' },
    { name: 'Results Dashboard', icon: 'dashboard', path: '/results' },
    { name: 'Simulation History', icon: 'history', path: '/history' },
    { name: 'Compare Scenarios', icon: 'compare_arrows', path: '/comparison' },
  ];

  return (
    <nav className="h-screen w-[260px] fixed left-0 top-0 flex flex-col bg-[#0f172a] border-r border-slate-800 z-50">
      <div className="flex flex-col h-full py-8">
        {/* Brand Section */}
        <div className="px-8 mb-10">
          <NavLink to="/" className="flex items-center gap-3 group no-underline">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-yellow-400/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined font-black text-2xl">precision_manufacturing</span>
            </div>
            <div>
              <h1 className="text-white font-extrabold text-lg tracking-tight leading-none group-hover:text-yellow-400 transition-colors">GENETRON</h1>
              <p className="font-black uppercase tracking-[0.3em] text-[9px] text-slate-500 mt-1.5">NETWORK INTELLIGENCE</p>
            </div>
          </NavLink>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                isActive
                  ? "bg-yellow-400 text-slate-900 rounded-xl shadow-lg shadow-yellow-400/10 flex items-center px-4 py-3.5 transition-transform"
                  : "text-slate-400 hover:text-white flex items-center px-4 py-3.5 transition-all hover:bg-white/5 rounded-xl group"
              }
            >
              <span className="material-symbols-outlined mr-3 text-[22px] group-hover:scale-110 transition-transform">
                {link.icon}
              </span>
              <span className="font-bold uppercase tracking-widest text-[10px]">{link.name}</span>
            </NavLink>
          ))}
        </div>




      </div>
    </nav>
  );
};

export default Sidebar;
