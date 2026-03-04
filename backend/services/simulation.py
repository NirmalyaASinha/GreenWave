# Vehicle simulation service for demo and testing
import logging
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List
import random
from dataclasses import dataclass
from backend.config import DEMO_CONFIG, CITY_CENTER

logger = logging.getLogger(__name__)

@dataclass
class SimulatedVehicle:
    vehicle_id: str
    vehicle_type: str
    current_lat: float
    current_lng: float
    destination_lat: float
    destination_lng: float
    speed_kmh: float
    heading: float
    corridor_id: int
    start_time: datetime
    end_time: datetime
    is_emergency: bool

class SimulationService:
    """
    Generates realistic vehicle movement and corridor activation for demo mode
    """

    def __init__(self):
        self.simulated_vehicles: Dict[str, SimulatedVehicle] = {}
        self.background_tasks: List[asyncio.Task] = []
        logger.info("✓ Simulation Service initialized")

    def create_demo_vehicle(
        self,
        vehicle_type: str,
        is_conflict: bool = False
    ) -> SimulatedVehicle:
        """
        Create a realistic simulated emergency vehicle
        Spawns 3-5km from city center in random direction
        """
        logger.info(f"Creating demo vehicle: {vehicle_type}")

        # Random spawn location 3-5km from city center
        radius_km = random.uniform(3, 5)
        angle = random.uniform(0, 360)

        import math
        lat_offset = (radius_km / 111) * math.cos(math.radians(angle))
        lng_offset = (radius_km / 111) * math.sin(math.radians(angle))

        current_lat = CITY_CENTER["lat"] + lat_offset
        current_lng = CITY_CENTER["lng"] + lng_offset

        # Random destination
        dest_lat = CITY_CENTER["lat"] + random.uniform(-0.05, 0.05)
        dest_lng = CITY_CENTER["lng"] + random.uniform(-0.05, 0.05)

        # Realistic speed based on vehicle type
        speed_map = {
            "Ambulance": random.uniform(60, 80),
            "Fire Truck": random.uniform(50, 70),
            "Police": random.uniform(70, 100)
        }
        speed = speed_map.get(vehicle_type, 60)

        # Calculate distance and duration
        distance_km = math.sqrt(
            (dest_lat - current_lat)**2 + (dest_lng - current_lng)**2
        ) * 111
        duration_seconds = (distance_km / speed) * 3600

        vehicle = SimulatedVehicle(
            vehicle_id=f"{vehicle_type[0]}-{int(datetime.utcnow().timestamp()) % 10000}",
            vehicle_type=vehicle_type,
            current_lat=current_lat,
            current_lng=current_lng,
            destination_lat=dest_lat,
            destination_lng=dest_lng,
            speed_kmh=speed,
            heading=angle,
            corridor_id=None,
            start_time=datetime.utcnow(),
            end_time=datetime.utcnow() + timedelta(seconds=duration_seconds),
            is_emergency=True
        )

        self.simulated_vehicles[vehicle.vehicle_id] = vehicle
        logger.info(
            f"Created {vehicle.vehicle_id}: {vehicle_type} at "
            f"({vehicle.current_lat:.4f}, {vehicle.current_lng:.4f}) "
            f"→ ({vehicle.destination_lat:.4f}, {vehicle.destination_lng:.4f})"
        )

        return vehicle

    async def simulate_vehicle_movement(
        self,
        vehicle_id: str,
        update_callback,
        interval_seconds: int = 2
    ):
        """
        Simulate vehicle movement along route
        Calls update_callback every interval_seconds with updated position
        """
        logger.info(f"Starting simulation for {vehicle_id}")

        try:
            vehicle = self.simulated_vehicles.get(vehicle_id)
            if not vehicle:
                logger.error(f"Vehicle {vehicle_id} not found")
                return

            while datetime.utcnow() < vehicle.end_time:
                # Calculate progress
                elapsed = (datetime.utcnow() - vehicle.start_time).total_seconds()
                total = (vehicle.end_time - vehicle.start_time).total_seconds()
                progress = min(elapsed / total, 1.0)

                # Interpolate position
                vehicle.current_lat = (
                    vehicle.start_time
                    + progress * (vehicle.destination_lat - vehicle.current_lat)
                )
                vehicle.current_lng = (
                    vehicle.start_time
                    + progress * (vehicle.destination_lng - vehicle.current_lng)
                )

                # Add slight speed variation (50-120% of nominal)
                speed_variation = random.uniform(0.5, 1.2)
                vehicle.speed_kmh *= speed_variation

                # Call update callback (GPS update)
                await update_callback(vehicle)

                await asyncio.sleep(interval_seconds)

            logger.info(f"Vehicle {vehicle_id} reached destination")
            del self.simulated_vehicles[vehicle_id]

        except Exception as e:
            logger.error(f"Simulation error for {vehicle_id}: {e}")

    async def trigger_conflict_scenario(
        self,
        update_callback,
        create_corridor_callback
    ):
        """
        Trigger a conflict scenario with 2 vehicles on overlapping routes
        """
        logger.info("Triggering conflict scenario")

        # Create two vehicles with overlapping routes
        vehicle1 = self.create_demo_vehicle("Ambulance")
        vehicle2 = self.create_demo_vehicle("Fire Truck")

        # Create overlapping destination
        vehicle2.destination_lat = vehicle1.destination_lat + 0.01
        vehicle2.destination_lng = vehicle1.destination_lng + 0.01

        logger.warning(
            f"Conflict created: {vehicle1.vehicle_id} and {vehicle2.vehicle_id} "
            "have overlapping routes"
        )

        # Start both simulations
        task1 = asyncio.create_task(
            self.simulate_vehicle_movement(
                vehicle1.vehicle_id, update_callback
            )
        )
        task2 = asyncio.create_task(
            self.simulate_vehicle_movement(
                vehicle2.vehicle_id, update_callback
            )
        )

        self.background_tasks.extend([task1, task2])

    def reset_simulation(self):
        """Reset all simulated vehicles"""
        logger.info("Resetting simulation")

        self.simulated_vehicles.clear()

        # Cancel all background tasks
        for task in self.background_tasks:
            if not task.done():
                task.cancel()

        self.background_tasks.clear()

        logger.info("✓ Simulation reset complete")

    def get_active_vehicles(self) -> List[dict]:
        """Get list of all active simulated vehicles"""
        vehicles = []
        for vehicle in self.simulated_vehicles.values():
            vehicles.append({
                "vehicle_id": vehicle.vehicle_id,
                "vehicle_type": vehicle.vehicle_type,
                "latitude": vehicle.current_lat,
                "longitude": vehicle.current_lng,
                "speed_kmh": vehicle.speed_kmh,
                "heading": vehicle.heading,
                "is_emergency": vehicle.is_emergency,
                "progress_percent": min(
                    (datetime.utcnow() - vehicle.start_time).total_seconds() /
                    (vehicle.end_time - vehicle.start_time).total_seconds() * 100,
                    100
                )
            })
        return vehicles

# Global simulation service instance
simulation_service = SimulationService()
