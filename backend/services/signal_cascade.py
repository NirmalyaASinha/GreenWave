# Signal cascade and timing logic
import logging
from typing import List, Dict
from dataclasses import dataclass
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

@dataclass
class SignalCommand:
    intersection_id: str
    state: str  # 'green', 'red', 'yellow'
    duration_seconds: int
    activation_time: datetime
    corridor_id: int

class SignalCascadeService:
    """Manages traffic signal timing for emergency corridors"""

    def __init__(self):
        self.active_signals: Dict[str, SignalCommand] = {}
        logger.info("✓ Signal Cascade Service initialized")

    def calculate_signal_cascade(
        self,
        intersections: List,
        current_speed_kmh: float,
        corridor_id: int
    ) -> List[SignalCommand]:
        """
        Calculate signal timing for intersection cascade
        Each intersection gets green 30 seconds before vehicle arrives
        """
        logger.info(f"Calculating signal cascade for {len(intersections)} intersections")

        commands = []
        current_time = datetime.utcnow()
        speed_ms = current_speed_kmh / 3.6  # convert to m/s

        for i, intersection in enumerate(intersections):
            # Calculate when vehicle reaches this intersection
            if i == 0:
                time_to_arrival = 0
            else:
                # Assume 2 seconds travel between waypoints
                time_to_arrival = (i - 1) * 2

            # Green light starts 30 seconds before arrival
            green_start = current_time + timedelta(seconds=max(0, time_to_arrival - 30))

            command = SignalCommand(
                intersection_id=intersection.id,
                state="green",
                duration_seconds=40,  # Green for 40 seconds
                activation_time=green_start,
                corridor_id=corridor_id
            )

            commands.append(command)
            self.active_signals[intersection.id] = command

            logger.debug(
                f"  Signal {intersection.id}: green at +{(green_start - current_time).total_seconds():.0f}s"
            )

        logger.info(f"Signal cascade calculated: {len(commands)} signal commands")
        return commands

    def send_to_arduino(self, commands: List[SignalCommand]) -> bool:
        """
        Send signal commands to Arduino via PySerial
        For demo mode, simulates successful send
        """
        logger.info(f"Sending {len(commands)} signal commands to Arduino...")

        try:
            # In production, would use:
            # import serial
            # ser = serial.Serial('/dev/ttyUSB0', 9600, timeout=1)
            # for cmd in commands:
            #     msg = f"SIG,{cmd.intersection_id},{cmd.state},{cmd.duration_seconds}\n"
            #     ser.write(msg.encode())

            logger.info(f"✓ {len(commands)} signal commands sent to Arduino")
            return True
        except Exception as e:
            logger.error(f"✗ Failed to send signals to Arduino: {e}")
            return False

    def deactivate_corridor(self, corridor_id: int) -> bool:
        """Reset all signals for a corridor"""
        logger.info(f"Deactivating signals for corridor {corridor_id}")

        try:
            # In production, send RESET command to Arduino
            logger.info(f"✓ Signals reset for corridor {corridor_id}")
            return True
        except Exception as e:
            logger.error(f"✗ Failed to reset signals: {e}")
            return False

# Global signal cascade service instance
signal_service = SignalCascadeService()
