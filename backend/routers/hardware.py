# Hardware monitoring router - tracks system component health
import logging
import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.database import get_db
from backend.models import HardwareLog
from backend.schemas import HardwareStatusResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/hardware", tags=["Hardware"])


def get_system_stats():
    """Get real system statistics"""
    try:
        import psutil

        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()

        return {
            "cpu_percent": cpu_percent,
            "memory_percent": memory.percent,
            "memory_available_mb": memory.available / (1024 * 1024)
        }
    except ImportError:
        logger.warning("psutil not installed, using simulated stats")
        return {
            "cpu_percent": 35.2,
            "memory_percent": 58.4,
            "memory_available_mb": 2048
        }


def read_temperature():
    """Read CPU temperature from system"""
    try:
        # Raspberry Pi specific
        if os.path.exists("/sys/class/thermal/thermal_zone0/temp"):
            with open("/sys/class/thermal/thermal_zone0/temp") as f:
                temp_raw = int(f.read().strip())
                return temp_raw / 1000.0  # Convert to Celsius
    except Exception as e:
        logger.debug(f"Could not read temperature: {e}")

    return 42.5  # Default simulated


@router.get("/status")
async def get_hardware_status(db: Session = Depends(get_db)):
    """Get current hardware component status"""
    try:
        stats = get_system_stats()
        temp = read_temperature()

        # Determine component statuses
        gps_status = "online" if stats["cpu_percent"] < 80 else "degraded"
        esp_status = "online"  # Simulated
        arduino_status = "online"  # Simulated
        sim800l_status = "online"  # Simulated
        rpi_status = "online" if stats["memory_percent"] < 90 else "degraded"

        # Log current status
        hardware_log = HardwareLog(
            component="system",
            status="online",
            message=f"CPU: {stats['cpu_percent']:.1f}%, Mem: {stats['memory_percent']:.1f}%, Temp: {temp:.1f}°C",
            cpu_percent=stats["cpu_percent"],
            memory_percent=stats["memory_percent"],
            created_at=datetime.utcnow()
        )
        db.add(hardware_log)
        db.commit()

        return {
            "gps": {
                "status": gps_status,
                "last_ping_seconds": 2,
                "signal_strength": 85,
                "details": "Neo-6M GNSS Module"
            },
            "esp8266": {
                "status": esp_status,
                "last_ping_seconds": 3,
                "signal_strength": 92,
                "details": "WiFi Module"
            },
            "arduino": {
                "status": arduino_status,
                "last_ping_seconds": 1,
                "cpu_percent": 12.5,
                "details": "Signal Control Unit"
            },
            "sim800l": {
                "status": sim800l_status,
                "last_ping_seconds": 5,
                "signal_strength": 55,
                "details": "GSM/SMS Module"
            },
            "raspberry_pi": {
                "status": rpi_status,
                "cpu_percent": stats["cpu_percent"],
                "memory_percent": stats["memory_percent"],
                "temperature_celsius": temp,
                "uptime_seconds": 864000,
                "details": f"Main controller - {int(stats['memory_available_mb'])}MB available"
            }
        }

    except Exception as e:
        logger.error(f"Hardware status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/logs/{component}")
async def get_hardware_logs(
    component: str,
    limit: int = Query(100, le=500),
    hours: int = Query(24),
    db: Session = Depends(get_db)
):
    """Get hardware log entries for a component"""
    try:
        cutoff = datetime.utcnow() - timedelta(hours=hours)

        logs = db.query(HardwareLog).filter(
            HardwareLog.component == component,
            HardwareLog.created_at >= cutoff
        ).order_by(desc(HardwareLog.created_at)).limit(limit).all()

        return [
            {
                "id": log.id,
                "component": log.component,
                "status": log.status,
                "message": log.message,
                "cpu_percent": log.cpu_percent,
                "memory_percent": log.memory_percent,
                "created_at": log.created_at.isoformat()
            }
            for log in logs
        ]

    except Exception as e:
        logger.error(f"Hardware logs error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Simple health check endpoint"""
    try:
        stats = get_system_stats()

        health_status = "healthy"
        alerts = []

        if stats["cpu_percent"] > 80:
            health_status = "degraded"
            alerts.append("High CPU usage")

        if stats["memory_percent"] > 85:
            health_status = "degraded"
            alerts.append("High memory usage")

        return {
            "status": health_status,
            "timestamp": datetime.utcnow().isoformat(),
            "cpu_percent": stats["cpu_percent"],
            "memory_percent": stats["memory_percent"],
            "alerts": alerts
        }

    except Exception as e:
        logger.error(f"Health check error: {e}")
        return {
            "status": "error",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e)
        }


@router.post("/alert/{component}")
async def log_hardware_alert(
    component: str,
    status: str,
    message: str = "",
    db: Session = Depends(get_db)
):
    """Log a hardware alert from device"""
    try:
        stats = get_system_stats()

        log = HardwareLog(
            component=component,
            status=status,
            message=message,
            cpu_percent=stats["cpu_percent"] if component == "system" else None,
            memory_percent=stats["memory_percent"] if component == "system" else None,
            created_at=datetime.utcnow()
        )
        db.add(log)
        db.commit()

        logger.warning(f"Hardware alert: {component} - {status}: {message}")

        # For critical alerts, could send SMS notification
        if status == "offline":
            from backend.services.sms_service import sms_service
            sms_service.send_hardware_alert(component, status, "+919876543210")

        return {
            "success": True,
            "component": component,
            "logged_at": log.created_at.isoformat()
        }

    except Exception as e:
        logger.error(f"Log alert error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/statistics")
async def get_hardware_statistics(
    days: int = Query(7, le=30),
    db: Session = Depends(get_db)
):
    """Get hardware availability statistics"""
    try:
        cutoff = datetime.utcnow() - timedelta(days=days)

        components = ["gps", "esp8266", "arduino", "sim800l", "raspberry_pi"]
        stats = {}

        for component in components:
            logs = db.query(HardwareLog).filter(
                HardwareLog.component == component,
                HardwareLog.created_at >= cutoff
            ).all()

            if logs:
                online_count = sum(1 for log in logs if log.status == "online")
                availability = (online_count / len(logs)) * 100
                stats[component] = {
                    "total_events": len(logs),
                    "availability_percent": availability,
                    "last_status": logs[0].status,
                    "last_update": logs[0].created_at.isoformat()
                }

        return {
            "period_days": days,
            "components": stats
        }

    except Exception as e:
        logger.error(f"Hardware statistics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
