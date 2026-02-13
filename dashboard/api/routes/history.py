"""Workflow run history API."""
from fastapi import APIRouter

from dashboard.config import HISTORY_FILE
from dashboard.models.schemas import HistoryEntry
from dashboard.services.history_service import load_history

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("", response_model=list[HistoryEntry])
async def get_history():
    """List past workflow runs."""
    return load_history(HISTORY_FILE)
