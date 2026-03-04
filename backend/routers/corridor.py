# Corridor management router - handles emergency corridors
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Corridor, Vehicle, Incident
from backend.schemas import CorridorResponse, ErrorResponse
from backend.services.route_engine import route_engine
from backend.services.conflict import conflict_service
from backend.services.signal_cascade import signal_service
from backend.services.sms_service import sms_service
from backend.websocket_manager import ws_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/corridor", tags=["Corridor"])


@router.get("/active", response_model=list)
async def get_active_corridors(db: Session = Depends(get_db)):
    """Get all currently active corridors"""
    try:
        corridors = db.query(Corridor).filter(
            Corridor.status == "ACTIVE"
        ).all()

        return [
            {
                "id": c.id,
                "vehicle_id": c.vehicle_id,
                "activated_at": c.activated_at.isoformat(),
                "eta_minutes": c.eta_minutes,
                "status": c.status,
                "intersections": len(c.route_json.get("intersections", 0))
                if c.route_json else 0
            }
            for c in corridors
        ]

    except Exception as e:
        logger.error(f"Get active corridors error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{corridor_id}/deactivate")
async def deactivate_corridor(
    corridor_id: int,
    db: Session = Depends(get_db)
):
    """Deactivate an emergency corridor"""
    try:
        corridor = db.query(Corridor).filter(
            Corridor.id == corridor_id
        ).first()

        if not corridor:
            raise HTTPException(status_code=404, detail="Corridor not found")

        if corridor.status != "ACTIVE":
            raise HTTPException(status_code=400, detail="Corridor not active")

        logger.info(f"Deactivating corridor {corridor_id}")

        # Calculate time saved
        duration = (datetime.utcnow() - corridor.activated_at).total_seconds() / 60
        time_saved_minutes = max(0, duration * 0.3)  # Estimate 30% time saved
        corridor.time_saved_minutes = time_saved_minutes

        # Mark as deactivated
        corridor.deactivated_at = datetime.utcnow()
        corridor.status = "COMPLETED"

        # Deactivate signals
        signal_service.deactivate_corridor(corridor_id)

        # Unregister from conflict service
        conflict_service.unregister_corridor(corridor_id)

        db.commit()

        logger.info(
            f"✓ Corridor {corridor_id} deactivated "
            f"(time saved: {time_saved_minutes:.0f}min)"
        )

        # Broadcast corridor deactivation
        ws_manager.broadcast({
            "type": "CORRIDOR_DEACTIVATED",
            "corridor_id": corridor_id,
            "time_saved_minutes": time_saved_minutes,
            "status": "COMPLETED",
            "timestamp": datetime.utcnow().isoformat()
        })

        return {
            "success": True,
            "corridor_id": corridor_id,
            "time_saved_minutes": time_saved_minutes,
            "deactivated_at": corridor.deactivated_at.isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Deactivate corridor error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{corridor_id}")
async def get_corridor_details(
    corridor_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed information about a corridor"""
    try:
        corridor = db.query(Corridor).filter(
            Corridor.id == corridor_id
        ).first()

        if not corridor:
            raise HTTPException(status_code=404, detail="Corridor not found")

        vehicle = db.query(Vehicle).filter(
            Vehicle.vehicle_id == corridor.vehicle_id
        ).first()

        return {
            "id": corridor.id,
            "vehicle_id": corridor.vehicle_id,
            "vehicle_type": vehicle.vehicle_type if vehicle else "Unknown",
            "activated_at": corridor.activated_at.isoformat(),
            "deactivated_at": corridor.deactivated_at.isoformat() if corridor.deactivated_at else None,
            "eta_minutes": corridor.eta_minutes,
            "time_saved_minutes": corridor.time_saved_minutes or 0,
            "status": corridor.status,
            "route": corridor.route_json or {},
            "incident_id": incident.id if incident else None,
            "intersections_cleared": corridor.route_json.get("intersections", 0)
            if corridor.route_json else 0
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get corridor details error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/statistics/summary")
async def get_corridor_statistics(db: Session = Depends(get_db)):
    """Get corridor activation statistics"""
    try:
        total_corridors = db.query(Corridor).count()
        active_corridors = db.query(Corridor).filter(
            Corridor.status == "ACTIVE"
        ).count()
        completed_corridors = db.query(Corridor).filter(
            Corridor.status == "COMPLETED"
        ).count()

        time_saved_total = 0
        for corridor in db.query(Corridor).filter(Corridor.time_saved_minutes.isnot(None)):
            time_saved_total += corridor.time_saved_minutes or 0

        # Lives impacted: assume 1 life per ambulance
        from sqlalchemy import func
        lives_impacted = db.query(func.count(Corridor.id)).filter(
            Corridor.vehicle_id.like("%Ambulance%")
        ).scalar() or 0

        return {
            "total_corridors": total_corridors,
            "active_corridors": active_corridors,
            "completed_corridors": completed_corridors,
            "total_time_saved_minutes": time_saved_total,
            "estimated_lives_impacted": lives_impacted,
            "average_time_saved_minutes": (
                time_saved_total / completed_corridors
                if completed_corridors > 0 else 0
            )
        }

    except Exception as e:
        logger.error(f"Corridor statistics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
