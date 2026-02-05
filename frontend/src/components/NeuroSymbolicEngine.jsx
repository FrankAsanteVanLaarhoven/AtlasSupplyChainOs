import React, { useState } from 'react';
import { Brain, ChevronRight, ChevronDown, CheckCircle, AlertTriangle, Info, Lightbulb, Scale } from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';
import { Progress } from '../components/ui/progress';

// Neuro-Symbolic Reasoning traces for agent decisions
const REASONING_TRACES = {
  demand: {
    decision: "Increase Q2 forecast by 15%",
    confidence: 0.94,
    neuralInsights: [
      { type: 'pattern', description: 'Historical sales pattern matches 2024 Q2 growth trajectory', weight: 0.35 },
      { type: 'signal', description: 'Social media sentiment shifted positive in product category', weight: 0.25 },
      { type: 'correlation', description: 'Weather forecast indicates favorable conditions for outdoor products', weight: 0.20 },
      { type: 'trend', description: 'Competitor inventory levels declining (stockout risk)', weight: 0.20 }
    ],
    symbolicRules: [
      { rule: 'IF historical_growth > 10% AND competitor_stockout_risk > 0.3 THEN increase_forecast', status: 'satisfied', impact: 'high' },
      { rule: 'IF social_sentiment > neutral AND weather_favorable THEN demand_boost_likely', status: 'satisfied', impact: 'medium' },
      { rule: 'IF forecast_variance > 20% THEN require_human_review', status: 'not_triggered', impact: 'low' }
    ],
    counterfactuals: [
      { scenario: 'If weather unfavorable', outcome: 'Forecast would be +8% instead of +15%', probability: 0.15 },
      { scenario: 'If competitor maintains inventory', outcome: 'Forecast would be +12%', probability: 0.25 }
    ],
    compliance: [
      { regulation: 'Demand forecast audit trail', status: 'compliant' },
      { regulation: 'Algorithmic transparency (EU AI Act)', status: 'compliant' }
    ]
  },
  procurement: {
    decision: "Switch 30% volume from ChemCorp to GreenMfg",
    confidence: 0.91,
    neuralInsights: [
      { type: 'risk', description: 'ChemCorp financial indicators deteriorating (debt/EBITDA 78%)', weight: 0.40 },
      { type: 'performance', description: 'GreenMfg OTIF improved to 98.5% over last 6 months', weight: 0.30 },
      { type: 'cost', description: 'GreenMfg offering 12% volume discount for commitment', weight: 0.20 },
      { type: 'sustainability', description: 'GreenMfg ESG score 15 points higher', weight: 0.10 }
    ],
    symbolicRules: [
      { rule: 'IF supplier_debt_ratio > 70% THEN diversify_immediately', status: 'satisfied', impact: 'critical' },
      { rule: 'IF alternative_supplier_otif > 97% AND cost_delta < 15% THEN approve_switch', status: 'satisfied', impact: 'high' },
      { rule: 'IF ESG_improvement > 10_points THEN sustainability_bonus', status: 'satisfied', impact: 'medium' },
      { rule: 'IF volume_shift > 50% THEN require_board_approval', status: 'not_triggered', impact: 'governance' }
    ],
    counterfactuals: [
      { scenario: 'If GreenMfg OTIF drops below 95%', outcome: 'Would maintain ChemCorp at 50%', probability: 0.10 },
      { scenario: 'If ChemCorp improves financials', outcome: 'Would reduce switch to 15%', probability: 0.08 }
    ],
    compliance: [
      { regulation: 'Supplier diversity requirements', status: 'compliant' },
      { regulation: 'Conflict minerals disclosure', status: 'compliant' },
      { regulation: 'Modern slavery due diligence', status: 'in_review' }
    ]
  },
  logistics: {
    decision: "Quantum-optimized routes: 28.4% efficiency gain",
    confidence: 0.97,
    neuralInsights: [
      { type: 'optimization', description: 'QAOA solver found global optimum in 4.2 minutes', weight: 0.45 },
      { type: 'constraint', description: 'All delivery windows satisfied with 2hr buffer', weight: 0.25 },
      { type: 'cost', description: 'Fuel consumption reduced by 18.5%', weight: 0.20 },
      { type: 'carbon', description: 'CO2 emissions reduced by 22 tons/week', weight: 0.10 }
    ],
    symbolicRules: [
      { rule: 'IF quantum_solution_quality > classical_baseline + 20% THEN use_quantum', status: 'satisfied', impact: 'high' },
      { rule: 'IF all_delivery_windows_met THEN solution_feasible', status: 'satisfied', impact: 'critical' },
      { rule: 'IF carbon_reduction > 15% THEN sustainability_target_met', status: 'satisfied', impact: 'medium' },
      { rule: 'IF driver_hours > legal_limit THEN reject_solution', status: 'not_triggered', impact: 'compliance' }
    ],
    counterfactuals: [
      { scenario: 'Classical solver only', outcome: 'Would achieve 8-10% efficiency (24hr solve time)', probability: 1.0 },
      { scenario: 'If 2 vehicles unavailable', outcome: 'Efficiency would drop to 22%', probability: 0.12 }
    ],
    compliance: [
      { regulation: 'Driver hours regulation (DOT)', status: 'compliant' },
      { regulation: 'Vehicle emissions standards', status: 'compliant' },
      { regulation: 'Hazmat routing requirements', status: 'compliant' }
    ]
  },
  risk: {
    decision: "Flag ChemCorp: 6-month failure risk at 72%",
    confidence: 0.89,
    neuralInsights: [
      { type: 'financial', description: 'Altman Z-score dropped to 1.2 (distress zone)', weight: 0.35 },
      { type: 'payment', description: 'Days payable outstanding increased 40% in 6 months', weight: 0.25 },
      { type: 'market', description: 'Credit default swap spreads widened significantly', weight: 0.25 },
      { type: 'operational', description: 'Key management departures (CFO, COO)', weight: 0.15 }
    ],
    symbolicRules: [
      { rule: 'IF altman_z < 1.8 THEN high_bankruptcy_risk', status: 'satisfied', impact: 'critical' },
      { rule: 'IF dpo_increase > 30% AND revenue_decline THEN cash_flow_crisis', status: 'satisfied', impact: 'high' },
      { rule: 'IF cds_spread > industry_avg * 2 THEN market_distrust', status: 'satisfied', impact: 'high' },
      { rule: 'IF key_exec_departures > 2 THEN governance_concern', status: 'satisfied', impact: 'medium' }
    ],
    counterfactuals: [
      { scenario: 'If capital injection received', outcome: 'Risk would drop to 35%', probability: 0.15 },
      { scenario: 'If debt restructured', outcome: 'Risk would drop to 45%', probability: 0.20 }
    ],
    compliance: [
      { regulation: 'Supplier risk disclosure (SOX)', status: 'compliant' },
      { regulation: 'Supply chain due diligence', status: 'compliant' }
    ]
  },
  orchestrator: {
    decision: "Pareto solution: Diversify to Mexico + Taiwan backup",
    confidence: 0.96,
    neuralInsights: [
      { type: 'conflict', description: 'Procurement wants cost optimization vs Risk wants diversification', weight: 0.30 },
      { type: 'tradeoff', description: 'Mexico: +20% cost but -60% geopolitical risk', weight: 0.30 },
      { type: 'optimization', description: 'Multi-objective optimization found 3 Pareto-optimal solutions', weight: 0.25 },
      { type: 'consensus', description: 'All agents agree on hybrid approach', weight: 0.15 }
    ],
    symbolicRules: [
      { rule: 'IF agent_conflict THEN invoke_pareto_analysis', status: 'satisfied', impact: 'critical' },
      { rule: 'IF cost_increase < 25% AND risk_reduction > 50% THEN approve_tradeoff', status: 'satisfied', impact: 'high' },
      { rule: 'IF all_agents_consensus THEN fast_track_execution', status: 'satisfied', impact: 'medium' },
      { rule: 'IF strategic_shift > $10M_impact THEN escalate_to_human', status: 'not_triggered', impact: 'governance' }
    ],
    counterfactuals: [
      { scenario: 'If Taiwan tensions escalate', outcome: 'Would shift 100% to Mexico', probability: 0.20 },
      { scenario: 'If Mexico tariffs imposed', outcome: 'Would maintain Taiwan-heavy', probability: 0.15 }
    ],
    compliance: [
      { regulation: 'Board reporting on major decisions', status: 'compliant' },
      { regulation: 'Anti-trust coordination rules', status: 'compliant' }
    ]
  }
};

const StatusBadge = ({ status }) => {
  const config = {
    satisfied: { color: '#00FF41', icon: CheckCircle, label: 'SATISFIED' },
    not_triggered: { color: '#A1A1AA', icon: Info, label: 'NOT TRIGGERED' },
    violated: { color: '#FF003C', icon: AlertTriangle, label: 'VIOLATED' },
    compliant: { color: '#00FF41', icon: CheckCircle, label: 'COMPLIANT' },
    in_review: { color: '#FFB800', icon: AlertTriangle, label: 'IN REVIEW' }
  };
  
  const { color, icon: Icon, label } = config[status] || config.not_triggered;
  
  return (
    <span 
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase"
      style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}
    >
      <Icon size={10} />
      {label}
    </span>
  );
};

const ImpactBadge = ({ impact }) => {
  const colors = {
    critical: '#FF003C',
    high: '#FFB800',
    medium: '#00F0FF',
    low: '#A1A1AA',
    governance: '#64748B',
    compliance: '#00FF41'
  };
  
  return (
    <span 
      className="px-2 py-0.5 rounded text-[10px] font-mono uppercase"
      style={{ backgroundColor: `${colors[impact]}15`, color: colors[impact], border: `1px solid ${colors[impact]}30` }}
    >
      {impact}
    </span>
  );
};

const ReasoningTrace = ({ agentType, trace }) => {
  const [expandedSections, setExpandedSections] = useState(['neural', 'symbolic']);
  
  const toggleSection = (section) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="space-y-4">
      {/* Decision Summary */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-cyan-400 uppercase mb-1">Agent Decision</p>
            <p className="text-lg font-heading font-bold text-white">{trace.decision}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-white/40 uppercase">Confidence</p>
            <p className="text-2xl font-mono font-bold text-cyan-400">{(trace.confidence * 100).toFixed(0)}%</p>
          </div>
        </div>
        <Progress value={trace.confidence * 100} className="h-1 mt-3 bg-white/10" />
      </div>

      {/* Neural Insights */}
      <div className="rounded-lg border border-white/10 overflow-hidden">
        <button
          onClick={() => toggleSection('neural')}
          className="w-full flex items-center justify-between p-3 bg-black/30 hover:bg-black/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-white/60" />
            <span className="font-mono text-sm text-white/80">Neural Network Insights</span>
            <span className="text-xs font-mono text-white/40">({trace.neuralInsights.length} patterns)</span>
          </div>
          {expandedSections.includes('neural') ? <ChevronDown size={16} className="text-white/40" /> : <ChevronRight size={16} className="text-white/40" />}
        </button>
        {expandedSections.includes('neural') && (
          <div className="p-3 space-y-2 bg-black/20">
            {trace.neuralInsights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-3 p-2 rounded bg-white/5">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-white/60 uppercase">{insight.type}</span>
                    <span className="text-xs font-mono text-white/30">weight: {(insight.weight * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-sm text-white/80">{insight.description}</p>
                </div>
                <div className="w-16">
                  <Progress value={insight.weight * 100} className="h-1 bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Symbolic Rules */}
      <div className="rounded-lg border border-white/10 overflow-hidden">
        <button
          onClick={() => toggleSection('symbolic')}
          className="w-full flex items-center justify-between p-3 bg-black/30 hover:bg-black/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Scale size={16} className="text-cyan-400" />
            <span className="font-mono text-sm text-white/80">Symbolic Logic Rules</span>
            <span className="text-xs font-mono text-white/40">({trace.symbolicRules.filter(r => r.status === 'satisfied').length}/{trace.symbolicRules.length} active)</span>
          </div>
          {expandedSections.includes('symbolic') ? <ChevronDown size={16} className="text-white/40" /> : <ChevronRight size={16} className="text-white/40" />}
        </button>
        {expandedSections.includes('symbolic') && (
          <div className="p-3 space-y-2 bg-black/20">
            {trace.symbolicRules.map((rule, idx) => (
              <div key={idx} className="p-2 rounded bg-white/5">
                <div className="flex items-center justify-between mb-1">
                  <StatusBadge status={rule.status} />
                  <ImpactBadge impact={rule.impact} />
                </div>
                <p className="font-mono text-xs text-white/70 mt-2">{rule.rule}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Counterfactuals */}
      <div className="rounded-lg border border-white/10 overflow-hidden">
        <button
          onClick={() => toggleSection('counterfactual')}
          className="w-full flex items-center justify-between p-3 bg-black/30 hover:bg-black/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Lightbulb size={16} className="text-yellow-400" />
            <span className="font-mono text-sm text-white/80">Counterfactual Analysis</span>
            <span className="text-xs font-mono text-white/40">(what-if scenarios)</span>
          </div>
          {expandedSections.includes('counterfactual') ? <ChevronDown size={16} className="text-white/40" /> : <ChevronRight size={16} className="text-white/40" />}
        </button>
        {expandedSections.includes('counterfactual') && (
          <div className="p-3 space-y-2 bg-black/20">
            {trace.counterfactuals.map((cf, idx) => (
              <div key={idx} className="p-2 rounded bg-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-yellow-400">{cf.scenario}</span>
                  <span className="text-xs font-mono text-white/40">{(cf.probability * 100).toFixed(0)}% likely</span>
                </div>
                <p className="text-sm text-white/70">{cf.outcome}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compliance */}
      <div className="rounded-lg border border-white/10 overflow-hidden">
        <button
          onClick={() => toggleSection('compliance')}
          className="w-full flex items-center justify-between p-3 bg-black/30 hover:bg-black/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-400" />
            <span className="font-mono text-sm text-white/80">Regulatory Compliance</span>
            <span className="text-xs font-mono text-white/40">({trace.compliance.filter(c => c.status === 'compliant').length}/{trace.compliance.length} compliant)</span>
          </div>
          {expandedSections.includes('compliance') ? <ChevronDown size={16} className="text-white/40" /> : <ChevronRight size={16} className="text-white/40" />}
        </button>
        {expandedSections.includes('compliance') && (
          <div className="p-3 space-y-2 bg-black/20">
            {trace.compliance.map((comp, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded bg-white/5">
                <span className="text-sm text-white/70">{comp.regulation}</span>
                <StatusBadge status={comp.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const NeuroSymbolicEngine = ({ activeAgent }) => {
  const [selectedAgent, setSelectedAgent] = useState(activeAgent || 'orchestrator');
  const agents = ['demand', 'procurement', 'logistics', 'risk', 'orchestrator'];

  return (
    <div data-testid="neuro-symbolic-engine" className="nexus-widget">
      <div className="widget-header mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/30">
            <Brain size={18} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="widget-title">Neuro-Symbolic Reasoning Engine</h3>
            <p className="text-xs font-mono text-white/40">Explainable AI decisions • Layer 5</p>
          </div>
        </div>
        <span className="widget-badge bg-gradient-to-r from-cyan-500/10 to-transparent border-cyan-500/30">
          SOTA
        </span>
      </div>

      {/* Agent Selector */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {agents.map(agent => (
          <button
            key={agent}
            onClick={() => setSelectedAgent(agent)}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase whitespace-nowrap transition-all ${
              selectedAgent === agent
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/30'
            }`}
          >
            {agent}
          </button>
        ))}
      </div>

      {/* Reasoning Trace */}
      <ScrollArea className="h-[500px]">
        <div className="pr-4">
          <ReasoningTrace 
            agentType={selectedAgent} 
            trace={REASONING_TRACES[selectedAgent]} 
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default NeuroSymbolicEngine;
