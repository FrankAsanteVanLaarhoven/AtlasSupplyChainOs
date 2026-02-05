import React, { useState, useEffect, useRef } from 'react';
import { Radio, Wifi, Globe, Zap, Server, Activity, Signal, MapPin, Clock, TrendingUp } from 'lucide-react';

// Edge node locations with 6G capabilities
const EDGE_NODES = [
  { id: 'edge-us-west', name: 'US West', lat: 37.7749, lng: -122.4194, city: 'San Francisco', status: 'active', latency: 2.3, bandwidth: 98, connections: 1247, load: 67 },
  { id: 'edge-us-east', name: 'US East', lat: 40.7128, lng: -74.0060, city: 'New York', status: 'active', latency: 1.8, bandwidth: 99, connections: 2134, load: 82 },
  { id: 'edge-eu-west', name: 'EU West', lat: 51.5074, lng: -0.1278, city: 'London', status: 'active', latency: 3.1, bandwidth: 97, connections: 1876, load: 71 },
  { id: 'edge-eu-central', name: 'EU Central', lat: 52.5200, lng: 13.4050, city: 'Berlin', status: 'active', latency: 2.7, bandwidth: 96, connections: 1432, load: 58 },
  { id: 'edge-asia-east', name: 'Asia East', lat: 35.6762, lng: 139.6503, city: 'Tokyo', status: 'active', latency: 4.2, bandwidth: 95, connections: 3241, load: 89 },
  { id: 'edge-asia-south', name: 'Asia South', lat: 1.3521, lng: 103.8198, city: 'Singapore', status: 'active', latency: 3.8, bandwidth: 94, connections: 2567, load: 76 },
  { id: 'edge-oceania', name: 'Oceania', lat: -33.8688, lng: 151.2093, city: 'Sydney', status: 'maintenance', latency: 5.1, bandwidth: 92, connections: 987, load: 34 },
  { id: 'edge-latam', name: 'LATAM', lat: -23.5505, lng: -46.6333, city: 'São Paulo', status: 'active', latency: 6.2, bandwidth: 91, connections: 1123, load: 62 },
];

const SixGEdge = () => {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes] = useState(EDGE_NODES);
  const [globalMetrics, setGlobalMetrics] = useState({
    avgLatency: 3.65,
    totalConnections: 14607,
    avgBandwidth: 95.25,
    activeNodes: 7
  });
  const [dataPackets, setDataPackets] = useState([]);

  // Simulate real-time data packet flow
  useEffect(() => {
    const interval = setInterval(() => {
      setDataPackets(prev => {
        const newPackets = [...prev];
        
        // Add new packets
        if (Math.random() < 0.3) {
          const fromNode = nodes[Math.floor(Math.random() * nodes.length)];
          const toNode = nodes[Math.floor(Math.random() * nodes.length)];
          if (fromNode.id !== toNode.id && fromNode.status === 'active' && toNode.status === 'active') {
            newPackets.push({
              id: Date.now(),
              from: fromNode.id,
              to: toNode.id,
              progress: 0,
              speed: 0.02 + Math.random() * 0.02
            });
          }
        }
        
        // Update existing packets
        return newPackets
          .map(p => ({ ...p, progress: p.progress + p.speed }))
          .filter(p => p.progress < 1);
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [nodes]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Project lat/lng to canvas coordinates
    const project = (lat, lng) => ({
      x: ((lng + 180) / 360) * canvas.width,
      y: ((90 - lat) / 180) * canvas.height
    });

    let animationId;
    let time = 0;

    const animate = () => {
      time += 0.02;
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw world map outline (simplified)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Simplified continent outlines
      ctx.moveTo(150, 100); ctx.lineTo(250, 90); ctx.lineTo(280, 120); ctx.lineTo(260, 200); ctx.lineTo(180, 220); ctx.lineTo(150, 100);
      ctx.moveTo(300, 80); ctx.lineTo(450, 70); ctx.lineTo(480, 180); ctx.lineTo(300, 200); ctx.lineTo(300, 80);
      ctx.moveTo(500, 100); ctx.lineTo(700, 80); ctx.lineTo(750, 200); ctx.lineTo(550, 220); ctx.lineTo(500, 100);
      ctx.moveTo(200, 280); ctx.lineTo(280, 250); ctx.lineTo(300, 350); ctx.lineTo(220, 380); ctx.lineTo(200, 280);
      ctx.moveTo(600, 300); ctx.lineTo(680, 280); ctx.lineTo(700, 380); ctx.lineTo(620, 400); ctx.lineTo(600, 300);
      ctx.stroke();

      // Draw grid overlay
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
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

      // Draw connections between nodes
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = 1;
      nodes.forEach((node1, i) => {
        nodes.slice(i + 1).forEach(node2 => {
          const p1 = project(node1.lat, node1.lng);
          const p2 = project(node2.lat, node2.lng);
          ctx.beginPath();
          ctx.setLineDash([5, 5]);
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          ctx.setLineDash([]);
        });
      });

      // Draw data packets
      dataPackets.forEach(packet => {
        const fromNode = nodes.find(n => n.id === packet.from);
        const toNode = nodes.find(n => n.id === packet.to);
        if (!fromNode || !toNode) return;

        const p1 = project(fromNode.lat, fromNode.lng);
        const p2 = project(toNode.lat, toNode.lng);
        
        const x = p1.x + (p2.x - p1.x) * packet.progress;
        const y = p1.y + (p2.y - p1.y) * packet.progress;

        // Packet glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
        gradient.addColorStop(0, '#00F0FF');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Packet core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw nodes
      nodes.forEach(node => {
        const pos = project(node.lat, node.lng);
        const isSelected = selectedNode?.id === node.id;
        const pulse = Math.sin(time * 3 + node.lat) * 0.2 + 1;

        // Node glow
        const glowColor = node.status === 'active' ? '#00F0FF' : '#FFB800';
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 25 * pulse);
        gradient.addColorStop(0, glowColor + '40');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 25 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Signal rings for active nodes
        if (node.status === 'active') {
          const ringAlpha = ((time * 2) % 1);
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.5 - ringAlpha * 0.5})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 15 + ringAlpha * 20, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Node core
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, isSelected ? 10 : 7, 0, Math.PI * 2);
        ctx.fillStyle = node.status === 'active' ? '#00F0FF' : '#FFB800';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#FFFFFF' : 'transparent';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Node label
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(node.city, pos.x, pos.y + 22);
        
        // Latency indicator
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillStyle = node.latency < 3 ? '#00FF41' : node.latency < 5 ? '#FFB800' : '#FF003C';
        ctx.fillText(`${node.latency}ms`, pos.x, pos.y + 32);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [nodes, selectedNode, dataPackets]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const project = (lat, lng) => ({
      x: ((lng + 180) / 360) * canvas.width,
      y: ((90 - lat) / 180) * canvas.height
    });

    for (const node of nodes) {
      const pos = project(node.lat, node.lng);
      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (dist < 20) {
        setSelectedNode(node);
        return;
      }
    }
    setSelectedNode(null);
  };

  return (
    <div data-testid="sixg-edge" className="nexus-widget">
      <div className="widget-header mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
            <Radio size={18} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="widget-title">6G Edge Network</h3>
            <p className="text-xs font-mono text-white/40">Global edge deployment • Layer 9</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded text-xs font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 flex items-center gap-1">
            <Signal size={10} /> 6G ACTIVE
          </span>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Avg Latency</p>
          <p className="text-xl font-mono font-bold text-green-400">{globalMetrics.avgLatency}ms</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Connections</p>
          <p className="text-xl font-mono font-bold text-cyan-400">{globalMetrics.totalConnections.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Bandwidth</p>
          <p className="text-xl font-mono font-bold text-white/60">{globalMetrics.avgBandwidth}%</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Active Nodes</p>
          <p className="text-xl font-mono font-bold text-white">{globalMetrics.activeNodes}/{nodes.length}</p>
        </div>
      </div>

      {/* World Map Canvas */}
      <div className="relative rounded-lg overflow-hidden border border-white/10 mb-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          onClick={handleCanvasClick}
          className="cursor-pointer w-full"
        />
        
        {/* Legend */}
        <div className="absolute top-3 left-3 p-2 rounded bg-black/70 backdrop-blur-sm border border-white/10">
          <p className="text-xs font-mono text-white/50 uppercase mb-1">Latency Tiers</p>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-white/60">&lt;3ms Ultra-Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-xs text-white/60">3-5ms Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs text-white/60">&gt;5ms Standard</span>
            </div>
          </div>
        </div>

        {/* Real-time indicator */}
        <div className="absolute top-3 right-3 p-2 rounded bg-black/70 backdrop-blur-sm border border-white/10 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-mono text-white/60">LIVE</span>
        </div>
      </div>

      {/* Node List */}
      <div className="grid grid-cols-4 gap-2">
        {nodes.map(node => (
          <div
            key={node.id}
            onClick={() => setSelectedNode(node)}
            className={`p-3 rounded-lg cursor-pointer transition-all ${
              selectedNode?.id === node.id
                ? 'bg-white/10 border border-cyan-500/50'
                : 'bg-black/30 border border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={12} className="text-cyan-400" />
              <span className="text-xs font-mono text-white/80">{node.city}</span>
              <span className={`ml-auto w-2 h-2 rounded-full ${
                node.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
              }`} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={`font-mono ${node.latency < 3 ? 'text-green-400' : node.latency < 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                {node.latency}ms
              </span>
              <span className="text-white/40">{node.load}% load</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="mt-4 p-4 rounded-lg bg-black/30 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-heading text-lg font-bold text-white">{selectedNode.city} Edge Node</h4>
              <p className="text-xs font-mono text-white/40">{selectedNode.name} • {selectedNode.id}</p>
            </div>
            <span className={`px-3 py-1 rounded text-xs font-mono ${
              selectedNode.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {selectedNode.status.toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-mono text-white/40">Latency</p>
              <p className={`text-xl font-mono font-bold ${selectedNode.latency < 3 ? 'text-green-400' : selectedNode.latency < 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                {selectedNode.latency}ms
              </p>
            </div>
            <div>
              <p className="text-xs font-mono text-white/40">Bandwidth</p>
              <p className="text-xl font-mono font-bold text-cyan-400">{selectedNode.bandwidth}%</p>
            </div>
            <div>
              <p className="text-xs font-mono text-white/40">Connections</p>
              <p className="text-xl font-mono font-bold text-white/60">{selectedNode.connections.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-white/40">Load</p>
              <p className={`text-xl font-mono font-bold ${selectedNode.load > 80 ? 'text-yellow-400' : 'text-green-400'}`}>
                {selectedNode.load}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SixGEdge;
