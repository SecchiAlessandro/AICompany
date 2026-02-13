"""Results file browser API."""
from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, PlainTextResponse

from dashboard.config import RESULTS_DIR
from dashboard.models.schemas import ResultFile

router = APIRouter(prefix="/api/results", tags=["results"])

TEXT_EXTENSIONS = {".md", ".txt", ".json", ".yaml", ".yml", ".csv", ".log", ".py", ".js", ".ts", ".html", ".css"}


@router.get("", response_model=list[ResultFile])
async def list_results():
    """List all files in results/ directory."""
    if not RESULTS_DIR.exists():
        return []
    files = []
    for path in sorted(RESULTS_DIR.iterdir()):
        if path.is_file():
            stat = path.stat()
            files.append(ResultFile(
                name=path.name,
                path=str(path.relative_to(RESULTS_DIR)),
                size=stat.st_size,
                modified=datetime.fromtimestamp(stat.st_mtime).isoformat(),
                extension=path.suffix,
            ))
    return files


@router.get("/{filename}")
async def get_result(filename: str):
    """Read or download a result file."""
    path = RESULTS_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"File not found: {filename}")

    if path.suffix in TEXT_EXTENSIONS:
        content = path.read_text(encoding="utf-8", errors="replace")
        return PlainTextResponse(content)

    return FileResponse(path, filename=path.name)
