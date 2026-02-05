import React, { useState, useEffect, useRef } from 'react';
import { Bot, Cpu, Wifi, Battery, MapPin, Package, AlertTriangle, CheckCircle, Truck, Cog } from 'lucide-react';

// Simulated robot fleet data
const ROBOT_FLEET = [
  { id: 'AMR-001', type: 'amr', name: 'Scout Alpha', status: 'active', battery: 87, task: 'Picking', zone: 'A3', packages: 12, speed: 1.2 },
  { id: 'AMR-002', type: 'amr', name: 'Scout Beta', status: 'active', battery: 64, task: 'Transport', zone: 'B1', packages: 8, speed: 1.5 },
  { id: 'AMR-003', type: 'amr', name: 'Scout Gamma', status: 'charging', battery: 23, task: 'Idle', zone: 'Dock', packages: 0, speed: 0 },
  { id: 'AGV-001', type: 'agv', name: 'Hauler Prime', status: 'active', battery: 92, task: 'Heavy Lift', zone: 'C2', packages: 3, speed: 0.8 },
  { id: 'AGV-002', type: 'agv', name: 'Hauler Duo', status: 'maintenance', battery: 100, task: 'Maintenance', zone: 'Bay', packages: 0, speed: 0 },
  { id: 'DRN-001', type: 'drone', name: 'Skywatch', status: 'active', battery: 45, task: 'Inventory Scan', zone: 'Airspace', packages: 0, speed: 3.2 },
  { id: 'ARM-001', type: 'arm', name: 'Manipulator X1', status: 'active', battery: 100, task: 'Palletizing', zone: 'D1', packages: 156, speed: 0 },
  { id: 'AV-001', type: 'av', name: 'Convoy Lead', status: 'active', battery: 78, task: 'Last Mile', zone: 'External', packages: 45, speed: 35 },
];

const ROBOT_TYPES = {
  amr: { name: 'Autonomous Mobile Robot', color: '#00F0FF', icon: Bot },
  agv: { name: 'Automated Guided Vehicle', color: '#64748B', icon: Truck },
  drone: { name: 'Aerial Drone', color: '#00FF41', icon: Wifi },
  arm: { name: 'Robotic Arm', color: '#FFB800', icon: Cog },
  av: { name: 'Autonomous Vehicle', color: '#FF003C', icon: Truck },
};

const EmbodiedAI = () => {
  const canvasRef = useRef(null);
  const [selectedRobot, setSelectedRobot] = useState(null);
  const [robots, setRobots] = useState(ROBOT_FLEET);
  const [systemMetrics, setSystemMetrics] = useState({
    totalActive: 6,
    totalPackages: 224,
    avgEfficiency: 94.2,
    alertCount: 1
  });

  // Animation loop for warehouse visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId;
    let robotPositions = robots.map((r, i) => ({
      x: 100 + (i % 4) * 180,
      y: 80 + Math.floor(i / 4) * 150,
      targetX: 100 + (i % 4) * 180,
      targetY: 80 + Math.floor(i / 4) * 150,
      angle: 0
    }));

    const animate = () => {
      ctx.fillStyle = '#050510';
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

      // Draw zones
      const zones = [
        { name: 'Zone A', x: 50, y: 40, w: 200, h: 120, color: 'rgba(0, 240, 255, 0.1)' },
        { name: 'Zone B', x: 280, y: 40, w: 200, h: 120, color: 'rgba(100, 116, 139, 0.1)' },
        { name: 'Zone C', x: 510, y: 40, w: 200, h: 120, color: 'rgba(0, 255, 65, 0.1)' },
        { name: 'Zone D', x: 50, y: 200, w: 200, h: 120, color: 'rgba(255, 184, 0, 0.1)' },
        { name: 'Dock', x: 280, y: 200, w: 150, h: 80, color: 'rgba(255, 255, 255, 0.05)' },
      ];

      zones.forEach(zone => {
        ctx.fillStyle = zone.color;
        ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText(zone.name, zone.x + 5, zone.y + 15);
      });

      // Draw robots
      robots.forEach((robot, i) => {
        const pos = robotPositions[i];
        const typeInfo = ROBOT_TYPES[robot.type];
        const isSelected = selectedRobot?.id === robot.id;

        // Random movement for active robots
        if (robot.status === 'active' && Math.random() < 0.02) {
          pos.targetX = pos.x + (Math.random() - 0.5) * 40;
          pos.targetY = pos.y + (Math.random() - 0.5) * 40;
          pos.targetX = Math.max(60, Math.min(canvas.width - 60, pos.targetX));
          pos.targetY = Math.max(60, Math.min(canvas.height - 60, pos.targetY));
        }

        // Smooth movement
        pos.x += (pos.targetX - pos.x) * 0.05;
        pos.y += (pos.targetY - pos.y) * 0.05;
        pos.angle += 0.02;

        // Glow effect
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 30);
        gradient.addColorStop(0, typeInfo.color + '40');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 30, 0, Math.PI * 2);
        ctx.fill();

        // Robot body
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, isSelected ? 18 : 14, 0, Math.PI * 2);
        ctx.fillStyle = robot.status === 'active' ? typeInfo.color : '#666';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#FFF' : typeInfo.color;
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.stroke();

        // Direction indicator for moving robots
        if (robot.status === 'active' && robot.speed > 0) {
          const dx = pos.targetX - pos.x;
          const dy = pos.targetY - pos.y;
          const angle = Math.atan2(dy, dx);
          ctx.beginPath();
          ctx.moveTo(pos.x + Math.cos(angle) * 18, pos.y + Math.sin(angle) * 18);
          ctx.lineTo(pos.x + Math.cos(angle) * 28, pos.y + Math.sin(angle) * 28);
          ctx.strokeStyle = typeInfo.color;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Battery indicator
        const batteryColor = robot.battery > 50 ? '#00FF41' : robot.battery > 20 ? '#FFB800' : '#FF003C';
        ctx.fillStyle = batteryColor;
        ctx.fillRect(pos.x - 10, pos.y + 20, (robot.battery / 100) * 20, 3);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.strokeRect(pos.x - 10, pos.y + 20, 20, 3);

        // Robot ID
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.textAlign = 'center';
        ctx.fillText(robot.id, pos.x, pos.y + 35);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [robots, selectedRobot]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Find clicked robot
    const positions = robots.map((r, i) => ({
      x: 100 + (i % 4) * 180,
      y: 80 + Math.floor(i / 4) * 150,
    }));

    for (let i = 0; i < robots.length; i++) {
      const dist = Math.sqrt((x - positions[i].x) ** 2 + (y - positions[i].y) ** 2);
      if (dist < 25) {
        setSelectedRobot(robots[i]);
        return;
      }
    }
    setSelectedRobot(null);
  };

  return (
    <div data-testid="embodied-ai" className="nexus-widget">
      <div className="widget-header mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-cyan-500/20 border border-green-500/30">
            <Bot size={18} className="text-green-400" />
          </div>
          <div>
            <h3 className="widget-title">Embodied AI • Robotics Fleet</h3>
            <p className="text-xs font-mono text-white/40">Autonomous warehouse operations • Layer 8</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded text-xs font-mono bg-green-500/20 text-green-400 border border-green-500/50">
            {systemMetrics.totalActive} ACTIVE
          </span>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Active Units</p>
          <p className="text-xl font-mono font-bold text-green-400">{systemMetrics.totalActive}/{robots.length}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Packages/hr</p>
          <p className="text-xl font-mono font-bold text-cyan-400">{systemMetrics.totalPackages}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Efficiency</p>
          <p className="text-xl font-mono font-bold text-white/60">{systemMetrics.avgEfficiency}%</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Alerts</p>
          <p className={`text-xl font-mono font-bold ${systemMetrics.alertCount > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
            {systemMetrics.alertCount}
          </p>
        </div>
      </div>

      {/* Warehouse Visualization */}
      <div className="relative rounded-lg overflow-hidden border border-white/10 mb-4">
        <canvas
          ref={canvasRef}
          width={750}
          height={350}
          onClick={handleCanvasClick}
          className="cursor-pointer w-full"
        />
        
        {/* Legend */}
        <div className="absolute top-3 left-3 p-2 rounded bg-black/70 backdrop-blur-sm border border-white/10">
          <p className="text-xs font-mono text-white/50 uppercase mb-2">Robot Types</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(ROBOT_TYPES).map(([key, info]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: info.color }} />
                <span className="text-xs text-white/60">{key.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Robot Fleet List */}
      <div className="grid grid-cols-4 gap-2">
        {robots.map(robot => {
          const typeInfo = ROBOT_TYPES[robot.type];
          const Icon = typeInfo.icon;
          return (
            <div
              key={robot.id}
              onClick={() => setSelectedRobot(robot)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedRobot?.id === robot.id
                  ? 'bg-white/10 border border-cyan-500/50'
                  : 'bg-black/30 border border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color: typeInfo.color }} />
                <span className="text-xs font-mono text-white/80">{robot.id}</span>
                <span className={`ml-auto w-2 h-2 rounded-full ${
                  robot.status === 'active' ? 'bg-green-400' :
                  robot.status === 'charging' ? 'bg-yellow-400' : 'bg-red-400'
                }`} />
              </div>
              <p className="text-xs text-white/50">{robot.task}</p>
              <div className="flex items-center gap-1 mt-1">
                <Battery size={10} className="text-white/30" />
                <div className="flex-1 h-1 bg-white/10 rounded">
                  <div 
                    className="h-full rounded"
                    style={{ 
                      width: `${robot.battery}%`,
                      backgroundColor: robot.battery > 50 ? '#00FF41' : robot.battery > 20 ? '#FFB800' : '#FF003C'
                    }}
                  />
                </div>
                <span className="text-xs text-white/40">{robot.battery}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Robot Details */}
      {selectedRobot && (
        <div className="mt-4 p-4 rounded-lg bg-black/30 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-heading text-lg font-bold text-white">{selectedRobot.name}</h4>
              <p className="text-xs font-mono text-white/40">{ROBOT_TYPES[selectedRobot.type].name} • {selectedRobot.id}</p>
            </div>
            <span className={`px-3 py-1 rounded text-xs font-mono ${
              selectedRobot.status === 'active' ? 'bg-green-500/20 text-green-400' :
              selectedRobot.status === 'charging' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {selectedRobot.status.toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-mono text-white/40">Current Task</p>
              <p className="text-lg font-mono font-bold text-cyan-400">{selectedRobot.task}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-white/40">Zone</p>
              <p className="text-lg font-mono font-bold text-white/60">{selectedRobot.zone}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-white/40">Packages</p>
              <p className="text-lg font-mono font-bold text-green-400">{selectedRobot.packages}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-white/40">Speed</p>
              <p className="text-lg font-mono font-bold text-white">{selectedRobot.speed} m/s</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmbodiedAI;
