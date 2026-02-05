import React, { useState } from 'react';
import { FlaskConical, Play, Pause, TrendingDown, TrendingUp, AlertTriangle, DollarSign, Truck, RefreshCw } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { ScrollArea } from '../components/ui/scroll-area';

// Predefined scenarios for counterfactual analysis
const SCENARIO_TEMPLATES = [
  { id: 's1', name: 'Supplier Failure', description: 'What if ChemCorp Ltd becomes insolvent?', type: 'disruption', icon: AlertTriangle },
  { id: 's2', name: 'Tariff Spike', description: 'What if China tariffs increase 25%?', type: 'cost', icon: DollarSign },
  { id: 's3', name: 'Demand Surge', description: 'What if Q2 demand increases by 40%?', type: 'demand', icon: TrendingUp },
  { id: 's4', name: 'Port Disruption', description: 'What if LA/Long Beach ports close for 2 weeks?', type: 'logistics', icon: Truck },
  { id: 's5', name: 'Currency Shock', description: 'What if USD weakens 15% against CNY?', type: 'financial', icon: DollarSign },
  { id: 's6', name: 'Multi-Supplier Loss', description: 'What if 3 APAC suppliers fail simultaneously?', type: 'disruption', icon: AlertTriangle },
];

const SIMULATION_RESULTS = {
  's1': {
    scenario: 'ChemCorp Ltd Insolvency',
    probability: 0.72,
    timeHorizon: '6 months',
    impacts: [
      { metric: 'Cost Impact', value: '+$2.3M', change: 8.5, direction: 'negative' },
      { metric: 'OTIF', value: '88%', change: -11.2, direction: 'negative' },
      { metric: 'Lead Time', value: '+12 days', change: 45, direction: 'negative' },
      { metric: 'Supplier Risk', value: 'HIGH', change: 35, direction: 'negative' },
    ],
    cascadeEffects: [
      { tier: 1, affected: 5, suppliers: ['GreenMfg (backup)', 'MexiSupply', 'PacificTrade'] },
      { tier: 2, affected: 8, suppliers: ['RawMat Inc', 'IndiaForge', 'VietnamTech'] },
      { tier: 3, affected: 3, suppliers: ['MineralCo', 'AussieMining'] },
    ],
    mitigations: [
      { action: 'Shift 30% volume to GreenMfg', cost: '+$300K', otifRecovery: '96%', timeToExecute: '2 weeks' },
      { action: 'Activate MexiSupply backup contract', cost: '+$180K', otifRecovery: '97%', timeToExecute: '1 week' },
      { action: 'Dual-source from Taiwan + Mexico', cost: '+$450K', otifRecovery: '98.5%', timeToExecute: '3 weeks' },
    ],
    recommendation: 'Dual-source strategy recommended: Best balance of cost (+$450K) vs. OTIF recovery (98.5%)',
    agentActions: [
      { agent: 'Risk Sentinel', action: 'Flagged ChemCorp 6 months early', status: 'completed' },
      { agent: 'Procurement', action: 'Pre-negotiated backup contracts', status: 'completed' },
      { agent: 'Logistics', action: 'Re-optimized 47 routes to alternate suppliers', status: 'in_progress' },
      { agent: 'Orchestrator', action: 'Coordinating cross-agent response', status: 'active' },
    ]
  },
  's2': {
    scenario: '25% China Tariff Increase',
    probability: 0.45,
    timeHorizon: '3 months',
    impacts: [
      { metric: 'Cost Impact', value: '+$4.8M', change: 18.2, direction: 'negative' },
      { metric: 'OTIF', value: '94%', change: -5.2, direction: 'negative' },
      { metric: 'Margin', value: '-3.2%', change: -3.2, direction: 'negative' },
      { metric: 'Working Capital', value: '+$2.1M', change: 12, direction: 'negative' },
    ],
    cascadeEffects: [
      { tier: 1, affected: 3, suppliers: ['Taiwan Mfg Co', 'PacificTrade', 'AsiaComponents'] },
      { tier: 2, affected: 5, suppliers: ['IndiaForge', 'VietnamTech', 'ChinaRare'] },
    ],
    mitigations: [
      { action: 'Nearshore to Mexico (60% APAC volume)', cost: '+$1.2M', otifRecovery: '96%', timeToExecute: '6 weeks' },
      { action: 'Absorb tariff, pass to customers', cost: '+$0', otifRecovery: '94%', timeToExecute: 'Immediate' },
      { action: 'Hybrid: 40% Mexico, 60% absorb', cost: '+$720K', otifRecovery: '95%', timeToExecute: '4 weeks' },
    ],
    recommendation: 'Hybrid strategy: Nearshore high-value items to Mexico, absorb tariffs on commodity items',
  },
  's3': {
    scenario: '40% Q2 Demand Surge',
    probability: 0.35,
    timeHorizon: '90 days',
    impacts: [
      { metric: 'Revenue Opportunity', value: '+$12.4M', change: 40, direction: 'positive' },
      { metric: 'OTIF Risk', value: '82%', change: -17.2, direction: 'negative' },
      { metric: 'Inventory Gap', value: '23,000 units', change: 0, direction: 'negative' },
      { metric: 'Capacity Utilization', value: '118%', change: 28, direction: 'negative' },
    ],
    mitigations: [
      { action: 'Expedite from top 5 suppliers', cost: '+$890K', otifRecovery: '94%', timeToExecute: '2 weeks' },
      { action: 'Activate overflow capacity (3PL)', cost: '+$1.4M', otifRecovery: '97%', timeToExecute: '1 week' },
      { action: 'Pre-build safety stock now', cost: '+$2.1M', otifRecovery: '99%', timeToExecute: '6 weeks' },
    ],
    recommendation: 'Pre-build safety stock NOW: Highest upfront cost but captures full $12.4M revenue opportunity',
  },
  's4': {
    scenario: 'LA/Long Beach Port Closure (2 weeks)',
    probability: 0.25,
    timeHorizon: '2 weeks',
    impacts: [
      { metric: 'Delayed Shipments', value: '340 containers', change: 0, direction: 'negative' },
      { metric: 'OTIF', value: '72%', change: -27.2, direction: 'negative' },
      { metric: 'Expedite Costs', value: '+$1.8M', change: 0, direction: 'negative' },
      { metric: 'Revenue at Risk', value: '$8.2M', change: 0, direction: 'negative' },
    ],
    cascadeEffects: [
      { tier: 1, affected: 12, suppliers: ['PacificTrade', 'AsiaComponents', 'ChinaMfg'] },
      { tier: 2, affected: 18, suppliers: ['VietnamTech', 'Taiwan Semi', 'KoreaElec'] },
    ],
    mitigations: [
      { action: 'Reroute to Oakland/Seattle ports', cost: '+$420K', otifRecovery: '89%', timeToExecute: '3 days' },
      { action: 'Air freight critical components', cost: '+$1.2M', otifRecovery: '96%', timeToExecute: '24 hours' },
      { action: 'Activate East Coast inventory buffer', cost: '+$180K', otifRecovery: '91%', timeToExecute: '2 days' },
    ],
    recommendation: 'Hybrid approach: Air freight top 20% critical items, reroute remainder to Oakland',
  },
  's5': {
    scenario: 'USD Weakens 15% vs CNY',
    probability: 0.30,
    timeHorizon: '6 months',
    impacts: [
      { metric: 'COGS Increase', value: '+$6.2M', change: 15, direction: 'negative' },
      { metric: 'Margin Impact', value: '-4.8%', change: -4.8, direction: 'negative' },
      { metric: 'China Sourcing Cost', value: '+15%', change: 15, direction: 'negative' },
      { metric: 'Hedging Gap', value: '$3.1M', change: 0, direction: 'negative' },
    ],
    mitigations: [
      { action: 'Accelerate Mexico nearshoring', cost: '+$800K', otifRecovery: '97%', timeToExecute: '8 weeks' },
      { action: 'Forward currency contracts (6mo)', cost: '+$120K', otifRecovery: '99%', timeToExecute: '1 week' },
      { action: 'Renegotiate USD-denominated contracts', cost: '+$0', otifRecovery: '94%', timeToExecute: '4 weeks' },
    ],
    recommendation: 'Immediate hedging + accelerate nearshoring roadmap for long-term resilience',
  },
  's6': {
    scenario: '3 APAC Suppliers Fail Simultaneously',
    probability: 0.08,
    timeHorizon: '30 days',
    impacts: [
      { metric: 'Production Halt Risk', value: '68%', change: 0, direction: 'negative' },
      { metric: 'Cost Impact', value: '+$9.4M', change: 35, direction: 'negative' },
      { metric: 'OTIF', value: '45%', change: -54.2, direction: 'negative' },
      { metric: 'Customer Churn Risk', value: 'HIGH', change: 0, direction: 'negative' },
    ],
    cascadeEffects: [
      { tier: 1, affected: 15, suppliers: ['All APAC Tier 1 affected'] },
      { tier: 2, affected: 28, suppliers: ['Cascading to Americas, EMEA'] },
      { tier: 3, affected: 12, suppliers: ['Raw material shortages'] },
    ],
    mitigations: [
      { action: 'Emergency supplier qualification (5 new)', cost: '+$2.4M', otifRecovery: '78%', timeToExecute: '6 weeks' },
      { action: 'Activate strategic inventory reserve', cost: '+$400K', otifRecovery: '85%', timeToExecute: '48 hours' },
      { action: 'Customer allocation & communication', cost: '+$0', otifRecovery: '70%', timeToExecute: 'Immediate' },
    ],
    recommendation: 'CRITICAL: Activate strategic reserves immediately + begin emergency supplier qualification',
    agentActions: [
      { agent: 'Risk Sentinel', action: 'Monitoring all 847 suppliers 24/7', status: 'active' },
      { agent: 'Procurement', action: 'Emergency RFQs sent to 12 backup suppliers', status: 'in_progress' },
      { agent: 'Logistics', action: 'Rerouting 89 shipments to alternate sources', status: 'in_progress' },
      { agent: 'Orchestrator', action: 'CEO war room briefing prepared', status: 'completed' },
    ]
  }
};

const ScenarioCard = ({ scenario, isSelected, onClick, isRunning }) => {
  const Icon = scenario.icon;
  return (
    <button
      data-testid={`scenario-${scenario.id}`}
      onClick={onClick}
      disabled={isRunning}
      className={`p-4 rounded-lg border transition-all text-left w-full ${
        isSelected 
          ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.15)]' 
          : 'bg-black/30 border-white/10 hover:border-white/30'
      } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-500/20' : 'bg-white/5'}`}>
          <Icon size={16} className={isSelected ? 'text-cyan-400' : 'text-white/50'} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-heading text-sm font-semibold ${isSelected ? 'text-cyan-400' : 'text-white'}`}>
            {scenario.name}
          </h4>
          <p className="text-xs text-white/50 mt-1 line-clamp-2">{scenario.description}</p>
        </div>
      </div>
    </button>
  );
};

const ImpactCard = ({ impact }) => {
  const isNegative = impact.direction === 'negative';
  return (
    <div className="p-3 rounded-lg bg-black/30 border border-white/5">
      <p className="text-xs font-mono text-white/40 uppercase">{impact.metric}</p>
      <div className="flex items-center justify-between mt-1">
        <p className={`text-xl font-mono font-bold ${isNegative ? 'text-red-400' : 'text-green-400'}`}>
          {impact.value}
        </p>
        <div className={`flex items-center gap-1 text-xs font-mono ${isNegative ? 'text-red-400' : 'text-green-400'}`}>
          {isNegative ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
          {Math.abs(impact.change)}%
        </div>
      </div>
    </div>
  );
};

const ScenarioPlanner = () => {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  const runSimulation = async (scenario) => {
    const targetScenario = scenario || selectedScenario;
    if (!targetScenario) return;
    
    setSelectedScenario(targetScenario);
    setIsRunning(true);
    setProgress(0);
    setResults(null);

    // Simulate processing
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 80));
      setProgress(i);
    }

    setResults(SIMULATION_RESULTS[targetScenario.id] || SIMULATION_RESULTS['s1']);
    setIsRunning(false);
  };

  const handleScenarioClick = (scenario) => {
    // Auto-run simulation when clicking a scenario
    runSimulation(scenario);
  };

  const reset = () => {
    setSelectedScenario(null);
    setResults(null);
    setProgress(0);
  };

  return (
    <div data-testid="scenario-planner" className="nexus-widget">
      <div className="widget-header mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
            <FlaskConical size={18} className="text-yellow-400" />
          </div>
          <div>
            <h3 className="widget-title">Counterfactual Scenario Planner</h3>
            <p className="text-xs font-mono text-white/40">What-if analysis • Layer 6</p>
          </div>
        </div>
        {results && (
          <button onClick={reset} className="cyber-btn px-3 py-1.5 text-xs flex items-center gap-2">
            <RefreshCw size={12} />
            New Scenario
          </button>
        )}
      </div>

      {!results ? (
        <>
          {/* Scenario Selection */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {SCENARIO_TEMPLATES.map(scenario => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                isSelected={selectedScenario?.id === scenario.id}
                onClick={() => handleScenarioClick(scenario)}
                isRunning={isRunning}
              />
            ))}
          </div>

          {/* Run Simulation */}
          <div className="p-4 rounded-lg bg-black/30 border border-white/10">
            {isRunning ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-white/60">Simulating 1,000+ scenarios...</span>
                  <span className="text-sm font-mono text-cyan-400">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-white/10" />
                <div className="flex items-center gap-2 text-xs font-mono text-white/40">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  Running Monte Carlo simulation across supply chain network
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">
                    {selectedScenario ? `Selected: ${selectedScenario.name}` : 'Select a scenario to analyze'}
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    Simulates cascading effects across all 847 suppliers and 1,247 routes
                  </p>
                </div>
                <button
                  onClick={runSimulation}
                  disabled={!selectedScenario}
                  className="cyber-btn px-6 py-2 flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Play size={14} />
                  Run Simulation
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-4 pr-4">
            {/* Scenario Header */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-mono text-yellow-400 uppercase mb-1">Scenario Analysis Complete</p>
                  <h4 className="text-xl font-heading font-bold text-white">{results.scenario}</h4>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-white/40">Probability</p>
                  <p className="text-2xl font-mono font-bold text-yellow-400">{(results.probability * 100).toFixed(0)}%</p>
                </div>
              </div>
              <p className="text-xs font-mono text-white/50 mt-2">Time Horizon: {results.timeHorizon}</p>
            </div>

            {/* Impact Metrics */}
            <div>
              <h5 className="text-sm font-heading font-semibold text-white/70 uppercase tracking-wide mb-3">
                Projected Impacts
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {results.impacts.map((impact, idx) => (
                  <ImpactCard key={idx} impact={impact} />
                ))}
              </div>
            </div>

            {/* Cascade Effects */}
            {results.cascadeEffects && (
              <div>
                <h5 className="text-sm font-heading font-semibold text-white/70 uppercase tracking-wide mb-3">
                  Cascade Effects
                </h5>
                <div className="space-y-2">
                  {results.cascadeEffects.map((cascade, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-black/30 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-mono text-cyan-400">Tier {cascade.tier}</span>
                        <span className="text-xs font-mono text-white/40">{cascade.affected} suppliers affected</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {cascade.suppliers.map((s, i) => (
                          <span key={i} className="px-2 py-1 rounded bg-white/5 text-xs font-mono text-white/60">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mitigation Options */}
            <div>
              <h5 className="text-sm font-heading font-semibold text-white/70 uppercase tracking-wide mb-3">
                Mitigation Strategies
              </h5>
              <div className="space-y-2">
                {results.mitigations.map((mit, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-black/30 border border-white/5 hover:border-cyan-500/30 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-white/90">{mit.action}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs font-mono text-red-400">Cost: {mit.cost}</span>
                          <span className="text-xs font-mono text-green-400">OTIF: {mit.otifRecovery}</span>
                          <span className="text-xs font-mono text-white/40">Time: {mit.timeToExecute}</span>
                        </div>
                      </div>
                      <button className="px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-400 hover:bg-cyan-500/20 transition-colors">
                        Execute
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <FlaskConical size={16} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs font-mono text-cyan-400 uppercase mb-1">ATLAS Recommendation</p>
                  <p className="text-sm text-white/90">{results.recommendation}</p>
                </div>
              </div>
            </div>

            {/* Agent Actions */}
            {results.agentActions && (
              <div>
                <h5 className="text-sm font-heading font-semibold text-white/70 uppercase tracking-wide mb-3">
                  Agent Response Status
                </h5>
                <div className="space-y-2">
                  {results.agentActions.map((action, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-black/20">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-cyan-400 w-24">{action.agent}</span>
                        <span className="text-xs text-white/70">{action.action}</span>
                      </div>
                      <span className={`text-xs font-mono uppercase px-2 py-0.5 rounded ${
                        action.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        action.status === 'active' ? 'bg-cyan-500/20 text-cyan-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {action.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default ScenarioPlanner;
