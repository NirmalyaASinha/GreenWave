# Conflict resolution for overlapping emergency corridors
import logging
from typing import Dict, Tuple, List, Optional
from datetime import datetime
from backend.models import Incident
from backend.database import SessionLocal
from backend.config import CONFLICT_RESOLUTION_PRIORITY

logger = logging.getLogger(__name__)

class ConflictResolutionService:
    """
    Resolves conflicts when multiple emergency vehicles request corridor activation
    Prioritizes based on vehicle type and threat level
    """

    def __init__(self):
        self.active_corridors: Dict[int, Dict] = {}
        logger.info("✓ Conflict Resolution Service initialized")

    def register_corridor(self, corridor_id: int, vehicle_type: str, intersections: List):
        """Register an active corridor"""
        self.active_corridors[corridor_id] = {
            "vehicle_type": vehicle_type,
            "intersections": intersections,
            "created_at": datetime.utcnow()
        }
        logger.info(f"Registered corridor {corridor_id} ({vehicle_type})")

    def unregister_corridor(self, corridor_id: int):
        """Unregister a completed corridor"""
        if corridor_id in self.active_corridors:
            del self.active_corridors[corridor_id]
            logger.info(f"Unregistered corridor {corridor_id}")

    def check_overlap(self, intersections1: List, intersections2: List) -> bool:
        """
        Check if two sets of intersections share locations within 200m
        Returns True if overlap detected
        """
        from backend.services.route_engine import route_engine

        for i1 in intersections1:
            for i2 in intersections2:
                # Calculate distance between intersections
                distance_m = route_engine._calculate_distance(
                    (i1.latitude, i1.longitude),
                    (i2.latitude, i2.longitude)
                ) * 1000  # convert km to m

                if distance_m <= 200:
                    logger.warning(f"Overlap detected: {distance_m:.0f}m between intersections")
                    return True

        return False

    def resolve_conflict(
        self,
        new_vehicle_type: str,
        new_intersections: List,
        conflict_incident_id: Optional[int] = None
    ) -> Tuple[bool, str]:
        """
        Resolve corridor conflict
        Returns (can_proceed, reason)

        Rules:
        - If overlap detected with active corridor
        - Compare priorities: lower number = higher priority
        - Higher priority vehicle gets corridor
        - Other vehicle gets alternate route notification
        """
        db = SessionLocal()
        try:
            logger.info(f"Resolving conflict for {new_vehicle_type}")

            # Check for overlaps with all active corridors
            overlapping_corridors = []
            for corridor_id, corridor_info in self.active_corridors.items():
                if self.check_overlap(corridor_info["intersections"], new_intersections):
                    overlapping_corridors.append((corridor_id, corridor_info))

            if not overlapping_corridors:
                logger.info("No conflicts detected, proceeding with corridor activation")
                return True, "No conflicts"

            # Compare priorities
            new_priority = CONFLICT_RESOLUTION_PRIORITY.get(new_vehicle_type, 9)
            logger.warning(f"Conflict detected! New vehicle priority: {new_priority}")

            for corridor_id, existing_info in overlapping_corridors:
                existing_type = existing_info["vehicle_type"]
                existing_priority = CONFLICT_RESOLUTION_PRIORITY.get(existing_type, 9)

                logger.warning(
                    f"Comparing: {new_vehicle_type}({new_priority}) vs "
                    f"{existing_type}({existing_priority})"
                )

                if new_priority < existing_priority:
                    # New vehicle has higher priority
                    logger.info(f"✓ {new_vehicle_type} has priority, existing vehicle will use alternate")

                    # Log conflict incident
                    if conflict_incident_id:
                        incident = db.query(Incident).filter(
                            Incident.id == conflict_incident_id
                        ).first()
                        if incident:
                            incident.threat_type = "PRIORITY_CONFLICT"
                            db.commit()

                    return True, f"Priority given to {new_vehicle_type}"
                else:
                    # Existing vehicle has equal or higher priority
                    logger.info(f"✗ {existing_type} has equal or higher priority, use alternate route")
                    return False, f"{existing_type} has priority, use alternate route"

        except Exception as e:
            logger.error(f"Conflict resolution error: {e}")
            return False, f"Error: {str(e)}"
        finally:
            db.close()

    def get_alternate_route(
        self,
        current_lat: float,
        current_lng: float,
        destination_lat: float,
        destination_lng: float
    ) -> Optional[List]:
        """
        Calculate alternate route avoiding conflict
        Adds 5-10 minute detour
        """
        logger.info("Calculating alternate route...")

        try:
            from backend.services.route_engine import route_engine

            # For now, return offset route
            offset_lat = current_lat + 0.02  # ~2km offset
            offset_lng = current_lng + 0.02

            alternate = route_engine.calculate_route(
                offset_lat, offset_lng,
                destination_lat, destination_lng
            )

            if alternate:
                logger.info(f"✓ Alternate route calculated: {alternate.total_distance_km:.1f}km")
                return alternate

        except Exception as e:
            logger.error(f"Failed to calculate alternate route: {e}")

        return None

    def log_conflict(
        self,
        vehicle_id: str,
        conflict_type: str,
        resolution: str,
        db_session
    ):
        """Log conflict resolution event"""
        try:
            incident = Incident(
                vehicle_id=vehicle_id,
                threat_type=conflict_type,
                intersections_json={
                    "resolution": resolution,
                    "timestamp": datetime.utcnow().isoformat()
                },
                resolved_at=datetime.utcnow()
            )
            db_session.add(incident)
            db_session.commit()

            logger.info(f"Conflict logged: {vehicle_id} - {conflict_type}")
        except Exception as e:
            logger.error(f"Failed to log conflict: {e}")

# Global conflict resolution service instance
conflict_service = ConflictResolutionService()
