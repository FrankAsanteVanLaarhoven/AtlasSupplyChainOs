import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Users, Globe, AlertTriangle, TrendingUp, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// Sample supplier network data
const SUPPLIER_NODES = [
  // Tier 0 - Your company
  { id: 'atlas', name: 'ATLAS Corp', tier: 0, region: 'Americas', risk: 0, value: 500000000 },
  
  // Tier 1 - Direct suppliers
  { id: 's1', name: 'ChemCorp Ltd', tier: 1, region: 'EMEA', risk: 0.72, value: 45000000 },
  { id: 's2', name: 'GreenMfg', tier: 1, region: 'Americas', risk: 0.15, value: 38000000 },
  { id: 's3', name: 'Taiwan Mfg Co', tier: 1, region: 'APAC', risk: 0.45, value: 52000000 },
  { id: 's4', name: 'EuroLogistics', tier: 1, region: 'EMEA', risk: 0.23, value: 28000000 },
  { id: 's5', name: 'PacificTrade', tier: 1, region: 'APAC', risk: 0.18, value: 41000000 },
  { id: 's6', name: 'MexiSupply', tier: 1, region: 'Americas', risk: 0.12, value: 33000000 },
  
  // Tier 2 - Secondary suppliers
  { id: 's7', name: 'RawMat Inc', tier: 2, region: 'Americas', risk: 0.25, value: 18000000 },
  { id: 's8', name: 'AsiaComponents', tier: 2, region: 'APAC', risk: 0.35, value: 22000000 },
  { id: 's9', name: 'EuroChemicals', tier: 2, region: 'EMEA', risk: 0.55, value: 15000000 },
  { id: 's10', name: 'IndiaForge', tier: 2, region: 'APAC', risk: 0.30, value: 12000000 },
  { id: 's11', name: 'BrazilMetals', tier: 2, region: 'Americas', risk: 0.20, value: 14000000 },
  { id: 's12', name: 'VietnamTech', tier: 2, region: 'APAC', risk: 0.28, value: 19000000 },
  
  // Tier 3 - Tertiary suppliers
  { id: 's13', name: 'MineralCo', tier: 3, region: 'Americas', risk: 0.40, value: 8000000 },
  { id: 's14', name: 'AfricaOres', tier: 3, region: 'EMEA', risk: 0.65, value: 6000000 },
  { id: 's15', name: 'ChinaRare', tier: 3, region: 'APAC', risk: 0.50, value: 11000000 },
  { id: 's16', name: 'AussieMining', tier: 3, region: 'APAC', risk: 0.15, value: 9000000 },
];

const SUPPLIER_LINKS = [
  // Tier 0 to Tier 1
  { source: 'atlas', target: 's1', value: 45 },
  { source: 'atlas', target: 's2', value: 38 },
  { source: 'atlas', target: 's3', value: 52 },
  { source: 'atlas', target: 's4', value: 28 },
  { source: 'atlas', target: 's5', value: 41 },
  { source: 'atlas', target: 's6', value: 33 },
  
  // Tier 1 to Tier 2
  { source: 's1', target: 's7', value: 15 },
  { source: 's1', target: 's9', value: 12 },
  { source: 's2', target: 's7', value: 18 },
  { source: 's2', target: 's11', value: 10 },
  { source: 's3', target: 's8', value: 25 },
  { source: 's3', target: 's12', value: 20 },
  { source: 's4', target: 's9', value: 14 },
  { source: 's5', target: 's8', value: 16 },
  { source: 's5', target: 's10', value: 12 },
  { source: 's6', target: 's11', value: 15 },
  
  // Tier 2 to Tier 3
  { source: 's7', target: 's13', value: 8 },
  { source: 's8', target: 's15', value: 11 },
  { source: 's9', target: 's14', value: 6 },
  { source: 's10', target: 's15', value: 9 },
  { source: 's11', target: 's13', value: 7 },
  { source: 's12', target: 's16', value: 10 },
];

const REGION_COLORS = {
  'Americas': '#00F0FF',
  'EMEA': '#64748B',
  'APAC': '#00FF41'
};

const TIER_RADIUS = {
  0: 35,
  1: 20,
  2: 14,
  3: 10
};

const SupplierNetwork = ({ networkData }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [filterRegion, setFilterRegion] = useState(null);
  const [showRiskOnly, setShowRiskOnly] = useState(false);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 500;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create gradient definitions
    const defs = svg.append('defs');
    
    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Filter nodes and links
    let filteredNodes = [...SUPPLIER_NODES];
    let filteredLinks = [...SUPPLIER_LINKS];

    if (filterRegion) {
      filteredNodes = filteredNodes.filter(n => n.region === filterRegion || n.id === 'nexus');
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      filteredLinks = filteredLinks.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));
    }

    if (showRiskOnly) {
      filteredNodes = filteredNodes.filter(n => n.risk > 0.4 || n.id === 'nexus');
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      filteredLinks = filteredLinks.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));
    }

    // Create force simulation
    const simulation = d3.forceSimulation(filteredNodes)
      .force('link', d3.forceLink(filteredLinks).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => TIER_RADIUS[d.tier] + 10));

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    const g = svg.append('g');

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(filteredLinks)
      .join('line')
      .attr('stroke', '#ffffff')
      .attr('stroke-opacity', 0.15)
      .attr('stroke-width', d => Math.sqrt(d.value) / 2);

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(filteredNodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Node circles
    node.append('circle')
      .attr('r', d => TIER_RADIUS[d.tier])
      .attr('fill', d => {
        if (d.id === 'nexus') return '#00F0FF';
        return d.risk > 0.5 ? `rgba(255, 0, 60, ${0.3 + d.risk * 0.5})` : REGION_COLORS[d.region];
      })
      .attr('stroke', d => d.risk > 0.5 ? '#FF003C' : REGION_COLORS[d.region])
      .attr('stroke-width', d => d.id === 'nexus' ? 3 : 2)
      .attr('filter', 'url(#glow)')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', TIER_RADIUS[d.tier] * 1.2);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', TIER_RADIUS[d.tier]);
      });

    // Risk indicator for high-risk nodes
    node.filter(d => d.risk > 0.5)
      .append('circle')
      .attr('r', d => TIER_RADIUS[d.tier] + 5)
      .attr('fill', 'none')
      .attr('stroke', '#FF003C')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.6);

    // Node labels
    node.append('text')
      .text(d => d.id === 'atlas' ? 'ATLAS' : d.name.split(' ')[0])
      .attr('text-anchor', 'middle')
      .attr('dy', d => TIER_RADIUS[d.tier] + 15)
      .attr('fill', '#ffffff')
      .attr('font-size', d => d.tier === 0 ? '12px' : '10px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('opacity', 0.7);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Click on background to deselect
    svg.on('click', () => setSelectedNode(null));

    return () => simulation.stop();
  }, [filterRegion, showRiskOnly]);

  // Calculate network stats
  const totalSuppliers = SUPPLIER_NODES.length - 1;
  const highRiskCount = SUPPLIER_NODES.filter(n => n.risk > 0.5).length;
  const totalValue = SUPPLIER_NODES.reduce((sum, n) => sum + (n.value || 0), 0);
  const regions = [...new Set(SUPPLIER_NODES.map(n => n.region))];

  return (
    <div data-testid="supplier-network" className="nexus-widget">
      <div className="widget-header mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-black/30 border border-white/10">
            <Users size={18} className="text-white/60" />
          </div>
          <div>
            <h3 className="widget-title">Supplier Network Graph</h3>
            <p className="text-xs font-mono text-white/40">Multi-tier relationship visualization</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRiskOnly(!showRiskOnly)}
            className={`px-3 py-1 rounded text-xs font-mono transition-all flex items-center gap-1 ${
              showRiskOnly 
                ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                : 'bg-white/5 text-white/40 border border-white/10'
            }`}
          >
            <AlertTriangle size={12} />
            High Risk
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Total Suppliers</p>
          <p className="text-xl font-mono font-bold text-cyan-400">{totalSuppliers}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">High Risk</p>
          <p className="text-xl font-mono font-bold text-red-400">{highRiskCount}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Tiers</p>
          <p className="text-xl font-mono font-bold text-white/60">4</p>
        </div>
        <div className="p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs font-mono text-white/40 uppercase">Network Value</p>
          <p className="text-xl font-mono font-bold text-green-400">${(totalValue / 1000000).toFixed(0)}M</p>
        </div>
      </div>

      {/* Region Filters */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-mono text-white/40 uppercase">Filter by Region:</span>
        <button
          onClick={() => setFilterRegion(null)}
          className={`px-3 py-1 rounded text-xs font-mono transition-all ${
            !filterRegion 
              ? 'bg-white/20 text-white border border-white/30' 
              : 'bg-white/5 text-white/40 border border-white/10'
          }`}
        >
          All
        </button>
        {['Americas', 'EMEA', 'APAC'].map(region => (
          <button
            key={region}
            onClick={() => setFilterRegion(filterRegion === region ? null : region)}
            className={`px-3 py-1 rounded text-xs font-mono transition-all ${
              filterRegion === region 
                ? 'border' 
                : 'bg-white/5 text-white/40 border border-white/10'
            }`}
            style={filterRegion === region ? {
              backgroundColor: `${REGION_COLORS[region]}20`,
              color: REGION_COLORS[region],
              borderColor: `${REGION_COLORS[region]}50`
            } : {}}
          >
            {region}
          </button>
        ))}
      </div>

      {/* Graph Container */}
      <div 
        ref={containerRef} 
        className="relative rounded-lg overflow-hidden border border-white/10 bg-black/30"
        style={{ minHeight: '500px' }}
      >
        <svg ref={svgRef} className="w-full" />
        
        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => {
              const svg = d3.select(svgRef.current);
              svg.transition().call(d3.zoom().scaleTo, zoomLevel * 1.3);
            }}
            className="p-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white transition-colors"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => {
              const svg = d3.select(svgRef.current);
              svg.transition().call(d3.zoom().scaleTo, zoomLevel * 0.7);
            }}
            className="p-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white transition-colors"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={() => {
              const svg = d3.select(svgRef.current);
              svg.transition().call(d3.zoom().transform, d3.zoomIdentity);
            }}
            className="p-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white transition-colors"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute top-4 left-4 p-3 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
          <p className="text-xs font-mono text-white/50 uppercase mb-2">Network Tiers</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-cyan-400/60 border-2 border-cyan-400" />
              <span className="text-xs text-white/70">ATLAS (Tier 0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white/20 border border-white/40" />
              <span className="text-xs text-white/70">Direct (Tier 1)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/20 border border-white/40" />
              <span className="text-xs text-white/70">Secondary (Tier 2-3)</span>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
              <div className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500 border-dashed" />
              <span className="text-xs text-white/70">High Risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && selectedNode.id !== 'nexus' && (
        <div className="mt-4 p-4 rounded-lg bg-black/30 border border-slate-500/20 slide-up">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-heading text-lg font-bold text-white">{selectedNode.name}</h4>
              <p className="text-xs font-mono text-white/40">
                Tier {selectedNode.tier} • {selectedNode.region}
              </p>
            </div>
            <button onClick={() => setSelectedNode(null)} className="text-white/40 hover:text-white">✕</button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-mono text-white/40 uppercase">Risk Score</p>
              <p className={`text-xl font-mono font-bold ${
                selectedNode.risk > 0.5 ? 'text-red-400' : 
                selectedNode.risk > 0.3 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {(selectedNode.risk * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="text-xs font-mono text-white/40 uppercase">Contract Value</p>
              <p className="text-xl font-mono font-bold text-white">
                ${(selectedNode.value / 1000000).toFixed(1)}M
              </p>
            </div>
            <div>
              <p className="text-xs font-mono text-white/40 uppercase">Region</p>
              <p className="text-xl font-mono font-bold" style={{ color: REGION_COLORS[selectedNode.region] }}>
                {selectedNode.region}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierNetwork;
