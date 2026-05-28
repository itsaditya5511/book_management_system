"""Book CRUD API routes with pagination, search, filter, and sort."""

import math
from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth import get_current_user, get_admin_user
from app.database import get_database
from app.models import BookCreate, BookUpdate, PaginatedBooksResponse

router = APIRouter(prefix="/api/books", tags=["Books"])


def serialize_book(book: dict) -> dict:
    """Convert MongoDB book document to JSON-serializable format."""
    book["_id"] = str(book["_id"])
    if "created_at" in book and isinstance(book["created_at"], datetime):
        book["created_at"] = book["created_at"].isoformat()
    return book


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_book(
    book_data: BookCreate,
    current_user: dict = Depends(get_current_user),
):
    """Create a new book (authenticated users only)."""
    db = get_database()

    # Check for duplicate ISBN
    existing = await db.books.find_one({"isbn": book_data.isbn})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A book with this ISBN already exists",
        )

    book_doc = {
        **book_data.model_dump(),
        "category": book_data.category.value,
        "created_by": current_user["_id"],
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.books.insert_one(book_doc)
    book_doc["_id"] = str(result.inserted_id)
    book_doc["created_at"] = book_doc["created_at"].isoformat()

    return {"message": "Book created successfully", "book": book_doc}


@router.get("")
async def get_books(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by title"),
    category: Optional[str] = Query(None, description="Filter by category"),
    sort_by: Optional[str] = Query("created_at", description="Sort field (price, published_date, created_at, title)"),
    sort_order: Optional[str] = Query("desc", description="Sort order (asc, desc)"),
    current_user: dict = Depends(get_current_user),
):
    """Get paginated list of books with search, filter, and sort."""
    db = get_database()

    # Build filter query
    query = {}
    if search:
        query["title"] = {"$regex": search, "$options": "i"}
    if category:
        query["category"] = category

    # Sort direction
    sort_direction = 1 if sort_order == "asc" else -1
    valid_sort_fields = ["price", "published_date", "created_at", "title"]
    if sort_by not in valid_sort_fields:
        sort_by = "created_at"

    # Get total count
    total = await db.books.count_documents(query)
    total_pages = math.ceil(total / limit) if total > 0 else 1

    # Get paginated results
    skip = (page - 1) * limit
    cursor = db.books.find(query).sort(sort_by, sort_direction).skip(skip).limit(limit)
    books = []
    async for book in cursor:
        books.append(serialize_book(book))

    return {
        "books": books,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
    }


@router.get("/{book_id}")
async def get_book(
    book_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get a single book by ID."""
    db = get_database()

    if not ObjectId.is_valid(book_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid book ID format",
        )

    book = await db.books.find_one({"_id": ObjectId(book_id)})
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )

    return serialize_book(book)


@router.put("/{book_id}")
async def update_book(
    book_id: str,
    book_data: BookUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update a book (owner or admin only)."""
    db = get_database()

    if not ObjectId.is_valid(book_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid book ID format",
        )

    # Check if book exists
    existing_book = await db.books.find_one({"_id": ObjectId(book_id)})
    if not existing_book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )

    # Authorization: only the creator or admin can update
    if (
        existing_book["created_by"] != current_user["_id"]
        and current_user["role"] != "admin"
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own books",
        )

    # Build update document (only non-None fields)
    update_data = {k: v for k, v in book_data.model_dump().items() if v is not None}
    if "category" in update_data and hasattr(update_data["category"], "value"):
        update_data["category"] = update_data["category"].value

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    # Check ISBN uniqueness if being updated
    if "isbn" in update_data:
        isbn_conflict = await db.books.find_one({
            "isbn": update_data["isbn"],
            "_id": {"$ne": ObjectId(book_id)},
        })
        if isbn_conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A book with this ISBN already exists",
            )

    await db.books.update_one({"_id": ObjectId(book_id)}, {"$set": update_data})

    updated_book = await db.books.find_one({"_id": ObjectId(book_id)})
    return {"message": "Book updated successfully", "book": serialize_book(updated_book)}


@router.delete("/{book_id}", status_code=status.HTTP_200_OK)
async def delete_book(
    book_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a book (owner or admin only)."""
    db = get_database()

    if not ObjectId.is_valid(book_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid book ID format",
        )

    book = await db.books.find_one({"_id": ObjectId(book_id)})
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )

    # Authorization: only the creator or admin can delete
    if book["created_by"] != current_user["_id"] and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own books",
        )

    await db.books.delete_one({"_id": ObjectId(book_id)})
    return {"message": "Book deleted successfully"}
