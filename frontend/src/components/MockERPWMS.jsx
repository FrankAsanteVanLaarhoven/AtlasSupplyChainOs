import React, { useState, useEffect, useRef } from 'react';
import { Database, Package, Truck, AlertTriangle, TrendingUp, TrendingDown, RefreshCw, Activity, Boxes, ShoppingCart, Clock } from 'lucide-react';

// Mock ERP/WMS real-time data generator
const generateInventoryItem = () => {
  const products = [
    { sku: 'ELEC-001', name: 'Microprocessor X7', category: 'Electronics' },
    { sku: 'ELEC-002', name: 'Memory Module 32GB', category: 'Electronics' },
    { sku: 'CHEM-001', name: 'Industrial Solvent A', category: 'Chemicals' },
    { sku: 'CHEM-002', name: 'Polymer Resin B', category: 'Chemicals' },
    { sku: 'MECH-001', name: 'Precision Bearing', category: 'Mechanical' },
    { sku: 'MECH-002', name: 'Hydraulic Pump', category: 'Mechanical' },
    { sku: 'PACK-001', name: 'Shipping Container', category: 'Packaging' },
    { sku: 'RAW-001', name: 'Steel Sheet 3mm', category: 'Raw Materials' }
  ];
  
  const product = products[Math.floor(Math.random() * products.length)];
  const maxStock = Math.floor(Math.random() * 5000) + 1000;
  const currentStock = Math.floor(Math.random() * maxStock);
  const reorderPoint = Math.floor(maxStock * 0.2);
  
  return {
    ...product,
    currentStock,
    maxStock,
    reorderPoint,
    status: currentStock < reorderPoint ? 'low' : currentStock > maxStock * 0.8 ? 'high' : 'normal',
    lastUpdated: new Date().toISOString(),
    trend: Math.random() > 0.5 ? 'up' : 'down',
    change: Math.floor(Math.random() * 100)
  };
};

const generateOrder = () => {
  const statuses = ['pending', 'processing', 'shipped', 'delivered'];
  const customers = ['Acme Corp', 'TechGiant Inc', 'GlobalTrade Ltd', 'MegaRetail', 'DistributionCo'];
  const warehouses = ['DC-West', 'DC-East', 'DC-Central', 'DC-South'];
  
  return {
    id: `ORD-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    customer: customers[Math.floor(Math.random() * customers.length)],
    warehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
    items: Math.floor(Math.random() * 20) + 1,
    value: (Math.random() * 50000 + 1000).toFixed(2),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    priority: Math.random() > 0.8 ? 'urgent' : Math.random() > 0.5 ? 'high' : 'normal',
    timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString()
  };
};

const generateShipment = () => {
  const carriers = ['FastFreight', 'GlobalShip', 'QuickLogistics', 'ExpressLine'];
  const origins = ['Shanghai', 'Los Angeles', 'Rotterdam', 'Singapore'];
  const destinations = ['Chicago DC', 'NYC Warehouse', 'Miami Hub', 'Dallas Center'];
  
  return {
    id: `SHP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    carrier: carriers[Math.floor(Math.random() * carriers.length)],
    origin: origins[Math.floor(Math.random() * origins.length)],
    destination: destinations[Math.floor(Math.random() * destinations.length)],
    eta: new Date(Date.now() + Math.random() * 7 * 24 * 3600000).toISOString(),
    progress: Math.floor(Math.random() * 100),
    containers: Math.floor(Math.random() * 10) + 1,
    status: Math.random() > 0.9 ? 'delayed' : Math.random() > 0.3 ? 'in-transit' : 'arrived'
  };
};

const MockERPWMS = () => {
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    inTransit: 0,
    lowStock: 0
  });
  const [isConnected, setIsConnected] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());
  const wsRef = useRef(null);

  // Initialize with mock data
  useEffect(() => {
    setInventory(Array(8).fill(null).map(generateInventoryItem));
    setOrders(Array(6).fill(null).map(generateOrder));
    setShipments(Array(4).fill(null).map(generateShipment));
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update inventory
      setInventory(prev => {
        const updated = [...prev];
        const randomIdx = Math.floor(Math.random() * updated.length);
        const change = Math.floor(Math.random() * 200) - 100;
        updated[randomIdx] = {
          ...updated[randomIdx],
          currentStock: Math.max(0, updated[randomIdx].currentStock + change),
          trend: change > 0 ? 'up' : 'down',
          change: Math.abs(change),
          lastUpdated: new Date().toISOString()
        };
        updated[randomIdx].status = updated[randomIdx].currentStock < updated[randomIdx].reorderPoint ? 'low' : 'normal';
        return updated;
      });

      // Occasionally add new order
      if (Math.random() > 0.7) {
        setOrders(prev => [generateOrder(), ...prev.slice(0, 7)]);
      }

      // Update shipments
      setShipments(prev => prev.map(s => ({
        ...s,
        progress: Math.min(100, s.progress + Math.floor(Math.random() * 5))
      })));

      // Update metrics
      setMetrics({
        totalOrders: Math.floor(Math.random() * 500) + 1000,
        pendingOrders: Math.floor(Math.random() * 50) + 10,
        inTransit: Math.floor(Math.random() * 100) + 50,
        lowStock: Math.floor(Math.random() * 10) + 2
      });

      setLastSync(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'low': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-green-400 bg-green-500/20';
      case 'urgent': return 'text-red-400';
      case 'delayed': return 'text-yellow-400';
      case 'arrived': return 'text-green-400';
      default: return 'text-cyan-400';
    }
  };

  return (
    <div data-testid="erp-wms" className="nexus-widget">
      <div className="widget-header mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
            <Database size={18} className="text-green-400" />
          </div>
          <div>
            <h3 className="widget-title">ERP/WMS Live Feed</h3>
            <p className="text-xs font-mono text-white/40">Mock Enterprise Data Stream</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-mono ${
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </div>
          <span className="text-xs font-mono text-white/40">
            Last sync: {formatTime(lastSync)}
          </span>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart size={14} className="text-cyan-400" />
            <span className="text-xs font-mono text-white/40">TOTAL ORDERS</span>
          </div>
          <p className="text-xl font-mono font-bold text-cyan-400">{metrics.totalOrders.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-yellow-400" />
            <span className="text-xs font-mono text-white/40">PENDING</span>
          </div>
          <p className="text-xl font-mono font-bold text-yellow-400">{metrics.pendingOrders}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Truck size={14} className="text-green-400" />
            <span className="text-xs font-mono text-white/40">IN TRANSIT</span>
          </div>
          <p className="text-xl font-mono font-bold text-green-400">{metrics.inTransit}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-red-400" />
            <span className="text-xs font-mono text-white/40">LOW STOCK</span>
          </div>
          <p className="text-xl font-mono font-bold text-red-400">{metrics.lowStock}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Inventory Panel */}
        <div className="p-4 rounded-lg bg-black/30 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Boxes size={14} className="text-cyan-400" />
              <span className="text-xs font-mono text-white/60 uppercase">Live Inventory</span>
            </div>
            <RefreshCw size={12} className="text-cyan-400 animate-spin" />
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {inventory.map((item, idx) => (
              <div 
                key={idx}
                className={`p-2 rounded bg-black/30 border border-white/5 flex items-center justify-between ${
                  item.status === 'low' ? 'border-red-500/30' : ''
                }`}
              >
                <div>
                  <p className="text-xs font-mono text-white/80">{item.sku}</p>
                  <p className="text-[10px] text-white/40">{item.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  {item.trend === 'up' ? (
                    <TrendingUp size={12} className="text-green-400" />
                  ) : (
                    <TrendingDown size={12} className="text-red-400" />
                  )}
                  <span className={`text-xs font-mono ${getStatusColor(item.status)}`}>
                    {item.currentStock.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Panel */}
        <div className="p-4 rounded-lg bg-black/30 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart size={14} className="text-green-400" />
              <span className="text-xs font-mono text-white/60 uppercase">Recent Orders</span>
            </div>
            <Activity size={12} className="text-green-400" />
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {orders.map((order, idx) => (
              <div 
                key={idx}
                className={`p-2 rounded bg-black/30 border border-white/5 ${
                  order.priority === 'urgent' ? 'border-red-500/30' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-white/80">{order.id}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                    order.status === 'shipped' ? 'bg-cyan-500/20 text-cyan-400' :
                    order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-white/10 text-white/60'
                  }`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40">{order.customer}</span>
                  <span className="text-xs font-mono text-green-400">${Number(order.value).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shipments */}
      <div className="mt-4 p-4 rounded-lg bg-black/30 border border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <Truck size={14} className="text-cyan-400" />
          <span className="text-xs font-mono text-white/60 uppercase">Active Shipments</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {shipments.map((shipment, idx) => (
            <div key={idx} className="p-2 rounded bg-black/20 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-white/80">{shipment.id}</span>
                <span className={`text-[10px] font-mono ${
                  shipment.status === 'delayed' ? 'text-yellow-400' :
                  shipment.status === 'arrived' ? 'text-green-400' : 'text-cyan-400'
                }`}>
                  {shipment.status.toUpperCase()}
                </span>
              </div>
              <div className="text-[10px] text-white/40 mb-2">
                {shipment.origin} → {shipment.destination}
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    shipment.status === 'delayed' ? 'bg-yellow-400' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${shipment.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MockERPWMS;
