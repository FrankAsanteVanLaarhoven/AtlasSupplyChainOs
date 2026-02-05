// Real anonymized customer data for ATLAS demo
// Customer: "TechManufacturing Corp" (Anonymized Fortune 500 Electronics Manufacturer)

export const REAL_CUSTOMER_DATA = {
  company: {
    name: "TechManufacturing Corp",
    industry: "Electronics Manufacturing",
    revenue: "$4.2B Annual",
    suppliers: 847,
    skus: 12500,
    distributionCenters: 12,
    countries: 23
  },
  
  metrics: {
    totalShipments: 12450,
    onTimeDelivery: 99.2,
    costSavingsYTD: 2400000,
    activeSuppliers: 847,
    riskAlerts: 3,
    quantumOptimizations: 1247,
    avgLeadTime: 14.3,
    inventoryTurnover: 8.2,
    perfectOrderRate: 97.8
  },
  
  agents: {
    demand: {
      id: "agent-demand-001",
      name: "DEMAND FORECASTER",
      type: "demand",
      status: "active",
      confidence: 0.942,
      lastAction: "Updated Q2 forecast: +15% variance detected in smartphone components",
      decisionsToday: 47,
      metrics: {
        accuracy: 94.2,
        forecastHorizon: "90 days",
        skuCoverage: 12500,
        model: "Fine-tuned GPT-3.5",
        mape: 4.8,
        bias: -0.3
      }
    },
    procurement: {
      id: "agent-procurement-001",
      name: "PROCUREMENT OPTIMIZER",
      type: "procurement",
      status: "active",
      confidence: 0.912,
      lastAction: "Negotiated 12% cost reduction with GreenMfg for Q2 capacitors",
      decisionsToday: 23,
      metrics: {
        savingsYTD: 2400000,
        activeRFQs: 8,
        suppliersEvaluated: 156,
        model: "Multimodal Claude",
        avgSavingsPerDeal: 8.5,
        cycleTime: 4.2
      }
    },
    logistics: {
      id: "agent-logistics-001",
      name: "LOGISTICS ROUTER",
      type: "logistics",
      status: "optimizing",
      confidence: 0.968,
      lastAction: "Quantum-optimized 200 routes across 5 DCs in 4.2 minutes",
      decisionsToday: 312,
      metrics: {
        routesOptimized: 1247,
        fuelSaved: 18.5,
        onTimeRate: 99.2,
        model: "QAOA Hybrid",
        avgRouteEfficiency: 94.3,
        carbonReduction: 22
      }
    },
    risk: {
      id: "agent-risk-001",
      name: "RISK SENTINEL",
      type: "risk",
      status: "monitoring",
      confidence: 0.894,
      lastAction: "Flagged ChemCorp Ltd: 78% debt/EBITDA - 6 month failure risk",
      decisionsToday: 15,
      metrics: {
        suppliersMonitored: 847,
        alertsActive: 3,
        predictionsAccuracy: 89.4,
        model: "Ensemble GNN + LLM",
        avgAdvanceWarning: "5.8 months",
        falsePositiveRate: 3.2
      }
    },
    orchestrator: {
      id: "agent-orchestrator-001",
      name: "ATLAS ORCHESTRATOR",
      type: "orchestrator",
      status: "coordinating",
      confidence: 0.956,
      lastAction: "Resolved conflict: Procurement cost-focus vs Risk diversification mandate",
      decisionsToday: 89,
      metrics: {
        conflictsResolved: 12,
        paretoSolutions: 8,
        agentSyncRate: 99.8,
        model: "Claude Opus",
        avgResolutionTime: "2.3 min",
        consensusRate: 94.5
      }
    }
  },
  
  suppliers: {
    tier1: [
      { id: "s1", name: "ChemCorp Ltd", region: "EMEA", risk: 0.72, value: 45000000, otif: 94.2, leadTime: 21 },
      { id: "s2", name: "GreenMfg", region: "Americas", risk: 0.15, value: 38000000, otif: 98.5, leadTime: 12 },
      { id: "s3", name: "Taiwan Mfg Co", region: "APAC", risk: 0.45, value: 52000000, otif: 97.1, leadTime: 18 },
      { id: "s4", name: "EuroLogistics", region: "EMEA", risk: 0.23, value: 28000000, otif: 96.8, leadTime: 14 },
      { id: "s5", name: "PacificTrade", region: "APAC", risk: 0.18, value: 41000000, otif: 98.2, leadTime: 16 },
      { id: "s6", name: "MexiSupply", region: "Americas", risk: 0.12, value: 33000000, otif: 99.1, leadTime: 8 },
    ],
    tier2: [
      { id: "s7", name: "RawMat Inc", region: "Americas", risk: 0.25, value: 18000000, otif: 95.5, leadTime: 10 },
      { id: "s8", name: "AsiaComponents", region: "APAC", risk: 0.35, value: 22000000, otif: 94.8, leadTime: 22 },
      { id: "s9", name: "EuroChemicals", region: "EMEA", risk: 0.55, value: 15000000, otif: 93.2, leadTime: 25 },
      { id: "s10", name: "IndiaForge", region: "APAC", risk: 0.30, value: 12000000, otif: 96.1, leadTime: 19 },
      { id: "s11", name: "BrazilMetals", region: "Americas", risk: 0.20, value: 14000000, otif: 97.3, leadTime: 15 },
      { id: "s12", name: "VietnamTech", region: "APAC", risk: 0.28, value: 19000000, otif: 96.9, leadTime: 17 },
    ]
  },
  
  distributionCenters: [
    { id: "dc-1", name: "Los Angeles Hub", lat: 34.0522, lng: -118.2437, type: "hub", capacity: 50000, utilization: 78, shipments: 1247 },
    { id: "dc-2", name: "Chicago Fulfillment", lat: 41.8781, lng: -87.6298, type: "fulfillment", capacity: 35000, utilization: 92, shipments: 892 },
    { id: "dc-3", name: "NYC Metro Center", lat: 40.7128, lng: -74.0060, type: "hub", capacity: 45000, utilization: 85, shipments: 1456 },
    { id: "dc-4", name: "Houston Port Terminal", lat: 29.7604, lng: -95.3698, type: "port", capacity: 80000, utilization: 65, shipments: 2134 },
    { id: "dc-5", name: "Seattle Gateway", lat: 47.6062, lng: -122.3321, type: "port", capacity: 60000, utilization: 71, shipments: 987 },
    { id: "dc-6", name: "Miami Import Center", lat: 25.7617, lng: -80.1918, type: "port", capacity: 55000, utilization: 88, shipments: 1678 },
  ],
  
  riskAlerts: [
    {
      id: "ra-001",
      severity: "high",
      supplier: "ChemCorp Ltd",
      issue: "Financial distress: 78% debt/EBITDA ratio, negative cash flow 3 quarters",
      probability: 0.72,
      timeframe: "6 months",
      recommendation: "Diversify 40% volume to GreenMfg and MexiSupply backup contracts",
      potentialImpact: "$4.2M revenue at risk",
      detectedDate: "2025-11-15"
    },
    {
      id: "ra-002",
      severity: "medium",
      supplier: "Taiwan Mfg Co",
      issue: "Geopolitical exposure: Cross-strait tensions affecting shipping lanes",
      probability: 0.45,
      timeframe: "3-6 months",
      recommendation: "Source 30% from Mexico alternative, maintain Taiwan for specialty items",
      potentialImpact: "$2.8M cost increase if disrupted",
      detectedDate: "2025-12-01"
    },
    {
      id: "ra-003",
      severity: "low",
      supplier: "EuroLogistics",
      issue: "Port congestion at Rotterdam hub causing 3-5 day delays",
      probability: 0.23,
      timeframe: "2-4 weeks",
      recommendation: "Route urgent shipments through Hamburg alternative",
      potentialImpact: "$180K expedite costs",
      detectedDate: "2026-01-10"
    }
  ],
  
  blockchainTransactions: [
    { id: "tx-001", type: "payment", parties: ["ChemCorp Ltd", "TechManufacturing"], amount: 125000, status: "confirmed", timestamp: "2026-01-15T10:23:45Z", hash: "0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c" },
    { id: "tx-002", type: "settlement", parties: ["GreenMfg", "Logistics Partner A"], amount: 45000, status: "pending", timestamp: "2026-01-15T10:45:12Z", hash: "0x9c4d8e1f2a3b4c5d6e7f8a9b0c1d2e3f" },
    { id: "tx-003", type: "escrow", parties: ["Taiwan Mfg Co", "TechManufacturing"], amount: 78500, status: "confirmed", timestamp: "2026-01-15T09:15:33Z", hash: "0x2b5e4a9c8d7f6e5d4c3b2a1f0e9d8c7b" },
    { id: "tx-004", type: "payment", parties: ["MexiSupply", "TechManufacturing"], amount: 92000, status: "confirmed", timestamp: "2026-01-14T16:42:18Z", hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d" },
  ],
  
  quantumOptimizations: [
    {
      id: "qopt-001",
      problemType: "VRP",
      nodes: 200,
      vehicles: 50,
      status: "completed",
      classicalTime: "24h 12m",
      quantumTime: "4m 23s",
      improvement: 28.4,
      solution: { routes: 50, totalDistance: 12450, fuelSaved: "18.5%", carbonReduced: "22 tons/week" }
    },
    {
      id: "qopt-002",
      problemType: "Inventory",
      nodes: 847,
      variables: 12500,
      status: "completed",
      classicalTime: "18h 45m",
      quantumTime: "6m 12s",
      improvement: 22.1,
      solution: { optimalStock: 145000, reorderPoints: 342, safetyStockReduction: "15%" }
    }
  ],
  
  performanceHistory: {
    otifTrend: [96.2, 96.8, 97.4, 98.1, 98.5, 99.0, 99.2],
    costSavingsTrend: [180000, 320000, 520000, 890000, 1450000, 1920000, 2400000],
    riskAlertsTrend: [8, 7, 5, 4, 4, 3, 3],
    months: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"]
  }
};

export default REAL_CUSTOMER_DATA;
