
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import (
    get_connection,
    release_connection,
    get_database_type,
    initialize_database
)

from app.routes.auth_routes import router as auth_router
from app.routes.hr_routes import router as hr_router
from app.routes.document_routes import router as document_router
from app.routes.hr_job_routes import router as hr_job_router
from app.routes.skills_routes import router as skills_router
from app.routes.matching_routes import router as matching_router
from app.routes.bias_audit_routes import router as bias_audit_router
from app.routes.market_routes import router as market_router
from app.routes.learning_routes import router as learning_router


# ==================================================
# APPLICATION LIFESPAN
# ==================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    # Initialize the selected database connection
    initialize_database()

    print(
        f"Application started using "
        f"{get_database_type().upper()} database"
    )

    yield

    print("Application shutting down")


# ==================================================
# FASTAPI APPLICATION
# ==================================================

app = FastAPI(
    title="Inclusive Talent Navigator API",
    description="SAP Hackfest 2026 - Round 2 Prototype Backend",
    version="1.0.0",
    lifespan=lifespan
)


# ==================================================
# CORS CONFIGURATION
# ==================================================

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


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    schemas = openapi_schema.get("components", {}).get("schemas", {})

    for schema in schemas.values():
        properties = schema.get("properties", {})
        files_property = properties.get("files")

        if files_property and files_property.get("type") == "array":
            items = files_property.get("items", {})

            if items.get("contentMediaType"):
                items.pop("contentMediaType")
                items["format"] = "binary"

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi    

# ==================================================
# ROUTER REGISTRATION
# ==================================================

app.include_router(auth_router)

app.include_router(hr_router)
app.include_router(hr_job_router)

app.include_router(document_router)

app.include_router(skills_router)

app.include_router(matching_router)

app.include_router(bias_audit_router)
app.include_router(market_router)
app.include_router(learning_router)


# ==================================================
# HEALTH CHECK
# ==================================================

@app.get("/", tags=["Health Check"])
def greet():
    return {
        "message": "Inclusive Talent Navigator API is running"
    }


@app.get("/api/health", tags=["Health Check"])
def health():
    return {
        "status": "healthy",
        "service": "FastAPI",
        "database_type": get_database_type()
    }


# ==================================================
# DATABASE HEALTH CHECK
# ==================================================

@app.get("/api/health/database", tags=["Health Check"])
def database_health():

    connection = None
    cursor = None

    db_type = get_database_type()

    try:
        connection = get_connection()
        cursor = connection.cursor()

        # Database-specific health query
        if db_type == "mysql":

            cursor.execute(
                """
                SELECT
                    CURRENT_USER(),
                    DATABASE()
                """
            )

            result = cursor.fetchone()

            return {
                "status": "connected",
                "database": "MySQL",
                "user": result[0],
                "schema": result[1]
            }

        elif db_type == "hana":

            cursor.execute(
                """
                SELECT
                    CURRENT_USER,
                    CURRENT_SCHEMA
                FROM DUMMY
                """
            )

            result = cursor.fetchone()

            return {
                "status": "connected",
                "database": "SAP HANA Cloud",
                "user": result[0],
                "schema": result[1]
            }

        else:
            raise HTTPException(
                status_code=500,
                detail=f"Unsupported database type: {db_type}"
            )

    except HTTPException:
        raise

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
