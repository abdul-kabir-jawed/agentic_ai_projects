"""FastAPI application entry point."""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from src.db.database import create_db_and_tables
from src.api.routers import auth, tasks, chatbot
from src.services.event_service import get_producer, shutdown_event_services

# Load environment variables (override=True to ensure .env takes precedence over system env vars)
load_dotenv(override=True)

# Create rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager.

    Creates database tables on startup (only user_data table).
    Initializes event streaming on startup.
    """
    # Startup: Create database tables (only UserData table)
    # Note: We only create user_data table. Tasks and users tables are managed by:
    # - Better Auth (creates user/session/account tables in neon_auth schema)
    # - Frontend Drizzle (creates tasks table if needed)
    # We don't create old Task/User tables here to avoid conflicts
    create_db_and_tables()

    # Startup: Initialize event streaming (Kafka)
    try:
        producer = await get_producer()
        print("Event streaming service initialized")
    except Exception as e:
        print(f"Event streaming initialization skipped: {e}")

    yield

    # Shutdown: cleanup event services
    try:
        await shutdown_event_services()
        print("Event streaming service shutdown complete")
    except Exception as e:
        print(f"Event streaming shutdown error: {e}")


# Create FastAPI application
app = FastAPI(
    title="Evolution of Todo API",
    description="FastAPI backend for Evolution of Todo - Phase II",
    version="0.2.0",
    lifespan=lifespan,
)

# Attach rate limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda request, exc: JSONResponse(
    status_code=429,
    content={"detail": "Too many requests. Please try again later."},
))

# Configure CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")

# Handle wildcard CORS
if cors_origins.strip() == "*":
    # For wildcard CORS, we need to allow all origins
    allowed_origins = ["*"]
    allow_credentials = False  # Cannot use credentials with wildcard
else:
    allowed_origins = [origin.strip() for origin in cors_origins.split(",")]
    allow_credentials = True

# Add CORS middleware with comprehensive configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],  # Allow all methods including OPTIONS
    allow_headers=["*"],
    expose_headers=["*"],  # Expose all headers to the browser
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Get API prefix from environment
API_PREFIX = os.getenv("API_PREFIX", "/api/v1")

# Include routers
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(tasks.router, prefix=API_PREFIX)

# Include chatbot router with error handling
try:
    app.include_router(chatbot.router, prefix=API_PREFIX)
    print(f"[MAIN] Chatbot router registered with {len(chatbot.router.routes)} routes")
    for route in chatbot.router.routes:
        if hasattr(route, 'path'):
            print(f"[MAIN]   - {list(route.methods)} {route.path}")
except Exception as e:
    print(f"[MAIN] ERROR: Failed to register chatbot router: {e}")
    import traceback
    traceback.print_exc()


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Evolution of Todo API",
        "version": "0.2.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/health/db")
async def health_db():
    """Database health check - verifies Neon connection."""
    from src.db.database import engine, USE_LOCAL_DB
    from sqlmodel import text

    try:
        with engine.connect() as conn:
            # Test query
            result = conn.execute(text("SELECT 1"))
            result.fetchone()

            # Count users and tasks
            user_count = conn.execute(text("SELECT COUNT(*) FROM users")).fetchone()[0]
            task_count = conn.execute(text("SELECT COUNT(*) FROM tasks")).fetchone()[0]

            return {
                "status": "connected",
                "database": "SQLite (local)" if USE_LOCAL_DB else "Neon PostgreSQL",
                "users_count": user_count,
                "tasks_count": task_count,
            }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "database": "SQLite (local)" if USE_LOCAL_DB else "Neon PostgreSQL",
        }


if __name__ == "__main__":
    import uvicorn

    # Get host and port from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))

    uvicorn.run(
        "src.main:app",
        host=host,
        port=port,
        reload=True,  # Enable auto-reload in development
    )
