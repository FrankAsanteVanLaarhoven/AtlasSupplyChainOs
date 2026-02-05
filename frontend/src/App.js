import React, { useState, useEffect, useCallback, Suspense, Component } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

// Error boundary for 3D components
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('3D Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-white/50 bg-black/30 rounded-lg border border-white/10">
          <p className="font-mono text-sm">3D visualization unavailable</p>
          <p className="text-xs mt-2">WebGL might not be supported in this environment</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Components
import MatrixBackground from './components/MatrixBackground';
import CommandInterface from './components/CommandInterface';
import AgentCard from './components/AgentCard';
import MetricsWidget from './components/MetricsWidget';
import BlockchainLedger from './components/BlockchainLedger';
import QuantumVisualizer from './components/QuantumVisualizer';
import RiskAlerts from './components/RiskAlerts';
import LogisticsMap from './components/LogisticsMap';
import SupplierNetwork from './components/SupplierNetwork';
import NeuroSymbolicEngine from './components/NeuroSymbolicEngine';
import ScenarioPlanner from './components/ScenarioPlanner';
import ContractIntelligence from './components/ContractIntelligence';
import DecisionTimeline from './components/DecisionTimeline';
import DemoWalkthrough from './components/DemoWalkthrough';
import DigitalTwin from './components/DigitalTwin';
import MarketDataDashboard from './components/MarketDataDashboard';
import cyberSound from './utils/CyberSoundEngine';
import SoundToggle from './components/SoundToggle';

// Initialize sound
import EmbodiedAI from './components/EmbodiedAI';
import SixGEdge from './components/SixGEdge';
import BlockchainMainnet from './components/BlockchainMainnet';
import ChessBI from './components/ChessBI';
// DemoMode and MockERPWMS kept in codebase but hidden from Series A demo
// import DemoMode from './components/DemoMode';
// import MockERPWMS from './components/MockERPWMS';

// Lazy load WorldModel3D to prevent blocking the app
const WorldModel3D = React.lazy(() => import('./components/WorldModel3D'));

// Hooks
import { useWebSocket } from './hooks/useWebSocket';

// Data
import { REAL_CUSTOMER_DATA } from './data/customerData';

import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CommandCenter = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [uiComponents, setUiComponents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  // Demo mode disabled for Series A - will use manual walkthrough
  // const [demoModeActive, setDemoModeActive] = useState(false);
  
  // WebSocket for real-time updates
  const { isConnected, agentUpdates, lastUpdate } = useWebSocket();

  // Fetch initial agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await axios.get(`${API}/agents`);
        setAgents(res.data);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
        toast.error('Failed to connect to ATLAS backend');
      }
    };
    fetchAgents();
  }, []);

  // Update agents from WebSocket
  useEffect(() => {
    if (agentUpdates && Object.keys(agentUpdates).length > 0) {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        ...agentUpdates[agent.type]
      })));
    }
  }, [agentUpdates]);

  // WebSocket for real-time updates
  useEffect(() => {
    let ws;
    const wsUrl = BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    
    const connectWs = () => {
      try {
        ws = new WebSocket(`${wsUrl}/api/ws`);
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'agent_update' && data.agents) {
              setAgents(prev => prev.map(agent => ({
                ...agent,
                ...data.agents[agent.type]
              })));
            }
          } catch (e) {
            console.error('WS parse error:', e);
          }
        };

        ws.onerror = () => console.log('WebSocket connection not available');
        ws.onclose = () => setTimeout(connectWs, 5000);
      } catch (error) {
        console.log('WebSocket not supported');
      }
    };

    connectWs();
    return () => { if (ws) ws.close(); };
  }, []);

  // Handle command submission
  const handleCommand = useCallback(async (command) => {
    setIsLoading(true);
    setResponse('');
    
    try {
      const res = await axios.post(`${API}/command`, {
        command,
        session_id: sessionId
      });
      
      setResponse(res.data.response);
      setUiComponents(res.data.ui_components);
      
      // Play success sound
      cyberSound.playSuccess();
      
      // If there's agent activity, highlight it
      if (res.data.agent_activity) {
        setSelectedAgent(res.data.agent_activity.type);
        toast.success(`${res.data.agent_activity.name} activated`);
      }
      
    } catch (error) {
      console.error('Command error:', error);
      setResponse('Failed to process command. Please try again.');
      toast.error('Command processing failed');
      cyberSound.playGlitch();
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Render dynamic UI components based on response
  const renderDynamicContent = () => {
    if (uiComponents.length === 0) {
      return (
        <div className="empty-state fade-in">
          <div className="text-6xl mb-4 opacity-20">⎔</div>
          <p className="font-heading text-xl text-white/30 uppercase tracking-widest mb-2">
            ATLAS Ready
          </p>
          <p className="empty-state-text">
            Autonomous supply chain intelligence at your command.
            Try "Show system status", "Risk assessment", "Optimize routes", or "Show digital twin".
          </p>
        </div>
      );
    }

    return (
      <div className="dynamic-content">
        {uiComponents.map((component, index) => {
          const delay = `delay-${Math.min(index + 1, 5)}`;
          
          switch (component.type) {
            case 'agents':
              return (
                <div key="agents" className={`widget-full slide-up ${delay}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {component.data.map((agent) => (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        isExpanded={true}
                        onClick={() => setSelectedAgent(selectedAgent === agent.type ? null : agent.type)}
                      />
                    ))}
                  </div>
                </div>
              );
              
            case 'metrics':
              return (
                <div key="metrics" className={`widget-full slide-up ${delay}`}>
                  <MetricsWidget metrics={component.data} />
                </div>
              );
              
            case 'blockchain':
              return (
                <div key="blockchain" className={`widget-full slide-up ${delay}`}>
                  <BlockchainLedger transactions={component.data} />
                </div>
              );
              
            case 'quantum':
              return (
                <div key="quantum" className={`widget-full slide-up ${delay}`}>
                  <QuantumVisualizer optimizations={component.data} />
                </div>
              );
              
            case 'risk_alerts':
              return (
                <div key="risk_alerts" className={`widget-full slide-up ${delay}`}>
                  <RiskAlerts alerts={component.data} />
                </div>
              );
              
            case 'supplier_network':
              return (
                <div key="supplier_network" className={`widget-full slide-up ${delay}`}>
                  <SupplierNetwork networkData={component.data} />
                </div>
              );
              
            case 'map':
              return (
                <div key="map" className={`widget-full slide-up ${delay}`}>
                  <LogisticsMap mapData={component.data} />
                </div>
              );

            case 'supplier_network_graph':
              return (
                <div key="supplier_network_graph" className={`widget-full slide-up ${delay}`}>
                  <SupplierNetwork networkData={component.data} />
                </div>
              );

            case 'neuro_symbolic':
              return (
                <div key="neuro_symbolic" className={`widget-full slide-up ${delay}`}>
                  <NeuroSymbolicEngine activeAgent={component.data?.agent} />
                </div>
              );

            case 'scenario_planner':
              return (
                <div key="scenario_planner" className={`widget-full slide-up ${delay}`}>
                  <ScenarioPlanner />
                </div>
              );

            case 'contracts':
              return (
                <div key="contracts" className={`widget-full slide-up ${delay}`}>
                  <ContractIntelligence />
                </div>
              );

            case 'timeline':
              return (
                <div key="timeline" className={`widget-full slide-up ${delay}`}>
                  <DecisionTimeline />
                </div>
              );

            case 'world_model':
              return (
                <div key="world_model" className={`widget-full slide-up ${delay}`}>
                  <DigitalTwin />
                </div>
              );

            case 'digital_twin':
              return (
                <div key="digital_twin" className={`widget-full slide-up ${delay}`}>
                  <DigitalTwin />
                </div>
              );

            case 'demo':
              return (
                <div key="demo" className={`widget-full slide-up ${delay}`}>
                  <DemoWalkthrough />
                </div>
              );

            case 'market_data':
              return (
                <div key="market_data" className={`widget-full slide-up ${delay}`}>
                  <MarketDataDashboard />
                </div>
              );

            case 'embodied_ai':
            case 'robotics':
              // Hidden for Series A - Phase 4+ feature
              return null;

            case 'sixg_edge':
            case 'edge':
              // Hidden for Series A - Phase 4+ feature
              return null;

            case 'blockchain_mainnet':
            case 'mainnet':
              // Hidden for Series A - Phase 5+ feature
              // Show simple settlement card instead
              return (
                <div key="blockchain_simple" className={`widget-half slide-up ${delay}`}>
                  <div className="nexus-widget">
                    <div className="widget-header mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                        </div>
                        <div>
                          <h3 className="widget-title">Smart Contract Settlement</h3>
                          <p className="text-xs font-mono text-white/40">Automated Performance Bonuses</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-black/30 border border-white/10 mb-4">
                      <p className="text-sm text-white/70 mb-3">Performance-based settlement automation:</p>
                      <ul className="space-y-2 text-xs text-white/60">
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400"></span>
                          OTIF &gt; 99.5% → Automatic bonus release
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                          OTIF 95-99.5% → Standard payment
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-400"></span>
                          OTIF &lt; 95% → Penalty deduction
                        </li>
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 rounded bg-black/20 border border-white/5">
                        <p className="text-2xl font-mono font-bold text-green-400">85%</p>
                        <p className="text-xs text-white/40">Auto-Settled</p>
                      </div>
                      <div className="p-3 rounded bg-black/20 border border-white/5">
                        <p className="text-2xl font-mono font-bold text-cyan-400">2hr</p>
                        <p className="text-xs text-white/40">Dispute Resolution</p>
                      </div>
                    </div>
                  </div>
                </div>
              );

            case 'chess_bi':
            case 'strategy':
            case 'game_theory':
              // Hidden for Series A - Phase 4+ feature
              return null;

            case 'erp_wms':
            case 'erp':
            case 'wms':
            case 'inventory':
            case 'orders':
              // Hidden for Series A - different story
              return null;
              
            default:
              return null;
          }
        })}
      </div>
    );
  };

  return (
    <div className="atlas-app">
      <MatrixBackground />
      
      <div className="command-center relative z-10">
        {/* Header */}
        <header className="atlas-header" data-testid="atlas-header">
          <div className="flex items-center gap-3">
            <h1 className="atlas-logo">ATLAS</h1>
            <span className="text-xs font-mono text-white/30 hidden sm:inline">Supply Chain OS</span>
          </div>
          <div className="flex items-center gap-3">
            <SoundToggle />
            <div className="atlas-status" data-testid="atlas-status">
              <span className="status-dot" />
              <span>System Online</span>
            </div>
          </div>
        </header>

        {/* Agent Status Bar */}
        <div className="agent-status-bar" data-testid="agent-status-bar">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isExpanded={false}
              onClick={() => handleCommand(`Show ${agent.type} agent status`)}
            />
          ))}
        </div>

        {/* Command Interface */}
        <CommandInterface
          onCommand={handleCommand}
          isLoading={isLoading}
          response={response}
        />

        {/* Dynamic Content Area */}
        <div className="flex-1 mt-6" data-testid="dynamic-content-area">
          {renderDynamicContent()}
        </div>

        {/* Footer */}
        <footer className="atlas-footer" data-testid="atlas-footer">
          <p className="footer-text">
            ATLAS Supply Chain OS • Autonomous AI Agents • Quantum Optimization
          </p>
        </footer>
      </div>
      
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CommandCenter />} />
        <Route path="*" element={<CommandCenter />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
