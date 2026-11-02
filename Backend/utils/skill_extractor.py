import re
from typing import Any


def _split_sentences(text: str) -> list[str]:
    return [
        sentence.strip()
        for sentence in re.split(r"(?<=[.!?])\s+", text)
        if sentence.strip()
    ]


def _contains_alias(sentence: str, alias: str) -> bool:
    pattern = rf"(?<!\w){re.escape(alias)}(?!\w)"
    return bool(re.search(pattern, sentence, re.IGNORECASE))


def _has_first_person_evidence(sentence: str) -> bool:
    action_pattern = (
        r"\bI\b.{0,160}\b"
        r"(?:used|use|worked|work|developed|develop|built|build|"
        r"implemented|implement|designed|design|configured|configure|"
        r"tested|test|maintained|maintain|created|create|completed|"
        r"complete|earned|obtained|managed|manage|deployed|deploy|"
        r"optimized|optimised|specialized|specialised|trained|learned|"
        r"learnt|studied|programmed|automated|integrated|debugged|"
        r"analyzed|analysed|migrated|administered|supported|"
        r"leveraged|certified)\b"
    )
    experience_pattern = (
        r"\bI\b.{0,160}\b(?:have|had)\b.{0,80}\b"
        r"(?:experience|expertise|proficiency|hands-on knowledge)\b"
    )
    personal_context_pattern = (
        r"\bmy\b.{0,100}\b"
        r"(?:experience|expertise|responsibilities|training|certification)\b"
    )
    return any(
        re.search(pattern, sentence, re.IGNORECASE)
        for pattern in (
            action_pattern,
            experience_pattern,
            personal_context_pattern,
        )
    )


def extract_skills(
    profile_text: str,
    taxonomy_rows: list[dict[str, Any]],
) -> list[dict[str, str]]:
    """Extract skills deterministically from database taxonomy rows."""
    if not profile_text or not profile_text.strip():
        raise ValueError("Profile text cannot be empty.")

    extracted = []
    seen = set()
    for sentence in _split_sentences(profile_text):
        if not _has_first_person_evidence(sentence):
            continue
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
            if any(_contains_alias(sentence, str(alias)) for alias in aliases):
                extracted.append({
                    "raw_skill": canonical_name,
                    "evidence": sentence,
                })
                seen.add(skill_id)
    return extracted
