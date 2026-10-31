
import os
from dotenv import load_dotenv

load_dotenv()

DB_TYPE = os.getenv("DB_TYPE", "hana").strip().lower()

if DB_TYPE not in ("mysql", "hana"):
    raise ValueError(
        f"Unsupported DB_TYPE: {DB_TYPE}. Use 'mysql' or 'hana'."
    )


def get_connection():
    """Connect to the database selected through DB_TYPE."""

    if DB_TYPE == "mysql":
        return _get_mysql_connection()

    return _get_hana_connection()


def _get_mysql_connection():
    import mysql.connector

    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        port=int(os.getenv("MYSQL_PORT", "3306")),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        database=os.getenv("MYSQL_DATABASE"),
        autocommit=False,
        connection_timeout=10
    )


def _get_hana_connection():
    from hdbcli import dbapi

    return dbapi.connect(
        address=os.getenv("HANA_HOST"),
        port=int(os.getenv("HANA_PORT", "443")),
        user=os.getenv("HANA_USER"),
        password=os.getenv("HANA_PASSWORD"),
        encrypt=True,
        sslValidateCertificate=True
    )


def release_connection(connection):
    """Close whichever database connection was opened."""

    if connection is not None:
        connection.close()


def get_database_type():
    """Return the currently selected database type."""
    return DB_TYPE
