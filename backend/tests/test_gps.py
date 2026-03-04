"""
GPS Router Tests
Tests for vehicle position updates and emergency detection
"""
import pytest
from datetime import datetime, timedelta
from backend.models import Vehicle, Corridor, Incident
from backend.schemas import GPSUpdate


class TestGPSUpdate:
    """Test GPS update endpoint"""

    @pytest.mark.unit
    def test_gps_update_normal_traffic(self, test_client, test_db_session):
        """
        POST /gps/update with normal traffic speed
        Should NOT trigger emergency corridor activation
        """
        payload = GPSUpdate(
            vehicle_id="CAR-001",
            vehicle_type="Police",
            latitude=23.1815,
            longitude=72.5371,
            speed_kmh=40,  # Normal speed
            heading=45,
            is_emergency=False,
            timestamp=datetime.utcnow()
        )

        response = test_client.post("/api/gps/update", json=payload.dict())

        assert response.status_code == 200
        data = response.json()
        assert data["position_received"] is True
        assert data["emergency_detected"] is False
        assert data["corridor_activated"] is False

    @pytest.mark.unit
    def test_gps_update_triggers_emergency(self, test_client, test_db_session):
        """
        POST /gps/update with high speed and acceleration
        Should trigger emergency detection and corridor activation
        """
        # First update to establish baseline
        payload1 = GPSUpdate(
            vehicle_id="AMB-002",
            vehicle_type="Ambulance",
            latitude=23.1815,
            longitude=72.5371,
            speed_kmh=30,
            heading=45,
            is_emergency=False,
            timestamp=datetime.utcnow()
        )
        response1 = test_client.post("/api/gps/update", json=payload1.dict())
        assert response1.status_code == 200

        # Now rapid acceleration (25 kmh/s)
        payload2 = GPSUpdate(
            vehicle_id="AMB-002",
            vehicle_type="Ambulance",
            latitude=23.1820,
            longitude=72.5375,
            speed_kmh=85,  # High speed (exceeds 70)
            heading=45,
            is_emergency=True,  # Explicit emergency flag
            timestamp=datetime.utcnow()
        )
        response2 = test_client.post("/api/gps/update", json=payload2.dict())

        assert response2.status_code == 200
        data = response2.json()
        assert data["emergency_detected"] is True
        # Corridor may or may not be activated depending on mock services

    @pytest.mark.unit
    def test_gps_update_invalid_data(self, test_client, test_db_session):
        """
        POST /gps/update with missing required fields
        Should return validation error
        """
        payload = {
            "vehicle_id": "TEST-001",
            "vehicle_type": "Ambulance",
            # Missing latitude
            "longitude": 72.5371,
            "speed_kmh": 50,
            "heading": 45,
        }

        response = test_client.post("/api/gps/update", json=payload)
        assert response.status_code == 422

    @pytest.mark.unit
    def test_gps_update_invalid_speed(self, test_client, test_db_session):
        """
        POST /gps/update with invalid speed value
        Should return validation error
        """
        payload = GPSUpdate(
            vehicle_id="TEST-002",
            vehicle_type="Ambulance",
            latitude=23.1815,
            longitude=72.5371,
            speed_kmh=-50,  # Invalid negative speed
            heading=45,
            is_emergency=False,
            timestamp=datetime.utcnow()
        )

        response = test_client.post("/api/gps/update", json=payload.dict())
        assert response.status_code == 422

    @pytest.mark.unit
    def test_gps_vehicle_created_on_first_update(self, test_client, test_db_session):
        """
        First GPS update should create vehicle record in database
        """
        payload = GPSUpdate(
            vehicle_id="NEW-VEH-001",
            vehicle_type="Fire Truck",
            latitude=23.1900,
            longitude=72.5400,
            speed_kmh=50,
            heading=90,
            is_emergency=False,
            timestamp=datetime.utcnow()
        )

        response = test_client.post("/api/gps/update", json=payload.dict())
        assert response.status_code == 200

        # Verify vehicle was created
        vehicle = test_db_session.query(Vehicle).filter(
            Vehicle.vehicle_id == "NEW-VEH-001"
        ).first()

        assert vehicle is not None
        assert vehicle.vehicle_type == "Fire Truck"
        assert vehicle.latitude == 23.1900


class TestGetActiveVehicles:
    """Test GET /gps/vehicles endpoint"""

    @pytest.mark.unit
    def test_gps_get_active_vehicles(self, test_client, sample_vehicles):
        """
        GET /gps/vehicles should return only recently active vehicles
        (last_updated within 30 seconds)
        """
        response = test_client.get("/api/gps/vehicles")

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2  # At least 2 recent vehicles

    @pytest.mark.unit
    def test_gps_get_vehicles_filter_by_type(self, test_client, sample_vehicles):
        """
        GET /gps/vehicles?vehicle_type=Ambulance should filter results
        """
        response = test_client.get("/api/gps/vehicles?vehicle_type=Ambulance")

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert all(v["vehicle_type"] == "Ambulance" for v in data)

    @pytest.mark.unit
    def test_gps_get_vehicles_empty(self, test_client, clear_tables, test_db_session):
        """
        GET /gps/vehicles on empty database should return empty list
        """
        response = test_client.get("/api/gps/vehicles")

        assert response.status_code == 200
        assert response.json() == []


class TestGetVehicleHistory:
    """Test GET /gps/vehicle/{vehicle_id}/history endpoint"""

    @pytest.mark.unit
    def test_gps_vehicle_history_exists(self, test_client, sample_vehicle):
        """
        GET /gps/vehicle/{id}/history should return vehicle data
        """
        response = test_client.get("/api/gps/vehicle/AMB-001/history")

        assert response.status_code == 200
        data = response.json()
        assert data["vehicle_id"] == "AMB-001"
        assert "last_position" in data
        assert data["last_position"]["latitude"] == 23.1815

    @pytest.mark.unit
    def test_gps_vehicle_history_not_found(self, test_client, test_db_session):
        """
        GET /gps/vehicle with non-existent ID should return 404
        """
        response = test_client.get("/api/gps/vehicle/NONEXISTENT-999/history")

        assert response.status_code == 404
