import React, { useEffect } from 'react';
import { AlertTriangle, TrendingDown, MapPin, Shield, ExternalLink } from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';
import { Progress } from '../components/ui/progress';
import cyberSound from '../utils/CyberSoundEngine';

const SEVERITY_CONFIG = {
  high: {
    color: '#FF003C',
    bgColor: 'rgba(255, 0, 60, 0.1)',
    borderColor: 'rgba(255, 0, 60, 0.3)',
    label: 'HIGH',
    icon: AlertTriangle
  },
  medium: {
    color: '#FFB800',
    bgColor: 'rgba(255, 184, 0, 0.1)',
    borderColor: 'rgba(255, 184, 0, 0.3)',
    label: 'MEDIUM',
    icon: TrendingDown
  },
  low: {
    color: '#00FF41',
    bgColor: 'rgba(0, 255, 65, 0.1)',
    borderColor: 'rgba(0, 255, 65, 0.3)',
    label: 'LOW',
    icon: Shield
  }
};

const RiskAlertCard = ({ alert }) => {
  const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.low;
  const Icon = config.icon;

  return (
    <div 
      data-testid={`risk-alert-${alert.id}`}
      className="p-4 rounded-lg border transition-all hover:border-opacity-60"
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor
      }}
    >
      <div className="flex items-start gap-3">
        <div 
          className="p-2 rounded-lg flex-shrink-0"
          style={{ 
            backgroundColor: `${config.color}20`,
            border: `1px solid ${config.borderColor}`
          }}
        >
          <Icon size={16} style={{ color: config.color }} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span 
              className="risk-badge text-[10px]"
              style={{
                backgroundColor: config.bgColor,
                color: config.color,
                border: `1px solid ${config.borderColor}`
              }}
            >
              {config.label} RISK
            </span>
            <span className="font-mono text-xs text-white/40">
              {(alert.probability * 100).toFixed(0)}% probability
            </span>
          </div>
          
          <h4 className="font-heading text-sm font-semibold text-white mb-1">
            {alert.supplier}
          </h4>
          
          <p className="text-xs text-white/70 leading-relaxed mb-3">
            {alert.issue}
          </p>
          
          {/* Probability bar */}
          <div className="mb-3">
            <Progress 
              value={alert.probability * 100} 
              className="h-1"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            />
          </div>
          
          {alert.recommendation && (
            <div className="flex items-start gap-2 p-2 rounded bg-black/30">
              <MapPin size={12} className="text-cyan-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-white/60">
                <span className="text-cyan-400 font-medium">Recommendation: </span>
                {alert.recommendation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RiskAlerts = ({ alerts }) => {
  // Play warning sound when high severity alerts appear
  useEffect(() => {
    if (alerts && alerts.length > 0) {
      const highCount = alerts.filter(a => a.severity === 'high').length;
      if (highCount > 0) {
        cyberSound.init();
        cyberSound.playCritical();
      } else {
        cyberSound.init();
        cyberSound.playWarning();
      }
    }
  }, [alerts]);

  if (!alerts || alerts.length === 0) {
    return (
      <div 
        data-testid="risk-alerts-empty"
        className="nexus-widget flex items-center justify-center h-48"
      >
        <div className="text-center">
          <Shield size={32} className="mx-auto mb-3 text-green-500/50" />
          <p className="font-mono text-sm text-white/40">No active risk alerts</p>
          <p className="font-mono text-xs text-white/30 mt-1">Supply chain operating normally</p>
        </div>
      </div>
    );
  }

  const highCount = alerts.filter(a => a.severity === 'high').length;
  const mediumCount = alerts.filter(a => a.severity === 'medium').length;
  const lowCount = alerts.filter(a => a.severity === 'low').length;

  return (
    <div data-testid="risk-alerts" className="nexus-widget">
      <div className="widget-header">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div>
            <h3 className="widget-title">Risk Intelligence</h3>
            <p className="text-xs font-mono text-white/40">Real-time threat monitoring</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {highCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-xs text-red-400">{highCount}</span>
            </div>
          )}
          {mediumCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="font-mono text-xs text-yellow-400">{mediumCount}</span>
            </div>
          )}
          {lowCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="font-mono text-xs text-green-400">{lowCount}</span>
            </div>
          )}
        </div>
      </div>

      <ScrollArea className="h-80 mt-4">
        <div className="space-y-3 pr-4">
          {alerts
            .sort((a, b) => {
              const severityOrder = { high: 0, medium: 1, low: 2 };
              return severityOrder[a.severity] - severityOrder[b.severity];
            })
            .map((alert) => (
              <RiskAlertCard key={alert.id} alert={alert} />
            ))}
        </div>
      </ScrollArea>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="font-mono text-xs text-white/40">Risk Sentinel Active</span>
        </div>
        <button className="cyber-btn px-4 py-2 text-xs flex items-center gap-2">
          <ExternalLink size={12} />
          Full Risk Report
        </button>
      </div>
    </div>
  );
};

export default RiskAlerts;
