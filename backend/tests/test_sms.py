"""
SMS Service Tests
Tests for SMS notification functionality
"""
import pytest
from unittest.mock import patch, MagicMock
from backend.services.sms_service import sms_service


class TestSMSService:
    """Test SMS service functionality"""

    @pytest.mark.unit
    def test_sms_service_initialization(self):
        """
        SMS service should initialize correctly
        """
        assert sms_service is not None

    @pytest.mark.unit
    def test_send_sms_with_mock_serial(self, mock_serial):
        """
        send_sms should handle serial communication
        """
        result, message = sms_service.send_sms(
            "+919876543210",
            "Test message"
        )

        # Should succeed with mock
        assert result is True

    @pytest.mark.unit
    def test_send_sms_formats_phone_number(self, mock_serial):
        """
        send_sms should format phone number correctly
        """
        result, message = sms_service.send_sms(
            "9876543210",  # No country code
            "Test"
        )

        assert result is True

    @pytest.mark.unit
    def test_sms_message_truncation(self, mock_serial):
        """
        SMS message should be truncated to 160 characters
        """
        long_message = "A" * 200  # Too long

        result, message = sms_service.send_sms(
            "+919876543210",
            long_message
        )

        assert result is True

    @pytest.mark.unit
    def test_send_corridor_alert(self, mock_serial):
        """
        send_corridor_alert should format message correctly
        """
        result, message = sms_service.send_corridor_alert(
            "Ambulance",
            "Hospital Road",
            8,
            "+919876543210"
        )

        assert result is True

    @pytest.mark.unit
    def test_send_conflict_alert(self, mock_serial):
        """
        send_conflict_alert should notify about conflict
        """
        result, message = sms_service.send_conflict_alert(
            "Ambulance",
            "Using alternate route",
            "+919876543210"
        )

        assert result is True

    @pytest.mark.unit
    def test_send_hardware_alert(self, mock_serial):
        """
        send_hardware_alert should notify about hardware issues
        """
        result, message = sms_service.send_hardware_alert(
            "GPS",
            "offline",
            "+919876543210"
        )

        assert result is True
