"""WebSocket handler with connection manager and broadcast."""
from __future__ import annotations

import json
import logging
from datetime import datetime

from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages active WebSocket connections and broadcasts events."""

    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info("WebSocket connected. Total: %d", len(self.active_connections))

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info("WebSocket disconnected. Total: %d", len(self.active_connections))

    async def broadcast(self, event_type: str, data: dict) -> None:
        """Broadcast an event to all connected clients."""
        message = json.dumps({
            "type": event_type,
            "data": data,
            "timestamp": datetime.now().isoformat(),
        })
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)


manager = ConnectionManager()


async def websocket_endpoint(websocket: WebSocket) -> None:
    """Handle WebSocket connections."""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Client can send ping/pong or request status
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
