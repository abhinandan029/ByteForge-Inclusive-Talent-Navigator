# Backend/utils/audit_logger.py
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any

# Points to Backend/audit_log.jsonl
LOG_FILE = Path(__file__).resolve().parent.parent / "audit_log.jsonl"

def log_audit_event(session_id: str, actor: str, action: str, input_summary: str, output_summary: str):
    """Logs an action to the append-only JSONL audit trail."""
    event = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "session_id": session_id,
        "actor": actor,
        "action": action,
        "input_summary": input_summary,
        "output_summary": output_summary
    }
    
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(event) + "\n")

def read_audit_events() -> List[Dict[str, Any]]:
    """Reads the local JSONL audit store."""
    events = []
    if LOG_FILE.exists():
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    events.append(json.loads(line))
    return events