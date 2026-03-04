"""
Analytics Router Tests
Tests for dashboard statistics and reporting
"""
import pytest
from datetime import datetime, timedelta


class TestAnalyticsSummary:
    """Test GET /api/analytics/summary endpoint"""

    @pytest.mark.unit
    def test_analytics_summary(self, test_client, sample_corridors):
        """
        GET /api/analytics/summary returns overall stats
        """
        response = test_client.get("/api/analytics/summary")

        assert response.status_code == 200
        data = response.json()
        assert "total_corridors" in data
        assert "total_time_saved_minutes" in data
        assert "average_response_time_minutes" in data
        assert "estimated_lives_impacted" in data
        assert "by_vehicle_type" in data

    @pytest.mark.unit
    def test_analytics_summary_empty(self, test_client, clear_tables):
        """
        GET /api/analytics/summary with no data
        """
        response = test_client.get("/api/analytics/summary")

        assert response.status_code == 200
        data = response.json()
        assert data["total_corridors"] == 0
        assert data["total_time_saved_minutes"] == 0


class TestHourlyAnalytics:
    """Test GET /api/analytics/hourly endpoint"""

    @pytest.mark.unit
    def test_analytics_hourly(self, test_client, sample_corridors):
        """
        GET /api/analytics/hourly returns 24 hourly data points
        """
        response = test_client.get(f"/api/analytics/hourly?hours=24")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 24
        assert all("hour" in item for item in data)
        assert all("activations" in item for item in data)

    @pytest.mark.unit
    def test_analytics_hourly_different_duration(self, test_client):
        """
        GET /api/analytics/hourly?hours=12 with different duration
        """
        response = test_client.get("/api/analytics/hourly?hours=12")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 12


class TestDailyAnalytics:
    """Test GET /api/analytics/daily endpoint"""

    @pytest.mark.unit
    def test_analytics_daily(self, test_client, sample_corridors):
        """
        GET /api/analytics/daily returns daily data
        """
        response = test_client.get("/api/analytics/daily?days=7")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 7
        assert all("date" in item for item in data)
        assert all("activations" in item for item in data)

    @pytest.mark.unit
    def test_analytics_daily_30_days(self, test_client):
        """
        GET /api/analytics/daily?days=30
        """
        response = test_client.get("/api/analytics/daily?days=30")

        assert response.status_code == 200
        assert len(response.json()) == 30


class TestResponseTrend:
    """Test GET /api/analytics/response-trend endpoint"""

    @pytest.mark.unit
    def test_analytics_response_trend(self, test_client, sample_incidents):
        """
        GET /api/analytics/response-trend returns response time trend
        """
        response = test_client.get("/api/analytics/response-trend?days=7")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 7
        if len(data) > 0:
            assert "date" in data[0]
            assert "average_response_time_minutes" in data[0]


class TestVehicleTypeBreakdown:
    """Test GET /api/analytics/vehicle-types endpoint"""

    @pytest.mark.unit
    def test_vehicle_type_breakdown(self, test_client, sample_corridors):
        """
        GET /api/analytics/vehicle-types returns breakdown by type
        """
        response = test_client.get("/api/analytics/vehicle-types")

        assert response.status_code == 200
        data = response.json()
        if len(data) > 0:
            assert "vehicle_type" in data[0]
            assert "count" in data[0]


class TestTopCorridors:
    """Test GET /api/analytics/top-corridors endpoint"""

    @pytest.mark.unit
    def test_top_corridors(self, test_client, sample_corridors):
        """
        GET /api/analytics/top-corridors returns best performing corridors
        """
        response = test_client.get("/api/analytics/top-corridors?limit=5")

        assert response.status_code == 200
        data = response.json()
        if len(data) > 0:
            assert "corridor_id" in data[0]
            assert "time_saved_minutes" in data[0]

    @pytest.mark.unit
    def test_top_corridors_respects_limit(self, test_client, sample_corridors):
        """
        GET /api/analytics/top-corridors?limit=1
        """
        response = test_client.get("/api/analytics/top-corridors?limit=1")

        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 1
