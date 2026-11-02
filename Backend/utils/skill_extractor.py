import re
from typing import Any


def _evidence_chunks(text: str) -> list[str]:
    normalized_text = re.sub(r"[ \t]+", " ", text)
    chunks = []

    for line in normalized_text.splitlines():
        line = line.strip(" \t-•*")
        if not line:
            continue

        chunks.extend(
            sentence.strip()
            for sentence in re.split(r"(?<=[.!?])\s+", line)
            if sentence.strip()
        )

    return chunks


def _contains_alias(text: str, alias: str) -> bool:
    alias = alias.strip()
    if not alias:
        return False

    pattern = rf"(?<!\w){re.escape(alias)}(?!\w)"
    return bool(re.search(pattern, text, re.IGNORECASE))


def extract_skills(
    profile_text: str,
    taxonomy_rows: list[dict[str, Any]],
) -> list[dict[str, str]]:
    """Extract skills deterministically from database taxonomy rows."""
    if not profile_text or not profile_text.strip():
        raise ValueError("Profile text cannot be empty.")

    extracted = []
    seen = set()
    for evidence in _evidence_chunks(profile_text):
        for row in taxonomy_rows:
            skill_id = str(row.get("skill_id") or "").strip()
            canonical_name = str(row.get("canonical_name") or "").strip()
            aliases = row.get("aliases") or []
            if not skill_id or not canonical_name:
                continue
            if isinstance(aliases, str):
                aliases = [aliases]
            if skill_id in seen:
                continue
            aliases = [canonical_name, *[str(alias) for alias in aliases]]
            if any(_contains_alias(evidence, alias) for alias in aliases):
                extracted.append({
                    "raw_skill": canonical_name,
                    "evidence": evidence,
                })
                seen.add(skill_id)
    return extracted
