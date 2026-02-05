import React, { useEffect, useRef, useState } from 'react';
import { Cpu, Zap, Clock, TrendingUp, Play, Pause } from 'lucide-react';
import { Progress } from '../components/ui/progress';

const QuantumVisualizer = ({ optimizations }) => {
  const canvasRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(true);

  // Quantum particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isAnimating) return;

    const ctx = canvas.getContext('2d');
    const particles = [];
    const connections = [];

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;

    // Create particles
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 2 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2
      });
    }

    let animationId;
    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.02;

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle with pulsing effect
        const pulse = Math.sin(p.phase) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 240, 255, ${0.8 * pulse})`;
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3 * pulse, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw connections to nearby particles
        particles.slice(i + 1).forEach(p2 => {
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${(1 - dist / 80) * 0.3})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isAnimating]);

  const activeOpt = optimizations?.find(o => o.status === 'running');
  const completedOpt = optimizations?.find(o => o.status === 'completed');

  return (
    <div data-testid="quantum-visualizer" className="nexus-widget">
      <div className="widget-header">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-black/30 border border-white/10">
            <Cpu size={18} className="text-white/60" />
          </div>
          <div>
            <h3 className="widget-title">Quantum Optimization Console</h3>
            <p className="text-xs font-mono text-white/40">QAOA Hybrid Solver</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAnimating(!isAnimating)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          {isAnimating ? <Pause size={16} className="text-white/60" /> : <Play size={16} className="text-white/60" />}
        </button>
      </div>

      {/* Quantum Visualization Canvas */}
      <div className="relative mt-4 rounded-lg overflow-hidden border border-white/5">
        <canvas 
          ref={canvasRef} 
          className="w-full h-[200px]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(100, 116, 139, 0.05) 0%, transparent 70%)' }}
        />
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      {/* Active Optimization Status */}
      {activeOpt && (
        <div className="mt-4 p-4 rounded-lg bg-slate-500/5 border border-slate-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-white/60 animate-pulse" />
              <span className="font-mono text-xs text-white/60 uppercase">Running</span>
            </div>
            <span className="font-mono text-xs text-white/40">{activeOpt.problem_type}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs font-mono text-white/40">Nodes</p>
              <p className="text-xl font-mono font-bold text-white">{activeOpt.nodes}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-white/40">Vehicles</p>
              <p className="text-xl font-mono font-bold text-white">{activeOpt.vehicles}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-white/40">
              <span>Quantum Processing</span>
              <span className="text-white/60">{activeOpt.quantum_time}</span>
            </div>
            <Progress value={65} className="h-1 bg-white/10" />
          </div>
        </div>
      )}

      {/* Completed Optimization Results */}
      {completedOpt && (
        <div className="mt-4 p-4 rounded-lg bg-black/30 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-green-400" />
              <span className="font-mono text-xs text-green-400 uppercase">Completed</span>
            </div>
            <span className="font-mono text-xs text-white/40">{completedOpt.problem_type} - {completedOpt.nodes} nodes</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-mono text-white/40">Classical Time</p>
              <p className="font-mono text-sm text-white/60 line-through">{completedOpt.classical_time}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-white/40">Quantum Time</p>
              <p className="font-mono text-sm text-cyan-400">{completedOpt.quantum_time}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-white/40">Improvement</p>
              <p className="font-mono text-sm text-green-400">+{completedOpt.improvement}%</p>
            </div>
          </div>

          {completedOpt.solution && Object.keys(completedOpt.solution).length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-xs font-mono text-white/40 mb-2">Solution Summary</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(completedOpt.solution).map(([key, value]) => (
                  <span key={key} className="px-2 py-1 rounded bg-white/5 font-mono text-xs text-white/60">
                    {key}: {value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button className="cyber-btn px-4 py-2 text-xs">
          Trigger New Optimization
        </button>
      </div>
    </div>
  );
};

export default QuantumVisualizer;
