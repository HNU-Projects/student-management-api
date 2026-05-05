# Student Management System API

Base backend foundation for a Student Management System using FastAPI, PostgreSQL, SQLAlchemy 2.x, Alembic, and python-dotenv.

This repository currently contains the completed scopes for:

- Mohamed (Backend Core)
- Salah (Caching + Logging + Monitoring)

## Project Details Alignment

### Project Goal (from Project Details)

Build a backend system to manage university students with secure access control and advanced querying.

### Entities (required)

- Users
- Students

### Target Features (project-level roadmap)

- User registration and authentication
- Full CRUD operations for students
- Advanced filtering (department, GPA)
- Pagination support
- Students can only access their own profile
- Audit logging for updates

### Roles (required)

- Admin: full control over student records
- Student: view and partially update own profile

The features and role-based behavior above are project requirements and will be implemented in upcoming phases.

## Phase 1 Owner Scope

Owner: Mohamed (Backend Core Lead)

This phase intentionally implements only the first-person scope:

- Setup FastAPI project
- Design project structure
- Setup PostgreSQL connection
- Create models and database schema
- Setup migrations

Expected output for this phase:

- Clean backend structure
- Database running and connected
- Models ready for use

## Backend Core (Lead) Scope

Files covered in this phase:

- `app/main.py`
- `app/core/config.py`
- `app/db/session.py`
- `app/db/base.py`
- `app/db/init_db.py`
- `app/models/user.py`
- `app/models/student.py`
- `scripts/seed_data.py`

Tasks completed in this phase:

- Setup FastAPI project
- Design project structure
- Setup PostgreSQL connection
- Create models and database schema
- Setup migrations

Expected phase output status:

- Clean backend structure: done
- Database running and connected: done
- Models ready for use: done

## Salah Owner Scope

Owner: Salah (Caching + Logging + Monitoring)

Files covered in this phase:

- `app/cache/redis_client.py`
- `app/cache/cache_manager.py`
- `app/utils/logger.py`
- `app/middlewares/logging_middleware.py`
- `app/monitoring/metrics.py`
- `app/monitoring/dashboard.py`

Tasks completed in this phase:

- Redis integration
- Cache module with invalidation helpers
- Structured logging setup
- Request/response and error tracking middleware
- Monitoring dashboard and metrics endpoints

Expected phase output status:

- Faster API performance (cache-ready): done
- Logs stored and readable: done
- Monitoring dashboard working: done

## Out Of Scope For Current Completed Scopes

The following general requirements are not part of this phase and are planned for later team phases:

- Full REST CRUD endpoints
- JWT authentication and token validation
- Role-based authorization rules
- Full API test suite
- Docker integration

## Current Scope

- FastAPI app initialization
- Root endpoint (`GET /`)
- PostgreSQL database connection using `DATABASE_URL` from `.env`
- SQLAlchemy 2.x session and declarative base
- `User` and `Student` models
- Alembic migration setup with initial migration
- Redis integration for caching
- Cache manager with key/prefix invalidation support
- Structured JSON logging
- Request/response and error tracking middleware
- Monitoring metrics endpoint and dashboard

## Tech Stack

- Python (latest)
- FastAPI
- PostgreSQL
- SQLAlchemy 2.x
- Alembic
- python-dotenv

## Project Structure

```text
app/
  main.py
  core/
    config.py
  db/
    base.py
    session.py
    init_db.py
  models/
    user.py
    student.py

  cache/
    redis_client.py
    cache_manager.py

  middlewares/
    logging_middleware.py

  monitoring/
    metrics.py
    dashboard.py

  utils/
    logger.py

scripts/
  seed_data.py

alembic/
  env.py
  script.py.mako
  versions/
    20260427_0001_create_user_and_student_tables.py

alembic.ini
requirements.txt
.env.example
```

### 2. Local Setup
1. **Create Virtual Environment:**
   ```powershell
   python -m venv .venv
   ```
2. **Activate Virtual Environment:**
   - **Windows:**
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   - **Linux/macOS:**
     ```bash
     source .venv/bin/activate
     ```
3. **Install Dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```
4. **Setup Env:** Copy `.env.example` to `.env` and adjust values.
5. **Run Migrations:** `alembic upgrade head`
6. **Seed Data:** `python scripts/seed_db.py`
7. **Start Server:**
   ```powershell
   uvicorn app.main:app --reload
   ```

Copy `.env.example` to `.env` and adjust the values according to your local setup.

```env
# PostgreSQL connection string
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/student_management

# Redis cache
REDIS_URL=redis://localhost:6379/0

# Logging and cache settings
LOG_LEVEL=INFO
CACHE_DEFAULT_TTL_SECONDS=60

# App metadata
APP_NAME=Student Management API

# Optional seed variables (used by scripts/seed_data.py)
SEED_USER_EMAIL=student@example.com
SEED_USER_PASSWORD=change_me
SEED_USER_ROLE=student
SEED_STUDENT_NAME=Sample Student
SEED_STUDENT_GPA=3.5
SEED_STUDENT_DEPARTMENT=Computer Science
```

> **Note**: If you use `postgresql://...`, the application automatically normalizes it to `postgresql+psycopg://...`.

## How To Run The Project

### 1. Prerequisites
Ensure you have the following installed:
- **Python 3.10+**
- **PostgreSQL** (running and database created)
- **Redis** (running)

### 2. Installation & Setup

1. **Clone the repository and enter the directory.**
2. **Create and activate a virtual environment:**

   **Windows (PowerShell):**
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
   **macOS/Linux:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   copy .env.example .env  # Windows
   cp .env.example .env    # macOS/Linux
   ```
   *Edit `.env` to match your database and redis credentials.*

### 3. Database Migrations
Initialize your database schema:
```bash
alembic upgrade head
```

### 4. Running the Application
Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```

### 5. Accessing the API
- **API Root:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Docs (Swagger):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Metrics Endpoint:** [http://127.0.0.1:8000/monitoring/metrics](http://127.0.0.1:8000/monitoring/metrics)
- **Monitoring Dashboard:** [http://127.0.0.1:8000/monitoring/dashboard](http://127.0.0.1:8000/monitoring/dashboard)

### 6. Seeding Data (Optional)
To populate the database with sample data:
```bash
python scripts/seed_data.py
```

## Alembic Migrations

Run migrations:
```bash
alembic upgrade head
```

Create a new migration:
```bash
alembic revision --autogenerate -m "your message"
```

Rollback one revision:
```bash
alembic downgrade -1
```

## License

This project is for educational use.
