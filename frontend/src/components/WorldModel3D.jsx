import React, { useState, useEffect, useRef } from 'react';

// Distribution center positions (for 2D canvas visualization)
const DC_POSITIONS = [
  { id: 'dc-1', name: 'LA Hub', x: 100, y: 180, type: 'hub', inventory: 78, shipments: 1247 },
  { id: 'dc-2', name: 'Chicago', x: 400, y: 120, type: 'fulfillment', inventory: 92, shipments: 892 },
  { id: 'dc-3', name: 'NYC', x: 700, y: 150, type: 'hub', inventory: 85, shipments: 1456 },
  { id: 'dc-4', name: 'Houston', x: 250, y: 320, type: 'port', inventory: 65, shipments: 2134 },
  { id: 'dc-5', name: 'Seattle', x: 80, y: 50, type: 'port', inventory: 71, shipments: 987 },
  { id: 'dc-6', name: 'Miami', x: 620, y: 350, type: 'port', inventory: 88, shipments: 1678 },
];

// Route connections
const ROUTES = [
  { from: 'dc-1', to: 'dc-2', active: true, flow: 450 },
  { from: 'dc-2', to: 'dc-3', active: true, flow: 380 },
  { from: 'dc-1', to: 'dc-4', active: true, flow: 520 },
  { from: 'dc-4', to: 'dc-6', active: false, flow: 180 },
  { from: 'dc-5', to: 'dc-1', active: true, flow: 620 },
  { from: 'dc-5', to: 'dc-2', active: true, flow: 290 },
  { from: 'dc-3', to: 'dc-6', active: true, flow: 340 },
];

const TYPE_COLORS = {
  hub: '#00F0FF',
  fulfillment: '#64748B',
  port: '#00FF41'
};

const WorldModel3D = () => {
  const canvasRef = useRef(null);
  const [selectedDC, setSelectedDC] = useState(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showShipments, setShowShipments] = useState(true);
  const [particles, setParticles] = useState([]);
  const animationRef = useRef(null);

  const selectedDCData = selectedDC ? DC_POSITIONS.find(dc => dc.id === selectedDC) : null;

  // Calculate totals
  const totalInventory = Math.round(DC_POSITIONS.reduce((sum, dc) => sum + dc.inventory, 0) / DC_POSITIONS.length);
  const totalShipments = DC_POSITIONS.reduce((sum, dc) => sum + dc.shipments, 0);
  const activeRoutes = ROUTES.filter(r => r.active).length;

  // Initialize particles
  useEffect(() => {
    const initialParticles = ROUTES.filter(r => r.active).map((route, idx) => ({
      routeIdx: idx,
      progress: Math.random(),
      speed: route.flow / 8000
    }));
    setParticles(initialParticles);
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dcMap = {};
    DC_POSITIONS.forEach(dc => {
      dcMap[dc.id] = dc;
    });

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = '#0a0a12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw routes
      if (showRoutes) {
        ROUTES.forEach(route => {
          const from = dcMap[route.from];
          const to = dcMap[route.to];
          
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          
          // Curved path
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2 - 30;
          ctx.quadraticCurveTo(midX, midY, to.x, to.y);
          
          ctx.strokeStyle = route.active ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 184, 0, 0.2)';
          ctx.lineWidth = route.active ? 2 : 1;
          if (!route.active) {
            ctx.setLineDash([5, 5]);
          } else {
            ctx.setLineDash([]);
          }
          ctx.stroke();
        });
      }

      // Draw particles (shipments)
      if (showShipments) {
        setParticles(prev => prev.map(p => {
          const route = ROUTES.filter(r => r.active)[p.routeIdx];
          if (!route) return p;

          const from = dcMap[route.from];
          const to = dcMap[route.to];

          // Update progress
          const newProgress = p.progress + p.speed;
          const progress = newProgress > 1 ? 0 : newProgress;

          // Calculate position along quadratic curve
          const t = progress;
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2 - 30;
          
          const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * midX + t * t * to.x;
          const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * midY + t * t * to.y;

          // Draw particle
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#00F0FF';
          ctx.fill();
          
          // Glow effect
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
          gradient.addColorStop(0, 'rgba(0, 240, 255, 0.5)');
          gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
          ctx.fillStyle = gradient;
          ctx.fill();

          return { ...p, progress };
        }));
      }

      // Draw nodes
      DC_POSITIONS.forEach(dc => {
        const color = TYPE_COLORS[dc.type];
        const isSelected = selectedDC === dc.id;
        const size = dc.type === 'hub' ? 20 : 16;

        // Glow effect
        ctx.beginPath();
        ctx.arc(dc.x, dc.y, size + 10, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(dc.x, dc.y, 0, dc.x, dc.y, size + 10);
        gradient.addColorStop(0, isSelected ? `${color}40` : `${color}20`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Node
        ctx.beginPath();
        ctx.arc(dc.x, dc.y, size, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? color : `${color}80`;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.stroke();

        // Inventory bar
        const barHeight = (dc.inventory / 100) * 30;
        ctx.fillStyle = dc.inventory > 85 ? '#FFB800' : '#00FF41';
        ctx.fillRect(dc.x + 25, dc.y - barHeight, 4, barHeight);

        // Label
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(dc.name, dc.x, dc.y + size + 15);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showRoutes, showShipments, selectedDC]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on a DC
    for (const dc of DC_POSITIONS) {
      const dist = Math.sqrt((x - dc.x) ** 2 + (y - dc.y) ** 2);
      if (dist < 25) {
        setSelectedDC(selectedDC === dc.id ? null : dc.id);
        return;
      }
    }
    setSelectedDC(null);
  };

  return (
    <div data-testid="world-model-3d" className="nexus-widget">
      <div className="widget-header mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/10 to-transparent border border-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
          </div>
          <div>
            <h3 className="widget-title">Supply Chain Network</h3>
            <p className="text-xs font-mono text-white/40">Digital twin visualization • Layer 7</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`px-3 py-1 rounded text-xs font-mono transition-all ${
              showRoutes ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-white/5 text-white/40 border border-white/10'
            }`}
          >
            Routes
          </button>
          <button
            onClick={() => setShowShipments(!showShipments)}
            className={`px-3 py-1 rounded text-xs font-mono transition-all ${
              showShipments ? 'bg-white/5 text-white/60 border border-white/20' : 'bg-white/5 text-white/40 border border-white/10'
            }`}
          >
            Shipments
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Avg Inventory</p>
          <p className="text-xl font-mono font-bold text-cyan-400">{totalInventory}%</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Total Shipments</p>
          <p className="text-xl font-mono font-bold text-white/60">{totalShipments.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Active Routes</p>
          <p className="text-xl font-mono font-bold text-green-400">{activeRoutes}/{ROUTES.length}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Distribution Centers</p>
          <p className="text-xl font-mono font-bold text-white">{DC_POSITIONS.length}</p>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-lg overflow-hidden border border-white/10">
        <canvas 
          ref={canvasRef}
          width={800}
          height={400}
          onClick={handleCanvasClick}
          className="cursor-pointer w-full"
          style={{ background: '#0a0a12' }}
        />
        
        {/* Legend */}
        <div className="absolute top-4 left-4 p-3 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
          <p className="text-xs font-mono text-white/50 uppercase mb-2">Legend</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400" />
              <span className="text-xs text-white/70">Hub</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-400" />
              <span className="text-xs text-white/70">Fulfillment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-xs text-white/70">Port</span>
            </div>
          </div>
        </div>
        
        {/* Info */}
        <div className="absolute bottom-4 right-4 p-2 rounded bg-black/60 backdrop-blur-sm border border-white/10">
          <p className="text-xs font-mono text-white/40">Click nodes to inspect</p>
        </div>
      </div>

      {/* Selected DC Details */}
      {selectedDCData && (
        <div className="mt-4 p-4 rounded-lg bg-black/30 border border-cyan-500/20 slide-up">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-heading text-lg font-bold text-white">{selectedDCData.name}</h4>
              <p className="text-xs font-mono text-white/40 uppercase">{selectedDCData.type} • {selectedDCData.id}</p>
            </div>
            <button onClick={() => setSelectedDC(null)} className="text-white/40 hover:text-white">✕</button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-mono text-white/40">Inventory Level</p>
              <p className={`text-xl font-mono font-bold ${selectedDCData.inventory > 85 ? 'text-yellow-400' : 'text-green-400'}`}>
                {selectedDCData.inventory}%
              </p>
            </div>
            <div>
              <p className="text-xs font-mono text-white/40">Active Shipments</p>
              <p className="text-xl font-mono font-bold text-cyan-400">{selectedDCData.shipments}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-white/40">Status</p>
              <p className="text-xl font-mono font-bold text-green-400">ONLINE</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldModel3D;
