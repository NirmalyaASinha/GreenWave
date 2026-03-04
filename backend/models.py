# Database models using SQLAlchemy ORM
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.sql import func
from datetime import datetime
from backend.database import Base

class Vehicle(Base):
    """Vehicle position and status tracking"""
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String(50), unique=True, index=True)
    vehicle_type = Column(String(50))  # Ambulance, Fire Truck, Police
    latitude = Column(Float)
    longitude = Column(Float)
    speed_kmh = Column(Float, default=0)
    is_emergency = Column(Boolean, default=False)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Corridor(Base):
    """Emergency corridor activation tracking"""
    __tablename__ = "corridors"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String(50), index=True)
    activated_at = Column(DateTime, default=datetime.utcnow)
    deactivated_at = Column(DateTime, nullable=True)
    route_json = Column(JSON)  # GeoJSON coordinates
    eta_minutes = Column(Integer, nullable=True)
    time_saved_minutes = Column(Float, nullable=True)
    status = Column(String(20), default="active")  # active, completed, cancelled

class Incident(Base):
    """Incident log with resolution details"""
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    corridor_id = Column(Integer, nullable=True)
    vehicle_id = Column(String(50))
    vehicle_type = Column(String(50))
    threat_type = Column(String(100))  # cardiac, trauma, fire, etc.
    intersections_json = Column(JSON)  # affected intersections
    sms_sent = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class HardwareLog(Base):
    """Hardware component status logs"""
    __tablename__ = "hardware_logs"

    id = Column(Integer, primary_key=True, index=True)
    component = Column(String(50), index=True)  # gps, esp8266, arduino, sim800l, rpi
    status = Column(String(20))  # online, offline, error
    message = Column(Text)
    cpu_percent = Column(Float, nullable=True)
    memory_percent = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class SignalEvent(Base):
    """Traffic signal activation events"""
    __tablename__ = "signal_events"

    id = Column(Integer, primary_key=True, index=True)
    intersection_id = Column(String(50), index=True)
    state = Column(String(20))  # green, red, yellow
    activated_at = Column(DateTime, default=datetime.utcnow)
    duration_seconds = Column(Integer)
    corridor_id = Column(Integer, nullable=True)
