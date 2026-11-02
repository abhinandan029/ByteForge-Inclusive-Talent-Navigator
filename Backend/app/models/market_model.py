import json
import re

from app.database.connection import get_connection, release_connection


def _skill_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", str(value or "").lower()).strip()


def get_market_session_record(employee_id: str) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT NAME, TAXONOMY_CATEGORY, EVIDENCE_SNIPPET
            FROM CONFIRMED_SKILLS_FINAL
            WHERE EMPLOYEE_ID = ?
            ORDER BY NAME
            """,
            (employee_id,),
        )
        columns = [column[0].lower() for column in cursor.description]
        skills = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.execute(
            """
            SELECT SKILL, DEMAND_LEVEL, TREND, OPEN_INTERNAL_ROLES, MARKET_NOTE
            FROM MARKET_DEMAND
            WHERE IS_ACTIVE = 1
            ORDER BY SKILL
            """
        )
        columns = [column[0].lower() for column in cursor.description]
        market_data = [dict(zip(columns, row)) for row in cursor.fetchall()]

        cursor.execute(
            """
            SELECT
                st.CANONICAL_NAME,
                sta.ALIAS
            FROM SKILL_TAXONOMY st
            LEFT JOIN SKILL_TAXONOMY_ALIASES sta
                ON sta.SKILL_ID = st.SKILL_ID
            WHERE st.IS_ACTIVE = 1
            """
        )
        taxonomy_aliases = {}
        for canonical_name, alias in cursor.fetchall():
            canonical = str(canonical_name or "").strip()
            if not canonical:
                continue
            taxonomy_aliases.setdefault(canonical, set()).update(
                value for value in (canonical, alias) if value
            )

        cursor.execute(
            """
            SELECT
                jrs.SKILL_NAME,
                jr.TITLE,
                jr.JOB_ROLE_ID
            FROM JOB_REQUIRED_SKILLS jrs
            INNER JOIN JOB_ROLES jr
                ON jr.JOB_ROLE_ID = jrs.JOB_ROLE_ID
               AND jr.STATUS = 'active'
            ORDER BY jrs.SKILL_NAME, jr.TITLE
            """
        )
        live_demand = {}
        for skill_name, title, role_id in cursor.fetchall():
            raw_name = str(skill_name or "").strip()
            if not raw_name:
                continue
            matching_canonical = next(
                (
                    canonical
                    for canonical, aliases in taxonomy_aliases.items()
                    if _skill_key(raw_name)
                    in {_skill_key(alias) for alias in aliases}
                ),
                raw_name,
            )
            item = live_demand.setdefault(
                matching_canonical,
                {"roles": set(), "role_titles": set()},
            )
            item["roles"].add(str(role_id))
            if title:
                item["role_titles"].add(str(title))

        for canonical, demand in live_demand.items():
            role_count = len(demand["roles"])
            if role_count >= 3:
                demand_level = "High"
            elif role_count == 2:
                demand_level = "Growing"
            else:
                demand_level = "Emerging"
            market_data.append({
                "skill": canonical,
                "demand_level": demand_level,
                "trend": "Live internal demand",
                "open_internal_roles": role_count,
                "market_note": (
                    f"Required by {role_count} active internal role"
                    f"{'s' if role_count != 1 else ''}: "
                    f"{', '.join(sorted(demand['role_titles']))}."
                ),
                "aliases": list(taxonomy_aliases.get(canonical, {canonical})),
                "source": "ACTIVE_INTERNAL_ROLES",
                "role_titles": sorted(demand["role_titles"]),
            })

        # Live role demand must win over the simulated entry for the same skill.
        live_keys = {_skill_key(skill) for skill in live_demand}
        market_data = [
            item for item in market_data
            if item.get("source") == "ACTIVE_INTERNAL_ROLES"
            or _skill_key(item.get("skill")) not in live_keys
        ]
        return {
            "confirmed_skills": skills,
            "market_data": market_data,
        }
    finally:
        cursor.close()
        release_connection(conn)


def record_market_audit(employee_id: str, result: dict) -> None:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO AUDIT_LOGS
                (EMPLOYEE_ID, ACTOR, ACTION, TOOL, DETAILS)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                employee_id,
                "Market Intelligence Agent",
                "analyze_market_demand",
                "Market Intelligence MCP",
                json.dumps({
                    "matched_skills": len(result["in_demand_skills"]),
                    "high_demand_count": result["high_demand_count"],
                }),
            ),
        )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        release_connection(conn)
