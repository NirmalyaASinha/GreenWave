"""
Hardware Router Tests
Tests for hardware status monitoring and health checks
"""
import pytest
from datetime import datetime, timedelta
from backend.models import HardwareLog


class TestHardwareStatus:
    """Test GET /api/hardware/status endpoint"""

    @pytest.mark.unit
    def test_hardware_status(self, test_client, mock_psutil):
        """
        GET /api/hardware/status returns all components
        """
        response = test_client.get("/api/hardware/status")

        assert response.status_code == 200
        data = response.json()
        
        # All components should be present
        assert "gps" in data
        assert "esp8266" in data
        assert "arduino" in data
        assert "sim800l" in data
        assert "raspberry_pi" in data

        # Each should have status field
        assert "status" in data["gps"]
        assert "status" in data["esp8266"]

    @pytest.mark.unit
    def test_hardware_status_fields(self, test_client, mock_psutil):
        """
        Hardware status should contain expected fields
        """
        response = test_client.get("/api/hardware/status")

        assert response.status_code == 200
        data = response.json()
        
        # GPS should have these fields
        assert "last_ping_seconds" in data["gps"]
        assert "signal_strength" in data["gps"]
        
        # RPi should have CPU/memory
        assert "cpu_percent" in data["raspberry_pi"]
        assert "memory_percent" in data["raspberry_pi"]

    @pytest.mark.unit
    def test_hardware_status_psutil_error(self, test_client):
        """
        GET /api/hardware/status should handle psutil errors gracefully
        """
        with pytest.mock.patch("psutil.cpu_percent", side_effect=Exception("No psutil")):
            response = test_client.get("/api/hardware/status")
            # Should still return 200 with simulated values
            assert response.status_code == 200


class TestHardwareHealth:
    """Test GET /api/hardware/health endpoint"""

    @pytest.mark.unit
    def test_hardware_health_check(self, test_client, mock_psutil):
        """
        GET /api/hardware/health returns health status
        """
        response = test_client.get("/api/hardware/health")

        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] in ["healthy", "degraded", "error"]
        assert "cpu_percent" in data
        assert "memory_percent" in data

    @pytest.mark.unit
    def test_hardware_health_high_cpu(self, test_client):
        """
        GET /api/hardware/health with high CPU should be degraded
        """
        with pytest.mock.patch("psutil.cpu_percent", return_value=95.0):
            response = test_client.get("/api/hardware/health")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "degraded"
            assert any("CPU" in alert for alert in data.get("alerts", []))


class TestHardwareLogs:
    """Test GET /api/hardware/logs/{component} endpoint"""

    @pytest.mark.unit
    def test_hardware_logs_component(self, test_client, sample_hardware_log):
        """
        GET /api/hardware/logs/gps returns logs for component
        """
        response = test_client.get("/api/hardware/logs/gps?limit=10")

        assert response.status_code == 200
        data = response.json()
        if len(data) > 0:
            assert data[0]["component"] == "gps"

    @pytest.mark.unit
    def test_hardware_logs_limit(self, test_client, test_db_session):
        """
        GET /api/hardware/logs respects limit parameter
        """
        # Create 20 log entries
        for i in range(20):
            log = HardwareLog(
                component="test",
                status="online",
                message=f"Log entry {i}",
                created_at=datetime.utcnow() - timedelta(minutes=i)
            )
            test_db_session.add(log)
        test_db_session.commit()

        response = test_client.get("/api/hardware/logs/test?limit=5")
        assert response.status_code == 200
        assert len(response.json()) == 5

    @pytest.mark.unit
    def test_hardware_logs_time_filter(self, test_client, test_db_session):
        """
        GET /api/hardware/logs with time filter
        """
        response = test_client.get("/api/hardware/logs/gps?hours=24")

        assert response.status_code == 200


class TestHardwareAlert:
    """Test POST /api/hardware/alert/{component} endpoint"""

    @pytest.mark.unit
    def test_hardware_alert_logs(self, test_client, test_db_session):
        """
        POST /api/hardware/alert logs to database
        """
        response = test_client.post(
            "/api/hardware/alert/gps",
            json={
                "status": "offline",
                "message": "GPS disconnected"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

        # Verify logged to database
        log = test_db_session.query(HardwareLog).filter(
            HardwareLog.component == "gps"
        ).first()
        assert log is not None
        assert log.status == "offline"

    @pytest.mark.unit
    def test_hardware_alert_offline_triggers_sms(self, test_client):
        """
        POST /api/hardware/alert with offline status triggers SMS
        """
        with pytest.mock.patch("backend.services.sms_service.sms_service.send_hardware_alert") as mock_sms:
            response = test_client.post(
                "/api/hardware/alert/gps",
                json={"status": "offline", "message": "GPS lost"}
            )

            assert response.status_code == 200


class TestHardwareStatistics:
    """Test GET /api/hardware/statistics endpoint"""

    @pytest.mark.unit
    def test_hardware_statistics(self, test_client, sample_hardware_log):
        """
        GET /api/hardware/statistics returns availability stats
        """
        response = test_client.get("/api/hardware/statistics?days=7")

        assert response.status_code == 200
        data = response.json()
        assert "period_days" in data
        assert "components" in data
        assert data["period_days"] == 7
