# Student Management System API

A full-stack Student Management System featuring a **FastAPI** backend with **PostgreSQL**, **Redis**, **JWT authentication**, and a **Next.js** frontend with i18n support.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [How To Run The Project](#how-to-run-the-project)
  - [Option 1: Running with Docker (Recommended)](#option-1-running-with-docker-recommended)
  - [Option 2: Manual Setup (Development)](#option-2-manual-setup-development)
- [Accessing the Application](#accessing-the-application)
- [Running Tests](#running-tests)
- [Alembic Migrations](#alembic-migrations)
- [Environment Variables Reference](#environment-variables-reference)
- [Team Contributions](#team-contributions)
- [License](#license)

---

## Tech Stack

| Layer        | Technology                                          |
| ------------ | --------------------------------------------------- |
| **Backend**  | Python 3.12, FastAPI, SQLAlchemy 2.x, Alembic       |
| **Database** | PostgreSQL 16                                       |
| **Cache**    | Redis 7                                             |
| **Auth**     | JWT (python-jose), bcrypt                           |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4    |
| **i18n**     | next-intl (English & Arabic)                        |
| **DevOps**   | Docker, Docker Compose                              |

---

## Project Structure

```text
student-management-api/
├── backend/                      # FastAPI backend
│   ├── app/                      # Application code
│   │   ├── main.py               # Application entry point
│   │   ├── core/config.py        # Settings & environment config
│   │   ├── db/                   # Database session, base, init
│   │   ├── models/               # SQLAlchemy models (User, Student)
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── routes/               # API endpoints (auth, users, students)
│   │   ├── cache/                # Redis client & cache manager
│   │   ├── middlewares/          # Logging middleware
│   │   ├── monitoring/               # Metrics & dashboard
│   │   └── utils/                    # Logger utilities
│   ├── alembic/                  # Database migrations
│   ├── scripts/                  # Seed data & test scripts
│   ├── tests/                        # Pytest test suite
│   ├── Dockerfile                # Backend Docker image
│   ├── requirements.txt              # Python dependencies
│   ├── .env.example                  # Environment variable template
│   └── alembic.ini               # Alembic configuration
├── frontend/                     # Next.js frontend application
├── docs/                         # Project documentation & API spec
├── docker-compose.yml            # Full-stack Docker orchestration
└── README.md
```

---

## Prerequisites

Make sure you have the following installed on your machine:

- **Git**
- **Docker** and **Docker Compose**
- **Node.js 18+** and **npm** (for the frontend)

---

## How To Run The Project

You can choose to run the entire project using **Docker Compose** or set up each layer **manually** for development.

### Option 1: Running with Docker (Recommended)

Docker Compose will start **PostgreSQL**, **Redis**, and the **FastAPI server** all together.

**1. Clone the repository:**

```bash
git clone https://github.com/Mohamediibra7im/student-management-api.git
cd student-management-api
```

**2. Start all services:**

```bash
docker compose up --build
```

> This will automatically:
> - Start PostgreSQL on port `5432`
> - Start Redis on port `6379`
> - Run database migrations
> - Start the API server on port `8000`

---

### Option 2: Manual Setup (Development)

If you prefer to run the services without Docker, follow these steps:

#### 1. Backend Setup

**Prerequisites:** Python 3.12, PostgreSQL, and Redis installed and running.

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
2. **Create and activate a virtual environment:**
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Mac/Linux:
   source .venv/bin/activate
   ```
3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the `DATABASE_URL` and `REDIS_URL` in `.env` to match your local setup.
5. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```
6. **Start the FastAPI server:**
   ```bash
   uvicorn app.main:app --reload
   ```

#### 2. Frontend Setup

The frontend is a **Next.js** application.

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`.

> **Note:** The frontend expects the backend API to be running on `http://localhost:8000`. Make sure the backend is started before using the frontend.

---

## Default Credentials

Once the project is running and the database is seeded, you can use the following credentials to log in:

| Role    | Email                  | Password      |
| ------- | ---------------------- | ------------- |
| Admin   | `admin@example.com`    | `admin123`    |
| Student | `student@example.com`  | `password123` |

> **Note:** If you are running manually and haven't seeded the data yet, run `python scripts/seed_data.py` from the `backend` directory.

---

## Accessing the Application

| Service                  | URL                                                      |
| ------------------------ | -------------------------------------------------------- |
| **API Root**             | http://localhost:8000                                     |
| **Swagger Docs**         | http://localhost:8000/docs                                |
| **ReDoc**                | http://localhost:8000/redoc                               |
| **Monitoring Metrics**   | http://localhost:8000/monitoring/metrics                   |
| **Monitoring Dashboard** | http://localhost:8000/monitoring/dashboard                 |
| **Frontend**             | http://localhost:3000                                     |

---

## Running Tests

```bash
# Navigate to the backend directory
cd backend

# Run all tests
pytest

# Run a specific test file
pytest tests/test_students.py

# Run cache performance test
python scripts/test_cache_performance.py
```

---

## Alembic Migrations

Migrations are managed from the `backend/` directory.

```bash
cd backend

# Apply all pending migrations
alembic upgrade head

# Create a new auto-generated migration
alembic revision --autogenerate -m "describe your changes"

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history
```

---

## Environment Variables Reference

| Variable                      | Description                              | Default / Example                           |
| ----------------------------- | ---------------------------------------- | ------------------------------------------- |
| `DATABASE_URL`                | PostgreSQL connection string             | `postgresql+psycopg://user:pass@host/db`    |
| `REDIS_URL`                   | Redis connection string                  | `redis://localhost:6379/0`                   |
| `SECRET_KEY`                  | JWT signing secret                       | *(generate a strong random string)*         |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time in minutes         | `30`                                        |
| `JWT_ALGORITHM`               | JWT signing algorithm                    | `HS256`                                     |
| `BACK_END_ALLOWED_ORIGINS`    | CORS allowed origins                     | `http://localhost:3000`                      |
| `LOG_LEVEL`                   | Logging level                            | `INFO`                                      |
| `CACHE_DEFAULT_TTL_SECONDS`   | Default cache TTL in seconds             | `60`                                        |
| `APP_NAME`                    | Application name shown in docs           | `Student Management API`                    |

---

## Team Contributions

| Member       | Scope                                                            |
| ------------ | ---------------------------------------------------------------- |
| **Mohamed**  | Backend Core — project setup, database design, models, migrations, auth, CRUD endpoints |
| **Salah**    | Caching + Logging + Monitoring — Redis integration, structured logging, monitoring dashboard |

---

## License

This project is for educational use.
