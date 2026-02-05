import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Clock, Play, Pause, SkipBack, SkipForward, ChevronDown, ChevronUp, Filter, Download, Brain, Zap, TrendingUp, AlertTriangle, Users, RotateCcw } from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';

// Simulated decision timeline data
const DECISION_TIMELINE = [
  {
    id: 'dec-001',
    timestamp: '2026-01-28T09:15:00Z',
    agent: 'demand',
    agentName: 'DEMAND FORECASTER',
    decision: 'Increased Q2 forecast by 15%',
    confidence: 0.94,
    trigger: 'Social sentiment shift detected + competitor stockout signals',
    impact: { revenue: '+$1.2M', inventory: '+8,000 units' },
    reasoning: [
      'Historical pattern match: 2024 Q2 growth trajectory',
      'Social media sentiment: +23% positive mentions',
      'Competitor inventory: 3 major competitors showing stockout risk'
    ],
    stakeholders: ['VP Supply Chain', 'Demand Planning'],
    status: 'executed'
  },
  {
    id: 'dec-002',
    timestamp: '2026-01-28T09:32:00Z',
    agent: 'risk',
    agentName: 'RISK SENTINEL',
    decision: 'Flagged ChemCorp Ltd as HIGH RISK',
    confidence: 0.89,
    trigger: 'Financial indicators deteriorated below threshold',
    impact: { risk: 'Prevented $4.2M exposure', suppliers: '1 critical' },
    reasoning: [
      'Altman Z-score dropped to 1.2 (distress zone)',
      'Days payable outstanding increased 40%',
      'Key management departures: CFO, COO'
    ],
    stakeholders: ['CFO', 'Procurement Director'],
    status: 'executed'
  },
  {
    id: 'dec-003',
    timestamp: '2026-01-28T10:05:00Z',
    agent: 'procurement',
    agentName: 'PROCUREMENT OPTIMIZER',
    decision: 'Initiated backup contract with GreenMfg',
    confidence: 0.91,
    trigger: 'Risk Sentinel alert on ChemCorp + demand forecast increase',
    impact: { cost: '+$180K', otif: '98.5% maintained' },
    reasoning: [
      'GreenMfg OTIF: 98.5% (vs ChemCorp 94.2%)',
      'Lead time: 12 days (vs ChemCorp 21 days)',
      'Risk score: 0.15 (vs ChemCorp 0.72)'
    ],
    stakeholders: ['Procurement Director', 'Supplier Quality'],
    status: 'executed'
  },
  {
    id: 'dec-004',
    timestamp: '2026-01-28T10:47:00Z',
    agent: 'logistics',
    agentName: 'LOGISTICS ROUTER',
    decision: 'Quantum-optimized 200 routes across 5 DCs',
    confidence: 0.97,
    trigger: 'Daily route optimization cycle + demand forecast update',
    impact: { fuel: '-18.5%', carbon: '-22 tons/week', time: '4.2 min vs 24h' },
    reasoning: [
      'QAOA solver achieved global optimum',
      'All delivery windows satisfied with 2hr buffer',
      'Route efficiency: 94.3% (up from 82.1%)'
    ],
    stakeholders: ['Logistics Manager', 'Sustainability Officer'],
    status: 'executed'
  },
  {
    id: 'dec-005',
    timestamp: '2026-01-28T11:23:00Z',
    agent: 'orchestrator',
    agentName: 'ATLAS ORCHESTRATOR',
    decision: 'Resolved conflict: Cost vs Diversification',
    confidence: 0.96,
    trigger: 'Procurement requested cost-optimized sourcing, Risk demanded diversification',
    impact: { resolution: 'Pareto-optimal', time: '2.3 min' },
    reasoning: [
      'Identified 3 Pareto-optimal solutions',
      'Selected: Mexico 30% + Taiwan 70% (balanced risk/cost)',
      'All agents reached consensus in 2.3 minutes'
    ],
    stakeholders: ['CEO', 'CFO', 'COO'],
    status: 'executed'
  },
  {
    id: 'dec-006',
    timestamp: '2026-01-28T13:15:00Z',
    agent: 'demand',
    agentName: 'DEMAND FORECASTER',
    decision: 'Detected anomaly: Smartphone component demand spike',
    confidence: 0.88,
    trigger: 'Real-time POS data from 3 major retailers',
    impact: { units: '+12,000 units/week', revenue: '+$2.4M' },
    reasoning: [
      'POS velocity: 34% above forecast',
      'Social media: New product launch competitor',
      'Weather: Favorable outdoor activity forecast'
    ],
    stakeholders: ['Sales Director', 'Product Manager'],
    status: 'pending_review'
  },
  {
    id: 'dec-007',
    timestamp: '2026-01-28T14:02:00Z',
    agent: 'risk',
    agentName: 'RISK SENTINEL',
    decision: 'Geopolitical alert: Taiwan supplier exposure',
    confidence: 0.72,
    trigger: 'Chainlink oracle: Cross-strait tension indicators elevated',
    impact: { exposure: '$2.8M', probability: '45%' },
    reasoning: [
      'CCIP verified geopolitical risk score: 0.45',
      'Shipping lane disruption probability: 23%',
      'Alternative supplier lead time: +8 days'
    ],
    stakeholders: ['Risk Committee', 'Board'],
    status: 'monitoring'
  }
];

const AGENT_COLORS = {
  demand: '#00F0FF',
  procurement: '#64748B',
  logistics: '#00FF41',
  risk: '#FFB800',
  orchestrator: '#00F0FF'
};

const AGENT_ICONS = {
  demand: TrendingUp,
  procurement: Users,
  logistics: Zap,
  risk: AlertTriangle,
  orchestrator: Brain
};

const STATUS_CONFIG = {
  executed: { color: '#00FF41', label: 'EXECUTED' },
  pending_review: { color: '#FFB800', label: 'PENDING REVIEW' },
  monitoring: { color: '#00F0FF', label: 'MONITORING' },
  rejected: { color: '#FF003C', label: 'REJECTED' }
};

const DecisionCard = ({ decision, isExpanded, onToggle, isPlaying }) => {
  const Icon = AGENT_ICONS[decision.agent] || Brain;
  const color = AGENT_COLORS[decision.agent] || '#00F0FF';
  const status = STATUS_CONFIG[decision.status] || STATUS_CONFIG.executed;
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      data-testid={`decision-${decision.id}`}
      className={`rounded-lg border transition-all ${
        isPlaying ? 'border-cyan-500/50 bg-cyan-500/5 shadow-[0_0_20px_rgba(0,240,255,0.15)]' : 'border-white/10 bg-black/30'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start gap-4">
          {/* Timeline marker */}
          <div className="flex flex-col items-center">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${color}20`, border: `2px solid ${color}` }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <div className="w-0.5 h-full bg-white/10 mt-2" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs" style={{ color }}>{decision.agentName}</span>
                <span 
                  className="px-2 py-0.5 rounded text-[10px] font-mono uppercase"
                  style={{ backgroundColor: `${status.color}15`, color: status.color }}
                >
                  {status.label}
                </span>
              </div>
              <span className="font-mono text-xs text-white/40">{formatTime(decision.timestamp)}</span>
            </div>
            
            <h4 className="font-heading text-base font-semibold text-white mb-2">
              {decision.decision}
            </h4>
            
            <p className="text-xs text-white/50 mb-2">
              Trigger: {decision.trigger}
            </p>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-xs text-white/40">Confidence:</span>
                <span className="font-mono text-xs" style={{ color }}>
                  {(decision.confidence * 100).toFixed(0)}%
                </span>
              </div>
              {isExpanded ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
            </div>
          </div>
        </div>
      </button>
      
      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 ml-14 border-t border-white/5 pt-4 space-y-4">
          {/* Impact */}
          <div>
            <p className="text-xs font-mono text-white/40 uppercase mb-2">Impact</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(decision.impact).map(([key, value]) => (
                <span key={key} className="px-3 py-1 rounded bg-white/5 text-xs">
                  <span className="text-white/50 capitalize">{key}: </span>
                  <span className="font-mono text-white">{value}</span>
                </span>
              ))}
            </div>
          </div>
          
          {/* Reasoning */}
          <div>
            <p className="text-xs font-mono text-white/40 uppercase mb-2">AI Reasoning</p>
            <ul className="space-y-1">
              {decision.reasoning.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-white/70">
                  <span style={{ color }} className="mt-1">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Stakeholders */}
          <div>
            <p className="text-xs font-mono text-white/40 uppercase mb-2">Stakeholders Notified</p>
            <div className="flex flex-wrap gap-2">
              {decision.stakeholders.map((s, idx) => (
                <span key={idx} className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-400">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DecisionTimeline = () => {
  const [expandedId, setExpandedId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterAgent, setFilterAgent] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const intervalRef = useRef(null);

  const filteredDecisions = useMemo(() => {
    if (!filterAgent) return DECISION_TIMELINE;
    return DECISION_TIMELINE.filter(d => d.agent === filterAgent);
  }, [filterAgent]);

  // Playback controls
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= filteredDecisions.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000 / playbackSpeed);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, playbackSpeed, filteredDecisions.length]);

  const togglePlay = () => {
    if (currentIndex >= filteredDecisions.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const skipToStart = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const skipToEnd = () => {
    setCurrentIndex(filteredDecisions.length - 1);
    setIsPlaying(false);
  };

  // Stats
  const totalDecisions = DECISION_TIMELINE.length;
  const executedCount = DECISION_TIMELINE.filter(d => d.status === 'executed').length;
  const avgConfidence = (DECISION_TIMELINE.reduce((sum, d) => sum + d.confidence, 0) / totalDecisions * 100).toFixed(1);

  // Export to PDF/CSV functionality
  const exportReport = (format = 'pdf') => {
    const data = filteredDecisions.map(d => ({
      timestamp: new Date(d.timestamp).toLocaleString(),
      agent: d.agentName,
      decision: d.decision,
      confidence: `${(d.confidence * 100).toFixed(0)}%`,
      trigger: d.trigger,
      impact: Object.entries(d.impact).map(([k, v]) => `${k}: ${v}`).join(', '),
      status: d.status,
      stakeholders: d.stakeholders.join(', ')
    }));

    if (format === 'csv') {
      // CSV Export
      const headers = ['Timestamp', 'Agent', 'Decision', 'Confidence', 'Trigger', 'Impact', 'Status', 'Stakeholders'];
      const csvContent = [
        headers.join(','),
        ...data.map(row => [
          `"${row.timestamp}"`,
          `"${row.agent}"`,
          `"${row.decision}"`,
          row.confidence,
          `"${row.trigger}"`,
          `"${row.impact}"`,
          row.status,
          `"${row.stakeholders}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `nexus-decisions-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } else {
      // PDF Export - generate HTML and print
      const reportHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>ATLAS Decision Audit Report</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { color: #0891b2; margin: 0; }
            .header p { color: #666; }
            .stats { display: flex; justify-content: space-around; margin-bottom: 30px; }
            .stat { text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #0891b2; }
            .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { background: #0891b2; color: white; padding: 12px 8px; text-align: left; }
            td { padding: 10px 8px; border-bottom: 1px solid #eee; }
            tr:nth-child(even) { background: #f9f9f9; }
            .status-executed { color: #22c55e; font-weight: bold; }
            .status-pending_review { color: #f59e0b; font-weight: bold; }
            .status-monitoring { color: #0891b2; font-weight: bold; }
            .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #999; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ATLAS Supply Chain OS</h1>
            <p>Decision Audit Report • Generated ${new Date().toLocaleString()}</p>
          </div>
          <div class="stats">
            <div class="stat"><div class="stat-value">${totalDecisions}</div><div class="stat-label">Total Decisions</div></div>
            <div class="stat"><div class="stat-value">${executedCount}</div><div class="stat-label">Executed</div></div>
            <div class="stat"><div class="stat-value">${avgConfidence}%</div><div class="stat-label">Avg Confidence</div></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Agent</th>
                <th>Decision</th>
                <th>Confidence</th>
                <th>Status</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  <td>${row.timestamp}</td>
                  <td>${row.agent}</td>
                  <td>${row.decision}</td>
                  <td>${row.confidence}</td>
                  <td class="status-${row.status.toLowerCase().replace(' ', '_')}">${row.status.toUpperCase()}</td>
                  <td>${row.impact}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            ATLAS Supply Chain Operating System • Confidential Audit Report<br/>
            Powered by Quantum-AI Hybrid Technology
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(reportHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  return (
    <div data-testid="decision-timeline" className="nexus-widget">
      <div className="widget-header mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/30">
            <Clock size={18} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="widget-title">Decision Timeline</h3>
            <p className="text-xs font-mono text-white/40">Chronological agent audit trail</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => exportReport('csv')}
            className="px-3 py-1.5 text-xs rounded bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 flex items-center gap-2"
          >
            <Download size={12} /> CSV
          </button>
          <button 
            onClick={() => exportReport('pdf')}
            className="cyber-btn px-4 py-2 text-xs flex items-center gap-2"
          >
            <Download size={14} /> PDF Report
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Total Decisions</p>
          <p className="text-xl font-mono font-bold text-cyan-400">{totalDecisions}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Executed</p>
          <p className="text-xl font-mono font-bold text-green-400">{executedCount}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Avg Confidence</p>
          <p className="text-xl font-mono font-bold text-white/60">{avgConfidence}%</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Time Range</p>
          <p className="text-xl font-mono font-bold text-white">5h 47m</p>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/10 mb-4">
        <div className="flex items-center gap-2">
          <button onClick={skipToStart} className="p-2 rounded bg-white/5 hover:bg-white/10 transition-colors">
            <SkipBack size={16} className="text-white/60" />
          </button>
          <button 
            onClick={togglePlay}
            className="p-3 rounded-full bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/30 transition-colors"
          >
            {isPlaying ? <Pause size={18} className="text-cyan-400" /> : <Play size={18} className="text-cyan-400" />}
          </button>
          <button onClick={skipToEnd} className="p-2 rounded bg-white/5 hover:bg-white/10 transition-colors">
            <SkipForward size={16} className="text-white/60" />
          </button>
          <button onClick={skipToStart} className="p-2 rounded bg-white/5 hover:bg-white/10 transition-colors ml-2">
            <RotateCcw size={16} className="text-white/60" />
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Speed selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Speed:</span>
            {[0.5, 1, 2].map(speed => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-1 rounded text-xs font-mono ${
                  playbackSpeed === speed 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                    : 'bg-white/5 text-white/40'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
          
          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-white/40" />
            <select 
              value={filterAgent || ''}
              onChange={(e) => setFilterAgent(e.target.value || null)}
              className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white"
            >
              <option value="">All Agents</option>
              <option value="demand">Demand</option>
              <option value="procurement">Procurement</option>
              <option value="logistics">Logistics</option>
              <option value="risk">Risk</option>
              <option value="orchestrator">Orchestrator</option>
            </select>
          </div>
        </div>
        
        <div className="text-xs font-mono text-white/40">
          {currentIndex + 1} / {filteredDecisions.length} decisions
        </div>
      </div>

      {/* Timeline */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-3 pr-4">
          {filteredDecisions.map((decision, idx) => (
            <DecisionCard
              key={decision.id}
              decision={decision}
              isExpanded={expandedId === decision.id}
              onToggle={() => setExpandedId(expandedId === decision.id ? null : decision.id)}
              isPlaying={isPlaying && idx === currentIndex}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DecisionTimeline;
