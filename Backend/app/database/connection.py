
import os

from dotenv import load_dotenv

from app.database.mysql_adapter import MySQLAdapter
from app.database.hana_adapter import HANAAdapter

load_dotenv()

DB_TYPE = os.getenv("DB_TYPE", "hana").strip().lower()

if DB_TYPE == "mysql":
    database_adapter = MySQLAdapter()

elif DB_TYPE == "hana":
    database_adapter = HANAAdapter()

else:
    raise ValueError(
        f"Unsupported DB_TYPE: {DB_TYPE}. "
        "Choose 'mysql' or 'hana'."
    )


def get_connection():
    """Connect using the selected database adapter."""
    return database_adapter.connect()


def release_connection(connection):
    """Close the active database connection."""
    if connection is not None:
        connection.close()


def get_database_type():
    return DB_TYPE


def initialize_database():
    """Verify that the selected database is reachable."""

    connection = None

    try:
        connection = get_connection()

        print(
            f"Successfully connected to "
            f"{DB_TYPE.upper()} database."
        )

    except Exception as exc:
        raise RuntimeError(
            f"Failed to connect to {DB_TYPE.upper()}: {exc}"
        ) from exc

    finally:
        if connection is not None:
            release_connection(connection)