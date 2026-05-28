"""Async MongoDB connection using Motor driver."""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import get_settings

settings = get_settings()

# Motor async client
client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None


async def connect_to_database():
    """Create async MongoDB connection."""
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]

    # Create indexes for optimal performance
    await db.users.create_index("email", unique=True)
    await db.books.create_index("isbn", unique=True)
    await db.books.create_index("title")
    await db.books.create_index("category")
    await db.books.create_index("price")
    await db.books.create_index("published_date")

    print(f"✅ Connected to MongoDB: {settings.DATABASE_NAME}")


async def close_database_connection():
    """Close async MongoDB connection."""
    global client
    if client:
        client.close()
        print("❌ MongoDB connection closed.")


def get_database() -> AsyncIOMotorDatabase:
    """Get database instance."""
    return db
