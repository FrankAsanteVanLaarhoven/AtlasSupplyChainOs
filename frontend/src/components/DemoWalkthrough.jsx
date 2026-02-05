import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, ChevronRight, CheckCircle, Clock, Video, Mic, Volume2, Download, Share2, Maximize } from 'lucide-react';
import { Progress } from '../components/ui/progress';

// 12-minute investor demo sections
const DEMO_SECTIONS = [
  {
    id: 'intro',
    title: 'Executive Overview',
    duration: '1:30',
    durationSec: 90,
    description: 'ATLAS - Autonomous Supply Chain Intelligence',
    script: `Welcome to ATLAS Supply Chain OS — the world's first fully autonomous supply chain management platform.

We're solving a $50 billion problem: enterprise supply chains are still managed through spreadsheets, manual interventions, and reactive crisis management. 94% of Fortune 500 companies experienced supply chain disruptions in the past year, costing an average of $180M per incident.

ATLAS changes everything. We deploy 5 specialized AI agents that work 24/7, making over 89 autonomous decisions per day without human intervention. These agents don't just automate — they think, learn, and optimize continuously.

What you'll see in the next 12 minutes:
• How our AI agents coordinate in real-time
• Quantum computing advantage delivering 28% efficiency gains
• Full explainability for board-level governance
• Real results: $2.4M saved in 4 months with our pilot customer`,
    highlights: ['$50B market opportunity', '94% of F500 affected', '89 autonomous decisions/day'],
    command: 'show status'
  },
  {
    id: 'agents',
    title: 'Autonomous AI Agents',
    duration: '2:00',
    durationSec: 120,
    description: 'Five specialized agents running your supply chain',
    script: `ATLAS deploys five autonomous AI agents, each an expert in their domain:

1. DEMAND FORECASTER — Uses transformer models trained on social signals, weather patterns, economic indicators, and historical data. Achieves 94.2% accuracy with 90-day forecast horizon, covering 12,500+ SKUs.

2. PROCUREMENT OPTIMIZER — Autonomously negotiates with suppliers using game-theoretic strategies. Has achieved 12% average cost reduction and evaluates 156+ suppliers continuously.

3. LOGISTICS ROUTER — The crown jewel. Uses quantum-classical hybrid algorithms to solve vehicle routing problems in 4.2 minutes that take classical computers 24+ hours. 1,247 routes optimized daily.

4. RISK SENTINEL — Predicts supplier failures 6+ months in advance with 89.4% accuracy. Currently monitoring 847 suppliers across 4 tiers, with 3 active high-priority alerts.

5. ATLAS ORCHESTRATOR — The conductor. Resolves conflicts between agents, ensures Pareto-optimal outcomes, and maintains 99.8% agent synchronization rate.

These agents don't operate in silos — they communicate, negotiate, and coordinate in real-time.`,
    highlights: ['94.2% forecast accuracy', '4.2 min quantum routing', '89.4% risk prediction'],
    command: 'show agents'
  },
  {
    id: 'quantum',
    title: 'Quantum Computing Advantage',
    duration: '1:30',
    durationSec: 90,
    description: '28% efficiency gain through quantum optimization',
    script: `Let me show you where quantum computing delivers real business value.

Traditional supply chain optimization uses heuristic algorithms — genetic algorithms, simulated annealing. These methods produce "good enough" solutions after 24+ hours of computation. For a 200-node vehicle routing problem, classical methods might find a solution that's 15-20% suboptimal.

ATLAS uses QAOA — Quantum Approximate Optimization Algorithm — in a hybrid configuration:
• Problems are decomposed into 50-node clusters
• Each cluster is solved on quantum hardware in parallel
• Classical algorithms stitch optimal cluster solutions together

Results:
• 200-node problems solved in 4.2 minutes (vs 24 hours)
• Solutions are 28.4% more efficient than classical
• Real savings: 18.5% fuel reduction, 22 tons/week carbon reduction

This isn't theoretical. We're running this in production today. The ROI on quantum computing for supply chain is here, now.`,
    highlights: ['4.2 min vs 24 hours', '28.4% better efficiency', '18.5% fuel savings'],
    command: 'show quantum'
  },
  {
    id: 'digital-twin',
    title: 'Digital Twin & Simulation',
    duration: '1:30',
    durationSec: 90,
    description: 'Physics-based supply chain simulation',
    script: `ATLAS maintains a real-time digital twin of your entire supply chain — a physics-based simulation that models inventory dynamics, demand propagation, and cascade effects.

Watch what happens when we simulate a demand spike at one of our retail nodes. The system immediately:
• Calculates inventory drawdown rates
• Identifies which suppliers need to ramp production
• Predicts cash flow implications
• Suggests optimal responses

This isn't just visualization — it's predictive physics. We model:
• Lead times with stochastic variation
• Transportation constraints and delays
• Supplier capacity limits
• Working capital implications

When a disruption hits, you don't scramble. You already have three pre-computed response strategies ready to execute.

Click any node to trigger a simulation and watch the cascade effects propagate through your network in real-time.`,
    highlights: ['Real-time physics simulation', 'Cascade effect modeling', 'Pre-computed responses'],
    command: 'show digital twin'
  },
  {
    id: 'explainability',
    title: 'Neuro-Symbolic Reasoning',
    duration: '1:15',
    durationSec: 75,
    description: 'Full explainability for enterprise governance',
    script: `Enterprise adoption of AI requires trust, and trust requires explainability.

Every decision ATLAS makes is fully traceable through our neuro-symbolic reasoning engine:

NEURAL COMPONENT:
• Pattern recognition for demand signals
• Risk indicator identification
• Anomaly detection in supplier behavior

SYMBOLIC COMPONENT:
• Business rules enforcement (min order quantities, preferred suppliers)
• Regulatory compliance (tariffs, labor laws, ESG requirements)
• Policy constraints (budget limits, approval thresholds)

COUNTERFACTUAL ANALYSIS:
• "What would have happened if we'd chosen Supplier B?"
• "How would costs change with 10% higher demand?"

When your CFO asks "Why did we switch suppliers?", ATLAS shows:
• Neural confidence scores
• Compliance rule satisfaction
• Cost-benefit analysis
• Risk assessment delta

Every decision has a complete audit trail, ready for board review or regulatory inspection.`,
    highlights: ['Full audit trail', 'Regulatory compliance', 'Board-ready explanations'],
    command: 'explain decisions'
  },
  {
    id: 'scenarios',
    title: 'Scenario Planning',
    duration: '1:15',
    durationSec: 75,
    description: 'What-if analysis for strategic planning',
    script: `ATLAS doesn't just react to disruptions — it anticipates them.

Our Counterfactual Scenario Planner runs 1,000+ simulations every night:

SUPPLIER RISK SCENARIOS:
• What if ChemCorp (our highest-risk supplier) fails?
• Cascade: 23 downstream products affected, $12M revenue at risk
• Pre-built mitigation: Secondary supplier already qualified, 72-hour activation

GEOPOLITICAL SCENARIOS:
• What if Taiwan Strait tensions escalate?
• Impact: 40% of semiconductor supply disrupted
• Mitigation: Mexico nearshoring strategy, 6-month inventory buffer

DEMAND SHOCK SCENARIOS:
• What if demand spikes 40% next quarter?
• Current capacity utilization would hit 127%
• Pre-negotiated surge capacity with 3 suppliers

For each scenario, you see:
• Probability assessment
• Financial impact (P&L, cash flow, working capital)
• Recommended actions with execution timelines
• Recovery time projections

You make strategic decisions with full consequence visibility.`,
    highlights: ['1000+ scenarios nightly', 'Pre-built mitigation plans', 'Full financial modeling'],
    command: 'show scenarios'
  },
  {
    id: 'blockchain',
    title: 'Blockchain Settlement',
    duration: '1:00',
    durationSec: 60,
    description: 'Smart contracts for automated settlement',
    script: `ATLAS integrates blockchain-based smart contracts for trustless supplier relationships.

HOW IT WORKS:
• Performance metrics automatically verified on-chain
• Payment triggers execute without human intervention
• All parties see identical, immutable records

EXAMPLE CONTRACT:
"If OTIF > 99.5% AND defect rate < 0.5%, release $50K performance bonus within 24 hours"

RESULTS:
• 85% of payments processed automatically
• Dispute resolution time: 2 hours (was 2 weeks)
• Supplier trust scores up 40%
• Audit costs reduced 60%

We're currently running on Ethereum Sepolia testnet, with mainnet deployment planned for Q2.

The blockchain isn't about cryptocurrency — it's about creating a shared source of truth that eliminates disputes and builds trust across your entire supplier network.`,
    highlights: ['85% auto-settlement', '60% audit cost reduction', 'Trustless verification'],
    command: 'show blockchain'
  },
  {
    id: 'results',
    title: 'Proven Results',
    duration: '1:30',
    durationSec: 90,
    description: 'Real metrics from our pilot customer',
    script: `Let me share concrete results from our 4-month pilot with a Fortune 500 electronics manufacturer:

COST SAVINGS: $2.4M YTD
• Procurement: $1.2M (12% supplier cost reduction)
• Logistics: $800K (18.5% fuel savings, route optimization)
• Risk avoidance: $400K (prevented 2 supplier disruptions)

OPERATIONAL METRICS:
• On-time delivery: 99.2% (up from 96.1%)
• Forecast accuracy: 94.2% (up from 78%)
• Routes optimized: 1,247 (quantum-accelerated)
• Suppliers managed: 847 (autonomously)

EFFICIENCY GAINS:
• Decisions per day: 89 (zero human intervention)
• Average decision time: 2.3 minutes (was 4+ hours)
• Conflict resolution: 12 Pareto-optimal solutions found

RISK PREVENTION:
• 3 high-severity alerts raised
• $4.2M+ in disruptions prevented
• 6-month advance warning on ChemCorp risk

These results are reproducible. We can deliver the same for your supply chain within 90 days.`,
    highlights: ['$2.4M saved in 4 months', '99.2% OTIF', '300-500% projected ROI'],
    command: 'show metrics'
  },
  {
    id: 'cta',
    title: 'Investment Opportunity',
    duration: '1:00',
    durationSec: 60,
    description: 'Series A: $25M at $100M valuation',
    script: `ATLAS is raising a $25M Series A to accelerate growth.

MARKET OPPORTUNITY:
• $50B supply chain software market
• 15% CAGR through 2028
• Only 8% of enterprises have autonomous capabilities

BUSINESS MODEL:
• Platform fee: $500K-$2M/year per enterprise
• Quantum compute: Usage-based pricing
• Success fee: 10% of documented savings

TRACTION:
• 1 Fortune 500 pilot customer (converting to paid)
• 3 additional enterprises in pipeline ($4.5M ARR potential)
• $2.4M savings demonstrated in 4 months

USE OF FUNDS:
• 50%: Engineering (quantum R&D, agent expansion)
• 30%: Sales (enterprise sales team, customer success)
• 20%: Operations (compliance, infrastructure)

TEAM:
• Founded by ex-McKinsey supply chain partners
• CTO from Google DeepMind
• Quantum team from IBM Research

We're building the Palantir of supply chain. Join us.`,
    highlights: ['$25M Series A', '$100M valuation', '$585M ARR target by 2028'],
    command: 'show demo'
  }
];

const DemoSection = ({ section, isActive, isCompleted, onPlay, index }) => {
  return (
    <div 
      className={`p-3 rounded-lg border transition-all cursor-pointer ${
        isActive 
          ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.15)]' 
          : isCompleted
            ? 'bg-green-500/5 border-green-500/30'
            : 'bg-black/30 border-white/10 hover:border-white/30'
      }`}
      onClick={onPlay}
    >
      <div className="flex items-start gap-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${
          isActive ? 'bg-cyan-500/30 text-cyan-400' : isCompleted ? 'bg-green-500/30 text-green-400' : 'bg-white/10 text-white/40'
        }`}>
          {isCompleted ? <CheckCircle size={12} /> : index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`font-heading text-xs font-semibold truncate ${isActive ? 'text-cyan-400' : 'text-white/80'}`}>
              {section.title}
            </h4>
            <span className="font-mono text-[10px] text-white/40 shrink-0">{section.duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const DemoWalkthrough = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSections, setCompletedSections] = useState(new Set());
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  const totalDuration = '12:00';
  const totalSeconds = DEMO_SECTIONS.reduce((acc, s) => acc + s.durationSec, 0);
  const completedSeconds = DEMO_SECTIONS.slice(0, currentSection).reduce((acc, s) => acc + s.durationSec, 0) + elapsedTime;
  const progress = (completedSeconds / totalSeconds) * 100;

  // Timer effect
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => {
          if (prev >= DEMO_SECTIONS[currentSection].durationSec) {
            // Auto-advance to next section
            if (currentSection < DEMO_SECTIONS.length - 1) {
              setCompletedSections(p => new Set([...p, currentSection]));
              setCurrentSection(c => c + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return prev;
            }
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, currentSection]);

  const handlePlay = (index) => {
    setCurrentSection(index);
    setElapsedTime(0);
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (currentSection < DEMO_SECTIONS.length - 1) {
      setCompletedSections(prev => new Set([...prev, currentSection]));
      setCurrentSection(prev => prev + 1);
      setElapsedTime(0);
    }
  };

  const handlePrev = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
      setElapsedTime(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const activeSection = DEMO_SECTIONS[currentSection];
  const sectionProgress = (elapsedTime / activeSection.durationSec) * 100;

  return (
    <div data-testid="demo-walkthrough" className="nexus-widget">
      <div className="widget-header mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
            <Video size={18} className="text-red-400" />
          </div>
          <div>
            <h3 className="widget-title">Investor Demo Walkthrough</h3>
            <p className="text-xs font-mono text-white/40">12-Minute Series A Pitch • {formatTime(completedSeconds)} / {totalDuration}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded bg-white/5 hover:bg-white/10 transition-colors">
            <Share2 size={14} className="text-white/60" />
          </button>
          <button className="p-2 rounded bg-white/5 hover:bg-white/10 transition-colors">
            <Download size={14} className="text-white/60" />
          </button>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-white/40">Demo Progress</span>
          <span className="text-xs font-mono text-cyan-400">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5 bg-white/10" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Section list */}
        <div className="col-span-1 space-y-1.5 max-h-[500px] overflow-y-auto pr-2">
          {DEMO_SECTIONS.map((section, idx) => (
            <DemoSection
              key={section.id}
              section={section}
              index={idx}
              isActive={idx === currentSection}
              isCompleted={completedSections.has(idx)}
              onPlay={() => handlePlay(idx)}
            />
          ))}
        </div>

        {/* Active section content */}
        <div className="col-span-2">
          <div className="p-5 rounded-lg bg-black/40 border border-white/10 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-400">
                    SECTION {currentSection + 1}/{DEMO_SECTIONS.length}
                  </span>
                  <span className="text-xs font-mono text-white/40">{activeSection.duration}</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-white">{activeSection.title}</h3>
                <p className="text-sm text-white/50 mt-1">{activeSection.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentSection === 0}
                  className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-30"
                >
                  <ChevronRight size={16} className="text-white/60 rotate-180" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`p-3 rounded-full border transition-colors ${
                    isPlaying 
                      ? 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30' 
                      : 'bg-cyan-500/20 border-cyan-500/50 hover:bg-cyan-500/30'
                  }`}
                >
                  {isPlaying ? <Pause size={18} className="text-red-400" /> : <Play size={18} className="text-cyan-400" />}
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentSection >= DEMO_SECTIONS.length - 1}
                  className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-30"
                >
                  <ChevronRight size={16} className="text-white/60" />
                </button>
              </div>
            </div>

            {/* Section Progress */}
            <div className="mb-4">
              <Progress value={sectionProgress} className="h-1 bg-white/5" />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] font-mono text-white/30">{formatTime(elapsedTime)}</span>
                <span className="text-[10px] font-mono text-white/30">{activeSection.duration}</span>
              </div>
            </div>

            {/* Script */}
            <div className="flex-1 mb-4">
              <p className="text-xs font-mono text-white/40 uppercase mb-2 flex items-center gap-2">
                <Mic size={12} /> Narration Script
              </p>
              <div className="p-4 rounded-lg bg-black/30 border border-white/5 h-48 overflow-y-auto">
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
                  {activeSection.script}
                </p>
              </div>
            </div>

            {/* Key highlights */}
            <div>
              <p className="text-xs font-mono text-white/40 uppercase mb-2">Key Talking Points</p>
              <div className="flex flex-wrap gap-2">
                {activeSection.highlights.map((highlight, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-400"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>

            {/* Command Hint */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-white/40">
                💡 Try command: <span className="font-mono text-cyan-400">"{activeSection.command}"</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoWalkthrough;
