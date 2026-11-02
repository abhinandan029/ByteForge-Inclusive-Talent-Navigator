from app.database.connection import get_connection, release_connection


def get_skill_taxonomy() -> list[dict]:
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            """
            SELECT SKILL_ID, CANONICAL_NAME, CATEGORY
            FROM SKILL_TAXONOMY
            WHERE IS_ACTIVE = 1
            ORDER BY SKILL_ID
            """
        )
        columns = [column[0].lower() for column in cursor.description]
        rows = [dict(zip(columns, row)) for row in cursor.fetchall()]

        for row in rows:
            cursor.execute(
                """
                SELECT ALIAS
                FROM SKILL_TAXONOMY_ALIASES
                WHERE SKILL_ID = ?
                ORDER BY ALIAS
                """,
                (row["skill_id"],),
            )
            row["aliases"] = [alias[0] for alias in cursor.fetchall()]

        return rows
    finally:
        cursor.close()
        release_connection(connection)
