import React from 'react';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import UploadPage from './pages/UploadPage';

function App() {
  return (
    <div className="bg-surface min-h-screen font-plus-jakarta text-on-surface">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <Header />
        <UploadPage />
      </main>
      
      {/* FAB for Quick Actions */}
      <button className="fixed bottom-10 right-10 w-20 h-20 bg-primary-container rounded-full shadow-[0_20px_50px_rgba(255,215,0,0.4)] flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-50 group border-4 border-white">
        <span className="material-symbols-outlined text-4xl text-gray-900" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
      </button>
    </div>
  );
}

export default App;
