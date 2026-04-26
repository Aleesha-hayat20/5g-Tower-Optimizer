import React, { useRef, useState } from 'react';

const FileDropZone = ({ onFileSelect }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const recentFiles = [
    { 
      name: 'Peshawar_Sector_7G.json', 
      size: '4.2 MB', 
      layers: '6 Layers',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNMde_Ft1Xlz-1oPCXZI3YrRqPi_MheaeUHIbHyU2FwvsjdQ2vsLjDDXZATwO82_cQeJidf4nV9SHGe8touW35Zx2qzCnGGvhtkVlJacFdH3vHXCGkGjY-AFMOz55SKumpQ49hQg7Ktd1v-aLbmMN9yhk6CsDdg9Nn1NfRolZeKr5U__IKkv7nHpZQaGsguGkqcTJFlL4oGJZrB3WrdvL7UyL9AKQKD-_p5L4GXfK77R_K4tFLIVrYh5fmzlMJ1r6pnTy0auwR_K2o'
    },
    { 
      name: 'Islamabad_F10_Cluster.shp', 
      size: '1.8 MB', 
      layers: '4 Layers',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEMuJ6AJpD-AIht6yGqonDFoFdVW3RLeMPv7zRaG8NCBczI_8Ta1iSYmaK7VSBsTUWesAMKST0wdMrdIm7FS_8WB59AhYz5TZsXtl8yGEr1tN3jDNdA8SLsQGy9ahFqQOl-jmoPc7FD2TrbU2qLsTGdPX696eMg3nZyTgfAIWKv2Cq86X1Ir7fuoQ_zjZFlA4a73fuBXoKxCLyWk0m69CMfICfonfeZeXGcpRIZ7R89wTq02rBEN18F5s1Q0CVo81-G5LO-q-oBqNF'
    }
  ];

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (onFileSelect) onFileSelect(file);
    }
  };

  return (
    <div className="bg-[#0f172a] rounded-[32px] p-10 border border-slate-800 shadow-2xl text-white font-plus-jakarta">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".json,.shp,.geojson,.csv"
      />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="material-symbols-outlined text-yellow-400 font-bold">location_city</span>
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight">Urban Spatial Data</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">GIS / GeoJSON Input</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-yellow-400 px-4 py-1.5 bg-yellow-400/10 rounded-full border border-yellow-400/20 uppercase tracking-widest">
          {selectedFile ? 'File Ready' : 'Ready to Load'}
        </span>
      </div>

      <div 
        onClick={handleBrowseClick}
        className="relative border-2 border-dashed border-slate-700 rounded-[32px] p-16 flex flex-col items-center justify-center text-center group hover:border-yellow-400 hover:bg-white/5 transition-all cursor-pointer"
      >
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-4xl text-slate-500 group-hover:text-yellow-400">
            {selectedFile ? 'check_circle' : 'upload_file'}
          </span>
        </div>
        
        {selectedFile ? (
          <div className="animate-in zoom-in duration-300">
            <p className="text-2xl font-bold tracking-tight text-yellow-400 mb-2 uppercase">File Injected</p>
            <p className="text-white text-sm font-bold">{selectedFile.name}</p>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-2">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for Solver</p>
          </div>
        ) : (
          <>
            <p className="text-2xl font-bold tracking-tight text-white mb-2">Inject City Layers</p>
            <p className="text-slate-500 text-sm font-medium">Supports multi-layer GIS data including terrain and building density</p>
          </>
        )}

        <button className="mt-8 bg-yellow-400 text-[#0f172a] font-bold px-10 py-3.5 rounded-2xl hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest">
          {selectedFile ? 'Change File' : 'Browse Local Files'}
        </button>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {recentFiles.map((file, index) => (
          <div key={index} className="p-5 rounded-3xl bg-white/5 flex items-center space-x-4 border border-white/5 hover:border-yellow-400/20 transition-colors group">
            <div className="relative">
               <img src={file.img} className="w-16 h-16 rounded-2xl object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt={file.name} />
               <div className="absolute inset-0 border border-white/10 rounded-2xl"></div>
            </div>
            <div>
              <p className="font-bold text-gray-200 text-xs tracking-tight">{file.name}</p>
              <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{file.size} • {file.layers}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileDropZone;
