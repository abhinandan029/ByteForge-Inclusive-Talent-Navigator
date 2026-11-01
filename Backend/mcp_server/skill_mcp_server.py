import json
import sys
from pathlib import Path
from typing import List, Dict, Any

BACKEND_ROOT = Path(__file__).resolve().parents[1]

if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from mcp.server.fastmcp import FastMCP
from utils.llm_provider import call_llm_extract, SKILLS_TAXONOMY


# Initialize the MCP server scoped strictly to the skills domain
mcp = FastMCP("skills-server")


@mcp.tool()
def extract_skills(text: str) -> str:
    """
    Version: v1.1

    Extracts employee-attributable skills and supporting evidence
    using the LLM extraction logic.

    Read-only tool.
    """

    if not text or not text.strip():
        raise ValueError("Profile text cannot be empty.")

    extraction_result = call_llm_extract(text)

    extracted_items = extraction_result.get("skills", [])

    if not isinstance(extracted_items, list):
        raise ValueError("Invalid skill extraction response.")

    return json.dumps({
        "schema_version": "1.1",
        "tool": "extract_skills",
        "mode": extraction_result.get("mode", "UNKNOWN"),
        "is_fallback": extraction_result.get("is_fallback", True),
        "extracted_items": extracted_items
    })


@mcp.tool()
def normalize_skills(raw_skills_json: str) -> str:
    """
    Version: v1.1

    Maps raw skill objects to the standard enterprise skills taxonomy.

    Input:
    [
        {
            "raw_skill": "Python",
            "evidence": "I developed services using Python."
        }
    ]

    Read-only tool.
    """

    try:
        raw_items: List[Dict[str, Any]] = json.loads(raw_skills_json)

    except json.JSONDecodeError:
        raise ValueError("Invalid JSON input for normalize_skills.")

    if not isinstance(raw_items, list):
        raise ValueError("normalize_skills expects a JSON list.")

    normalized_list = []
    seen_ids = set()

    for item in raw_items:

        if not isinstance(item, dict):
            continue

        raw_skill = item.get("raw_skill", "")

        if not isinstance(raw_skill, str):
            continue

        raw_name = raw_skill.strip().lower()

        if not raw_name:
            continue

        evidence = item.get(
            "evidence",
            "Confirmed/Added by employee"
        )

        if not isinstance(evidence, str):
            evidence = "Confirmed/Added by employee"

        matched_code = None

        # Match against canonical names and taxonomy aliases.
        for tax_id, meta in SKILLS_TAXONOMY.items():

            canonical_name = meta["canonical_name"].lower()
            aliases = [
                alias.lower()
                for alias in meta["aliases"]
            ]

            if raw_name == canonical_name or raw_name in aliases:
                matched_code = tax_id
                break

        if matched_code:

            unique_key = f"TAXONOMY_{matched_code}"

            if unique_key in seen_ids:
                continue

            seen_ids.add(unique_key)

            normalized_list.append({
                "skill_id": matched_code,
                "name": SKILLS_TAXONOMY[matched_code]["canonical_name"],
                "taxonomy_category": SKILLS_TAXONOMY[matched_code]["category"],
                "evidence_snippet": evidence,
                "raw_extracted": raw_skill,
                "taxonomy_mapped": True
            })

        else:

            unique_key = f"CUSTOM_{raw_name}"

            if unique_key in seen_ids:
                continue

            seen_ids.add(unique_key)

            custom_id = (
                f"CUSTOM_{raw_name.upper().replace(' ', '_')}"
            )

            normalized_list.append({
                "skill_id": custom_id,
                "name": raw_skill.strip(),
                "taxonomy_category": "Unmapped / Emerging Skill",
                "evidence_snippet": evidence,
                "raw_extracted": raw_skill,
                "taxonomy_mapped": False
            })

    return json.dumps({
        "schema_version": "1.1",
        "tool": "normalize_skills",
        "normalized_skills": normalized_list
    })


if __name__ == "__main__":
    # Runs locally using stdio transport.
    mcp.run(transport="stdio")