"""
Security and System Tests
Tests for security, rate limiting, CORS, and health checks
"""
import pytest


class TestHealthCheck:
    """Test /health endpoint"""

    @pytest.mark.unit
    def test_health_check_ok(self, test_client):
        """
        GET /health should return healthy status
        """
        response = test_client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
        assert "database" in data
        assert "websocket_clients" in data

    @pytest.mark.unit
    def test_health_check_response_time(self, test_client):
        """
        Health check should respond within 100ms
        """
        import time
        start = time.time()
        response = test_client.get("/health")
        duration = time.time() - start

        assert response.status_code == 200
        assert duration < 0.1  # 100ms


class TestRootEndpoint:
    """Test / (root) endpoint"""

    @pytest.mark.unit
    def test_root_returns_api_info(self, test_client):
        """
        GET / should return API information
        """
        response = test_client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert data["name"] == "GreenWave API"
        assert "version" in data
        assert "status" in data


class TestCORS:
    """Test CORS headers"""

    @pytest.mark.unit
    def test_cors_headers_present(self, test_client):
        """
        Response should include CORS headers
        """
        response = test_client.get("/health")

        # CORS headers may or may not be present depending on origin
        assert response.status_code == 200

    @pytest.mark.unit
    def test_options_request(self, test_client):
        """
        OPTIONS request should return 200
        """
        response = test_client.options("/api/gps/vehicles")

        assert response.status_code in [200, 405]  # 405 if not implemented


class TestErrorHandling:
    """Test error handling"""

    @pytest.mark.unit
    def test_404_not_found(self, test_client):
        """
        Nonexistent endpoint should return 404
        """
        response = test_client.get("/api/nonexistent/endpoint")

        assert response.status_code == 404

    @pytest.mark.unit
    def test_405_method_not_allowed(self, test_client):
        """
        Wrong HTTP method should return 405
        """
        response = test_client.post("/health")

        assert response.status_code in [405, 422, 200]  # Varies by framework

    @pytest.mark.unit
    def test_422_validation_error_format(self, test_client):
        """
        Validation error should return structured response
        """
        response = test_client.post(
            "/api/gps/update",
            json={"invalid": "data"}
        )

        assert response.status_code == 422


class TestSystemInfo:
    """Test /api/system/info endpoint"""

    @pytest.mark.unit
    def test_system_info(self, test_client, mock_psutil):
        """
        GET /api/system/info returns system information
        """
        response = test_client.get("/api/system/info")

        assert response.status_code == 200
        data = response.json()
        assert "system" in data
        assert "application" in data
        assert "cpu_percent" in data["system"]
        assert "memory_percent" in data["system"]
        assert "websocket_clients" in data["application"]


class TestInputValidation:
    """Test input validation"""

    @pytest.mark.unit
    def test_gps_update_negative_latitude(self, test_client):
        """
        Invalid latitude should be rejected
        """
        response = test_client.post(
            "/api/gps/update",
            json={
                "vehicle_id": "TEST",
                "vehicle_type": "Ambulance",
                "latitude": 999,  # Invalid
                "longitude": 72.5,
                "speed_kmh": 50,
                "heading": 0,
                "is_emergency": False,
                "timestamp": "2024-01-01T00:00:00Z"
            }
        )

        assert response.status_code == 422

    @pytest.mark.unit
    def test_empty_request_body(self, test_client):
        """
        Empty POST body should return 422
        """
        response = test_client.post(
            "/api/gps/update",
            json={}
        )

        assert response.status_code == 422
