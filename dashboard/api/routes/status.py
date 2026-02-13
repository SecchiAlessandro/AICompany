"""Status API: parse shared.md into structured JSON."""
from fastapi import APIRouter

from dashboard.config import SHARED_MD
from dashboard.models.schemas import SharedMdStatus
from dashboard.services.shared_md_parser import parse_shared_md

router = APIRouter(prefix="/api/status", tags=["status"])


@router.get("", response_model=SharedMdStatus)
async def get_status():
    """Parse results/shared.md and return structured status."""
    return parse_shared_md(SHARED_MD)
