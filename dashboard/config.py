"""Path configuration for the dashboard backend."""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
WORKFLOWS_DIR = BASE_DIR / "workflows"
RESULTS_DIR = BASE_DIR / "results"
AGENTS_DIR = BASE_DIR / ".claude" / "agents"
SKILLS_DIR = BASE_DIR / ".claude" / "skills"
SHARED_MD = RESULTS_DIR / "shared.md"
HISTORY_FILE = Path(__file__).resolve().parent / "history.json"
