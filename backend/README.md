# GreenWave Backend API

Production-grade FastAPI backend for the GreenWave emergency response corridor management system.

## Features

- **Real-time GPS Tracking** - Track emergency vehicles with automatic emergency detection
- **Emergency Corridors** - Activate traffic signal sequences along vehicle routes
- **Conflict Resolution** - Priority-based resolution for overlapping emergency routes
- **WebSocket Updates** - Real-time updates to all connected clients via WebSocket
- **SMS Notifications** - Send alerts via SIM800L GSM module
- **Analytics Dashboard** - Comprehensive statistics and performance metrics
- **Hardware Monitoring** - Real-time health checks for all system components
- **Demo/Simulation Mode** - Test scenarios without real emergency vehicles

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── config.py              # Configuration management
├── database.py            # SQLAlchemy setup
├── models.py              # Database models
├── schemas.py             # Pydantic request/response schemas
├── websocket_manager.py   # WebSocket connection management
├── routers/               # API endpoint routers
│   ├── gps.py            # GPS tracking endpoints
│   ├── corridor.py       # Emergency corridor management
│   ├── incidents.py      # Incident logging and tracking
│   ├── analytics.py      # Analytics and reporting
│   ├── hardware.py       # Hardware status and monitoring
│   └── demo.py           # Demo and simulation endpoints
└── services/              # Business logic services
    ├── route_engine.py   # Route calculation and waypoints
    ├── signal_cascade.py # Traffic signal timing
    ├── conflict.py       # Conflict resolution
    ├── sms_service.py    # SMS notification service
    └── simulation.py     # Vehicle simulation for demos
```

## Installation

### 1. Create Python Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment (Optional)

Create a `.env` file in the backend directory:

```env
DEBUG=true
DATABASE_URL=sqlite:///./greenwave.db
GPS_SPEED_THRESHOLD_KMH=70
GPS_ACCELERATION_THRESHOLD=15
LOG_LEVEL=INFO
```

### 4. Initialize Database

```bash
python -c "from backend.database import init_db; init_db()"
```

## Running the Backend

### Development Server

```bash
# Using Uvicorn directly
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Or using the main script
cd backend && python main.py
```

The API will be available at:
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **WebSocket**: ws://localhost:8000/ws

### Production Server

```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker backend.main:app --bind 0.0.0.0:8000
```

## API Endpoints

### GPS Tracking (`/api/gps`)

- `POST /api/gps/update` - Update vehicle GPS position
  - Triggers emergency detection and corridor activation
  - Returns ETA and corridor activation status

- `GET /api/gps/vehicles` - Get active emergency vehicles
  - Query filter by vehicle type

- `GET /api/gps/vehicle/{vehicle_id}/history` - Get vehicle position history

### Corridors (`/api/corridor`)

- `GET /api/corridor/active` - Get all active emergency corridors
- `POST /api/corridor/{corridor_id}/deactivate` - Stop corridor activation
- `GET /api/corridor/{corridor_id}` - Get corridor details
- `GET /api/corridor/statistics/summary` - Corridor activation statistics

### Incidents (`/api/incidents`)

- `GET /api/incidents/recent` - Get recent incidents
- `GET /api/incidents/{incident_id}` - Get incident details
- `POST /api/incidents/{incident_id}/resolve` - Mark incident resolved
- `GET /api/incidents/by-type/{threat_type}` - Filter by threat type
- `GET /api/incidents/statistics/breakdown` - Incident statistics

### Analytics (`/api/analytics`)

- `GET /api/analytics/summary` - Overall statistics summary
- `GET /api/analytics/hourly` - Hourly activation data
- `GET /api/analytics/daily` - Daily activation data
- `GET /api/analytics/response-trend` - Response time trends
- `GET /api/analytics/vehicle-types` - Breakdown by vehicle type
- `GET /api/analytics/top-corridors` - Best performing corridors

### Hardware (`/api/hardware`)

- `GET /api/hardware/status` - Current component status
- `GET /api/hardware/logs/{component}` - Component event logs
- `GET /api/hardware/health` - System health check
- `POST /api/hardware/alert/{component}` - Log hardware alert
- `GET /api/hardware/statistics` - Component availability stats

### Demo/Simulation (`/api/demo`)

- `POST /api/demo/trigger` - Trigger single demo vehicle
- `POST /api/demo/conflict` - Trigger conflict scenario
- `GET /api/demo/active-vehicles` - Get active simulated vehicles
- `POST /api/demo/reset` - Clear all demo data
- `GET /api/demo/scenarios` - List available test scenarios
- `POST /api/demo/scenario/{scenario_id}` - Run predefined scenario

## WebSocket Usage

Connect to `ws://localhost:8000/ws` to receive real-time updates:

### Receive Messages

```json
{
  "type": "CORRIDOR_ACTIVATED",
  "corridor_id": 1,
  "vehicle_id": "A-12345",
  "vehicle_type": "Ambulance",
  "eta_minutes": 8,
  "intersections": 12,
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

### Send Messages

```json
{
  "type": "PING"
}
```

Response:
```json
{
  "type": "PONG",
  "timestamp": "2024-01-15T10:30:46.123Z"
}
```

## Emergency Detection Algorithm

Vehicles are automatically detected as emergencies when **2 or more flags** occur:

1. **Speed Flag**: Current speed > 70 km/h
2. **Acceleration Flag**: Speed increase > 15 km/h per second
3. **Time Flag**: Operating hour is before 6 AM or after 10 PM
4. **Explicit Flag**: Vehicle sends emergency flag

When detected, a corridor is automatically activated with:
- Position → City Center route
- Signal cascade (30 seconds green at each intersection)
- SMS notification to responder
- WebSocket broadcast to all clients

## Conflict Resolution

When multiple emergency vehicles need overlapping corridors:

1. **Detect Overlap**: Check if routes share intersection within 200m
2. **Compare Priority**:
   - Ambulance Cardiac (1) ← Highest
   - Ambulance General (2)
   - Fire Truck Structural (3)
   - Fire Truck Medical (4)
   - Police Traffic (5)
   - Police General (6) ← Lowest

3. **Resolution**:
   - Higher priority vehicle gets corridor
   - Other vehicle notified of alternate route
   - Conflict logged to database

## Configuration

Key parameters in `config.py`:

```python
# GPS Detection
GPS_CONFIG = {
    "speed_threshold_kmh": 70,           # Speed threshold for emergency
    "acceleration_threshold_kmh_s": 15,  # Acceleration threshold
    "unusual_hours": {                   # Off-peak hours
        "before_hour": 6,
        "after_hour": 22
    }
}

# Corridor Timing
CORRIDOR_SIGNAL_GREEN_TIME = 30         # 30 seconds green before arrival
CORRIDOR_SIGNAL_INTERVAL = 2            # 2 seconds between intersections

# Conflict Priority (lower = higher priority)
CONFLICT_RESOLUTION_PRIORITY = {
    "Ambulance_Cardiac": 1,
    "Ambulance_General": 2,
    "Fire_Truck_Structural": 3,
    # ... (8 total vehicle types)
}

# Hardware Ports
SMS_CONFIG = {
    "port": "/dev/ttyUSB0",
    "baud_rate": 9600,
    "max_retries": 1
}
```

## Database Schema

### Vehicle
Track active emergency vehicles with GPS location and status

### Corridor
Emergency activation events with route geometry and time savings

### Incident
Detailed incident log with threat classification and resolution

### HardwareLog
Component status history for monitoring and diagnostics

### SignalEvent
Traffic signal activation events with timing information

## Testing with Demo Endpoints

### 1. Trigger Single Vehicle

```bash
curl -X POST http://localhost:8000/api/demo/trigger \
  -H "Content-Type: application/json" \
  -d '{"vehicle_type": "Ambulance"}'
```

### 2. Trigger Conflict Scenario

```bash
curl -X POST http://localhost:8000/api/demo/conflict
```

### 3. Get Analytics

```bash
curl http://localhost:8000/api/analytics/summary
```

### 4. Reset Demo

```bash
curl -X POST http://localhost:8000/api/demo/reset
```

## Frontend Integration

The React frontend connects via:

1. **REST API**: For data queries (analytics, incident logs, etc.)
2. **WebSocket**: For real-time updates (corridor activation, deactivation)

See `/../frontend` for the React application.

## Hardware Integration

### GPS (Neo-6M)
- Receives position updates from vehicle-mounted unit
- Shows online/offline status and last ping time

### Arduino + Signal Board
- Receives relay commands for traffic signal control
- 8 outputs for controlling signal phases

### SIM800L
- Sends SMS alerts for corridor activation
- Sends conflict resolution notifications

### WiFi (ESP8266)
- Provides WiFi connectivity for remote monitoring

### Raspberry Pi
- Runs this backend application
- Monitors CPU, memory, and temperature
- Logs hardware status

## Monitoring

### Health Check

```bash
curl http://localhost:8000/health
```

### System Info

```bash
curl http://localhost:8000/api/system/info
```

### WebSocket Connections

The `/health` endpoint includes:
- Database connection status
- Connected WebSocket client count
- System resource usage

## Logging

Logs include timestamps and [WS] prefix for WebSocket operations:

```
2024-01-15 10:30:45,123 - backend.routers.gps - INFO - GPS update from A-12345: (23.1815, 72.5371) @ 75kmh
2024-01-15 10:30:46,456 - backend.websocket_manager - INFO - [WS] 📢 BROADCAST: CORRIDOR_ACTIVATED to 3 clients
2024-01-15 10:30:47,789 - backend.services.signal_cascade - INFO - Signal cascade calculated: 12 signal commands
```

## Troubleshooting

### Database Locked
```bash
rm greenwave.db  # Delete SQLite database and restart
```

### WebSocket Connection Refused
- Ensure `ws://localhost:8000/ws` is accessible
- Check firewall and port 8000

### GPS not triggering emergency
- Check speed and acceleration thresholds in config.py
- Verify vehicle type is supported

### SMS not sending
- Verify SIM800L is connected to /dev/ttyUSB0
- Check SIM card has active plan
- Review sms_service.py logs

## Future Enhancements

- [ ] HTTPS/WSS support with SSL certificates
- [ ] User authentication with JWT tokens
- [ ] API rate limiting per user
- [ ] Map integration with CartoDB
- [ ] Real OSM network for routing (OSMnx integration)
- [ ] Database backups and archival
- [ ] Performance metrics and dashboards
- [ ] Load testing setup with Locust

## Support

For issues or questions, check:
1. Backend logs: `tail -f logs/greenwave.log`
2. Database: `sqlite3 greenwave.db`
3. API docs: http://localhost:8000/docs
