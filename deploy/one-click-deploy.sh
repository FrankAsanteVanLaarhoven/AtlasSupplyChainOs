#!/bin/bash
#############################################################
#  ATLAS Supply Chain OS - One-Click VPS Deployment Script
#  
#  Run this on your Hostinger VPS as root:
#  curl -sL https://raw.githubusercontent.com/YOUR_REPO/deploy.sh | bash
#  
#  Or copy-paste the entire script into your SSH terminal
#############################################################

set -e

# ==================== CONFIGURATION ====================
APP_NAME="atlas"
APP_DIR="/var/www/$APP_NAME"
SERVER_NAME="atlassupplychainos.com"
EMERGENT_LLM_KEY="sk-emergent-63dD60bFc5dEaA5262"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

print_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║     ATLAS Supply Chain OS - One-Click Deployment          ║"
    echo "║                   Hostinger VPS Setup                     ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_status() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
print_step() { echo -e "\n${CYAN}━━━ $1 ━━━${NC}"; }

# ==================== MAIN SCRIPT ====================

print_banner

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root: sudo bash deploy.sh"
fi

# ==================== STEP 1: UPDATE SYSTEM ====================
print_step "Step 1/8: Updating System"
apt update && apt upgrade -y
print_status "System updated"

# ==================== STEP 2: INSTALL NODE.JS ====================
print_step "Step 2/8: Installing Node.js 20.x"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
print_status "Node.js $(node --version) installed"

# ==================== STEP 3: INSTALL PYTHON ====================
print_step "Step 3/8: Installing Python 3"
apt install -y python3 python3-pip python3-venv
print_status "Python $(python3 --version) installed"

# ==================== STEP 4: INSTALL NGINX ====================
print_step "Step 4/8: Installing Nginx"
apt install -y nginx
systemctl enable nginx
print_status "Nginx installed"

# ==================== STEP 5: INSTALL MONGODB ====================
print_step "Step 5/8: Installing MongoDB"
if ! command -v mongod &> /dev/null; then
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
        gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
        tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt update
    apt install -y mongodb-org
fi
systemctl start mongod
systemctl enable mongod
print_status "MongoDB installed and running"

# ==================== STEP 6: CREATE APP DIRECTORY ====================
print_step "Step 6/8: Setting Up Application"
mkdir -p $APP_DIR/frontend
mkdir -p $APP_DIR/backend

# Create backend server.py
cat > $APP_DIR/backend/server.py << 'SERVERPY'
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
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'atlas_production')]

# LLM Integration
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False
    print("Warning: emergentintegrations not available, using fallback")

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
        "metrics": {"accuracy": 94.2, "forecast_horizon": "90 days", "sku_coverage": 12500, "model": "Fine-tuned GPT-3.5"}
    },
    "procurement": {
        "id": "agent-procurement-001",
        "name": "PROCUREMENT OPTIMIZER",
        "type": "procurement",
        "status": "active",
        "confidence": 0.91,
        "last_action": "Negotiated 12% cost reduction with supplier GreenMfg",
        "decisions_today": 23,
        "metrics": {"savings_ytd": 2400000, "active_rfqs": 8, "suppliers_evaluated": 156, "model": "Multimodal Claude"}
    },
    "logistics": {
        "id": "agent-logistics-001",
        "name": "LOGISTICS ROUTER",
        "type": "logistics",
        "status": "optimizing",
        "confidence": 0.97,
        "last_action": "Quantum-optimized 200 routes in 4.2 minutes",
        "decisions_today": 312,
        "metrics": {"routes_optimized": 1247, "fuel_saved": 18.5, "on_time_rate": 99.2, "model": "QAOA Hybrid"}
    },
    "risk": {
        "id": "agent-risk-001",
        "name": "RISK SENTINEL",
        "type": "risk",
        "status": "monitoring",
        "confidence": 0.89,
        "last_action": "Flagged ChemCorp Ltd: 78% debt/EBITDA ratio - 6 month failure risk",
        "decisions_today": 15,
        "metrics": {"suppliers_monitored": 847, "alerts_active": 3, "predictions_accuracy": 89.4, "model": "Ensemble GNN + LLM"}
    },
    "orchestrator": {
        "id": "agent-orchestrator-001",
        "name": "ATLAS ORCHESTRATOR",
        "type": "orchestrator",
        "status": "coordinating",
        "confidence": 0.96,
        "last_action": "Resolved conflict: Procurement vs Risk on Taiwan supplier",
        "decisions_today": 89,
        "metrics": {"conflicts_resolved": 12, "pareto_solutions": 8, "agent_sync_rate": 99.8, "model": "Claude Opus"}
    }
}

def analyze_command_fallback(command: str, llm_response: str = "") -> Dict[str, Any]:
    """Fallback command analysis when LLM parsing fails"""
    command_lower = command.lower()
    
    if any(word in command_lower for word in ["demand", "forecast", "predict", "sales"]):
        return {"response": llm_response or "Analyzing demand patterns.", "components": ["agents", "metrics"], "primary_agent": "demand", "intent": "demand_analysis"}
    elif any(word in command_lower for word in ["route", "logistics", "ship", "deliver", "map"]):
        return {"response": llm_response or "Logistics Agent engaged.", "components": ["map", "metrics"], "primary_agent": "logistics", "intent": "logistics_optimization"}
    elif any(word in command_lower for word in ["scenario", "what if", "simulate", "counterfactual", "planning"]):
        return {"response": llm_response or "Counterfactual Scenario Planner activated.", "components": ["scenario_planner"], "primary_agent": "orchestrator", "intent": "scenario_planning"}
    elif any(word in command_lower for word in ["timeline", "history", "audit", "decisions"]):
        return {"response": llm_response or "Decision Timeline activated.", "components": ["timeline"], "primary_agent": "orchestrator", "intent": "audit"}
    elif any(word in command_lower for word in ["3d", "digital twin", "world model", "physics", "simulation"]):
        return {"response": llm_response or "Digital Twin loaded.", "components": ["world_model"], "primary_agent": "orchestrator", "intent": "digital_twin"}
    elif any(word in command_lower for word in ["risk", "alert", "danger"]):
        return {"response": llm_response or "Risk Sentinel activated.", "components": ["agents", "risk_alerts"], "primary_agent": "risk", "intent": "risk_assessment"}
    elif any(word in command_lower for word in ["supplier", "network", "graph"]):
        return {"response": llm_response or "Displaying supplier network.", "components": ["supplier_network", "risk_alerts"], "primary_agent": "procurement", "intent": "supplier_analysis"}
    elif any(word in command_lower for word in ["status", "overview", "dashboard", "show all", "agents"]):
        return {"response": llm_response or "ATLAS Command Center initialized.", "components": ["agents", "metrics", "risk_alerts"], "primary_agent": "orchestrator", "intent": "overview"}
    else:
        return {"response": llm_response or "ATLAS is ready.", "components": ["agents"], "primary_agent": "orchestrator", "intent": "general"}

async def process_command_with_llm(command: str, session_id: str) -> Dict[str, Any]:
    """Process user command with LLM"""
    if not LLM_AVAILABLE or not EMERGENT_LLM_KEY:
        return analyze_command_fallback(command)
    
    system_message = """You are ATLAS, the orchestrator of an autonomous supply chain platform.
Available UI components: agents, metrics, blockchain, quantum, risk_alerts, supplier_network, map, neuro_symbolic, scenario_planner, contracts, timeline, world_model, digital_twin, demo
Respond with JSON: {"response": "...", "components": ["..."], "primary_agent": "...", "intent": "..."}"""

    try:
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=session_id, system_message=system_message).with_model("openai", "gpt-4o-mini")
        user_message = UserMessage(text=f"User command: {command}")
        response = await chat.send_message(user_message)
        
        try:
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0]
            else:
                json_str = response
            parsed = json.loads(json_str.strip())
            if "components" not in parsed or not isinstance(parsed.get("components"), list):
                parsed["components"] = []
            return parsed
        except json.JSONDecodeError:
            return analyze_command_fallback(command, response)
    except Exception as e:
        logger.error(f"LLM error: {e}")
        return analyze_command_fallback(command)

# ===================== API ROUTES =====================

@api_router.get("/")
async def root():
    return {"message": "ATLAS Supply Chain OS - API Online", "version": "1.0.0"}

@api_router.post("/command", response_model=CommandResponse)
async def process_command(request: CommandRequest):
    session_id = request.session_id or str(uuid.uuid4())
    await db.command_history.insert_one({"id": str(uuid.uuid4()), "command": request.command, "session_id": session_id, "timestamp": datetime.now(timezone.utc).isoformat()})
    result = await process_command_with_llm(request.command, session_id)
    
    ui_components = []
    raw_components = result.get("components", [])
    normalized_comps = [comp if isinstance(comp, str) else (comp.get("type") or comp.get("component")) for comp in raw_components if comp]
    
    for comp in normalized_comps:
        if comp == "agents":
            ui_components.append({"type": "agents", "data": list(AGENTS_DATA.values())})
        elif comp == "metrics":
            ui_components.append({"type": "metrics", "data": {"total_shipments": 12450, "on_time_delivery": 99.2, "cost_savings": 2400000, "active_suppliers": 847, "risk_alerts": 3, "quantum_optimizations": 1247}})
        elif comp == "risk_alerts":
            ui_components.append({"type": "risk_alerts", "data": [{"id": "ra-001", "severity": "high", "supplier": "ChemCorp Ltd", "issue": "78% debt/EBITDA - 6 month failure risk", "probability": 0.72}]})
        elif comp == "supplier_network":
            ui_components.append({"type": "supplier_network", "data": {"nodes": 847, "connections": 2341, "tiers": 4}})
        elif comp == "map":
            ui_components.append({"type": "map", "data": {"routes": 50, "distribution_centers": 12, "active_shipments": 234}})
        elif comp in ["scenario_planner", "contracts", "timeline", "world_model", "digital_twin", "demo", "neuro_symbolic", "blockchain", "quantum"]:
            ui_components.append({"type": comp, "data": {}})
    
    primary_agent = result.get("primary_agent", "orchestrator")
    agent_activity = AGENTS_DATA.get(primary_agent, {}).copy()
    if agent_activity:
        agent_activity["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    return CommandResponse(response=result.get("response", "Command processed."), ui_components=ui_components, agent_activity=agent_activity if agent_activity else None, intent=result.get("intent", "general"))

@api_router.get("/agents", response_model=List[AgentStatus])
async def get_agents():
    return [AgentStatus(**{**agent, "updated_at": datetime.now(timezone.utc).isoformat()}) for agent in AGENTS_DATA.values()]

@api_router.get("/agents/{agent_type}", response_model=AgentStatus)
async def get_agent(agent_type: str):
    if agent_type not in AGENTS_DATA:
        raise HTTPException(status_code=404, detail="Agent not found")
    return AgentStatus(**{**AGENTS_DATA[agent_type], "updated_at": datetime.now(timezone.utc).isoformat()})

@api_router.get("/metrics", response_model=SupplyChainMetrics)
async def get_metrics():
    return SupplyChainMetrics(total_shipments=12450 + random.randint(0, 50), on_time_delivery=99.2, cost_savings=2400000, active_suppliers=847, risk_alerts=3, quantum_optimizations=1247)

@api_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            update = {"type": "agent_update", "timestamp": datetime.now(timezone.utc).isoformat(), "agents": {name: {"status": agent["status"], "confidence": agent["confidence"] + random.uniform(-0.02, 0.02)} for name, agent in AGENTS_DATA.items()}}
            await websocket.send_json(update)
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")

app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','), allow_methods=["*"], allow_headers=["*"])

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
SERVERPY

# Create requirements.txt
cat > $APP_DIR/backend/requirements.txt << 'REQUIREMENTS'
fastapi==0.110.1
uvicorn==0.25.0
python-dotenv>=1.0.1
pymongo==4.5.0
pydantic>=2.6.4
motor==3.3.1
gunicorn>=21.0.0
emergentintegrations==0.1.0
REQUIREMENTS

# Create .env file
cat > $APP_DIR/backend/.env << EOF
MONGO_URL="mongodb://localhost:27017"
DB_NAME="atlas_production"
CORS_ORIGINS="http://$SERVER_NAME,https://$SERVER_NAME,http://localhost"
EMERGENT_LLM_KEY="$EMERGENT_LLM_KEY"
EOF

print_status "Backend files created"

# Setup Python environment
print_step "Step 7/8: Setting Up Python Environment"
cd $APP_DIR/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
deactivate
print_status "Python environment ready"

# ==================== STEP 7: CONFIGURE SERVICES ====================
print_step "Step 8/8: Configuring Services"

# Create systemd service
cat > /etc/systemd/system/atlas-backend.service << EOF
[Unit]
Description=ATLAS Supply Chain OS Backend
After=network.target mongod.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=$APP_DIR/backend
Environment="PATH=$APP_DIR/backend/venv/bin"
EnvironmentFile=$APP_DIR/backend/.env
ExecStart=$APP_DIR/backend/venv/bin/gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 127.0.0.1:8001 --timeout 120
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Create Nginx config
cat > /etc/nginx/sites-available/atlas << EOF
server {
    listen 80;
    server_name $SERVER_NAME www.$SERVER_NAME;

    root $APP_DIR/frontend;
    index index.html;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300;
    }

    location /api/ws {
        proxy_pass http://127.0.0.1:8001/api/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_read_timeout 86400;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/atlas /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Set permissions
chown -R www-data:www-data $APP_DIR

# Start services
systemctl daemon-reload
systemctl enable atlas-backend
systemctl start atlas-backend

# Test and reload Nginx
nginx -t && systemctl reload nginx

print_status "Services configured and started"

# ==================== FINAL STATUS ====================
echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║            ${GREEN}✓ DEPLOYMENT COMPLETE!${CYAN}                        ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Backend Status:${NC}"
systemctl status atlas-backend --no-pager | head -5
echo ""
echo -e "${GREEN}MongoDB Status:${NC}"
systemctl status mongod --no-pager | head -3
echo ""
echo -e "${GREEN}Nginx Status:${NC}"
systemctl status nginx --no-pager | head -3
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}IMPORTANT: You need to upload the frontend build files!${NC}"
echo ""
echo -e "The frontend React build needs to be uploaded to:"
echo -e "  ${CYAN}$APP_DIR/frontend/${NC}"
echo ""
echo -e "From your local machine, run:"
echo -e "  ${GREEN}scp -r /path/to/build/* root@$SERVER_NAME:$APP_DIR/frontend/${NC}"
echo ""
echo -e "Or download from source and upload via SFTP"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Once frontend is uploaded, your app will be live at:"
echo -e "  ${CYAN}http://$SERVER_NAME${NC}"
echo ""
echo -e "Useful commands:"
echo -e "  View logs:    ${GREEN}journalctl -u atlas-backend -f${NC}"
echo -e "  Restart:      ${GREEN}systemctl restart atlas-backend${NC}"
echo -e "  Test API:     ${GREEN}curl http://localhost:8001/api/${NC}"
echo ""
echo -e "${YELLOW}━━━ ENABLE SSL (HTTPS) ━━━${NC}"
echo -e "After uploading frontend, run this to enable HTTPS:"
echo -e "  ${GREEN}apt install -y certbot python3-certbot-nginx${NC}"
echo -e "  ${GREEN}certbot --nginx -d atlassupplychainos.com -d www.atlassupplychainos.com${NC}"
echo ""
