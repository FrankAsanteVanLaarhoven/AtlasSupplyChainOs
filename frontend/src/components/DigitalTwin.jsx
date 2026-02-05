import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Zap, TrendingUp, AlertTriangle, RotateCcw, Activity } from 'lucide-react';

// ============== SUPPLY CHAIN PHYSICS ENGINE ==============

// Distribution centers with physics properties
const INITIAL_DCS = [
  { id: 'dc-1', name: 'LA Hub', x: 120, y: 200, type: 'hub', inventory: 78, capacity: 100, inflow: 0, outflow: 0, demand: 0 },
  { id: 'dc-2', name: 'Chicago', x: 420, y: 140, type: 'fulfillment', inventory: 92, capacity: 100, inflow: 0, outflow: 0, demand: 0 },
  { id: 'dc-3', name: 'NYC', x: 720, y: 170, type: 'hub', inventory: 85, capacity: 100, inflow: 0, outflow: 0, demand: 0 },
  { id: 'dc-4', name: 'Houston', x: 280, y: 340, type: 'port', inventory: 65, capacity: 100, inflow: 0, outflow: 0, demand: 0 },
  { id: 'dc-5', name: 'Seattle', x: 100, y: 60, type: 'port', inventory: 71, capacity: 100, inflow: 0, outflow: 0, demand: 0 },
  { id: 'dc-6', name: 'Miami', x: 640, y: 370, type: 'port', inventory: 88, capacity: 100, inflow: 0, outflow: 0, demand: 0 },
];

// Supply chain connections (edges)
const CONNECTIONS = [
  { from: 'dc-5', to: 'dc-1', capacity: 800, flow: 620, leadTime: 2 },
  { from: 'dc-5', to: 'dc-2', capacity: 500, flow: 290, leadTime: 3 },
  { from: 'dc-1', to: 'dc-2', capacity: 700, flow: 450, leadTime: 2 },
  { from: 'dc-1', to: 'dc-4', capacity: 600, flow: 520, leadTime: 1 },
  { from: 'dc-2', to: 'dc-3', capacity: 600, flow: 380, leadTime: 2 },
  { from: 'dc-4', to: 'dc-6', capacity: 400, flow: 180, leadTime: 2 },
  { from: 'dc-3', to: 'dc-6', capacity: 500, flow: 340, leadTime: 3 },
];

const TYPE_COLORS = {
  hub: { primary: '#00F0FF', glow: 'rgba(0, 240, 255, 0.3)' },
  fulfillment: { primary: '#64748B', glow: 'rgba(100, 116, 139, 0.3)' },
  port: { primary: '#00FF41', glow: 'rgba(0, 255, 65, 0.3)' }
};

// Physics constants
const PHYSICS = {
  demandDecay: 0.95,        // How fast demand dissipates
  propagationSpeed: 0.3,    // How fast effects propagate
  inventoryInertia: 0.85,   // Resistance to inventory changes
  maxCascadeDepth: 4,       // Max hops for cascade effect
};

// ============== DIGITAL TWIN COMPONENT ==============

const DigitalTwin = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isSimulating, setIsSimulating] = useState(true);
  const [selectedDC, setSelectedDC] = useState(null);
  const [dcs, setDcs] = useState(INITIAL_DCS);
  const [cascadeEffects, setCascadeEffects] = useState([]);
  const [demandSpike, setDemandSpike] = useState(null);
  const [simTime, setSimTime] = useState(0);
  const [showPhysics, setShowPhysics] = useState(true);
  const [showCascade, setShowCascade] = useState(true);
  
  // Particles for flow visualization
  const particlesRef = useRef([]);
  const lastPhysicsUpdate = useRef(0);
  const PHYSICS_UPDATE_INTERVAL = 100; // Update physics every 100ms instead of every frame
  const dcsRef = useRef(INITIAL_DCS);
  const cascadeEffectsRef = useRef([]);
  
  // Keep refs in sync with state
  useEffect(() => {
    dcsRef.current = dcs;
  }, [dcs]);
  
  useEffect(() => {
    cascadeEffectsRef.current = cascadeEffects;
  }, [cascadeEffects]);
  
  // Initialize particles
  useEffect(() => {
    particlesRef.current = CONNECTIONS.map((conn, idx) => ({
      connectionIdx: idx,
      particles: Array(Math.ceil(conn.flow / 150)).fill(null).map(() => ({
        progress: Math.random(),
        speed: 0.002 + Math.random() * 0.002
      }))
    }));
  }, []);

  // Physics simulation step
  const simulatePhysics = useCallback(() => {
    setDcs(prevDcs => {
      const newDcs = prevDcs.map(dc => ({ ...dc }));
      const dcMap = {};
      newDcs.forEach(dc => { dcMap[dc.id] = dc; });

      // Apply demand decay
      newDcs.forEach(dc => {
        dc.demand *= PHYSICS.demandDecay;
        if (dc.demand < 0.5) dc.demand = 0;
      });

      // Calculate flows based on connections
      CONNECTIONS.forEach(conn => {
        const fromDC = dcMap[conn.from];
        const toDC = dcMap[conn.to];
        if (!fromDC || !toDC) return;

        // Flow rate based on inventory differential and demand
        const inventoryPressure = (fromDC.inventory - toDC.inventory) / 100;
        const demandPull = toDC.demand / 100;
        const flowRate = Math.max(0, (inventoryPressure + demandPull) * conn.capacity * 0.01);

        // Apply flow
        if (fromDC.inventory > 10) {
          fromDC.outflow += flowRate;
          toDC.inflow += flowRate;
        }
      });

      // Update inventories with inertia
      newDcs.forEach(dc => {
        const netFlow = (dc.inflow - dc.outflow - dc.demand * 0.5) * 0.1;
        dc.inventory = Math.max(0, Math.min(dc.capacity, 
          dc.inventory * PHYSICS.inventoryInertia + netFlow
        ));
        
        // Reset flow counters
        dc.inflow = 0;
        dc.outflow = 0;
      });

      return newDcs;
    });

    // Decay cascade effects
    setCascadeEffects(prev => 
      prev.filter(e => e.alpha > 0.1).map(e => ({
        ...e,
        radius: e.radius + 3,
        alpha: e.alpha * 0.92
      }))
    );

    setSimTime(t => t + 1);
  }, []);

  // Trigger demand spike at a DC
  const triggerDemandSpike = useCallback((dcId, intensity = 50) => {
    setDemandSpike({ dcId, intensity, time: simTime });
    
    // Create cascade effects
    const dcMap = {};
    dcs.forEach(dc => { dcMap[dc.id] = dc; });
    const targetDC = dcMap[dcId];
    if (!targetDC) return;

    // Initial spike effect
    setCascadeEffects(prev => [...prev, {
      x: targetDC.x,
      y: targetDC.y,
      radius: 20,
      alpha: 1,
      color: '#FF003C'
    }]);

    // Propagate demand through network
    const visited = new Set([dcId]);
    const queue = [{ id: dcId, depth: 0, intensity }];
    
    setDcs(prevDcs => {
      const newDcs = prevDcs.map(dc => ({ ...dc }));
      const map = {};
      newDcs.forEach(dc => { map[dc.id] = dc; });

      while (queue.length > 0) {
        const { id, depth, intensity: currentIntensity } = queue.shift();
        if (depth > PHYSICS.maxCascadeDepth) continue;

        const dc = map[id];
        if (dc) {
          dc.demand += currentIntensity * Math.pow(PHYSICS.propagationSpeed, depth);
        }

        // Find upstream connections
        CONNECTIONS.forEach(conn => {
          if (conn.to === id && !visited.has(conn.from)) {
            visited.add(conn.from);
            const upstreamDC = map[conn.from];
            if (upstreamDC) {
              // Add cascade visual effect with delay
              setTimeout(() => {
                setCascadeEffects(prev => [...prev, {
                  x: upstreamDC.x,
                  y: upstreamDC.y,
                  radius: 15,
                  alpha: 0.8 - depth * 0.15,
                  color: depth === 0 ? '#FF003C' : depth === 1 ? '#FFB800' : '#00F0FF'
                }]);
              }, depth * 300);

              queue.push({ 
                id: conn.from, 
                depth: depth + 1, 
                intensity: currentIntensity * PHYSICS.propagationSpeed 
              });
            }
          }
        });
      }

      return newDcs;
    });
  }, [dcs, simTime]);

  // Animation loop
  useEffect(() => {
    if (!isSimulating) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const animate = () => {
      // Use refs for current values to avoid stale closures
      const currentDcs = dcsRef.current;
      const currentCascadeEffects = cascadeEffectsRef.current;
      
      const dcMap = {};
      currentDcs.forEach(dc => { dcMap[dc.id] = dc; });
      
      // Clear canvas
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid with perspective effect
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw connections with flow visualization
      CONNECTIONS.forEach((conn, connIdx) => {
        const from = dcMap[conn.from];
        const to = dcMap[conn.to];
        if (!from || !to) return;

        // Draw connection line
        const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
        gradient.addColorStop(0, TYPE_COLORS[from.type].primary + '60');
        gradient.addColorStop(1, TYPE_COLORS[to.type].primary + '60');
        
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        
        // Curved path
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2 - 20;
        ctx.quadraticCurveTo(midX, midY, to.x, to.y);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = Math.max(1, conn.flow / 200);
        ctx.stroke();

        // Draw flow particles
        if (particlesRef.current[connIdx]) {
          particlesRef.current[connIdx].particles.forEach(p => {
            p.progress += p.speed;
            if (p.progress > 1) p.progress = 0;

            const t = p.progress;
            const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * midX + t * t * to.x;
            const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * midY + t * t * to.y;

            // Particle glow
            const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, 6);
            particleGradient.addColorStop(0, '#00F0FF');
            particleGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = particleGradient;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();

            // Particle core
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      });

      // Draw cascade effects
      if (showCascade) {
        currentCascadeEffects.forEach(effect => {
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
          ctx.strokeStyle = effect.color + Math.floor(effect.alpha * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = 3;
          ctx.stroke();
        });
      }

      // Draw DC nodes
      currentDcs.forEach(dc => {
        const colors = TYPE_COLORS[dc.type];
        const isSelected = selectedDC === dc.id;
        const hasDemand = dc.demand > 1;
        const size = dc.type === 'hub' ? 28 : 22;

        // Demand pulse effect
        if (hasDemand && showPhysics) {
          const pulseSize = size + 15 + Math.sin(Date.now() * 0.002) * 5;
          ctx.beginPath();
          ctx.arc(dc.x, dc.y, pulseSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 0, 60, ${Math.min(dc.demand / 100, 0.4)})`;
          ctx.fill();
        }

        // Node glow
        const glowGradient = ctx.createRadialGradient(dc.x, dc.y, 0, dc.x, dc.y, size + 15);
        glowGradient.addColorStop(0, colors.glow);
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(dc.x, dc.y, size + 15, 0, Math.PI * 2);
        ctx.fill();

        // Node base (3D effect)
        ctx.beginPath();
        ctx.ellipse(dc.x, dc.y + 8, size * 0.8, size * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fill();

        // Node body
        ctx.beginPath();
        ctx.arc(dc.x, dc.y, size, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? colors.primary : colors.primary + '90';
        ctx.fill();
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.stroke();

        // Inventory level indicator (vertical bar)
        const barHeight = 40;
        const barWidth = 6;
        const barX = dc.x + size + 10;
        const barY = dc.y - barHeight / 2;
        
        // Bar background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Bar fill
        const fillHeight = (dc.inventory / dc.capacity) * barHeight;
        const inventoryColor = dc.inventory < 30 ? '#FF003C' : dc.inventory < 50 ? '#FFB800' : '#00FF41';
        ctx.fillStyle = inventoryColor;
        ctx.fillRect(barX, barY + barHeight - fillHeight, barWidth, fillHeight);

        // Node label
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        ctx.fillText(dc.name, dc.x, dc.y + size + 20);

        // Inventory percentage
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = inventoryColor;
        ctx.fillText(`${Math.round(dc.inventory)}%`, dc.x, dc.y + size + 32);

        // Demand indicator
        if (hasDemand && showPhysics) {
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.fillStyle = '#FF003C';
          ctx.fillText(`⚡${Math.round(dc.demand)}`, dc.x, dc.y - size - 10);
        }
      });

      // Physics simulation - throttled to prevent infinite re-renders
      const now = Date.now();
      if (now - lastPhysicsUpdate.current > PHYSICS_UPDATE_INTERVAL) {
        lastPhysicsUpdate.current = now;
        simulatePhysics();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSimulating, selectedDC, showPhysics, showCascade, simulatePhysics]);

  // Handle canvas click
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    for (const dc of dcs) {
      const dist = Math.sqrt((x - dc.x) ** 2 + (y - dc.y) ** 2);
      if (dist < 35) {
        if (selectedDC === dc.id) {
          // Double-click to trigger demand spike
          triggerDemandSpike(dc.id, 60);
        } else {
          setSelectedDC(dc.id);
        }
        return;
      }
    }
    setSelectedDC(null);
  };

  // Reset simulation
  const resetSimulation = () => {
    setDcs(INITIAL_DCS);
    setCascadeEffects([]);
    setDemandSpike(null);
    setSimTime(0);
  };

  // Calculate network health metrics
  const avgInventory = Math.round(dcs.reduce((sum, dc) => sum + dc.inventory, 0) / dcs.length);
  const totalDemand = Math.round(dcs.reduce((sum, dc) => sum + dc.demand, 0));
  const criticalNodes = dcs.filter(dc => dc.inventory < 30).length;
  const networkHealth = avgInventory > 70 ? 'OPTIMAL' : avgInventory > 50 ? 'NORMAL' : avgInventory > 30 ? 'STRESSED' : 'CRITICAL';
  const healthColor = avgInventory > 70 ? '#00FF41' : avgInventory > 50 ? '#00F0FF' : avgInventory > 30 ? '#FFB800' : '#FF003C';

  const selectedDCData = selectedDC ? dcs.find(dc => dc.id === selectedDC) : null;

  return (
    <div data-testid="world-model-3d" className="nexus-widget">
      <div className="widget-header mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/10 to-transparent border border-white/10">
            <Activity size={18} className="text-white/60" />
          </div>
          <div>
            <h3 className="widget-title">Digital Twin • World Model</h3>
            <p className="text-xs font-mono text-white/40">Physics-based supply chain simulation • Layer 7</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`p-2 rounded-lg transition-all ${
              isSimulating ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-white/5 text-white/40 border border-white/10'
            }`}
          >
            {isSimulating ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={resetSimulation}
            className="p-2 rounded-lg bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Network Health Dashboard */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Network Status</p>
          <p className="text-lg font-mono font-bold" style={{ color: healthColor }}>{networkHealth}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Avg Inventory</p>
          <p className="text-lg font-mono font-bold text-cyan-400">{avgInventory}%</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Active Demand</p>
          <p className="text-lg font-mono font-bold text-white/60">{totalDemand}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Critical Nodes</p>
          <p className={`text-lg font-mono font-bold ${criticalNodes > 0 ? 'text-red-400' : 'text-green-400'}`}>{criticalNodes}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Sim Time</p>
          <p className="text-lg font-mono font-bold text-white">{simTime}t</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setShowPhysics(!showPhysics)}
          className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-2 ${
            showPhysics ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-white/5 text-white/40 border border-white/10'
          }`}
        >
          <Zap size={12} /> Physics
        </button>
        <button
          onClick={() => setShowCascade(!showCascade)}
          className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-2 ${
            showCascade ? 'bg-white/5 text-white/60 border border-white/20' : 'bg-white/5 text-white/40 border border-white/10'
          }`}
        >
          <TrendingUp size={12} /> Cascade
        </button>
        <div className="flex-1" />
        <span className="text-xs font-mono text-white/40">Click node twice to trigger demand spike</span>
      </div>

      {/* Canvas */}
      <div className="relative rounded-lg overflow-hidden border border-white/10">
        <canvas 
          ref={canvasRef}
          width={850}
          height={420}
          onClick={handleCanvasClick}
          className="cursor-pointer w-full"
          style={{ background: '#050510' }}
        />
        
        {/* Legend */}
        <div className="absolute top-4 left-4 p-3 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10">
          <p className="text-xs font-mono text-white/50 uppercase mb-2">Network Nodes</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TYPE_COLORS.hub.primary }} />
              <span className="text-xs text-white/70">Hub (High Capacity)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TYPE_COLORS.fulfillment.primary }} />
              <span className="text-xs text-white/70">Fulfillment Center</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TYPE_COLORS.port.primary }} />
              <span className="text-xs text-white/70">Port (Supplier Entry)</span>
            </div>
          </div>
          <div className="border-t border-white/10 mt-2 pt-2">
            <p className="text-xs font-mono text-white/50 uppercase mb-1">Inventory Health</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-400">●</span><span className="text-white/60">&gt;50%</span>
              <span className="text-yellow-400">●</span><span className="text-white/60">30-50%</span>
              <span className="text-red-400">●</span><span className="text-white/60">&lt;30%</span>
            </div>
          </div>
        </div>

        {/* Cascade Alert */}
        {demandSpike && (
          <div className="absolute top-4 right-4 p-3 rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-500/50 animate-pulse">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400" />
              <span className="text-xs font-mono text-red-400">DEMAND SPIKE DETECTED</span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              {dcs.find(dc => dc.id === demandSpike.dcId)?.name} • Intensity: {demandSpike.intensity}
            </p>
          </div>
        )}
      </div>

      {/* Selected Node Details */}
      {selectedDCData && (
        <div className="mt-4 p-4 rounded-lg bg-black/30 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-heading text-lg font-bold text-white">{selectedDCData.name}</h4>
              <p className="text-xs font-mono text-white/40 uppercase">{selectedDCData.type} • {selectedDCData.id}</p>
            </div>
            <button 
              onClick={() => triggerDemandSpike(selectedDCData.id, 60)}
              className="px-3 py-1.5 rounded text-xs font-mono bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 flex items-center gap-2"
            >
              <Zap size={12} /> Simulate Demand Spike
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-mono text-white/40">Inventory</p>
              <p className={`text-xl font-mono font-bold ${selectedDCData.inventory < 30 ? 'text-red-400' : selectedDCData.inventory < 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                {Math.round(selectedDCData.inventory)}%
              </p>
            </div>
            <div>
              <p className="text-xs font-mono text-white/40">Capacity</p>
              <p className="text-xl font-mono font-bold text-cyan-400">{selectedDCData.capacity}%</p>
            </div>
            <div>
              <p className="text-xs font-mono text-white/40">Active Demand</p>
              <p className="text-xl font-mono font-bold text-white/60">{Math.round(selectedDCData.demand)}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-white/40">Status</p>
              <p className={`text-xl font-mono font-bold ${selectedDCData.inventory > 30 ? 'text-green-400' : 'text-red-400'}`}>
                {selectedDCData.inventory > 30 ? 'HEALTHY' : 'AT RISK'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Physics Explanation */}
      <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-slate-500/10 to-cyan-500/10 border border-white/5">
        <h4 className="font-mono text-sm text-white/70 mb-2">🧠 World Model Physics</h4>
        <p className="text-xs text-white/50 leading-relaxed">
          This simulation models supply chain dynamics using physics-based principles: <strong className="text-cyan-400">inventory inertia</strong> (resistance to sudden changes), 
          <strong className="text-white/60"> demand propagation</strong> (cascade effects upstream), and <strong className="text-green-400">flow equilibrium</strong> (inventory seeks balance across network).
          Click any node twice to trigger a demand spike and observe the cascade effect through the supply chain.
        </p>
      </div>
    </div>
  );
};

export default DigitalTwin;
