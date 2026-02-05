"""
AETHON AI Strategic Intelligence Platform - Backend API Tests
Tests for Layer 8-10 components: EmbodiedAI, SixGEdge, BlockchainMainnet, ChessBI
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasicEndpoints:
    """Basic API health and endpoint tests"""
    
    def test_api_root(self):
        """Test API root endpoint returns online status"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
    
    def test_get_agents(self):
        """Test getting all 5 AI agents"""
        response = requests.get(f"{BASE_URL}/api/agents")
        assert response.status_code == 200
        agents = response.json()
        assert len(agents) == 5
        agent_types = [a["type"] for a in agents]
        assert "demand" in agent_types
        assert "procurement" in agent_types
        assert "logistics" in agent_types
        assert "risk" in agent_types
        assert "orchestrator" in agent_types
    
    def test_get_metrics(self):
        """Test getting supply chain metrics"""
        response = requests.get(f"{BASE_URL}/api/metrics")
        assert response.status_code == 200
        data = response.json()
        assert "total_shipments" in data
        assert "on_time_delivery" in data
        assert "cost_savings" in data
        assert "active_suppliers" in data


class TestEmbodiedAICommand:
    """Tests for Embodied AI (Layer 8) robotics commands"""
    
    def test_robotics_command_returns_embodied_ai(self):
        """Test 'show robotics fleet' returns embodied_ai component"""
        response = requests.post(f"{BASE_URL}/api/command", json={
            "command": "show robotics fleet",
            "session_id": "test-robotics-1"
        })
        assert response.status_code == 200
        data = response.json()
        assert "ui_components" in data
        component_types = [c["type"] for c in data["ui_components"]]
        assert "embodied_ai" in component_types
    
    def test_robot_keyword_returns_embodied_ai(self):
        """Test 'robot' keyword triggers embodied_ai component"""
        response = requests.post(f"{BASE_URL}/api/command", json={
            "command": "show warehouse robots",
            "session_id": "test-robotics-2"
        })
        assert response.status_code == 200
        data = response.json()
        component_types = [c["type"] for c in data["ui_components"]]
        assert "embodied_ai" in component_types
    
    def test_amr_keyword_returns_embodied_ai(self):
        """Test 'AMR' keyword triggers embodied_ai component"""
        response = requests.post(f"{BASE_URL}/api/command", json={
            "command": "show AMR status",
            "session_id": "test-robotics-3"
        })
        assert response.status_code == 200
        data = response.json()
        component_types = [c["type"] for c in data["ui_components"]]
        assert "embodied_ai" in component_types


class TestSixGEdgeCommand:
    """Tests for 6G Edge Network (Layer 9) commands"""
    
    def test_6g_edge_command_returns_sixg_edge(self):
        """Test 'show 6G edge network' returns sixg_edge component"""
        response = requests.post(f"{BASE_URL}/api/command", json={
            "command": "show 6G edge network",
            "session_id": "test-6g-1"
        })
        assert response.status_code == 200
        data = response.json()
        component_types = [c["type"] for c in data["ui_components"]]
        assert "sixg_edge" in component_types
    
    def test_edge_keyword_returns_sixg_edge(self):
        """Test 'edge' keyword triggers sixg_edge component"""
        response = requests.post(f"{BASE_URL}/api/command", json={
            "command": "show edge computing status",
            "session_id": "test-6g-2"
        })
        assert response.status_code == 200
        data = response.json()
        component_types = [c["type"] for c in data["ui_components"]]
        assert "sixg_edge" in component_types
    
    def test_latency_keyword_returns_sixg_edge(self):
        """Test 'latency' keyword triggers sixg_edge component"""
        response = requests.post(f"{BASE_URL}/api/command", json={
            "command": "check network latency",
            "session_id": "test-6g-3"
        })
        assert response.status_code == 200
        data = response.json()
        component_types = [c["type"] for c in data["ui_components"]]
        assert "sixg_edge" in component_types


class TestBlockchainMainnetCommand:
    """Tests for Blockchain Mainnet (Layer 10) commands"""
    
    def test_ethereum_command_returns_blockchain_mainnet(self):
        """Test 'show ethereum mainnet' returns blockchain_mainnet component"""
        response = requests.post(f"{BASE_URL}/api/command", json={
            "command": "show ethereum mainnet",
            "session_id": "test-blockchain-1"
        })
        assert response.status_code == 200
        data = response.json()
        component_types = [c["type"] for c in data["ui_components"]]
        assert "blockchain_mainnet" in component_types
    
    def test_mainnet_keyword_returns_blockchain_mainnet(self):
        """Test 'mainnet' keyword triggers blockchain_mainnet component"""
        response = requests.post(f"{BASE_URL}/api/command", json={
            "command": "show mainnet transactions",
            "session_id": "test-blockchain-2"
        })
        assert response.status_code == 200
        data = response.json()
        component_types = [c["type"] for c in data["ui_components"]]
        assert "blockchain_mainnet" in component_types
    
    def test_eth_keyword_returns_blockchain_mainnet(self):
        """Test 'ETH' keyword triggers blockchain_mainnet component"""
        response = requests.post(f"{BASE_URL}/api/command", json={
            "command": "show ETH settlements",
            "session_id": "test-blockchain-3"
        })
        assert response.status_code == 200
        data = response.json()
        component_types = [c["type"] for c in data["ui_components"]]
        assert "blockchain_mainnet" in component_types


class TestChessBICommand:
    """Tests for Chess BI / Game Theory (QEMASI) commands"""
    
    def test_game_theory_command_returns_chess_bi(self):
        """Test 'show strategic game theory' returns chess_bi component"""
        response = requests.post(f"{BASE_URL}/api/command", json={
            "command": "show strategic game theory",
            "session_id": "test-chess-1"
        })
        assert response.status_code == 200
        data = response.json()
        component_types = [c["type"] for c in data["ui_components"]]
        assert "chess_bi" in component_types
    
    def test_strategy_keyword_returns_chess_bi(self):
        """Test 'strategy' keyword triggers chess_bi component"""
        response = requests.post(f"{BASE_URL}/api/command", json={
            "command": "analyze competitive strategy",
            "session_id": "test-chess-2"
        })
        assert response.status_code == 200
        data = response.json()
        component_types = [c["type"] for c in data["ui_components"]]
        assert "chess_bi" in component_types
    
    def test_competition_keyword_returns_chess_bi(self):
        """Test 'competition' keyword triggers chess_bi component"""
        response = requests.post(f"{BASE_URL}/api/command", json={
            "command": "show competition analysis",
            "session_id": "test-chess-3"
        })
        assert response.status_code == 200
        data = response.json()
        component_types = [c["type"] for c in data["ui_components"]]
        assert "chess_bi" in component_types


class TestExistingComponents:
    """Tests for existing components to ensure no regression"""
    
    def test_status_command_returns_agents(self):
        """Test 'show system status' returns agents component"""
        response = requests.post(f"{BASE_URL}/api/command", json={
            "command": "show system status",
            "session_id": "test-status-1"
        })
        assert response.status_code == 200
        data = response.json()
        component_types = [c["type"] for c in data["ui_components"]]
        assert "agents" in component_types
    
    def test_risk_command_returns_risk_alerts(self):
        """Test 'risk assessment' returns risk_alerts component"""
        response = requests.post(f"{BASE_URL}/api/command", json={
            "command": "risk assessment",
            "session_id": "test-risk-1"
        })
        assert response.status_code == 200
        data = response.json()
        component_types = [c["type"] for c in data["ui_components"]]
        assert "risk_alerts" in component_types
    
    def test_digital_twin_command(self):
        """Test 'show digital twin' returns digital_twin or world_model component"""
        response = requests.post(f"{BASE_URL}/api/command", json={
            "command": "show digital twin",
            "session_id": "test-twin-1"
        })
        assert response.status_code == 200
        data = response.json()
        component_types = [c["type"] for c in data["ui_components"]]
        # Either digital_twin or world_model is acceptable
        assert "digital_twin" in component_types or "world_model" in component_types
    
    def test_timeline_command(self):
        """Test 'show timeline' returns timeline component"""
        response = requests.post(f"{BASE_URL}/api/command", json={
            "command": "show decision timeline",
            "session_id": "test-timeline-1"
        })
        assert response.status_code == 200
        data = response.json()
        component_types = [c["type"] for c in data["ui_components"]]
        assert "timeline" in component_types


class TestCommandResponseStructure:
    """Tests for command response structure"""
    
    def test_command_response_has_required_fields(self):
        """Test command response has all required fields"""
        response = requests.post(f"{BASE_URL}/api/command", json={
            "command": "show status",
            "session_id": "test-structure-1"
        })
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "ui_components" in data
        assert "intent" in data
        assert isinstance(data["ui_components"], list)
    
    def test_agent_data_structure(self):
        """Test agent data has correct structure"""
        response = requests.get(f"{BASE_URL}/api/agents/demand")
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "name" in data
        assert "type" in data
        assert "status" in data
        assert "confidence" in data
        assert "metrics" in data
