# Demo router - simulation and testing endpoints
import logging
import asyncio
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.services.simulation import simulation_service
from backend.services.route_engine import route_engine
from backend.models import Vehicle, Corridor
from backend.websocket_manager import ws_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/demo", tags=["Demo"])


@router.post("/trigger")
async def trigger_demo_vehicle(
    vehicle_type: str = "Ambulance",
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    """Trigger a demo vehicle emergency corridor"""
    try:
        logger.info(f"Triggering demo vehicle: {vehicle_type}")

        # Create simulated vehicle
        vehicle = simulation_service.create_demo_vehicle(vehicle_type)

        # Create vehicle record in database
        db_vehicle = Vehicle(
            vehicle_id=vehicle.vehicle_id,
            vehicle_type=vehicle.vehicle_type,
            latitude=vehicle.current_lat,
            longitude=vehicle.current_lng,
            speed_kmh=vehicle.speed_kmh,
            is_emergency=True,
            last_updated=datetime.utcnow()
        )
        db.add(db_vehicle)

        # Calculate route
        route = route_engine.calculate_route(
            vehicle.current_lat,
            vehicle.current_lng,
            vehicle.destination_lat,
            vehicle.destination_lng
        )

        # Create corridor
        corridor = Corridor(
            vehicle_id=vehicle.vehicle_id,
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
        db.flush()

        db.commit()

        logger.info(
            f"✓ Demo vehicle created: {vehicle.vehicle_id} "
            f"({len(route.intersections)} intersections, "
            f"ETA: {route.estimated_duration_seconds // 60}min)"
        )

        # Broadcast activation
        ws_manager.broadcast({
            "type": "DEMO_VEHICLE_TRIGGERED",
            "vehicle_id": vehicle.vehicle_id,
            "vehicle_type": vehicle.vehicle_type,
            "latitude": vehicle.current_lat,
            "longitude": vehicle.current_lng,
            "destination_lat": vehicle.destination_lat,
            "destination_lng": vehicle.destination_lng,
            "eta_minutes": route.estimated_duration_seconds // 60,
            "intersections": len(route.intersections),
            "timestamp": datetime.utcnow().isoformat()
        })

        return {
            "success": True,
            "vehicle_id": vehicle.vehicle_id,
            "vehicle_type": vehicle.vehicle_type,
            "corridor_id": corridor.id,
            "location": {
                "latitude": vehicle.current_lat,
                "longitude": vehicle.current_lng
            },
            "destination": {
                "latitude": vehicle.destination_lat,
                "longitude": vehicle.destination_lng
            },
            "eta_minutes": route.estimated_duration_seconds // 60,
            "intersections_to_clear": len(route.intersections)
        }

    except Exception as e:
        logger.error(f"Demo trigger error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/conflict")
async def trigger_conflict_scenario(
    db: Session = Depends(get_db)
):
    """Trigger a conflict scenario with 2 vehicles on overlapping routes"""
    try:
        logger.warning("Triggering conflict scenario")

        # Create two vehicles
        ambulance = simulation_service.create_demo_vehicle("Ambulance")
        fire_truck = simulation_service.create_demo_vehicle("Fire Truck")

        # Create overlapping destination
        fire_truck.destination_lat = ambulance.destination_lat + 0.005
        fire_truck.destination_lng = ambulance.destination_lng + 0.005

        # Create vehicle records
        for vehicle in [ambulance, fire_truck]:
            db_vehicle = Vehicle(
                vehicle_id=vehicle.vehicle_id,
                vehicle_type=vehicle.vehicle_type,
                latitude=vehicle.current_lat,
                longitude=vehicle.current_lng,
                speed_kmh=vehicle.speed_kmh,
                is_emergency=True,
                last_updated=datetime.utcnow()
            )
            db.add(db_vehicle)

        db.commit()

        logger.warning(
            f"✓ Conflict scenario created: {ambulance.vehicle_id} and {fire_truck.vehicle_id}"
        )

        # Broadcast conflict scenario
        ws_manager.broadcast({
            "type": "CONFLICT_SCENARIO_TRIGGERED",
            "vehicle_1": ambulance.vehicle_id,
            "vehicle_1_type": ambulance.vehicle_type,
            "vehicle_2": fire_truck.vehicle_id,
            "vehicle_2_type": fire_truck.vehicle_type,
            "location_1": {
                "latitude": ambulance.current_lat,
                "longitude": ambulance.current_lng
            },
            "location_2": {
                "latitude": fire_truck.current_lat,
                "longitude": fire_truck.current_lng
            },
            "timestamp": datetime.utcnow().isoformat()
        })

        return {
            "success": True,
            "conflict_scenario": True,
            "vehicle_1": {
                "vehicle_id": ambulance.vehicle_id,
                "vehicle_type": ambulance.vehicle_type
            },
            "vehicle_2": {
                "vehicle_id": fire_truck.vehicle_id,
                "vehicle_type": fire_truck.vehicle_type
            },
            "message": "Conflict scenario triggered - priority resolution in progress"
        }

    except Exception as e:
        logger.error(f"Conflict trigger error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/active-vehicles")
async def get_active_demo_vehicles():
    """Get list of active simulated vehicles"""
    try:
        vehicles = simulation_service.get_active_vehicles()
        return {
            "count": len(vehicles),
            "vehicles": vehicles
        }

    except Exception as e:
        logger.error(f"Get active vehicles error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reset")
async def reset_demo(
    db: Session = Depends(get_db)
):
    """Reset all demo vehicles and corridors"""
    try:
        logger.info("Resetting demo environment")

        # Clear simulated vehicles
        simulation_service.reset_simulation()

        # Deactivate all corridors
        corridors = db.query(Corridor).filter(
            Corridor.status == "ACTIVE"
        ).all()

        for corridor in corridors:
            corridor.status = "CANCELLED"
            corridor.deactivated_at = datetime.utcnow()

        db.commit()

        logger.info(f"✓ Reset complete: {len(corridors)} corridors deactivated")

        # Broadcast reset
        ws_manager.broadcast({
            "type": "DEMO_RESET",
            "deactivated_corridors": len(corridors),
            "timestamp": datetime.utcnow().isoformat()
        })

        return {
            "success": True,
            "deactivated_corridors": len(corridors),
            "simulated_vehicles_cleared": True,
            "message": "Demo environment reset complete"
        }

    except Exception as e:
        logger.error(f"Reset error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/scenarios")
async def get_scenario_list():
    """Get list of available demo scenarios"""
    return {
        "scenarios": [
            {
                "id": "ambulance_emergency",
                "name": "Ambulance Emergency",
                "description": "Single ambulance with cardiac emergency",
                "vehicle_type": "Ambulance",
                "duration_seconds": 600
            },
            {
                "id": "fire_truck_response",
                "name": "Fire Truck Response",
                "description": "Fire truck responding to building fire",
                "vehicle_type": "Fire Truck",
                "duration_seconds": 900
            },
            {
                "id": "police_pursuit",
                "name": "Police Pursuit",
                "description": "Police vehicle in high-speed pursuit",
                "vehicle_type": "Police",
                "duration_seconds": 1200
            },
            {
                "id": "ambulance_fire_conflict",
                "name": "Ambulance-Fire Truck Conflict",
                "description": "Two vehicles with overlapping emergency routes",
                "vehicle_types": ["Ambulance", "Fire Truck"],
                "duration_seconds": 1800
            }
        ]
    }


@router.post("/scenario/{scenario_id}")
async def trigger_scenario(
    scenario_id: str,
    db: Session = Depends(get_db)
):
    """Trigger a predefined scenario"""
    try:
        logger.info(f"Triggering scenario: {scenario_id}")

        if scenario_id == "ambulance_emergency":
            return await trigger_demo_vehicle("Ambulance", db=db)
        elif scenario_id == "fire_truck_response":
            return await trigger_demo_vehicle("Fire Truck", db=db)
        elif scenario_id == "police_pursuit":
            return await trigger_demo_vehicle("Police", db=db)
        elif scenario_id == "ambulance_fire_conflict":
            return await trigger_conflict_scenario(db=db)
        else:
            raise HTTPException(status_code=404, detail="Scenario not found")

    except Exception as e:
        logger.error(f"Scenario trigger error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
