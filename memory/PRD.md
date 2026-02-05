# ATLAS Supply Chain OS - Product Requirements Document

## Project Overview
**Name:** ATLAS Supply Chain OS  
**Type:** Autonomous Supply Chain Management Platform  
**Status:** Production-Ready for Deployment  
**Last Updated:** January 28, 2026

---

## Original Problem Statement
Build an autonomous supply chain management platform with:
- Ephemeral UI generated via natural language commands
- Premium, tactical, dark-themed aesthetic (military-grade, Matrix-inspired)
- 5 autonomous AI agents for supply chain operations
- Digital Twin with physics simulation
- Counterfactual Scenario Planner
- Decision Timeline audit trail
- Smart contract settlement (Ethereum/Sepolia)

---

## Core Features Implemented

### ✅ Production-Ready (Series A Demo)
1. **5 AI Agent Cards** - Demand, Procurement, Logistics, Risk, Orchestrator
2. **Command Interface** - Natural language processing with quick actions
3. **Digital Twin** - Physics-based supply chain simulation
4. **Scenario Planner** - Counterfactual what-if analysis
5. **Decision Timeline** - Audit trail for agent decisions
6. **Logistics Map** - Interactive route visualization
7. **Supplier Network** - D3.js relationship graph
8. **Risk Alerts** - Supplier risk monitoring
9. **Neuro-Symbolic Engine** - Explainable AI reasoning

### 🔒 Hidden Features (Post-Funding)
- **BlockchainMainnet.jsx** - Live Ethereum Sepolia integration
- **EmbodiedAI.jsx** - Robotics fleet management
- **SixGEdge.jsx** - 6G edge network dashboard
- **ChessBI.jsx** - Game theory strategic analysis
- **DemoMode.jsx** - Auto-demo walkthrough
- **MockERPWMS.jsx** - ERP/WMS data feed

---

## Technical Architecture

### Frontend
- **Framework:** React 19 with React Router
- **Styling:** Tailwind CSS + Custom glassmorphism
- **3D:** React-Three-Fiber / Three.js
- **Maps:** Leaflet + React-Leaflet
- **Graphs:** D3.js
- **Blockchain:** ethers.js v6

### Backend
- **Framework:** FastAPI
- **Database:** MongoDB (Motor async driver)
- **AI:** LLM Integration (GPT-5.2)
- **WebSocket:** Real-time agent updates

### Deployment
- **Target:** Hostinger VPS (srv1304213.hstgr.cloud)
- **Web Server:** Nginx (reverse proxy)
- **Process Manager:** Systemd + Gunicorn
- **SSL:** Certbot/Let's Encrypt

---

## File Structure
```
/app/
├── backend/
│   ├── server.py           # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment template
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main application
│   │   ├── components/     # UI components
│   │   └── hooks/          # Custom hooks
│   └── build/              # Production build (ready)
├── contracts/
│   └── SupplyChainSettlement.sol  # Deployed to Sepolia
├── deploy/
│   ├── setup-vps.sh        # VPS setup script
│   ├── start-services.sh   # Service startup script
│   └── nginx-atlas.conf    # Nginx configuration
└── DEPLOYMENT.md           # Complete deployment guide
```

---

## Deployment Checklist

### Pre-Deployment ✅
- [x] Frontend builds successfully (yarn build)
- [x] Backend API tested and working
- [x] All external branding removed (white-labeled)
- [x] Environment variables documented
- [x] Nginx configuration created
- [x] Systemd service file created
- [x] Deployment documentation complete

### On VPS (Pending)
- [ ] Upload files to /var/www/atlas/
- [ ] Run setup-vps.sh
- [ ] Configure .env with production values
- [ ] Run start-services.sh
- [ ] Test all endpoints
- [ ] Configure SSL (optional)

---

## API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/ | GET | Health check |
| /api/command | POST | Process NL commands |
| /api/agents | GET | List all agents |
| /api/agents/{type} | GET | Get specific agent |
| /api/metrics | GET | Supply chain metrics |
| /api/ws | WS | Real-time updates |

---

## Environment Variables

### Backend
| Variable | Description | Required |
|----------|-------------|----------|
| MONGO_URL | MongoDB connection string | Yes |
| DB_NAME | Database name | Yes |
| CORS_ORIGINS | Allowed origins | Yes |
| EMERGENT_LLM_KEY | AI integration key | Yes |

### Frontend (Build-time)
| Variable | Description |
|----------|-------------|
| REACT_APP_BACKEND_URL | Backend API URL |

---

## Blockchain Integration
- **Contract:** SupplyChainSettlement.sol
- **Network:** Sepolia Testnet
- **Address:** 0xC06C4abf2e7E11D203cA0CDa7b821Fb2aCA4ceA2
- **Status:** Deployed (hidden from UI for Series A)

---

## Prioritized Backlog

### P0 - Immediate
- Deploy to Hostinger VPS

### P1 - Post-Deployment
- Record 12-minute investor demo video
- Domain configuration + SSL

### P2 - Post-Funding
- Re-enable blockchain mainnet features
- Deploy contract to Ethereum mainnet
- Settlement analytics dashboard

### P3 - Future Enhancements
- WebRTC collaboration features
- Advanced ERP/WMS integration
- Mobile responsive optimization
