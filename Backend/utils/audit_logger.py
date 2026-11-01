# Backend/utils/audit_logger.py
import json
from pathlib import Path
from datetime import datetime, timezone

# Points directly to Backend/logs/audit.jsonl
BACKEND_DIR = Path(__file__).resolve().parent.parent
LOG_FILE = BACKEND_DIR / "logs" / "audit.jsonl"

def log_audit_event(session_id: str, actor: str, action: str, input_summary: str, output_summary: str):
    """F8: Append-only JSON lines logger at Backend/logs/audit.jsonl"""
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    entry = {
        "id": f"audit_{int(datetime.now(timezone.utc).timestamp() * 1000)}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "session_id": session_id,
        "actor": actor,
        "action": action,
        "input_summary": input_summary,
        "output_summary": output_summary
    }
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")

def read_audit_events():
    """Reads all JSON-line events from Backend/logs/audit.jsonl"""
    if not LOG_FILE.exists():
        return []
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]