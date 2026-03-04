"""
Pytest configuration and fixtures for GreenWave backend tests
"""
import pytest
import asyncio
from datetime import datetime, timedelta
from unittest.mock import MagicMock, AsyncMock, patch
from typing import Generator

# Database
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

# FastAPI
from fastapi.testclient import TestClient
from httpx import AsyncClient

# Backend imports
from backend.main import app
from backend.database import Base, get_db
from backend.models import Vehicle, Corridor, Incident, HardwareLog, SignalEvent
from backend.config import CONFLICT_RESOLUTION_PRIORITY


# ─────────────────────────────────────────────────────────────
# DATABASE FIXTURES
# ─────────────────────────────────────────────────────────────

@pytest.fixture(scope="function")
def test_db_engine():
    """Create an in-memory SQLite database for testing"""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def test_db_session(test_db_engine) -> Generator[Session, None, None]:
    """Create a fresh database session for each test"""
    connection = test_db_engine.connect()
    transaction = connection.begin()
    session = sessionmaker(autocommit=False, autoflush=False, bind=connection)()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def test_client(test_db_session: Session) -> TestClient:
    """Create a test client with dependency override"""

    def override_get_db():
        yield test_db_session

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
async def async_test_client(test_db_session: Session):
    """Create an async test client for WebSocket tests"""

    def override_get_db():
        yield test_db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()


# ─────────────────────────────────────────────────────────────
# MOCK HARDWARE FIXTURES
# ─────────────────────────────────────────────────────────────

@pytest.fixture
def mock_serial():
    """Mock PySerial for Arduino communication"""
    with patch("serial.Serial") as mock_serial_class:
        mock_instance = MagicMock()
        mock_instance.is_open = True
        mock_instance.write = MagicMock(return_value=10)
        mock_instance.read = MagicMock(return_value=b"OK")
        mock_instance.readline = MagicMock(return_value=b"OK\r\n")
        mock_serial_class.return_value = mock_instance
        yield mock_instance


@pytest.fixture
def mock_osmnx():
    """Mock OSMnx for route calculation"""
    with patch("osmnx.graph_from_bbox") as mock_graph:
        mock_instance = MagicMock()
        mock_graph.return_value = mock_instance
        yield mock_instance


@pytest.fixture
def mock_psutil():
    """Mock psutil for system monitoring"""
    with patch("psutil.cpu_percent") as mock_cpu, \
         patch("psutil.virtual_memory") as mock_mem:
        mock_cpu.return_value = 45.2
        mock_mem.return_value = MagicMock(
            percent=58.4,
            available=2147483648,
            used=1073741824
        )
        yield {"cpu": mock_cpu, "mem": mock_mem}


# ─────────────────────────────────────────────────────────────
# TEST DATA FACTORIES
# ─────────────────────────────────────────────────────────────

@pytest.fixture
def sample_vehicle(test_db_session: Session) -> Vehicle:
    """Create a sample vehicle in the database"""
    vehicle = Vehicle(
        vehicle_id="AMB-001",
        vehicle_type="Ambulance",
        latitude=23.1815,
        longitude=72.5371,
        speed_kmh=40.0,
        is_emergency=False,
        last_updated=datetime.utcnow()
    )
    test_db_session.add(vehicle)
    test_db_session.commit()
    return vehicle


@pytest.fixture
def sample_vehicles(test_db_session: Session) -> list:
    """Create multiple sample vehicles"""
    vehicles = [
        Vehicle(
            vehicle_id="AMB-001",
            vehicle_type="Ambulance",
            latitude=23.1815,
            longitude=72.5371,
            speed_kmh=45.0,
            is_emergency=False,
            last_updated=datetime.utcnow()
        ),
        Vehicle(
            vehicle_id="FIRE-001",
            vehicle_type="Fire Truck",
            latitude=23.1820,
            longitude=72.5375,
            speed_kmh=50.0,
            is_emergency=False,
            last_updated=datetime.utcnow()
        ),
        Vehicle(
            vehicle_id="POL-001",
            vehicle_type="Police",
            latitude=23.1810,
            longitude=72.5365,
            speed_kmh=60.0,
            is_emergency=False,
            last_updated=datetime.utcnow() - timedelta(minutes=2)
        ),
    ]
    for vehicle in vehicles:
        test_db_session.add(vehicle)
    test_db_session.commit()
    return vehicles


@pytest.fixture
def sample_corridor(test_db_session: Session, sample_vehicle: Vehicle) -> Corridor:
    """Create a sample corridor"""
    corridor = Corridor(
        vehicle_id=sample_vehicle.vehicle_id,
        activated_at=datetime.utcnow(),
        route_json={
            "coordinates": [
                {"lat": 23.1815, "lng": 72.5371},
                {"lat": 23.1820, "lng": 72.5375},
            ],
            "intersections": 2
        },
        eta_minutes=5,
        time_saved_minutes=None,
        status="ACTIVE"
    )
    test_db_session.add(corridor)
    test_db_session.commit()
    return corridor


@pytest.fixture
def sample_corridors(test_db_session: Session, sample_vehicles: list) -> list:
    """Create multiple sample corridors"""
    corridors = []
    for i, vehicle in enumerate(sample_vehicles[:2]):
        corridor = Corridor(
            vehicle_id=vehicle.vehicle_id,
            activated_at=datetime.utcnow() - timedelta(minutes=i),
            route_json={
                "coordinates": [
                    {"lat": vehicle.latitude, "lng": vehicle.longitude},
                    {"lat": 23.1900, "lng": 72.5400},
                ],
                "intersections": 3 + i
            },
            eta_minutes=5 + i,
            time_saved_minutes=None,
            status="ACTIVE"
        )
        corridors.append(corridor)
        test_db_session.add(corridor)
    test_db_session.commit()
    return corridors


@pytest.fixture
def sample_incident(test_db_session: Session, sample_corridor: Corridor) -> Incident:
    """Create a sample incident"""
    incident = Incident(
        corridor_id=sample_corridor.id,
        vehicle_id=sample_corridor.vehicle_id,
        vehicle_type="Ambulance",
        threat_type="EMERGENCY_DETECTION",
        intersections_json={
            "count": 2,
            "flags": ["highSpeed", "offPeakHour"]
        },
        sms_sent=True,
        created_at=datetime.utcnow()
    )
    test_db_session.add(incident)
    test_db_session.commit()
    return incident


@pytest.fixture
def sample_incidents(test_db_session: Session, sample_corridors: list) -> list:
    """Create multiple sample incidents"""
    incidents = []
    threat_types = [
        "EMERGENCY_DETECTION",
        "PRIORITY_CONFLICT",
        "ROUTE_CONFLICT",
        "HIGH_RISK_AREA",
        "ADVERSE_WEATHER"
    ]

    for i, corridor in enumerate(sample_corridors):
        for j in range(i + 2):
            incident = Incident(
                corridor_id=corridor.id,
                vehicle_id=corridor.vehicle_id,
                vehicle_type=corridor.vehicle_id.split("-")[0],
                threat_type=threat_types[j % len(threat_types)],
                intersections_json={"count": 3, "flags": []},
                sms_sent=j % 2 == 0,
                created_at=datetime.utcnow() - timedelta(hours=j),
                resolved_at=None if j == 0 else datetime.utcnow()
            )
            incidents.append(incident)
            test_db_session.add(incident)

    test_db_session.commit()
    return incidents


@pytest.fixture
def sample_hardware_log(test_db_session: Session) -> HardwareLog:
    """Create a sample hardware log"""
    log = HardwareLog(
        component="gps",
        status="online",
        message="GPS module online and ready",
        cpu_percent=None,
        memory_percent=None,
        created_at=datetime.utcnow()
    )
    test_db_session.add(log)
    test_db_session.commit()
    return log


# ─────────────────────────────────────────────────────────────
# UTILITY FIXTURES
# ─────────────────────────────────────────────────────────────

@pytest.fixture
def clear_tables(test_db_session: Session):
    """Clear all tables before test"""
    for table in Base.metadata.sorted_tables:
        test_db_session.execute(table.delete())
    test_db_session.commit()
    yield


@pytest.fixture(scope="function", autouse=True)
def event_loop():
    """Create an event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_websocket():
    """Mock WebSocket connection"""
    mock_ws = AsyncMock()
    mock_ws.send_json = AsyncMock()
    mock_ws.receive_json = AsyncMock()
    mock_ws.accept = AsyncMock()
    mock_ws.close = AsyncMock()
    return mock_ws


# ─────────────────────────────────────────────────────────────
# MARKER DEFINITIONS
# ─────────────────────────────────────────────────────────────

def pytest_configure(config):
    """Register custom markers"""
    config.addinivalue_line("markers", "asyncio: mark test as async")
    config.addinivalue_line("markers", "slow: mark test as slow")
    config.addinivalue_line("markers", "integration: mark test as integration")
    config.addinivalue_line("markers", "unit: mark test as unit")
