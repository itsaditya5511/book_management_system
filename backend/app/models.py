"""Pydantic models for request/response validation."""

from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum


# ─── Enums ────────────────────────────────────────────────────────────────────

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"


class BookCategory(str, Enum):
    FICTION = "Fiction"
    NON_FICTION = "Non-Fiction"
    SCIENCE = "Science"
    TECHNOLOGY = "Technology"
    HISTORY = "History"
    BIOGRAPHY = "Biography"
    SELF_HELP = "Self-Help"
    MYSTERY = "Mystery"
    ROMANCE = "Romance"
    FANTASY = "Fantasy"
    HORROR = "Horror"
    POETRY = "Poetry"
    EDUCATION = "Education"
    OTHER = "Other"


# ─── User Models ──────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    """User registration request model."""
    name: str = Field(..., min_length=2, max_length=100, description="Full name")
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=8, max_length=128, description="Password (min 8 chars)")
    role: UserRole = Field(default=UserRole.USER, description="User role")

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserLogin(BaseModel):
    """User login request model."""
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., description="Password")


class UserResponse(BaseModel):
    """User response model (excludes password)."""
    id: str = Field(..., alias="_id")
    name: str
    email: str
    role: UserRole
    created_at: datetime

    class Config:
        populate_by_name = True


class TokenResponse(BaseModel):
    """JWT token response model."""
    access_token: str
    token_type: str = "bearer"
    user: dict


# ─── Book Models ──────────────────────────────────────────────────────────────

class BookCreate(BaseModel):
    """Book creation request model."""
    title: str = Field(..., min_length=1, max_length=300, description="Book title")
    author: str = Field(..., min_length=1, max_length=200, description="Author name")
    isbn: str = Field(..., min_length=10, max_length=17, description="ISBN number")
    category: BookCategory = Field(..., description="Book category")
    price: float = Field(..., gt=0, description="Book price")
    published_date: str = Field(..., description="Publication date (YYYY-MM-DD)")
    description: Optional[str] = Field(None, max_length=2000, description="Book description")
    cover_image: Optional[str] = Field(None, description="Cover image URL")
    stock: int = Field(..., ge=0, description="Stock quantity")

    @field_validator("isbn")
    @classmethod
    def validate_isbn(cls, v):
        cleaned = v.replace("-", "").replace(" ", "")
        if len(cleaned) not in (10, 13):
            raise ValueError("ISBN must be 10 or 13 digits (excluding hyphens)")
        return v


class BookUpdate(BaseModel):
    """Book update request model (all fields optional)."""
    title: Optional[str] = Field(None, min_length=1, max_length=300)
    author: Optional[str] = Field(None, min_length=1, max_length=200)
    isbn: Optional[str] = Field(None, min_length=10, max_length=17)
    category: Optional[BookCategory] = None
    price: Optional[float] = Field(None, gt=0)
    published_date: Optional[str] = None
    description: Optional[str] = Field(None, max_length=2000)
    cover_image: Optional[str] = None
    stock: Optional[int] = Field(None, ge=0)


class BookResponse(BaseModel):
    """Book response model."""
    id: str = Field(..., alias="_id")
    title: str
    author: str
    isbn: str
    category: str
    price: float
    published_date: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    stock: int
    created_by: str
    created_at: datetime

    class Config:
        populate_by_name = True


class PaginatedBooksResponse(BaseModel):
    """Paginated books list response."""
    books: list[dict]
    total: int
    page: int
    limit: int
    total_pages: int
