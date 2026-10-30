# skills_mcp_server.py
import json
from typing import List, Dict, Any
from mcp.server.fastmcp import FastMCP
from utils.llm_provider import call_llm_extract, SKILLS_TAXONOMY

# Initialize the MCP server scoped strictly to the skills domain
mcp = FastMCP("skills-server")

@mcp.tool()
def extract_skills(text: str) -> str:
    """
    Version: v1.0
    Extracts raw skills and supporting evidence snippets from free-text employee profiles.
    Read-only tool.
    """
    if not text or not text.strip():
        raise ValueError("Profile text cannot be empty.")
    
    extraction_result = call_llm_extract(text)
    return json.dumps({
        "schema_version": "1.0",
        "tool": "extract_skills",
        "mode": extraction_result["mode"],
        "is_fallback": extraction_result["is_fallback"],
        "extracted_items": extraction_result["skills"]
    })

@mcp.tool()
def normalize_skills(raw_skills_json: str) -> str:
    """
    Version: v1.0
    Maps a list of raw skill objects [{'raw_skill': str, 'evidence': str}] to the standard 
    enterprise skills taxonomy. Read-only tool.
    """
    try:
        raw_items: List[Dict[str, Any]] = json.loads(raw_skills_json)
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON input for normalize_skills.")

    normalized_list = []
    seen_ids = set()

    for item in raw_items:
        raw_name = item.get("raw_skill", "").strip().lower()
        evidence = item.get("evidence", "Confirmed/Added by employee")
        
        matched_code = None
        for tax_id, meta in SKILLS_TAXONOMY.items():
            if raw_name == meta["canonical_name"].lower() or raw_name in meta["aliases"]:
                matched_code = tax_id
                break
        
        if matched_code and matched_code not in seen_ids:
            seen_ids.add(matched_code)
            normalized_list.append({
                "skill_id": matched_code,
                "skill_name": SKILLS_TAXONOMY[matched_code]["canonical_name"],
                "category": SKILLS_TAXONOMY[matched_code]["category"],
                "raw_extracted": item.get("raw_skill"),
                "evidence": evidence,
                "taxonomy_mapped": True
            })
        elif raw_name and raw_name not in seen_ids:
            # Handle custom skills added by the employee that aren't in the static taxonomy yet
            custom_id = f"CUSTOM_{raw_name.upper().replace(' ', '_')}"
            seen_ids.add(raw_name)
            normalized_list.append({
                "skill_id": custom_id,
                "skill_name": item.get("raw_skill").strip(),
                "category": "Unmapped / Emerging Skill",
                "raw_extracted": item.get("raw_skill"),
                "evidence": evidence,
                "taxonomy_mapped": False
            })

    return json.dumps({
        "schema_version": "1.0",
        "tool": "normalize_skills",
        "normalized_skills": normalized_list
    })

if __name__ == "__main__":
    # Runs locally using stdio transport as specified in Section 6.5
    mcp.run(transport="stdio")