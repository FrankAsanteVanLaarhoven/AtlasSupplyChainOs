from fastapi import FastAPI, APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import asyncio
import random
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# LLM Integration
from emergentintegrations.llm.chat import LlmChat, UserMessage

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Create the main app
app = FastAPI(title="ATLAS Supply Chain OS")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ===================== MODELS =====================

class CommandRequest(BaseModel):
    command: str
    session_id: Optional[str] = None

class CommandResponse(BaseModel):
    response: str
    ui_components: List[Dict[str, Any]]
    agent_activity: Optional[Dict[str, Any]] = None
    intent: str

class AgentStatus(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    type: str
    status: str
    confidence: float
    last_action: str
    decisions_today: int
    metrics: Dict[str, Any]
    updated_at: str

class SupplyChainMetrics(BaseModel):
    total_shipments: int
    on_time_delivery: float
    cost_savings: float
    active_suppliers: int
    risk_alerts: int
    quantum_optimizations: int

class BlockchainTransaction(BaseModel):
    id: str
    type: str
    parties: List[str]
    amount: float
    status: str
    timestamp: str
    hash: str

class QuantumOptimization(BaseModel):
    id: str
    problem_type: str
    nodes: int
    vehicles: int
    status: str
    classical_time: str
    quantum_time: str
    improvement: float
    solution: Dict[str, Any]

# ===================== SIMULATED DATA =====================

AGENTS_DATA = {
    "demand": {
        "id": "agent-demand-001",
        "name": "DEMAND FORECASTER",
        "type": "demand",
        "status": "active",
        "confidence": 0.94,
        "last_action": "Updated Q2 demand forecast: +15% variance detected",
        "decisions_today": 47,
        "metrics": {
            "accuracy": 94.2,
            "forecast_horizon": "90 days",
            "sku_coverage": 12500,
            "model": "Fine-tuned GPT-3.5"
        }
    },
    "procurement": {
        "id": "agent-procurement-001",
        "name": "PROCUREMENT OPTIMIZER",
        "type": "procurement",
        "status": "active",
        "confidence": 0.91,
        "last_action": "Negotiated 12% cost reduction with supplier GreenMfg",
        "decisions_today": 23,
        "metrics": {
            "savings_ytd": 2400000,
            "active_rfqs": 8,
            "suppliers_evaluated": 156,
            "model": "Multimodal Claude"
        }
    },
    "logistics": {
        "id": "agent-logistics-001",
        "name": "LOGISTICS ROUTER",
        "type": "logistics",
        "status": "optimizing",
        "confidence": 0.97,
        "last_action": "Quantum-optimized 200 routes in 4.2 minutes",
        "decisions_today": 312,
        "metrics": {
            "routes_optimized": 1247,
            "fuel_saved": 18.5,
            "on_time_rate": 99.2,
            "model": "QAOA Hybrid"
        }
    },
    "risk": {
        "id": "agent-risk-001",
        "name": "RISK SENTINEL",
        "type": "risk",
        "status": "monitoring",
        "confidence": 0.89,
        "last_action": "Flagged ChemCorp Ltd: 78% debt/EBITDA ratio - 6 month failure risk",
        "decisions_today": 15,
        "metrics": {
            "suppliers_monitored": 847,
            "alerts_active": 3,
            "predictions_accuracy": 89.4,
            "model": "Ensemble GNN + LLM"
        }
    },
    "orchestrator": {
        "id": "agent-orchestrator-001",
        "name": "ATLAS ORCHESTRATOR",
        "type": "orchestrator",
        "status": "coordinating",
        "confidence": 0.96,
        "last_action": "Resolved conflict: Procurement vs Risk on Taiwan supplier",
        "decisions_today": 89,
        "metrics": {
            "conflicts_resolved": 12,
            "pareto_solutions": 8,
            "agent_sync_rate": 99.8,
            "model": "Claude Opus"
        }
    }
}

BLOCKCHAIN_TRANSACTIONS = [
    {"id": "tx-001", "type": "payment", "parties": ["ChemCorp Ltd", "ATLAS Corp"], "amount": 125000, "status": "confirmed", "timestamp": "2026-01-15T10:23:45Z", "hash": "0x7f8a...3b2c"},
    {"id": "tx-002", "type": "settlement", "parties": ["GreenMfg", "Logistics Partner A"], "amount": 45000, "status": "pending", "timestamp": "2026-01-15T10:45:12Z", "hash": "0x9c4d...8e1f"},
    {"id": "tx-003", "type": "escrow", "parties": ["Tier-2 Supplier X", "ATLAS Corp"], "amount": 78500, "status": "confirmed", "timestamp": "2026-01-15T09:15:33Z", "hash": "0x2b5e...4a9c"},
]

QUANTUM_OPTIMIZATIONS = [
    {"id": "qopt-001", "problem_type": "VRP", "nodes": 200, "vehicles": 50, "status": "completed", "classical_time": "24h 12m", "quantum_time": "4m 23s", "improvement": 28.4, "solution": {"routes": 50, "total_distance": 12450, "fuel_saved": "18.5%"}},
    {"id": "qopt-002", "problem_type": "TSP", "nodes": 150, "vehicles": 1, "status": "running", "classical_time": "est. 18h", "quantum_time": "est. 3m", "improvement": 0, "solution": {}},
]

# ===================== LLM COMMAND PROCESSOR =====================

async def process_command_with_llm(command: str, session_id: str) -> Dict[str, Any]:
    """Process user command with LLM and determine intent + UI components"""
    
    system_message = """You are ATLAS, the orchestrator of a next-generation autonomous supply chain platform. 
Your role is to understand user intent and respond with both conversational text AND UI component instructions.

You control 5 AI agents:
1. DEMAND AGENT - Forecasting and demand sensing
2. PROCUREMENT AGENT - Sourcing, negotiation, supplier management
3. LOGISTICS AGENT - Route optimization, quantum-enhanced VRP solving
4. RISK AGENT - Supplier risk prediction, geopolitical monitoring
5. ORCHESTRATOR - Cross-agent coordination and conflict resolution

Available UI components to display:
- agents: Show all 5 AI agents with their status
- metrics: Supply chain KPIs (shipments, OTIF, savings)
- blockchain: Transaction ledger and smart contract history
- quantum: Quantum optimization visualization
- map: Interactive logistics map with routes and DCs
- risk_alerts: Risk intelligence and supplier alerts
- supplier_network: D3.js supplier relationship graph
- neuro_symbolic: Explainable AI reasoning traces
- scenario_planner: Counterfactual what-if analysis
- contracts: Smart contract management and builder
- timeline: Decision timeline showing chronological agent decisions with full audit trail
- world_model: Physics-based digital twin with demand cascade simulation (Series B feature)
- digital_twin: Same as world_model - shows supply chain physics, inventory dynamics, demand propagation
- demo: Interactive demo walkthrough for presentations
- embodied_ai: Robotics fleet management - autonomous vehicles, drones, warehouse robots (Layer 8)
- sixg_edge: 6G edge network deployment - global edge nodes, latency, bandwidth (Layer 9)
- blockchain_mainnet: Ethereum mainnet integration - live transactions, smart contracts (Layer 10)
- chess_bi: Strategic chess game theory - competitive simulation, market position (QEMASI)

When users ask about scenarios, what-if, planning, or simulations → use scenario_planner
When users ask about contracts, agreements, settlements → use contracts
When users ask about explaining decisions, reasoning, why → use neuro_symbolic
When users ask about suppliers, network, relationships → use supplier_network
When users ask about routes, logistics, map → use map
When users ask about timeline, history, audit, replay, chronological → use timeline
When users ask about 3D, digital twin, world model, physics, cascade, demand spike, simulation → use world_model
When users ask about demo, walkthrough, tour, presentation, showcase → use demo
When users ask about robots, robotics, autonomous, warehouse automation, AMR, AGV, drones → use embodied_ai
When users ask about 6G, edge, latency, bandwidth, global network, edge computing → use sixg_edge
When users ask about ethereum, mainnet, blockchain transactions, crypto, settlement → use blockchain_mainnet
When users ask about strategy, chess, game theory, competition, market position, competitors → use chess_bi

Always be concise, data-driven, and proactive. You are ATLAS - the brain of this autonomous supply chain platform.
Format your response as JSON with keys: response, components (array), primary_agent, intent"""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=f"User command: {command}\n\nRespond with JSON format.")
        response = await chat.send_message(user_message)
        
        # Parse LLM response
        try:
            # Try to extract JSON from response
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0]
            else:
                json_str = response
            
            parsed = json.loads(json_str.strip())
            logger.info(f"LLM parsed response: {parsed}")
            # Ensure components is a list
            if "components" not in parsed or not isinstance(parsed.get("components"), list):
                parsed["components"] = []
            return parsed
        except json.JSONDecodeError:
            # Fallback: analyze command manually
            logger.info(f"JSON decode failed, using fallback for: {command}")
            return analyze_command_fallback(command, response)
            
    except Exception as e:
        logger.error(f"LLM error: {e}")
        return analyze_command_fallback(command, "I'm processing your request.")

def analyze_command_fallback(command: str, llm_response: str) -> Dict[str, Any]:
    """Fallback command analysis when LLM parsing fails"""
    command_lower = command.lower()
    
    # PRIORITY: Check for exact quick command matches first
    if "market data" in command_lower:
        return {
            "response": "Real-Time Market Intelligence activated. Displaying live Fortune 500 supply chain data from Yahoo Finance with sector performance and risk alerts.",
            "components": ["market_data", "agents"],
            "primary_agent": "risk",
            "intent": "market_analysis"
        }
    
    # Determine intent and components based on keywords
    if any(word in command_lower for word in ["demand", "forecast", "predict", "sales"]):
        return {
            "response": llm_response or "Analyzing demand patterns. The Demand Agent is processing current market signals and historical data.",
            "components": ["agents", "metrics"],
            "primary_agent": "demand",
            "intent": "demand_analysis"
        }
    elif any(word in command_lower for word in ["procure", "supplier", "buy", "source", "purchase"]):
        return {
            "response": llm_response or "Activating Procurement Agent. Analyzing supplier options and negotiation opportunities.",
            "components": ["agents", "supplier_network", "blockchain"],
            "primary_agent": "procurement",
            "intent": "procurement"
        }
    elif any(word in command_lower for word in ["route", "logistics", "ship", "deliver", "transport", "map"]):
        return {
            "response": llm_response or "Logistics Agent engaged. Interactive map displaying distribution centers, routes, and active shipments.",
            "components": ["map", "metrics"],
            "primary_agent": "logistics",
            "intent": "logistics_optimization"
        }
    elif any(word in command_lower for word in ["supplier", "network", "graph", "tier", "partner"]):
        return {
            "response": llm_response or "Displaying supplier network graph. Multi-tier relationships and risk indicators visualized.",
            "components": ["supplier_network", "risk_alerts"],
            "primary_agent": "procurement",
            "intent": "supplier_analysis"
        }
    elif any(word in command_lower for word in ["explain", "why", "reason", "logic", "symbolic", "trace", "decision", "rationale", "justif", "causal"]):
        return {
            "response": llm_response or "Neuro-Symbolic Reasoning Engine activated. Displaying decision traces with neural insights, symbolic rules, and compliance status.",
            "components": ["neuro_symbolic", "agents"],
            "primary_agent": "orchestrator",
            "intent": "explainability"
        }
    elif any(word in command_lower for word in ["scenario", "what if", "what-if", "simulate", "counterfactual", "planning"]):
        return {
            "response": llm_response or "Counterfactual Scenario Planner activated. Select a scenario to simulate cascading effects across the supply chain.",
            "components": ["scenario_planner"],
            "primary_agent": "orchestrator",
            "intent": "scenario_planning"
        }
    elif any(word in command_lower for word in ["contract", "smart contract", "agreement", "settlement", "payment", "terms"]):
        return {
            "response": llm_response or "Contract Intelligence module loaded. View active smart contracts, settlements, and create new agreements.",
            "components": ["contracts", "blockchain"],
            "primary_agent": "procurement",
            "intent": "contracts"
        }
    elif any(word in command_lower for word in ["timeline", "history", "audit", "decisions", "chronological", "replay"]):
        return {
            "response": llm_response or "Decision Timeline activated. View chronological agent decisions with full audit trail for board review.",
            "components": ["timeline"],
            "primary_agent": "orchestrator",
            "intent": "audit"
        }
    elif any(word in command_lower for word in ["3d", "digital twin", "world model", "visualization", "physics", "cascade", "demand spike", "simulation", "dynamics"]):
        return {
            "response": llm_response or "Digital Twin loaded with physics-based simulation. Click nodes to trigger demand spikes and observe cascade effects through your supply chain network.",
            "components": ["world_model"],
            "primary_agent": "orchestrator",
            "intent": "digital_twin"
        }
    elif any(word in command_lower for word in ["demo", "walkthrough", "tour", "presentation", "showcase"]):
        return {
            "response": llm_response or "Interactive Demo Walkthrough started. Follow the guided tour of ATLAS capabilities.",
            "components": ["demo"],
            "primary_agent": "orchestrator",
            "intent": "demo"
        }
    elif any(word in command_lower for word in ["market", "stock", "fortune", "yahoo", "finance", "price", "sector", "real-time", "realtime"]):
        return {
            "response": llm_response or "Real-Time Market Intelligence activated. Displaying live Fortune 500 supply chain data from Yahoo Finance with sector performance and risk alerts.",
            "components": ["market_data", "agents"],
            "primary_agent": "risk",
            "intent": "market_analysis"
        }
    elif any(word in command_lower for word in ["risk", "alert", "danger", "warning", "fail"]):
        return {
            "response": llm_response or "Risk Sentinel activated. Scanning supplier network for potential disruptions and vulnerabilities.",
            "components": ["agents", "risk_alerts", "supplier_network"],
            "primary_agent": "risk",
            "intent": "risk_assessment"
        }
    elif any(word in command_lower for word in ["blockchain", "transaction", "payment", "settle", "contract", "ledger"]):
        return {
            "response": llm_response or "Accessing blockchain ledger. Smart contracts and settlements are displayed.",
            "components": ["blockchain", "quantum"],
            "primary_agent": "orchestrator",
            "intent": "blockchain_view"
        }
    elif any(word in command_lower for word in ["quantum", "qaoa", "optimization"]):
        return {
            "response": llm_response or "Quantum optimization console active. Displaying hybrid solver status and results.",
            "components": ["quantum"],
            "primary_agent": "logistics",
            "intent": "quantum_view"
        }
    elif any(word in command_lower for word in ["robot", "robotics", "autonomous", "warehouse automation", "amr", "agv", "drone", "embodied"]):
        return {
            "response": llm_response or "Embodied AI robotics console activated. Monitoring autonomous fleet: AMRs, AGVs, drones, and robotic arms.",
            "components": ["embodied_ai", "agents"],
            "primary_agent": "logistics",
            "intent": "robotics"
        }
    elif any(word in command_lower for word in ["6g", "edge", "latency", "bandwidth", "global network", "edge computing"]):
        return {
            "response": llm_response or "6G Edge Network dashboard activated. Displaying global edge node status, latency metrics, and bandwidth utilization.",
            "components": ["sixg_edge", "agents"],
            "primary_agent": "orchestrator",
            "intent": "edge_network"
        }
    elif any(word in command_lower for word in ["ethereum", "mainnet", "crypto", "eth", "settlement", "smart contract"]):
        return {
            "response": llm_response or "Blockchain Mainnet console active. Ethereum L1 settlement layer showing live transactions and smart contract status.",
            "components": ["blockchain_mainnet", "agents"],
            "primary_agent": "orchestrator",
            "intent": "blockchain_mainnet"
        }
    elif any(word in command_lower for word in ["strategy", "chess", "game theory", "competition", "competitor", "market position"]):
        return {
            "response": llm_response or "Strategic Chess BI engine activated. QEMASI analyzing competitive landscape and market positioning.",
            "components": ["chess_bi", "agents"],
            "primary_agent": "orchestrator",
            "intent": "strategy"
        }
    elif any(word in command_lower for word in ["erp", "wms", "inventory", "orders", "warehouse", "stock", "fulfillment"]):
        return {
            "response": llm_response or "ERP/WMS Live Feed connected. Real-time inventory levels, order status, and shipment tracking now displayed.",
            "components": ["erp_wms"],
            "primary_agent": "logistics",
            "intent": "erp_wms"
        }
    elif any(word in command_lower for word in ["status", "overview", "dashboard", "show all", "everything"]):
        return {
            "response": llm_response or "ATLAS Command Center initialized. All agents reporting status. Supply chain systems nominal.",
            "components": ["agents", "metrics", "risk_alerts"],
            "primary_agent": "orchestrator",
            "intent": "overview"
        }
    else:
        return {
            "response": llm_response or "ATLAS is ready. How can I assist with your supply chain operations today?",
            "components": ["agents"],
            "primary_agent": "orchestrator",
            "intent": "general"
        }

# ===================== API ROUTES =====================

@api_router.get("/")
async def root():
    return {"message": "ATLAS Supply Chain OS - API Online", "version": "1.0.0"}

@api_router.post("/command", response_model=CommandResponse)
async def process_command(request: CommandRequest):
    """Process natural language command and return UI components"""
    session_id = request.session_id or str(uuid.uuid4())
    
    # Store command in history
    await db.command_history.insert_one({
        "id": str(uuid.uuid4()),
        "command": request.command,
        "session_id": session_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    # QUICK COMMAND SHORTCUTS - Skip LLM for exact matches
    command_lower = request.command.lower().strip()
    quick_commands = {
        "market data": {"response": "Real-Time Market Intelligence activated. Displaying live Fortune 500 supply chain data from Yahoo Finance.", "components": ["market_data", "agents"], "primary_agent": "risk", "intent": "market_analysis"},
        "show all agents": {"response": "ATLAS Command Center initialized. All 5 autonomous agents are online and operational.", "components": ["agents", "metrics", "risk_alerts"], "primary_agent": "orchestrator", "intent": "overview"},
        "digital twin": {"response": "Digital Twin loaded with physics-based simulation. Click nodes to trigger demand spikes.", "components": ["world_model"], "primary_agent": "orchestrator", "intent": "digital_twin"},
        "scenario planner": {"response": "Counterfactual Scenario Planner activated. Select a scenario to simulate.", "components": ["scenario_planner"], "primary_agent": "orchestrator", "intent": "scenario_planning"},
        "decision timeline": {"response": "Decision Timeline activated. View chronological agent decisions.", "components": ["timeline"], "primary_agent": "orchestrator", "intent": "audit"},
    }
    
    if command_lower in quick_commands:
        result = quick_commands[command_lower]
    else:
        # Process with LLM for complex commands
        result = await process_command_with_llm(request.command, session_id)
    
    # Map components to actual UI data
    ui_components = []
    raw_components = result.get("components", [])
    
    # Normalize components - handle both string and object formats from LLM
    normalized_comps = []
    for comp in raw_components:
        if isinstance(comp, str):
            normalized_comps.append(comp)
        elif isinstance(comp, dict):
            # LLM might use 'type' or 'component' key
            comp_type = comp.get("type") or comp.get("component")
            if comp_type:
                normalized_comps.append(comp_type)
    
    logger.info(f"Normalized components: {normalized_comps}")
    
    for comp in normalized_comps:
        if comp == "agents":
            ui_components.append({"type": "agents", "data": list(AGENTS_DATA.values())})
        elif comp == "metrics":
            ui_components.append({"type": "metrics", "data": {
                "total_shipments": 12450,
                "on_time_delivery": 99.2,
                "cost_savings": 2400000,
                "active_suppliers": 847,
                "risk_alerts": 3,
                "quantum_optimizations": 1247
            }})
        elif comp == "blockchain":
            ui_components.append({"type": "blockchain", "data": BLOCKCHAIN_TRANSACTIONS})
        elif comp == "quantum":
            ui_components.append({"type": "quantum", "data": QUANTUM_OPTIMIZATIONS})
        elif comp == "risk_alerts":
            ui_components.append({"type": "risk_alerts", "data": [
                {"id": "ra-001", "severity": "high", "supplier": "ChemCorp Ltd", "issue": "78% debt/EBITDA - 6 month failure risk", "probability": 0.72},
                {"id": "ra-002", "severity": "medium", "supplier": "Taiwan Mfg Co", "issue": "Geopolitical exposure - cross-strait tensions", "probability": 0.45},
                {"id": "ra-003", "severity": "low", "supplier": "EuroLogistics", "issue": "Port congestion delays possible", "probability": 0.23}
            ]})
        elif comp == "supplier_network":
            ui_components.append({"type": "supplier_network", "data": {
                "nodes": 847,
                "connections": 2341,
                "tiers": 4,
                "regions": ["APAC", "EMEA", "Americas"]
            }})
        elif comp == "map":
            ui_components.append({"type": "map", "data": {
                "routes": 50,
                "distribution_centers": 12,
                "active_shipments": 234
            }})
        elif comp == "neuro_symbolic":
            ui_components.append({"type": "neuro_symbolic", "data": {
                "agent": result.get("primary_agent", "orchestrator")
            }})
        elif comp == "scenario_planner":
            ui_components.append({"type": "scenario_planner", "data": {}})
        elif comp == "contracts":
            ui_components.append({"type": "contracts", "data": {}})
        elif comp == "timeline":
            ui_components.append({"type": "timeline", "data": {}})
        elif comp == "world_model":
            ui_components.append({"type": "world_model", "data": {}})
        elif comp == "digital_twin":
            ui_components.append({"type": "digital_twin", "data": {}})
        elif comp == "demo":
            ui_components.append({"type": "demo", "data": {}})
        elif comp == "embodied_ai":
            ui_components.append({"type": "embodied_ai", "data": {}})
        elif comp == "sixg_edge":
            ui_components.append({"type": "sixg_edge", "data": {}})
        elif comp == "blockchain_mainnet":
            ui_components.append({"type": "blockchain_mainnet", "data": {}})
        elif comp == "chess_bi":
            ui_components.append({"type": "chess_bi", "data": {}})
        elif comp == "erp_wms":
            ui_components.append({"type": "erp_wms", "data": {}})
        elif comp == "market_data":
            ui_components.append({"type": "market_data", "data": {}})
    
    # Get agent activity
    primary_agent = result.get("primary_agent", "orchestrator")
    agent_activity = AGENTS_DATA.get(primary_agent)
    if agent_activity:
        agent_activity["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    return CommandResponse(
        response=result.get("response", "Command processed."),
        ui_components=ui_components,
        agent_activity=agent_activity,
        intent=result.get("intent", "general")
    )

@api_router.get("/agents", response_model=List[AgentStatus])
async def get_agents():
    """Get all agent statuses"""
    agents = []
    for agent_data in AGENTS_DATA.values():
        agent_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        agents.append(AgentStatus(**agent_data))
    return agents

@api_router.get("/agents/{agent_type}", response_model=AgentStatus)
async def get_agent(agent_type: str):
    """Get specific agent status"""
    if agent_type not in AGENTS_DATA:
        raise HTTPException(status_code=404, detail="Agent not found")
    agent_data = AGENTS_DATA[agent_type].copy()
    agent_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    return AgentStatus(**agent_data)

@api_router.get("/metrics", response_model=SupplyChainMetrics)
async def get_metrics():
    """Get supply chain metrics"""
    return SupplyChainMetrics(
        total_shipments=12450 + random.randint(0, 50),
        on_time_delivery=99.2 + random.uniform(-0.5, 0.3),
        cost_savings=2400000 + random.randint(0, 50000),
        active_suppliers=847,
        risk_alerts=3,
        quantum_optimizations=1247 + random.randint(0, 10)
    )

@api_router.get("/blockchain/transactions", response_model=List[BlockchainTransaction])
async def get_blockchain_transactions():
    """Get blockchain transactions"""
    return [BlockchainTransaction(**tx) for tx in BLOCKCHAIN_TRANSACTIONS]

@api_router.get("/quantum/optimizations", response_model=List[QuantumOptimization])
async def get_quantum_optimizations():
    """Get quantum optimization results"""
    return [QuantumOptimization(**opt) for opt in QUANTUM_OPTIMIZATIONS]

@api_router.post("/quantum/optimize")
async def trigger_quantum_optimization():
    """Trigger a new quantum optimization"""
    optimization_id = f"qopt-{str(uuid.uuid4())[:8]}"
    return {
        "id": optimization_id,
        "status": "queued",
        "estimated_time": "4-5 minutes",
        "message": "Quantum optimization job queued. QAOA solver initializing."
    }

@api_router.get("/risk/alerts")
async def get_risk_alerts():
    """Get current risk alerts"""
    return [
        {"id": "ra-001", "severity": "high", "supplier": "ChemCorp Ltd", "issue": "78% debt/EBITDA - 6 month failure risk", "probability": 0.72, "recommendation": "Diversify to secondary suppliers"},
        {"id": "ra-002", "severity": "medium", "supplier": "Taiwan Mfg Co", "issue": "Geopolitical exposure - cross-strait tensions", "probability": 0.45, "recommendation": "Source 30% from Mexico alternative"},
        {"id": "ra-003", "severity": "low", "supplier": "EuroLogistics", "issue": "Port congestion delays possible", "probability": 0.23, "recommendation": "Monitor Rotterdam schedules"}
    ]

# WebSocket for real-time updates
@api_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Send periodic updates
            update = {
                "type": "agent_update",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "agents": {
                    name: {
                        "status": agent["status"],
                        "confidence": agent["confidence"] + random.uniform(-0.02, 0.02),
                        "decisions_today": agent["decisions_today"] + random.randint(0, 2)
                    }
                    for name, agent in AGENTS_DATA.items()
                }
            }
            await websocket.send_json(update)
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")

# ===================== REAL-TIME MARKET DATA ENDPOINTS =====================

from market_data import get_data_service, SUPPLY_CHAIN_COMPANIES

@api_router.get("/market/dashboard")
async def get_market_dashboard():
    """Get real-time supply chain market dashboard with Fortune 500 data"""
    try:
        service = get_data_service()
        data = await service.get_supply_chain_dashboard()
        return data
    except Exception as e:
        logger.error(f"Market dashboard error: {e}")
        return {"error": str(e), "timestamp": datetime.now(timezone.utc).isoformat()}

@api_router.get("/market/companies")
async def get_tracked_companies():
    """Get list of tracked supply chain companies"""
    return {
        "companies": [
            {"symbol": symbol, **info}
            for symbol, info in SUPPLY_CHAIN_COMPANIES.items()
        ],
        "total": len(SUPPLY_CHAIN_COMPANIES),
        "sectors": list(set(c["sector"] for c in SUPPLY_CHAIN_COMPANIES.values()))
    }

@api_router.get("/market/quote/{symbol}")
async def get_company_quote(symbol: str):
    """Get real-time quote for a specific company"""
    try:
        service = get_data_service()
        quote = await service.yahoo.get_quote(symbol.upper())
        if quote:
            company_info = SUPPLY_CHAIN_COMPANIES.get(symbol.upper(), {})
            quote["company_name"] = company_info.get("name", symbol)
            quote["sector"] = company_info.get("sector", "Unknown")
            quote["tier"] = company_info.get("tier", 2)
            return quote
        return {"error": f"No data found for {symbol}"}
    except Exception as e:
        logger.error(f"Quote error for {symbol}: {e}")
        return {"error": str(e)}

@api_router.get("/market/risk/{symbol}")
async def get_company_risk(symbol: str):
    """Get risk profile for a specific company"""
    try:
        service = get_data_service()
        risk = await service.get_company_risk_profile(symbol.upper())
        if risk:
            return risk
        return {"error": f"No risk data found for {symbol}"}
    except Exception as e:
        logger.error(f"Risk profile error for {symbol}: {e}")
        return {"error": str(e)}

@api_router.get("/market/sectors")
async def get_sector_performance():
    """Get performance by supply chain sector"""
    try:
        service = get_data_service()
        data = await service.get_supply_chain_dashboard()
        return {
            "sectors": data.get("sector_performance", {}),
            "timestamp": data.get("timestamp")
        }
    except Exception as e:
        logger.error(f"Sector performance error: {e}")
        return {"error": str(e)}

@api_router.get("/market/alerts")
async def get_market_risk_alerts():
    """Get real-time risk alerts based on market data"""
    try:
        service = get_data_service()
        data = await service.get_supply_chain_dashboard()
        return {
            "alerts": data.get("risk_alerts", []),
            "total": len(data.get("risk_alerts", [])),
            "timestamp": data.get("timestamp")
        }
    except Exception as e:
        logger.error(f"Market alerts error: {e}")
        return {"error": str(e)}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
