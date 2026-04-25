import React from 'react';

const FileDropZone = () => {
  const recentFiles = [
    { 
      name: 'NYC_Manhattan_Grid.json', 
      size: '12.4 MB', 
      layers: '4 Layers',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9pgV2sUUTZn9T5rPpt30xA8MbS7C9V1BiS2Nud593N8vMFh_ANKb7_0rQQrl0rf6q-jfKVT4yIWumFwVIPa87n_5euxIpr22RtNAAy82LvNLf5b-93tOGQy-4JFgcrPKKjdE5NSizj7KemAj_uUjzyjJQ2qFs00BtXgDdGdSbPydgoV_DiIDpaZPFE3FlsuOUrkaZ8Ti1Sw1t7PGAvUwgl-YTifPb_NVSTFX5jpGHyDfG13JbcvWC67zMZ5qVvWre0Z3w2v-nqV3m'
    },
    { 
      name: 'London_Financial_Dist.shp', 
      size: '8.1 MB', 
      layers: '2 Layers',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPeusIsbK2IGhxoIbm8Jyo6dxPZXCdyxRmrZR7eHSSBXjfJg1sykrUqGRjtyqibBqjKUxg2-jpu7FZn4Jc1OXDcxNwji4ual8Lp0FtunSntIkrDkL6ySB-oJvX2E4wZbQ0fFzKj8T5MBLNmB0eWSdNSvaXCl4x5330lI-NwEGWkH1aQiAlYlhVznIV9odvV0dKYlDrwNZnPd7_uA6pl7WAvUIcZhr4RDdbzX5Mma9A16F1ZyIAoMNnNqBOCGDY-n0bCBc8RWJjl5aP'
    }
  ];

  return (
    <div className="col-span-12 lg:col-span-7 bg-white rounded-[32px] p-10 shadow-[0_20px_50px_rgba(17,24,39,0.08)] border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-primary-container p-3 rounded-2xl">
            <span className="material-symbols-outlined text-gray-900">location_city</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">City Geospatial Data</h2>
        </div>
        <span className="text-xs font-semibold text-tertiary px-4 py-1 bg-tertiary-container rounded-full uppercase">Shapefile / GeoJSON</span>
      </div>

      <div className="relative border-4 border-dashed border-gray-100 rounded-[24px] p-16 flex flex-col items-center justify-center text-center group hover:border-yellow-400 transition-colors cursor-pointer">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-4xl text-gray-400 group-hover:text-yellow-500">upload_file</span>
        </div>
        <p className="text-2xl font-bold text-gray-900 mb-1">Drag & drop city layers</p>
        <p className="text-gray-400">Supports multi-layer GIS data including terrain and building density</p>
        <button className="mt-8 bg-gray-900 text-white font-bold px-8 py-3 rounded-2xl hover:scale-105 active:scale-95 transition-all">
          Browse Local Files
        </button>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4">
        {recentFiles.map((file, index) => (
          <div key={index} className="p-4 rounded-2xl bg-surface-container flex items-center space-x-4 border border-gray-200">
            <img src={file.img} className="w-16 h-16 rounded-xl object-cover" alt={file.name} />
            <div>
              <p className="font-bold text-gray-900 text-sm">{file.name}</p>
              <p className="text-xs text-gray-400">{file.size} • {file.layers}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileDropZone;
