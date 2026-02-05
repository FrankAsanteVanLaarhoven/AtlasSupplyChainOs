#!/usr/bin/env python3
"""
NEXUS Supply Chain OS - Backend API Testing
Tests all API endpoints for the NEXUS system
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, List, Any

class NexusAPITester:
    def __init__(self, base_url="https://atlas-supply.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.session_id = f"test-session-{datetime.now().strftime('%H%M%S')}"

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")
        
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append({"test": name, "details": details})

    def test_api_root(self) -> bool:
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Status: {response.status_code}, Message: {data.get('message', 'N/A')}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("API Root Endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("API Root Endpoint", False, f"Error: {str(e)}")
            return False

    def test_agents_endpoint(self) -> bool:
        """Test agents endpoint"""
        try:
            response = requests.get(f"{self.api_url}/agents", timeout=10)
            success = response.status_code == 200
            
            if success:
                agents = response.json()
                expected_agents = ['demand', 'procurement', 'logistics', 'risk', 'orchestrator']
                agent_types = [agent.get('type') for agent in agents]
                
                all_agents_present = all(agent_type in agent_types for agent_type in expected_agents)
                success = success and all_agents_present and len(agents) == 5
                
                details = f"Status: {response.status_code}, Agents: {len(agents)}, Types: {agent_types}"
                if not all_agents_present:
                    details += f" - Missing agents: {set(expected_agents) - set(agent_types)}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Agents Endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("Agents Endpoint", False, f"Error: {str(e)}")
            return False

    def test_specific_agent(self, agent_type: str) -> bool:
        """Test specific agent endpoint"""
        try:
            response = requests.get(f"{self.api_url}/agents/{agent_type}", timeout=10)
            success = response.status_code == 200
            
            if success:
                agent = response.json()
                required_fields = ['id', 'name', 'type', 'status', 'confidence', 'last_action']
                has_required_fields = all(field in agent for field in required_fields)
                success = success and has_required_fields and agent.get('type') == agent_type
                
                details = f"Status: {response.status_code}, Type: {agent.get('type')}, Name: {agent.get('name')}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test(f"Agent {agent_type.title()} Endpoint", success, details)
            return success
        except Exception as e:
            self.log_test(f"Agent {agent_type.title()} Endpoint", False, f"Error: {str(e)}")
            return False

    def test_metrics_endpoint(self) -> bool:
        """Test metrics endpoint"""
        try:
            response = requests.get(f"{self.api_url}/metrics", timeout=10)
            success = response.status_code == 200
            
            if success:
                metrics = response.json()
                required_fields = ['total_shipments', 'on_time_delivery', 'cost_savings', 'active_suppliers', 'risk_alerts', 'quantum_optimizations']
                has_required_fields = all(field in metrics for field in required_fields)
                success = success and has_required_fields
                
                details = f"Status: {response.status_code}, Shipments: {metrics.get('total_shipments')}, Suppliers: {metrics.get('active_suppliers')}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Metrics Endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("Metrics Endpoint", False, f"Error: {str(e)}")
            return False

    def test_blockchain_transactions(self) -> bool:
        """Test blockchain transactions endpoint"""
        try:
            response = requests.get(f"{self.api_url}/blockchain/transactions", timeout=10)
            success = response.status_code == 200
            
            if success:
                transactions = response.json()
                success = success and isinstance(transactions, list) and len(transactions) > 0
                
                if transactions:
                    tx = transactions[0]
                    required_fields = ['id', 'type', 'parties', 'amount', 'status', 'timestamp', 'hash']
                    has_required_fields = all(field in tx for field in required_fields)
                    success = success and has_required_fields
                
                details = f"Status: {response.status_code}, Transactions: {len(transactions)}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Blockchain Transactions", success, details)
            return success
        except Exception as e:
            self.log_test("Blockchain Transactions", False, f"Error: {str(e)}")
            return False

    def test_quantum_optimizations(self) -> bool:
        """Test quantum optimizations endpoint"""
        try:
            response = requests.get(f"{self.api_url}/quantum/optimizations", timeout=10)
            success = response.status_code == 200
            
            if success:
                optimizations = response.json()
                success = success and isinstance(optimizations, list) and len(optimizations) > 0
                
                if optimizations:
                    opt = optimizations[0]
                    required_fields = ['id', 'problem_type', 'nodes', 'vehicles', 'status']
                    has_required_fields = all(field in opt for field in required_fields)
                    success = success and has_required_fields
                
                details = f"Status: {response.status_code}, Optimizations: {len(optimizations)}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Quantum Optimizations", success, details)
            return success
        except Exception as e:
            self.log_test("Quantum Optimizations", False, f"Error: {str(e)}")
            return False

    def test_risk_alerts(self) -> bool:
        """Test risk alerts endpoint"""
        try:
            response = requests.get(f"{self.api_url}/risk/alerts", timeout=10)
            success = response.status_code == 200
            
            if success:
                alerts = response.json()
                success = success and isinstance(alerts, list) and len(alerts) > 0
                
                if alerts:
                    alert = alerts[0]
                    required_fields = ['id', 'severity', 'supplier', 'issue', 'probability']
                    has_required_fields = all(field in alert for field in required_fields)
                    success = success and has_required_fields
                
                details = f"Status: {response.status_code}, Alerts: {len(alerts)}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Risk Alerts", success, details)
            return success
        except Exception as e:
            self.log_test("Risk Alerts", False, f"Error: {str(e)}")
            return False

    def test_command_endpoint(self) -> bool:
        """Test command processing endpoint"""
        try:
            test_command = "Show system status"
            payload = {
                "command": test_command,
                "session_id": self.session_id
            }
            
            response = requests.post(f"{self.api_url}/command", json=payload, timeout=15)
            success = response.status_code == 200
            
            if success:
                result = response.json()
                required_fields = ['response', 'ui_components', 'intent']
                has_required_fields = all(field in result for field in required_fields)
                
                has_ui_components = isinstance(result.get('ui_components'), list)
                success = success and has_required_fields and has_ui_components
                
                details = f"Status: {response.status_code}, Components: {len(result.get('ui_components', []))}, Intent: {result.get('intent')}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Command Processing", success, details)
            return success
        except Exception as e:
            self.log_test("Command Processing", False, f"Error: {str(e)}")
            return False

    def test_phase2_components(self) -> bool:
        """Test Phase 2 specific UI components"""
        phase2_tests = [
            ("Show logistics map", "map"),
            ("Show supplier network", "supplier_network"),
            ("explain decision trace", "neuro_symbolic")
        ]
        
        all_passed = True
        for command, expected_component in phase2_tests:
            try:
                payload = {
                    "command": command,
                    "session_id": self.session_id
                }
                
                response = requests.post(f"{self.api_url}/command", json=payload, timeout=15)
                success = response.status_code == 200
                
                if success:
                    result = response.json()
                    components = result.get('ui_components', [])
                    component_types = [comp.get('type') for comp in components]
                    
                    has_expected = expected_component in component_types
                    success = success and has_expected
                    
                    details = f"Command: '{command}' -> Components: {component_types}, Expected: {expected_component}"
                    if not has_expected:
                        details += f" - MISSING {expected_component}"
                else:
                    details = f"Status: {response.status_code}"
                
                self.log_test(f"Phase 2 Component: {expected_component}", success, details)
                if not success:
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Phase 2 Component: {expected_component}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_phase3_components(self) -> bool:
        """Test Phase 3 specific UI components - Scenario Planner and Contract Intelligence"""
        phase3_tests = [
            ("Show scenario planner", "scenario_planner"),
            ("What if supplier fails", "scenario_planner"),
            ("Show contracts", "contracts"),
            ("Contract intelligence", "contracts"),
            ("Smart contracts", "contracts")
        ]
        
        all_passed = True
        for command, expected_component in phase3_tests:
            try:
                payload = {
                    "command": command,
                    "session_id": self.session_id
                }
                
                response = requests.post(f"{self.api_url}/command", json=payload, timeout=15)
                success = response.status_code == 200
                
                if success:
                    result = response.json()
                    components = result.get('ui_components', [])
                    component_types = [comp.get('type') for comp in components]
                    
                    has_expected = expected_component in component_types
                    success = success and has_expected
                    
                    details = f"Command: '{command}' -> Components: {component_types}, Expected: {expected_component}"
                    if not has_expected:
                        details += f" - MISSING {expected_component}"
                else:
                    details = f"Status: {response.status_code}"
                
                self.log_test(f"Phase 3 Component: {expected_component}", success, details)
                if not success:
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Phase 3 Component: {expected_component}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_quantum_trigger(self) -> bool:
        """Test quantum optimization trigger"""
        try:
            response = requests.post(f"{self.api_url}/quantum/optimize", timeout=10)
            success = response.status_code == 200
            
            if success:
                result = response.json()
                required_fields = ['id', 'status', 'message']
                has_required_fields = all(field in result for field in required_fields)
                success = success and has_required_fields
                
                details = f"Status: {response.status_code}, Job ID: {result.get('id')}, Status: {result.get('status')}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Quantum Optimization Trigger", success, details)
            return success
        except Exception as e:
            self.log_test("Quantum Optimization Trigger", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self) -> Dict[str, Any]:
        """Run all API tests"""
        print("🚀 Starting NEXUS Supply Chain OS API Tests")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Core API tests
        self.test_api_root()
        self.test_agents_endpoint()
        
        # Individual agent tests
        for agent_type in ['demand', 'procurement', 'logistics', 'risk', 'orchestrator']:
            self.test_specific_agent(agent_type)
        
        # Data endpoints
        self.test_metrics_endpoint()
        self.test_blockchain_transactions()
        self.test_quantum_optimizations()
        self.test_risk_alerts()
        
        # Interactive endpoints
        self.test_command_endpoint()
        self.test_phase2_components()
        self.test_phase3_components()
        self.test_quantum_trigger()
        
        # Summary
        print("=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for failed in self.failed_tests:
                print(f"  - {failed['test']}: {failed['details']}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": len(self.failed_tests),
            "success_rate": success_rate,
            "failures": self.failed_tests
        }

def main():
    """Main test execution"""
    tester = NexusAPITester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    return 0 if results["success_rate"] == 100 else 1

if __name__ == "__main__":
    sys.exit(main())