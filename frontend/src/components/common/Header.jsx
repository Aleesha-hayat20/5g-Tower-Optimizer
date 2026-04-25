import React from 'react';

const Header = () => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-[0_20px_50px_rgba(17,24,39,0.08)]">
      <div className="flex justify-between items-center w-full px-8 py-4 h-20">
        <div className="flex items-center space-x-8">
          <span className="text-2xl font-black italic tracking-tighter text-gray-900">SignalProphet</span>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <span className="material-symbols-outlined">search</span>
            </span>
            <input 
              className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-yellow-400 w-64 text-sm" 
              placeholder="Search parameters..." 
              type="text"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <button className="text-gray-500 hover:scale-105 transition-transform duration-200">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-gray-500 hover:scale-105 transition-transform duration-200">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-400">
            <img 
              alt="User profile" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8IOxzZlyXmTgY7L3nNvo3uJWREXx3UIrrhPoiDRSC_gN_G7-T44BMGlIj-AyZ4FWWMzTa8rYsoqadvRwpDzqQorqo-z4YGTBIiFe-1mi-M4LlJeOfaPl-lyaVVz_tN5nrUR5MxGwvlAJNM77LmI3pINFqdjy-3G26D7AuaRrm0g1rERfOKEr3X4WFhBRCdvOgVXGI1gFP2lH5o4rZBVtbDEISdHdbxHF_IcKklzpqGOdzm7YwqWJJc3wHtjWxrDVDOYZz2krZl562"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
