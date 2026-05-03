# Student Management System API

Base backend foundation for a Student Management System using FastAPI, PostgreSQL, SQLAlchemy 2.x, Alembic, and python-dotenv.

---

## 👥 Team Task Distribution

| Member | Role / Responsibilities | Status |
| :--- | :--- | :--- |
| **Mohamed** | Backend Core (Setup, Models, Migrations) | ✅ Completed |
| **Nadia** | Authentication & Authorization (JWT, RBAC) | ✅ Completed |
| **Haidy** | Student APIs (CRUD, Advanced Filtering, Stats) | ✅ Completed |
| **Salah** | Caching (Redis), Logging, System Monitoring | ✅ Completed |
| **Khairy** | DevOps (Docker), Testing, Seed Scripts | ✅ Completed |

---

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

---

## 🏗️ Phase-wise Implementation (Completed Scopes)

### 1. Mohamed (Backend Core Lead) ✅
**Tasks:**
- Setup FastAPI project & Clean Architecture.
- Design DB Schema (User, Student).
- Setup Alembic Migrations.
- **Files:** `app/main.py`, `app/models/`, `app/db/`.

### 2. Nadia (Authentication) ✅
**Tasks:**
- JWT Token implementation.
- Role-based authorization.
- **Files:** `app/routes/auth.py`, `app/schemas/auth.py`.

### 3. Haidy (Student APIs) ✅
**Tasks:**
- Full CRUD operations.
- Advanced filtering and statistics.
- **Files:** `app/routes/students.py`, `app/schemas/student.py`.

### 4. Salah (Caching & Monitoring) ✅
**Tasks:**
- Redis integration for performance.
- Structured JSON logging.
- Monitoring Dashboard.
- **Files:** `app/cache/`, `app/monitoring/`, `app/utils/logger.py`.

### 5. Khairy (DevOps & Testing) ✅
**Tasks:**
- Docker & Docker Compose setup.
- Database Seeding scripts.
- **Files:** `Dockerfile`, `docker-compose.yml`, `scripts/`.

---

## 🚀 How To Run The Project

### 1. Using Docker (Recommended)
```powershell
docker compose up -d --build
```

### 2. Local Setup
1. **Install dependencies:** `pip install -r requirements.txt`
2. **Setup Env:** Copy `.env.example` to `.env` and adjust values.
3. **Run Migrations:** `alembic upgrade head`
4. **Seed Data:** `py scripts/seed_db.py`
5. **Start Server:** `uvicorn app.main:app --reload`

---

## 🔗 Access Links
- **Interactive Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Monitoring Dashboard:** [http://127.0.0.1:8000/monitoring/dashboard](http://127.0.0.1:8000/monitoring/dashboard)
- **Metrics JSON:** [http://127.0.0.1:8000/monitoring/metrics](http://127.0.0.1:8000/monitoring/metrics)

---

## 📜 License
This project is for educational use.
