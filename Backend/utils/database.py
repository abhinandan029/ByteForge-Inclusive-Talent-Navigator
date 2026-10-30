import os
import certifi
from hdbcli import dbapi
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    return dbapi.connect(
        address=os.getenv("HANA_HOST"),
        port=int(os.getenv("HANA_PORT", 443)),
        user=os.getenv("HANA_USER"),
        password=os.getenv("HANA_PASSWORD"),
        encrypt='true',
        sslValidateCertificate='true',
        sslTrustStore=certifi.where()  # Supplies valid root CA certificates
    )