"""
NEXUS Supply Chain OS - Backend API Tests
Tests all API endpoints including agents, metrics, blockchain, quantum, risk, and command processing
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndRoot:
    """Health check and root endpoint tests"""
    
    def test_root_endpoint(self):
        """Test API root returns correct message"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "NEXUS Supply Chain OS - API Online"
        assert data["version"] == "1.0.0"


class TestAgentsEndpoints:
    """Tests for /api/agents endpoints"""
    
    def test_get_all_agents(self):
        """Test GET /api/agents returns all 5 agents"""
        response = requests.get(f"{BASE_URL}/api/agents")
        assert response.status_code == 200
        agents = response.json()
        assert len(agents) == 5
        
        # Verify all agent types are present
        agent_types = [a["type"] for a in agents]
        expected_types = ["demand", "procurement", "logistics", "risk", "orchestrator"]
        for expected in expected_types:
            assert expected in agent_types, f"Missing agent type: {expected}"
    
    def test_agent_data_structure(self):
        """Test agent data has correct structure"""
        response = requests.get(f"{BASE_URL}/api/agents")
        assert response.status_code == 200
        agents = response.json()
        
        for agent in agents:
            assert "id" in agent
            assert "name" in agent
            assert "type" in agent
            assert "status" in agent
            assert "confidence" in agent
            assert "last_action" in agent
            assert "decisions_today" in agent
            assert "metrics" in agent
            assert "updated_at" in agent
            
            # Verify confidence is a valid percentage
            assert 0 <= agent["confidence"] <= 1
            assert agent["decisions_today"] >= 0
    
    def test_get_demand_agent(self):
        """Test GET /api/agents/demand"""
        response = requests.get(f"{BASE_URL}/api/agents/demand")
        assert response.status_code == 200
        agent = response.json()
        assert agent["type"] == "demand"
        assert agent["name"] == "DEMAND FORECASTER"
        assert agent["confidence"] == 0.94
    
    def test_get_procurement_agent(self):
        """Test GET /api/agents/procurement"""
        response = requests.get(f"{BASE_URL}/api/agents/procurement")
        assert response.status_code == 200
        agent = response.json()
        assert agent["type"] == "procurement"
        assert agent["name"] == "PROCUREMENT OPTIMIZER"
    
    def test_get_logistics_agent(self):
        """Test GET /api/agents/logistics"""
        response = requests.get(f"{BASE_URL}/api/agents/logistics")
        assert response.status_code == 200
        agent = response.json()
        assert agent["type"] == "logistics"
        assert agent["name"] == "LOGISTICS ROUTER"
    
    def test_get_risk_agent(self):
        """Test GET /api/agents/risk"""
        response = requests.get(f"{BASE_URL}/api/agents/risk")
        assert response.status_code == 200
        agent = response.json()
        assert agent["type"] == "risk"
        assert agent["name"] == "RISK SENTINEL"
    
    def test_get_orchestrator_agent(self):
        """Test GET /api/agents/orchestrator"""
        response = requests.get(f"{BASE_URL}/api/agents/orchestrator")
        assert response.status_code == 200
        agent = response.json()
        assert agent["type"] == "orchestrator"
        assert agent["name"] == "NEXUS ORCHESTRATOR"
    
    def test_get_invalid_agent(self):
        """Test GET /api/agents/invalid returns 404"""
        response = requests.get(f"{BASE_URL}/api/agents/invalid_agent")
        assert response.status_code == 404


class TestMetricsEndpoint:
    """Tests for /api/metrics endpoint"""
    
    def test_get_metrics(self):
        """Test GET /api/metrics returns correct structure"""
        response = requests.get(f"{BASE_URL}/api/metrics")
        assert response.status_code == 200
        metrics = response.json()
        
        assert "total_shipments" in metrics
        assert "on_time_delivery" in metrics
        assert "cost_savings" in metrics
        assert "active_suppliers" in metrics
        assert "risk_alerts" in metrics
        assert "quantum_optimizations" in metrics
        
        # Verify reasonable values
        assert metrics["total_shipments"] > 10000
        assert 95 <= metrics["on_time_delivery"] <= 100
        assert metrics["cost_savings"] > 2000000
        assert metrics["active_suppliers"] == 847
        assert metrics["risk_alerts"] == 3


class TestBlockchainEndpoint:
    """Tests for /api/blockchain/transactions endpoint"""
    
    def test_get_blockchain_transactions(self):
        """Test GET /api/blockchain/transactions"""
        response = requests.get(f"{BASE_URL}/api/blockchain/transactions")
        assert response.status_code == 200
        transactions = response.json()
        
        assert len(transactions) >= 3
        
        for tx in transactions:
            assert "id" in tx
            assert "type" in tx
            assert "parties" in tx
            assert "amount" in tx
            assert "status" in tx
            assert "timestamp" in tx
            assert "hash" in tx


class TestQuantumEndpoints:
    """Tests for /api/quantum endpoints"""
    
    def test_get_quantum_optimizations(self):
        """Test GET /api/quantum/optimizations"""
        response = requests.get(f"{BASE_URL}/api/quantum/optimizations")
        assert response.status_code == 200
        optimizations = response.json()
        
        assert len(optimizations) >= 1
        
        for opt in optimizations:
            assert "id" in opt
            assert "problem_type" in opt
            assert "nodes" in opt
            assert "vehicles" in opt
            assert "status" in opt
            assert "classical_time" in opt
            assert "quantum_time" in opt
    
    def test_trigger_quantum_optimization(self):
        """Test POST /api/quantum/optimize"""
        response = requests.post(f"{BASE_URL}/api/quantum/optimize")
        assert response.status_code == 200
        result = response.json()
        
        assert "id" in result
        assert result["status"] == "queued"
        assert "estimated_time" in result


class TestRiskEndpoint:
    """Tests for /api/risk/alerts endpoint"""
    
    def test_get_risk_alerts(self):
        """Test GET /api/risk/alerts"""
        response = requests.get(f"{BASE_URL}/api/risk/alerts")
        assert response.status_code == 200
        alerts = response.json()
        
        assert len(alerts) >= 3
        
        for alert in alerts:
            assert "id" in alert
            assert "severity" in alert
            assert "supplier" in alert
            assert "issue" in alert
            assert "probability" in alert
            assert "recommendation" in alert
            
            # Verify severity is valid
            assert alert["severity"] in ["high", "medium", "low"]


class TestCommandEndpoint:
    """Tests for /api/command endpoint - LLM command processing"""
    
    def test_system_status_command(self):
        """Test 'show system status' command returns agents component"""
        response = requests.post(
            f"{BASE_URL}/api/command",
            json={"command": "show system status", "session_id": "test-session-1"},
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "response" in data
        assert "ui_components" in data
        assert "intent" in data
        
        # Should return agents component
        component_types = [c["type"] for c in data["ui_components"]]
        assert "agents" in component_types, f"Expected 'agents' in components, got: {component_types}"
    
    def test_risk_assessment_command(self):
        """Test 'risk assessment' command returns risk_alerts component"""
        response = requests.post(
            f"{BASE_URL}/api/command",
            json={"command": "risk assessment", "session_id": "test-session-2"},
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "response" in data
        assert "ui_components" in data
        
        # Should return risk-related components
        component_types = [c["type"] for c in data["ui_components"]]
        assert any(t in component_types for t in ["risk_alerts", "agents", "supplier_network"]), \
            f"Expected risk-related components, got: {component_types}"
    
    def test_optimize_routes_command(self):
        """Test 'optimize routes' command returns map/logistics component"""
        response = requests.post(
            f"{BASE_URL}/api/command",
            json={"command": "optimize routes", "session_id": "test-session-3"},
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "response" in data
        assert "ui_components" in data
        
        # Should return logistics-related components
        component_types = [c["type"] for c in data["ui_components"]]
        assert any(t in component_types for t in ["map", "quantum", "metrics"]), \
            f"Expected logistics-related components, got: {component_types}"
    
    def test_blockchain_ledger_command(self):
        """Test 'blockchain ledger' command returns blockchain component"""
        response = requests.post(
            f"{BASE_URL}/api/command",
            json={"command": "show blockchain ledger", "session_id": "test-session-4"},
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "response" in data
        assert "ui_components" in data
        
        # Should return blockchain component
        component_types = [c["type"] for c in data["ui_components"]]
        assert "blockchain" in component_types, f"Expected 'blockchain' in components, got: {component_types}"
    
    def test_timeline_command(self):
        """Test 'show timeline' command returns timeline component"""
        response = requests.post(
            f"{BASE_URL}/api/command",
            json={"command": "show decision timeline", "session_id": "test-session-5"},
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "response" in data
        assert "ui_components" in data
        
        component_types = [c["type"] for c in data["ui_components"]]
        assert "timeline" in component_types, f"Expected 'timeline' in components, got: {component_types}"
    
    def test_world_model_command(self):
        """Test '3d visualization' command returns world_model component"""
        response = requests.post(
            f"{BASE_URL}/api/command",
            json={"command": "show 3d digital twin", "session_id": "test-session-6"},
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "response" in data
        assert "ui_components" in data
        
        component_types = [c["type"] for c in data["ui_components"]]
        assert "world_model" in component_types, f"Expected 'world_model' in components, got: {component_types}"
    
    def test_demo_walkthrough_command(self):
        """Test 'demo walkthrough' command returns demo component"""
        response = requests.post(
            f"{BASE_URL}/api/command",
            json={"command": "start demo walkthrough", "session_id": "test-session-7"},
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "response" in data
        assert "ui_components" in data
        
        component_types = [c["type"] for c in data["ui_components"]]
        assert "demo" in component_types, f"Expected 'demo' in components, got: {component_types}"
    
    def test_command_response_structure(self):
        """Test command response has correct structure"""
        response = requests.post(
            f"{BASE_URL}/api/command",
            json={"command": "hello", "session_id": "test-session-8"},
            timeout=30
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "response" in data
        assert "ui_components" in data
        assert "intent" in data
        assert isinstance(data["ui_components"], list)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
