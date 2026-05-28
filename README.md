# Book Management System

A full-stack Book Management System built with **FastAPI** (Python), **Next.js** (TypeScript), **MongoDB**, and **JWT Authentication**.

## 🏗️ Tech Stack

### Backend
- **Python 3.10+** with **FastAPI**
- **MongoDB** with **Motor** (async driver)
- **JWT Authentication** with bcrypt password hashing
- **Pydantic** for request/response validation
- Full **async/await** operations

### Frontend
- **Next.js 15** with App Router
- **TypeScript**
- **Tailwind CSS**
- **Axios** for API calls
- **React Hook Form** + **Zod** for form validation
- **Lucide React** icons
- **React Hot Toast** for notifications

## 📁 Project Structure

```
Book_Management_System/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application entry
│   │   ├── config.py        # Pydantic Settings
│   │   ├── database.py      # Async MongoDB connection
│   │   ├── auth.py          # JWT auth utilities
│   │   ├── models.py        # Pydantic models
│   │   └── routes/
│   │       ├── auth.py      # Auth endpoints
│   │       └── books.py     # Book CRUD endpoints
│   ├── .env
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Auth context
│   │   └── lib/             # API client & types
│   ├── .env.local
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB (running locally or Atlas connection)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```

### Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs (Swagger UI)

## 📋 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Get user profile (protected) |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/books` | Create book (protected) |
| GET | `/api/books` | List books with pagination, search, filter, sort |
| GET | `/api/books/:id` | Get book by ID |
| PUT | `/api/books/:id` | Update book (owner/admin) |
| DELETE | `/api/books/:id` | Delete book (owner/admin) |

### Query Parameters (GET /api/books)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search by title
- `category` - Filter by category
- `sort_by` - Sort field: `price`, `published_date`, `created_at`, `title`
- `sort_order` - Sort direction: `asc`, `desc`

## 🔐 Features

- ✅ JWT Authentication with 1-day expiry
- ✅ bcrypt Password Hashing
- ✅ Role-Based Access Control (Admin/User)
- ✅ Async MongoDB Operations (Motor)
- ✅ Full CRUD for Books
- ✅ Pagination, Search, Filter, Sort
- ✅ Form Validation (Zod + React Hook Form)
- ✅ Responsive Design (Mobile-friendly)
- ✅ Dark Mode Support
- ✅ Toast Notifications
- ✅ Loading & Empty States
- ✅ Sidebar + Navbar Layout
- ✅ Protected Routes

## 📊 Database Schema

### Users Collection
```json
{
  "name": "string",
  "email": "string (unique)",
  "password": "string (bcrypt hashed)",
  "role": "admin | user",
  "created_at": "datetime"
}
```

### Books Collection
```json
{
  "title": "string",
  "author": "string",
  "isbn": "string (unique)",
  "category": "string",
  "price": "number",
  "published_date": "string",
  "description": "string (optional)",
  "cover_image": "string (optional)",
  "stock": "number",
  "created_by": "string (user_id)",
  "created_at": "datetime"
}
```
