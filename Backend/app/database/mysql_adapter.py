
import os

from app.database.base_adapter import ConnectionAdapter


class MySQLAdapter:

    def connect(self):
        import mysql.connector

        connection = mysql.connector.connect(
            host=os.getenv("MYSQL_HOST", "localhost"),
            port=int(os.getenv("MYSQL_PORT", "3306")),
            user=os.getenv("MYSQL_USER"),
            password=os.getenv("MYSQL_PASSWORD"),
            database=os.getenv("MYSQL_DATABASE"),
            autocommit=False,
            connection_timeout=10
        )

        return ConnectionAdapter(
            connection,
            "%s"
        )
