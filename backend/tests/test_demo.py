"""
Demo Router Tests
Tests for simulation and demo scenarios
"""
import pytest
from backend.models import Vehicle, Corridor


class TestDemoTrigger:
    """Test POST /api/demo/trigger endpoint"""

    @pytest.mark.unit
    def test_demo_trigger_ambulance(self, test_client, test_db_session):
        """
        POST /api/demo/trigger with ambulance
        """
        response = test_client.post(
            "/api/demo/trigger",
            json={"vehicle_type": "Ambulance"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "vehicle_id" in data

    @pytest.mark.unit
    def test_demo_trigger_fire_truck(self, test_client, test_db_session):
        """
        POST /api/demo/trigger with fire truck
        """
        response = test_client.post(
            "/api/demo/trigger",
            json={"vehicle_type": "Fire Truck"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "Fire" in data["vehicle_id"] or "FIRE" in data["vehicle_id"]

    @pytest.mark.unit
    def test_demo_trigger_police(self, test_client, test_db_session):
        """
        POST /api/demo/trigger with police
        """
        response = test_client.post(
            "/api/demo/trigger",
            json={"vehicle_type": "Police"}
        )

        assert response.status_code == 200


class TestDemoConflict:
    """Test POST /api/demo/conflict endpoint"""

    @pytest.mark.unit
    def test_demo_conflict_creates_vehicles(self, test_client, test_db_session):
        """
        POST /api/demo/conflict creates 2 vehicles with overlapping routes
        """
        response = test_client.post("/api/demo/conflict")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "vehicle_1" in data
        assert "vehicle_2" in data
        assert data["conflict_scenario"] is True


class TestDemoReset:
    """Test POST /api/demo/reset endpoint"""

    @pytest.mark.unit
    def test_demo_reset_clears_corridors(self, test_client, test_db_session, sample_corridors):
        """
        POST /api/demo/reset deactivates all corridors
        """
        # Verify corridors exist
        active = test_db_session.query(Corridor).filter(
            Corridor.status == "ACTIVE"
        ).count()
        assert active >= len(sample_corridors)

        # Reset
        response = test_client.post("/api/demo/reset")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.unit
    def test_demo_active_vehicles(self, test_client):
        """
        GET /api/demo/active-vehicles returns simulated vehicles
        """
        response = test_client.get("/api/demo/active-vehicles")

        assert response.status_code == 200
        data = response.json()
        assert "count" in data
        assert "vehicles" in data


class TestDemoScenarios:
    """Test scenario endpoints"""

    @pytest.mark.unit
    def test_demo_scenarios_list(self, test_client):
        """
        GET /api/demo/scenarios returns available scenarios
        """
        response = test_client.get("/api/demo/scenarios")

        assert response.status_code == 200
        data = response.json()
        assert "scenarios" in data
        assert len(data["scenarios"]) > 0

        # Verify scenario structure
        scenario = data["scenarios"][0]
        assert "id" in scenario
        assert "name" in scenario
        assert "description" in scenario

    @pytest.mark.unit
    def test_demo_scenario_trigger(self, test_client):
        """
        POST /api/demo/scenario/{id} triggers a scenario
        """
        # Get scenarios first
        response1 = test_client.get("/api/demo/scenarios")
        scenarios = response1.json()["scenarios"]

        if scenarios:
            scenario_id = scenarios[0]["id"]
            response = test_client.post(f"/api/demo/scenario/{scenario_id}")

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
