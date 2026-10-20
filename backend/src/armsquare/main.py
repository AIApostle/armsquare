from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from armsquare.agents.router import router as agents_router
from armsquare.core.config import get_settings
from armsquare.identity.router import router as identity_router

settings = get_settings()

app = FastAPI(
    title="armsquare API",
    version="1.0.0",
    description="Secure API for armsquare marketplace accounts and agent workflows.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-Request-ID"],
)
app.include_router(identity_router)
app.include_router(agents_router)


@app.get("/health", tags=["operations"])
async def health() -> dict[str, str]:
    return {"status": "ok"}
