"""
Conflict Resolution Tests
Tests for priority-based conflict resolution
"""
import pytest
from unittest.mock import patch
from backend.services.conflict import conflict_service
from backend.config import CONFLICT_RESOLUTION_PRIORITY


class TestConflictDetection:
    """Test conflict detection logic"""

    @pytest.mark.unit
    def test_no_conflict_different_routes(self):
        """
        Vehicles on completely different routes should have no conflict
        """
        # Create two route sets with no overlap
        route1 = [
            type('Intersection', (), {'latitude': 23.18, 'longitude': 72.53})(),
            type('Intersection', (), {'latitude': 23.182, 'longitude': 72.532})(),
        ]
        route2 = [
            type('Intersection', (), {'latitude': 23.22, 'longitude': 72.57})(),
            type('Intersection', (), {'latitude': 23.222, 'longitude': 72.572})(),
        ]

        # No overlap should be detected
        has_overlap = conflict_service.check_overlap(route1, route2)
        assert has_overlap is False

    @pytest.mark.unit
    def test_conflict_same_intersection(self):
        """
        Vehicles at same intersection should have conflict
        """
        # Create two route sets with overlap
        route1 = [
            type('Intersection', (), {'latitude': 23.1815, 'longitude': 72.5371})(),
        ]
        route2 = [
            type('Intersection', (), {'latitude': 23.1815, 'longitude': 72.5371})(),
        ]

        has_overlap = conflict_service.check_overlap(route1, route2)
        assert has_overlap is True


class TestConflictResolution:
    """Test conflict resolution priority"""

    @pytest.mark.unit
    def test_higher_priority_wins(self):
        """
        Vehicle with higher priority should get corridor
        """
        # Ambulance (priority 1) vs Police (priority 6)
        ambulance_priority = CONFLICT_RESOLUTION_PRIORITY.get("Ambulance_Cardiac", 9)
        police_priority = CONFLICT_RESOLUTION_PRIORITY.get("Police_General", 9)

        # Lower number = higher priority
        assert ambulance_priority < police_priority

    @pytest.mark.unit
    def test_priority_ordering(self):
        """
        Verify priority ordering is correct
        """
        priorities = list(CONFLICT_RESOLUTION_PRIORITY.values())
        
        # Should be ordered 1 through 8
        assert 1 in priorities
        assert 8 in priorities
        # No duplicates
        assert len(priorities) == len(set(priorities))

    @pytest.mark.unit
    def test_all_vehicle_types_have_priority(self):
        """
        All vehicle types should have priority values
        """
        vehicle_types = [
            "Ambulance_Cardiac",
            "Ambulance_General",
            "Fire_Truck_Structural",
            "Fire_Truck_Medical",
            "Police_Traffic",
            "Police_General",
        ]

        for vehicle_type in vehicle_types:
            assert vehicle_type in CONFLICT_RESOLUTION_PRIORITY
            assert 1 <= CONFLICT_RESOLUTION_PRIORITY[vehicle_type] <= 8
