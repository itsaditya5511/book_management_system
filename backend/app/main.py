"""FastAPI Application Entry Point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import connect_to_database, close_database_connection
from app.routes.auth import router as auth_router
from app.routes.books import router as books_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown events."""
    await connect_to_database()
    yield
    await close_database_connection()


app = FastAPI(
    title="Book Management System API",
    description="A full-stack book management system with JWT authentication, async MongoDB operations, and CRUD functionality.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(books_router)


@app.get("/", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "message": "Book Management System API is running",
        "version": "1.0.0",
    }
