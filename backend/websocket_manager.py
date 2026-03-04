# WebSocket connection manager
from fastapi import WebSocket
from datetime import datetime
import logging
import json
from typing import Dict, List, Set
import asyncio

logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.connection_roles: Dict[str, str] = {}
        self.message_queues: Dict[str, List[dict]] = {}
        self.reconnection_counts: Dict[str, int] = {}
        self.last_pong: Dict[str, datetime] = {}

    async def connect(self, websocket: WebSocket, client_id: str, role: str = "viewer"):
        """Register a new WebSocket client"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.connection_roles[client_id] = role
        self.message_queues[client_id] = []
        self.reconnection_counts[client_id] = self.reconnection_counts.get(client_id, 0) + 1
        self.last_pong[client_id] = datetime.utcnow()

        logger.info(
            f"[WS] ✓ Client connected: {client_id} (role: {role}) "
            f"[total: {len(self.active_connections)}]"
        )

        # Send welcome message with buffered messages
        await self.send_buffered_messages(client_id)

    def disconnect(self, client_id: str):
        """Unregister a disconnected client"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"[WS] ✗ Client disconnected: {client_id} [total: {len(self.active_connections)}]")

    async def send_personal(self, client_id: str, message: dict):
        """Send message to specific client"""
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_json(message)
            except Exception as e:
                logger.error(f"[WS] Error sending to {client_id}: {e}")
                self.disconnect(client_id)
        else:
            # Queue message if client not connected
            if client_id not in self.message_queues:
                self.message_queues[client_id] = []
            if len(self.message_queues[client_id]) < 50:
                self.message_queues[client_id].append(message)

    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        timestamp = datetime.utcnow().isoformat()
        message_with_ts = {**message, "timestamp": timestamp}

        logger.info(f"[WS] 📢 BROADCAST: {message.get('type', 'UNKNOWN')} to {len(self.active_connections)} clients")

        disconnected_clients = []
        for client_id, connection in self.active_connections.items():
            try:
                await connection.send_json(message_with_ts)
            except Exception as e:
                logger.warning(f"[WS] Error broadcasting to {client_id}: {e}")
                disconnected_clients.append(client_id)

        for client_id in disconnected_clients:
            self.disconnect(client_id)

    async def broadcast_to_role(self, message: dict, role: str):
        """Broadcast message to clients with specific role"""
        timestamp = datetime.utcnow().isoformat()
        message_with_ts = {**message, "timestamp": timestamp}

        target_clients = [cid for cid, r in self.connection_roles.items() if r == role]
        logger.info(f"[WS] 📢 BROADCAST TO {role.upper()}: {message.get('type')} to {len(target_clients)} clients")

        for client_id in target_clients:
            if client_id in self.active_connections:
                try:
                    await self.active_connections[client_id].send_json(message_with_ts)
                except Exception as e:
                    logger.warning(f"[WS] Error broadcasting to {client_id}: {e}")
                    self.disconnect(client_id)

    async def send_buffered_messages(self, client_id: str):
        """Send all buffered messages to reconnected client"""
        if client_id in self.message_queues and self.message_queues[client_id]:
            logger.info(f"[WS] 📥 Replaying {len(self.message_queues[client_id])} buffered messages to {client_id}")
            for message in self.message_queues[client_id]:
                await self.send_personal(client_id, message)
            self.message_queues[client_id] = []

    async def ping_all(self):
        """Send heartbeat ping to all clients and remove unresponsive ones"""
        logger.debug(f"[WS] 💓 Heartbeat ping to {len(self.active_connections)} clients")

        ping_message = {
            "type": "PING",
            "timestamp": datetime.utcnow().isoformat()
        }

        disconnected = []
        for client_id, connection in list(self.active_connections.items()):
            try:
                await connection.send_json(ping_message)
                self.last_pong[client_id] = datetime.utcnow()
            except Exception as e:
                logger.warning(f"[WS] No response from {client_id}, removing: {e}")
                disconnected.append(client_id)

        for client_id in disconnected:
            self.disconnect(client_id)

    def get_connection_count(self) -> int:
        """Get total number of connected clients"""
        return len(self.active_connections)

    def get_connections_by_role(self, role: str) -> List[str]:
        """Get client IDs for a specific role"""
        return [cid for cid, r in self.connection_roles.items() if r == role]

    async def update_pong(self, client_id: str):
        """Update last pong time for a client"""
        if client_id in self.last_pong:
            self.last_pong[client_id] = datetime.utcnow()

# Global WebSocket manager instance
manager = WebSocketManager()
