import React, { useState, useEffect, useRef } from 'react';
import { Crown, Target, TrendingUp, Shield, Swords, Brain, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';

// Strategic chess pieces representing business entities
const COMPETITORS = [
  { id: 'us', name: 'Aethon AI', type: 'king', color: '#00F0FF', position: { x: 4, y: 7 }, strength: 95, moves: [] },
  { id: 'scale', name: 'Scale AI', type: 'queen', color: '#FF003C', position: { x: 3, y: 0 }, strength: 88, moves: [] },
  { id: 'palantir', name: 'Palantir', type: 'rook', color: '#64748B', position: { x: 0, y: 0 }, strength: 82, moves: [] },
  { id: 'mckinsey', name: 'McKinsey', type: 'bishop', color: '#FFB800', position: { x: 2, y: 0 }, strength: 75, moves: [] },
  { id: 'bcg', name: 'BCG', type: 'knight', color: '#00FF41', position: { x: 6, y: 0 }, strength: 72, moves: [] },
];

const STRATEGIC_MOVES = [
  { id: 1, name: 'Market Expansion', type: 'offensive', impact: '+15% Market Share', risk: 'Medium', probability: 0.72 },
  { id: 2, name: 'IP Defense', type: 'defensive', impact: 'Patent Portfolio +12', risk: 'Low', probability: 0.89 },
  { id: 3, name: 'Talent Acquisition', type: 'offensive', impact: '+50 Engineers', risk: 'Low', probability: 0.85 },
  { id: 4, name: 'Strategic Partnership', type: 'offensive', impact: '+$50M Pipeline', risk: 'Medium', probability: 0.68 },
  { id: 5, name: 'Product Launch', type: 'offensive', impact: 'New Revenue Stream', risk: 'High', probability: 0.55 },
];

const ChessBI = () => {
  const canvasRef = useRef(null);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [competitors, setCompetitors] = useState(COMPETITORS);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationTurn, setSimulationTurn] = useState(0);
  const [strategicScore, setStrategicScore] = useState({
    marketPosition: 78,
    competitiveAdvantage: 85,
    riskExposure: 32,
    winProbability: 0.73
  });
  const [moveHistory, setMoveHistory] = useState([]);

  // Chess board animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cellSize = canvas.width / 8;

    let animationId;
    let time = 0;

    const drawPiece = (piece, x, y, size) => {
      const isSelected = selectedPiece?.id === piece.id;
      
      // Piece glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 0.8);
      gradient.addColorStop(0, piece.color + '60');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Piece body
      ctx.beginPath();
      ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? piece.color : piece.color + '90';
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#FFF' : piece.color;
      ctx.lineWidth = isSelected ? 3 : 1;
      ctx.stroke();

      // Piece icon based on type
      ctx.font = `${size * 0.5}px serif`;
      ctx.fillStyle = '#FFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icons = { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘' };
      ctx.fillText(icons[piece.type], x, y);

      // Strength indicator
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = piece.color;
      ctx.fillText(`${piece.strength}%`, x, y + size * 0.7);
    };

    const animate = () => {
      time += 0.02;
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw board
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const isLight = (row + col) % 2 === 0;
          ctx.fillStyle = isLight ? 'rgba(0, 240, 255, 0.05)' : 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
          
          // Grid lines
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
          ctx.lineWidth = 1;
          ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }

      // Draw valid moves for selected piece
      if (selectedPiece) {
        const validMoves = getValidMoves(selectedPiece);
        validMoves.forEach(move => {
          ctx.fillStyle = 'rgba(0, 255, 65, 0.2)';
          ctx.fillRect(move.x * cellSize, move.y * cellSize, cellSize, cellSize);
          ctx.strokeStyle = '#00FF41';
          ctx.lineWidth = 2;
          ctx.strokeRect(move.x * cellSize + 2, move.y * cellSize + 2, cellSize - 4, cellSize - 4);
        });
      }

      // Draw pieces
      competitors.forEach(piece => {
        const x = piece.position.x * cellSize + cellSize / 2;
        const y = piece.position.y * cellSize + cellSize / 2;
        drawPiece(piece, x, y, cellSize * 0.7);
      });

      // Draw battle animations during simulation
      if (isSimulating && Math.random() < 0.05) {
        const randomX = Math.random() * canvas.width;
        const randomY = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.arc(randomX, randomY, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 0, 60, 0.8)';
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [competitors, selectedPiece, isSimulating]);

  const getValidMoves = (piece) => {
    const moves = [];
    // Simplified move generation
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        if (dx === 0 && dy === 0) continue;
        const newX = piece.position.x + dx;
        const newY = piece.position.y + dy;
        if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
          moves.push({ x: newX, y: newY });
        }
      }
    }
    return moves;
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (canvas.width / 8) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) / (canvas.height / 8) * (canvas.height / rect.height));

    // Check if clicked on a piece
    const clickedPiece = competitors.find(p => p.position.x === x && p.position.y === y);
    if (clickedPiece) {
      setSelectedPiece(selectedPiece?.id === clickedPiece.id ? null : clickedPiece);
    } else if (selectedPiece) {
      // Move selected piece
      setCompetitors(prev => prev.map(p => 
        p.id === selectedPiece.id 
          ? { ...p, position: { x, y } }
          : p
      ));
      setMoveHistory(prev => [...prev, { piece: selectedPiece.name, from: selectedPiece.position, to: { x, y } }]);
      setSelectedPiece(null);
    }
  };

  const runSimulation = () => {
    setIsSimulating(true);
    let turn = 0;
    
    const simulateTurn = () => {
      if (turn >= 10) {
        setIsSimulating(false);
        return;
      }
      
      // Simulate random strategic moves
      setCompetitors(prev => prev.map(p => ({
        ...p,
        strength: Math.max(0, Math.min(100, p.strength + (Math.random() - 0.5) * 10)),
        position: {
          x: Math.max(0, Math.min(7, p.position.x + Math.floor(Math.random() * 3) - 1)),
          y: Math.max(0, Math.min(7, p.position.y + Math.floor(Math.random() * 3) - 1))
        }
      })));

      setStrategicScore(prev => ({
        marketPosition: Math.max(0, Math.min(100, prev.marketPosition + (Math.random() - 0.4) * 5)),
        competitiveAdvantage: Math.max(0, Math.min(100, prev.competitiveAdvantage + (Math.random() - 0.45) * 5)),
        riskExposure: Math.max(0, Math.min(100, prev.riskExposure + (Math.random() - 0.5) * 8)),
        winProbability: Math.max(0, Math.min(1, prev.winProbability + (Math.random() - 0.45) * 0.05))
      }));

      turn++;
      setSimulationTurn(turn);
      setTimeout(simulateTurn, 500);
    };

    simulateTurn();
  };

  return (
    <div data-testid="chess-bi" className="nexus-widget">
      <div className="widget-header mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-slate-500/20 to-pink-500/20 border border-white/10">
            <Crown size={18} className="text-white/60" />
          </div>
          <div>
            <h3 className="widget-title">Strategic Chess • Game Theory</h3>
            <p className="text-xs font-mono text-white/40">Competitive simulation engine • QEMASI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className={`p-2 rounded-lg transition-all ${
              isSimulating ? 'bg-yellow-500/20 text-yellow-400' : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
            } border border-current`}
          >
            {isSimulating ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={() => {
              setCompetitors(COMPETITORS);
              setSimulationTurn(0);
            }}
            className="p-2 rounded-lg bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Strategic Metrics */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Market Position</p>
          <p className="text-xl font-mono font-bold text-cyan-400">{strategicScore.marketPosition.toFixed(0)}%</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Advantage</p>
          <p className="text-xl font-mono font-bold text-green-400">{strategicScore.competitiveAdvantage.toFixed(0)}%</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Risk</p>
          <p className={`text-xl font-mono font-bold ${strategicScore.riskExposure > 50 ? 'text-red-400' : 'text-yellow-400'}`}>
            {strategicScore.riskExposure.toFixed(0)}%
          </p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Win Prob</p>
          <p className="text-xl font-mono font-bold text-white/60">{(strategicScore.winProbability * 100).toFixed(0)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Chess Board */}
        <div className="col-span-2 relative rounded-lg overflow-hidden border border-white/10">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            onClick={handleCanvasClick}
            className="cursor-pointer w-full"
          />
          {isSimulating && (
            <div className="absolute top-2 right-2 px-2 py-1 rounded bg-yellow-500/20 backdrop-blur-sm text-xs font-mono text-yellow-400 flex items-center gap-2">
              <Loader size={12} className="animate-spin" /> Turn {simulationTurn}/10
            </div>
          )}
        </div>

        {/* Competitors List */}
        <div className="space-y-2">
          <p className="text-xs font-mono text-white/50 uppercase mb-2">Market Players</p>
          {competitors.map(comp => (
            <div
              key={comp.id}
              onClick={() => setSelectedPiece(comp)}
              className={`p-2 rounded-lg cursor-pointer transition-all ${
                selectedPiece?.id === comp.id
                  ? 'bg-white/10 border border-cyan-500/50'
                  : 'bg-black/30 border border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: comp.color }} />
                  <span className="text-xs font-mono text-white/80">{comp.name}</span>
                </div>
                <span className={`text-xs font-mono ${comp.strength > 80 ? 'text-green-400' : comp.strength > 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {comp.strength}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Moves */}
      <div className="mt-4">
        <p className="text-xs font-mono text-white/50 uppercase mb-2">Recommended Moves</p>
        <div className="grid grid-cols-5 gap-2">
          {STRATEGIC_MOVES.map(move => (
            <div
              key={move.id}
              className={`p-2 rounded-lg bg-black/30 border ${
                move.type === 'offensive' ? 'border-red-500/20' : 'border-green-500/20'
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                {move.type === 'offensive' ? (
                  <Swords size={10} className="text-red-400" />
                ) : (
                  <Shield size={10} className="text-green-400" />
                )}
                <span className="text-xs font-mono text-white/80 truncate">{move.name}</span>
              </div>
              <p className="text-xs text-white/40">{move.impact}</p>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-xs ${move.risk === 'High' ? 'text-red-400' : move.risk === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                  {move.risk}
                </span>
                <span className="text-xs text-cyan-400">{(move.probability * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChessBI;
