import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, AlertTriangle, Building2, Truck, Cpu, Factory, ShoppingCart, Pickaxe, FlaskConical, Brain, Bot, Car, Zap } from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';

const SECTOR_ICONS = {
  'Logistics': Truck,
  'Semiconductors': Cpu,
  'Manufacturing': Factory,
  'Retail': ShoppingCart,
  'Mining': Pickaxe,
  'Chemicals': FlaskConical,
  'AI': Brain,
  'Robotics': Bot,
  'Autonomous': Car,
  'Energy': Zap,
};

const SECTOR_COLORS = {
  'Logistics': 'cyan',
  'Semiconductors': 'purple',
  'Manufacturing': 'yellow',
  'Retail': 'green',
  'Mining': 'orange',
  'Chemicals': 'pink',
  'AI': 'blue',
  'Robotics': 'indigo',
  'Autonomous': 'red',
  'Energy': 'amber',
};

const MarketDataDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedSector, setSelectedSector] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${API_URL}/api/market/dashboard`);
      const result = await response.json();
      setData(result);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="nexus-widget animate-pulse">
        <div className="h-8 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-white/5 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const sectors = data?.sector_performance || {};
  const alerts = data?.risk_alerts || [];
  const quotes = data?.quotes || {};

  return (
    <div data-testid="market-dashboard" className="nexus-widget">
      {/* Header */}
      <div className="widget-header mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
            <TrendingUp size={18} className="text-green-400" />
          </div>
          <div>
            <h3 className="widget-title">Real-Time Market Intelligence</h3>
            <p className="text-xs font-mono text-white/40">
              Live Fortune 500 Supply Chain Data • Yahoo Finance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-white/40">
            Updated: {lastUpdate}
          </span>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="cyber-btn px-3 py-1.5 text-xs flex items-center gap-2"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Sector Performance Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {Object.entries(sectors).map(([sector, data]) => {
          const Icon = SECTOR_ICONS[sector] || Building2;
          const color = SECTOR_COLORS[sector] || 'cyan';
          const isSelected = selectedSector === sector;
          const avgChange = data.avg_change || 0;
          const isPositive = avgChange >= 0;
          
          return (
            <button
              key={sector}
              onClick={() => setSelectedSector(isSelected ? null : sector)}
              className={`p-3 rounded-lg border transition-all text-left ${
                isSelected 
                  ? `bg-${color}-500/10 border-${color}-500/50` 
                  : 'bg-black/30 border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={isSelected ? `text-${color}-400` : 'text-white/50'} />
                <span className="text-xs font-mono text-white/70 truncate">{sector}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-lg font-mono font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{avgChange.toFixed(1)}%
                </span>
                {isPositive ? (
                  <TrendingUp size={14} className="text-green-400" />
                ) : (
                  <TrendingDown size={14} className="text-red-400" />
                )}
              </div>
              <p className="text-xs text-white/40 mt-1">{data.count} companies</p>
            </button>
          );
        })}
      </div>

      {/* Risk Alerts */}
      {alerts.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-heading font-semibold text-white/70 uppercase tracking-wide mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400" />
            Market Risk Alerts ({alerts.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {alerts.slice(0, 4).map((alert, idx) => (
              <div 
                key={alert.id || idx}
                className={`p-3 rounded-lg border ${
                  alert.severity === 'high' 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : 'bg-yellow-500/10 border-yellow-500/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono font-semibold text-white">
                        {alert.supplier}
                      </span>
                      <span className="text-xs font-mono text-white/40">
                        ({alert.symbol})
                      </span>
                    </div>
                    <p className="text-xs text-white/60">{alert.issue}</p>
                  </div>
                  <span className={`text-lg font-mono font-bold ${
                    alert.change_percent < 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {alert.change_percent > 0 ? '+' : ''}{alert.change_percent?.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs font-mono text-white/40">
                    ${alert.price?.toFixed(2)}
                  </span>
                  <span className="text-xs font-mono text-white/40">
                    {alert.sector} • Tier {alert.tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Sector Detail */}
      {selectedSector && sectors[selectedSector] && (
        <div className="p-4 rounded-lg bg-black/30 border border-white/10">
          <h4 className="text-sm font-heading font-semibold text-white/70 uppercase tracking-wide mb-3">
            {selectedSector} Companies
          </h4>
          <ScrollArea className="h-48">
            <div className="space-y-2 pr-4">
              {sectors[selectedSector].companies?.map((company) => {
                const quote = quotes[company.symbol] || {};
                return (
                  <div 
                    key={company.symbol}
                    className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-cyan-400 w-12">
                        {company.symbol}
                      </span>
                      <span className="text-sm text-white/80">
                        {company.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono text-white/60">
                        ${quote.price?.toFixed(2) || company.price?.toFixed(2) || '—'}
                      </span>
                      <span className={`text-sm font-mono font-semibold ${
                        (company.change_percent || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {company.change_percent >= 0 ? '+' : ''}{company.change_percent?.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Market Summary */}
      <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-cyan-500/5 to-transparent border border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs font-mono text-white/40">Companies</p>
              <p className="text-lg font-mono font-bold text-cyan-400">
                {data?.market_summary?.total_companies_tracked || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-mono text-white/40">Sectors</p>
              <p className="text-lg font-mono font-bold text-cyan-400">
                {data?.market_summary?.sectors_monitored?.length || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-mono text-white/40">Alerts</p>
              <p className="text-lg font-mono font-bold text-red-400">
                {data?.market_summary?.alerts_active || 0}
              </p>
            </div>
          </div>
          <p className="text-xs font-mono text-white/30">
            Data from Yahoo Finance • Updates every 60s
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketDataDashboard;
