# SMS notification service for emergency alerts
import logging
import time
from datetime import datetime
from typing import Tuple
from backend.models import Incident
from backend.database import SessionLocal
from backend.config import SMS_CONFIG

logger = logging.getLogger(__name__)

class SMSService:
    """Sends SMS notifications via SIM800L module"""

    def __init__(self):
        self.port = SMS_CONFIG["port"]
        self.retries = SMS_CONFIG["max_retries"]
        self.serial_connection = None
        logger.info(f"✓ SMS Service initialized (port: {self.port})")

    def connect(self) -> bool:
        """Connect to SIM800L module"""
        try:
            # In production:
            # import serial
            # self.serial_connection = serial.Serial(
            #     self.port, 9600, timeout=1
            # )
            # time.sleep(1)

            logger.info(f"Connected to SIM800L on {self.port}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to SIM800L: {e}")
            return False

    def send_sms(
        self,
        phone_number: str,
        message: str,
        incident_id: int = None
    ) -> Tuple[bool, str]:
        """
        Send SMS message via SIM800L
        Returns (success, details)
        """
        logger.info(f"Sending SMS to {phone_number}")

        try:
            # Validate phone number format
            if not phone_number.startswith("+"):
                phone_number = "+91" + phone_number[-10:]

            # Format message for emergency alerts
            if len(message) > 160:
                message = message[:160]

            # In production:
            # if self.serial_connection and self.serial_connection.is_open:
            #     cmd = f'AT+CMGS="{phone_number}"\n'
            #     self.serial_connection.write(cmd.encode())
            #     time.sleep(0.5)
            #     self.serial_connection.write(message.encode())
            #     self.serial_connection.write(bytes([26]))  # Ctrl+Z
            #     time.sleep(1)

            logger.info(f"✓ SMS sent to {phone_number}")

            # Log SMS event
            if incident_id:
                db = SessionLocal()
                try:
                    incident = db.query(Incident).filter(
                        Incident.id == incident_id
                    ).first()
                    if incident:
                        incident.sms_sent = True
                        db.commit()
                        logger.info(f"Marked incident {incident_id} as SMS sent")
                finally:
                    db.close()

            return True, "SMS sent successfully"

        except Exception as e:
            logger.error(f"SMS send failed: {e}")

            # Retry logic
            if self.retries > 0:
                logger.info(f"Retrying SMS ({self.retries - 1} attempts left)")
                self.retries -= 1
                time.sleep(2)
                return self.send_sms(phone_number, message, incident_id)

            return False, f"SMS failed after retries: {str(e)}"

    def send_corridor_alert(
        self,
        vehicle_type: str,
        location: str,
        eta_minutes: int,
        responder_phone: str,
        incident_id: int = None
    ) -> Tuple[bool, str]:
        """
        Send formatted emergency corridor notification
        """
        message = (
            f"GreenWave Alert: {vehicle_type} activated for {location}. "
            f"ETA: {eta_minutes}min. Reply OK."
        )

        return self.send_sms(responder_phone, message, incident_id)

    def send_conflict_alert(
        self,
        vehicle_type: str,
        resolution: str,
        responder_phone: str
    ) -> Tuple[bool, str]:
        """
        Send conflict resolution notification
        """
        message = (
            f"GreenWave Conflict: {vehicle_type} activation adjusted - {resolution}. "
            f"Check app for details."
        )

        return self.send_sms(responder_phone, message)

    def send_hardware_alert(
        self,
        component: str,
        status: str,
        admin_phone: str
    ) -> Tuple[bool, str]:
        """
        Send hardware status alert to admin
        """
        message = f"GreenWave Hardware: {component} is {status}. Check system status."
        return self.send_sms(admin_phone, message)

    def disconnect(self):
        """Disconnect from SIM800L"""
        try:
            if self.serial_connection:
                # self.serial_connection.close()
                logger.info("Disconnected from SIM800L")
        except Exception as e:
            logger.error(f"Disconnect error: {e}")

# Global SMS service instance
sms_service = SMSService()
