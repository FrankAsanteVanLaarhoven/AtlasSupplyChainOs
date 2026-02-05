import React from 'react';
import { TrendingUp, TrendingDown, Package, Truck, DollarSign, Users, AlertTriangle, Cpu } from 'lucide-react';

const METRIC_CONFIG = {
  total_shipments: {
    label: 'Total Shipments',
    icon: Package,
    format: (v) => v.toLocaleString(),
    unit: '',
    color: '#00F0FF'
  },
  on_time_delivery: {
    label: 'On-Time Delivery',
    icon: Truck,
    format: (v) => v.toFixed(1),
    unit: '%',
    color: '#00FF41'
  },
  cost_savings: {
    label: 'Cost Savings YTD',
    icon: DollarSign,
    format: (v) => `$${(v / 1000000).toFixed(2)}M`,
    unit: '',
    color: '#64748B'
  },
  active_suppliers: {
    label: 'Active Suppliers',
    icon: Users,
    format: (v) => v.toLocaleString(),
    unit: '',
    color: '#00F0FF'
  },
  risk_alerts: {
    label: 'Risk Alerts',
    icon: AlertTriangle,
    format: (v) => v.toString(),
    unit: '',
    color: '#FFB800'
  },
  quantum_optimizations: {
    label: 'Quantum Optimizations',
    icon: Cpu,
    format: (v) => v.toLocaleString(),
    unit: '',
    color: '#64748B'
  }
};

const MetricCard = ({ metricKey, value, previousValue }) => {
  const config = METRIC_CONFIG[metricKey];
  if (!config) return null;

  const Icon = config.icon;
  const change = previousValue ? ((value - previousValue) / previousValue * 100) : 0;
  const isPositive = change >= 0;

  return (
    <div 
      data-testid={`metric-${metricKey}`}
      className="nexus-widget p-4"
      style={{
        background: `linear-gradient(135deg, ${config.color}08 0%, rgba(0,0,0,0.4) 100%)`,
        borderColor: `${config.color}20`
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div 
          className="p-2 rounded-lg"
          style={{ 
            backgroundColor: `${config.color}15`,
            border: `1px solid ${config.color}30`
          }}
        >
          <Icon size={18} style={{ color: config.color }} />
        </div>
        {change !== 0 && (
          <div className={`metric-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
      
      <div className="metric-value text-2xl" style={{ color: config.color }}>
        {config.format(value)}
        {config.unit && <span className="metric-unit">{config.unit}</span>}
      </div>
      
      <p className="text-xs font-mono text-white/40 uppercase tracking-wider mt-2">
        {config.label}
      </p>
    </div>
  );
};

const MetricsWidget = ({ metrics }) => {
  if (!metrics) return null;

  return (
    <div 
      data-testid="metrics-widget"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
    >
      {Object.entries(metrics).map(([key, value]) => (
        <MetricCard key={key} metricKey={key} value={value} />
      ))}
    </div>
  );
};

export default MetricsWidget;
