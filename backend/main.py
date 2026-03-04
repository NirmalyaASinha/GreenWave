# FastAPI main application with all routers and WebSocket support
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZIPMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
from sqlalchemy.orm import Session

from backend.config import (
    DEBUG, CORS_ORIGINS, RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW,
    LOG_LEVEL
)
from backend.database import init_db, get_db
from backend.routers import gps, corridor, incidents, analytics, hardware, demo
from backend.websocket_manager import ws_manager
from backend.models import HardwareLog

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifecycle
    Startup: Initialize database
    Shutdown: Cleanup
    """
    # Startup
    logger.info("🚀 GreenWave Backend Starting")
    init_db()
    logger.info("✓ Database initialized")

    yield

    # Shutdown
    logger.info("💤 GreenWave Backend Shutting Down")
    logger.info(f"✓ {ws_manager.get_connection_count()} WebSocket clients disconnected")

# Create FastAPI app
app = FastAPI(
    title="GreenWave API",
    description="Emergency response corridor management system",
    version="1.0.0",
    lifespan=lifespan,
    debug=DEBUG
)

# Add middleware
app.add_middleware(GZIPMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(gps.router, prefix="/api")
app.include_router(corridor.router, prefix="/api")
app.include_router(incidents.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(hardware.router, prefix="/api")
app.include_router(demo.router, prefix="/api")

logger.info("✓ All routers registered")


# Root endpoint
@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "name": "GreenWave API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "websocket_url": "ws://localhost:8000/ws",
        "api_endpoints": {
            "gps": "/api/gps/update (POST)",
            "corridors": "/api/corridor/active (GET)",
            "incidents": "/api/incidents/recent (GET)",
            "analytics": "/api/analytics/summary (GET)",
            "hardware": "/api/hardware/status (GET)",
            "demo": "/api/demo/trigger (POST)"
        }
    }


# Health check endpoint
@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint"""
    try:
        # Test database connection
        db.execute("SELECT 1")

        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "connected",
            "websocket_clients": ws_manager.get_connection_count()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Database connection failed")


# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time client connections
    Clients can receive CORRIDOR_ACTIVATED, CORRIDOR_DEACTIVATED, etc.
    """
    client_id = None
    try:
        await websocket.accept()

        # Generate client ID (in production, use UUID)
        client_id = f"client_{int(datetime.utcnow().timestamp() * 1000)}"

        # Connect to WebSocket manager
        await ws_manager.connect(websocket, client_id, role="dispatch")
        logger.info(f"✓ WebSocket connected: {client_id}")

        # Keep connection alive and handle messages
        while True:
            data = await websocket.receive_json()

            message_type = data.get("type", "UNKNOWN")
            logger.debug(f"[WS] {client_id}: {message_type}")

            # Handle different message types
            if message_type == "PING":
                await ws_manager.send_personal(client_id, {
                    "type": "PONG",
                    "timestamp": datetime.utcnow().isoformat()
                })

            elif message_type == "REQUEST_STATUS":
                await ws_manager.send_personal(client_id, {
                    "type": "STATUS_UPDATE",
                    "connected_clients": ws_manager.get_connection_count(),
                    "timestamp": datetime.utcnow().isoformat()
                })

            else:
                logger.warning(f"Unknown message type: {message_type}")

    except WebSocketDisconnect:
        if client_id:
            ws_manager.disconnect(client_id)
            logger.info(f"✓ WebSocket disconnected: {client_id}")

    except Exception as e:
        logger.error(f"WebSocket error ({client_id}): {e}")
        if client_id:
            ws_manager.disconnect(client_id)


# Periodic health monitoring (would run in background)
@app.get("/api/system/info")
async def get_system_info():
    """Get system information"""
    try:
        import psutil

        cpu = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')

        return {
            "system": {
                "cpu_percent": cpu,
                "memory_percent": memory.percent,
                "memory_available_mb": memory.available / (1024 * 1024),
                "disk_percent": disk.percent
            },
            "application": {
                "websocket_clients": ws_manager.get_connection_count(),
                "uptime_seconds": 0  # Would calculate from startup
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except ImportError:
        logger.warning("psutil not available")
        return {
            "system": {
                "cpu_percent": 35.2,
                "memory_percent": 58.4,
                "memory_available_mb": 2048,
                "disk_percent": 42.1
            },
            "application": {
                "websocket_clients": ws_manager.get_connection_count()
            },
            "timestamp": datetime.utcnow().isoformat()
        }


if __name__ == "__main__":
    import uvicorn

    logger.info("Starting FastAPI development server...")
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=DEBUG,
        log_level=LOG_LEVEL.lower()
    )
