import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker } from 'react-leaflet';
import { Truck, Warehouse, Ship, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Sample logistics data - distribution centers and routes
const DISTRIBUTION_CENTERS = [
  { id: 'dc-1', name: 'LA Distribution Hub', lat: 34.0522, lng: -118.2437, type: 'hub', capacity: 50000, utilization: 78 },
  { id: 'dc-2', name: 'Chicago Fulfillment', lat: 41.8781, lng: -87.6298, type: 'fulfillment', capacity: 35000, utilization: 92 },
  { id: 'dc-3', name: 'NYC Metro Center', lat: 40.7128, lng: -74.0060, type: 'hub', capacity: 45000, utilization: 85 },
  { id: 'dc-4', name: 'Houston Port Terminal', lat: 29.7604, lng: -95.3698, type: 'port', capacity: 80000, utilization: 65 },
  { id: 'dc-5', name: 'Seattle Gateway', lat: 47.6062, lng: -122.3321, type: 'port', capacity: 60000, utilization: 71 },
  { id: 'dc-6', name: 'Miami Import Center', lat: 25.7617, lng: -80.1918, type: 'port', capacity: 55000, utilization: 88 },
  { id: 'dc-7', name: 'Denver Regional', lat: 39.7392, lng: -104.9903, type: 'fulfillment', capacity: 25000, utilization: 56 },
  { id: 'dc-8', name: 'Atlanta Southeast Hub', lat: 33.7490, lng: -84.3880, type: 'hub', capacity: 40000, utilization: 82 },
  { id: 'dc-9', name: 'Phoenix Southwest', lat: 33.4484, lng: -112.0740, type: 'fulfillment', capacity: 30000, utilization: 67 },
  { id: 'dc-10', name: 'Boston Northeast', lat: 42.3601, lng: -71.0589, type: 'fulfillment', capacity: 28000, utilization: 74 },
  { id: 'dc-11', name: 'Dallas Central', lat: 32.7767, lng: -96.7970, type: 'hub', capacity: 42000, utilization: 79 },
  { id: 'dc-12', name: 'San Francisco Tech Hub', lat: 37.7749, lng: -122.4194, type: 'fulfillment', capacity: 32000, utilization: 91 },
];

const ROUTES = [
  { id: 'r-1', from: 'dc-1', to: 'dc-9', status: 'active', vehicles: 8, optimized: true },
  { id: 'r-2', from: 'dc-1', to: 'dc-12', status: 'active', vehicles: 5, optimized: true },
  { id: 'r-3', from: 'dc-2', to: 'dc-7', status: 'active', vehicles: 6, optimized: true },
  { id: 'r-4', from: 'dc-2', to: 'dc-11', status: 'delayed', vehicles: 4, optimized: false },
  { id: 'r-5', from: 'dc-3', to: 'dc-10', status: 'active', vehicles: 7, optimized: true },
  { id: 'r-6', from: 'dc-3', to: 'dc-8', status: 'active', vehicles: 9, optimized: true },
  { id: 'r-7', from: 'dc-4', to: 'dc-11', status: 'active', vehicles: 12, optimized: true },
  { id: 'r-8', from: 'dc-4', to: 'dc-6', status: 'delayed', vehicles: 3, optimized: false },
  { id: 'r-9', from: 'dc-5', to: 'dc-1', status: 'active', vehicles: 15, optimized: true },
  { id: 'r-10', from: 'dc-5', to: 'dc-7', status: 'active', vehicles: 6, optimized: true },
  { id: 'r-11', from: 'dc-6', to: 'dc-8', status: 'active', vehicles: 8, optimized: true },
  { id: 'r-12', from: 'dc-8', to: 'dc-2', status: 'active', vehicles: 5, optimized: true },
];

const SHIPMENTS = [
  { id: 's-1', lat: 36.1699, lng: -115.1398, status: 'in-transit', destination: 'dc-1', eta: '2h 15m' },
  { id: 's-2', lat: 38.9072, lng: -77.0369, status: 'in-transit', destination: 'dc-3', eta: '45m' },
  { id: 's-3', lat: 35.2271, lng: -80.8431, status: 'in-transit', destination: 'dc-8', eta: '1h 30m' },
  { id: 's-4', lat: 44.9778, lng: -93.2650, status: 'in-transit', destination: 'dc-2', eta: '3h 10m' },
  { id: 's-5', lat: 32.0853, lng: -110.9265, status: 'delayed', destination: 'dc-9', eta: '4h 45m' },
];

const TYPE_COLORS = {
  hub: '#00F0FF',
  fulfillment: '#64748B',
  port: '#00FF41'
};

const TYPE_ICONS = {
  hub: Warehouse,
  fulfillment: Truck,
  port: Ship
};

const LogisticsMap = ({ mapData }) => {
  const [selectedDC, setSelectedDC] = useState(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showShipments, setShowShipments] = useState(true);

  // Get coordinates for route lines
  const getRouteCoordinates = (route) => {
    const fromDC = DISTRIBUTION_CENTERS.find(dc => dc.id === route.from);
    const toDC = DISTRIBUTION_CENTERS.find(dc => dc.id === route.to);
    if (!fromDC || !toDC) return null;
    return [[fromDC.lat, fromDC.lng], [toDC.lat, toDC.lng]];
  };

  // Calculate stats
  const activeRoutes = ROUTES.filter(r => r.status === 'active').length;
  const delayedRoutes = ROUTES.filter(r => r.status === 'delayed').length;
  const totalVehicles = ROUTES.reduce((sum, r) => sum + r.vehicles, 0);
  const avgUtilization = Math.round(DISTRIBUTION_CENTERS.reduce((sum, dc) => sum + dc.utilization, 0) / DISTRIBUTION_CENTERS.length);

  return (
    <div data-testid="logistics-map" className="nexus-widget h-full">
      <div className="widget-header mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <MapPin size={18} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="widget-title">Logistics Network Map</h3>
            <p className="text-xs font-mono text-white/40">Real-time route visualization</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`px-3 py-1 rounded text-xs font-mono transition-all ${
              showRoutes 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                : 'bg-white/5 text-white/40 border border-white/10'
            }`}
          >
            Routes
          </button>
          <button
            onClick={() => setShowShipments(!showShipments)}
            className={`px-3 py-1 rounded text-xs font-mono transition-all ${
              showShipments 
                ? 'bg-white/5 text-white/60 border border-white/20' 
                : 'bg-white/5 text-white/40 border border-white/10'
            }`}
          >
            Shipments
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Active Routes</p>
          <p className="text-xl font-mono font-bold text-cyan-400">{activeRoutes}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Delayed</p>
          <p className="text-xl font-mono font-bold text-yellow-400">{delayedRoutes}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Vehicles</p>
          <p className="text-xl font-mono font-bold text-white">{totalVehicles}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Avg Utilization</p>
          <p className="text-xl font-mono font-bold text-green-400">{avgUtilization}%</p>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[400px] rounded-lg overflow-hidden border border-white/10">
        <MapContainer
          center={[39.8283, -98.5795]}
          zoom={4}
          style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
          zoomControl={false}
        >
          {/* Dark tile layer */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* Route lines */}
          {showRoutes && ROUTES.map(route => {
            const coords = getRouteCoordinates(route);
            if (!coords) return null;
            return (
              <Polyline
                key={route.id}
                positions={coords}
                pathOptions={{
                  color: route.status === 'active' ? '#00F0FF' : '#FFB800',
                  weight: route.optimized ? 3 : 2,
                  opacity: route.optimized ? 0.8 : 0.5,
                  dashArray: route.optimized ? null : '10, 10'
                }}
              />
            );
          })}

          {/* Distribution Centers */}
          {DISTRIBUTION_CENTERS.map(dc => {
            const Icon = TYPE_ICONS[dc.type];
            return (
              <CircleMarker
                key={dc.id}
                center={[dc.lat, dc.lng]}
                radius={dc.type === 'hub' ? 12 : 8}
                pathOptions={{
                  color: TYPE_COLORS[dc.type],
                  fillColor: TYPE_COLORS[dc.type],
                  fillOpacity: 0.6,
                  weight: 2
                }}
                eventHandlers={{
                  click: () => setSelectedDC(dc)
                }}
              >
                <Popup className="nexus-popup">
                  <div className="p-2 bg-black/90 rounded-lg min-w-[200px]">
                    <h4 className="font-heading text-sm font-bold text-white mb-2">{dc.name}</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-white/50">Type:</span>
                        <span className="text-cyan-400 capitalize">{dc.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Capacity:</span>
                        <span className="text-white">{dc.capacity.toLocaleString()} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Utilization:</span>
                        <span className={dc.utilization > 85 ? 'text-yellow-400' : 'text-green-400'}>
                          {dc.utilization}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Active Shipments */}
          {showShipments && SHIPMENTS.map(shipment => (
            <CircleMarker
              key={shipment.id}
              center={[shipment.lat, shipment.lng]}
              radius={5}
              pathOptions={{
                color: shipment.status === 'in-transit' ? '#64748B' : '#FFB800',
                fillColor: shipment.status === 'in-transit' ? '#64748B' : '#FFB800',
                fillOpacity: 0.9,
                weight: 2
              }}
            >
              <Popup>
                <div className="p-2 bg-black/90 rounded-lg">
                  <p className="text-xs text-white/50">Shipment {shipment.id}</p>
                  <p className="text-sm text-white">ETA: {shipment.eta}</p>
                  <p className={`text-xs ${shipment.status === 'delayed' ? 'text-yellow-400' : 'text-white/60'}`}>
                    {shipment.status.toUpperCase()}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 p-3 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10">
          <p className="text-xs font-mono text-white/50 uppercase mb-2">Legend</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400" />
              <span className="text-xs text-white/70">Hub</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-400" />
              <span className="text-xs text-white/70">Fulfillment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-xs text-white/70">Port</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected DC Details */}
      {selectedDC && (
        <div className="mt-4 p-4 rounded-lg bg-black/30 border border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-heading text-lg font-bold text-white">{selectedDC.name}</h4>
              <p className="text-xs font-mono text-white/40 uppercase">{selectedDC.type} • ID: {selectedDC.id}</p>
            </div>
            <button 
              onClick={() => setSelectedDC(null)}
              className="text-white/40 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div>
              <p className="text-xs font-mono text-white/40">Capacity</p>
              <p className="text-lg font-mono font-bold text-white">{selectedDC.capacity.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-white/40">Utilization</p>
              <p className="text-lg font-mono font-bold" style={{ color: TYPE_COLORS[selectedDC.type] }}>
                {selectedDC.utilization}%
              </p>
            </div>
            <div>
              <p className="text-xs font-mono text-white/40">Coordinates</p>
              <p className="text-sm font-mono text-white/70">{selectedDC.lat.toFixed(2)}, {selectedDC.lng.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogisticsMap;
