# GPS update router - handles vehicle position tracking and emergency detection
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Vehicle, Incident
from backend.schemas import (
    GPSUpdate, GPSResponse, VehiclePosition,
    ErrorResponse
)
from backend.config import GPS_CONFIG, CONFLICT_RESOLUTION_PRIORITY
from backend.services.route_engine import route_engine
from backend.services.conflict import conflict_service
from backend.services.signal_cascade import signal_service
from backend.services.sms_service import sms_service
from backend.websocket_manager import ws_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/gps", tags=["GPS"])

# Track last positions for acceleration calculation
last_positions: dict = {}

@router.post("/update", response_model=GPSResponse)
async def update_gps(
    update: GPSUpdate,
    db: Session = Depends(get_db)
):
    """
    Handle incoming GPS position update from vehicle
    Detects emergency conditions and auto-activates corridor
    """
    logger.info(
        f"GPS update from {update.vehicle_id}: "
        f"({update.latitude:.4f}, {update.longitude:.4f}) @ {update.speed_kmh}kmh"
    )

    try:
        # Get or create vehicle record
        vehicle = db.query(Vehicle).filter(
            Vehicle.vehicle_id == update.vehicle_id
        ).first()

        if not vehicle:
            vehicle = Vehicle(
                vehicle_id=update.vehicle_id,
                vehicle_type=update.vehicle_type,
                latitude=update.latitude,
                longitude=update.longitude,
                speed_kmh=update.speed_kmh,
                is_emergency=False,
                last_updated=datetime.utcnow()
            )
            db.add(vehicle)
            logger.info(f"Created new vehicle record: {update.vehicle_id}")
        else:
            vehicle.latitude = update.latitude
            vehicle.longitude = update.longitude
            vehicle.speed_kmh = update.speed_kmh
            vehicle.last_updated = datetime.utcnow()

        # Emergency detection logic
        emergency_flags = 0
        flag_reasons = []

        # Flag 1: Speed threshold
        if update.speed_kmh > GPS_CONFIG["speed_threshold_kmh"]:
            emergency_flags += 1
            flag_reasons.append(f"highSpeed({update.speed_kmh}kmh)")

        # Flag 2: Acceleration threshold
        if update.vehicle_id in last_positions:
            last_speed = last_positions[update.vehicle_id]["speed_kmh"]
            acceleration = update.speed_kmh - last_speed
            if acceleration > GPS_CONFIG["acceleration_threshold_kmh_s"]:
                emergency_flags += 1
                flag_reasons.append(f"highAccel({acceleration:.1f}kmh/s)")

        # Flag 3: Unusual hour (before 6am or after 10pm)
        current_hour = datetime.utcnow().hour
        if current_hour < 6 or current_hour > 22:
            emergency_flags += 1
            flag_reasons.append(f"offPeakHour({current_hour}:00)")

        # Flag 4: Explicit emergency flag from vehicle
        if update.is_emergency:
            emergency_flags += 1
            flag_reasons.append("explicitEmergency")

        logger.debug(
            f"{update.vehicle_id}: {emergency_flags} flags - {flag_reasons}"
        )

        # Update position tracking
        last_positions[update.vehicle_id] = {
            "speed_kmh": update.speed_kmh,
            "timestamp": datetime.utcnow()
        }

        # Auto-activate corridor if 2+ flags
        corridor_activated = False
        eta_minutes = 0

        if emergency_flags >= 2:
            logger.warning(
                f"🚨 EMERGENCY DETECTED: {update.vehicle_id} "
                f"({emergency_flags} flags: {', '.join(flag_reasons)})"
            )

            vehicle.is_emergency = True

            # Calculate route to city center (default destination)
            route = route_engine.calculate_route(
                update.latitude,
                update.longitude,
                23.1815,  # City center latitude
                72.5371   # City center longitude
            )

            if route:
                # Check for conflicts with active corridors
                can_proceed, conflict_reason = conflict_service.resolve_conflict(
                    update.vehicle_type,
                    route.intersections
                )

                if can_proceed:
                    # Create corridor in database
                    from backend.models import Corridor
                    corridor = Corridor(
                        vehicle_id=update.vehicle_id,
                        activated_at=datetime.utcnow(),
                        route_json={
                            "coordinates": [
                                {"lat": coord[0], "lng": coord[1]}
                                for coord in route.coordinates
                            ],
                            "intersections": len(route.intersections)
                        },
                        eta_minutes=route.estimated_duration_seconds // 60,
                        time_saved_minutes=0,
                        status="ACTIVE"
                    )
                    db.add(corridor)
                    db.flush()  # Get the corridor ID

                    # Register with conflict service
                    conflict_service.register_corridor(
                        corridor.id,
                        update.vehicle_type,
                        route.intersections
                    )

                    # Generate and send signal commands
                    signal_commands = signal_service.calculate_signal_cascade(
                        route.intersections,
                        update.speed_kmh,
                        corridor.id
                    )
                    signal_service.send_to_arduino(signal_commands)

                    # Send SMS notification
                    sms_service.send_corridor_alert(
                        update.vehicle_type,
                        "City Center",
                        route.estimated_duration_seconds // 60,
                        "+919876543210",
                        corridor.id
                    )

                    corridor_activated = True
                    eta_minutes = route.estimated_duration_seconds // 60

                    logger.info(
                        f"✓ Corridor activated: {corridor.id} "
                        f"({len(route.intersections)} intersections, "
                        f"ETA: {eta_minutes}min)"
                    )

                    # Create incident record
                    incident = Incident(
                        corridor_id=corridor.id,
                        vehicle_id=update.vehicle_id,
                        vehicle_type=update.vehicle_type,
                        threat_type="EMERGENCY_DETECTION",
                        intersections_json={
                            "count": len(route.intersections),
                            "flags": flag_reasons
                        },
                        sms_sent=True,
                        created_at=datetime.utcnow()
                    )
                    db.add(incident)

                    # Broadcast corridor activation via WebSocket
                    ws_manager.broadcast({
                        "type": "CORRIDOR_ACTIVATED",
                        "corridor_id": corridor.id,
                        "vehicle_id": update.vehicle_id,
                        "vehicle_type": update.vehicle_type,
                        "latitude": update.latitude,
                        "longitude": update.longitude,
                        "eta_minutes": eta_minutes,
                        "intersections": len(route.intersections),
                        "timestamp": datetime.utcnow().isoformat()
                    })

                else:
                    logger.warning(
                        f"Corridor NOT activated due to conflict: {conflict_reason}"
                    )

                    # Send conflict SMS
                    sms_service.send_conflict_alert(
                        update.vehicle_type,
                        conflict_reason,
                        "+919876543210"
                    )

        db.commit()

        return GPSResponse(
            position_received=True,
            emergency_detected=emergency_flags >= 2,
            corridor_activated=corridor_activated,
            eta_minutes=eta_minutes,
            conflict_flags=emergency_flags
        )

    except Exception as e:
        logger.error(f"GPS update error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/vehicles", response_model=list)
async def get_active_vehicles(
    db: Session = Depends(get_db),
    vehicle_type: str = Query(None, description="Filter by vehicle type")
):
    """Get all active vehicles or filter by type"""
    try:
        query = db.query(Vehicle).filter(Vehicle.is_emergency == True)

        if vehicle_type:
            query = query.filter(Vehicle.vehicle_type == vehicle_type)

        vehicles = query.all()

        return [
            VehiclePosition(
                vehicle_id=v.vehicle_id,
                vehicle_type=v.vehicle_type,
                latitude=v.latitude,
                longitude=v.longitude,
                speed_kmh=v.speed_kmh,
                heading=0,  # Would calculate from trajectory
                is_emergency=v.is_emergency,
                last_updated=v.last_updated.isoformat()
            ).dict()
            for v in vehicles
        ]

    except Exception as e:
        logger.error(f"Get vehicles error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/vehicle/{vehicle_id}/history")
async def get_vehicle_history(
    vehicle_id: str,
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """Get position history for a vehicle"""
    try:
        vehicle = db.query(Vehicle).filter(
            Vehicle.vehicle_id == vehicle_id
        ).first()

        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")

        return {
            "vehicle_id": vehicle.vehicle_id,
            "vehicle_type": vehicle.vehicle_type,
            "last_position": {
                "latitude": vehicle.latitude,
                "longitude": vehicle.longitude,
                "speed_kmh": vehicle.speed_kmh,
                "timestamp": vehicle.last_updated.isoformat()
            },
            "is_emergency": vehicle.is_emergency,
            "history_size": 0  # Would query separate history table
        }

    except Exception as e:
        logger.error(f"Vehicle history error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
