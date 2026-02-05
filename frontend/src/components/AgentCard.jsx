import React from 'react';
import { Activity, TrendingUp, AlertTriangle, Zap, Brain } from 'lucide-react';
import { Progress } from '../components/ui/progress';

const AGENT_ICONS = {
  demand: TrendingUp,
  procurement: Activity,
  logistics: Zap,
  risk: AlertTriangle,
  orchestrator: Brain
};

const AGENT_COLORS = {
  demand: { primary: '#00F0FF', bg: 'rgba(0, 240, 255, 0.1)' },
  procurement: { primary: '#64748B', bg: 'rgba(100, 116, 139, 0.1)' },
  logistics: { primary: '#00FF41', bg: 'rgba(0, 255, 65, 0.1)' },
  risk: { primary: '#FFB800', bg: 'rgba(255, 184, 0, 0.1)' },
  orchestrator: { primary: '#00F0FF', bg: 'rgba(0, 240, 255, 0.1)' }
};

const STATUS_STYLES = {
  active: 'status-active',
  monitoring: 'status-monitoring',
  optimizing: 'status-optimizing',
  coordinating: 'status-monitoring',
  warning: 'status-warning',
  error: 'status-error'
};

const AgentCard = ({ agent, isExpanded = false, onClick }) => {
  const Icon = AGENT_ICONS[agent.type] || Brain;
  const colors = AGENT_COLORS[agent.type] || AGENT_COLORS.orchestrator;
  const statusClass = STATUS_STYLES[agent.status] || 'status-active';

  if (!isExpanded) {
    // Compact chip view
    return (
      <button
        data-testid={`agent-chip-${agent.type}`}
        onClick={onClick}
        className="agent-chip group"
        style={{ '--agent-color': colors.primary }}
      >
        <span 
          className="agent-chip-dot" 
          style={{ 
            backgroundColor: colors.primary,
            boxShadow: `0 0 8px ${colors.primary}`
          }}
        />
        <span className="text-white/70 group-hover:text-white transition-colors">
          {agent.name.split(' ')[0]}
        </span>
        <span className={statusClass} style={{ fontSize: '0.6rem' }}>
          {agent.status}
        </span>
      </button>
    );
  }

  // Expanded card view
  return (
    <div 
      data-testid={`agent-card-${agent.type}`}
      className="nexus-widget agent-card cursor-pointer"
      onClick={onClick}
      style={{
        borderColor: `${colors.primary}30`,
        background: `linear-gradient(135deg, ${colors.bg} 0%, rgba(0,0,0,0.4) 100%)`
      }}
    >
      <div className="agent-detail-card">
        <div className="flex items-start gap-4">
          <div 
            className="p-3 rounded-lg"
            style={{ 
              backgroundColor: colors.bg,
              border: `1px solid ${colors.primary}40`
            }}
          >
            <Icon 
              size={28} 
              style={{ color: colors.primary }}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 
                className="font-heading text-lg font-bold tracking-wide"
                style={{ color: colors.primary }}
              >
                {agent.name}
              </h3>
              <span className={`text-xs font-mono uppercase ${statusClass}`}>
                {agent.status}
              </span>
            </div>
            <p className="text-xs font-mono text-white/40 uppercase mt-1">
              {agent.metrics?.model || 'AI Model'}
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-sm text-white/80 leading-relaxed">
            {agent.last_action}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-xs font-mono text-white/40 uppercase mb-1">Decisions Today</p>
            <p className="text-2xl font-mono font-bold" style={{ color: colors.primary }}>
              {agent.decisions_today}
            </p>
          </div>
          <div>
            <p className="text-xs font-mono text-white/40 uppercase mb-1">Confidence</p>
            <p className="text-2xl font-mono font-bold text-white">
              {(agent.confidence * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="confidence-meter mt-4">
          <div className="confidence-label">
            <span>Confidence Level</span>
            <span>{(agent.confidence * 100).toFixed(1)}%</span>
          </div>
          <Progress 
            value={agent.confidence * 100} 
            className="h-1 bg-white/10"
          />
        </div>

        {agent.metrics && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs font-mono text-white/40 uppercase mb-2">Agent Metrics</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(agent.metrics).filter(([key]) => key !== 'model').map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-white/40 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="font-mono text-white/80">{typeof value === 'number' ? value.toLocaleString() : value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentCard;
