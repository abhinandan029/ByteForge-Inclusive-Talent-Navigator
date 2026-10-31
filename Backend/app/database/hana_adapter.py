
import os

from app.database.base_adapter import ConnectionAdapter


class HANAAdapter:

    def connect(self):
        from hdbcli import dbapi

        connection = dbapi.connect(
            address=os.getenv("HANA_HOST"),
            port=int(os.getenv("HANA_PORT", "443")),
            user=os.getenv("HANA_USER"),
            password=os.getenv("HANA_PASSWORD"),
            encrypt=True,
            sslValidateCertificate=True
        )

        return ConnectionAdapter(
            connection,
            "?"
        )
