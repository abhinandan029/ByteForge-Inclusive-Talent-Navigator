
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from utils.database import (
    get_connection,
    release_connection,
    initialize_pool,
    close_pool
)

from app.routes.skills_routes import router as skills_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_pool()

    yield

    close_pool()


app = FastAPI(
    title="Inclusive Talent Navigator API",
    description="SAP Hackfest 2026 - Round 2 Prototype Backend",
    version="1.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(skills_router)


@app.get("/", tags=["Health Check"])
def greet():
    return {
        "message": "Inclusive Talent Navigator API is running"
    }


@app.get("/api/health", tags=["Health Check"])
def health():
    return {
        "status": "healthy",
        "service": "FastAPI"
    }


@app.get("/api/health/database", tags=["Health Check"])
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
            release_connection(connection)
