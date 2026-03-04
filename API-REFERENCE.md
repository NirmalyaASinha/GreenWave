# GreenWave API Reference

Complete API documentation with all endpoints, request/response formats, and examples.

**Base URL**: `http://localhost:8000`
**API Version**: 1.0
**Documentation**: http://localhost:8000/docs (Swagger UI)

## Table of Contents

1. [GPS Tracking](#gps-tracking)
2. [Corridor Management](#corridor-management)
3. [Incidents](#incidents)
4. [Analytics](#analytics)
5. [Hardware](#hardware)
6. [Demo/Simulation](#demosimulation)
7. [System](#system)
8. [WebSocket](#websocket)
9. [Error Handling](#error-handling)

---

## GPS Tracking

### POST `/api/gps/update`

Submit vehicle GPS position and emergency status.

**Request Body**:
```json
{
  "vehicle_id": "AMB-001",
  "vehicle_type": "AMBULANCE",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "speed_kmh": 85,
  "acceleration_kmh_s": 18,
  "is_emergency": true
}
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| vehicle_id | String | Yes | Unique vehicle identifier |
| vehicle_type | String | Yes | AMBULANCE, FIRE_TRUCK, POLICE |
| latitude | Float | Yes | Geographic latitude (-90 to 90) |
| longitude | Float | Yes | Geographic longitude (-180 to 180) |
| speed_kmh | Float | Yes | Current speed in km/h |
| acceleration_kmh_s | Float | Yes | Speed change in km/h per second |
| is_emergency | Boolean | Yes | Emergency flag |

**Response (200 OK)**:
```json
{
  "vehicle_id": "AMB-001",
  "corridor_activated": true,
  "corridor_id": "CORR-001",
  "message": "Emergency corridor activated",
  "destination": "Apollo Hospital"
}
```

**Response (422 Validation Error)**:
```json
{
  "detail": [
    {
      "type": "float_parsing",
      "loc": ["body", "latitude"],
      "msg": "Input should be a valid number",
      "input": "invalid"
    }
  ]
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8000/api/gps/update \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": "AMB-001",
    "vehicle_type": "AMBULANCE",
    "latitude": 13.0827,
    "longitude": 80.2707,
    "speed_kmh": 85,
    "acceleration_kmh_s": 18,
    "is_emergency": true
  }'
```

---

### GET `/api/gps/vehicles`

Get active vehicles with optional filtering.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| vehicle_type | String | Optional | Filter by AMBULANCE, FIRE_TRUCK, POLICE |
| within_minutes | Integer | 5 | Only vehicles updated in last N minutes |
| limit | Integer | 100 | Maximum results to return |

**Response (200 OK)**:
```json
{
  "total": 3,
  "vehicles": [
    {
      "vehicle_id": "AMB-001",
      "vehicle_type": "AMBULANCE",
      "latitude": 13.0827,
      "longitude": 80.2707,
      "speed_kmh": 85,
      "acceleration_kmh_s": 18,
      "is_emergency": true,
      "last_updated": "2024-01-15T10:30:45.123Z",
      "corridor_active": true,
      "corridor_id": "CORR-001"
    },
    {
      "vehicle_id": "FIRE-002",
      "vehicle_type": "FIRE_TRUCK",
      "latitude": 13.0850,
      "longitude": 80.2720,
      "speed_kmh": 65,
      "acceleration_kmh_s": 10,
      "is_emergency": false,
      "last_updated": "2024-01-15T10:30:40.123Z",
      "corridor_active": false,
      "corridor_id": null
    }
  ]
}
```

**cURL Example**:
```bash
# All active vehicles
curl http://localhost:8000/api/gps/vehicles

# Only ambulances
curl "http://localhost:8000/api/gps/vehicles?vehicle_type=AMBULANCE"

# Updated in last 10 minutes
curl "http://localhost:8000/api/gps/vehicles?within_minutes=10"
```

---

### GET `/api/gps/vehicle/{vehicle_id}/history`

Get position history for specific vehicle.

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| vehicle_id | String | Vehicle identifier |

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| hours | Integer | 24 | Hours of history to fetch |
| limit | Integer | 1000 | Maximum positions to return |

**Response (200 OK)**:
```json
{
  "vehicle_id": "AMB-001",
  "total_points": 45,
  "positions": [
    {
      "latitude": 13.0827,
      "longitude": 80.2707,
      "speed_kmh": 85,
      "timestamp": "2024-01-15T10:30:45.123Z"
    },
    {
      "latitude": 13.0835,
      "longitude": 80.2710,
      "speed_kmh": 88,
      "timestamp": "2024-01-15T10:31:00.123Z"
    }
  ]
}
```

**Response (404 Not Found)**:
```json
{
  "detail": "Vehicle AMB-999 not found"
}
```

**cURL Example**:
```bash
# Last 24 hours
curl http://localhost:8000/api/gps/vehicle/AMB-001/history

# Last 7 days
curl "http://localhost:8000/api/gps/vehicle/AMB-001/history?hours=168"
```

---

## Corridor Management

### GET `/api/corridor/active`

Get all active emergency corridors.

**Response (200 OK)**:
```json
{
  "active_corridors": 2,
  "total_vehicles": 2,
  "corridors": [
    {
      "corridor_id": "CORR-001",
      "vehicle_id": "AMB-001",
      "vehicle_type": "AMBULANCE",
      "status": "ACTIVE",
      "activated_at": "2024-01-15T10:30:45.123Z",
      "destination": "Apollo Hospital",
      "intersections_count": 12,
      "estimated_time_minutes": 15,
      "eta_arrival": "2024-01-15T10:45:45.123Z"
    }
  ]
}
```

**cURL Example**:
```bash
curl http://localhost:8000/api/corridor/active
```

---

### GET `/api/corridor/{corridor_id}`

Get detailed corridor information.

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| corridor_id | String | Corridor identifier |

**Response (200 OK)**:
```json
{
  "corridor_id": "CORR-001",
  "vehicle_id": "AMB-001",
  "vehicle_type": "AMBULANCE",
  "status": "ACTIVE",
  "start_point": {
    "latitude": 13.0827,
    "longitude": 80.2707
  },
  "end_point": {
    "latitude": 13.0547,
    "longitude": 80.2807
  },
  "intersections": [
    {
      "intersection_id": "INT-001",
      "latitude": 13.0820,
      "longitude": 80.2710,
      "signal_duration_seconds": 30,
      "order": 1
    }
  ],
  "route_json": {...},
  "total_distance_km": 5.2,
  "time_saved_minutes": 3,
  "activated_at": "2024-01-15T10:30:45.123Z"
}
```

**cURL Example**:
```bash
curl http://localhost:8000/api/corridor/CORR-001
```

---

### POST `/api/corridor/{corridor_id}/deactivate`

Stop active corridor and end signal control.

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| corridor_id | String | Corridor identifier |

**Response (200 OK)**:
```json
{
  "corridor_id": "CORR-001",
  "status": "COMPLETED",
  "duration_seconds": 1200,
  "time_saved_minutes": 3,
  "message": "Corridor deactivated successfully"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8000/api/corridor/CORR-001/deactivate
```

---

### GET `/api/corridor/statistics/summary`

Get corridor statistics and performance metrics.

**Response (200 OK)**:
```json
{
  "total_corridors": 156,
  "active_corridors": 2,
  "completed_corridors": 154,
  "total_time_saved_minutes": 487,
  "average_time_saved": 3.12,
  "lives_impacted": 234,
  "peak_hour": 18,
  "avg_duration_seconds": 900,
  "ambulance_corridors": 89,
  "fire_corridors": 45,
  "police_corridors": 22
}
```

**cURL Example**:
```bash
curl http://localhost:8000/api/corridor/statistics/summary
```

---

## Incidents

### GET `/api/incidents/recent`

Get recent incidents with pagination.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | Integer | 50 | Results per page |
| offset | Integer | 0 | Pagination offset |
| hours | Integer | Optional | Filter last N hours |
| status | String | Optional | ACTIVE or RESOLVED |

**Response (200 OK)**:
```json
{
  "total": 156,
  "limit": 50,
  "offset": 0,
  "incidents": [
    {
      "incident_id": "INC-001",
      "threat_type": "EMERGENCY_DETECTION",
      "vehicle_id": "AMB-001",
      "vehicle_type": "AMBULANCE",
      "latitude": 13.0827,
      "longitude": 80.2707,
      "status": "RESOLVED",
      "detected_at": "2024-01-15T10:30:45.123Z",
      "resolved_at": "2024-01-15T10:40:45.123Z",
      "response_time_seconds": 600
    }
  ]
}
```

**cURL Example**:
```bash
# Last 50 incidents
curl http://localhost:8000/api/incidents/recent

# Last 24 hours
curl "http://localhost:8000/api/incidents/recent?hours=24"

# Pagination: page 2 with 25 per page
curl "http://localhost:8000/api/incidents/recent?limit=25&offset=25"
```

---

### GET `/api/incidents/{incident_id}`

Get detailed incident information.

**Response (200 OK)**:
```json
{
  "incident_id": "INC-001",
  "threat_type": "EMERGENCY_DETECTION",
  "vehicle_id": "AMB-001",
  "vehicle_type": "AMBULANCE",
  "corridor_id": "CORR-001",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "status": "RESOLVED",
  "detected_at": "2024-01-15T10:30:45.123Z",
  "resolved_at": "2024-01-15T10:40:45.123Z",
  "response_time_seconds": 600,
  "details": {
    "speed_kmh": 85,
    "acceleration_kmh_s": 18,
    "triggers": ["speed_exceeded", "explicit_emergency"]
  }
}
```

---

### POST `/api/incidents/{incident_id}/resolve`

Mark incident as resolved.

**Response (200 OK)**:
```json
{
  "incident_id": "INC-001",
  "status": "RESOLVED",
  "resolved_at": "2024-01-15T10:40:45.123Z"
}
```

---

### GET `/api/incidents/statistics`

Get incident statistics by type.

**Response (200 OK)**:
```json
{
  "total_incidents": 156,
  "by_type": {
    "EMERGENCY_DETECTION": 89,
    "CONFLICT_DETECTED": 34,
    "ROUTE_TIMEOUT": 12,
    "GPS_ERROR": 8,
    "HARDWARE_ALERT": 13
  },
  "by_status": {
    "RESOLVED": 145,
    "ACTIVE": 11
  },
  "average_response_time_seconds": 45,
  "min_response_time_seconds": 5,
  "max_response_time_seconds": 180,
  "resolution_rate_percent": 98.5
}
```

---

## Analytics

### GET `/api/analytics/summary`

Overall system statistics and performance metrics.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| timeframe | String | all_time | today, this_week, all_time |

**Response (200 OK)**:
```json
{
  "today": {
    "total_corridors": 23,
    "total_time_saved_minutes": 72,
    "lives_impacted": 67,
    "active_corridors": 2
  },
  "this_week": {
    "total_corridors": 147,
    "total_time_saved_minutes": 487,
    "lives_impacted": 234,
    "active_corridors": 5
  },
  "all_time": {
    "total_corridors": 1247,
    "total_time_saved_minutes": 3847,
    "lives_impacted": 2341,
    "active_corridors": 8
  }
}
```

**cURL Example**:
```bash
curl http://localhost:8000/api/analytics/summary
```

---

### GET `/api/analytics/hourly`

Hourly corridor activation data (24 data points).

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| duration_hours | Integer | 24 | Analysis window (1-168) |

**Response (200 OK)**:
```json
{
  "hours": 24,
  "data": [
    {"hour": 0, "corridors": 2, "time_saved": 6},
    {"hour": 1, "corridors": 1, "time_saved": 3},
    {"hour": 2, "corridors": 0, "time_saved": 0},
    ...
    {"hour": 23, "corridors": 5, "time_saved": 15}
  ],
  "total_corridors": 45,
  "total_time_saved": 135,
  "peak_hour": 18
}
```

**cURL Example**:
```bash
# Last 24 hours
curl http://localhost:8000/api/analytics/hourly

# Last 7 days (168 hours)
curl "http://localhost:8000/api/analytics/hourly?duration_hours=168"
```

---

### GET `/api/analytics/daily`

Daily corridor activation data.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| days | Integer | 7 | 7 or 30 days |

**Response (200 OK)**:
```json
{
  "days": 7,
  "data": [
    {
      "date": "2024-01-15",
      "day": "Monday",
      "corridors": 23,
      "time_saved": 72,
      "incidents": 5
    },
    {
      "date": "2024-01-14",
      "day": "Sunday",
      "corridors": 18,
      "time_saved": 54,
      "incidents": 4
    }
  ],
  "total_corridors": 147,
  "total_time_saved": 487,
  "average_daily": 21
}
```

---

### GET `/api/analytics/response-trend`

Response time trends over time.

**Response (200 OK)**:
```json
{
  "data": [
    {"hour": "09:00", "avg_response_time": 45},
    {"hour": "10:00", "avg_response_time": 38},
    {"hour": "11:00", "avg_response_time": 52}
  ],
  "min_response_time": 15,
  "max_response_time": 120,
  "average_response_time": 48
}
```

---

### GET `/api/analytics/vehicle-type-breakdown`

Corridor distribution by vehicle type.

**Response (200 OK)**:
```json
{
  "ambulance": {
    "count": 89,
    "percentage": 57.0,
    "time_saved": 278
  },
  "fire_truck": {
    "count": 45,
    "percentage": 28.8,
    "time_saved": 145
  },
  "police": {
    "count": 22,
    "percentage": 14.1,
    "time_saved": 64
  }
}
```

---

### GET `/api/analytics/top-corridors`

Highest performing corridors by time saved.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | Integer | 10 | Number of corridors |

**Response (200 OK)**:
```json
{
  "limit": 10,
  "corridors": [
    {
      "corridor_id": "CORR-001",
      "vehicle_type": "AMBULANCE",
      "time_saved": 12,
      "activations": 5,
      "average_time_saved": 2.4
    },
    {
      "corridor_id": "CORR-002",
      "vehicle_type": "AMBULANCE",
      "time_saved": 10,
      "activations": 4,
      "average_time_saved": 2.5
    }
  ]
}
```

---

## Hardware

### GET `/api/hardware/status`

Get current hardware component status.

**Response (200 OK)**:
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "overall_status": "HEALTHY",
  "components": {
    "GPS": {
      "status": "OK",
      "last_fix": "2024-01-15T10:30:30.123Z",
      "signal_quality": 95
    },
    "ESP8266": {
      "status": "OK",
      "signal_strength": -45,
      "connected": true
    },
    "Arduino": {
      "status": "OK",
      "uptime_seconds": 345600,
      "relay_status": "online"
    },
    "SIM800L": {
      "status": "OK",
      "signal_strength": -75,
      "sms_pending": 0
    },
    "RPi": {
      "status": "OK",
      "cpu_percent": 45.2,
      "memory_percent": 58.4
    }
  }
}
```

---

### GET `/api/hardware/health`

System health check with component scores.

**Response (200 OK)**:
```json
{
  "overall_health": "GOOD",
  "health_percentage": 87,
  "cpu_percent": 45.2,
  "memory_percent": 58.4,
  "disk_percent": 72.1,
  "temperature_celsius": 52.3,
  "component_scores": {
    "GPS": 95,
    "ESP8266": 100,
    "Arduino": 100,
    "SIM800L": 92,
    "RPi": 78
  },
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

---

### GET `/api/hardware/logs/{component}`

Get component-specific logs.

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| component | String | GPS, ESP8266, Arduino, SIM800L, or RPi |

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | Integer | 100 | Max results |
| hours | Integer | 24 | Time window |

**Response (200 OK)**:
```json
{
  "component": "GPS",
  "total_events": 245,
  "logs": [
    {
      "timestamp": "2024-01-15T10:30:45.123Z",
      "status": "OK",
      "message": "Position fix acquired",
      "details": {"latitude": 13.0827, "longitude": 80.2707}
    }
  ]
}
```

---

### POST `/api/hardware/alert/{component}`

Log a hardware alert event.

**Request Body**:
```json
{
  "status": "ERROR",
  "message": "GPS signal lost",
  "details": {"signal_quality": 0}
}
```

**Response (200 OK)**:
```json
{
  "alert_id": "ALERT-001",
  "component": "GPS",
  "status": "ERROR",
  "logged_at": "2024-01-15T10:30:45.123Z"
}
```

---

## Demo/Simulation

### POST `/api/demo/trigger`

Create a test vehicle and corridor for demonstration.

**Request Body**:
```json
{
  "vehicle_type": "AMBULANCE",
  "destination": "Hospital",
  "latitude": 13.0827,
  "longitude": 80.2707
}
```

**Response (200 OK)**:
```json
{
  "vehicle_id": "AMB-TEST-001",
  "corridor_id": "CORR-TEST-001",
  "message": "Demo vehicle created and corridor activated"
}
```

---

### POST `/api/demo/conflict`

Create overlapping vehicles to test conflict resolution.

**Response (200 OK)**:
```json
{
  "ambulance_id": "AMB-DEMO-001",
  "police_id": "POLICE-DEMO-001",
  "message": "Conflict scenario created",
  "result": "Ambulance receives corridor, Police receives alternate route"
}
```

---

### POST `/api/demo/reset`

Clear all demo vehicles and corridors.

**Response (200 OK)**:
```json
{
  "message": "Demo data cleared",
  "cleared": {
    "demo_vehicles": 3,
    "demo_corridors": 2
  }
}
```

---

### GET `/api/demo/scenarios`

Get available test scenarios.

**Response (200 OK)**:
```json
{
  "scenarios": [
    {
      "id": "simple_ambulance",
      "name": "Single Ambulance",
      "description": "One ambulance triggers corridor",
      "vehicles": 1
    },
    {
      "id": "conflict_scenario",
      "name": "Conflict Resolution",
      "description": "Two vehicles with overlapping routes",
      "vehicles": 2
    }
  ]
}
```

---

## System

### GET `/health`

Health check endpoint.

**Response (200 OK)**:
```json
{
  "status": "healthy",
  "database": "connected",
  "websocket_clients": 3,
  "timestamp": "2024-01-15T10:30:45.123Z",
  "uptime_seconds": 3600
}
```

---

### GET `/`

API information and metadata.

**Response (200 OK)**:
```json
{
  "application": "GreenWave",
  "version": "1.0.0",
  "environment": "development",
  "api_version": "1.0",
  "documentation": "http://localhost:8000/docs"
}
```

---

## WebSocket

### Connection

Connect to `ws://localhost:8000/ws`

### Receive Messages

Server sends JSON messages:

```json
{
  "type": "VEHICLE_UPDATE",
  "data": {
    "vehicle_id": "AMB-001",
    "latitude": 13.0827,
    "longitude": 80.2707,
    "speed_kmh": 85
  },
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

### Send Messages

Client can send:

```json
{
  "type": "PING"
}
```

**Response**:
```json
{
  "type": "PONG",
  "timestamp": "2024-01-15T10:30:46.123Z"
}
```

### Message Types

| Type | Direction | Description |
|------|-----------|-------------|
| VEHICLE_UPDATE | Server | Vehicle position changed |
| CORRIDOR_ACTIVATED | Server | New corridor started |
| CORRIDOR_DEACTIVATED | Server | Corridor completed |
| CONFLICT_DETECTED | Server | Priority resolution occurred |
| INCIDENT_REPORTED | Server | New incident logged |
| HARDWARE_ALERT | Server | Hardware component issue |
| PING | Client | Keepalive check |
| PONG | Server | Keepalive response |

---

## Error Handling

### Standard Error Response

All errors return JSON with HTTP status code:

```json
{
  "detail": "String describing the error",
  "error_code": "ERROR_TYPE",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

### Common Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | GET request successful |
| 201 | Created | Resource created |
| 204 | No Content | Deletion successful |
| 400 | Bad Request | Invalid query parameters |
| 404 | Not Found | Vehicle/corridor not found |
| 422 | Validation Error | Invalid JSON structure |
| 500 | Server Error | Database connection failed |

### Validation Error Response (422)

```json
{
  "detail": [
    {
      "type": "float_parsing",
      "loc": ["body", "latitude"],
      "msg": "Input should be a valid number",
      "input": "invalid"
    },
    {
      "type": "string_pattern",
      "loc": ["body", "vehicle_type"],
      "msg": "String should match pattern '^(AMBULANCE|FIRE_TRUCK|POLICE)$'",
      "input": "INVALID_TYPE"
    }
  ]
}
```

---

## Rate Limiting

Current implementation has no rate limiting. For production, consider:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get("/api/gps/vehicles")
@limiter.limit("100/minute")
async def get_vehicles(request: Request):
    # ...
```

---

## Authentication

Currently demo-only. For production, add:

```python
from fastapi.security import HTTPBearer, HTTPAuthCredentials

security = HTTPBearer()

@app.get("/api/protected")
async def protected(credentials: HTTPAuthCredentials = Depends(security)):
    token = credentials.credentials
    # Validate token...
```

---

**Last Updated**: March 5, 2026
**Status**: Complete ✅
