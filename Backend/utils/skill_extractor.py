import re
from typing import Any


def _normalize_line(text: str) -> str:
    text = text.replace("\u00a0", " ")
    text = re.sub(r"[\u2022\u25aa\u25cf\u25e6]", "-", text)
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def _evidence_chunks(text: str) -> list[str]:
    chunks = []
    current_section = ""

    for raw_line in text.replace("\r\n", "\n").replace("\r", "\n").splitlines():
        line = _normalize_line(raw_line)
        if not line:
            continue

        if line.casefold().startswith(("document:", "type:", "end document")):
            current_section = ""

        line = re.sub(r"^[\-*]+\s*", "", line)
        if (
            len(line) <= 80
            and not re.search(r"[.!?]$", line)
            and (
                line.endswith(":")
                or line.casefold() in {
                    "skills", "technical skills", "core skills",
                    "experience", "projects", "certifications",
                    "education", "tools", "technologies",
                }
            )
        ):
            current_section = line.rstrip(":").strip()
            continue

        if current_section and not line.casefold().startswith("document:"):
            line = f"{current_section}: {line}"

        if not line:
            continue

        chunks.extend(
            sentence.strip()
            for sentence in re.split(r"(?<=[.!?])\s+", line)
            if sentence.strip()
        )

    return chunks


def _contains_alias(text: str, alias: str) -> bool:
    alias = _normalize_line(alias)
    if not alias:
        return False

    # Allow line-wrap and table whitespace variations without matching
    # a skill inside a larger word.
    alias_pattern = r"\s+".join(
        re.escape(part)
        for part in alias.split()
    )
    pattern = rf"(?<![A-Za-z0-9]){alias_pattern}(?![A-Za-z0-9])"
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
    normalized_profile = re.sub(r"(?<=\w)-\s*\n\s*(?=\w)", "", profile_text)
    evidence_chunks = _evidence_chunks(normalized_profile)

    # Prefer evidence from explicit skills/experience sections, while still
    # scanning every extracted document line.
    evidence_chunks.sort(
        key=lambda evidence: (
            0 if re.match(
                r"(?i)(skills|technical skills|core skills|experience|projects):",
                evidence,
            ) else 1,
            len(evidence),
        )
    )
    for evidence in evidence_chunks:
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
            aliases = [
                canonical_name,
                *[str(alias) for alias in aliases],
            ]
            if any(_contains_alias(evidence, alias) for alias in aliases):
                extracted.append({
                    "raw_skill": canonical_name,
                    "evidence": evidence,
                })
                seen.add(skill_id)
    return extracted
