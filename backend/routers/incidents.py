# Incidents router - tracks and manages emergency incidents
import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.database import get_db
from backend.models import Incident, Corridor, Vehicle
from backend.schemas import ErrorResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.get("/recent")
async def get_recent_incidents(
    limit: int = Query(50, le=500),
    hours: int = Query(24, description="Last N hours"),
    db: Session = Depends(get_db)
):
    """Get recent incidents"""
    try:
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)

        incidents = db.query(Incident).filter(
            Incident.created_at >= cutoff_time
        ).order_by(desc(Incident.created_at)).limit(limit).all()

        return [
            {
                "id": i.id,
                "vehicle_id": i.vehicle_id,
                "vehicle_type": i.vehicle_type,
                "corridor_id": i.corridor_id,
                "threat_type": i.threat_type,
                "sms_sent": i.sms_sent,
                "resolved": i.resolved_at is not None,
                "created_at": i.created_at.isoformat(),
                "resolved_at": i.resolved_at.isoformat() if i.resolved_at else None
            }
            for i in incidents
        ]

    except Exception as e:
        logger.error(f"Get recent incidents error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{incident_id}")
async def get_incident_details(
    incident_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed incident information"""
    try:
        incident = db.query(Incident).filter(
            Incident.id == incident_id
        ).first()

        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found")

        corridor = None
        if incident.corridor_id:
            corridor = db.query(Corridor).filter(
                Corridor.id == incident.corridor_id
            ).first()

        return {
            "id": incident.id,
            "vehicle_id": incident.vehicle_id,
            "vehicle_type": incident.vehicle_type,
            "threat_type": incident.threat_type,
            "corridor_id": incident.corridor_id,
            "corridor_status": corridor.status if corridor else None,
            "intersections": incident.intersections_json or {},
            "sms_sent": incident.sms_sent,
            "created_at": incident.created_at.isoformat(),
            "resolved_at": incident.resolved_at.isoformat() if incident.resolved_at else None,
            "duration_seconds": (
                (incident.resolved_at - incident.created_at).total_seconds()
                if incident.resolved_at else
                (datetime.utcnow() - incident.created_at).total_seconds()
            )
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get incident details error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{incident_id}/resolve")
async def resolve_incident(
    incident_id: int,
    db: Session = Depends(get_db)
):
    """Mark an incident as resolved"""
    try:
        incident = db.query(Incident).filter(
            Incident.id == incident_id
        ).first()

        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found")

        if incident.resolved_at:
            return {"message": "Incident already resolved"}

        incident.resolved_at = datetime.utcnow()
        db.commit()

        logger.info(f"✓ Incident {incident_id} marked as resolved")

        return {
            "success": True,
            "incident_id": incident_id,
            "resolved_at": incident.resolved_at.isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resolve incident error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/by-type/{threat_type}")
async def get_incidents_by_type(
    threat_type: str,
    limit: int = Query(50, le=500),
    db: Session = Depends(get_db)
):
    """Get incidents filtered by threat type"""
    try:
        incidents = db.query(Incident).filter(
            Incident.threat_type == threat_type
        ).order_by(desc(Incident.created_at)).limit(limit).all()

        return [
            {
                "id": i.id,
                "vehicle_id": i.vehicle_id,
                "vehicle_type": i.vehicle_type,
                "threat_type": i.threat_type,
                "created_at": i.created_at.isoformat(),
                "resolved": i.resolved_at is not None
            }
            for i in incidents
        ]

    except Exception as e:
        logger.error(f"Get incidents by type error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/statistics/breakdown")
async def get_incident_statistics(
    db: Session = Depends(get_db)
):
    """Get incident statistics breakdown"""
    try:
        total = db.query(Incident).count()
        resolved = db.query(Incident).filter(
            Incident.resolved_at.isnot(None)
        ).count()
        sms_sent = db.query(Incident).filter(
            Incident.sms_sent == True
        ).count()

        # Group by threat type
        from sqlalchemy import func
        threat_types = db.query(
            Incident.threat_type,
            func.count(Incident.id).label("count")
        ).group_by(Incident.threat_type).all()

        threat_breakdown = {
            threat: count for threat, count in threat_types
        }

        # Average response time
        resolved_incidents = db.query(Incident).filter(
            Incident.resolved_at.isnot(None)
        ).all()

        avg_response_time = 0
        if resolved_incidents:
            total_duration = sum(
                (i.resolved_at - i.created_at).total_seconds()
                for i in resolved_incidents
            )
            avg_response_time = total_duration / len(resolved_incidents) / 60  # in minutes

        return {
            "total_incidents": total,
            "resolved_incidents": resolved,
            "sms_notifications_sent": sms_sent,
            "average_response_time_minutes": avg_response_time,
            "by_threat_type": threat_breakdown
        }

    except Exception as e:
        logger.error(f"Incident statistics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
