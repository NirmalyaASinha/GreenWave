"""
Incident Router Tests
Tests for incident logging and tracking
"""
import pytest
from datetime import datetime, timedelta
from backend.models import Incident


class TestGetRecentIncidents:
    """Test GET /api/incidents/recent endpoint"""

    @pytest.mark.unit
    def test_incidents_recent(self, test_client, sample_incidents):
        """
        GET /api/incidents/recent returns recent incidents
        """
        response = test_client.get("/api/incidents/recent")

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert "id" in data[0]
        assert "vehicle_id" in data[0]
        assert "threat_type" in data[0]

    @pytest.mark.unit
    def test_incidents_recent_with_limit(self, test_client, sample_incidents):
        """
        GET /api/incidents/recent?limit=2 respects limit
        """
        response = test_client.get("/api/incidents/recent?limit=2")

        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 2

    @pytest.mark.unit
    def test_incidents_recent_with_hours(self, test_client, test_db_session):
        """
        GET /api/incidents/recent?hours=1 filters by time
        """
        # Create incident 30 minutes ago
        from backend.models import Vehicle, Corridor
        vehicle = Vehicle(
            vehicle_id="TEST-VEH",
            vehicle_type="Ambulance",
            latitude=23.18,
            longitude=72.53,
            speed_kmh=50,
            is_emergency=False
        )
        test_db_session.add(vehicle)
        test_db_session.flush()

        corridor = Corridor(
            vehicle_id=vehicle.vehicle_id,
            activated_at=datetime.utcnow() - timedelta(minutes=30),
            route_json={},
            status="ACTIVE"
        )
        test_db_session.add(corridor)
        test_db_session.flush()

        incident = Incident(
            corridor_id=corridor.id,
            vehicle_id=vehicle.vehicle_id,
            vehicle_type="Ambulance",
            threat_type="EMERGENCY",
            created_at=datetime.utcnow() - timedelta(minutes=30)
        )
        test_db_session.add(incident)
        test_db_session.commit()

        response = test_client.get("/api/incidents/recent?hours=1")
        assert response.status_code == 200
        assert len(response.json()) >= 1


class TestGetIncidentDetails:
    """Test GET /api/incidents/{id} endpoint"""

    @pytest.mark.unit
    def test_incident_details(self, test_client, sample_incident):
        """
        GET /api/incidents/{id} returns full details
        """
        response = test_client.get(f"/api/incidents/{sample_incident.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_incident.id
        assert data["vehicle_id"] == sample_incident.vehicle_id
        assert data["threat_type"] == sample_incident.threat_type

    @pytest.mark.unit
    def test_incident_not_found(self, test_client):
        """
        GET /api/incidents/{id} with invalid ID
        """
        response = test_client.get("/api/incidents/9999")
        assert response.status_code == 404


class TestResolveIncident:
    """Test POST /api/incidents/{id}/resolve endpoint"""

    @pytest.mark.unit
    def test_resolve_incident(self, test_client, test_db_session, sample_incident):
        """
        POST /api/incidents/{id}/resolve marks as resolved
        """
        response = test_client.post(f"/api/incidents/{sample_incident.id}/resolve")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "resolved_at" in data

        # Verify in database
        incident = test_db_session.query(Incident).filter(
            Incident.id == sample_incident.id
        ).first()
        assert incident.resolved_at is not None

    @pytest.mark.unit
    def test_resolve_already_resolved(self, test_client, test_db_session, sample_incident):
        """
        POST /api/incidents/{id}/resolve on already resolved incident
        """
        # Resolve once
        test_client.post(f"/api/incidents/{sample_incident.id}/resolve")

        # Try again
        response = test_client.post(f"/api/incidents/{sample_incident.id}/resolve")

        # Should succeed or return message
        assert response.status_code == 200


class TestGetIncidentsByType:
    """Test GET /api/incidents/by-type/{type} endpoint"""

    @pytest.mark.unit
    def test_incidents_by_type(self, test_client, sample_incidents):
        """
        GET /api/incidents/by-type/{type} filters by threat type
        """
        response = test_client.get("/api/incidents/by-type/EMERGENCY_DETECTION")

        assert response.status_code == 200
        data = response.json()
        if len(data) > 0:
            assert all(i["threat_type"] == "EMERGENCY_DETECTION" for i in data)

    @pytest.mark.unit
    def test_incidents_by_type_empty(self, test_client):
        """
        GET /api/incidents/by-type/{type} with no matches
        """
        response = test_client.get("/api/incidents/by-type/NONEXISTENT")

        assert response.status_code == 200
        assert response.json() == []


class TestIncidentStatistics:
    """Test GET /api/incidents/statistics/breakdown endpoint"""

    @pytest.mark.unit
    def test_incident_statistics(self, test_client, sample_incidents):
        """
        GET /api/incidents/statistics/breakdown returns statistics
        """
        response = test_client.get("/api/incidents/statistics/breakdown")

        assert response.status_code == 200
        data = response.json()
        assert "total_incidents" in data
        assert "resolved_incidents" in data
        assert "sms_notifications_sent" in data
        assert "average_response_time_minutes" in data
        assert "by_threat_type" in data
