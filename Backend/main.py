from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.skills_routes import router as skills_router

app = FastAPI(
    title="Inclusive Talent Navigator API",
    description="SAP Hackfest 2026 - Round 2 Prototype Backend",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(skills_router)

@app.get("/", tags=["Health Check"])
async def root():
    return {
        "service": "Inclusive Talent Navigator Backend",
        "mode": "Simulated Data | Local Fallback Ready",
        "docs_url": "/docs"
    }