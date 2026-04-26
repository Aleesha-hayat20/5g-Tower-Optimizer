import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import OptimizationPage from './pages/OptimizationPage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';
import ComparisonPage from './pages/ComparisonPage';

// Component to handle layout conditionally
const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === '/';
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isLandingPage) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const particles = [];
    const particleCount = 30; // Fewer for the app pages to keep focus

    class Particle {
      constructor() { this.init(); }
      init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 1.5;
        this.color = Math.random() > 0.5 ? 'rgba(112, 93, 0, 0.15)' : 'rgba(255, 215, 0, 0.1)'; 
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      resize();
    };

    window.addEventListener('resize', handleResize);
    resize();

    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isLandingPage]);

  if (isLandingPage) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    );
  }

  return (
    <div className="bg-surface min-h-screen font-plus-jakarta text-on-surface relative overflow-hidden">
      {/* Persistent Background Particles */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-50" />
      
      <Sidebar />
      <main className="ml-64 min-h-screen relative z-10 flex flex-col">
        <Header />
        <div className="p-8 flex-grow">
          <Routes>
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/optimization" element={<OptimizationPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/comparison" element={<ComparisonPage />} />
            <Route path="*" element={<UploadPage />} />
          </Routes>
        </div>
      </main>

      {/* Modern Quick Action FAB */}
      <button 
        onClick={() => navigate('/upload')}
        className="fixed bottom-10 right-10 flex items-center gap-0 hover:gap-3 bg-yellow-400 rounded-2xl shadow-[0_20px_50px_rgba(255,215,0,0.3)] px-4 h-16 hover:px-6 transition-all duration-500 z-50 group border border-yellow-500/20"
      >
        <span className="material-symbols-outlined text-3xl text-slate-900 font-black">add</span>
        <span className="max-w-0 overflow-hidden group-hover:max-w-[200px] transition-all duration-500 whitespace-nowrap font-black text-slate-900 uppercase tracking-tighter text-sm">
          New Simulation
        </span>
      </button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
