from fastapi import FastAPI, HTTPException
from utils.database import get_connection

app = FastAPI(
    title="Inclusive Talent Navigator API",
    version="1.0.0"
)

@app.get("/")
def greet():
    return {
        "message": "Inclusive Talent Navigator API is running"
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "FastAPI"
    }


@app.get("/api/health/database")
def database_health():
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            "SELECT CURRENT_USER, CURRENT_SCHEMA FROM DUMMY"
        )

        result = cursor.fetchone()

        return {
            "status": "connected",
            "database": "SAP HANA Cloud",
            "user": result[0],
            "schema": result[1]
        }

    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail=f"Database connection failed: {str(error)}"
        )

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()