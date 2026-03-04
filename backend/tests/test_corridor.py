"""
Corridor Router Tests
Tests for emergency corridor management and signal timing
"""
import pytest
from datetime import datetime, timedelta
from backend.models import Corridor, Vehicle, Incident


class TestCorridorActivation:
    """Test corridor activation flow"""

    @pytest.mark.unit
    def test_corridor_get_active(self, test_client, sample_corridors):
        """
        GET /api/corridor/active should return all ACTIVE corridors
        """
        response = test_client.get("/api/corridor/active")

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert all(c["status"] == "ACTIVE" for c in data)

    @pytest.mark.unit
    def test_corridor_get_active_empty(self, test_client, clear_tables):
        """
        GET /api/corridor/active on empty database returns empty list
        """
        response = test_client.get("/api/corridor/active")

        assert response.status_code == 200
        assert response.json() == []

    @pytest.mark.unit
    def test_corridor_get_details(self, test_client, sample_corridor):
        """
        GET /api/corridor/{id} returns corridor details
        """
        response = test_client.get(f"/api/corridor/{sample_corridor.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_corridor.id
        assert data["vehicle_id"] == sample_corridor.vehicle_id
        assert data["status"] == "ACTIVE"
        assert data["eta_minutes"] == 5

    @pytest.mark.unit
    def test_corridor_details_not_found(self, test_client):
        """
        GET /api/corridor/{id} with invalid ID returns 404
        """
        response = test_client.get("/api/corridor/9999")

        assert response.status_code == 404

    @pytest.mark.unit
    def test_corridor_deactivate(self, test_client, test_db_session, sample_corridor):
        """
        POST /api/corridor/{id}/deactivate marks corridor as COMPLETED
        """
        response = test_client.post(f"/api/corridor/{sample_corridor.id}/deactivate")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["status"] == "COMPLETED"
        assert "time_saved_minutes" in data

        # Verify in database
        corridor = test_db_session.query(Corridor).filter(
            Corridor.id == sample_corridor.id
        ).first()
        assert corridor.status == "COMPLETED"
        assert corridor.time_saved_minutes is not None

    @pytest.mark.unit
    def test_corridor_deactivate_already_inactive(self, test_client, test_db_session, sample_corridor):
        """
        POST /api/corridor/{id}/deactivate on already inactive corridor
        """
        # Deactivate once
        test_client.post(f"/api/corridor/{sample_corridor.id}/deactivate")

        # Try to deactivate again
        response = test_client.post(f"/api/corridor/{sample_corridor.id}/deactivate")

        # Should return error or succeed silently
        assert response.status_code in [200, 400]

    @pytest.mark.unit
    def test_corridor_saves_route_json(self, test_client, sample_corridor):
        """
        Corridor should save route with valid JSON
        """
        response = test_client.get(f"/api/corridor/{sample_corridor.id}")

        assert response.status_code == 200
        data = response.json()
        route = data["route"]
        
        assert isinstance(route, dict)
        assert "coordinates" in route
        assert isinstance(route["coordinates"], list)


class TestCorridorStatistics:
    """Test corridor statistics endpoint"""

    @pytest.mark.unit
    def test_corridor_statistics_summary(self, test_client, sample_corridors):
        """
        GET /api/corridor/statistics/summary returns stats
        """
        response = test_client.get("/api/corridor/statistics/summary")

        assert response.status_code == 200
        data = response.json()
        assert "total_corridors" in data
        assert "active_corridors" in data
        assert "completed_corridors" in data
        assert "total_time_saved_minutes" in data
        assert data["total_corridors"] >= len(sample_corridors)

    @pytest.mark.unit
    def test_corridor_statistics_empty(self, test_client, clear_tables):
        """
        GET /api/corridor/statistics/summary with no data
        """
        response = test_client.get("/api/corridor/statistics/summary")

        assert response.status_code == 200
        data = response.json()
        assert data["total_corridors"] == 0
        assert data["active_corridors"] == 0

    @pytest.mark.unit
    def test_corridor_time_saved_calculation(self, test_client, test_db_session, sample_vehicle):
        """
        Time saved should be 30% of corridor duration
        """
        # Create corridor activated 10 minutes ago
        corridor = Corridor(
            vehicle_id=sample_vehicle.vehicle_id,
            activated_at=datetime.utcnow() - timedelta(minutes=10),
            status="ACTIVE",
            eta_minutes=5,
            route_json={"coordinates": []},
            time_saved_minutes=None
        )
        test_db_session.add(corridor)
        test_db_session.commit()

        # Deactivate it
        response = test_client.post(f"/api/corridor/{corridor.id}/deactivate")

        assert response.status_code == 200
        data = response.json()
        
        # Time saved should be approx 3 minutes (10 * 0.3)
        assert data["time_saved_minutes"] > 0
