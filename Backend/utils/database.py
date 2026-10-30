import os
from dotenv import load_dotenv
from hdbcli import dbapi

load_dotenv()

def get_connection():
    return dbapi.connect(
        address=os.getenv("HANA_HOST"),
        port=int(os.getenv("HANA_PORT", "443")),
        user=os.getenv("HANA_USER"),
        password=os.getenv("HANA_PASSWORD"),
        encrypt=True,
        sslValidateCertificate=True
    )