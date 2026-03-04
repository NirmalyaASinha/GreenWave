# Pydantic schemas for API request/response validation
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class VehicleType(str, Enum):
    AMBULANCE = "Ambulance"
    FIRE_TRUCK = "Fire Truck"
    POLICE = "Police"

class VehicleEmergencyType(str, Enum):
    AMBULANCE_CARDIAC = "ambulance_cardiac"
    AMBULANCE_TRAUMA = "ambulance_trauma"
    AMBULANCE_GENERAL = "ambulance_general"
    FIRE_BUILDING = "fire_building"
    FIRE_VEHICLE = "fire_vehicle"
    POLICE_ARMED = "police_armed"
    POLICE_PURSUIT = "police_pursuit"
    POLICE_GENERAL = "police_general"

class CorridorStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class HardwareStatus(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    ERROR = "error"

# GPS Schemas
class GPSUpdate(BaseModel):
    vehicle_id: str
    vehicle_type: VehicleType
    latitude: float
    longitude: float
    speed: float
    heading: float
    timestamp: datetime

class GPSResponse(BaseModel):
    position_received: bool
    emergency_detected: bool
    corridor_activated: bool
    eta_minutes: Optional[int] = None

class VehicleInfo(BaseModel):
    vehicle_id: str
    vehicle_type: str
    latitude: float
    longitude: float
    speed: float
    is_emergency: bool
    last_updated: datetime

    class Config:
        from_attributes = True

# Corridor Schemas
class CorridorCreate(BaseModel):
    vehicle_id: str
    vehicle_type: str
    threat_type: str
    latitude: float
    longitude: float

class CorridorResponse(BaseModel):
    id: int
    vehicle_id: str
    activated_at: datetime
    route_json: Dict[str, Any]
    eta_minutes: Optional[int]
    status: str

    class Config:
        from_attributes = True

# Incident Schemas
class IncidentResponse(BaseModel):
    id: int
    vehicle_id: str
    vehicle_type: str
    threat_type: str
    created_at: datetime
    resolved_at: Optional[datetime]
    sms_sent: bool

    class Config:
        from_attributes = True

# Analytics Schemas
class AnalyticsSummary(BaseModel):
    total_corridors: int
    total_time_saved_minutes: float
    avg_response_time_minutes: float
    lives_impacted: int
    by_vehicle_type: Dict[str, int]

class HourlyData(BaseModel):
    hour: str
    activations: int

class DailyData(BaseModel):
    day: str
    saved: float
    avg: float

# Hardware Schemas
class HardwareComponentStatus(BaseModel):
    status: str
    last_ping: int  # seconds ago
    signal_strength: Optional[float] = None
    cpu_percent: Optional[float] = None
    memory_percent: Optional[float] = None

class HardwareStatusResponse(BaseModel):
    gps: HardwareComponentStatus
    esp8266: HardwareComponentStatus
    arduino: HardwareComponentStatus
    sim800l: HardwareComponentStatus
    raspberry_pi: HardwareComponentStatus

class HardwareLogEntry(BaseModel):
    component: str
    status: str
    message: str
    cpu_percent: Optional[float] = None
    memory_percent: Optional[float] = None

# Demo Schemas
class DemoTrigger(BaseModel):
    vehicle_type: VehicleType
    emergency_subtype: VehicleEmergencyType

# Conflict Resolution
class ConflictInfo(BaseModel):
    vehicle_id: str
    priority: int
    route: Dict[str, Any]
    is_alternate: bool = False

# WebSocket Message
class WSMessage(BaseModel):
    type: str
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Error Response
class ErrorResponse(BaseModel):
    error: str
    code: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Health Check
class HealthResponse(BaseModel):
    status: str
    uptime_seconds: int
    db_connected: bool
    websocket_clients: int
    active_corridors: int
