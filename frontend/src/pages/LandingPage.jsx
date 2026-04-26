import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [stats, setStats] = useState({ coverage: 0, efficiency: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        coverage: Math.min(prev.coverage + 0.8, 99.4),
        efficiency: Math.min(prev.efficiency + 0.5, 84.2),
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let mouse = { x: -1000, y: -1000 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();

    const nodeCount = 45;

    class Node {
      constructor() { this.init(); }
      init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.baseRadius = 3.5;
        this.pulse = 0;
        this.pulseSpeed = 0.03 + Math.random() * 0.02;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.pulse += this.pulseSpeed;

        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 300) {
          this.x += dx * 0.02;
          this.y += dy * 0.02;
        }

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        const pulseRadius = (Math.sin(this.pulse) + 1) * 40;
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(250, 204, 21, ${0.4 * (1 - pulseRadius / 80)})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.baseRadius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#facc15';
        ctx.fill();
      }
    }

    class Packet {
      constructor() { this.init(); }
      init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2.5;
        this.vy = (Math.random() - 0.5) * 2.5;
        this.size = Math.random() * 2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.x = Math.random() * canvas.width;
        if (this.y < 0 || this.y > canvas.height) this.y = Math.random() * canvas.height;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
        ctx.fill();
      }
    }

    const nodes = [];
    const packets = [];
    for (let i = 0; i < nodeCount; i++) nodes.push(new Node());
    for (let i = 0; i < 40; i++) packets.push(new Packet());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      packets.forEach(p => { p.update(); p.draw(); });
      ctx.lineWidth = 1.8;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 280) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(15, 23, 42, ${0.25 * (1 - dist / 280)})`;
            ctx.stroke();
          }
        }
        nodes[i].update();
        nodes[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fff9ef] text-[#0f172a] font-plus-jakarta overflow-x-hidden relative selection:bg-yellow-400 selection:text-slate-900">
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-60 pointer-events-none" />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[50%] h-[50%] bg-yellow-400/15 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full"></div>
      </div>

      {/* NAVIGATION */}
      <nav className="fixed w-full z-50 top-0 px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/95 backdrop-blur-xl rounded-[32px] px-10 py-4 border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-[#0f172a] rounded-2xl flex items-center justify-center text-yellow-400 shadow-xl shadow-slate-900/10">
              <span className="material-symbols-outlined font-black text-xl">precision_manufacturing</span>
            </div>
            <div>
              <span className="text-xl font-black tracking-tighter uppercase leading-none block">GENETRON</span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1.5 block">NETWORK INTELLIGENCE</span>
            </div>
          </div>
          <div className="hidden lg:flex gap-12 font-black text-slate-400 uppercase text-[10px] tracking-[0.3em]">
            <button onClick={() => scrollToSection('tech')} className="hover:text-slate-900 transition-all duration-300">Architecture</button>
            <button onClick={() => scrollToSection('engine-core')} className="hover:text-slate-900 transition-all duration-300">Solver Core</button>
            <button onClick={() => window.open('http://localhost:8000/docs', '_blank')} className="hover:text-slate-900 transition-all duration-300">Documentation</button>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="bg-yellow-400 text-slate-900 px-8 py-3.5 rounded-2xl font-black shadow-[0_15px_35px_rgba(250,204,21,0.2)] hover:scale-105 active:scale-95 transition-all text-[10px] uppercase tracking-widest"
          >
            Run Simulation
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-40 pb-24 px-6 relative min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-center relative z-10">

          {/* TEXT CONTENT */}
          <div className="lg:col-span-7 space-y-8 relative z-10">
            <div className="inline-flex items-center gap-4 px-5 py-2 bg-[#0f172a] text-yellow-400 rounded-full font-black text-[10px] tracking-[0.3em] uppercase shadow-2xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400"></span>
              </span>
              5G Tower Optimizer
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-[100px] font-black text-slate-900 leading-[0.85] tracking-tighter uppercase">
              Signal <br />
              <span className="text-yellow-500 drop-shadow-sm">Supremacy.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-bold">
              Solve the 5G placement paradox with genetic algorithms. High-fidelity spectral simulations built for massive urban density.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => navigate('/upload')}
                className="flex items-center gap-4 bg-[#0f172a] text-white px-10 py-5 rounded-[28px] font-black transition-all hover:shadow-[0_25px_60px_rgba(15,23,42,0.2)] hover:scale-105 active:scale-95 group"
              >
                <span className="text-sm uppercase tracking-[0.2em]">Start Simulation</span>
                <div className="w-9 h-9 bg-white/10 text-white rounded-xl flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-slate-900 transition-all duration-300">
                  <span className="material-symbols-outlined font-black text-lg">bolt</span>
                </div>
              </button>

            </div>

            <div className="flex gap-12 pt-10 border-t border-slate-200">
              {[
                { val: '99.4%', label: 'Peak Coverage' },
                { val: '84.2%', label: 'Efficiency' },
                { val: 'GN-NSGA-II', label: 'Solver Engine' },
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">{s.val}</p>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SOLVER CARD */}
          <div className="lg:col-span-5 relative z-20 flex justify-center lg:justify-end">
            <div className="w-full max-w-[360px] bg-white rounded-[40px] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col gap-6 animate-[float_6s_ease-in-out_infinite]">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-yellow-400 shadow-lg">
                    <span className="material-symbols-outlined font-black text-lg">hub</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active Solver</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em]">Cluster-01</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border border-green-100">
                  Live
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em]">Coverage</p>
                  <p className="text-xl font-black text-slate-900 tabular-nums tracking-tighter">{stats.coverage.toFixed(1)}%</p>
                </div>
                <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                    style={{ width: `${(stats.coverage / 99.4) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-5 rounded-[20px] border border-slate-100">
                  <p className="text-[8px] text-slate-400 font-black uppercase mb-1.5 tracking-widest">Efficiency</p>
                  <p className="text-lg font-black text-slate-900 tracking-tighter">{stats.efficiency.toFixed(1)}%</p>
                </div>
                <div className="bg-[#0f172a] p-5 rounded-[20px] shadow-lg">
                  <p className="text-[8px] text-slate-500 font-black uppercase mb-1.5 tracking-widest">Nodes</p>
                  <p className="text-lg font-black text-yellow-400 tracking-tighter">1,240</p>
                </div>
              </div>

              <div className="h-36 bg-[#fff9ef] rounded-[24px] border border-slate-100 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-yellow-400/30 rounded-full animate-ping"></div>
                </div>
                <div className="text-center relative z-10 flex flex-col items-center">
                  <div className="w-10 h-10 bg-[#0f172a] rounded-full flex items-center justify-center text-yellow-400 shadow-xl mb-2">
                    <span className="material-symbols-outlined font-black text-lg">cell_tower</span>
                  </div>
                  <p className="text-[8px] font-black text-slate-900 uppercase tracking-[0.4em]">Spatial Sync</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECH SPECS */}
      <section id="tech" className="py-40 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center mb-24">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-6 block">Optimization Pipeline</span>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-8 uppercase">
            Architecting <br />Efficiency.
          </h2>
          <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto">
            Our proprietary GN-NSGA-II core processes high-resolution OpenStreetMap datasets to eliminate dead zones and maximize signal density.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {[
            { title: 'OSM Synthesis', desc: 'Directly ingest OpenStreetMap building geometries for realistic diffraction and shadowing modeling.' },
            { id: 'engine-core', title: 'GN-NSGA-II Core', desc: 'Leverage multi-objective genetic algorithms to find the pareto-optimal balance of cost and coverage.' },
            { title: 'Spectral Mapping', desc: 'Generate high-fidelity coverage heatmaps with sub-meter precision using our custom propagation engine.' },
          ].map((item, i) => (
            <div key={i} id={item.id} className="bg-[#fff9ef] border border-slate-100 p-10 rounded-[36px] hover:shadow-2xl transition-all duration-500 group hover:border-yellow-400">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 mb-8 group-hover:bg-[#0f172a] group-hover:text-yellow-400 transition-all shadow-sm">
                <span className="material-symbols-outlined text-2xl font-black">query_stats</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight uppercase">{item.title}</h3>
              <p className="text-slate-500 text-base leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER - REDESIGNED */}
      <footer className="bg-[#0f172a] relative z-10">
        {/* Top accent border */}
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent"></div>

        {/* Subtle glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-yellow-400/[0.03] blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-12 relative">
          {/* Main footer grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">

            {/* Brand column */}
            <div className="md:col-span-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-slate-900 shadow-lg shadow-yellow-400/10">
                  <span className="material-symbols-outlined font-black text-2xl">precision_manufacturing</span>
                </div>
                <div>
                  <span className="text-2xl font-black tracking-tighter uppercase text-white leading-none block">GENETRON</span>
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mt-1 block">NETWORK INTELLIGENCE</span>
                </div>
              </div>
              <p className="text-slate-400 font-medium leading-relaxed text-base">
                The global standard for 5G network topology synthesis. Powered by multi-objective evolutionary processing and high-fidelity spectral modeling.
              </p>
              {/* Text Links */}
              <div className="flex flex-wrap gap-x-8 gap-y-2 pt-2">
                {[
                  { label: 'SOLVER API', icon: 'terminal', action: () => window.open('http://localhost:8000/docs', '_blank') },
                ].map((s, i) => (
                  <button key={i} onClick={s.action} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-yellow-400 transition-all duration-300 group">
                    <span className="material-symbols-outlined text-[14px] group-hover:scale-110 transition-transform">{s.icon}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Engine links */}
            <div className="md:col-span-2 md:col-start-8">
              <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] mb-6">Engine</p>
              <div className="space-y-4">
                {[
                  { label: 'Optimization', path: '/upload' },
                  { label: 'Spectral Mapping', path: '/results' },
                  { label: 'Comparison Core', path: '/comparison' },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(item.path)}
                    className="block text-sm font-semibold text-slate-400 hover:text-yellow-400 transition-all duration-300"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resources links */}
            <div className="md:col-span-3">
              <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] mb-6">Resources</p>
              <div className="space-y-4">
                {[
                  { label: 'OSM Data Pipeline', action: () => navigate('/upload') },
                  { label: 'NSGA-II Technical Specs', action: () => window.open('http://localhost:8000/docs', '_blank') }
                ].map((item, i) => (
                  <button 
                    key={i} 
                    onClick={item.action}
                    className="block text-sm font-semibold text-slate-400 hover:text-yellow-400 cursor-pointer transition-all duration-300 text-left"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar - Clean Centered Credit */}
          <div className="border-t border-white/[0.06] pt-10 flex justify-center items-center">
            <p className="text-[12px] font-medium text-slate-400 tracking-wide">
              Created with <span className="text-red-500 mx-1 animate-pulse">❤️</span> by Aleesha × Taha × Laiba
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;