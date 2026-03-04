# GREENWARE Backend - Configuration
import os
from pathlib import Path

# Environment
DEBUG = os.getenv("DEBUG", "true").lower() == "true"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./greenwave.db")
DB_ECHO = DEBUG

# WebSocket
WS_HEARTBEAT_INTERVAL = 10  # seconds
WS_PING_TIMEOUT = 5  # seconds
WS_MESSAGE_QUEUE_SIZE = 50

# GPS
GPS_EMERGENCY_SPEED_THRESHOLD = 70  # kmh
GPS_EMERGENCY_ACCELERATION_THRESHOLD = 15  # kmh/s²
EMERGENCY_HOURS_START = 22  # 10 PM
EMERGENCY_HOURS_END = 6  # 6 AM

# Corridor
CORRIDOR_SIGNAL_GREEN_DURATION = 30  # seconds before vehicle arrives
SIGNAL_CASCADE_INTERVAL = 2  # seconds between intersections
CORRIDOR_CACHE_TIMEOUT = 3600  # seconds

# Conflict Resolution Priorities
VEHICLE_PRIORITIES = {
    "ambulance_cardiac": 1,
    "ambulance_trauma": 2,
    "ambulance_general": 3,
    "fire_building": 4,
    "fire_vehicle": 5,
    "police_armed": 6,
    "police_pursuit": 7,
    "police_general": 8,
}

CONFLICT_OVERLAP_THRESHOLD = 200  # meters

# SMS
SMS_PORT = os.getenv("SMS_PORT", "/dev/ttyUSB0")
SMS_BAUD_RATE = 9600
SMS_DESTINATION = os.getenv("SMS_DESTINATION", "+918901234567")
SMS_RETRY_COUNT = 1

# Demo
DEMO_SPAWN_RADIUS = 4000  # meters from city center
DEMO_VEHICLE_UPDATE_INTERVAL = 2  # seconds
DEMO_CITY_CENTER_LAT = 23.1815
DEMO_CITY_CENTER_LNG = 72.5371

# API
API_TITLE = "GreenWave Emergency Response System"
API_VERSION = "1.0.0"
ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:5173"]

# Rate Limiting
RATELIMIT_REQUESTS = 100
RATELIMIT_PERIOD = 60  # seconds

# Log
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
LOG_LEVEL = "DEBUG" if DEBUG else "INFO"

# Paths
BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "greenwave.db"
